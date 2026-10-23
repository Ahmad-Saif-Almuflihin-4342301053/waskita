import React, { useState } from 'react';
import { COLORS, IconX, IconSun, IconMoon, IconLogOut } from './shared-ui';

export interface UserProfile {
  name?: string;
  email?: string;
  plan?: string;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  currentUser?: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  if (!isOpen) return null;

  const profile = userProfile || currentUser || {
    name: 'author_demo',
    email: 'author@waskita.id',
    plan: 'Personal Plan',
  };
  const name = profile.name || 'author_demo';
  const email = profile.email || 'author@waskita.id';
  const plan = profile.plan || 'Personal Plan';

  const handleLogout = () => {
    setShowConfirm(false);
    onClose();
    onLogout();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)',
        zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--waskita-bg, #F7F4EB)',
          border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
          borderRadius: '20px', padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.22)',
          display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: COLORS.deepSlate }}>Pengaturan Akun & Sistem</h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--waskita-text-muted, #64748B)' }}>
              Konfigurasi profil kerja, preferensi visual, dan sesi Waskita
            </p>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Tutup"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconX size={20} color={COLORS.deepSlate} />
          </button>
        </div>

        {/* Seksi 1: Profil Pengguna */}
        <div style={{ background: 'var(--waskita-card, #E9DFCA)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: COLORS.deepSlate, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.deepSlate }}>{name}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.04em' }}>
                {plan}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--waskita-text-muted, #64748B)', marginTop: '2px' }}>{email}</div>
          </div>
        </div>

        {/* Seksi 2: Tampilan Antarmuka */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--waskita-text-muted, #64748B)' }}>
            Tampilan Antarmuka
          </span>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--waskita-card, #E9DFCA)', padding: '5px', borderRadius: '12px' }}>
            <button
              type="button" onClick={() => { if (theme !== 'light') onToggleTheme(); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '9px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: theme === 'light' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
                boxShadow: theme === 'light' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                fontWeight: theme === 'light' ? 700 : 500, fontSize: '12.5px', color: COLORS.deepSlate,
              }}
            >
              <IconSun size={16} color={COLORS.deepSlate} />
              <span>Mode Terang</span>
            </button>
            <button
              type="button" onClick={() => { if (theme !== 'dark') onToggleTheme(); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '9px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: theme === 'dark' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
                boxShadow: theme === 'dark' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                fontWeight: theme === 'dark' ? 700 : 500, fontSize: '12.5px', color: COLORS.deepSlate,
              }}
            >
              <IconMoon size={16} color={COLORS.deepSlate} />
              <span>Mode Gelap</span>
            </button>
          </div>
        </div>

        {/* Seksi 3: Sesi & Akun */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--waskita-text-muted, #64748B)' }}>
            Sesi & Akun
          </span>
          {showConfirm ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
                Yakin ingin keluar dari akun Waskita? Sesi aktif Anda akan ditutup.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button" onClick={() => setShowConfirm(false)}
                  style={{
                    background: 'transparent', border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.2))',
                    borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, color: COLORS.deepSlate, cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="button" onClick={handleLogout}
                  style={{
                    background: '#EF4444', border: 'none', borderRadius: '8px',
                    padding: '5px 14px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer',
                  }}
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button" onClick={() => setShowConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 16px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#EF4444', cursor: 'pointer',
              }}
            >
              <IconLogOut size={16} color="#EF4444" />
              <span>Keluar dari Akun</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
