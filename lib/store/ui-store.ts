import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  // Modals
  isShopOpen: boolean;
  isCollectionOpen: boolean;
  isDeckBuilderOpen: boolean;

  // Notifications
  notifications: Notification[];

  // Loading states
  isLoading: boolean;
  loadingMessage: string;

  // Actions
  openShop: () => void;
  closeShop: () => void;
  openCollection: () => void;
  closeCollection: () => void;
  openDeckBuilder: () => void;
  closeDeckBuilder: () => void;

  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;

  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isShopOpen: false,
      isCollectionOpen: false,
      isDeckBuilderOpen: false,
      notifications: [],
      isLoading: false,
      loadingMessage: '',

      openShop: () => set({ isShopOpen: true }),
      closeShop: () => set({ isShopOpen: false }),
      openCollection: () => set({ isCollectionOpen: true }),
      closeCollection: () => set({ isCollectionOpen: false }),
      openDeckBuilder: () => set({ isDeckBuilderOpen: true }),
      closeDeckBuilder: () => set({ isDeckBuilderOpen: false }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now().toString() },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      setLoading: (isLoading, message = '') =>
        set({ isLoading, loadingMessage: message }),
    }),
    { name: 'UIStore' }
  )
);
