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
  onStartNewSessionWithDraft?: (draft: string) => void;
}

export const AuditBlockView: React.FC<AuditBlockViewProps> = ({
  audit,
  turnLabel,
  isDesktop = false,
  draftContent,
  isNewArrival = false,
  onStartNewSessionWithDraft,
}) => {
  const [revealStage, setRevealStage] = useState<number>(isNewArrival ? 1 : 4);
  const [dots, setDots] = useState('.');

  const isTopicShift =
    audit.verdict_status === 'Perlu Revisi - Topik Tidak Relevan' ||
    audit.metrics?.is_out_of_domain ||
    audit.topic_shift_detected;

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

      {/* Topic Shift / Out-of-Domain Warning Banner (Sprint 3.4) */}
      {isTopicShift && (
        <div
          style={{
            background: 'var(--waskita-rose-bg, #FEE2E2)',
            border: '1.5px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.4))',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '18px', lineHeight: 1.2 }}>⚠️</span>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--waskita-rose-text, #991B1B)',
                }}
              >
                Topik Revisi Tidak Sesuai dengan Sesi Ini
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: 'var(--waskita-rose-text, #991B1B)',
                  opacity: 0.9,
                  marginTop: '2px',
                  lineHeight: 1.4,
                }}
              >
                Draf ini memiliki relevansi sangat rendah (&lt; 5%) terhadap kompetitor sesi. Skor CDS dipangkas ke batas revisi. Disarankan membuka sesi baru.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const textToTransfer = audit.draft_content || draftContent || '';
              if (onStartNewSessionWithDraft) {
                onStartNewSessionWithDraft(textToTransfer);
              }
            }}
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              alignSelf: isDesktop ? 'center' : 'stretch',
              textAlign: 'center',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#DC2626';
            }}
          >
            Mulai Sesi Baru dengan Draf Ini →
          </button>
        </div>
      )}

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
