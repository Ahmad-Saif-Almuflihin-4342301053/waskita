import React from 'react';
import { SemiCircleGauge, IconCheck, IconAlertCircle, IconInfo, IconTarget, COLORS } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface VerdictSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const VerdictSection: React.FC<VerdictSectionProps> = ({ audit, isDesktop = false }) => {
  const isDemo = audit.verdict_status === 'Mode Demo' || audit.serp_source === 'offline_synthetic';
  const isOutOfDomain = audit.verdict_status.includes('Topik Tidak Relevan') || !!audit.metrics.is_out_of_domain;
  const isRedundantSentence = audit.verdict_status.includes('Redundansi Kalimat Tinggi');
  const isReady =
    !isDemo &&
    !isOutOfDomain &&
    !isRedundantSentence &&
    !audit.metrics.is_redundant &&
    !audit.metrics.is_keyword_stuffed &&
    (audit.verdict_status === 'Layak Terbit' || audit.verdict_status === 'Siap Terbit') &&
    audit.metrics.content_differentiation_score >= (audit.thresholds?.min_cds_score ?? 75);

  const cdsScore = Math.round(audit.metrics.content_differentiation_score);
  const thresholdCds = Math.round(audit.thresholds?.min_cds_score ?? 75);

  const getSubScore = (raw: number | undefined, maxVal: number): number => {
    if (raw === undefined || isNaN(raw)) return maxVal;
    if (raw > maxVal) {
      if (maxVal === 35) return Math.round(raw * 0.35 * 10) / 10;
      if (maxVal === 30) return Math.round(raw * 0.30 * 10) / 10;
      if (maxVal === 20) return Math.round(raw * 0.20 * 10) / 10;
      if (maxVal === 15) return Math.round(raw * 0.15 * 10) / 10;
    }
    return Math.min(maxVal, Math.round(raw * 10) / 10);
  };

  const vsmSubScore = getSubScore(audit.metrics.sub_scores?.vsm ?? audit.metrics.sub_scores?.c_vsm, 35);
  const igSubScore = getSubScore(audit.metrics.sub_scores?.ig ?? audit.metrics.sub_scores?.c_ig, 30);
  const mattrSubScore = getSubScore(audit.metrics.sub_scores?.mattr ?? audit.metrics.sub_scores?.c_mattr, 20);
  const hkoSubScore = getSubScore(audit.metrics.sub_scores?.hko ?? audit.metrics.sub_scores?.c_hko, 15);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        background: 'var(--waskita-surface-white, #FFFFFF)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--waskita-border, rgba(28, 25, 23, 0.08))',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ textAlign: isDesktop ? 'left' : 'center', flex: 1 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--waskita-text-muted, #78716C)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '4px',
          }}
        >
          Vonis Kelayakan
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isDesktop ? 'flex-start' : 'center',
            gap: '8px',
            color: isDemo
              ? 'var(--waskita-text, #1C1917)'
              : isReady
              ? '#047857'
              : isOutOfDomain || isRedundantSentence
              ? '#DC2626'
              : '#B45309',
            fontWeight: 700,
            fontSize: '18px',
            marginBottom: '8px',
          }}
        >
          {isDemo ? (
            <IconInfo size={20} />
          ) : isReady ? (
            <IconCheck size={20} color="#047857" />
          ) : (
            <IconAlertCircle size={20} />
          )}
          <span>{isDemo ? 'Mode Demo' : audit.verdict_status}</span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            lineHeight: 1.5,
            color: 'var(--waskita-text-body, #334155)',
          }}
        >
          {isDemo
            ? 'Hasil analisis dihitung menggunakan data sintetis / korpus uji lokal offline (bukan hasil Google SERP langsung). Vonis kelayakan publikasi dinonaktifkan dalam mode ini.'
            : isOutOfDomain
            ? 'Topik naskah terdeteksi tidak relevan dengan kueri audit target sesi ini. Mulai sesi analisis baru jika membahas topik yang berbeda.'
            : isRedundantSentence
            ? 'Draf memiliki kemiripan kalimat langsung yang signifikan dengan artikel kompetitor SERP (≥ 20% kalimat berstabilo merah). Rombak struktur kalimat yang ditandai sebelum diajukan publikasi.'
            : isReady
            ? `Selamat! Skor diferensiasi ${cdsScore}% melampaui ambang batas ${thresholdCds}%. Draf telah memiliki entitas baru bernilai tambah dan aman dari risiko kanibalisasi konten.`
            : `Naskah memperoleh skor ${cdsScore}% (di bawah batas ${thresholdCds}%). Diperlukan penguatan informasi unik dan reduksi kalimat generik sebelum diterbitkan.`}
        </p>

        {/* Bar Telemetri Konsensus Pasar & Veto Plagiasi (Sprint 4.4 White-Box) */}
        {!isDemo && (
          <>
            {isRedundantSentence ? (
              <div
                style={{
                  marginTop: '10px',
                  padding: '6px 0 6px 12px',
                  borderLeft: '3px solid #DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--waskita-rose-text, #DC2626)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '6px' }}>
                  <IconAlertCircle size={14} color="#DC2626" />
                </span>
                <span>
                  <strong>Veto Redundansi Aktif:</strong> Rombak kalimat berstabilo merah sebagai syarat mutlak sebelum mengejar diferensiasi.
                </span>
              </div>
            ) : (
              (audit.metrics?.consensus_target_count || 0) > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '6px 0 6px 12px',
                    borderLeft: '3px solid #0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--waskita-text-body, #44403C)',
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {(audit.metrics.consensus_matched_count ?? 0) >= (audit.metrics.consensus_target_count ?? 20) ? (
                      <span style={{ color: '#047857' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '5px' }}>
                          <IconCheck size={14} color="#047857" />
                        </span>
                        <strong>Konsensus Pasar Penuh:</strong> Naskah Anda mencakup{' '}
                        <strong>{audit.metrics.consensus_matched_count} dari {audit.metrics.consensus_total_count || audit.consensus_entities?.length || 25} entitas</strong> (Target 80% terpenuhi).
                      </span>
                    ) : (
                      <span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '5px' }}>
                          <IconTarget size={14} color="#B45309" />
                        </span>
                        <strong>Progres Konsensus Pasar:</strong> Mencakup{' '}
                        <strong>{audit.metrics.consensus_matched_count ?? 0} dari {audit.metrics.consensus_total_count || audit.consensus_entities?.length || 25} entitas</strong> (Target: {audit.metrics.consensus_target_count} entitas).
                        <span style={{ color: '#047857', marginLeft: '4px' }}>
                          (Tambahkan {(audit.metrics.consensus_target_count ?? 20) - (audit.metrics.consensus_matched_count ?? 0)} entitas prioritas untuk skor IG maksimal)
                        </span>
                      </span>
                    )}
                  </span>
                </div>
              )
            )}
          </>
        )}

        {/* Sub-Skor White-Box (Clean Editorial Metadata - No Pill Slop) */}
        {!isDemo && audit.metrics?.sub_scores && Object.keys(audit.metrics.sub_scores).length > 0 && (
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              fontSize: '11.5px',
              color: 'var(--waskita-text-muted, #78716C)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--waskita-text, #1C1917)' }}>Komponen:</span>
            <span>VSM <strong style={{ color: 'var(--waskita-text, #1C1917)' }}>{vsmSubScore}</strong>/35</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>IG <strong style={{ color: 'var(--waskita-text, #1C1917)' }}>{igSubScore}</strong>/30</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>MATTR <strong style={{ color: 'var(--waskita-text, #1C1917)' }}>{mattrSubScore}</strong>/20</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>HKO <strong style={{ color: 'var(--waskita-text, #1C1917)' }}>{hkoSubScore}</strong>/15</span>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {isDemo ? (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--waskita-surface-subtle, #F5F5F4)',
              border: '1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.2))',
              textAlign: 'center',
              maxWidth: '180px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--waskita-text-muted, #64748B)' }}>
              Metrik Relatif
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--waskita-text, #1E293B)', margin: '4px 0' }}>
              {cdsScore}%
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-muted, #64748B)' }}>
              (Korpus Sintetis)
            </div>
          </div>
        ) : (
          <SemiCircleGauge
            score={cdsScore}
            threshold={thresholdCds}
            isOutOfDomain={isOutOfDomain}
            color={isRedundantSentence ? '#DC2626' : undefined}
          />
        )}
      </div>
    </section>
  );
};
