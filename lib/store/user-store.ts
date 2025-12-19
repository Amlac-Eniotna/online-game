import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  username: string | null;
  email: string | null;
  coins: number;
  premiumCoins: number;
  level: number;
  xp: number;
  rank: number;

  // User data actions
  setUser: (user: Partial<UserState>) => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        username: null,
        email: null,
        coins: 0,
        premiumCoins: 0,
        level: 1,
        xp: 0,
        rank: 0,

        setUser: (user) => set(user),

        addCoins: (amount) => set((state) => ({
          coins: state.coins + amount,
        })),

        addXp: (amount) => set((state) => {
          const newXp = state.xp + amount;
          const xpPerLevel = 1000;
          const newLevel = Math.floor(newXp / xpPerLevel) + 1;

          return {
            xp: newXp,
            level: newLevel,
          };
        }),

        clearUser: () => set({
          userId: null,
          username: null,
          email: null,
          coins: 0,
          premiumCoins: 0,
          level: 1,
          xp: 0,
          rank: 0,
        }),
      }),
      {
        name: 'user-storage',
      }
    ),
    { name: 'UserStore' }
  )
);
