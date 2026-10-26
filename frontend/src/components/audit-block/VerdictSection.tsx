import React from 'react';
import { SemiCircleGauge, IconCheck, IconAlertCircle } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface VerdictSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const VerdictSection: React.FC<VerdictSectionProps> = ({ audit, isDesktop = false }) => {
  const isReady =
    audit.verdict_status === 'Layak Terbit' ||
    audit.metrics.content_differentiation_score >=
      (audit.thresholds?.min_cds_score ?? 75);

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
            background: isReady
              ? 'var(--waskita-emerald-bg, #D1FAE5)'
              : 'var(--waskita-amber-bg, #FEF3C7)',
            color: isReady
              ? 'var(--waskita-emerald-text, #065F46)'
              : 'var(--waskita-amber-text, #B45309)',
            fontWeight: 800,
            fontSize: '16px',
            marginBottom: '10px',
          }}
        >
          {isReady ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
          <span>{audit.verdict_status}</span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            lineHeight: 1.5,
            color: 'var(--waskita-text-body, #334155)',
          }}
        >
          {isReady
            ? `Selamat! Skor diferensiasi ${cdsScore}% melampaui ambang batas ${thresholdCds}%. Draf telah memiliki entitas baru bernilai tambah dan aman dari risiko kanibalisasi konten.`
            : `Naskah memperoleh skor ${cdsScore}% (di bawah batas ${thresholdCds}%). Diperlukan penguatan informasi unik dan reduksi kalimat generik sebelum diterbitkan.`}
        </p>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <SemiCircleGauge score={cdsScore} threshold={thresholdCds} />
      </div>
    </section>
  );
};
