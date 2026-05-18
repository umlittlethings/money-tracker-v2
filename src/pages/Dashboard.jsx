import { useState } from 'react';
import useStore from '../store/useStore';
import EditExpenseModal from '../components/EditExpenseModal';
import AdjustBalanceModal from '../components/AdjustBalanceModal';
import TransferModal from '../components/TransferModal';
import { ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { formatMoney } from '../utils/format';

const Dashboard = () => {
  const { profile, transactions, settings, toggleHideBalance } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const hideBalance = settings.hideBalance;

  const today = new Date().toISOString().split('T')[0];
  
  // Calculate Cycle Dates
  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const payday = profile.payday || 25;
  
  let cycleStart, cycleEnd;
  if (currentDay >= payday) {
    cycleStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), payday);
    cycleEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, payday - 1, 23, 59, 59);
  } else {
    cycleStart = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, payday);
    cycleEnd = new Date(todayDate.getFullYear(), todayDate.getMonth(), payday - 1, 23, 59, 59);
  }

  // Filter cycle transactions
  const cycleTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= cycleStart && tDate <= cycleEnd && t.category !== 'System';
  });

  // Calculate today's spending
  const todaySpending = cycleTransactions
    .filter(t => t.date.startsWith(today))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate total remaining balance based on DAILY wallets only
  const wallets = useStore(state => state.wallets);
  const dailyWallets = wallets.filter(w => w.type !== 'savings');
  const savingsWallets = wallets.filter(w => w.type === 'savings');
  
  const remainingBalance = dailyWallets.reduce((acc, w) => acc + w.balance, 0);
  const safeDaily = Math.max(0, profile.dailyBudget - todaySpending);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center mt-4">
        <div>
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleHideBalance} 
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {hideBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary font-bold">
            {profile.level === 'Disciplined Saver' ? 'DS' : 'BS'}
          </div>
        </div>
      </header>

      {/* Main Balance Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <p className="text-gray-400 text-sm mb-1 relative z-10">Safe to spend today (From Daily Wallets)</p>
        <h2 className="text-4xl font-extrabold text-primary mb-4 relative z-10">
          Rp {formatMoney(safeDaily, hideBalance)}
        </h2>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400">Total Money Left (Daily)</p>
            </div>
            <p className="text-lg font-semibold">Rp {formatMoney(remainingBalance, hideBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Spent Today</p>
            <p className="text-lg font-semibold text-expense">Rp {formatMoney(todaySpending, hideBalance)}</p>
          </div>
        </div>
      </div>

      {/* Smart Insight */}
      <div className="bg-blue-900/20 border border-info/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="mt-0.5 text-info">💡</div>
        <p className="text-sm text-blue-200">
          {safeDaily > 0 
            ? `You are on track! Keep it under Rp ${safeDaily.toLocaleString('id-ID')} today.`
            : "You've exceeded your daily budget. Try to save tomorrow!"}
        </p>
      </div>

      {/* Wallets Overview */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold">Your Wallets</h3>
          {wallets.length > 1 && (
            <button 
              onClick={() => setIsTransferOpen(true)}
              className="text-info text-xs font-bold hover:text-info/80 transition-colors flex items-center gap-1 bg-info/10 px-2 py-1 rounded-md"
            >
              <ArrowRightLeft size={12} />
              Transfer
            </button>
          )}
        </div>
        
        {dailyWallets.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Daily Needs</p>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {dailyWallets.map(w => (
                <div key={w.name} className="min-w-[140px] bg-card border border-gray-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-info/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                  <p className="text-sm text-gray-400 relative z-10">{w.name}</p>
                  <p className="font-bold text-lg mt-1 text-info relative z-10">Rp {formatMoney(w.balance, hideBalance)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {savingsWallets.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Savings</p>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {savingsWallets.map(w => (
                <div key={w.name} className="min-w-[140px] bg-card border border-gray-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-savings/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                  <p className="text-sm text-gray-400 relative z-10">{w.name}</p>
                  <p className="font-bold text-lg mt-1 text-savings relative z-10">Rp {formatMoney(w.balance, hideBalance)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-bold mb-4">Today's Expenses</h3>
        <div className="space-y-3">
          {cycleTransactions.filter(t => t.date.startsWith(today)).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No expenses yet today.</p>
          ) : (
            cycleTransactions
              .filter(t => t.date.startsWith(today))
              .map(t => (
                <div 
                  key={t.id} 
                  onClick={() => {
                    setSelectedExpense(t);
                    setIsEditOpen(true);
                  }}
                  className="flex justify-between items-center bg-card border rounded-2xl p-4 cursor-pointer hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                      {t.category === 'Food' ? '🍔' : t.category === 'Coffee' ? '☕' : '💸'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{t.category}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 font-medium">
                          {t.wallet || 'Cash'}
                        </span>
                      </div>
                      {t.note && <p className="text-xs text-gray-400 mt-0.5">{t.note}</p>}
                    </div>
                  </div>
                  <p className="font-bold text-expense">-Rp {formatMoney(t.amount, hideBalance)}</p>
                </div>
            ))
          )}
        </div>
      </div>
      
      {/* Edit Expense Modal */}
      <EditExpenseModal 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
        }} 
        transaction={selectedExpense} 
      />

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        currentAppBalance={remainingBalance}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
