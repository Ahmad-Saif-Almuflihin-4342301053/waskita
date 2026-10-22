"""
Testing Resilience, Graceful Degradation & Anti-XSS Security WASKITA
Fokus:
1. FR-02: Draf < 300 kata ditolak dengan HTTP 422 dan pesan Bahasa Indonesia baku.
2. FR-13: Graceful degradation (1 URL gagal -> HTTP 200 + degradation_warning; 2 URL gagal -> HTTP 503 aman).
3. Anti-XSS Sanitization: Tag <script>, <iframe>, event handlers disanitasi bersih pada input dan output.
"""

import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.audit import AuditExecuteRequest, sanitize_xss


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# Helper untuk membuat teks dengan jumlah kata persis
def make_text_with_word_count(count: int, base_word: str = "kata") -> str:
    return " ".join([f"{base_word}_{i}" for i in range(count)])


# =====================================================================
# 1. PENGUJIAN FR-02: VALIDASI PANJANG KATA DRAF (< 300 KATA DITOLAK)
# =====================================================================

class TestWordCountValidationFR02:
    """
    FR-02 & NFR-10:
    Draf artikel < 300 kata wajib ditolak dengan HTTP 422 Unprocessable Entity
    dan pesan Bahasa Indonesia baku.
    """

    def test_draft_under_300_words_rejected_http_422(self, client):
        short_draft = make_text_with_word_count(150)
        payload = {
            "target_query": "resep kopi tubruk tradisional",
            "draft_title": "Draf Singkat Uji Validasi",
            "draft_content": short_draft,
        }
        response = client.post("/api/v1/audit/execute", json=payload)
        assert response.status_code == 422
        
        data = response.json()
        error_detail = str(data)
        # Verifikasi pesan kesalahan dalam Bahasa Indonesia baku sesuai FR-02
        assert "300 kata" in error_detail
        assert "FR-02" in error_detail or "standar audit WASKITA" in error_detail

    def test_draft_boundary_299_words_rejected(self, client):
        draft_299 = make_text_with_word_count(299)
        payload = {
            "target_query": "resep kopi tubruk tradisional",
            "draft_title": "Draf Batas 299 Kata",
            "draft_content": draft_299,
        }
        response = client.post("/api/v1/audit/execute", json=payload)
        assert response.status_code == 422
        assert "299" in str(response.json())

    def test_draft_boundary_300_words_accepted(self, client):
        # 300 kata realistis harus lolos validasi request Pydantic
        draft_300 = (
            "Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi "
            "secara langsung dengan air mendidih tanpa menggunakan filter atau saringan apa pun. "
        ) * 15  # 15 * 25 kata = 375 kata (lolos batas >= 300 kata)
        
        payload = {
            "target_query": "resep kopi tubruk tradisional",
            "draft_title": "Draf Batas Lolos 300 Kata",
            "draft_content": draft_300,
        }
        response = client.post("/api/v1/audit/execute", json=payload)
        # Bukan 422, artinya validasi FR-02 berhasil dilalui
        assert response.status_code in (200, 503)


# =====================================================================
# 2. PENGUJIAN FR-13: GRACEFUL DEGRADATION & SCRAPER RESILIENCE
# =====================================================================

