"use client";

import { useEffect } from "react";
import { useToastStore, type Toast } from "@/lib/toast/store";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ICONS: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle size={18} className="text-[#4ADE80]" />,
  warning: <AlertTriangle size={18} className="text-[#FBBF24]" />,
  error: <XCircle size={18} className="text-[#F87171]" />,
  info: <Info size={18} className="text-[#60A5FA]" />,
};

const BG_COLORS: Record<Toast["type"], string> = {
  success: "bg-[#4ADE80]/10 border-[#4ADE80]/20",
  warning: "bg-[#FBBF24]/10 border-[#FBBF24]/20",
  error: "bg-[#F87171]/10 border-[#F87171]/20",
  info: "bg-[#60A5FA]/10 border-[#60A5FA]/20",
};

const TEXT_COLORS: Record<Toast["type"], string> = {
  success: "text-[#4ADE80]",
  warning: "text-[#FBBF24]",
  error: "text-[#F87171]",
  info: "text-[#60A5FA]",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  // Auto-dismiss with animation on mount
  useEffect(() => {
    const el = document.getElementById(toast.id);
    if (el) {
      el.classList.add("animate-in", "slide-in-from-right", "fade-in");
      el.classList.remove("opacity-0");
    }
  }, [toast.id]);

  return (
    <div
      id={toast.id}
      className={`opacity-0 flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${BG_COLORS[toast.type]}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${TEXT_COLORS[toast.type]}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-[#A1A1A1] mt-0.5">{toast.message}</p>}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`mt-1.5 text-xs font-medium ${TEXT_COLORS[toast.type]} hover:underline`}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors text-[#666] hover:text-[#EDEDED]"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Global toast container.
 * Place once in the root layout (already done — this supplements sonner).
 * Renders all active toasts from the Zustand store.
 */
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
