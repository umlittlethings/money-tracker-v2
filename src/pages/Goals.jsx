import { useState } from 'react';
import useStore from '../store/useStore';
import GoalModal from '../components/GoalModal';
import { formatMoney } from '../utils/format';

const Goals = () => {
  const { goals, settings, profile } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const hideBalance = settings.hideBalance;

  return (
    <div className="p-4 pt-10">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <button 
          onClick={() => {
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
          className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
        >
          + New Goal
        </button>
      </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const linkedWalletObj = goal.linked_wallet ? useStore.getState().wallets.find(w => w.name === goal.linked_wallet) : null;
          const currentAmount = linkedWalletObj ? linkedWalletObj.balance : goal.current;
          const progress = Math.min(100, Math.round((currentAmount / goal.target) * 100));
          
          let projectionText = '';
          const remainingAmount = Math.max(0, goal.target - currentAmount);
          if (remainingAmount > 0 && profile?.savingsTarget > 0) {
            const monthsRemaining = Math.ceil(remainingAmount / profile.savingsTarget);
            projectionText = `Estimated: ${monthsRemaining} month${monthsRemaining > 1 ? 's' : ''} left at Rp ${formatMoney(profile.savingsTarget, hideBalance)}/mo`;
          } else if (remainingAmount === 0) {
            projectionText = 'Goal Reached! 🎉';
          }
          
          return (
            <div 
              key={goal.id} 
              onClick={() => {
                setSelectedGoal(goal);
                setIsModalOpen(true);
              }}
              className="glass-card rounded-2xl p-5 border border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{goal.name}</h3>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400">Target: {new Date(goal.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                {projectionText && (
                  <p className={`text-xs mt-1 ${remainingAmount === 0 ? 'text-primary font-bold' : 'text-info'}`}>
                    {projectionText}
                  </p>
                )}
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-400">Rp {formatMoney(currentAmount, hideBalance)}</span>
                <span className="text-gray-400">Rp {formatMoney(goal.target, hideBalance)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Goal Modal */}
      <GoalModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGoal(null);
        }}
        existingGoal={selectedGoal}
      />
    </div>
  );
};

export default Goals;