class TestGracefulDegradationFR13:
    """
    FR-13 & NFR-06:
    - 3 dari 3 URL kompetitor berhasil -> HTTP 200 OK, degradation_warning = null
    - 1 dari 3 gagal (2 berhasil) -> HTTP 200 OK + degradation_warning terisi
    - 2 dari 3 gagal (hanya 1 berhasil) -> HTTP 503 Service Unavailable tanpa crash
    - 3 dari 3 gagal (0 berhasil) -> HTTP 503 Service Unavailable
    """

    @pytest.fixture
    def valid_350_word_draft(self):
        return (
            "Kopi tubruk tradisional diseduh menggunakan bubuk kopi robusta dampit berkualitas tinggi. "
            "Suhu air ideal berkisar sembilan puluh derajat celcius agar aroma cokelat karamel tidak hangus. "
            "Rasio seduhan satu banding lima belas menjamin kekentalan rasa yang mantap dan seimbang. "
            "Biarkan ampas mengendap sempurna selama empat menit sebelum dinikmati bersama camilan santai. "
        ) * 10  # ~380 kata

    def test_degradation_partial_2_docs_success(self, client, valid_350_word_draft):
        """Mock 1 dari 3 kompetitor gagal (hanya 2 dokumen berhasil) -> HTTP 200 OK dengan degradation_warning."""
        mock_2_docs = [
            {
                "rank_position": 1,
                "page_title": "Panduan Kopi Tubruk Satu",
                "source_url": "https://example.com/kopi-1",
                "domain_name": "example.com",
                "snippet_text": "Kopi tubruk nikmat",
                "clean_text": "Kopi tubruk tradisional nikmat diseduh air panas berkualitas dengan rasio pas.",
                "fetch_status": "success",
                "http_status_code": 200,
            },
            {
                "rank_position": 2,
                "page_title": "Panduan Kopi Tubruk Dua",
                "source_url": "https://example.com/kopi-2",
                "domain_name": "example.com",
                "snippet_text": "Kopi tubruk mantap",
                "clean_text": "Resep kopi tubruk mantap membutuhkan ketelitian suhu seduh dan ampas mengendap.",
                "fetch_status": "success",
                "http_status_code": 200,
            },
        ]

        with patch("app.api.v1.routers.search_and_scrape_competitors", new_callable=AsyncMock) as mock_scrape:
            mock_scrape.return_value = mock_2_docs

            payload = {
                "target_query": "resep kopi tubruk tradisional",
                "draft_title": "Uji Degradasi Parsial FR-13",
                "draft_content": valid_350_word_draft,
            }
            response = client.post("/api/v1/audit/execute", json=payload)
            assert response.status_code == 200

            data = response.json()
            # Wajib ada peringatan degradasi parsial
            assert data["degradation_warning"] is not None
            assert "Hanya 2 dari 3" in data["degradation_warning"]
            # Audit tetap menghasilkan metrik dan keputusan
            assert "content_differentiation_score" in data["metrics"]
            assert data["verdict_status"] in ("Siap Terbit", "Perlu Revisi")

    def test_degradation_critical_1_doc_only_returns_http_503(self, client, valid_350_word_draft):
        """Mock 2 dari 3 kompetitor gagal (hanya 1 dokumen berhasil) -> HTTP 503 pembatalan aman."""
        mock_1_doc = [
            {
                "rank_position": 1,
                "page_title": "Satu-satunya Dokumen Berhasil",
                "source_url": "https://example.com/kopi-1",
                "domain_name": "example.com",
                "clean_text": "Kopi tubruk tradisional nikmat.",
                "fetch_status": "success",
            }
        ]

        with patch("app.api.v1.routers.search_and_scrape_competitors", new_callable=AsyncMock) as mock_scrape:
            mock_scrape.return_value = mock_1_doc

            payload = {
                "target_query": "resep kopi tubruk tradisional",
                "draft_title": "Uji Kegagalan Korpus < 2",
                "draft_content": valid_350_word_draft,
            }
            response = client.post("/api/v1/audit/execute", json=payload)
            # Wajib ditolak secara elegan dengan HTTP 503 Service Unavailable tanpa crash
            assert response.status_code == 503
            data = response.json()
            assert "tidak mencukupi" in data["detail"]
            assert "< 2 halaman" in data["detail"]

    def test_degradation_all_failed_returns_http_503(self, client, valid_350_word_draft):
        """Mock seluruh kompetitor gagal (0 dokumen berhasil) -> HTTP 503 pembatalan aman."""
        with patch("app.api.v1.routers.search_and_scrape_competitors", new_callable=AsyncMock) as mock_scrape:
            mock_scrape.return_value = []

            payload = {
                "target_query": "resep kopi tubruk tradisional",
                "draft_title": "Uji Seluruh URL Gagal",
                "draft_content": valid_350_word_draft,
            }
            response = client.post("/api/v1/audit/execute", json=payload)
            assert response.status_code == 503


# =====================================================================
# 3. PENGUJIAN KEAMANAN INPUT: ANTI-XSS SANITIZATION
# =====================================================================

class TestAntiXssSanitization:
    """
    Pengujian Sanitasi Keamanan Input:
    Memastikan tag <script>, <iframe>, event handlers berbahaya (onerror, onclick)
    pada target_query, draft_title, dan draft_content disanitasi secara bersih.
    """

    def test_sanitize_xss_utility_function(self):
        # 1. Script tag
        raw_script = "Halo dunia <script>alert('XSS bahaya')</script> teks lanjut."
        assert sanitize_xss(raw_script) == "Halo dunia  teks lanjut."

        # 2. Iframe injection
        raw_iframe = "<iframe src='javascript:alert(1)'></iframe>Artikel bermutu."
        assert "<iframe" not in sanitize_xss(raw_iframe)

        # 3. Onerror event handler
        raw_img = "<img src='x' onerror='alert(document.cookie)'> Gambar artikel."
        cleaned_img = sanitize_xss(raw_img)
        assert "onerror" not in cleaned_img
        assert "alert" not in cleaned_img

        # 4. Dangerous isolated script tags
        raw_isolated = "Teks pembuka </script> teks penutup."
        assert "</script>" not in sanitize_xss(raw_isolated)

    def test_api_execute_sanitizes_xss_in_inputs(self, client):
        """Mengirimkan payload bervirus XSS ke endpoint /api/v1/audit/execute."""
        malicious_query = "resep kopi <script>alert(1)</script> tubruk"
        malicious_title = "Panduan Kopi <img src=x onerror=alert('xss')> Terpercaya"
        
        safe_body = (
            "Kopi tubruk tradisional diseduh dengan air panas berkualitas tinggi. "
            "Perendaman bubuk kopi tanpa filter menghasilkan sensasi rasa yang tebal dan pekat. "
            "Gunakan rasio seduhan satu banding lima belas untuk keseimbangan rasa maksimal. "
        ) * 15  # ~330 kata
        malicious_content = f"<script>document.location='http://attacker.com'</script>\n{safe_body}"

        payload = {
            "target_query": malicious_query,
            "draft_title": malicious_title,
            "draft_content": malicious_content,
        }

        response = client.post("/api/v1/audit/execute", json=payload)
        assert response.status_code in (200, 503)

        if response.status_code == 200:
            data = response.json()
            # Pastikan target_query yang tersimpan dan dikembalikan bersih dari tag script
            assert "<script>" not in data["target_query"]
            assert "</script>" not in data["target_query"]
            # Pastikan draft_title bersih dari atribut onerror
            assert "onerror" not in data["draft_title"]
            # Pastikan di dalam annotated_spans tidak ada tag script yang bocor
            for span in data["annotated_spans"]:
                assert "<script>" not in span["text"]
                assert "</script>" not in span["text"]
