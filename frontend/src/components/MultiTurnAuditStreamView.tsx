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

        const rawTitle = turn.draftTitle || turn.auditResult.draft_title || 'Naskah Draf Artikel';
        const displayTitle = rawTitle.replace(/^Draf:\s*/i, '').replace(/^Draf Masukan:\s*/i, '');

        return (
          <React.Fragment key={turn.auditResult.session_id || index}>
            {/* User Input Bubble (Clean Editorial Standard) */}
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: isDesktop ? '78%' : '94%',
                background: 'var(--waskita-surface, #FFFFFF)',
                color: 'var(--waskita-text, #1C1917)',
                borderRadius: '16px 16px 4px 16px',
                padding: '14px 16px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: '1px solid var(--waskita-border, rgba(28, 25, 23, 0.08))',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Clean Title */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--waskita-text-muted, #78716C)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {index === 0 ? 'Draf Awal' : `Revisi #${turnNum}`}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '13.5px',
                    color: 'var(--waskita-text, #1C1917)',
                  }}
                >
                  {displayTitle}
                </span>
              </div>

              {/* Meta: Kueri Target & Jumlah Kata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontSize: '11.5px',
                  color: 'var(--waskita-text-muted, #78716C)',
                }}
              >
                {targetQ && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--waskita-surface-subtle, #F5F5F4)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 500,
                      color: 'var(--waskita-text-body, #44403C)',
                      border: '1px solid var(--waskita-border-subtle, rgba(0, 0, 0, 0.05))',
                    }}
                  >
                    <IconSearch size={11} color="currentColor" />
                    <span>"{targetQ}"</span>
                  </span>
                )}
                {wordCount > 0 && (
                  <span
                    style={{
                      fontWeight: 500,
                      color: 'var(--waskita-text-muted, #78716C)',
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
