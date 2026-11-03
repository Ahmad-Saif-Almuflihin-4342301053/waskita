import React from 'react';
import { SemiCircleGauge, IconCheck, IconAlertCircle, IconInfo, IconTarget, IconSearch, COLORS } from '../shared-ui';
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
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
      }}
    >
      <div style={{ textAlign: isDesktop ? 'left' : 'center', flex: 1 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            marginBottom: '4px',
          }}
        >
          Vonis Kelayakan Pra-Publikasi
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: isDemo
              ? 'var(--waskita-card, #E9DFCA)'
              : isReady
              ? 'var(--waskita-emerald-bg, #D1FAE5)'
              : isOutOfDomain || isRedundantSentence
              ? 'var(--waskita-rose-bg, #FEE2E2)'
              : 'var(--waskita-amber-bg, #FEF3C7)',
            color: isDemo
              ? 'var(--waskita-text, #1E293B)'
              : isReady
              ? 'var(--waskita-emerald-text, #065F46)'
              : isOutOfDomain || isRedundantSentence
              ? 'var(--waskita-rose-accent, #DC2626)'
              : 'var(--waskita-amber-text, #B45309)',
            fontWeight: 800,
            fontSize: '16px',
            marginBottom: '10px',
          }}
        >
          {isDemo ? (
            <IconInfo size={18} />
          ) : isReady ? (
            <IconCheck size={18} />
          ) : (
            <IconAlertCircle size={18} />
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
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
                  <IconAlertCircle size={16} color="#DC2626" />
                  <span style={{ color: '#991B1B' }}>
                    <strong>Veto Redundansi Aktif:</strong> Naskah memiliki kemiripan kalimat langsung yang tinggi dengan artikel kompetitor (stabilo merah). Rombak kalimat merah sebagai syarat utama sebelum mengejar diferensiasi.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('consensus-serp-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: COLORS.deepSlate,
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <IconSearch size={12} color="#FFFFFF" />
                  <span>Lihat {audit.metrics?.consensus_total_count || audit.consensus_entities?.length || 25} Entitas &amp; Klausul SERP ↓</span>
                </button>
              </div>
            ) : (
              (audit.metrics?.consensus_target_count || 0) > 0 && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ flex: 1, minWidth: '240px' }}>
                    {(audit.metrics.consensus_matched_count ?? 0) >= (audit.metrics.consensus_target_count ?? 20) ? (
                      <span style={{ color: '#065F46' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '5px' }}>
                          <IconCheck size={14} color="#065F46" />
                        </span>
                        <strong>Konsensus Pasar Penuh:</strong> Naskah Anda mencakup{' '}
                        <strong>{audit.metrics.consensus_matched_count} dari {audit.metrics.consensus_total_count || audit.consensus_entities?.length || 25} entitas</strong> (Target 80% / {audit.metrics.consensus_target_count} entitas terpenuhi 100%).
                      </span>
                    ) : (
                      <span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '5px' }}>
                          <IconTarget size={14} color="#DC2626" />
                        </span>
                        <strong>Progres Konsensus Pasar:</strong> Mencakup{' '}
                        <strong>{audit.metrics.consensus_matched_count ?? 0} dari {audit.metrics.consensus_total_count || audit.consensus_entities?.length || 25} entitas</strong> (Target saturasi: {audit.metrics.consensus_target_count} entitas).
                        <span style={{ color: '#065F46', marginLeft: '4px' }}>
                          (Cukup tambahkan {(audit.metrics.consensus_target_count ?? 20) - (audit.metrics.consensus_matched_count ?? 0)} kata kunci prioritas untuk meraih skor Information Gain maksimal)
                        </span>
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('consensus-serp-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: COLORS.deepSlate,
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <IconSearch size={12} color="#FFFFFF" />
                    <span>Lihat {audit.metrics?.consensus_total_count || audit.consensus_entities?.length || 25} Entitas &amp; Klausul SERP ↓</span>
                  </button>
                </div>
              )
            )}
          </>
        )}

        {/* Pil Sub-Skor White-Box (Sprint 4.4) */}
        {!isDemo && audit.metrics?.sub_scores && Object.keys(audit.metrics.sub_scores).length > 0 && (
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--waskita-text-muted, #64748B)',
                marginRight: '2px',
              }}
            >
              Komponen Skor:
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.06)',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
                color: 'var(--waskita-text-body, #334155)',
              }}
              title="Komponen VSM Anti-Jiplak terhadap kemiripan kosinus kompetitor (Maks 35)"
            >
              VSM (Anti-Jiplak): <strong>{vsmSubScore}</strong>/35
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.2)',
                color: 'var(--waskita-emerald-text, #065F46)',
              }}
              title="Komponen Information Gain atas cakupan konsensus topik SERP (Maks 30)"
            >
              IG (Topik SERP): <strong>{igSubScore}</strong>/30
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.06)',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
                color: 'var(--waskita-text-body, #334155)',
              }}
              title="Moving-Average Type-Token Ratio / Variasi kosakata unik (Maks 20)"
            >
              MATTR (Kekayaan Diksi): <strong>{mattrSubScore}</strong>/20
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.06)',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
                color: 'var(--waskita-text-body, #334155)',
              }}
              title="Heading Keyword Overlap / Bebas spam kata kunci pada judul/heading (Maks 15)"
            >
              HKO (Anti-Spam Judul): <strong>{hkoSubScore}</strong>/15
            </span>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {isDemo ? (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--waskita-bg, #F7F4EB)',
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
          />
        )}
      </div>
    </section>
  );
};
