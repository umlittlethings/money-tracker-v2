import { describe, it, expect, beforeEach, vi } from 'vitest';
import useStore from './useStore';

vi.mock('../lib/supabase', () => {
  const chainable = {
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    order: vi.fn().mockResolvedValue({ data: [], error: null })
  };
  
  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockImplementation((arr) => ({
           select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'mock-id', ...arr[0] }, error: null })
           })
        })),
        select: vi.fn().mockReturnValue(chainable),
        delete: vi.fn().mockReturnValue(chainable)
      })
    }
  };
});

describe('useStore Wallet Management', () => {
  beforeEach(() => {
    useStore.setState({
      user: { id: 'test-user' },
      wallets: [{ name: 'Cash', balance: 10000, type: 'daily' }],
      transactions: []
    });
  });

  it('should add a new wallet', async () => {
    await useStore.getState().addWallet('BCA', 50000, 'savings');
    const wallets = useStore.getState().wallets;
    expect(wallets).toHaveLength(2);
    expect(wallets[1]).toEqual({ name: 'BCA', balance: 50000, type: 'savings' });
  });

  it('should toggle wallet type', async () => {
    await useStore.getState().toggleWalletType('Cash');
    let cashWallet = useStore.getState().wallets.find(w => w.name === 'Cash');
    expect(cashWallet.type).toBe('savings');

    await useStore.getState().toggleWalletType('Cash');
    cashWallet = useStore.getState().wallets.find(w => w.name === 'Cash');
    expect(cashWallet.type).toBe('tap-card');

    await useStore.getState().toggleWalletType('Cash');
    cashWallet = useStore.getState().wallets.find(w => w.name === 'Cash');
    expect(cashWallet.type).toBe('daily');
  });

  it('should transfer balance between wallets and create system transaction', async () => {
    useStore.setState({
      wallets: [
        { name: 'Cash', balance: 10000, type: 'daily' },
        { name: 'Mandiri', balance: 0, type: 'savings' }
      ]
    });

    await useStore.getState().transferWalletBalance('Cash', 'Mandiri', 3000);

    const wallets = useStore.getState().wallets;
    expect(wallets.find(w => w.name === 'Cash').balance).toBe(7000);
    expect(wallets.find(w => w.name === 'Mandiri').balance).toBe(3000);

    const txs = useStore.getState().transactions;
    expect(txs).toHaveLength(1);
    expect(txs[0].category).toBe('System');
    expect(txs[0].amount).toBe(3000);
    expect(txs[0].note).toBe('Transfer: Cash ➔ Mandiri');
  });
});

describe('useStore Transactions', () => {
  beforeEach(() => {
    useStore.setState({
      user: { id: 'test-user' },
      wallets: [{ name: 'Cash', balance: 50000, type: 'daily' }],
      transactions: []
    });
  });

  it('should deduct wallet balance when adding an expense', async () => {
    await useStore.getState().addTransaction({
      amount: 15000,
      category: 'Food',
      note: 'Lunch',
      wallet: 'Cash'
    });

    const wallets = useStore.getState().wallets;
    expect(wallets.find(w => w.name === 'Cash').balance).toBe(35000);

    const txs = useStore.getState().transactions;
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(15000);
  });
});
