import React from 'react';
import { COLORS } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface EntityGapsSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const EntityGapsSection: React.FC<EntityGapsSectionProps> = ({ audit, isDesktop = false }) => {
  return (
    <section style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 700,
          margin: '0 0 12px 0',
          color: COLORS.deepSlate,
        }}
      >
        Matriks Celah Informasi (Information Gain)
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: '12px',
        }}
      >
        {/* Card Defisit */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--waskita-rose-text, #991B1B)',
              marginBottom: '4px',
            }}
          >
            Entitas Defisit (Harus Ditambahkan)
          </div>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              margin: '0 0 8px 0',
            }}
          >
            Entitas penting kompetitor SERP yang absen di naskah Anda:
          </p>

          {audit.entity_gaps.deficit && audit.entity_gaps.deficit.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {audit.entity_gaps.deficit.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--waskita-rose-bg, #FEE2E2)',
                    color: 'var(--waskita-rose-text, #991B1B)',
                    border: '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.2))',
                    fontSize: '11.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  + {item.term_surface_form} ({item.competitor_consensus_count} SERP)
                </span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '11.5px', color: '#059669', fontStyle: 'italic' }}>
              ✓ Cakupan topik lengkap, tidak ditemukan celah defisit.
            </span>
          )}
        </div>

        {/* Card Gain */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--waskita-emerald-text, #065F46)',
              marginBottom: '4px',
            }}
          >
            Information Gain (Nilai Tambah Baru)
          </div>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              margin: '0 0 8px 0',
            }}
          >
            Entitas pembeda unik yang tidak dimiliki kompetitor:
          </p>

          {audit.entity_gaps.gain && audit.entity_gaps.gain.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {audit.entity_gaps.gain.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--waskita-emerald-bg, #D1FAE5)',
                    color: 'var(--waskita-emerald-text, #065F46)',
                    border: '1px solid var(--waskita-emerald-border, rgba(16, 185, 129, 0.25))',
                    fontSize: '11.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  ★ {item.term_surface_form}
                </span>
              ))}
            </div>
          ) : (
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--waskita-text-muted, #64748B)',
                fontStyle: 'italic',
              }}
            >
              Belum ada entitas pembeda unik baru.
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
