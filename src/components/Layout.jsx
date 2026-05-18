import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, PieChart, Target, Settings, Plus } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';

const Layout = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex w-full h-[100dvh] overflow-hidden bg-background">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-gray-900/30">
        <div className="p-6 mb-4">
          <h1 className="text-3xl font-black text-primary tracking-tighter">MoneyFlow</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-6">
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full py-4 bg-primary text-white rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-transform font-bold"
          >
            <Plus size={24} strokeWidth={3} />
            Add Expense
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 relative flex flex-col w-full h-[100dvh] md:max-w-5xl lg:max-w-7xl mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Floating Action Button */}
        <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 w-full h-16 glass-card border-t border-gray-800 z-10 flex justify-between items-center px-4 pb-safe bg-background/80 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-12 h-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Add Expense Modal */}
      {isAddOpen && <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />}
    </div>
  );
};

export default Layout;
