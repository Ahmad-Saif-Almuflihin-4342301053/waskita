import React, { useState, useEffect } from 'react';
import {
  COLORS,
  IconAlertCircle,
  IconDownload,
} from './shared-ui';
import { AuditExecuteResponse } from '../types/waskita';
import { exportAuditToMarkdown } from '../utils/clientExporter';
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

  // Sprint 3.8: Turn-1 Guard Rail - Turn #1 tidak memiliki sesi acuan sebelumnya sehingga tidak boleh menampilkan Blocker Card
  const isTurn1 = (audit.turn_number || 1) <= 1;
  const isTopicShift =
    !isTurn1 &&
    (audit.verdict_status.includes('Topik Tidak Relevan') ||
      !!audit.metrics?.is_out_of_domain ||
      !!audit.topic_shift_detected);

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

  // Sprint 3.5 & 3.6: Short-circuit render saat terdeteksi Out-of-Domain / Pergantian Topik
  if (isTopicShift) {
    return (
      <article
        style={{
          width: '100%',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--waskita-border, rgba(0, 0, 0, 0.06))',
        }}
      >
        {/* Header Turn */}
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
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--waskita-text-muted, #78716C)',
              }}
            >
              {turnLabel || `Hasil Analisis`}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--waskita-text-subtle, #A8A29E)' }}>
              • {new Date(audit.audit_timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Topic Shift Blocker Card (Sprint 3.6 Editorial Discovery) */}
        <div
          className="dark:bg-stone-900 transition-colors"
          style={{
            background: 'var(--waskita-warm-card, #FAF8F5)',
            borderRadius: '20px',
            padding: isDesktop ? '32px 28px' : '24px 18px',
            border: '1px solid var(--waskita-border-subtle, rgba(120, 113, 108, 0.15))',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: 'center',
            gap: isDesktop ? '32px' : '20px',
          }}
        >
          {/* Visual Discovery */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src="/assets/discovery-light.svg"
              alt="Fokus Baru"
              className="w-36 h-36 md:w-44 md:h-44 object-contain dark:hidden"
            />
            <img
              src="/assets/discovery-dark.svg"
              alt="Fokus Baru"
              className="w-36 h-36 md:w-44 md:h-44 object-contain hidden dark:block"
            />
          </div>

          {/* Editorial Content & CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isDesktop ? 'flex-start' : 'center',
              textAlign: isDesktop ? 'left' : 'center',
              flex: 1,
              gap: '10px',
            }}
          >
            {/* Badge Pill */}
            <div
              className="bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              FOKUS BARU
            </div>

            {/* Headline */}
            <h3
              className="text-stone-900 dark:text-stone-100 font-serif"
              style={{
                margin: '2px 0 0 0',
                fontSize: isDesktop ? '20px' : '18px',
                fontWeight: 700,
                letterSpacing: '-0.2px',
              }}
            >
              Fokus Berbeda Terdeteksi
            </h3>

            {/* Body Copy */}
            <p
              className="text-stone-600 dark:text-stone-400"
              style={{
                margin: '0',
                maxWidth: '560px',
                fontSize: '13.5px',
                lineHeight: 1.6,
              }}
            >
              Draf naskah ini mengangkat pokok bahasan baru di luar artikel acuan sesi ini. Buka sesi baru agar pemetaan kompetitor dan celah informasi dapat dinilai secara akurat.
            </p>

            {/* Action Group */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isDesktop ? 'flex-start' : 'center',
                gap: '8px',
                marginTop: '8px',
                width: isDesktop ? 'auto' : '100%',
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
                className="bg-[#292524] hover:bg-[#1C1917] dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900"
                style={{
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease',
                  width: isDesktop ? 'auto' : '100%',
                }}
              >
                <span>Lanjutkan di Sesi Baru</span>
              </button>
              <span
                className="text-stone-500 dark:text-stone-400"
                style={{
                  fontSize: '11.5px',
                }}
              >
                Draf naskah akan otomatis dimuat di lembar analisis baru.
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      style={{
        width: '100%',
        marginBottom: '36px',
        paddingBottom: '28px',
        borderBottom: '1px solid var(--waskita-border, rgba(0, 0, 0, 0.06))',
      }}
    >
      {/* Header Turn (Clean Minimalist Editorial) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--waskita-text-muted, #78716C)',
              letterSpacing: '-0.01em',
            }}
          >
            {turnLabel || `Hasil Analisis`}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--waskita-text-subtle, #A8A29E)' }}>
            • {new Date(audit.audit_timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Quick Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => exportAuditToMarkdown(audit, draftContent)}
            title="Ekspor Laporan Markdown (.MD)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))',
              background: 'var(--waskita-surface-white, #FFFFFF)',
              color: 'var(--waskita-text-body, #334155)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <IconDownload size={12} color="currentColor" />
            <span>MD</span>
          </button>
        </div>
      </div>

      {/* Degradation Warning Banner (FR-13) */}
      {audit.degradation_warning && (
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
            borderLeft: '3px solid #DC2626',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#991B1B',
            fontWeight: 600,
          }}
        >
          <IconAlertCircle size={18} color="#DC2626" />
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
    </article>
  );
};
