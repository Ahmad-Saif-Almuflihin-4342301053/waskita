import React, { useState } from 'react';
import { COLORS, WaskitaLogo, IconX, IconUser } from './shared-ui';
import { waskitaClient } from '../api/waskitaClient';
import { useToast } from '../context/ToastContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('author_demo');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Penulis Editorial Demo');
  const [email, setEmail] = useState('author@waskita.id');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      // Panggil POST /api/v1/auth/login
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'author_demo',
          password: 'password123',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          waskitaClient.setToken(data.access_token);
          localStorage.setItem('waskita_token', data.access_token);
        }
        onLoginSuccess(data.user || { username: 'author_demo' });
      } else {
        // Fallback demo local login
        waskitaClient.setToken('demo-token-author-demo');
        localStorage.setItem('waskita_token', 'demo-token-author-demo');
        onLoginSuccess({ username: 'author_demo', full_name: 'Penulis Demo' });
      }

      showToast({
        type: 'success',
        title: 'Masuk Berhasil',
        message: 'Selamat datang kembali, Penulis Demo!',
      });
      onClose();
    } catch (err: any) {
      // Local fallback
      waskitaClient.setToken('demo-token-author-demo');
      localStorage.setItem('waskita_token', 'demo-token-author-demo');
      onLoginSuccess({ username: 'author_demo', full_name: 'Penulis Demo' });
      showToast({
        type: 'success',
        title: 'Masuk Berhasil (Mode Offline/Demo)',
        message: 'Menggunakan sesi demo lokal.',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = tab === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload =
        tab === 'login'
          ? { username, password }
          : { username, password, email, full_name: fullName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Autentikasi gagal. Silakan periksa kembali kredensial Anda.');
      }

      const data = await res.json();
      if (data.access_token) {
        waskitaClient.setToken(data.access_token);
        localStorage.setItem('waskita_token', data.access_token);
      }
      onLoginSuccess(data.user || { username });
      showToast({
        type: 'success',
        title: tab === 'login' ? 'Masuk Berhasil' : 'Pendaftaran Berhasil',
        message: `Selamat datang, ${data.user?.full_name || username}!`,
      });
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: COLORS.warmCream,
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
          padding: '28px 24px',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: '50%',
            color: COLORS.deepSlate,
          }}
        >
          <IconX size={20} color={COLORS.deepSlate} />
        </button>

        {/* Brand & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <WaskitaLogo width={140} height={30} />
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: COLORS.deepSlate,
              margin: '12px 0 4px 0',
            }}
          >
            {tab === 'login' ? 'Masuk ke Waskita Member' : 'Daftar Akun Baru'}
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--waskita-text-muted, #64748B)',
              margin: 0,
            }}
          >
            Akses riwayat sesi permanen dan sinkronisasi multi-turn database SQLite WAL
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          style={{
            width: '100%',
            background: 'var(--waskita-emerald-bg, #D1FAE5)',
            border: '1.5px solid var(--waskita-emerald-border, #059669)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--waskita-emerald-text, #065F46)',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)',
          }}
        >
          <span>⚡</span>
          <span>Masuk Cepat (Akun Demo Penulis)</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--waskita-border, rgba(30, 41, 59, 0.12))' }} />
          <span style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>atau gunakan kredensial</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--waskita-border, rgba(30, 41, 59, 0.12))' }} />
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: COLORS.warmSand,
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              background: tab === 'login' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              background: tab === 'register' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Daftar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.deepSlate, display: 'block', marginBottom: '4px' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'var(--waskita-card, #E9DFCA)',
                  border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: COLORS.deepSlate,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.deepSlate, display: 'block', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'var(--waskita-card, #E9DFCA)',
                  border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: COLORS.deepSlate,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.deepSlate, display: 'block', marginBottom: '4px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--waskita-card, #E9DFCA)',
                border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
                color: COLORS.deepSlate,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.deepSlate, display: 'block', marginBottom: '4px' }}>
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--waskita-card, #E9DFCA)',
                border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
                color: COLORS.deepSlate,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: COLORS.softPeriwinkle,
              border: 'none',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13.5px',
              fontWeight: 700,
              color: COLORS.deepSlate,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              boxShadow: '0 2px 8px rgba(30, 41, 59, 0.1)',
            }}
          >
            {isSubmitting ? 'Memproses...' : tab === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};
