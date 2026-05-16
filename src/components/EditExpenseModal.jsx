import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

const EditExpenseModal = ({ isOpen, onClose, transaction }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { updateTransaction, deleteTransaction } = useStore();

  const categories = ['Food', 'Coffee', 'Transport', 'Gaming', 'Shopping', 'Bills', 'Church', 'Other'];

  useEffect(() => {
    if (transaction && isOpen) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category || 'Food');
      setNote(transaction.note || '');
      setShowDeleteConfirm(false);
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !transaction) return;
    
    updateTransaction(transaction.id, {
      amount: parseInt(amount),
      category,
      note
    });
    onClose();
  };

  const handleDelete = () => {
    if (!transaction) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTransaction(transaction.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Expense</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-2xl px-4 py-4 text-2xl font-bold text-center focus:outline-none focus:border-primary transition-colors"
              placeholder="0"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    category === c ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="What was this for?"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-expense/10 hover:bg-expense/20 text-expense p-4 rounded-2xl transition-colors flex items-center justify-center"
            >
              <Trash2 size={24} />
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 bg-card rounded-t-3xl p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center text-expense mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Delete Expense?</h3>
            <p className="text-gray-400 text-center mb-8">
              Are you sure you want to delete this expense? This action cannot be undone.
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
                className="flex-1 bg-expense hover:bg-expense/90 text-white py-4 rounded-2xl font-bold shadow-[0_4px_15px_rgba(239,68,68,0.4)] transition-transform active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditExpenseModal;
