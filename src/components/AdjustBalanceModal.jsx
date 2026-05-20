/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, RefreshCcw } from 'lucide-react';
import useStore from '../store/useStore';

const AdjustBalanceModal = ({ isOpen, onClose, currentAppBalance }) => {
  const [actualBalance, setActualBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addTransaction } = useStore();

  useEffect(() => {
    if (isOpen) setActualBalance('');
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualBalance) return;

    const actual = parseInt(actualBalance);
    const adjustmentAmount = currentAppBalance - actual;

    if (adjustmentAmount !== 0) {
      setIsLoading(true);
      await addTransaction({
        amount: adjustmentAmount,
        category: 'Other',
        note: 'Balance Adjustment',
      });
      setIsLoading(false);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RefreshCcw size={20} className="text-info" />
            Adjust Balance
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Enter the exact amount of money you currently have left. MoneyFlow will automatically create an adjustment transaction to sync your app balance.
            </p>

            <label className="block text-sm font-medium text-gray-400 mb-2">Actual Balance (Rp)</label>
            <input
              type="number"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-2xl px-4 py-4 text-2xl font-bold text-center focus:outline-none focus:border-info transition-colors text-info"
              placeholder={currentAppBalance.toString()}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-info hover:bg-info/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Syncing...
              </>
            ) : (
              'Sync Balance'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdjustBalanceModal;
