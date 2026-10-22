"""
Integration & Contract Verification Tests: Multi-Turn Session Thread & Sprint 2 Contracts
Dokumen: TECHNICAL_BLUEPRINT_WASKITA_SPRINT2.md (Bab 3.1 & Bab 3.3)
GitHub Issue: #10 (QA & Verification Engineer)
"""

import datetime
import json
import uuid
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.entities import (
    AuditSession,
    CompetitorDocument,
    CompetitorSnapshot,
    EntityGap,
    MetricResult,
    User,
)
from app.schemas.audit import AnnotatedSpan, ThresholdConfig


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_header(client):
    """Token autentikasi demo author untuk pengujian endpoint terproteksi."""
    res = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "author_demo", "password": "password123"},
    )
    assert res.status_code == 200, "Login demo author harus berhasil"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_competitor_serp():
    """Mock korpus 3 kompetitor SERP agar execute_audit berjalan deterministik & cepat."""
    return [
        {
            "rank_position": 1,
            "page_title": "Panduan Kopi Tubruk Tradisional Komprehensif",
            "source_url": "https://serp1.example.com/kopi-tubruk",
            "domain_name": "serp1.example.com",
            "snippet_text": "Resep racikan kopi tubruk robusta dampit mantap.",
            "clean_text": (
                "Kopi tubruk tradisional diseduh menggunakan bubuk kopi robusta dampit berkualitas tinggi. "
                "Suhu air ideal berkisar sembilan puluh derajat celcius agar aroma cokelat karamel tidak hangus. "
                "Rasio seduhan satu banding lima belas menjamin kekentalan rasa yang mantap dan seimbang. "
                "Biarkan ampas mengendap sempurna selama empat menit sebelum dinikmati bersama camilan santai."
            ),
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 2,
            "page_title": "Karakteristik Kopi Tubruk Khas Indonesia",
            "source_url": "https://serp2.example.com/kopi-tubruk",
            "domain_name": "serp2.example.com",
            "snippet_text": "Mengenal seduhan tanpa saring warisan nusantara.",
            "clean_text": (
                "Kopi tubruk adalah metode penyeduhan tradisional nusantara tanpa filter kertas. "
                "Cita rasa kopi tubruk dipengaruhi oleh kehalusan gilingan bubuk kopi dan suhu air panas. "
                "Endapan ampas kopi di dasar cangkir memberikan sensasi tekstur pekat yang autentik."
            ),
            "fetch_status": "success",
            "http_status_code": 200,
        },
        {
            "rank_position": 3,
            "page_title": "Tips Menyeduh Kopi Tubruk yang Gurih",
            "source_url": "https://serp3.example.com/kopi-tubruk",
            "domain_name": "serp3.example.com",
            "snippet_text": "Suhu seduh kopi tubruk dan waktu seduh.",
            "clean_text": (
                "Untuk membuat kopi tubruk yang nikmat, gunakan air dengan suhu sekitar sembilan puluh lima derajat. "
                "Aduk perlahan setelah air dituang agar seluruh partikel bubuk kopi terekstraksi maksimal."
            ),
            "fetch_status": "success",
            "http_status_code": 200,
        },
    ]


