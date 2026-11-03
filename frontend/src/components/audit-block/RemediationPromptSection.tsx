import React, { useState, useEffect } from 'react';
import { COLORS, IconCopy } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';
import { useToast } from '../../context/ToastContext';

export interface RemediationPromptSectionProps {
  audit: AuditExecuteResponse;
}

export const RemediationPromptSection: React.FC<RemediationPromptSectionProps> = ({ audit }) => {
  const { showToast } = useToast();
  const [promptCopied, setPromptCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'manual' | 'ai'>('all');

  const isReadyToPublish = audit.verdict_status === 'Siap Terbit' || audit.verdict_status === 'Layak Terbit';
  const cdsScore = Math.round(audit.metrics?.content_differentiation_score ?? 0);

  // Smart Default Tab (Sprint 4.4): Siap Terbit (<100%) -> perfectionist (Micro-Tuning); >=100% -> cms
  const getInitialTab = (): 'cms' | 'perfectionist' => {
    if (isReadyToPublish && cdsScore < 100) return 'perfectionist';
    return 'cms';
  };

  const [activeTab, setActiveTab] = useState<'cms' | 'perfectionist'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [audit.session_id, isReadyToPublish, cdsScore]);

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
        Langkah taktis bagi penulis mandiri (White-Box) atau generator prompt asisten AI
      </p>

      {/* Selektor Tampilan: Panduan Kurasi Mandiri vs Prompt Generator AI (Sprint 4.4) */}
      <div
        style={{
          display: 'inline-flex',
          background: 'rgba(30, 41, 59, 0.06)',
          padding: '3px',
          borderRadius: '10px',
          marginBottom: '14px',
          gap: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode('all')}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: viewMode === 'all' ? 700 : 500,
            background: viewMode === 'all' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
            border: 'none',
            color: viewMode === 'all' ? COLORS.deepSlate : 'var(--waskita-text-muted, #64748B)',
            cursor: 'pointer',
            boxShadow: viewMode === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          📑 Lengkap
        </button>
        <button
          type="button"
          onClick={() => setViewMode('manual')}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: viewMode === 'manual' ? 700 : 500,
            background: viewMode === 'manual' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
            border: 'none',
            color: viewMode === 'manual' ? '#065F46' : 'var(--waskita-text-muted, #64748B)',
            cursor: 'pointer',
            boxShadow: viewMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          ✍️ Panduan Kurasi Mandiri
        </button>
        <button
          type="button"
          onClick={() => setViewMode('ai')}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: viewMode === 'ai' ? 700 : 500,
            background: viewMode === 'ai' ? 'var(--waskita-surface-white, #FFFFFF)' : 'transparent',
            border: 'none',
            color: viewMode === 'ai' ? '#4F46E5' : 'var(--waskita-text-muted, #64748B)',
            cursor: 'pointer',
            boxShadow: viewMode === 'ai' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          🤖 Prompt Generator AI
        </button>
      </div>

      {/* Bagian 1: Panduan Kurasi Mandiri */}
      {viewMode !== 'ai' && audit.overview_bullets && audit.overview_bullets.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          {viewMode === 'all' && (
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#065F46',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>✍️ Panduan Kurasi Mandiri (White-Box):</span>
            </div>
          )}
          <ul
            style={{
              margin: '0 0 10px 18px',
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
        </div>
      )}

      {/* Bagian 2: Prompt Generator AI */}
      {viewMode !== 'manual' && (
        <div>
          {viewMode === 'all' && (
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#4F46E5',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🤖 Prompt Generator AI (LLM Prompt):</span>
            </div>
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
                  borderColor:
                    activeTab === 'cms'
                      ? 'var(--waskita-emerald-accent, #059669)'
                      : 'var(--waskita-border, rgba(30, 41, 59, 0.15))',
                  background:
                    activeTab === 'cms'
                      ? 'var(--waskita-emerald-bg, #D1FAE5)'
                      : 'var(--waskita-card, #E9DFCA)',
                  color: activeTab === 'cms' ? 'var(--waskita-emerald-text, #065F46)' : COLORS.deepSlate,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Tab 1: Paket Pra-Publikasi CMS &amp; SEO {cdsScore >= 100 ? '(Rekomendasi)' : ''}
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
                  borderColor:
                    activeTab === 'perfectionist'
                      ? 'var(--waskita-amber-accent, #D97706)'
                      : 'var(--waskita-border, rgba(30, 41, 59, 0.15))',
                  background:
                    activeTab === 'perfectionist'
                      ? 'var(--waskita-amber-bg, #FEF3C7)'
                      : 'var(--waskita-card, #E9DFCA)',
                  color: activeTab === 'perfectionist' ? 'var(--waskita-amber-text, #B45309)' : COLORS.deepSlate,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Tab 2: Micro-Tuning Menuju 100% {cdsScore < 100 ? '(Rekomendasi)' : '(Perfeksionis)'}
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
                  ? (activeTab === 'cms'
                      ? 'Prompt Pra-Publikasi CMS & SEO (LLM Prompt):'
                      : 'Prompt Micro-Tuning Kesempurnaan (LLM Prompt):')
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
        </div>
      )}
    </section>
  );
};
