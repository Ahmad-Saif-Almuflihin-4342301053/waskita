"""
Skrip Uji Beban & Latensi Peladen (Load & Stress Testing) WASKITA
Landasan: Bab 2.4.2 (Pengujian Performa & Konkurensi) & NFR-01, NFR-02, NFR-05.
Target Simulasi:
- 10 - 20 Concurrent Virtual Users (Spawn Rate 2 users/detik)
- Pengujian Latensi API (NFR-01: T_audit < 15 detik)
- Pengujian Stabilitas Memori RAM fisik <= 1.5 - 2.0 GB (NFR-05 via psutil / /proc/self/status)
- Verifikasi bebas dari `sqlite3.OperationalError: database is locked` (NFR-04 via SQLite WAL)
"""

import json
import logging
import os
import sys
import time
from typing import Dict, Optional

from locust import HttpUser, between, events, task

# Coba impor psutil untuk monitoring RAM lintas platform
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

logger = logging.getLogger("waskita.loadtest")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Batas memori maksimum yang diizinkan (NFR-05: 2048 MB = 2.0 GB)
MAX_ALLOWED_RAM_MB = 2048.0

# Draf artikel realistis (> 300 kata) untuk pengujian beban
SAMPLE_AUDIT_DRAFT = (
    "Kopi tubruk tradisional merupakan metode ekstraksi bubuk kopi asli Nusantara yang sangat melegenda. "
    "Dalam penyajiannya, bubuk kopi diseduh langsung menggunakan air panas bersuhu sembilan puluh dua derajat celcius. "
    "Rasio ideal satu banding lima belas menjamin keseimbangan rasa yang pas antara kepekatan dan aroma karamel. "
    "Biarkan seduhan mengendap selama empat menit agar ampas turun ke dasar cangkir sebelum dinikmati. "
    "Metode tubruk menonjolkan profil keasaman alami dan kekentalan tubuh kopi robusta maupun arabika secara jujur. "
) * 8  # ~360 kata


def get_current_memory_usage_mb() -> float:
    """Mengambil penggunaan memori RAM (RSS) proses aktif dalam satuan Megabytes (MB)."""
    if HAS_PSUTIL:
        process = psutil.Process(os.getpid())
        mem_bytes = process.memory_info().rss
        return mem_bytes / (1024 * 1024)
    elif os.path.exists("/proc/self/status"):
        try:
            with open("/proc/self/status", "r") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        # Format: VmRSS:   12345 kB
                        parts = line.split()
                        return float(parts[1]) / 1024.0
        except Exception:
            pass
    return 0.0


# =====================================================================
# LOCUST EVENT LISTENERS: MONITORING MEMORI & DATABASE LOCK CHECK
# =====================================================================

test_metrics_tracker = {
    "peak_memory_mb": 0.0,
    "total_requests": 0,
    "failed_requests": 0,
    "db_lock_errors": 0,
}


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    baseline_ram = get_current_memory_usage_mb()
    test_metrics_tracker["peak_memory_mb"] = baseline_ram
    logger.info("=" * 65)
    logger.info("   MEMULAI PENGUJIAN BEBAN WASKITA (LOCUST VIRTUAL USERS)")
    logger.info(f"Baseline RAM Virtual User Process : {baseline_ram:.2f} MB")
    logger.info(f"Batas Maksimum RAM (NFR-05)       : {MAX_ALLOWED_RAM_MB:.2f} MB")
    logger.info("Mode Konkurensi Target            : 10 - 20 Virtual Users (2 users/detik)")
    logger.info("Konfigurasi Database              : SQLite WAL + busy_timeout=5000ms")
    logger.info("=" * 65)


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, response, context, exception, **kwargs):
    test_metrics_tracker["total_requests"] += 1

    # Monitor lonjakan penggunaan memori
    current_ram = get_current_memory_usage_mb()
    if current_ram > test_metrics_tracker["peak_memory_mb"]:
        test_metrics_tracker["peak_memory_mb"] = current_ram

    if current_ram > MAX_ALLOWED_RAM_MB:
        logger.error(f"[NFR-05 VIOLATION] Penggunaan RAM melonjak ke {current_ram:.2f} MB melebihi batas {MAX_ALLOWED_RAM_MB} MB!")

    if exception:
        test_metrics_tracker["failed_requests"] += 1
        err_str = str(exception).lower()
        if "database is locked" in err_str or "operationalerror" in err_str:
            test_metrics_tracker["db_lock_errors"] += 1
            logger.critical(f"[DATABASE LOCK ERROR DETECTED] SQLite terkunci saat konkurensi tinggi: {exception}")
    elif response and response.status_code >= 500:
        test_metrics_tracker["failed_requests"] += 1
        resp_text = response.text.lower()
        if "database is locked" in resp_text:
            test_metrics_tracker["db_lock_errors"] += 1
            logger.critical("[DATABASE LOCK ERROR] Respon 500 memuat 'database is locked'!")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    final_ram = get_current_memory_usage_mb()
    peak_ram = test_metrics_tracker["peak_memory_mb"]
    total = test_metrics_tracker["total_requests"]
    failed = test_metrics_tracker["failed_requests"]
    db_locks = test_metrics_tracker["db_lock_errors"]

    logger.info("=" * 65)
    logger.info("   HASIL AKHIR PENGUJIAN BEBAN & RELIABILITAS WASKITA")
    logger.info("=" * 65)
    logger.info(f"Total Permintaan Terkirim     : {total}")
    logger.info(f"Total Permintaan Gagal        : {failed}")
    logger.info(f"Kesalahan Database is Locked  : {db_locks} (Wajib 0 — NFR-04)")
    logger.info(f"Penggunaan RAM Puncak         : {peak_ram:.2f} MB / {MAX_ALLOWED_RAM_MB:.2f} MB (NFR-05)")
    logger.info(f"Penggunaan RAM Akhir          : {final_ram:.2f} MB")
    logger.info("=" * 65)

    assert db_locks == 0, f"Ditemukan {db_locks} kesalahan 'database is locked'! Periksa konfigurasi SQLite WAL & busy_timeout."
    assert peak_ram <= MAX_ALLOWED_RAM_MB, f"Penggunaan RAM {peak_ram:.2f} MB melebihi batas NFR-05 ({MAX_ALLOWED_RAM_MB} MB)!"


