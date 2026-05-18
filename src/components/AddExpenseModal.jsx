import { useState } from 'react';
import { X } from 'lucide-react';
import useStore from '../store/useStore';

const AddExpenseModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState('Cash');
  const addTransaction = useStore(state => state.addTransaction);
  const wallets = useStore(state => state.wallets);

  const categories = ['Food', 'Coffee', 'Transport', 'Gaming', 'Shopping', 'Bills', 'Church', 'Other'];
  const quickAdds = [5000, 10000, 20000, 50000];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    addTransaction({
      amount: parseInt(amount),
      category,
      note,
      wallet
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Expense</h2>
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
            
            {/* Quick Add Buttons */}
            <div className="flex gap-2 mt-3">
              {quickAdds.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount((prev) => (parseInt(prev || 0) + val).toString())}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  +{val / 1000}k
                </button>
              ))}
            </div>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">Wallet</label>
            <div className="flex flex-wrap gap-2">
              {wallets.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWallet(w)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    wallet === w ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {w}
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

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
