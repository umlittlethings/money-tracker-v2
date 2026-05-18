import { useState } from 'react';
import useStore from '../store/useStore';
import EditProfileModal from '../components/EditProfileModal';

const Settings = () => {
  const { profile, settings, toggleDarkMode, signOut, transactions } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletType, setNewWalletType] = useState('daily');
  const [editingWallet, setEditingWallet] = useState(null);
  const [editBalanceValue, setEditBalanceValue] = useState('');

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
          <h3 className="font-bold text-lg border-b border-gray-800 pb-2">Your Wallets</h3>
          <p className="text-xs text-gray-400 mt-2 mb-4">Click "Savings" to toggle a wallet's purpose.</p>
          <div className="space-y-3 text-sm">
            {useStore(state => state.wallets).map(w => (
              <div key={w.name} className="flex flex-col bg-gray-800/50 p-3 rounded-xl gap-2 border border-gray-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200">{w.name}</span>
                    <button 
                      onClick={() => useStore.getState().toggleWalletType(w.name)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                        w.type === 'savings' 
                          ? 'bg-savings/20 text-savings border border-savings/30 hover:bg-savings/30' 
                          : 'bg-info/20 text-info border border-info/30 hover:bg-info/30'
                      }`}
                    >
                      {w.type === 'savings' ? 'Savings' : 'Daily Needs'}
                    </button>
                  </div>
                  {editingWallet === w.name ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={editBalanceValue} 
                        onChange={(e) => setEditBalanceValue(e.target.value)}
                        className="w-24 bg-background border border-gray-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button onClick={() => {
                        useStore.getState().updateWalletBalance(w.name, parseInt(editBalanceValue) || 0);
                        setEditingWallet(null);
                      }} className="text-primary text-xs font-bold">Save</button>
                    </div>
                  ) : (
                    <span className="font-bold text-primary">Rp {w.balance.toLocaleString('id-ID')}</span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  {editingWallet !== w.name ? (
                    <button onClick={() => {
                      setEditingWallet(w.name);
                      setEditBalanceValue(w.balance.toString());
                    }} className="text-info text-xs font-bold hover:opacity-80">Edit Balance</button>
                  ) : <span></span>}
                  
                  {w.name !== 'Cash' && (
                    <button 
                      onClick={() => useStore.getState().deleteWallet(w.name)} 
                      className="text-expense text-xs font-bold hover:opacity-80"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isAddingWallet ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Wallet Name (e.g. BCA)"
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  autoFocus
                />
                <input
                  type="number"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  placeholder="Initial Balance (Rp)"
                  className="w-full bg-background border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                
                <div className="flex gap-2 mb-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewWalletType('daily')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      newWalletType === 'daily' 
                        ? 'bg-info/20 text-info border-info/50' 
                        : 'bg-background border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    Daily Needs
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWalletType('savings')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      newWalletType === 'savings' 
                        ? 'bg-savings/20 text-savings border-savings/50' 
                        : 'bg-background border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    Savings
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newWalletName && newWalletName.trim()) {
                        useStore.getState().addWallet(newWalletName.trim(), parseInt(newWalletBalance) || 0, newWalletType);
                        setNewWalletName('');
                        setNewWalletBalance('');
                        setNewWalletType('daily');
                        setIsAddingWallet(false);
                      }
                    }}
                    className="flex-1 py-2 bg-primary rounded-xl font-medium text-white hover:bg-primary/90 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingWallet(false);
                      setNewWalletName('');
                      setNewWalletBalance('');
                    }}
                    className="flex-1 py-2 bg-gray-800 rounded-xl font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
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

        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-800 pb-2">System History Logs</h3>
          <div className="space-y-3 text-sm">
            {transactions.filter(t => t.category === 'System').slice(0, 5).length === 0 ? (
              <p className="text-gray-500 text-center py-2">No system logs yet.</p>
            ) : (
              transactions.filter(t => t.category === 'System').slice(0, 5).map(t => (
                <div key={t.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-300">{t.note}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleDateString('id-ID')} • Wallet: {t.wallet}</p>
                  </div>
                  <span className="font-bold text-gray-400">Rp {t.amount.toLocaleString('id-ID')}</span>
                </div>
              ))
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
