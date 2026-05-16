import { useState } from 'react';
import useStore from '../store/useStore';
import EditProfileModal from '../components/EditProfileModal';

const Settings = () => {
  const { profile, settings, toggleDarkMode, signOut } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

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
