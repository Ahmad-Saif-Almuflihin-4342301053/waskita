import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, durationMs };
      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--waskita-card, #E9DFCA)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
              borderRadius: '14px',
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              color: 'var(--waskita-text, #1E293B)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                marginTop: 6,
                flexShrink: 0,
                background:
                  toast.type === 'success'
                    ? '#10B981'
                    : toast.type === 'error'
                    ? '#EF4444'
                    : toast.type === 'warning'
                    ? '#F59E0B'
                    : '#3B82F6',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: 2 }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '12px', lineHeight: 1.4, opacity: 0.9 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--waskita-text-muted, #64748B)',
                padding: 4,
                fontSize: '14px',
                lineHeight: 1,
              }}
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
