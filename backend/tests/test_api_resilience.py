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


# =====================================================================
# 4. PENGUJIAN SPRINT 2: CONTRACT SYNC, THREAD & EXTRACT FILE
# =====================================================================

class TestSprint2BackendContractAndThread:
    """
    Pengujian fitur Sprint 2 (Issue #8):
    1. draft_content dikembalikan pada AuditExecuteResponse (execute_audit & get_session_detail).
    2. score_cds ada pada SessionListItem dan list_user_sessions mengembalikan hanya sesi terbaru/root per rantai.
    3. Endpoint GET /api/v1/sessions/{session_id}/thread mengumpulkan turn 1, 2, ... berurutan.
    4. Endpoint POST /api/v1/audit/extract-file mengembalikan draft_content, extracted_text, dan file_format.
    """

    def test_extract_draft_from_file_response_contract(self, client):
        file_content = b"# Judul Artikel Kopi\n\nIni adalah contoh isi file draf markdown untuk pengujian."
        files = {"file": ("draft_test.md", file_content, "text/markdown")}
        response = client.post("/api/v1/audit/extract-file", files=files)
        assert response.status_code == 200
        data = response.json()
        assert "draft_content" in data
        assert "extracted_text" in data
        assert "file_format" in data
        assert data["file_format"] == "md"
        assert data["draft_content"] == data["extracted_text"]
        assert "Judul Artikel Kopi" in data["draft_content"]

    def test_session_detail_and_execute_includes_draft_content(self, client):
        # Ambil salah satu sesi yang sudah ada di database
        # Login demo author
        login_res = client.post("/api/v1/auth/login", json={"username_or_email": "author_demo", "password": "password123"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        list_res = client.get("/api/v1/sessions", headers=headers)
        assert list_res.status_code == 200
        sessions = list_res.json()
        assert len(sessions) > 0
        target_session = sessions[0]

        # Validasi kontrak SessionListItem
        assert "score_cds" in target_session
        assert "content_differentiation_score" in target_session
        assert target_session["score_cds"] == target_session["content_differentiation_score"]

        # Detail session
        detail_res = client.get(f"/api/v1/sessions/{target_session['session_id']}")
        assert detail_res.status_code == 200
        detail_data = detail_res.json()
        assert "draft_content" in detail_data
        assert isinstance(detail_data["draft_content"], str)

    def test_session_thread_endpoint(self, client):
        # Buat sesi Turn 1 dan Turn 2 untuk menguji /thread
        from app.core.database import SessionLocal
        from app.models.entities import AuditSession, MetricResult, User
        import datetime, uuid

        db = SessionLocal()
        user = db.query(User).filter(User.username == "author_demo").first()
        assert user is not None

        root_id = str(uuid.uuid4())
        child_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow()

        session_turn1 = AuditSession(
            session_id=root_id,
            user_id=user.user_id,
            parent_session_id=None,
            turn_number=1,
            target_query="analisis thread sprint2",
            draft_title="Thread Turn 1",
            draft_content="Konten draf turn 1 berisikan analisis topik secara umum...",
            draft_word_count=320,
            audit_timestamp=now,
            verdict_status="Perlu Revisi",
            is_pinned=False,
        )
        metric1 = MetricResult(
            session_id=root_id,
            avg_cosine_similarity=0.72,
            max_cosine_similarity=0.78,
            euclidean_distance=1.2,
            ttr_score=0.45,
            mattr_score=0.50,
            hko_percentage=45.0,
            content_differentiation_score=58.0,
            is_redundant=True,
            is_keyword_stuffed=False,
        )
        db.add(session_turn1)
        db.add(metric1)

        session_turn2 = AuditSession(
            session_id=child_id,
            user_id=user.user_id,
            parent_session_id=root_id,
            turn_number=2,
            target_query="analisis thread sprint2",
            draft_title="Thread Turn 2",
            draft_content="Konten draf turn 2 setelah perbaikan komprehensif...",
            draft_word_count=350,
            audit_timestamp=now + datetime.timedelta(minutes=5),
            verdict_status="Layak Terbit",
            is_pinned=False,
        )
        metric2 = MetricResult(
            session_id=child_id,
            avg_cosine_similarity=0.52,
            max_cosine_similarity=0.58,
            euclidean_distance=1.6,
            ttr_score=0.62,
            mattr_score=0.68,
            hko_percentage=28.0,
            content_differentiation_score=86.0,
            is_redundant=False,
            is_keyword_stuffed=False,
        )
        db.add(session_turn2)
        db.add(metric2)
        db.commit()

        try:
            # Query thread lewat child_id
            res_from_child = client.get(f"/api/v1/sessions/{child_id}/thread")
            assert res_from_child.status_code == 200
            thread_data = res_from_child.json()
            assert len(thread_data) == 2
            assert thread_data[0]["session_id"] == root_id
            assert thread_data[0]["turn_number"] == 1
            assert thread_data[0]["draft_content"] == session_turn1.draft_content
            assert thread_data[1]["session_id"] == child_id
            assert thread_data[1]["turn_number"] == 2
            assert thread_data[1]["draft_content"] == session_turn2.draft_content

            # Query thread lewat root_id
            res_from_root = client.get(f"/api/v1/sessions/{root_id}/thread")
            assert res_from_root.status_code == 200
            assert len(res_from_root.json()) == 2

            # Cek list_user_sessions hanya mengembalikan sesi terbaru (turn 2) untuk thread ini
            login_res = client.post("/api/v1/auth/login", json={"username_or_email": "author_demo", "password": "password123"})
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            list_res = client.get("/api/v1/sessions", headers=headers)
            user_session_ids = [s["session_id"] for s in list_res.json()]
            assert child_id in user_session_ids
            assert root_id not in user_session_ids
        finally:
            # Cleanup
            db.query(MetricResult).filter(MetricResult.session_id.in_([root_id, child_id])).delete(synchronize_session=False)
            db.query(AuditSession).filter(AuditSession.session_id.in_([root_id, child_id])).delete(synchronize_session=False)
            db.commit()
            db.close()


# =====================================================================
# 5. PENGUJIAN FASE 1 & FASE 3: CACHING & UPLOAD GUARDRAILS
# =====================================================================

class TestPhase1AndPhase3ProductionGuardrails:
    """Pengujian Caching Multi-Tier (Fase 1) dan Guardrail Ukuran Berkas 5MB (Fase 3)."""

    def test_upload_file_exceeding_5mb_rejected_http_413(self, client):
        # Buat payload berukuran 5.5 MB (melebihi limit 5 MB)
        oversized_bytes = b"A" * (5 * 1024 * 1024 + 500_000)
        files = {"file": ("big_draft.txt", oversized_bytes, "text/plain")}
        res = client.post("/api/v1/audit/extract-file", files=files)
        assert res.status_code == 413
        assert "melebihi batas maksimal 5 MB" in res.json()["detail"]

    def test_upload_valid_markdown_under_limit_accepted(self, client):
        normal_bytes = b"# Resep Kopi\n\nKopi tubruk enak sekali diseduh di pagi hari."
        files = {"file": ("draft.md", normal_bytes, "text/markdown")}
        res = client.post("/api/v1/audit/extract-file", files=files)
        assert res.status_code == 200
        assert "Resep Kopi" in res.json()["extracted_text"]

    @pytest.mark.asyncio
    async def test_multi_tier_serp_cache_store_and_retrieve(self):
        from app.core.cache import get_serp_cache, set_serp_cache
        dummy_query = "uji coba redis multi tier cache 2026"
        dummy_docs = [{"rank_position": 1, "page_title": "Doc 1", "clean_text": "Isi"}]

        await set_serp_cache(dummy_query, dummy_docs, ttl_seconds=60)
        retrieved = await get_serp_cache(dummy_query)
        assert retrieved is not None
        assert len(retrieved) == 1
        assert retrieved[0]["page_title"] == "Doc 1"

    @pytest.mark.asyncio
    async def test_multi_tier_nlp_preproc_cache_store_and_retrieve(self):
        from app.core.cache import get_nlp_preproc_cache, set_nlp_preproc_cache
        raw_text = "Menikmati secangkir kopi tubruk hangat"
        stemmed_text = "nikmat cangkir kopi tubruk hangat"

        await set_nlp_preproc_cache(raw_text, stemmed_text, ttl_seconds=60)
        retrieved = await get_nlp_preproc_cache(raw_text)
        assert retrieved == stemmed_text


# =====================================================================
# 6. PENGUJIAN SPRINT 3.0: SERP LIVE INTEGRITY, AUDIT SUMMARY & T7 BUG
# =====================================================================

class TestSprint3SerpLiveIntegrity:
    """Pengujian SERP Top 10, audit summary breakdown, perbaikan T7, dan mode demo offline."""

    def test_serp_audit_summary_and_source_in_response(self, client):
        """Memastikan response memuat serp_source dan serp_audit_summary breakdown."""
        draft = (
            "Kopi tubruk tradisional Indonesia diseduh air mendidih bermutu tinggi dengan rasio satu banding lima belas. "
        ) * 25  # ~375 kata

        payload = {
            "target_query": "cara membuat kopi tubruk nikmat",
            "draft_title": "Uji SERP Audit Summary",
            "draft_content": draft,
        }
        res = client.post("/api/v1/audit/execute", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "serp_source" in data
        assert data["serp_source"] in ("live", "offline_curated", "offline_synthetic")
        assert "serp_audit_summary" in data
        summary = data["serp_audit_summary"]
        assert summary is not None
        assert "skipped_video_social_count" in summary
        assert "skipped_pdf_doc_count" in summary
        assert "skipped_proxy_count" in summary
        assert "skipped_short_text_count" in summary
        assert "skipped_bot_protect_count" in summary
        assert "total_candidates_evaluated" in summary

    def test_classify_url_skip_proxy_and_redirect_domains(self):
        """Sprint 3.8 & 3.9: classify_url_skip_reason menyaring domain penerjemah & proxy, namun mengizinkan Google goto redirects."""
        from app.services.serp_scraper import classify_url_skip_reason, is_valid_article_url

        proxy_urls = [
            "https://translate.google.com/translate?u=https://example.com/article",
            "https://translate.google.co.id/translate?hl=id",
            "https://webcache.googleusercontent.com/search?q=cache:abc",
            "https://www.bing.com/ck/a?!&&p=123",
            "https://search.yahoo.com/search?p=test",
        ]
        for u in proxy_urls:
            assert classify_url_skip_reason(u) == "search_engine_proxy", f"URL {u} harus diklasifikasikan search_engine_proxy"
            assert not is_valid_article_url(u), f"URL {u} tidak boleh dianggap valid article"

        # Sprint 3.9: Google goto redirects diizinkan agar di-resolve oleh fetch_page_content
        google_goto_urls = [
            "https://www.google.com/goto?url=CAESegHrOzAVII1iyg3GcByvHC8WPeJH8hcUOgnxkDL7ZMLPjb4w",
            "https://google.co.id/goto?url=CAESegHrOzAVII1iyg3",
        ]
        for u in google_goto_urls:
            assert classify_url_skip_reason(u) is None, f"Google goto URL {u} harus diizinkan (return None)"
            assert is_valid_article_url(u) is True

        valid_urls = [
            "https://arsitektur.uma.ac.id/mengenal-arsitektur-brutalisme/",
            "https://www.dekoruma.com/artikel/12345/arsitektur-brutalism",
        ]
        for u in valid_urls:
            assert classify_url_skip_reason(u) is None, f"URL valid {u} tidak boleh dilewati"
            assert is_valid_article_url(u) is True

    def test_synthetic_corpus_produces_mode_demo_verdict(self, client, monkeypatch):
        """Kueri yang memicu korpus sintetis offline harus menghasilkan verdict_status 'Mode Demo'."""
        from app.core.config import settings
        monkeypatch.setattr(settings, "SERPER_API_KEY", "")
        monkeypatch.setattr(settings, "FEATURE_OFFLINE_CORPUS_FALLBACK", True)

        draft = (
            "Kueri antariksa topik asing yang sangat spesifik dan belum pernah terindeks di sistem lokal WASKITA. "
        ) * 25  # ~375 kata

        payload = {
            "target_query": "kueri antariksa asing xyz 9988",
            "draft_title": "Uji Mode Demo Sintetis",
            "draft_content": draft,
        }
        res = client.post("/api/v1/audit/execute", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["serp_source"] == "offline_synthetic"
        assert data["verdict_status"] == "Mode Demo"

    def test_turn_2_parent_snapshot_t7_fix(self, client):
        """Bug T7: turn >= 2 memakai snapshot induk harus mempertahankan rank_position, domain_name, source_url, page_title."""
        draft = (
            "Kopi tubruk tradisional Indonesia diseduh air mendidih bermutu tinggi dengan rasio satu banding lima belas. "
        ) * 25

        # Turn 1
        payload1 = {
            "target_query": "kopi tubruk",
            "draft_title": "Turn 1 Kopi",
            "draft_content": draft,
        }
        res1 = client.post("/api/v1/audit/execute", json=payload1)
        assert res1.status_code == 200
        data1 = res1.json()
        turn1_id = data1["session_id"]

        # Turn 2 memakai parent_session_id
        payload2 = {
            "target_query": "kopi tubruk",
            "draft_title": "Turn 2 Kopi Revisi",
            "draft_content": draft + " Tambahan sudut pandang unik barista lokal nusantara.",
            "parent_session_id": turn1_id,
            "use_cached_serp": True,
        }
        res2 = client.post("/api/v1/audit/execute", json=payload2)
        assert res2.status_code == 200
        data2 = res2.json()

        assert data2["turn_number"] == 2
        assert len(data2["serp_competitors"]) >= 2
        for comp in data2["serp_competitors"]:
            assert comp["rank_position"] > 0
            assert comp["page_title"] != ""
            assert comp["page_title"] is not None
            assert comp["source_url"] != ""
            assert comp["source_url"] is not None
            assert comp["domain_name"] != ""
            assert comp["domain_name"] is not None


class TestTopicShiftAndOutOfDomainSprint34:
    """
    Sprint 3.4:
    Verifikasi Topic Shift Guard dan penalti CDS Out-of-Domain saat naskah di luar topik
    (misal: Kuil Yunani Klasik) dikirimkan ke dalam sesi yang membahas Tata Letak Kampus.
    """

    def test_topic_shift_in_revision_triggers_guard_and_caps_cds(self, client):
        # Turn 1: Draf bertopik Tata Letak Kampus & Fasilitas Universitas
        campus_draft = (
            "Perencanaan tata letak kampus universitas modern harus memprioritaskan zonasi akademik, "
            "sirkulasi pejalan kaki bebas kendaraan bermotor, ruang terbuka hijau terintegrasi, "
            "serta aksesibilitas gedung rektorat, fakultas teknik, laboratorium riset, dan perpustakaan pusat. "
            "Efisiensi pergerakan mahasiswa antar fakultas dipengaruhi oleh konektivitas koridor ramah pejalan kaki. "
        ) * 10  # ~380 kata

        payload_turn1 = {
            "target_query": "tata letak kampus universitas",
            "draft_title": "Desain Sirkulasi & Tata Letak Kampus Hijau",
            "draft_content": campus_draft,
        }
        res1 = client.post("/api/v1/audit/execute", json=payload_turn1)
        assert res1.status_code == 200
        data1 = res1.json()
        turn1_id = data1["session_id"]

        # Turn 2: Pengguna keliru menempel naskah Kuil Yunani Kuno & Ordo Klasik ke sesi ini
        greek_temple_draft = (
            "Kuil Parthenon di bukit Akropolis Athena merupakan mahakarya agung arsitektur Yunani klasik. "
            "Bangunan suci persembahan Dewi Athena ini menerapkan ordo pilar dorik yang kokoh dengan entablatur marmer. "
            "Proporsi rasio emas diterapkan pada friezes ukiran mitologi, triglif, metope, dan pedimen megah. "
            "Para arsitek Iktinos dan Kallikrates merancang kelengkungan optik entasis pada setiap tiang batu marmer putih. "
        ) * 10  # ~380 kata

        payload_turn2 = {
            "target_query": "tata letak kampus universitas",
            "draft_title": "Keagungan Arsitektur Kuil Yunani Klasik Parthenon",
            "draft_content": greek_temple_draft,
            "parent_session_id": turn1_id,
            "use_cached_serp": True,
        }
        res2 = client.post("/api/v1/audit/execute", json=payload_turn2)
        assert res2.status_code == 200
        data2 = res2.json()

        # Verifikasi Topic Shift Guard aktif
        assert data2["turn_number"] == 2
        assert data2.get("topic_shift_detected") is True
        assert data2.get("is_topic_shift") is True
        assert data2["metrics"]["is_topic_shift"] is True
        assert data2["metrics"]["is_out_of_domain"] is True

        # Skor CDS wajib dipangkas ke batas maksimum 20.0%
        assert data2["metrics"]["content_differentiation_score"] <= 20.0

        # Vonis status wajib menegaskan pergantian topik / out-of-domain
        assert data2["verdict_status"] == "Perlu Revisi - Topik Tidak Relevan"

        # Degradation warning harus memuat notifikasi peringatan pergantian topik
        assert data2["degradation_warning"] is not None
        assert "pergantian topik" in data2["degradation_warning"] or "tidak relevan" in data2["degradation_warning"]



