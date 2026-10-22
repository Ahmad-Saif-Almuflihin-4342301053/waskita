import React from 'react';
import { COLORS } from './shared-ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDanger = false,
  onConfirm,
  onCancel,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--waskita-bg, #F7F4EB)',
          border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: COLORS.deepSlate,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--waskita-text-body, #334155)',
            }}
          >
            {message}
          </p>
          {children}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'var(--waskita-card, #E9DFCA)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: isDanger ? '#EF4444' : COLORS.softPeriwinkle,
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              color: isDanger ? '#FFFFFF' : COLORS.deepSlate,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
