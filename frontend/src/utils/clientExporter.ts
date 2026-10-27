/**
 * Client-Side File Reader & Exporter (Standar Eko Kurniawan Khannedy — PZN)
 * 100% Client-Side Processing tanpa membebani CPU, RAM, atau I/O Backend.
 */

import { AuditExecuteResponse } from '../types/waskita';
import { sanitizePastedOrUploadedDraft, countPureWords } from './draftSanitizer';
import { waskitaClient } from '../api/waskitaClient';

/**
 * Membaca dan mem-parsing berkas naskah di sisi klien browser (100% Client-Side).
 * .txt dan .md dibaca langsung via File.text()
 * .docx menggunakan fallback ekstrator ringan atau API /api/v1/audit/extract-file
 */
export async function parseUploadedFileClientSide(
  file: File
): Promise<{ text: string; wordCount: number; imageCount: number; videoCount: number }> {
  const name = file.name.toLowerCase();

  let rawContent = '';
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    rawContent = await file.text();
  } else if (name.endsWith('.docx')) {
    try {
      // Coba fallback extract file jika didukung backend
      const res = await waskitaClient.extractFile(file);
      rawContent = res.extracted_text || (res as any).draft_content || '';
    } catch (err) {
      console.warn('Docx extraction via backend failed, reading as binary text:', err);
      // Fallback best-effort text extraction
      const arrayBuf = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      rawContent = decoder.decode(arrayBuf).replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  } else {
    // Default file text reader
    rawContent = await file.text();
  }

  const sanitized = sanitizePastedOrUploadedDraft(rawContent);
  const wordCount = countPureWords(sanitized.cleanText);

  return {
    text: sanitized.cleanText,
    wordCount,
    imageCount: sanitized.imageCount,
    videoCount: sanitized.videoCount,
  };
}

/**
 * Ekspor Audit ke berkas Markdown (.md) 100% di browser
 */
