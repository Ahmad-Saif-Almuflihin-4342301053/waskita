import React from 'react';
import {
  COLORS,
  SemiCircleGauge,
  IconCheck,
  IconAlertCircle,
  IconExternalLink,
} from './shared-ui';
import { AuditExecuteResponse } from '../types/waskita';

export interface AuditBlockViewProps {
  audit: AuditExecuteResponse;
  turnLabel?: string;
  isDesktop?: boolean;
}

export const AuditBlockView: React.FC<AuditBlockViewProps> = ({
  audit,
  turnLabel,
  isDesktop = false,
}) => {
  const isReady =
    audit.verdict_status === 'Layak Terbit' ||
    audit.metrics.content_differentiation_score >=
      (audit.thresholds?.min_cds_score ?? 75);

  const cdsScore = Math.round(audit.metrics.content_differentiation_score);
  const thresholdCds = Math.round(audit.thresholds?.min_cds_score ?? 75);

  const formatPercent = (val: number) => {
    return Number.isInteger(val) ? `${val}%` : `${val.toFixed(1)}%`;
  };

  const formatDec = (val: number) => {
    return val.toFixed(2);
  };

  return (
    <div
      style={{
        background: COLORS.softIceBlue,
        borderRadius: '24px',
        border: isReady
          ? '1px solid rgba(16, 185, 129, 0.4)'
          : '1px solid var(--waskita-audit-border, rgba(192, 213, 229, 0.9))',
        padding: isDesktop ? '24px 28px' : '20px 18px',
        boxShadow: isReady
          ? '0 4px 16px rgba(16, 185, 129, 0.08)'
          : '0 4px 16px rgba(30, 41, 59, 0.05)',
        color: COLORS.deepSlate,
        marginBottom: '18px',
      }}
    >
      {/* Header Tag Analisis */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom:
            '1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: isReady
              ? 'var(--waskita-emerald-accent, #059669)'
              : 'var(--waskita-text-muted, rgba(30, 41, 59, 0.7))',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {turnLabel || `Hasil Analisis #${audit.turn_number || 1}`}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))',
          }}
        >
          {new Date(audit.audit_timestamp || Date.now()).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          WIB
        </span>
      </div>

      {/* Degradation Warning Banner if any */}
      {audit.degradation_warning && (
        <div
          style={{
            background: 'var(--waskita-rose-bg, #FEE2E2)',
            border: '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.3))',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12.5px',
            color: 'var(--waskita-rose-text, #991B1B)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IconAlertCircle size={16} color="var(--waskita-rose-accent, #DC2626)" />
          <span>{audit.degradation_warning}</span>
        </div>
      )}

      {/* Seksi 1: Status Kelayakan (CDS Gauge & Verdict) */}
      <section
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '0 0 20px 0',
          borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 700,
                margin: 0,
                color: COLORS.deepSlate,
              }}
            >
              Status Kelayakan
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
                margin: '2px 0 0 0',
              }}
            >
              CDS: {cdsScore}% (Ambang Standar: {thresholdCds}%)
            </p>
          </div>
          <span
            style={{
              background: isReady
                ? 'var(--waskita-emerald-bg, #D1FAE5)'
                : 'var(--waskita-amber-bg, #FEF3C7)',
              color: isReady
                ? 'var(--waskita-emerald-text, #065F46)'
                : 'var(--waskita-amber-text, #B45309)',
              border: isReady
                ? '1px solid var(--waskita-emerald-border, transparent)'
                : '1px solid var(--waskita-amber-border, transparent)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isReady ? (
              <>
                <IconCheck size={14} color="var(--waskita-emerald-accent, #059669)" />
                Siap Terbit
              </>
            ) : (
              'Perlu Revisi'
            )}
          </span>
        </div>

        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <SemiCircleGauge
            score={cdsScore}
            threshold={thresholdCds}
            color={isReady ? '#10B981' : '#D97706'}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            color: isReady
              ? 'var(--waskita-emerald-text, #065F46)'
              : 'var(--waskita-amber-body, #92400E)',
            fontSize: '12.5px',
            lineHeight: 1.5,
            marginTop: '8px',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {isReady ? (
              <IconCheck size={16} color="var(--waskita-emerald-accent, #059669)" />
            ) : (
              <IconAlertCircle size={16} color="var(--waskita-amber-text, #D97706)" />
            )}
          </div>
          <div>
            {isReady ? (
              <>
                Skor <strong>{cdsScore}%</strong> melampaui ambang batas lolos{' '}
                <strong>{thresholdCds}%</strong>. Draf menyajikan variasi informasi unik
                yang kuat tanpa duplikasi kalimat berlebih terhadap Top 3 SERP.
              </>
            ) : (
              <>
                Skor <strong>{cdsScore}%</strong> belum mencapai ambang standar lolos{' '}
                <strong>{thresholdCds}%</strong>. Draf memiliki kemiripan struktur yang
                tinggi atau defisit celah topik terhadap korpus Top 3 SERP.
              </>
            )}
          </div>
        </div>
      </section>

      {/* Seksi 2: Metrik Stilometri & Leksikal */}
      <section
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '20px 0',
          borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: COLORS.deepSlate,
          }}
        >
          Metrik Stilometri &amp; Leksikal
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
            margin: '0 0 14px 0',
          }}
        >
          Analisis matematis kemiripan vektor dan kekayaan kosakata naskah
        </p>

        <div
          style={{
            display: isDesktop ? 'grid' : 'flex',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined,
            flexDirection: isDesktop ? undefined : 'column',
            gap: '10px',
          }}
        >
          {/* Metrik 1: Max VSM Cosine Similarity */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600 }}>Kemiripan Kosinus Maksimal</span>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    audit.metrics.max_cosine_similarity <=
                    (audit.thresholds?.max_cosine_similarity ?? 0.6)
                      ? 'var(--waskita-emerald-accent, #059669)'
                      : 'var(--waskita-rose-accent, #DC2626)',
                }}
              >
                {formatDec(audit.metrics.max_cosine_similarity)}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              }}
            >
              Ambang Batas: ≤ {formatDec(audit.thresholds?.max_cosine_similarity ?? 0.6)}
            </div>
          </div>

          {/* Metrik 2: MATTR Leksikal */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600 }}>Kekayaan Kosakata (MATTR)</span>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    audit.metrics.mattr_score >= (audit.thresholds?.min_mattr ?? 0.55)
                      ? 'var(--waskita-emerald-accent, #059669)'
                      : 'var(--waskita-rose-accent, #DC2626)',
                }}
              >
                {formatDec(audit.metrics.mattr_score)}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              }}
            >
              Ambang Batas: ≥ {formatDec(audit.thresholds?.min_mattr ?? 0.55)}
            </div>
          </div>

          {/* Metrik 3: HKO Overlap */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600 }}>Tumpang-tindih Heading (HKO)</span>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    audit.metrics.hko_percentage <=
                    (audit.thresholds?.max_hko_percentage ?? 40)
                      ? 'var(--waskita-emerald-accent, #059669)'
                      : 'var(--waskita-rose-accent, #DC2626)',
                }}
              >
                {formatPercent(audit.metrics.hko_percentage)}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              }}
            >
              Ambang Batas: ≤ {formatPercent(audit.thresholds?.max_hko_percentage ?? 40)}
            </div>
          </div>

          {/* Metrik 4: TTR Score & Jarak Euclidean */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600 }}>TTR Rasio &amp; Jarak Vektor</span>
              <span style={{ fontWeight: 700 }}>
                {formatDec(audit.metrics.ttr_score)} / {formatDec(audit.metrics.euclidean_distance)}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              }}
            >
              Jumlah kata: {audit.draft_word_count} kata
            </div>
          </div>
        </div>
      </section>

      {/* Seksi 3: Celah Topik & Information Gain */}
      <section
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '20px 0',
          borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: COLORS.deepSlate,
          }}
        >
          Celah Topik &amp; Information Gain (Δ)
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
            margin: '0 0 14px 0',
          }}
        >
          Entitas penting yang hilang (Defisit) dan kebaruan unik yang Anda hadirkan (Gain)
        </p>

        {/* Defisit */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--waskita-rose-text, #991B1B)',
              marginBottom: '6px',
            }}
          >
            Topik Defisit yang Belum Tercakup (Disarankan Ditambahkan):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {audit.entity_gaps.deficit && audit.entity_gaps.deficit.length > 0 ? (
              audit.entity_gaps.deficit.map((gap, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--waskita-mark-blue-bg, #BFDBFE)',
                    color: 'var(--waskita-mark-blue-text, #1E293B)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  + {gap.term_surface_form || gap.term_string}
                </span>
              ))
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--waskita-text-muted, #64748B)',
                }}
              >
                Tidak ada entitas defisit kritis yang tertinggal.
              </span>
            )}
          </div>
        </div>

        {/* Gain */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--waskita-emerald-text, #065F46)',
              marginBottom: '6px',
            }}
          >
            Information Gain / Poin Nilai Tambah Unik (Ditemukan):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {audit.entity_gaps.gain && audit.entity_gaps.gain.length > 0 ? (
              audit.entity_gaps.gain.map((gain, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--waskita-mark-green-bg, #BBF7D0)',
                    color: 'var(--waskita-mark-green-text, #1E293B)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  ★ {gain.term_surface_form || gain.term_string}
                </span>
              ))
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--waskita-text-muted, #64748B)',
                }}
              >
                Belum terdeteksi topik orisinal unik di luar korpus kompetitor.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Seksi 4: Naskah Anotasi Stabilo 4-Warna Resmi Proposal TA Tabel 3.6 */}
      <section
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '20px 0',
          borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: COLORS.deepSlate,
          }}
        >
          Naskah Teranotasi (Diagnostik 4-Warna)
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
            margin: '0 0 10px 0',
          }}
        >
          Evaluasi per-kalimat berbasis kode warna stilometri
        </p>

        {/* Legenda 4 Warna Resmi Proposal TA Tabel 3.6 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '12px',
            fontSize: '11px',
            color: COLORS.deepSlate,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--waskita-mark-yellow-bg, #FEF08A)',
              }}
            />
            <span>Kuning: Klise / Generik / Repetisi HKO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--waskita-mark-red-bg, #FECACA)',
              }}
            />
            <span>Merah: Redundansi VSM (Kemiripan Kosinus Tinggi)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--waskita-mark-blue-bg, #BFDBFE)',
              }}
            />
            <span>Biru: Saran Celah Topik Defisit (Δdeficit)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--waskita-mark-green-bg, #BBF7D0)',
              }}
            />
            <span>Hijau: Orisinalitas Kuat (Δgain)</span>
          </div>
        </div>

        {/* Naskah Teranotasi Interaktif */}
        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--waskita-text-body, #334155)',
            marginBottom: '12px',
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          {audit.annotated_spans && audit.annotated_spans.length > 0 ? (
            audit.annotated_spans.map((span, idx) => {
              if (!span.color) {
                return <span key={idx}>{span.text} </span>;
              }

              let bg = 'transparent';
              let textCol = 'inherit';

              if (span.color === 'yellow') {
                bg = 'var(--waskita-mark-yellow-bg, #FEF08A)';
                textCol = 'var(--waskita-mark-yellow-text, #1E293B)';
              } else if (span.color === 'red') {
                bg = 'var(--waskita-mark-red-bg, #FECACA)';
                textCol = 'var(--waskita-mark-red-text, #1E293B)';
              } else if (span.color === 'blue') {
                bg = 'var(--waskita-mark-blue-bg, #BFDBFE)';
                textCol = 'var(--waskita-mark-blue-text, #1E293B)';
              } else if (span.color === 'green') {
                bg = 'var(--waskita-mark-green-bg, #BBF7D0)';
                textCol = 'var(--waskita-mark-green-text, #1E293B)';
              }

              return (
                <mark
                  key={idx}
                  title={span.label || span.color}
                  style={{
                    background: bg,
                    color: textCol,
                    padding: '1px 4px',
                    borderRadius: 3,
                    marginRight: '2px',
                    display: 'inline',
                  }}
                >
                  {span.text}{' '}
                </mark>
              );
            })
          ) : (
            <p style={{ margin: 0, fontStyle: 'italic' }}>
              Tidak ada anotasi naskah yang tersedia.
            </p>
          )}
        </div>
      </section>

      {/* Seksi 5: Ringkasan Diagnostik & Panduan Remediasi LLM */}
      <section
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '20px 0 0 0',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: COLORS.deepSlate,
          }}
        >
          Rekomendasi Perbaikan &amp; Prompt Remediasi
        </h3>
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

        {audit.remediation_prompt && (
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
              Prompt Siap Pakai untuk Penulisan Ulang (LLM Prompt):
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
              {audit.remediation_prompt}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};
