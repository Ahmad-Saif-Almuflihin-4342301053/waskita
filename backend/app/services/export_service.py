import csv
import io
import json
from typing import Any, Dict


def export_markdown_report(data: Dict[str, Any]) -> str:
    """Format ekspor laporan markdown (.md)."""
    metrics = data.get("metrics", {})
    entity_gaps = data.get("entity_gaps", {})
    deficits = entity_gaps.get("deficit", [])
    gains = entity_gaps.get("gain", [])
    overview = data.get("overview_bullets", [])
    prompt = data.get("remediation_prompt", "")

    md = f"""# Laporan Hasil Audit Kualitas Konten WASKITA
**Judul Draf:** {data.get('draft_title')}  
**Kueri Target:** {data.get('target_query')}  
**Waktu Audit:** {data.get('audit_timestamp')}  
**Status Vonis:** **{data.get('verdict_status')}**  
**Skor CDS:** **{metrics.get('content_differentiation_score', 0)}%**  

---

## 1. Ringkasan Metrik Matematis (White-Box IR & Stilometri)
- **Content Differentiation Score (CDS):** {metrics.get('content_differentiation_score')}%
- **Max Cosine Similarity:** {metrics.get('max_cosine_similarity')}
- **Avg Cosine Similarity:** {metrics.get('avg_cosine_similarity')}
- **Euclidean Distance:** {metrics.get('euclidean_distance')}
- **MATTR Score (L=50):** {metrics.get('mattr_score')}
- **TTR Score:** {metrics.get('ttr_score')}
- **Heading-Keyword Overlap (HKO):** {metrics.get('hko_percentage')}%
- **Status Redundansi:** {'Ya' if metrics.get('is_redundant') else 'Tidak'}
- **Status Keyword Stuffed:** {'Ya' if metrics.get('is_keyword_stuffed') else 'Tidak'}

---

## 2. Analisis Celah Informasi (Information Gain)
### Celah Topik Defisit (Belum Dibahas Draf):
"""
    if deficits:
        for d in deficits:
            md += f"- **{d.get('term_surface_form')}** (Konsensus Kompetitor: {d.get('competitor_consensus_count')} artikel)\n"
    else:
        md += "- Tidak ditemukan celah defisit signifikan.\n"

    md += "\n### Nilai Tambah Informasi Orisinal (Delta Gain):\n"
    if gains:
        for g in gains:
            md += f"- **{g.get('term_surface_form')}** (Bobot TF-IDF: {g.get('tfidf_weight')})\n"
    else:
        md += "- Belum terdeteksi istilah orisinal unik.\n"

    md += "\n---\n\n## 3. Poin Temuan Editorial & Remediasi\n"
    for bullet in overview:
        md += f"- {bullet}\n"

    md += f"\n### Prompt Remediasi Kurasi:\n```\n{prompt}\n```\n"

    return md


def export_csv_report(data: Dict[str, Any]) -> str:
    """Format ekspor metrik dalam CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Parameter", "Nilai"])
    writer.writerow(["Session ID", data.get("session_id")])
    writer.writerow(["Target Query", data.get("target_query")])
    writer.writerow(["Draft Title", data.get("draft_title")])
    writer.writerow(["Draft Word Count", data.get("draft_word_count")])
    writer.writerow(["Verdict Status", data.get("verdict_status")])

    metrics = data.get("metrics", {})
    for k, v in metrics.items():
        writer.writerow([f"Metric_{k}", v])

    return output.getvalue()


def export_pdf_html_report(data: Dict[str, Any]) -> str:
    """Format ekspor laporan ringkasan eksekutif siap cetak (HTML Print)."""
    metrics = data.get("metrics", {})
    verdict = data.get("verdict_status", "Perlu Revisi")
    verdict_color = "#16a34a" if verdict == "Siap Terbit" else "#dc2626"

    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>WASKITA Executive Audit Report - {data.get('draft_title')}</title>
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; }}
  h1 {{ color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }}
  .badge {{ display: inline-block; padding: 6px 14px; font-weight: bold; border-radius: 6px; color: #fff; background-color: {verdict_color}; }}
  .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
  th, td {{ border: 1px solid #cbd5e1; padding: 10px; text-align: left; }}
  th {{ background: #f1f5f9; }}
  @media print {{ body {{ padding: 0; }} }}
</style>
</head>
<body>
  <h1>WASKITA Pre-Publishing Audit Report</h1>
  <p><strong>Judul Draf:</strong> {data.get('draft_title')}</p>
  <p><strong>Kueri Target:</strong> {data.get('target_query')}</p>
  <p><strong>Waktu Audit:</strong> {data.get('audit_timestamp')}</p>
  <p><strong>Vonis Kelayakan:</strong> <span class="badge">{verdict}</span></p>

  <div class="card">
    <h3>Skor & Metrik Diferensiasi Semantik (CDS: {metrics.get('content_differentiation_score')}%)</h3>
    <table>
      <tr><th>Komponen Metrik</th><th>Nilai Hasil</th><th>Ambang Batas Standar</th></tr>
      <tr><td>Cosine Similarity Max</td><td>{metrics.get('max_cosine_similarity')}</td><td>≤ 0.60</td></tr>
      <tr><td>MATTR Score (w=50)</td><td>{metrics.get('mattr_score')}</td><td>≥ 0.55</td></tr>
      <tr><td>Heading-Keyword Overlap</td><td>{metrics.get('hko_percentage')}%</td><td>≤ 40.0%</td></tr>
      <tr><td>Content Differentiation Score</td><td>{metrics.get('content_differentiation_score')}%</td><td>≥ 75.0%</td></tr>
    </table>
  </div>

  <div class="card">
    <h3>Instruksi Remediasi Kurasi</h3>
    <pre style="white-space: pre-wrap; font-family: inherit;">{data.get('remediation_prompt')}</pre>
  </div>
</body>
</html>"""
    return html
