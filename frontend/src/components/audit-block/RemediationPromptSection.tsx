import React, { useState } from 'react';
import { COLORS, IconCopy } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';
import { useToast } from '../../context/ToastContext';

export interface RemediationPromptSectionProps {
  audit: AuditExecuteResponse;
}

export const RemediationPromptSection: React.FC<RemediationPromptSectionProps> = ({ audit }) => {
  const { showToast } = useToast();
  const [promptCopied, setPromptCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cms' | 'perfectionist'>('cms');

  const isReadyToPublish = audit.verdict_status === 'Siap Terbit' || audit.verdict_status === 'Layak Terbit';

  const currentPromptText = isReadyToPublish
    ? (activeTab === 'cms'
        ? (audit.remediation_prompt_cms || audit.remediation_prompt)
        : (audit.remediation_prompt_perfectionist || audit.remediation_prompt))
    : audit.remediation_prompt;

  const handleCopyPrompt = () => {
    if (!currentPromptText) return;
    navigator.clipboard.writeText(currentPromptText);
    setPromptCopied(true);
    showToast({
      type: 'success',
      title: 'Prompt Tersalin ✓',
      message: isReadyToPublish && activeTab === 'perfectionist'
        ? 'Prompt Micro-Tuning (Perfeksionis) berhasil disalin.'
        : 'Prompt remediasi berhasil disalin ke papan klip.',
    });
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <section
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: '10px 0 0 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
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
          Rekomendasi Perbaikan &amp; Prompt Remediasi
        </h3>
        {audit.remediation_prompt && (
          <button
            type="button"
            onClick={handleCopyPrompt}
            style={{
              background: promptCopied ? '#059669' : COLORS.softPeriwinkle,
              color: promptCopied ? '#FFFFFF' : COLORS.deepSlate,
              border: 'none',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <IconCopy size={13} color={promptCopied ? '#FFFFFF' : COLORS.deepSlate} />
            <span>{promptCopied ? 'Tersalin ✓' : 'Salin Prompt'}</span>
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
          margin: '0 0 10px 0',
        }}
      >
        Langkah taktis bagi penulis atau asisten AI untuk memenangkan posisi SERP
      </p>

      {audit.overview_bullets && audit.overview_bullets.length > 0 && (
        <ul
          style={{
            margin: '0 0 14px 18px',
            padding: 0,
            fontSize: '12.5px',
            lineHeight: 1.5,
            color: 'var(--waskita-text-body, #334155)',
          }}
        >
          {audit.overview_bullets.map((bullet, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* Dual Tab Mode untuk Siap Terbit (Sprint 4.2: CMS Pack vs Perfectionist Micro-Tuning) */}
      {isReadyToPublish && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            data-testid="tab-cms-pack"
            onClick={() => setActiveTab('cms')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: activeTab === 'cms' ? 700 : 500,
              border: '1px solid',
              borderColor: activeTab === 'cms' ? 'var(--waskita-emerald-accent, #059669)' : 'var(--waskita-border, rgba(30, 41, 59, 0.15))',
              background: activeTab === 'cms' ? 'var(--waskita-emerald-bg, #D1FAE5)' : 'var(--waskita-card, #E9DFCA)',
              color: activeTab === 'cms' ? 'var(--waskita-emerald-text, #065F46)' : COLORS.deepSlate,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Tab 1: Paket Pra-Publikasi CMS &amp; SEO (Rekomendasi)
          </button>
          <button
            type="button"
            data-testid="tab-perfectionist"
            onClick={() => setActiveTab('perfectionist')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: activeTab === 'perfectionist' ? 700 : 500,
              border: '1px solid',
              borderColor: activeTab === 'perfectionist' ? 'var(--waskita-amber-accent, #D97706)' : 'var(--waskita-border, rgba(30, 41, 59, 0.15))',
              background: activeTab === 'perfectionist' ? 'var(--waskita-amber-bg, #FEF3C7)' : 'var(--waskita-card, #E9DFCA)',
              color: activeTab === 'perfectionist' ? 'var(--waskita-amber-text, #B45309)' : COLORS.deepSlate,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Tab 2: Micro-Tuning Menuju 100% (Perfeksionis)
          </button>
        </div>
      )}

      {currentPromptText && (
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {isReadyToPublish
              ? (activeTab === 'cms' ? 'Prompt Pra-Publikasi CMS & SEO (LLM Prompt):' : 'Prompt Micro-Tuning Kesempurnaan (LLM Prompt):')
              : 'Prompt Siap Pakai untuk Penulisan Ulang (LLM Prompt):'}
          </div>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.45,
              color: COLORS.deepSlate,
            }}
          >
            {currentPromptText}
          </pre>
        </div>
      )}
    </section>
  );
};
