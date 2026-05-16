import React, { useState } from 'react';
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
    <div className="relative w-full h-[100dvh] overflow-hidden bg-background max-w-md mx-auto sm:border-x sm:border-gray-800 shadow-2xl flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full h-16 glass-card border-t z-10 flex justify-between items-center px-4 pb-safe">
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

      {/* Add Expense Modal */}
      {isAddOpen && <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />}
    </div>
  );
};

export default Layout;
