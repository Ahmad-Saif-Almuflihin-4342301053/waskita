import React, { useState } from 'react';
import { COLORS } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface AnnotatedTextSectionProps {
  audit: AuditExecuteResponse;
}

export const AnnotatedTextSection: React.FC<AnnotatedTextSectionProps> = ({ audit }) => {
  const [activeSentenceSpan, setActiveSentenceSpan] = useState<{
    text: string;
    label: string | null;
    color: string | null;
  } | null>(null);

  return (
    <section style={{ marginBottom: '20px', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: 0,
            color: COLORS.deepSlate,
          }}
        >
          Naskah Teranotasi Stabilo 4-Warna
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
          Klik kalimat untuk melihat rincian diagnostik
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          fontSize: '11.5px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'var(--waskita-mark-yellow-bg, #FEF08A)',
            }}
          />
          <span>Kuning: Klise / Generik</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'var(--waskita-mark-red-bg, #FECACA)',
            }}
          />
          <span>Merah: Redundansi VSM Tinggi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'var(--waskita-mark-blue-bg, #BFDBFE)',
            }}
          />
          <span>Biru: Kosakata Monoton</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'var(--waskita-mark-green-bg, #BBF7D0)',
            }}
          />
          <span>Hijau: Orisinalitas Kuat (Δgain)</span>
        </div>
      </div>

      {/* Naskah Teranotasi Interaktif */}
      <div
        style={{
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--waskita-text-body, #334155)',
          marginBottom: '12px',
          background: 'var(--waskita-surface-white, #FFFFFF)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
        }}
      >
        {audit.annotated_spans && audit.annotated_spans.length > 0 ? (
          audit.annotated_spans.map((span, idx) => {
            if (!span.color) {
              return <span key={idx}>{span.text} </span>;
            }

            let bg = 'transparent';
            let textCol = 'inherit';

            if (span.color === 'yellow') {
              bg = 'var(--waskita-mark-yellow-bg, #FEF08A)';
              textCol = 'var(--waskita-mark-yellow-text, #1E293B)';
            } else if (span.color === 'red') {
              bg = 'var(--waskita-mark-red-bg, #FECACA)';
              textCol = 'var(--waskita-mark-red-text, #1E293B)';
            } else if (span.color === 'blue') {
              bg = 'var(--waskita-mark-blue-bg, #BFDBFE)';
              textCol = 'var(--waskita-mark-blue-text, #1E293B)';
            } else if (span.color === 'green') {
              bg = 'var(--waskita-mark-green-bg, #BBF7D0)';
              textCol = 'var(--waskita-mark-green-text, #1E293B)';
            }

            return (
              <mark
                key={idx}
                onClick={() => setActiveSentenceSpan(span)}
                title={span.label || span.color}
                style={{
                  background: bg,
                  color: textCol,
                  padding: '2px 4px',
                  borderRadius: 3,
                  marginRight: '2px',
                  display: 'inline',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {span.text}{' '}
              </mark>
            );
          })
        ) : (
          <p style={{ margin: 0, fontStyle: 'italic' }}>
            Tidak ada anotasi naskah yang tersedia.
          </p>
        )}
      </div>

      {/* Sprint 3.10: Kartu Informasi Celah Defisit Paten Mandiri (Tanpa Tombol [X]) */}
      {audit.entity_gaps?.deficit && audit.entity_gaps.deficit.length > 0 && (
        <div
          data-testid="deficit-topic-gaps-card"
          style={{
            marginBottom: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '12.5px',
            lineHeight: 1.5,
          }}
          className="dark:bg-slate-800 dark:border-blue-900/40"
        >
          <div
            style={{
              fontSize: '18px',
              lineHeight: 1,
              marginTop: '1px',
              flexShrink: 0,
            }}
          >
            💡
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                color: 'var(--waskita-primary, #1D4ED8)',
                marginBottom: '3px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Saran Celah Topik (SERP)
            </div>
            <div style={{ color: 'var(--waskita-text-body, #334155)' }}>
              Naskah Anda belum mengulas aspek penting yang banyak dibahas kompetitor:{' '}
              <strong style={{ fontWeight: 600, color: 'var(--waskita-text-heading, #0F172A)' }}>
                {audit.entity_gaps.deficit
                  .slice(0, 5)
                  .map((item) => item.term_surface_form || item.term_string)
                  .join(', ')}
              </strong>
              .
            </div>
          </div>
        </div>
      )}

      {/* Popover Detail Kalimat yang Diklik */}
      {activeSentenceSpan && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--waskita-card, #E9DFCA)',
            border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div>
            <strong>Diagnostik Kalimat:</strong>{' '}
            <span style={{ fontWeight: 600 }}>{activeSentenceSpan.label || activeSentenceSpan.color}</span>
            <div
              style={{
                fontStyle: 'italic',
                color: 'var(--waskita-text-muted, #64748B)',
                marginTop: '2px',
              }}
            >
              "{activeSentenceSpan.text}"
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSentenceSpan(null)}
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              color: COLORS.deepSlate,
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
};
