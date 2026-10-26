import React from 'react';
import { COLORS } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface AuditMetricsGridProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const AuditMetricsGrid: React.FC<AuditMetricsGridProps> = ({ audit, isDesktop = false }) => {
  const formatPercent = (val: number) => {
    return Number.isInteger(val) ? `${val}%` : `${val.toFixed(1)}%`;
  };

  const formatDec = (val: number) => {
    return val.toFixed(2);
  };

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
        7 Metrik Evaluasi White-Box IR &amp; Stilometri
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {/* Card 1: Max Cosine */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            Max Cosine Sim
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
            {formatPercent(audit.metrics.max_cosine_similarity * 100)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
            Target: ≤ {formatPercent(audit.thresholds.max_cosine_similarity * 100)}
          </div>
        </div>

        {/* Card 2: MATTR L=50 */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            MATTR (L=50)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
            {formatPercent(audit.metrics.mattr_score * 100)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
            Target: ≥ {formatPercent(audit.thresholds.min_mattr * 100)}
          </div>
        </div>

        {/* Card 3: HKO Overlap */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            HKO Overlap
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
            {formatPercent(audit.metrics.hko_percentage)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
            Target: ≤ {formatPercent(audit.thresholds.max_hko_percentage)}
          </div>
        </div>

        {/* Card 4: Euclidean Dist */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            Euclidean Dist
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
            {formatDec(audit.metrics.euclidean_distance)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
            Spasial TF-IDF
          </div>
        </div>
      </div>
    </section>
  );
};
