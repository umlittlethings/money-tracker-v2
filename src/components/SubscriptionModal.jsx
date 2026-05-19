/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

const SubscriptionModal = ({ isOpen, onClose, existingSub }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addSubscription, deleteSubscription, wallets } = useStore();

  useEffect(() => {
    if (isOpen) {
      if (existingSub) {
        setName(existingSub.name);
        setAmount(existingSub.amount.toString());
        setWallet(existingSub.wallet);
        setDayOfMonth(existingSub.dayOfMonth);
      } else {
        setName('');
        setAmount('');
        setWallet(wallets[0]?.name || 'Cash');
        setDayOfMonth(1);
      }
      setShowDeleteConfirm(false);
    }
  }, [existingSub, isOpen, wallets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    setIsLoading(true);
    if (existingSub) {
      await deleteSubscription(existingSub.id);
      await addSubscription({
        name,
        amount: parseInt(amount),
        wallet,
        category: 'Bills',
        dayOfMonth: parseInt(dayOfMonth)
      });
    } else {
      await addSubscription({
        name,
        amount: parseInt(amount),
        wallet,
        category: 'Bills',
        dayOfMonth: parseInt(dayOfMonth)
      });
    }
    setIsLoading(false);
    onClose();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deleteSubscription(existingSub.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{existingSub ? 'Edit Subscription' : 'Add Auto-Bill'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Bill Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Netflix, Spotify"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Amount (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Source Wallet</label>
            <select
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-medium"
            >
              {wallets.map(w => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Billing Day (1 - 31)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
              placeholder="e.g. 15 for 15th of the month"
            />
            <p className="text-xs text-gray-500 mt-1">This bill will be automatically deducted from your wallet on this date every month.</p>
          </div>

          <div className="flex gap-3 pt-2">
            {existingSub && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-expense/10 hover:bg-expense/20 text-expense p-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Subscription'
              )}
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 bg-card rounded-t-3xl p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-center">Delete Subscription?</h3>
            <p className="text-gray-400 text-center mb-8">This will no longer be auto-deducted.</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-4 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-expense hover:bg-expense/90 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
