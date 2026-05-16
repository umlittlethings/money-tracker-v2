import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay, isSameDay, subDays } from 'date-fns';

const initialData = {
  profile: {
    monthlyIncome: 5500000,
    savingsTarget: 3400000,
    churchTithe: 500000,
    dailyBudget: 40000,
    payday: 25,
    pin: null,
    name: 'Sushitrash',
  },
  transactions: [
    { id: '1', amount: 25000, category: 'Food', date: new Date().toISOString(), note: 'Lunch' },
    { id: '2', amount: 15000, category: 'Coffee', date: new Date().toISOString(), note: 'Iced Coffee' },
  ],
  goals: [
    { id: 'g1', name: 'PC Upgrade', target: 15000000, current: 2500000, date: '2026-12-01' },
    { id: 'g2', name: 'Emergency Fund', target: 20000000, current: 5000000, date: '2027-06-01' },
  ],
  gamification: {
    streak: 3,
    totalXp: 450,
    level: 'Disciplined Saver',
  },
  settings: {
    darkMode: true,
  }
};

const useStore = create(
  persist(
    (set, get) => ({
      ...initialData,
      isInitialized: false,

      initializeData: () => set((state) => {
        if (!state.isInitialized) {
          return { ...initialData, isInitialized: true };
        }
        return {};
      }),

      addTransaction: (transaction) => set((state) => ({
        transactions: [
          ...state.transactions,
          {
            ...transaction,
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString(),
          }
        ]
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      updateTransaction: (id, updatedData) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...updatedData } : t
        )
      })),

      updateProfile: (profileData) => set((state) => ({
        profile: { ...state.profile, ...profileData }
      })),

      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.settings.darkMode;
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return {
          settings: { ...state.settings, darkMode: newDarkMode }
        };
      }),

      addGoal: (goal) => set((state) => ({
        goals: [
          ...state.goals,
          {
            ...goal,
            id: Math.random().toString(36).substring(2, 9),
            current: goal.current || 0,
          }
        ]
      })),

      updateGoal: (id, updatedData) => set((state) => ({
        goals: state.goals.map(g => 
          g.id === id ? { ...g, ...updatedData } : g
        )
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

    }),
    {
      name: 'moneyflow-storage',
      // We need to parse dates back if needed, but ISO strings are fine for most uses.
    }
  )
);

export default useStore;
