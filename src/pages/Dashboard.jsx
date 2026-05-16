import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import useStore from '../store/useStore';
import EditExpenseModal from '../components/EditExpenseModal';
import AdjustBalanceModal from '../components/AdjustBalanceModal';

const Dashboard = () => {
  const { profile, transactions } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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
    return tDate >= cycleStart && tDate <= cycleEnd;
  });

  // Calculate today's spending
  const todaySpending = cycleTransactions
    .filter(t => t.date.startsWith(today))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate remaining monthly balance based ONLY on this cycle's transactions
  const totalSpending = cycleTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = profile.monthlyIncome - profile.savingsTarget - profile.churchTithe - totalSpending;
  const safeDaily = Math.max(0, profile.dailyBudget - todaySpending);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center mt-4">
        <div>
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary font-bold">
          {profile.level === 'Disciplined Saver' ? 'DS' : 'BS'}
        </div>
      </header>

      {/* Main Balance Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <p className="text-gray-400 text-sm mb-1 relative z-10">Safe to spend today</p>
        <h2 className="text-4xl font-extrabold text-primary mb-4 relative z-10">
          Rp {safeDaily.toLocaleString('id-ID')}
        </h2>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400">Monthly Remaining</p>
              <button 
                onClick={() => setIsAdjustOpen(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Pencil size={12} />
              </button>
            </div>
            <p className="text-lg font-semibold">Rp {remainingBalance.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Spent Today</p>
            <p className="text-lg font-semibold text-expense">Rp {todaySpending.toLocaleString('id-ID')}</p>
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
                      <p className="font-semibold">{t.category}</p>
                      {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                    </div>
                  </div>
                  <p className="font-bold text-expense">-Rp {t.amount.toLocaleString('id-ID')}</p>
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
    </div>
  );
};

export default Dashboard;