export function exportAuditToMarkdown(turn: AuditExecuteResponse, draftContent?: string): void {
  const dateStr = new Date(turn.audit_timestamp).toLocaleString('id-ID');
  const slug = turn.target_query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'audit';

  let md = `# Laporan Audit Mutu Artikel: ${turn.draft_title || 'Naskah Tanpa Judul'}\n\n`;
  md += `> Di-generate otomatis oleh **WASKITA** (Web-Article Semantic & Quality Inspection Tool)\n`;
  md += `> Tanggal Audit: ${dateStr} | Sesi: #${turn.turn_number} (${turn.session_id})\n\n`;

  md += `## Ringkasan Eksekutif\n\n`;
  md += `- **Kata Kunci Target:** ${turn.target_query}\n`;
  md += `- **Jumlah Kata:** ${turn.draft_word_count} kata\n`;
  md += `- **Skor CDS (Content Differentiation Score):** **${turn.metrics.content_differentiation_score.toFixed(1)}/100**\n`;
  md += `- **Vonis Mutu:** **${turn.verdict_status.toUpperCase()}**\n`;
  if (turn.serp_source && turn.serp_source !== 'live') {
    const srcLabel = turn.serp_source === 'offline_curated' ? 'Korpus Uji Internal' : 'Mode Demo (Sintetis)';
    md += `- **Sumber SERP:** *${srcLabel} (Bukan hasil Google langsung)*\n`;
  }
  const serpCount = turn.serp_competitors?.length || 0;
  const summary = turn.serp_audit_summary;
  const skippedVideo = summary?.skipped_video_social ?? summary?.reasons?.video_social ?? 0;
  const skippedPdf = summary?.skipped_pdf_doc ?? summary?.reasons?.pdf_doc ?? 0;
  const skippedBot = summary?.skipped_bot_protected ?? summary?.reasons?.bot_protected ?? 0;
  const skippedShort = summary?.skipped_short_text ?? summary?.reasons?.short_text ?? 0;
  const skippedTotal = summary?.skipped_total ?? (skippedVideo + skippedPdf + skippedBot + skippedShort);
  md += `- **Ringkasan SERP:** Menampilkan ${serpCount} artikel acuan (${skippedTotal} dilewati: ${skippedVideo} video/sosmed, ${skippedPdf} PDF/dokumen)\n`;

  if (turn.degradation_warning) {
    md += `- **Peringatan Degradasi:** *${turn.degradation_warning}*\n`;
  }
  md += `\n`;

  md += `## 7 Metrik Kuantitatif White-Box IR & Stilometri\n\n`;
  md += `| Metrik | Nilai | Ambang Batas | Status |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| Content Differentiation Score (CDS) | ${turn.metrics.content_differentiation_score.toFixed(1)} | >= ${turn.thresholds.min_cds_score} | ${turn.metrics.content_differentiation_score >= turn.thresholds.min_cds_score ? 'Lolos' : 'Gagal'} |\n`;
  md += `| Max Cosine Similarity | ${(turn.metrics.max_cosine_similarity * 100).toFixed(1)}% | <= ${(turn.thresholds.max_cosine_similarity * 100).toFixed(0)}% | ${turn.metrics.max_cosine_similarity <= turn.thresholds.max_cosine_similarity ? 'Lolos' : 'Gagal'} |\n`;
  md += `| Avg Cosine Similarity | ${(turn.metrics.avg_cosine_similarity * 100).toFixed(1)}% | - | Info |\n`;
  md += `| Euclidean Distance | ${turn.metrics.euclidean_distance.toFixed(3)} | - | Info |\n`;
  md += `| MATTR (L=50) | ${(turn.metrics.mattr_score * 100).toFixed(1)}% | >= ${(turn.thresholds.min_mattr * 100).toFixed(0)}% | ${turn.metrics.mattr_score >= turn.thresholds.min_mattr ? 'Lolos' : 'Gagal'} |\n`;
  md += `| HKO (Hapax Legomena) | ${(turn.metrics.hko_percentage * 100).toFixed(1)}% | <= ${(turn.thresholds.max_hko_percentage * 100).toFixed(0)}% | ${turn.metrics.hko_percentage <= turn.thresholds.max_hko_percentage ? 'Lolos' : 'Gagal'} |\n`;
  md += `| TTR Keseluruhan | ${(turn.metrics.ttr_score * 100).toFixed(1)}% | - | Info |\n\n`;

  md += `## Analisis Celah Informasi (Information Gain Matrix)\n\n`;
  md += `### Entitas Defisit (Harus Ditambahkan)\n`;
  if (turn.entity_gaps.deficit && turn.entity_gaps.deficit.length > 0) {
    turn.entity_gaps.deficit.forEach((item, idx) => {
      md += `${idx + 1}. **${item.term_surface_form}** (Bobot TF-IDF: ${item.tfidf_weight.toFixed(3)}, Konsensus SERP: ${item.competitor_consensus_count} kompetitor)\n`;
    });
  } else {
    md += `*Tidak ditemukan celah defisit signifikan. Entitas kompetitor tercakup dengan baik.*\n`;
  }
  md += `\n`;

  md += `### Entitas Information Gain (Nilai Tambah Artikel Anda)\n`;
  if (turn.entity_gaps.gain && turn.entity_gaps.gain.length > 0) {
    turn.entity_gaps.gain.forEach((item, idx) => {
      md += `${idx + 1}. **${item.term_surface_form}** (Bobot TF-IDF: ${item.tfidf_weight.toFixed(3)})\n`;
    });
  } else {
    md += `*Artikel belum memiliki entitas unik baru dibandingkan kompetitor.*\n`;
  }
  md += `\n`;

  if (turn.overview_bullets && turn.overview_bullets.length > 0) {
    md += `## Poin Evaluasi Kunci\n\n`;
    turn.overview_bullets.forEach((b) => {
      md += `- ${b}\n`;
    });
    md += `\n`;
  }

  if (turn.remediation_prompt) {
    md += `## Rekomendasi Prompt Remediasi AI\n\n`;
    md += `\`\`\`text\n${turn.remediation_prompt}\n\`\`\`\n\n`;
  }

  if (draftContent || (turn as any).draft_content) {
    md += `## Naskah Draf Artikel\n\n`;
    md += (draftContent || (turn as any).draft_content) + '\n\n';
  }

  downloadBlob(md, `waskita-audit-${slug}-turn${turn.turn_number}.md`, 'text/markdown;charset=utf-8;');
}

/**
 * Ekspor Metrik & Celah Entitas Audit ke berkas CSV (.csv) dengan UTF-8 BOM
 * Cocok langsung dibuka di Microsoft Excel tanpa masalah encoding (Standar PZN)
 */
