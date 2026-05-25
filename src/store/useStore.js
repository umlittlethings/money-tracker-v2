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
  wallets: [{ name: 'Cash', balance: 0 }],
  subscriptions: [],
  settings: { theme: 'dark', hideBalance: false },
  isLoading: true,
  isAuthInitialized: false,
  fetchDataPromise: null,
  
  addWallet: async (walletName, initialBalance = 0, type = 'daily') => {
    const user = get().user;
    if (!user) return;
    
    const currentWallets = get().wallets;
    if (currentWallets.some(w => w.name === walletName)) return;
    
    const newWallets = [...currentWallets, { name: walletName, balance: initialBalance, type }];
    set({ wallets: newWallets });
    
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },
  
  updateWalletBalance: async (walletName, newBalance) => {
    const user = get().user;
    if (!user) return;
    const newWallets = get().wallets.map(w => w.name === walletName ? { ...w, balance: newBalance } : w);
    set({ wallets: newWallets });
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },
  
  deleteWallet: async (walletName) => {
    const user = get().user;
    if (!user) return;
    
    const currentWallets = get().wallets;
    const newWallets = currentWallets.filter(w => w.name !== walletName);
    set({ wallets: newWallets });
    
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },

  toggleWalletType: async (walletName) => {
    const user = get().user;
    if (!user) return;
    
    const currentWallets = get().wallets;
    const newWallets = currentWallets.map(w => {
      if (w.name !== walletName) return w;
      
      let newType = 'daily';
      if (w.type === 'daily' || !w.type) newType = 'savings';
      else if (w.type === 'savings') newType = 'tap-card';
      else if (w.type === 'tap-card') newType = 'daily';
      
      return { ...w, type: newType };
    });
    set({ wallets: newWallets });
    
    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
  },

  transferWalletBalance: async (fromName, toName, amount) => {
    const user = get().user;
    if (!user) return;
    
    const newWallets = get().wallets.map(w => {
      if (w.name === fromName) return { ...w, balance: w.balance - amount };
      if (w.name === toName) return { ...w, balance: w.balance + amount };
      return w;
    });

    // Create system transaction for log
    const optimisticId = Math.random().toString();
    const systemTx = {
      id: optimisticId,
      user_id: user.id,
      amount: amount,
      category: 'System',
      note: `Transfer: ${fromName} ➔ ${toName}`,
      wallet: fromName,
      date: new Date().toISOString()
    };

    set((state) => ({
      wallets: newWallets,
      transactions: [systemTx, ...state.transactions]
    }));

    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user.id);
    
    // We only need a single tx for the log, inserting without returning since it's just a log
    await supabase.from('transactions').insert([{
      user_id: user.id,
      amount: amount,
      category: 'System',
      note: systemTx.note,
      wallet: fromName
    }]);
  },

  initializeAuth: () => {
    if (get().isAuthInitialized) return;
    set({ isAuthInitialized: true });

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isLoading: false });
      if (session?.user) get().fetchData();
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, isLoading: false });
      if (session?.user) {
        get().fetchData().then(() => {
          get().processPayday();
          get().processSubscriptions();
        });
      } else {
        // Clear state on logout
        set({ profile: defaultProfile, transactions: [], goals: [], subscriptions: [] });
      }
    });
  },

  fetchData: async () => {
    const user = get().user;
    if (!user) return;

    // Deduplicate concurrent fetch requests
    if (get().fetchDataPromise) {
      return get().fetchDataPromise;
    }

    const promise = (async () => {
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
            level: profile.level,
            lastProcessedPayday: localStorage.getItem(`payday_${user.id}`),
            salaryWallet: localStorage.getItem(`salaryWallet_${user.id}`) || ''
          },
          wallets: (profile.wallets || [{ name: 'Cash', balance: 0, type: 'daily' }]).map(w => {
            if (typeof w === 'string') return { name: w, balance: 0, type: 'daily' };
            return { ...w, type: w.type || 'daily' };
          }),
          subscriptions: profile.subscriptions || []
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
    })();

    set({ fetchDataPromise: promise });
    try {
      await promise;
    } finally {
      set({ fetchDataPromise: null });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  // -------------------------
  // PAYDAY (Auto-Income)
  // -------------------------
  processPayday: async () => {
    // FEATURE DISABLED per user request due to cross-device duplicate bugs.
    return;
  },

  // -------------------------
  // SUBSCRIPTIONS (Auto-Bills)
  // -------------------------
  processSubscriptions: async () => {
    const user = get().user;
    if (!user) return;
    
    const { subscriptions, addTransaction } = get();
    if (!subscriptions || subscriptions.length === 0) return;

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const currentDay = today.getDate();
    
    const subsToProcess = [];
    const newSubs = subscriptions.map(sub => {
      if (currentDay >= sub.dayOfMonth && sub.lastProcessedMonth !== currentMonthStr) {
        subsToProcess.push(sub);
        return { ...sub, lastProcessedMonth: currentMonthStr };
      }
      return sub;
    });

    if (subsToProcess.length === 0) return;

    // Synchronously update state to prevent concurrent runs from processing the same subs
    set({ subscriptions: newSubs });

    for (const sub of subsToProcess) {
      await addTransaction({
        amount: sub.amount,
        category: sub.category || 'Bills',
        note: `[Auto-Bill] ${sub.name}`,
        wallet: sub.wallet
      });
    }

    await supabase.from('profiles').update({ subscriptions: newSubs }).eq('id', user.id);
  },

  addSubscription: async (sub) => {
    const user = get().user;
    if (!user) return;

    const newSub = {
      id: Math.random().toString(),
      name: sub.name,
      amount: sub.amount,
      wallet: sub.wallet,
      category: sub.category || 'Bills',
      dayOfMonth: sub.dayOfMonth,
      lastProcessedMonth: sub.lastProcessedMonth !== undefined ? sub.lastProcessedMonth : null // preserve if editing
    };

    const newSubs = [...get().subscriptions, newSub];
    
    // Optimistic update
    set({ subscriptions: newSubs });
    
    const { error } = await supabase.from('profiles').update({ subscriptions: newSubs }).eq('id', user.id);
    if (error) {
      alert("Gagal menyimpan ke Database: Kolom subscriptions belum ada. Tolong jalankan perintah SQL di Supabase.");
      console.error(error);
      // Revert if error
      set({ subscriptions: get().subscriptions.filter(s => s.id !== newSub.id) });
    } else {
      get().processSubscriptions();
    }
  },

  deleteSubscription: async (id) => {
    const user = get().user;
    if (!user) return;

    const oldSubs = get().subscriptions;
    const newSubs = oldSubs.filter(s => s.id !== id);
    
    set({ subscriptions: newSubs });
    
    const { error } = await supabase.from('profiles').update({ subscriptions: newSubs }).eq('id', user.id);
    if (error) {
      alert("Gagal menghapus.");
      set({ subscriptions: oldSubs });
    }
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

    // Save salaryWallet to localStorage to avoid DB schema errors
    if (updates.salaryWallet !== undefined) {
      localStorage.setItem(`salaryWallet_${user.id}`, updates.salaryWallet);
    }

    // Remove undefined
    Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

    // Optimistic Update
    set((state) => ({ profile: { ...state.profile, ...updates } }));

    await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
  },

  updateCredentials: async (email, password) => {
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        alert("Gagal mengubah kredensial: " + error.message);
        return false;
      }
      alert("Kredensial berhasil diperbarui! (Catatan: Anda mungkin perlu mengonfirmasi email baru)");
      return true;
    }
    return false;
  },

  // -------------------------
  // TRANSACTION ACTIONS
  // -------------------------
  addTransaction: async (transaction) => {
    const user = get().user;
    if (!user) return;

    const targetWalletName = transaction.wallet || 'Cash';
    const targetWallet = get().wallets.find(w => w.name === targetWalletName);
    const isSavings = targetWallet?.type === 'savings';

    let finalCategory = transaction.category;
    let finalNote = transaction.note || '';

    // "pengurangan savings ditaruh di system logs"
    // If spending from a savings wallet, force it as a System log so it doesn't affect daily budgets
    if (isSavings && finalCategory !== 'System') {
      finalCategory = 'System';
      finalNote = `[${transaction.category}] ${finalNote}`.trim();
    }

    const newTx = {
      user_id: user.id,
      amount: transaction.amount,
      category: finalCategory,
      note: finalNote,
      wallet: targetWalletName
    };

    const optimisticId = Math.random().toString();
    
    let updatedWallets = [];

    set((state) => {
      // Deduct from wallet balance atomically
      updatedWallets = state.wallets.map(w => 
        w.name === targetWalletName ? { ...w, balance: w.balance - newTx.amount } : w
      );

      return {
        wallets: updatedWallets,
        transactions: [{ id: optimisticId, ...newTx, date: new Date().toISOString() }, ...state.transactions]
      };
    });

    // Update DB
    await supabase.from('profiles').update({ wallets: updatedWallets }).eq('id', user.id);
    const { data, error } = await supabase.from('transactions').insert([newTx]).select().single();
    if (!error && data) {
      set((state) => ({
        transactions: state.transactions.map(t => t.id === optimisticId ? { ...data, wallet: data.wallet || 'Cash' } : t)
      }));
    }
  },

  updateTransaction: async (id, updatedData) => {
    const user = get().user;
    const oldTx = get().transactions.find(t => t.id === id);
    if (!oldTx) return;

    let newWallets = [...get().wallets];
    
    // Refund old
    newWallets = newWallets.map(w => w.name === oldTx.wallet ? { ...w, balance: w.balance + oldTx.amount } : w);
    
    // Deduct new
    const newWalletName = updatedData.wallet || oldTx.wallet;
    const targetWallet = get().wallets.find(w => w.name === newWalletName);
    const isSavings = targetWallet?.type === 'savings';

    let finalCategory = updatedData.category || oldTx.category;
    let finalNote = updatedData.note !== undefined ? updatedData.note : oldTx.note;

    if (isSavings && finalCategory !== 'System') {
      finalNote = `[${finalCategory}] ${finalNote}`.trim();
      finalCategory = 'System';
    }

    const newAmount = updatedData.amount || oldTx.amount;
    newWallets = newWallets.map(w => w.name === newWalletName ? { ...w, balance: w.balance - newAmount } : w);

    const finalUpdatedData = {
      ...updatedData,
      category: finalCategory,
      note: finalNote
    };

    // Optimistic Update
    set((state) => ({
      wallets: newWallets,
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...finalUpdatedData } : t)
    }));

    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user?.id);
    await supabase.from('transactions').update({
      amount: finalUpdatedData.amount,
      category: finalUpdatedData.category,
      note: finalUpdatedData.note,
      wallet: finalUpdatedData.wallet
    }).eq('id', id);
  },

  deleteTransaction: async (id) => {
    const user = get().user;
    const oldTx = get().transactions.find(t => t.id === id);
    if (!oldTx) return;

    const newWallets = get().wallets.map(w => w.name === oldTx.wallet ? { ...w, balance: w.balance + oldTx.amount } : w);

    // Optimistic Update
    set((state) => ({
      wallets: newWallets,
      transactions: state.transactions.filter(t => t.id !== id)
    }));

    await supabase.from('profiles').update({ wallets: newWallets }).eq('id', user?.id);
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
      target_date: goal.date,
      linked_wallet: goal.linkedWallet || null
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
    if (updatedData.linkedWallet !== undefined) dbUpdates.linked_wallet = updatedData.linkedWallet;

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
  setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),
  toggleHideBalance: () => set((state) => ({ settings: { ...state.settings, hideBalance: !state.settings.hideBalance } })),

}));

export default useStore;
