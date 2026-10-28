import React, { useState, useRef, useEffect } from 'react';
import { AuditBlockView } from './AuditBlockView';
import { LiveStepper } from './LiveStepper';
import { COLORS, IconChevronDown, IconChevronRight, IconSearch } from './shared-ui';
import { AuditExecuteResponse } from '../types/waskita';

export interface MultiTurnAuditStreamViewProps {
  isDesktop?: boolean;
  historyTurns: Array<{
    draftTitle?: string;
    draftContent?: string;
    auditResult: AuditExecuteResponse;
  }>;
  isLoading?: boolean;
  currentStep?: number;
  statusMessage?: string;
  isStepperFadingOut?: boolean;
  onSelectForPrint?: (audit: AuditExecuteResponse) => void;
  onStartNewSessionWithDraft?: (draft: string) => void;
}

export const MultiTurnAuditStreamView: React.FC<MultiTurnAuditStreamViewProps> = ({
  isDesktop = false,
  historyTurns,
  isLoading = false,
  currentStep = 1,
  statusMessage,
  isStepperFadingOut = false,
  onSelectForPrint,
  onStartNewSessionWithDraft,
}) => {
  const [expandedDrafts, setExpandedDrafts] = useState<Record<number, boolean>>({});
  const bottomLoadingRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke indikator proses saat Turn >= 2 (Sprint 3.3)
  useEffect(() => {
    if (isLoading && historyTurns.length > 0) {
      const timer = setTimeout(() => {
        bottomLoadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isLoading, historyTurns.length]);

  const toggleDraft = (idx: number) => {
    setExpandedDrafts((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        width: '100%',
        maxWidth: isDesktop ? '840px' : '100%',
        margin: '0 auto',
        padding: isDesktop ? '24px 24px 140px 24px' : '16px 14px 120px 14px',
        boxSizing: 'border-box',
      }}
    >
      {historyTurns.map((turn, index) => {
        const turnNum = index + 1;
        const isLatest = index === historyTurns.length - 1;
        const turnLabel = `Hasil Analisis #${turnNum}${isLatest && historyTurns.length > 1 ? ' (Terbaru)' : ''}`;
        const targetQ = turn.auditResult.target_query || '';
        const wordCount =
          turn.auditResult.draft_word_count ||
          (turn.draftContent ? turn.draftContent.trim().split(/\s+/).length : 0);
        const isExpanded = !!expandedDrafts[index];

        return (
          <React.Fragment key={turn.auditResult.session_id || index}>
            {/* User Input Bubble */}
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: isDesktop ? '75%' : '92%',
                background: COLORS.warmSand,
                color: COLORS.deepSlate,
                borderRadius: '18px 18px 4px 18px',
                padding: '12px 16px',
                fontSize: '13px',
                lineHeight: 1.45,
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
                boxShadow: '0 2px 8px rgba(30, 41, 59, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Header Bubble: Label Turn & Title */}
              <div>
                <span style={{ fontWeight: 700 }}>
                  {index === 0 ? 'Draf Masukan #1:' : `Revisi Pengguna #${turnNum}:`}
                </span>{' '}
                <span style={{ fontWeight: 600 }}>
                  {turn.draftTitle || turn.auditResult.draft_title || 'Naskah Draf Artikel'}
                </span>
              </div>

              {/* Badges: Kueri Target & Jumlah Kata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                {targetQ && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(30, 41, 59, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.8))',
                    }}
                  >
                    <IconSearch size={11} color="currentColor" />
                    <span>"{targetQ}"</span>
                  </span>
                )}
                {wordCount > 0 && (
                  <span
                    style={{
                      background: 'var(--waskita-emerald-bg, rgba(16, 185, 129, 0.12))',
                      color: 'var(--waskita-emerald-accent, #059669)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {wordCount} kata
                  </span>
                )}
              </div>

              {/* Accordion Lihat Naskah Asli */}
              {turn.draftContent && (
                <div style={{ marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => toggleDraft(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.7))',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isExpanded ? (
                      <IconChevronDown size={13} color="currentColor" />
                    ) : (
                      <IconChevronRight size={13} color="currentColor" />
                    )}
                    <span>{isExpanded ? 'Tutup Naskah' : 'Lihat Naskah Asli ▾'}</span>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '8px',
                        background: 'var(--waskita-surface-white, #FFFFFF)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: 'var(--waskita-text-body, #334155)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
                      }}
                    >
                      {turn.draftContent}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audit Result Block with Progressive Reveal */}
            <AuditBlockView
              audit={turn.auditResult}
              turnLabel={turnLabel}
              isDesktop={isDesktop}
              draftContent={turn.draftContent}
              isNewArrival={isLatest}
              onSelectForPrint={onSelectForPrint}
              onStartNewSessionWithDraft={onStartNewSessionWithDraft}
            />
          </React.Fragment>
        );
      })}

      {/* Live Stepper Loading Indicator */}
      {isLoading && (
        <div
          ref={bottomLoadingRef}
          id="turn-loading-indicator"
          style={{
            marginTop: '8px',
            scrollMarginBottom: isDesktop ? '140px' : '160px',
          }}
        >
          <LiveStepper
            currentStep={currentStep}
            statusMessage={statusMessage}
            isFadingOut={isStepperFadingOut}
          />
        </div>
      )}
    </div>
  );
};
