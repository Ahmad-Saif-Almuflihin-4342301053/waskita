import os
import sqlite3
import json
from datetime import datetime

def check_system_health():
    report_lines = []
    report_lines.append("# 💰 WASKITA SYSTEM & QUOTA HEALTH REPORT")
    report_lines.append(f"*Dihasilkan pada:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # 1. Database SQLite Health Check
    db_path = "backend/waskita.db"
    if os.path.exists(db_path):
        size_bytes = os.path.getsize(db_path)
        size_mb = size_bytes / (1024 * 1024)
        report_lines.append(f"### 🗄️ Status Database SQLite (`{db_path}`)")
        report_lines.append(f"- **Ukuran File:** {size_mb:.2f} MB")
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT count(*) FROM AUDIT_SESSIONS;")
            session_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT count(*) FROM COMPETITOR_DOCUMENTS;")
            comp_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT count(*) FROM ENTITY_GAPS;")
            gap_count = cursor.fetchone()[0]
            
            conn.close()
            
            report_lines.append(f"- **Total Sesi Audit:** {session_count} sesi")
            report_lines.append(f"- **Total Dokumen Cache Kompetitor:** {comp_count} artikel")
            report_lines.append(f"- **Total Rekod Entity Gaps:** {gap_count} rekod")
            
            if size_mb > 50:
                report_lines.append("\n⚠️ **PERINGATAN:** Ukuran database > 50MB. Disarankan jalankan `VACUUM;` untuk optimasi.")
            else:
                report_lines.append("\n✅ **Status Database Sehat & Optimal.**")
        except Exception as e:
            report_lines.append(f"\n⚠️ Gagal membaca tabel database: {str(e)}")
    else:
        report_lines.append("⚠️ File `backend/waskita.db` belum dibuat atau belum ada aktivitas.")
        
    # 2. Periksa Kunci API Serper di .env
    report_lines.append("\n### 🔑 Status Konfigurasi API Eksternal")
    env_paths = [".env", "backend/.env"]
    found_key = False
    for p in env_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                content = f.read()
                if "SERPER_API_KEY" in content:
                    found_key = True
                    report_lines.append(f"- **Serper API Key:** Terdeteksi aman di `{p}` ✅")
                    break
    if not found_key:
        report_lines.append("- **Serper API Key:** ⚠️ `SERPER_API_KEY` tidak ditemukan di file .env. Pastikan diset agar live scraping aktif.")
        
    report_content = "\n".join(report_lines)
    
    # Simpan ke docs/satellite_reports
    out_file = "docs/satellite_reports/system_quota_health.md"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print(f"\n[System Guard 0-Token] Selesai! Laporan berhasil disimpan ke: {out_file}\n")
    print(report_content)

if __name__ == "__main__":
    check_system_health()
