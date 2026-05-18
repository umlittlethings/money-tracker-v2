import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const defaultProfile = {
  name: '',
  monthlyIncome: 0,
  savingsTarget: 0,
  churchTithe: 0,
  dailyBudget: 0,
  payday: 25,
  streak: 0,
  totalXp: 0,
  level: 'Beginner Saver',
};

const useStore = create((set, get) => ({
  user: null,
  profile: defaultProfile,
  transactions: [],
  goals: [],
  wallets: ['Cash'],
  settings: { darkMode: true },
  isLoading: true,
  
  addWallet: async (walletName) => {
    const user = get().user;
    if (!user) return;
    
    const currentWallets = get().wallets;
    if (currentWallets.includes(walletName)) return;
    
    const newWallets = [...currentWallets, walletName];
    set({ wallets: newWallets });
    
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },
  
  deleteWallet: async (walletName) => {
    const user = get().user;
    if (!user) return;
    
    const currentWallets = get().wallets;
    const newWallets = currentWallets.filter(w => w !== walletName);
    set({ wallets: newWallets });
    
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },

  initializeAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isLoading: false });
      if (session?.user) get().fetchData();
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, isLoading: false });
      if (session?.user) {
        get().fetchData();
      } else {
        // Clear state on logout
        set({ profile: defaultProfile, transactions: [], goals: [] });
      }
    });
  },

  fetchData: async () => {
    const user = get().user;
    if (!user) return;

    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      set({ 
        profile: {
          name: profile.name || '',
          monthlyIncome: profile.monthly_income,
          savingsTarget: profile.savings_target,
          churchTithe: profile.church_tithe,
          dailyBudget: profile.daily_budget,
          payday: profile.payday,
          streak: profile.streak,
          totalXp: profile.total_xp,
          level: profile.level
        },
        wallets: profile.wallets || ['Cash']
      });
    }

    // Fetch Transactions
    const { data: transactions } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (transactions) {
      set({ transactions: transactions.map(t => ({...t, wallet: t.wallet || 'Cash'})) });
    }

    // Fetch Goals
    const { data: goals } = await supabase.from('goals').select('*').order('target_date', { ascending: true });
    if (goals) set({ goals: goals.map(g => ({...g, date: g.target_date})) }); // Map target_date to date for legacy UI support
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  // -------------------------
  // PROFILE ACTIONS
  // -------------------------
  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;

    // Map UI names to DB names
    const dbUpdates = {
      name: updates.name,
      monthly_income: updates.monthlyIncome,
      savings_target: updates.savingsTarget,
      church_tithe: updates.churchTithe,
      daily_budget: updates.dailyBudget,
      payday: updates.payday,
    };

    // Remove undefined
    Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

    // Optimistic Update
    set((state) => ({ profile: { ...state.profile, ...updates } }));

    await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
  },

  // -------------------------
  // TRANSACTION ACTIONS
  // -------------------------
  addTransaction: async (transaction) => {
    const user = get().user;
    if (!user) return;

    const newTx = {
      user_id: user.id,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note || '',
      wallet: transaction.wallet || 'Cash'
    };

    const optimisticId = Math.random().toString();
    set((state) => ({
      transactions: [{ id: optimisticId, ...newTx, date: new Date().toISOString() }, ...state.transactions]
    }));

    const { data, error } = await supabase.from('transactions').insert([newTx]).select().single();
    if (!error && data) {
      set((state) => ({
        transactions: state.transactions.map(t => t.id === optimisticId ? { ...data, wallet: data.wallet || 'Cash' } : t)
      }));
    }
  },

  updateTransaction: async (id, updatedData) => {
    // Optimistic Update
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...updatedData } : t)
    }));

    await supabase.from('transactions').update({
      amount: updatedData.amount,
      category: updatedData.category,
      note: updatedData.note,
      wallet: updatedData.wallet
    }).eq('id', id);
  },

  deleteTransaction: async (id) => {
    // Optimistic Update
    set((state) => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }));

    await supabase.from('transactions').delete().eq('id', id);
  },

  // -------------------------
  // GOAL ACTIONS
  // -------------------------
  addGoal: async (goal) => {
    const user = get().user;
    if (!user) return;

    const newGoal = {
      user_id: user.id,
      name: goal.name,
      target: goal.target,
      current: goal.current || 0,
      target_date: goal.date
    };

    const optimisticId = Math.random().toString();
    set((state) => ({
      goals: [...state.goals, { id: optimisticId, ...newGoal, date: newGoal.target_date }]
    }));

    const { data, error } = await supabase.from('goals').insert([newGoal]).select().single();
    if (!error && data) {
      set((state) => ({
        goals: state.goals.map(g => g.id === optimisticId ? { ...data, date: data.target_date } : g)
      }));
    }
  },

  updateGoal: async (id, updatedData) => {
    const dbUpdates = {};
    if (updatedData.name !== undefined) dbUpdates.name = updatedData.name;
    if (updatedData.target !== undefined) dbUpdates.target = updatedData.target;
    if (updatedData.current !== undefined) dbUpdates.current = updatedData.current;
    if (updatedData.date !== undefined) dbUpdates.target_date = updatedData.date;

    // Optimistic Update
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updatedData } : g)
    }));

    await supabase.from('goals').update(dbUpdates).eq('id', id);
  },

  deleteGoal: async (id) => {
    // Optimistic Update
    set((state) => ({
      goals: state.goals.filter(g => g.id !== id)
    }));

    await supabase.from('goals').delete().eq('id', id);
  },

  // -------------------------
  // SETTINGS
  // -------------------------
  toggleDarkMode: () => set((state) => ({ settings: { darkMode: !state.settings.darkMode } })),

}));

export default useStore;
