import { useState } from 'react';
import { X } from 'lucide-react';
import useStore from '../store/useStore';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { profile, updateProfile, wallets } = useStore();
  
  const [formData, setFormData] = useState({
    monthlyIncome: profile.monthlyIncome || 0,
    savingsTarget: profile.savingsTarget || 0,
    churchTithe: profile.churchTithe || 0,
    dailyBudget: profile.dailyBudget || 0,
    payday: profile.payday || 25,
    salaryWallet: profile.salaryWallet || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salaryWallet' ? value : (parseInt(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await updateProfile(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-card py-2 z-10">
          <h2 className="text-xl font-bold">Edit Budget Plan</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Income (Rp)</label>
            <input
              type="number"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-savings font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Savings Target (Rp)</label>
            <input
              type="number"
              name="savingsTarget"
              value={formData.savingsTarget}
              onChange={handleChange}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tithe / Donation (Rp)</label>
            <input
              type="number"
              name="churchTithe"
              value={formData.churchTithe}
              onChange={handleChange}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Daily Budget (Rp)</label>
            <input
              type="number"
              name="dailyBudget"
              value={formData.dailyBudget}
              onChange={handleChange}
              className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Payday Date (1-31)</label>
              <input
                type="number"
                name="payday"
                min="1"
                max="31"
                value={formData.payday}
                onChange={handleChange}
                className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium text-info"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Salary Wallet</label>
              <select
                name="salaryWallet"
                value={formData.salaryWallet}
                onChange={handleChange}
                className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium text-info"
              >
                <option value="">Default (Auto)</option>
                {wallets.map(w => (
                  <option key={w.name} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
