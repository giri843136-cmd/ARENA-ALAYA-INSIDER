/**
 * ALAYA INSIDER — Global Toast Store (Zustand)
 * Auto-dismissing toast notifications for all async actions.
 * Used across admin and user-facing pages for consistent feedback.
 */

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_DURATION = 4000;

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toastData) => {
    const id = generateId();
    const duration = toastData.duration ?? DEFAULT_DURATION;

    set((state) => ({
      toasts: [...state.toasts, { ...toastData, id }],
    }));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Convenience helpers for common toast types.
 * These can be called from any component or async action.
 */
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", title, message, duration }),

  error: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", title, message, duration }),

  warning: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", title, message, duration }),

  info: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", title, message, duration }),
};
