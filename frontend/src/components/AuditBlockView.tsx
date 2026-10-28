import React, { useState, useEffect } from 'react';
import {
  COLORS,
  IconAlertCircle,
} from './shared-ui';
import { AuditExecuteResponse } from '../types/waskita';
import { VerdictSection } from './audit-block/VerdictSection';
import { AuditMetricsGrid } from './audit-block/AuditMetricsGrid';
import { EntityGapsSection } from './audit-block/EntityGapsSection';
import { AnnotatedTextSection } from './audit-block/AnnotatedTextSection';
import { RemediationPromptSection } from './audit-block/RemediationPromptSection';
import { SerpCompetitorsSection } from './audit-block/SerpCompetitorsSection';

export interface AuditBlockViewProps {
  audit: AuditExecuteResponse;
  turnLabel?: string;
  isDesktop?: boolean;
  draftContent?: string;
  isNewArrival?: boolean;
  onSelectForPrint?: (audit: AuditExecuteResponse) => void;
}

export const AuditBlockView: React.FC<AuditBlockViewProps> = ({
  audit,
  turnLabel,
  isDesktop = false,
  isNewArrival = false,
}) => {
  const [revealStage, setRevealStage] = useState<number>(isNewArrival ? 1 : 4);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    if (!isNewArrival || revealStage >= 4) return;
    const timer = setTimeout(() => {
      setRevealStage((prev) => Math.min(prev + 1, 4));
    }, 450);
    return () => clearTimeout(timer);
  }, [revealStage, isNewArrival]);

  useEffect(() => {
    if (revealStage >= 4) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '.' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [revealStage]);

  return (
    <div
      style={{
        background: 'var(--waskita-card, #E9DFCA)',
        borderRadius: '20px',
        padding: isDesktop ? '24px' : '16px',
        marginBottom: '24px',
        border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header Turn */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: COLORS.mutedSkyBlue,
              color: COLORS.deepSlate,
            }}
          >
            {turnLabel || `Turn #${audit.turn_number || 1}`}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--waskita-text-muted, #64748B)' }}>
            {new Date(audit.audit_timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Degradation Warning Banner (FR-13) */}
      {audit.degradation_warning && (
        <div
          style={{
            background: 'var(--waskita-rose-bg, #FEE2E2)',
            border: '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.3))',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--waskita-rose-text, #991B1B)',
            fontWeight: 600,
          }}
        >
          <IconAlertCircle size={18} color="var(--waskita-rose-text, #991B1B)" />
          <span>{audit.degradation_warning}</span>
        </div>
      )}

      {/* Tahap 1: Skor CDS, Vonis Status, & 7 Metrik Kuantitatif */}
      <div style={{ transition: 'opacity 0.3s ease', opacity: 1 }}>
        <VerdictSection audit={audit} isDesktop={isDesktop} />
        <AuditMetricsGrid audit={audit} isDesktop={isDesktop} />
      </div>

      {/* Indikator Progresif Tahap 1 -> Tahap 2 */}
      {revealStage < 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
            margin: '12px 0',
            color: 'var(--waskita-text-muted, #64748B)',
            fontSize: '13px',
            fontWeight: 600,
            background: 'rgba(30, 41, 59, 0.04)',
            borderRadius: '12px',
          }}
        >
          <span>Sedang menganalisis {dots}</span>
        </div>
      )}

      {/* Tahap 2: Matriks Celah Informasi (Information Gain & Defisit) */}
      {revealStage >= 2 && (
        <div style={{ transition: 'opacity 0.35s ease', opacity: 1 }}>
          <EntityGapsSection audit={audit} isDesktop={isDesktop} />
        </div>
      )}

      {/* Indikator Progresif Tahap 2 -> Tahap 3 */}
      {revealStage === 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
            margin: '12px 0',
            color: 'var(--waskita-text-muted, #64748B)',
            fontSize: '13px',
            fontWeight: 600,
            background: 'rgba(30, 41, 59, 0.04)',
            borderRadius: '12px',
          }}
        >
          <span>Sedang menganalisis {dots}</span>
        </div>
      )}

      {/* Tahap 3: Naskah Teranotasi Stabilo 4-Warna Interaktif */}
      {revealStage >= 3 && (
        <div style={{ transition: 'opacity 0.35s ease', opacity: 1 }}>
          <AnnotatedTextSection audit={audit} />
        </div>
      )}

      {/* Indikator Progresif Tahap 3 -> Tahap 4 */}
      {revealStage === 3 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
            margin: '12px 0',
            color: 'var(--waskita-text-muted, #64748B)',
            fontSize: '13px',
            fontWeight: 600,
            background: 'rgba(30, 41, 59, 0.04)',
            borderRadius: '12px',
          }}
        >
          <span>Sedang menganalisis {dots}</span>
        </div>
      )}

      {/* Tahap 4: Rekomendasi Perbaikan & Referensi Kompetitor SERP */}
      {revealStage >= 4 && (
        <div style={{ transition: 'opacity 0.35s ease', opacity: 1 }}>
          <RemediationPromptSection audit={audit} />
          <SerpCompetitorsSection audit={audit} isDesktop={isDesktop} />
        </div>
      )}
    </div>
  );
};
