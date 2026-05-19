import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import useStore from '../store/useStore';

const TransferModal = ({ isOpen, onClose }) => {
  const { wallets, transferWalletBalance } = useStore();
  const [fromWallet, setFromWallet] = useState(wallets[0]?.name || '');
  const [toWallet, setToWallet] = useState(wallets[1]?.name || '');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = async (e) => {
    e.preventDefault();
    const transferAmount = parseInt(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (fromWallet === toWallet) {
      setError('Cannot transfer to the same wallet.');
      return;
    }

    const sourceWallet = wallets.find(w => w.name === fromWallet);
    if (sourceWallet && transferAmount > sourceWallet.balance) {
      setError(`Insufficient balance in ${fromWallet}.`);
      return;
    }

    setIsLoading(true);
    await transferWalletBalance(fromWallet, toWallet, transferAmount);
    setIsLoading(false);
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-info" />
            Transfer Money
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          {error && (
            <div className="bg-expense/10 text-expense p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">From</label>
              <select
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="w-full bg-background border border-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-info transition-colors text-sm"
              >
                {wallets.map(w => (
                  <option key={w.name} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                setFromWallet(toWallet);
                setToWallet(fromWallet);
              }}
              className="mt-5 text-gray-500 hover:text-info p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ArrowRightLeft size={20} />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">To</label>
              <select
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full bg-background border border-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-info transition-colors text-sm"
              >
                {wallets.map(w => (
                  <option key={w.name} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Amount (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-info transition-colors font-medium text-info"
              placeholder="0"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-info hover:bg-info/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Transferring...
              </>
            ) : (
              'Transfer Funds'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