class TestSessionThreadAndSprint2Contracts:
    """
    Rangkaian Uji Endpoint GET /api/v1/sessions/{session_id}/thread & Kontrak Sprint 2:
    - Multi-turn Turn #1 dan Turn #2 dikembalikan lengkap berurutan.
    - draft_content dan score_cds / metrics.content_differentiation_score terisi valid.
    - Penelusuran thread berfungsi baik dari ID Turn #1 maupun ID Turn #2.
    - Validasi penanganan 404 pada ID yang tidak ditemukan.
    """

    def test_get_session_thread_sequential_turn1_and_turn2(self, client):
        """
        Uji endpoint GET /api/v1/sessions/{session_id}/thread memastikan
        multi-turn Turn #1 dan Turn #2 dikembalikan lengkap berurutan beserta
        draft_content dan score_cds.
        """
        db = SessionLocal()
        user = db.query(User).filter(User.username == "author_demo").first()
        assert user is not None

        turn1_id = str(uuid.uuid4())
        turn2_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow()

        draft1_content = (
            "Draf naskah Turn 1: Kopi tubruk adalah minuman khas nusantara yang diseduh langsung. "
            "Namun tulisan ini masih membutuhkan perbaikan gaya leksikal dan variasi kalimat agar "
            "mencapai ambang batas Layak Terbit pada sistem audit WASKITA."
        )
        draft2_content = (
            "Draf naskah Turn 2: Kopi tubruk tradisional diseduh menggunakan biji robusta dampit "
            "pilihan dengan rasio seduhan satu banding lima belas. Variasi kosakata ditingkatkan "
            "secara signifikan dan entitas defisit telah dilengkapi."
        )

        # 1. Simpan Turn 1 (Root, parent_session_id=None, turn_number=1)
        s1 = AuditSession(
            session_id=turn1_id,
            user_id=user.user_id,
            parent_session_id=None,
            turn_number=1,
            target_query="resep kopi tubruk nusantara",
            draft_title="Panduan Kopi Tubruk - Turn #1",
            draft_content=draft1_content,
            draft_word_count=310,
            audit_timestamp=now,
            verdict_status="Perlu Revisi",
            is_pinned=False,
            thresholds_json=json.dumps(ThresholdConfig().model_dump()),
            annotated_spans_json=json.dumps([
                {"text": "kopi tubruk", "color": "yellow", "reason": "Klise/Generik"}
            ]),
        )
        m1 = MetricResult(
            session_id=turn1_id,
            avg_cosine_similarity=0.74,
            max_cosine_similarity=0.81,
            euclidean_distance=1.1,
            ttr_score=0.48,
            mattr_score=0.51,
            hko_percentage=48.0,
            content_differentiation_score=58.5,
            is_redundant=True,
            is_keyword_stuffed=False,
        )
        db.add(s1)
        db.add(m1)

        # 2. Simpan Turn 2 (Child, parent_session_id=turn1_id, turn_number=2)
        s2 = AuditSession(
            session_id=turn2_id,
            user_id=user.user_id,
            parent_session_id=turn1_id,
            turn_number=2,
            target_query="resep kopi tubruk nusantara",
            draft_title="Panduan Kopi Tubruk - Turn #2 (Revisi)",
            draft_content=draft2_content,
            draft_word_count=345,
            audit_timestamp=now + datetime.timedelta(minutes=5),
            verdict_status="Siap Terbit",
            is_pinned=False,
            thresholds_json=json.dumps(ThresholdConfig().model_dump()),
            annotated_spans_json=json.dumps([
                {"text": "robusta dampit", "color": "green", "reason": "Entitas Gain Unik"}
            ]),
        )
        m2 = MetricResult(
            session_id=turn2_id,
            avg_cosine_similarity=0.58,
            max_cosine_similarity=0.62,
            euclidean_distance=1.4,
            ttr_score=0.62,
            mattr_score=0.68,
            hko_percentage=22.0,
            content_differentiation_score=82.4,
            is_redundant=False,
            is_keyword_stuffed=False,
        )
        db.add(s2)
        db.add(m2)
        db.commit()

        # Query A: Panggil endpoint /thread menggunakan ID Turn 1
        res_t1 = client.get(f"/api/v1/sessions/{turn1_id}/thread")
        assert res_t1.status_code == 200, f"Thread call gagal: {res_t1.text}"
        thread_data_1 = res_t1.json()
        assert isinstance(thread_data_1, list)
        assert len(thread_data_1) == 2, "Harus mengembalikan 2 turn lengkap"

        # Verifikasi urutan turn (Turn #1 lalu Turn #2)
        assert thread_data_1[0]["turn_number"] == 1
        assert thread_data_1[1]["turn_number"] == 2
        assert thread_data_1[0]["session_id"] == turn1_id
        assert thread_data_1[1]["session_id"] == turn2_id
        assert thread_data_1[0]["parent_session_id"] is None
        assert thread_data_1[1]["parent_session_id"] == turn1_id

        # Verifikasi draft_content lengkap pada masing-masing turn
        assert thread_data_1[0]["draft_content"] == draft1_content
        assert thread_data_1[1]["draft_content"] == draft2_content
        assert "Turn 1" in thread_data_1[0]["draft_content"]
        assert "Turn 2" in thread_data_1[1]["draft_content"]

        # Verifikasi skor CDS pada masing-masing turn
        assert thread_data_1[0]["metrics"]["content_differentiation_score"] == 58.5
        assert thread_data_1[1]["metrics"]["content_differentiation_score"] == 82.4
        assert thread_data_1[0]["verdict_status"] == "Perlu Revisi"
        assert thread_data_1[1]["verdict_status"] == "Siap Terbit"

        # Query B: Panggil endpoint /thread menggunakan ID Turn 2 (menelusuri ke root lalu ke bawah)
        res_t2 = client.get(f"/api/v1/sessions/{turn2_id}/thread")
        assert res_t2.status_code == 200
        thread_data_2 = res_t2.json()
        assert len(thread_data_2) == 2
        assert thread_data_2[0]["turn_number"] == 1
        assert thread_data_2[1]["turn_number"] == 2
        assert thread_data_2[0]["draft_content"] == draft1_content
        assert thread_data_2[1]["draft_content"] == draft2_content

    def test_get_session_thread_with_three_turns(self, client):
        """Uji rangkaian 3 turn (Turn 1 -> Turn 2 -> Turn 3) dikembalikan berurutan dari node mana pun."""
        db = SessionLocal()
        user = db.query(User).filter(User.username == "author_demo").first()
        now = datetime.datetime.utcnow()

        t1_id = str(uuid.uuid4())
        t2_id = str(uuid.uuid4())
        t3_id = str(uuid.uuid4())

        s1 = AuditSession(
            session_id=t1_id,
            user_id=user.user_id,
            parent_session_id=None,
            turn_number=1,
            target_query="uji multi-turn 3 langkah",
            draft_title="Artikel Turn 1",
            draft_content="Teks turn pertama...",
            draft_word_count=305,
            audit_timestamp=now,
            verdict_status="Perlu Revisi",
            is_pinned=False,
        )
        s2 = AuditSession(
            session_id=t2_id,
            user_id=user.user_id,
            parent_session_id=t1_id,
            turn_number=2,
            target_query="uji multi-turn 3 langkah",
            draft_title="Artikel Turn 2",
            draft_content="Teks turn kedua perbaikan...",
            draft_word_count=320,
            audit_timestamp=now + datetime.timedelta(minutes=2),
            verdict_status="Perlu Revisi",
            is_pinned=False,
        )
        s3 = AuditSession(
            session_id=t3_id,
            user_id=user.user_id,
            parent_session_id=t2_id,
            turn_number=3,
            target_query="uji multi-turn 3 langkah",
            draft_title="Artikel Turn 3 Final",
            draft_content="Teks turn ketiga siap terbit...",
            draft_word_count=350,
            audit_timestamp=now + datetime.timedelta(minutes=4),
            verdict_status="Siap Terbit",
            is_pinned=False,
        )
        db.add_all([s1, s2, s3])
        db.commit()

        # Query dari turn tengah (Turn 2)
        res = client.get(f"/api/v1/sessions/{t2_id}/thread")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 3
        assert [d["turn_number"] for d in data] == [1, 2, 3]
        assert data[0]["draft_content"] == "Teks turn pertama..."
        assert data[1]["draft_content"] == "Teks turn kedua perbaikan..."
        assert data[2]["draft_content"] == "Teks turn ketiga siap terbit..."

    def test_get_session_thread_not_found_returns_404(self, client):
        """Memanggil /thread dengan ID sesi yang tidak ada mengembalikan HTTP 404."""
        random_id = str(uuid.uuid4())
        res = client.get(f"/api/v1/sessions/{random_id}/thread")
        assert res.status_code == 404
        assert "tidak ditemukan" in res.json()["detail"]

    def test_sessions_list_contract_score_cds_and_grouping(self, client, auth_header):
        """
        Uji kontrak GET /api/v1/sessions:
        - Memastikan field score_cds dan content_differentiation_score ada dan nilainya konsisten.
        - Memastikan perwakilan sesi dikembalikan dengan turn_number terbaru per thread.
        """
        res = client.get("/api/v1/sessions", headers=auth_header)
        assert res.status_code == 200
        sessions = res.json()
        assert len(sessions) > 0

        for item in sessions:
            assert "score_cds" in item
            assert "content_differentiation_score" in item
            assert item["score_cds"] == item["content_differentiation_score"]
            assert "session_id" in item
            assert "draft_title" in item
            assert "turn_number" in item

    def test_execute_audit_full_flow_multi_turn_thread(self, client, auth_header, mock_competitor_serp):
        """
        Uji alur nyata execute_audit Turn #1 diikuti Turn #2 melalui API (Multi-Turn),
        kemudian mengambil thread via GET /sessions/{id}/thread.
        """
        sample_turn1_draft = (
            "Kopi tubruk adalah sajian kopi hitam tradisional Indonesia yang sangat populer di seluruh kalangan. "
            "Proses pembuatan kopi tubruk sangat sederhana hanya membutuhkan bubuk kopi dan air mendidih. "
            "Namun dalam artikel ini kita akan membahas tips menyeduh kopi tubruk yang nikmat dan pas di lidah. "
        ) * 12  # ~336 kata

        sample_turn2_draft = (
            "Kopi tubruk tradisional diseduh dengan bubuk kopi robusta dampit pilihan kualitas prima asal Jawa Timur. "
            "Gunakan air panas bersuhu sembilan puluh derajat celcius agar keasaman dan aroma cokelat terekstraksi prima. "
            "Rasio seduhan satu banding lima belas menjamin kekentalan mantap tanpa rasa pahit yang berlebihan. "
            "Diamkan selama empat menit hingga ampas kopi mengendap sempurna sebelum dinikmati bersama camilan sore. "
        ) * 10  # ~380 kata

        with patch("app.api.v1.routers.search_and_scrape_competitors", new_callable=AsyncMock) as mock_scrape:
            mock_scrape.return_value = mock_competitor_serp

            # 1. Eksekusi Turn #1
            req_turn1 = {
                "target_query": "resep kopi tubruk nusantara e2e",
                "draft_title": "Draf Kopi E2E - Turn 1",
                "draft_content": sample_turn1_draft,
                "parent_session_id": None,
            }
            res1 = client.post("/api/v1/audit/execute", json=req_turn1, headers=auth_header)
            assert res1.status_code == 200, f"Turn 1 execute gagal: {res1.text}"
            data1 = res1.json()
            session1_id = data1["session_id"]
            assert data1["turn_number"] == 1
            assert data1["draft_content"] == sample_turn1_draft.strip()
            assert "content_differentiation_score" in data1["metrics"]

            # 2. Eksekusi Turn #2 (merujuk parent_session_id = session1_id)
            req_turn2 = {
                "target_query": "resep kopi tubruk nusantara e2e",
                "draft_title": "Draf Kopi E2E - Turn 2 Revisi",
                "draft_content": sample_turn2_draft,
                "parent_session_id": session1_id,
            }
            res2 = client.post("/api/v1/audit/execute", json=req_turn2, headers=auth_header)
            assert res2.status_code == 200, f"Turn 2 execute gagal: {res2.text}"
            data2 = res2.json()
            session2_id = data2["session_id"]
            assert data2["turn_number"] == 2
            assert data2["parent_session_id"] == session1_id
            assert data2["draft_content"] == sample_turn2_draft.strip()

            # 3. Panggil GET /api/v1/sessions/{session2_id}/thread
            thread_res = client.get(f"/api/v1/sessions/{session2_id}/thread")
            assert thread_res.status_code == 200
            thread_items = thread_res.json()
            assert len(thread_items) >= 2

            # Temukan Turn 1 dan Turn 2 di dalam thread
            turn_numbers = [item["turn_number"] for item in thread_items]
            assert 1 in turn_numbers
            assert 2 in turn_numbers

            t1_found = next(item for item in thread_items if item["session_id"] == session1_id)
            t2_found = next(item for item in thread_items if item["session_id"] == session2_id)

            assert t1_found["draft_content"] == sample_turn1_draft.strip()
            assert t2_found["draft_content"] == sample_turn2_draft.strip()
            assert t1_found["metrics"]["content_differentiation_score"] > 0
            assert t2_found["metrics"]["content_differentiation_score"] > 0
