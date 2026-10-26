import React from 'react';
import {
  COLORS,
  IconAlertCircle,
  IconFileText,
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
  onSelectForPrint?: (audit: AuditExecuteResponse) => void;
}

export const AuditBlockView: React.FC<AuditBlockViewProps> = ({
  audit,
  turnLabel,
  isDesktop = false,
  onSelectForPrint,
}) => {
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
      {/* Header Turn & Print Action */}
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

        {onSelectForPrint && (
          <button
            type="button"
            onClick={() => onSelectForPrint(audit)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Cetak Ringkasan Eksekutif A4"
          >
            <IconFileText size={15} color={COLORS.deepSlate} />
            <span>Cetak A4</span>
          </button>
        )}
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

      {/* 1. Skor CDS & Vonis Status */}
      <VerdictSection audit={audit} isDesktop={isDesktop} />

      {/* 2. 7 Metrik Kuantitatif White-Box IR & Stilometri */}
      <AuditMetricsGrid audit={audit} isDesktop={isDesktop} />

      {/* 3. Matriks Celah Informasi (Information Gain & Defisit) */}
      <EntityGapsSection audit={audit} isDesktop={isDesktop} />

      {/* 4. Naskah Teranotasi Stabilo 4-Warna Interaktif */}
      <AnnotatedTextSection audit={audit} />

      {/* 5. Rekomendasi Perbaikan & Prompt Remediasi LLM */}
      <RemediationPromptSection audit={audit} />

      {/* 6. Referensi SERP · Top 3 Google Competitor */}
      <SerpCompetitorsSection audit={audit} isDesktop={isDesktop} />
    </div>
  );
};
