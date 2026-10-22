import React from 'react';
import { COLORS } from './shared-ui';

export interface LiveStepperProps {
  currentStep: number; // 1 to 5
  statusMessage?: string;
  isFadingOut?: boolean;
}

const STEPS = [
  { step: 1, label: 'Mengekstrak & menormalisasi draf naskah...' },
  { step: 2, label: 'Mengakuisisi korpus Top-3 kompetitor SERP...' },
  { step: 3, label: 'Melakukan tokenisasi & stemming Sastrawi...' },
  { step: 4, label: 'Menghitung matriks TF-IDF, Cosine Similarity, & Information Gain...' },
  { step: 5, label: 'Menyusun evaluasi stilometri (MATTR, HKO) & vonis CDS...' },
];

export const LiveStepper: React.FC<LiveStepperProps> = ({
  currentStep,
  statusMessage,
  isFadingOut = false,
}) => {
  return (
    <div
      style={{
        background: 'var(--waskita-card, #E9DFCA)',
        border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
        borderRadius: '18px',
        padding: '16px 20px',
        margin: '12px 0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.35s ease',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(0.98) translateY(-6px)' : 'none',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#059669',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.deepSlate }}>
            {isFadingOut
              ? 'Seluruh 5 Tahap Evaluasi Selesai!'
              : 'Audit Kualitas Real-time Sedang Berjalan...'}
          </span>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--waskita-text-muted, #64748B)',
            background: 'var(--waskita-track, rgba(30, 41, 59, 0.08))',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}
        >
          {isFadingOut ? '5 dari 5' : `Tahap ${Math.min(Math.max(currentStep, 1), 5)} dari 5`}
        </span>
      </div>

      {/* Steps List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {STEPS.map((s) => {
          const isDone = isFadingOut || s.step < currentStep;
          const isCurrent = !isFadingOut && s.step === currentStep;
          const isPending = !isFadingOut && s.step > currentStep;

          return (
            <div
              key={s.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12px',
                color: isPending
                  ? 'var(--waskita-text-subtle, rgba(30, 41, 59, 0.45))'
                  : COLORS.deepSlate,
                fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isDone
                    ? '#059669'
                    : isCurrent
                    ? COLORS.softPeriwinkle
                    : 'var(--waskita-track, rgba(30, 41, 59, 0.1))',
                  color: isDone ? '#FFFFFF' : COLORS.deepSlate,
                  boxShadow: isCurrent ? '0 0 0 2px rgba(192, 206, 232, 0.6)' : 'none',
                }}
              >
                {isDone ? (
                  '✓'
                ) : isCurrent ? (
                  <svg
                    style={{ animation: 'spin 1s linear infinite', width: 14, height: 14 }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0110 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  s.step
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{s.label}</span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: 'var(--waskita-text-muted, #64748B)',
                    }}
                  >
                    Sedang diproses...
                  </span>
                )}
                {isDone && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#059669',
                      fontWeight: 600,
                    }}
                  >
                    Selesai ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {statusMessage && !isFadingOut && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            fontSize: '11px',
            color: 'var(--waskita-text-muted, #64748B)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⏱️</span>
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
