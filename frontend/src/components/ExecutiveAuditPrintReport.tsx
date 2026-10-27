import React from 'react';
import { AuditExecuteResponse } from '../types/waskita';
import { IconCheck, IconAlertCircle, IconAlertTriangle } from './shared-ui';

interface ExecutiveAuditPrintReportProps {
  auditData: AuditExecuteResponse | null;
  draftContent?: string;
}

export const ExecutiveAuditPrintReport: React.FC<ExecutiveAuditPrintReportProps> = ({
  auditData,
  draftContent,
}) => {
  if (!auditData) return null;

  const dateStr = new Date(auditData.audit_timestamp).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const isApproved = auditData.verdict_status === 'Layak Terbit';
  const isDemo = auditData.verdict_status === 'Mode Demo' || auditData.serp_source === 'offline_synthetic';
  const isCurated = auditData.serp_source === 'offline_curated';
  const isLive = !auditData.serp_source || auditData.serp_source === 'live';

  const serpCount = auditData.serp_competitors?.length || 0;
  const summary = auditData.serp_audit_summary;
  const skippedVideo = summary?.skipped_video_social ?? summary?.reasons?.video_social ?? 0;
  const skippedPdf = summary?.skipped_pdf_doc ?? summary?.reasons?.pdf_doc ?? 0;
  const skippedBot = summary?.skipped_bot_protected ?? summary?.reasons?.bot_protected ?? 0;
  const skippedShort = summary?.skipped_short_text ?? summary?.reasons?.short_text ?? 0;
  const skippedTotal = summary?.skipped_total ?? (skippedVideo + skippedPdf + skippedBot + skippedShort);

  return (
    <div className="waskita-print-root">
      {/* KOP RESMI WASKITA */}
      <div className="print-header">
        <div className="print-logo-row">
          <div className="print-brand">
            <h1 className="print-title">WASKITA</h1>
            <p className="print-subtitle">Web-Article Semantic &amp; Quality Inspection Tool</p>
          </div>
          <div className="print-verdict-badge-box">
            <span
              className={`print-verdict-badge ${
                isDemo
                  ? 'print-verdict-revision'
                  : isApproved
                  ? 'print-verdict-approved'
                  : 'print-verdict-revision'
              }`}
            >
              {(isDemo ? 'MODE DEMO' : auditData.verdict_status).toUpperCase()}
            </span>
            <div className="print-cds-score">
              Skor CDS: <strong>{auditData.metrics.content_differentiation_score.toFixed(1)} / 100</strong>
            </div>
          </div>
        </div>

        <div className="print-meta-grid">
          <div>
            <strong>Judul Artikel:</strong> {auditData.draft_title || 'Naskah Tanpa Judul'}
          </div>
          <div>
            <strong>Target Query:</strong> "{auditData.target_query}"
          </div>
          <div>
            <strong>Turn Ke:</strong> #{auditData.turn_number} ({auditData.session_id})
          </div>
          <div>
            <strong>Waktu Pemeriksaan:</strong> {dateStr}
          </div>
          <div>
            <strong>Jumlah Kata:</strong> {auditData.draft_word_count} kata
          </div>
          <div>
            <strong>Ambang Batas Minimum CDS:</strong> {auditData.thresholds.min_cds_score}
          </div>
          <div>
            <strong>Sumber Korpus SERP:</strong> {isLive ? 'Google Live SERP' : isCurated ? 'Korpus Uji Internal (Curated)' : 'Mode Demo (Sintetis)'}
          </div>
          <div>
            <strong>Ringkasan SERP:</strong> Menampilkan {serpCount} artikel acuan ({skippedTotal} dilewati: {skippedVideo} video/sosmed, {skippedPdf} PDF)
          </div>
        </div>

        {!isLive && (
          <div className="print-alert-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
            <IconAlertTriangle size={16} color="#B45309" />
            <span>
              <strong>Pemberitahuan Sumber Non-Live:</strong> Laporan ini dihasilkan dari {isCurated ? 'Korpus Uji Internal' : 'Mode Demo / Data Sintetis'}, bukan dari pencarian Google SERP langsung.
            </span>
          </div>
        )}

        {auditData.degradation_warning && (
          <div className="print-alert-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconAlertTriangle size={16} color="#d97706" />
            <span><strong>Peringatan Degradasi Kualitas:</strong> {auditData.degradation_warning}</span>
          </div>
        )}
      </div>

      <hr className="print-divider" />

      {/* 7 METRIK KUANTITATIF WHITE-BOX */}
      <div className="print-section">
        <h2 className="print-section-title">1. Tabel 7 Metrik Kuantitatif White-Box IR &amp; Stilometri</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Metrik Evaluasi</th>
              <th>Nilai Naskah</th>
              <th>Ambang Batas Syarat</th>
              <th>Status Kelolosan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Content Differentiation Score (CDS)</td>
              <td><strong>{auditData.metrics.content_differentiation_score.toFixed(1)}</strong></td>
              <td>&gt;= {auditData.thresholds.min_cds_score}</td>
              <td>
                {auditData.metrics.content_differentiation_score >= auditData.thresholds.min_cds_score ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                    <IconCheck size={13} color="#059669" /> Lolos Syarat
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <IconAlertCircle size={13} color="#dc2626" /> Gagal
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td>Max Cosine Similarity (vs Kompetitor SERP)</td>
              <td>{(auditData.metrics.max_cosine_similarity * 100).toFixed(1)}%</td>
              <td>&lt;= {(auditData.thresholds.max_cosine_similarity * 100).toFixed(0)}%</td>
              <td>
                {auditData.metrics.max_cosine_similarity <= auditData.thresholds.max_cosine_similarity ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                    <IconCheck size={13} color="#059669" /> Lolos
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <IconAlertCircle size={13} color="#dc2626" /> Redundan / Terlalu Mirip
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td>Avg Cosine Similarity</td>
              <td>{(auditData.metrics.avg_cosine_similarity * 100).toFixed(1)}%</td>
              <td>-</td>
              <td>Informasi Korpus</td>
            </tr>
            <tr>
              <td>Euclidean Distance (Spasial TF-IDF)</td>
              <td>{auditData.metrics.euclidean_distance.toFixed(3)}</td>
              <td>-</td>
              <td>Informasi Korpus</td>
            </tr>
            <tr>
              <td>MATTR (Moving-Average TTR, Window L=50)</td>
              <td>{(auditData.metrics.mattr_score * 100).toFixed(1)}%</td>
              <td>&gt;= {(auditData.thresholds.min_mattr * 100).toFixed(0)}%</td>
              <td>
                {auditData.metrics.mattr_score >= auditData.thresholds.min_mattr ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                    <IconCheck size={13} color="#059669" /> Lolos
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <IconAlertCircle size={13} color="#dc2626" /> Kosakata Monoton
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td>Heading-Keyword Overlap (HKO)</td>
              <td>{auditData.metrics.hko_percentage.toFixed(1)}%</td>
              <td>&lt;= {auditData.thresholds.max_hko_percentage.toFixed(0)}%</td>
              <td>
                {auditData.metrics.hko_percentage <= auditData.thresholds.max_hko_percentage ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                    <IconCheck size={13} color="#059669" /> Lolos
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <IconAlertCircle size={13} color="#dc2626" /> Heading Berlebih
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td>Type-Token Ratio (TTR Keseluruhan)</td>
              <td>{(auditData.metrics.ttr_score * 100).toFixed(1)}%</td>
              <td>-</td>
              <td>Informasi Stilometri</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ANALISIS CELAH INFORMASI */}
      <div className="print-section">
        <h2 className="print-section-title">2. Matriks Celah Informasi (Information Gain &amp; Defisit)</h2>
        <div className="print-grid-two">
          <div className="print-subcard">
            <h3 className="print-subcard-title deficit-title">Entitas Defisit (Harus Ditambahkan)</h3>
            <p className="print-desc">Entitas penting kompetitor SERP yang belum ada di naskah Anda:</p>
            {auditData.entity_gaps.deficit && auditData.entity_gaps.deficit.length > 0 ? (
              <ul className="print-entity-list">
                {auditData.entity_gaps.deficit.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.term_surface_form}</strong> (Konsensus: {item.competitor_consensus_count} kompetitor, TF-IDF: {item.tfidf_weight.toFixed(3)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="print-empty-note">Cakupan entitas sangat lengkap, tidak ditemukan celah defisit.</p>
            )}
          </div>

          <div className="print-subcard">
            <h3 className="print-subcard-title gain-title">Information Gain (Nilai Tambah Baru)</h3>
            <p className="print-desc">Entitas pembeda unik yang tidak dimiliki kompetitor SERP:</p>
            {auditData.entity_gaps.gain && auditData.entity_gaps.gain.length > 0 ? (
              <ul className="print-entity-list">
                {auditData.entity_gaps.gain.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.term_surface_form}</strong> (Bobot TF-IDF: {item.tfidf_weight.toFixed(3)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="print-empty-note">Artikel belum memiliki entitas pembeda baru.</p>
            )}
          </div>
        </div>
      </div>

      {/* NASKAH BERANOTASI STABILO */}
      {auditData.annotated_spans && auditData.annotated_spans.length > 0 && (
        <div className="print-section page-break-before">
          <h2 className="print-section-title">3. Naskah Beranotasi Stabilo 4-Warna</h2>
          <div className="print-highlight-legend">
            <span className="legend-chip highlight-yellow">Kuning: Klise / Generik</span>
            <span className="legend-chip highlight-red">Merah: Redundansi VSM Tinggi</span>
            <span className="legend-chip highlight-blue">Biru: Kosakata Monoton</span>
            <span className="legend-chip highlight-green">Hijau: Information Gain Kuat</span>
          </div>
          <div className="print-annotated-content">
            {auditData.annotated_spans.map((span, idx) => {
              let colorClass = '';
              if (span.color === 'yellow') colorClass = 'highlight-yellow';
              else if (span.color === 'red') colorClass = 'highlight-red';
              else if (span.color === 'blue') colorClass = 'highlight-blue';
              else if (span.color === 'green') colorClass = 'highlight-green';

              return (
                <span
                  key={idx}
                  className={colorClass}
                  title={span.label || undefined}
                >
                  {span.text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* PROMPT REMEDIASI */}
      {auditData.remediation_prompt && (
        <div className="print-section">
          <h2 className="print-section-title">4. Panduan &amp; Rekomendasi Prompt Remediasi</h2>
          <pre className="print-prompt-box">{auditData.remediation_prompt}</pre>
        </div>
      )}

      {/* NASKAH ASLI JIKA TIDAK ADA ANOTASI */}
      {(!auditData.annotated_spans || auditData.annotated_spans.length === 0) && (draftContent || (auditData as any).draft_content) && (
        <div className="print-section page-break-before">
          <h2 className="print-section-title">3. Teks Draf Naskah</h2>
          <div className="print-raw-draft">
            {draftContent || (auditData as any).draft_content}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="print-footer">
        <p>Dokumen Laporan Audit Mutu Pra-Publikasi WASKITA — Dicetak 100% Client-Side (Standar PZN)</p>
      </div>
    </div>
  );
};
