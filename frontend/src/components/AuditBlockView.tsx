import React, { useState } from 'react';
import {
  COLORS,
  SemiCircleGauge,
  IconCheck,
  IconAlertCircle,
  IconDownload,
  IconFileText,
  IconCopy,
} from './shared-ui';
import { AuditExecuteResponse } from '../types/waskita';
import {
  exportAuditToMarkdown,
  exportAuditToCsv,
  exportAuditToJson,
  triggerExecutivePdfPrint,
} from '../utils/clientExporter';
import { useToast } from '../context/ToastContext';

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
  draftContent,
  onSelectForPrint,
}) => {
  const { showToast } = useToast();
  const [activeSentenceSpan, setActiveSentenceSpan] = useState<{
    text: string;
    label: string | null;
    color: string | null;
  } | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

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

  const handleCopyPrompt = () => {
    if (!audit.remediation_prompt) return;
    navigator.clipboard.writeText(audit.remediation_prompt);
    setPromptCopied(true);
    showToast({
      type: 'success',
      title: 'Prompt Tersalin ✓',
      message: 'Prompt remediasi berhasil disalin ke papan klip.',
    });
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handlePrintPdf = () => {
    if (onSelectForPrint) {
      onSelectForPrint(audit);
    }
    setTimeout(() => {
      triggerExecutivePdfPrint();
    }, 100);
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
        position: 'relative',
      }}
    >
      {/* Header Tag Analisis & Client-Side Export Actions Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: isDesktop ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: '8px',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom:
            '1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
        }}
      >
        <div>
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
              marginLeft: '8px',
            }}
          >
            {new Date(audit.audit_timestamp || Date.now()).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            WIB
          </span>
        </div>

        {/* Client-Side Action Bar: PDF, MD, CSV, JSON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePrintPdf}
            title="Cetak Laporan Eksekutif PDF Vektor A4 (Standar PZN)"
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span>🖨️</span>
            <span>Cetak PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportAuditToMarkdown(audit, draftContent)}
            title="Unduh Laporan Format Markdown (.md)"
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <IconDownload size={13} color={COLORS.deepSlate} />
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={() => exportAuditToCsv(audit)}
            title="Unduh Tabel Metrik & Celah Entitas CSV (.csv dengan UTF-8 BOM untuk Excel)"
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <IconDownload size={13} color={COLORS.deepSlate} />
            <span>.CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportAuditToJson(audit)}
            title="Unduh Data Mentah JSON (.json)"
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <IconDownload size={13} color={COLORS.deepSlate} />
            <span>.JSON</span>
          </button>
        </div>
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

      {/* Seksi 1: Skor CDS & Vonis Status */}
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
              background: isReady
                ? 'var(--waskita-emerald-bg, #D1FAE5)'
                : 'var(--waskita-amber-bg, #FEF3C7)',
              color: isReady
                ? 'var(--waskita-emerald-text, #065F46)'
                : 'var(--waskita-amber-text, #B45309)',
              fontWeight: 800,
              fontSize: '16px',
              marginBottom: '10px',
            }}
          >
            {isReady ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
            <span>{audit.verdict_status}</span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: 1.5,
              color: 'var(--waskita-text-body, #334155)',
            }}
          >
            {isReady
              ? `Selamat! Skor diferensiasi ${cdsScore}% melampaui ambang batas ${thresholdCds}%. Draf telah memiliki entitas baru bernilai tambah dan aman dari risiko kanibalisasi konten.`
              : `Naskah memperoleh skor ${cdsScore}% (di bawah batas ${thresholdCds}%). Diperlukan penguatan informasi unik dan reduksi kalimat generik sebelum diterbitkan.`}
          </p>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <SemiCircleGauge score={cdsScore} threshold={thresholdCds} />
        </div>
      </section>

      {/* Seksi 2: 7 Metrik Kuantitatif White-Box IR & Stilometri */}
      <section style={{ marginBottom: '20px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: COLORS.deepSlate,
          }}
        >
          7 Metrik Evaluasi White-Box IR &amp; Stilometri
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: '10px',
          }}
        >
          {/* Card 1: Max Cosine */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
              Max Cosine Sim
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
              {formatPercent(audit.metrics.max_cosine_similarity * 100)}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
              Target: ≤ {formatPercent(audit.thresholds.max_cosine_similarity * 100)}
            </div>
          </div>

          {/* Card 2: MATTR L=50 */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
              MATTR (L=50)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
              {formatPercent(audit.metrics.mattr_score * 100)}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
              Target: ≥ {formatPercent(audit.thresholds.min_mattr * 100)}
            </div>
          </div>

          {/* Card 3: HKO Overlap */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
              HKO Overlap
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
              {formatPercent(audit.metrics.hko_percentage)}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
              Target: ≤ {formatPercent(audit.thresholds.max_hko_percentage)}
            </div>
          </div>

          {/* Card 4: Euclidean Dist */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
              Euclidean Dist
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>
              {formatDec(audit.metrics.euclidean_distance)}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--waskita-text-subtle, #78879E)' }}>
              Spasial TF-IDF
            </div>
          </div>
        </div>
      </section>

      {/* Seksi 3: Matriks Celah Informasi (Information Gain & Defisit) */}
      <section style={{ marginBottom: '20px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: COLORS.deepSlate,
          }}
        >
          Matriks Celah Informasi (Information Gain)
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
            gap: '12px',
          }}
        >
          {/* Card Defisit */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--waskita-rose-text, #991B1B)',
                marginBottom: '4px',
              }}
            >
              Entitas Defisit (Harus Ditambahkan)
            </div>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
                margin: '0 0 8px 0',
              }}
            >
              Entitas penting kompetitor SERP yang absen di naskah Anda:
            </p>

            {audit.entity_gaps.deficit && audit.entity_gaps.deficit.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {audit.entity_gaps.deficit.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--waskita-rose-bg, #FEE2E2)',
                      color: 'var(--waskita-rose-text, #991B1B)',
                      border: '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.2))',
                      fontSize: '11.5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    + {item.term_surface_form} ({item.competitor_consensus_count} SERP)
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '11.5px', color: '#059669', fontStyle: 'italic' }}>
                ✓ Cakupan topik lengkap, tidak ditemukan celah defisit.
              </span>
            )}
          </div>

          {/* Card Gain */}
          <div
            style={{
              background: 'var(--waskita-surface-white, #FFFFFF)',
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            }}
          >
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--waskita-emerald-text, #065F46)',
                marginBottom: '4px',
              }}
            >
              Information Gain (Nilai Tambah Baru)
            </div>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
                margin: '0 0 8px 0',
              }}
            >
              Entitas pembeda unik yang tidak dimiliki kompetitor:
            </p>

            {audit.entity_gaps.gain && audit.entity_gaps.gain.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {audit.entity_gaps.gain.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--waskita-emerald-bg, #D1FAE5)',
                      color: 'var(--waskita-emerald-text, #065F46)',
                      border: '1px solid var(--waskita-emerald-border, rgba(16, 185, 129, 0.25))',
                      fontSize: '11.5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    ★ {item.term_surface_form}
                  </span>
                ))}
              </div>
            ) : (
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--waskita-text-muted, #64748B)',
                  fontStyle: 'italic',
                }}
              >
                Belum ada entitas pembeda unik baru.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Seksi 4: Naskah Teranotasi Stabilo 4-Warna Interaktif */}
      <section style={{ marginBottom: '20px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
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
            Naskah Teranotasi Stabilo 4-Warna
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            Klik kalimat untuk melihat rincian diagnostik
          </span>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '11.5px',
            marginBottom: '10px',
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
            <span>Kuning: Klise / Generik</span>
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
            <span>Merah: Redundansi VSM Tinggi</span>
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
            <span>Biru: Kosakata Monoton</span>
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
                  onClick={() => setActiveSentenceSpan(span)}
                  title={span.label || span.color}
                  style={{
                    background: bg,
                    color: textCol,
                    padding: '2px 4px',
                    borderRadius: 3,
                    marginRight: '2px',
                    display: 'inline',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
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

        {/* Popover Detail Kalimat yang Diklik */}
        {activeSentenceSpan && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--waskita-card, #E9DFCA)',
              border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '12px',
            }}
          >
            <div>
              <strong>Diagnostik Kalimat:</strong>{' '}
              <span style={{ fontWeight: 600 }}>{activeSentenceSpan.label || activeSentenceSpan.color}</span>
              <div
                style={{
                  fontStyle: 'italic',
                  color: 'var(--waskita-text-muted, #64748B)',
                  marginTop: '2px',
                }}
              >
                "{activeSentenceSpan.text}"
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSentenceSpan(null)}
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                color: COLORS.deepSlate,
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* Seksi 5: Ringkasan Diagnostik & Panduan Remediasi LLM Siap Salin */}
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
