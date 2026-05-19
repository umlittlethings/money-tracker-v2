/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

const GoalModal = ({ isOpen, onClose, existingGoal }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [date, setDate] = useState('');
  const [linkedWallet, setLinkedWallet] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addGoal, updateGoal, deleteGoal, wallets } = useStore();

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        setName(existingGoal.name);
        setTarget(existingGoal.target.toString());
        setCurrent(existingGoal.current.toString());
        setDate(existingGoal.date);
        setLinkedWallet(existingGoal.linked_wallet || '');
      } else {
        setName('');
        setTarget('');
        setCurrent('');
        setDate(new Date().toISOString().split('T')[0]);
        setLinkedWallet('');
      }
      setShowDeleteConfirm(false);
    }
  }, [existingGoal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !target) return;

    const goalData = {
      name,
      target: parseInt(target),
      current: parseInt(current) || 0,
      date,
      linkedWallet: linkedWallet || null
    };

    setIsLoading(true);
    if (existingGoal) {
      await updateGoal(existingGoal.id, goalData);
    } else {
      await addGoal(goalData);
    }
    setIsLoading(false);
    onClose();
  };

  const handleDelete = () => {
    if (!existingGoal) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deleteGoal(existingGoal.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-card py-2 z-10">
          <h2 className="text-xl font-bold">{existingGoal ? 'Edit Goal' : 'New Goal'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. New Laptop"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Amount (Rp)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium text-savings"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Link to Savings Wallet (Optional)</label>
            <select
              value={linkedWallet}
              onChange={(e) => {
                setLinkedWallet(e.target.value);
                if (e.target.value) {
                  const w = wallets.find(wall => wall.name === e.target.value);
                  if (w) setCurrent(w.balance.toString());
                }
              }}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-medium"
            >
              <option value="">No Link (Manual Progress)</option>
              {wallets.filter(w => w.type === 'savings').map(w => (
                <option key={w.name} value={w.name}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1 mb-2">If linked, goal progress automatically syncs with the wallet balance.</p>
          </div>

          {!linkedWallet && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Saved (Rp)</label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            {existingGoal && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-expense/10 hover:bg-expense/20 text-expense p-4 rounded-2xl transition-colors flex items-center justify-center"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Goal'
              )}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 bg-card rounded-t-3xl p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center text-expense mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Delete Goal?</h3>
            <p className="text-gray-400 text-center mb-8">
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-4 rounded-2xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-expense hover:bg-expense/90 text-white py-4 rounded-2xl font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalModal;
