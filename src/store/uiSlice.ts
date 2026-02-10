import { StateCreator } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface UiSlice {
  isLoading: boolean;
  loadingMessage: string;
  toasts: ToastMessage[];
  activeModal: string | null;

  setLoading: (loading: boolean, message?: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  isLoading: false,
  loadingMessage: '',
  toasts: [],
  activeModal: null,

  setLoading: (isLoading, loadingMessage = '') =>
    set({ isLoading, loadingMessage }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Date.now().toString(36) + Math.random().toString(36).slice(2) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
});
