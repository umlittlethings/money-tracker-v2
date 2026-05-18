import { useState } from 'react';
import useStore from '../store/useStore';
import EditProfileModal from '../components/EditProfileModal';

const Settings = () => {
  const { profile, settings, toggleDarkMode, signOut } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');

  return (
    <div className="p-4 pt-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-800 pb-2">Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Income</span>
              <span className="font-medium text-savings">Rp {profile.monthlyIncome.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Daily Budget</span>
              <span className="font-medium">Rp {profile.dailyBudget.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="w-full mt-4 py-2 bg-gray-800 rounded-xl font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Edit Budget Plan
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-800 pb-2">Preferences</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Dark Mode</span>
            <button 
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-primary' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-800 pb-2">Wallets</h3>
          <div className="space-y-3 text-sm">
            {useStore(state => state.wallets).map(w => (
              <div key={w} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl">
                <span className="font-medium">{w}</span>
                {w !== 'Cash' && (
                  <button 
                    onClick={() => useStore.getState().deleteWallet(w)} 
                    className="text-expense text-xs font-bold hover:opacity-80"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {isAddingWallet ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="e.g. BCA, Gopay"
                  className="flex-1 bg-background border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (newWalletName && newWalletName.trim()) {
                      useStore.getState().addWallet(newWalletName.trim());
                      setNewWalletName('');
                      setIsAddingWallet(false);
                    }
                  }}
                  className="px-4 py-2 bg-primary rounded-xl font-medium text-white hover:bg-primary/90 transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingWallet(false);
                    setNewWalletName('');
                  }}
                  className="px-4 py-2 bg-gray-800 rounded-xl font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingWallet(true)}
                className="w-full mt-2 py-3 bg-gray-800 rounded-xl font-medium text-white hover:bg-gray-700 transition-colors border border-dashed border-gray-600"
              >
                + Add Custom Wallet
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={signOut}
          className="w-full py-4 mt-6 bg-expense/10 text-expense font-bold rounded-2xl hover:bg-expense/20 transition-colors"
        >
          Log Out
        </button>
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

export default Settings;
