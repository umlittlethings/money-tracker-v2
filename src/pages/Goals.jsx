import { useState } from 'react';
import useStore from '../store/useStore';
import GoalModal from '../components/GoalModal';

const Goals = () => {
  const { goals } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

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
              <p className="text-xs text-gray-400 mb-4">Target: {new Date(goal.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
              
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-400">Rp {currentAmount.toLocaleString('id-ID')}</span>
                <span className="text-gray-400">Rp {goal.target.toLocaleString('id-ID')}</span>
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
