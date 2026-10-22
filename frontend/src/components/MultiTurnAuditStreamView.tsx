import React from 'react';
import { AuditBlockView } from './AuditBlockView';
import { LiveStepper } from './LiveStepper';
import { COLORS } from './shared-ui';
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
}

export const MultiTurnAuditStreamView: React.FC<MultiTurnAuditStreamViewProps> = ({
  isDesktop = false,
  historyTurns,
  isLoading = false,
  currentStep = 1,
  statusMessage,
  isStepperFadingOut = false,
  onSelectForPrint,
}) => {
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

        return (
          <React.Fragment key={turn.auditResult.session_id || index}>
            {/* User Input Bubble */}
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: isDesktop ? '70%' : '88%',
                background: COLORS.warmSand,
                color: COLORS.deepSlate,
                borderRadius: '18px 18px 4px 18px',
                padding: '10px 16px',
                fontSize: '13px',
                lineHeight: 1.45,
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
                boxShadow: '0 2px 8px rgba(30, 41, 59, 0.03)',
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {index === 0 ? 'Draf Masukan #1:' : `Revisi Pengguna #${turnNum}:`}
              </span>{' '}
              {turn.draftTitle || turn.auditResult.draft_title || 'Naskah Draf Artikel'}
            </div>

            {/* Audit Result Block with Client-Side Exporter */}
            <AuditBlockView
              audit={turn.auditResult}
              turnLabel={turnLabel}
              isDesktop={isDesktop}
              draftContent={turn.draftContent}
              onSelectForPrint={onSelectForPrint}
            />
          </React.Fragment>
        );
      })}

      {/* Live Stepper Loading Indicator */}
      {isLoading && (
        <div style={{ marginTop: '8px' }}>
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
