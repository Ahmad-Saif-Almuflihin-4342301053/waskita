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
    audit.verdict_status.includes('Topik Tidak Relevan') ||
    !!audit.metrics?.is_out_of_domain ||
    !!audit.topic_shift_detected;

  useEffect(() => {
    if (!isNewArrival || revealStage >= 4 || isTopicShift) return;
    const timer = setTimeout(() => {
      setRevealStage((prev) => Math.min(prev + 1, 4));
    }, 450);
    return () => clearTimeout(timer);
  }, [revealStage, isNewArrival, isTopicShift]);

  useEffect(() => {
    if (revealStage >= 4 || isTopicShift) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '.' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [revealStage, isTopicShift]);

  // Sprint 3.5: Short-circuit render saat terdeteksi Out-of-Domain / Pergantian Topik
  if (isTopicShift) {
    return (
      <div
        style={{
          background: 'var(--waskita-card, #E9DFCA)',
          borderRadius: '20px',
          padding: isDesktop ? '24px' : '16px',
          marginBottom: '24px',
          border: '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.3))',
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

        {/* Topic Shift Blocker Card (Sprint 3.5) */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            borderRadius: '16px',
            padding: isDesktop ? '28px 24px' : '20px 16px',
            border: '1.5px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.35))',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--waskita-rose-bg, #FEE2E2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'var(--waskita-rose-bg, #FEE2E2)',
                color: 'var(--waskita-rose-text, #991B1B)',
                fontWeight: 800,
                fontSize: '12px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {audit.verdict_status}
            </div>
            <h3
              style={{
                margin: '4px 0 8px 0',
                fontSize: isDesktop ? '18px' : '16px',
                fontWeight: 800,
                color: 'var(--waskita-text, #1E293B)',
              }}
            >
              Analisis Dihentikan: Perbedaan Topik Terdeteksi
            </h3>
            <p
              style={{
                margin: '0 auto',
                maxWidth: '560px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--waskita-text-body, #475569)',
              }}
            >
              Naskah yang Anda kirimkan memiliki irisan semantik sangat rendah (&lt; 5%) terhadap acuan korpus sesi ini{' '}
              {audit.target_query ? (
                <strong>("{audit.target_query}")</strong>
              ) : (
                'ini'
              )}
              . Untuk menjaga akurasi evaluasi dan mencegah rekomendasi keliru, visualisasi 7 metrik dan referensi kompetitor sesi lama disembunyikan. Skor diferensiasi dipangkas maksimal ke 20%.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginTop: '4px',
              width: '100%',
              maxWidth: '420px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const textToTransfer = audit.draft_content || draftContent || '';
                if (onStartNewSessionWithDraft) {
                  onStartNewSessionWithDraft(textToTransfer);
                }
              }}
              style={{
                width: '100%',
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.28)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#B91C1C';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#DC2626';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span>🚀 Mulai Sesi Baru dengan Draf Ini</span>
            </button>
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--waskita-text-muted, #64748B)',
              }}
            >
              Draf naskah dan rekomendasi kata kunci baru akan otomatis disiapkan di sesi baru.
            </span>
          </div>
        </div>
      </div>
    );
  }

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
