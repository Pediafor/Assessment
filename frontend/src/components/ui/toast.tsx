"use client";
import React, { createContext, useCallback, useContext, useId, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";
type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  toast: (t: Omit<ToastItem, "id">) => { id: string };
  success: (msg: string, opts?: Omit<ToastItem, "id" | "description" | "variant" | "title"> & { description?: string; title?: string }) => { id: string };
  error: (msg: string, opts?: Omit<ToastItem, "id" | "description" | "variant" | "title"> & { description?: string; title?: string }) => { id: string };
  info: (msg: string, opts?: Omit<ToastItem, "id" | "description" | "variant" | "title"> & { description?: string; title?: string }) => { id: string };
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const genId = useId();

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>((t) => {
    const id = `${genId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = t.duration ?? 3500;
    const next: ToastItem = { id, ...t };
    setItems((prev) => [...prev, next]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return { id };
  }, [genId, remove]);

  const success: ToastContextValue["success"] = useCallback((msg, opts) => toast({ title: opts?.title, description: msg ?? opts?.description, variant: "success", duration: opts?.duration }), [toast]);
  const error: ToastContextValue["error"] = useCallback((msg, opts) => toast({ title: opts?.title, description: msg ?? opts?.description, variant: "error", duration: opts?.duration }), [toast]);
  const info: ToastContextValue["info"] = useCallback((msg, opts) => toast({ title: opts?.title, description: msg ?? opts?.description, variant: "info", duration: opts?.duration }), [toast]);

  const value = useMemo<ToastContextValue>(() => ({ toast, success, error, info, remove }), [toast, success, error, info, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster items={items} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Fallback no-op implementation for tests or environments without provider
  const noop = () => ({ id: "noop" });
  return {
    toast: noop,
    success: noop,
    error: noop,
    info: noop,
    remove: () => {},
  } as ToastContextValue;
}

export function Toaster({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={
            "pointer-events-auto rounded-md border px-3 py-2 shadow-sm text-sm bg-background " +
            (t.variant === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : t.variant === "error"
              ? "border-red-300 bg-red-50 text-red-900"
              : t.variant === "warning"
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : t.variant === "info"
              ? "border-sky-300 bg-sky-50 text-sky-900"
              : "border-border")
          }
        >
          {t.title ? <div className="font-medium">{t.title}</div> : null}
          {t.description ? <div>{t.description}</div> : null}
          <button onClick={() => onDismiss(t.id)} className="mt-1 text-xs underline">Dismiss</button>
        </div>
      ))}
    </div>
  );
}