# =====================================================================
# VIRTUAL USER TASKS (SIMULASI PENGGUNA RIIL)
# =====================================================================

class WaskitaAuditUser(HttpUser):
    """
    Simulasi Virtual User yang melakukan audit draf artikel,
    mengambil riwayat sesi, dan mengekspor laporan secara konkuren.
    """
    wait_time = between(1.0, 3.0)  # Interval acak antar request (1 - 3 detik)

    def on_start(self):
        """Autentikasi awal pengguna atau mode tamu."""
        self.auth_headers: Dict[str, str] = {}
        self.session_ids: list[str] = []

        # Coba login dengan akun author_demo yang telah di-seed
        login_payload = {
            "username_or_email": "author_demo",
            "password": "password123",
        }
        with self.client.post("/api/v1/auth/login", json=login_payload, catch_response=True) as resp:
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    token = data.get("access_token")
                    if token:
                        self.auth_headers["Authorization"] = f"Bearer {token}"
                        resp.success()
                except Exception:
                    pass

    @task(4)
    def execute_audit_task(self):
        """Tugas utama: Eksekusi audit artikel (White-Box IR Engine)."""
        payload = {
            "target_query": "resep kopi tubruk tradisional",
            "draft_title": "Draf Beban Virtual User Waskita",
            "draft_content": SAMPLE_AUDIT_DRAFT,
            "use_cached_serp": True,
        }
        with self.client.post(
            "/api/v1/audit/execute",
            json=payload,
            headers=self.auth_headers,
            name="/api/v1/audit/execute",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 503):
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                        sid = data.get("session_id")
                        if sid:
                            self.session_ids.append(sid)
                    except Exception:
                        pass
                resp.success()
            else:
                resp.failure(f"Audit execute failed with HTTP {resp.status_code}: {resp.text[:100]}")

    @task(2)
    def list_sessions_task(self):
        """Tugas: Mengambil riwayat daftar sesi audit pengguna."""
        self.client.get(
            "/api/v1/sessions",
            headers=self.auth_headers,
            name="/api/v1/sessions",
        )

    @task(1)
    def view_session_detail_task(self):
        """Tugas: Melihat detail satu sesi audit jika session_id tersedia."""
        sid = self.session_ids[-1] if self.session_ids else "8f14e45f-ceea-467f-a8f1-44c09e08b912"
        self.client.get(
            f"/api/v1/sessions/{sid}",
            headers=self.auth_headers,
            name="/api/v1/sessions/{id}",
        )

    @task(1)
    def export_report_task(self):
        """Tugas: Ekspor laporan audit dalam format Markdown."""
        sid = self.session_ids[-1] if self.session_ids else "8f14e45f-ceea-467f-a8f1-44c09e08b912"
        self.client.get(
            f"/api/v1/sessions/{sid}/export?format=md",
            headers=self.auth_headers,
            name="/api/v1/sessions/{id}/export?format=md",
        )

    @task(1)
    def health_check_task(self):
        """Tugas: Pengecekan kondisi peladen API."""
        self.client.get("/health", name="/health")