export function exportAuditToCsv(turn: AuditExecuteResponse): void {
  const slug = turn.target_query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'audit';

  const serpCount = turn.serp_competitors?.length || 0;
  const summary = turn.serp_audit_summary;
  const skippedVideo = summary?.skipped_video_social ?? summary?.reasons?.video_social ?? 0;
  const skippedPdf = summary?.skipped_pdf_doc ?? summary?.reasons?.pdf_doc ?? 0;
  const skippedBot = summary?.skipped_bot_protected ?? summary?.reasons?.bot_protected ?? 0;
  const skippedShort = summary?.skipped_short_text ?? summary?.reasons?.short_text ?? 0;
  const skippedTotal = summary?.skipped_total ?? (skippedVideo + skippedPdf + skippedBot + skippedShort);

  const rows: string[][] = [
    ['Kategori', 'Parameter / Entitas', 'Nilai / Bobot', 'Ambang Batas', 'Status'],
    ['Metadata', 'Judul Artikel', `"${(turn.draft_title || '').replace(/"/g, '""')}"`, '', ''],
    ['Metadata', 'Kata Kunci Target', `"${turn.target_query.replace(/"/g, '""')}"`, '', ''],
    ['Metadata', 'Turn Ke', String(turn.turn_number), '', ''],
    ['Metadata', 'Waktu Audit', turn.audit_timestamp, '', ''],
    ['Metadata', 'Jumlah Kata', String(turn.draft_word_count), '>= 300', turn.draft_word_count >= 300 ? 'Lolos' : 'Gagal'],
    ['Metadata', 'Sumber SERP', turn.serp_source || 'live', '', ''],
    ['Metadata', 'Ringkasan SERP', `"${serpCount} acuan (${skippedTotal} dilewati: ${skippedVideo} video/sosmed, ${skippedPdf} PDF)"`, '', ''],
    ['Vonis', 'Vonis Akhir', turn.verdict_status, '', ''],
    ['Metrik IR', 'Content Differentiation Score (CDS)', turn.metrics.content_differentiation_score.toFixed(1), `>= ${turn.thresholds.min_cds_score}`, turn.metrics.content_differentiation_score >= turn.thresholds.min_cds_score ? 'Lolos' : 'Gagal'],
    ['Metrik IR', 'Max Cosine Similarity', (turn.metrics.max_cosine_similarity * 100).toFixed(1) + '%', `<= ${(turn.thresholds.max_cosine_similarity * 100).toFixed(0)}%`, turn.metrics.max_cosine_similarity <= turn.thresholds.max_cosine_similarity ? 'Lolos' : 'Gagal'],
    ['Metrik IR', 'Avg Cosine Similarity', (turn.metrics.avg_cosine_similarity * 100).toFixed(1) + '%', '-', 'Info'],
    ['Metrik IR', 'Euclidean Distance', turn.metrics.euclidean_distance.toFixed(3), '-', 'Info'],
    ['Metrik IR', 'MATTR (L=50)', (turn.metrics.mattr_score * 100).toFixed(1) + '%', `>= ${(turn.thresholds.min_mattr * 100).toFixed(0)}%`, turn.metrics.mattr_score >= turn.thresholds.min_mattr ? 'Lolos' : 'Gagal'],
    ['Metrik IR', 'HKO (Hapax Legomena)', (turn.metrics.hko_percentage * 100).toFixed(1) + '%', `<= ${(turn.thresholds.max_hko_percentage * 100).toFixed(0)}%`, turn.metrics.hko_percentage <= turn.thresholds.max_hko_percentage ? 'Lolos' : 'Gagal'],
    ['Metrik IR', 'TTR Score', (turn.metrics.ttr_score * 100).toFixed(1) + '%', '-', 'Info'],
  ];

  // Defisit
  if (turn.entity_gaps.deficit) {
    turn.entity_gaps.deficit.forEach((d) => {
      rows.push([
        'Celah Defisit',
        `"${d.term_surface_form.replace(/"/g, '""')}"`,
        d.tfidf_weight.toFixed(3),
        `Konsensus SERP: ${d.competitor_consensus_count}`,
        'Harus Ditambahkan',
      ]);
    });
  }

  // Gain
  if (turn.entity_gaps.gain) {
    turn.entity_gaps.gain.forEach((g) => {
      rows.push([
        'Information Gain',
        `"${g.term_surface_form.replace(/"/g, '""')}"`,
        g.tfidf_weight.toFixed(3),
        '-',
        'Nilai Tambah Unik',
      ]);
    });
  }

  // Gabungkan dengan BOM UTF-8 (\uFEFF)
  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  downloadBlob(csvContent, `waskita-audit-${slug}-turn${turn.turn_number}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Ekspor Audit ke berkas JSON mentah (.json) 100% di browser
 */
export function exportAuditToJson(turn: AuditExecuteResponse): void {
  const slug = turn.target_query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'audit';
  const jsonString = JSON.stringify(turn, null, 2);
  downloadBlob(jsonString, `waskita-audit-${slug}-turn${turn.turn_number}.json`, 'application/json;charset=utf-8;');
}

/**
 * Memicu dialog cetak PDF vektor eksekutif bawaan browser (window.print)
 */
export function triggerExecutivePdfPrint(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Helper fungsi download Blob instan di browser tanpa server round-trip
 */
function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 150);
}
