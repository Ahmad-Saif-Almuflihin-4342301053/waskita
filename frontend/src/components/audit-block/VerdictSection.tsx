import React from 'react';
import { SemiCircleGauge, IconCheck, IconAlertCircle, IconInfo } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface VerdictSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const VerdictSection: React.FC<VerdictSectionProps> = ({ audit, isDesktop = false }) => {
  const isDemo = audit.verdict_status === 'Mode Demo' || audit.serp_source === 'offline_synthetic';
  const isOutOfDomain = audit.verdict_status.includes('Topik Tidak Relevan') || !!audit.metrics.is_out_of_domain;
  const isReady =
    !isDemo &&
    !isOutOfDomain &&
    !audit.metrics.is_redundant &&
    !audit.metrics.is_keyword_stuffed &&
    (audit.verdict_status === 'Layak Terbit' || audit.verdict_status === 'Siap Terbit') &&
    audit.metrics.content_differentiation_score >= (audit.thresholds?.min_cds_score ?? 75);

  const cdsScore = Math.round(audit.metrics.content_differentiation_score);
  const thresholdCds = Math.round(audit.thresholds?.min_cds_score ?? 75);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        background: 'var(--waskita-surface-white, #FFFFFF)',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
      }}
    >
      <div style={{ textAlign: isDesktop ? 'left' : 'center', flex: 1 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            marginBottom: '4px',
          }}
        >
          Vonis Kelayakan Pra-Publikasi
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: isDemo
              ? 'var(--waskita-card, #E9DFCA)'
              : isReady
              ? 'var(--waskita-emerald-bg, #D1FAE5)'
              : isOutOfDomain
              ? 'var(--waskita-rose-bg, #FEE2E2)'
              : 'var(--waskita-amber-bg, #FEF3C7)',
            color: isDemo
              ? 'var(--waskita-text, #1E293B)'
              : isReady
              ? 'var(--waskita-emerald-text, #065F46)'
              : isOutOfDomain
              ? 'var(--waskita-rose-accent, #DC2626)'
              : 'var(--waskita-amber-text, #B45309)',
            fontWeight: 800,
            fontSize: '16px',
            marginBottom: '10px',
          }}
        >
          {isDemo ? (
            <IconInfo size={18} />
          ) : isReady ? (
            <IconCheck size={18} />
          ) : (
            <IconAlertCircle size={18} />
          )}
          <span>{isDemo ? 'Mode Demo' : audit.verdict_status}</span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            lineHeight: 1.5,
            color: 'var(--waskita-text-body, #334155)',
          }}
        >
          {isDemo
            ? 'Hasil analisis dihitung menggunakan data sintetis / korpus uji lokal offline (bukan hasil Google SERP langsung). Vonis kelayakan publikasi dinonaktifkan dalam mode ini.'
            : isReady
            ? `Selamat! Skor diferensiasi ${cdsScore}% melampaui ambang batas ${thresholdCds}%. Draf telah memiliki entitas baru bernilai tambah dan aman dari risiko kanibalisasi konten.`
            : `Naskah memperoleh skor ${cdsScore}% (di bawah batas ${thresholdCds}%). Diperlukan penguatan informasi unik dan reduksi kalimat generik sebelum diterbitkan.`}
        </p>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {isDemo ? (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--waskita-bg, #F7F4EB)',
              border: '1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.2))',
              textAlign: 'center',
              maxWidth: '180px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--waskita-text-muted, #64748B)' }}>
              Metrik Relatif
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--waskita-text, #1E293B)', margin: '4px 0' }}>
              {cdsScore}%
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-muted, #64748B)' }}>
              (Korpus Sintetis)
            </div>
          </div>
        ) : (
          <SemiCircleGauge
            score={cdsScore}
            threshold={thresholdCds}
            isOutOfDomain={isOutOfDomain}
          />
        )}
      </div>
    </section>
  );
};
