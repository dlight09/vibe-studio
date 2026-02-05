'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'

export type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'> & { id?: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'> & { id?: string }) => {
      const id = t.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
      const next: Toast = {
        id,
        title: t.title,
        description: t.description,
        variant: t.variant ?? 'default',
      }
      setToasts((prev) => [next, ...prev].slice(0, 5))
      window.setTimeout(() => remove(id), 3500)
    },
    [remove]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.variant}`} role="status">
            <div className="toast-title">{t.title}</div>
            {t.description && <div className="toast-desc">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
