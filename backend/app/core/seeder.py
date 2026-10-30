import datetime
import json
import logging
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.entities import (
    AuditSession,
    CompetitorDocument,
    CompetitorSnapshot,
    EntityGap,
    MetricResult,
    User,
)

logger = logging.getLogger(__name__)


def seed_initial_demo_data():
    """Membuat tabel otomatis dan melakukan seeding akun demo & riwayat contoh."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed demo users
        users_to_seed = [
            ("author_demo", "author@waskita.id", "author", "Personal Plan"),
            ("editor_demo", "editor@waskita.id", "editor", "Editorial Pro"),
            ("admin_demo", "admin@waskita.id", "admin", "Enterprise Admin"),
        ]
        for uname, email, role, plan in users_to_seed:
            existing = db.query(User).filter(User.username == uname).first()
            if not existing:
                u = User(
                    username=uname,
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role=role,
                    plan_tier=plan,
                )
                db.add(u)
        db.commit()

        # 2. Seed 2 riwayat sesi contoh untuk author_demo (selaras mockup Mokly)
        author_user = db.query(User).filter(User.username == "author_demo").first()
        if author_user:
            demo_sessions_count = (
                db.query(AuditSession)
                .filter(AuditSession.user_id == author_user.user_id)
                .count()
            )
            if demo_sessions_count == 0:
                # Sesi 1: Resep Kopi Tubruk Tradisional (Perlu Revisi - Turn 1)
                s1_id = "8f14e45f-ceea-467f-a8f1-44c09e08b912"
                s1 = AuditSession(
                    session_id=s1_id,
                    user_id=author_user.user_id,
                    parent_session_id=None,
                    turn_number=1,
                    target_query="resep kopi tubruk tradisional",
                    draft_title="Resep Kopi Tubruk Tradisional & Takaran Pas",
                    draft_content="Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring. Banyak orang menyukai kopi tubruk karena aromanya yang pekat dan cara pembuatannya yang sangat mudah sekali. Namun jika salah takaran, rasanya bisa menjadi terlalu pahit dan getir di lidah.",
                    draft_word_count=412,
                    audit_timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                    verdict_status="Perlu Revisi",
                    is_pinned=True,
                    degradation_warning=None,
                    annotated_spans_json=json.dumps([
                        {"text": "Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring.", "color": None, "label": None},
                        {"text": "Banyak orang menyukai kopi tubruk karena aromanya yang pekat dan cara pembuatannya yang sangat mudah sekali.", "color": "yellow", "label": "Klise/Generik"},
                        {"text": "Namun jika salah takaran, rasanya bisa menjadi terlalu pahit dan getir di lidah.", "color": "blue", "label": "Kosakata Monoton"},
                        {"text": "Cara membuat kopi tubruk tanpa ampas naik ke permukaan dan langkah mudah menyeduhnya...", "color": "red", "label": "Redundansi VSM Tinggi"}
                    ]),
                    remediation_prompt="Tolong tulis ulang paragraf pembuka artikel kopi tubruk ini agar lebih tajam dan kaya gaya stilometri.\nWajib sertakan poin penting berikut:\n1. Suhu seduh air ideal (90-94°C) dan rasio bubuk:air (1:15).\n2. Tekankan keunikan profil rasa Robusta Dampit.\n3. Hindari kalimat klise 'banyak orang menyukai kopi tubruk'.",
                    thresholds_json=json.dumps({"max_cosine_similarity": 0.60, "min_mattr": 0.55, "max_hko_percentage": 40.0, "min_cds_score": 75.0}),
                )
                db.add(s1)

                m1 = MetricResult(
                    session_id=s1_id,
                    avg_cosine_similarity=0.44,
                    max_cosine_similarity=0.48,
                    euclidean_distance=1.02,
                    ttr_score=0.53,
                    mattr_score=0.61,
                    hko_percentage=25.0,
                    content_differentiation_score=70.0,
                    is_redundant=False,
                    is_keyword_stuffed=False,
                )
                db.add(m1)

                snap1 = CompetitorSnapshot(
                    session_id=s1_id,
                    query_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    search_engine="Google Indonesia",
                    serp_locale="id-ID",
                    total_retrieved=3,
                    snapshot_time=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                )
                db.add(snap1)
                db.flush()

                cd1 = CompetitorDocument(
                    snapshot_id=snap1.snapshot_id,
                    rank_position=1,
                    source_url="https://id.example.com/kopi-tubruk-nikmat",
                    domain_name="id.example.com",
                    page_title="Cara Membuat Kopi Tubruk yang Enak dan Pas Mantap",
                    snippet_text="Kunci kopi tubruk nikmat ada pada kesegaran gilingan dan air mendidih yang didiamkan sebentar...",
                    word_count=820,
                    cosine_similarity=0.48,
                    clean_text="Kopi tubruk adalah minuman khas Indonesia...",
                    fetch_status="success",
                    http_status_code=200,
                )
                db.add(cd1)

                db.add(EntityGap(session_id=s1_id, entity_type="deficit", term_string="takaran suhu 90c", term_surface_form="Takaran Suhu 90°C", tfidf_weight=0.84, competitor_consensus_count=3))
                db.add(EntityGap(session_id=s1_id, entity_type="deficit", term_string="rasio seduh 1 15", term_surface_form="Rasio Seduh 1:15", tfidf_weight=0.79, competitor_consensus_count=2))
                db.add(EntityGap(session_id=s1_id, entity_type="gain", term_string="robusta dampit", term_surface_form="Robusta Dampit", tfidf_weight=0.91, competitor_consensus_count=0))

                # Sesi 2: Kanker Serviks Deteksi Dini (Siap Terbit - Turn 2)
                s2_id = "4a2b910e-8f2c-49aa-9d21-f09b52a12911"
                s2 = AuditSession(
                    session_id=s2_id,
                    user_id=author_user.user_id,
                    parent_session_id=None,
                    turn_number=2,
                    target_query="gejala kanker serviks stadium awal",
                    draft_title="Panduan Komprehensif Skrining Kanker Serviks & Pap Smear",
                    draft_content="Kanker leher rahim atau serviks merupakan salah satu keganasan ginekologis paling lazim pada populasi perempuan. Melalui vaksinasi Human Papillomavirus (HPV) rekombinan serta deteksi dini menggunakan inspeksi visual asam asetat (IVA) dan apusan Pap smear sitologis, morbiditas dapat ditekan secara signifikan.",
                    draft_word_count=650,
                    audit_timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=45),
                    verdict_status="Siap Terbit",
                    is_pinned=False,
                    degradation_warning=None,
                    annotated_spans_json=json.dumps([
                        {"text": "Kanker leher rahim atau serviks merupakan salah satu keganasan ginekologis paling lazim pada populasi perempuan.", "color": "green", "label": "Orisinalitas Kuat"},
                        {"text": "Melalui vaksinasi Human Papillomavirus (HPV) rekombinan serta deteksi dini menggunakan tes IVA...", "color": "green", "label": "Orisinalitas Kuat"}
                    ]),
                    remediation_prompt="Draf untuk kueri 'gejala kanker serviks stadium awal' telah memenuhi standar kurasi pra-publikasi WASKITA (Skor: 88.5%). Artikel siap dipublikasikan.",
                    thresholds_json=json.dumps({"max_cosine_similarity": 0.60, "min_mattr": 0.55, "max_hko_percentage": 40.0, "min_cds_score": 75.0}),
                )
                db.add(s2)

                m2 = MetricResult(
                    session_id=s2_id,
                    avg_cosine_similarity=0.35,
                    max_cosine_similarity=0.42,
                    euclidean_distance=1.18,
                    ttr_score=0.68,
                    mattr_score=0.72,
                    hko_percentage=20.0,
                    content_differentiation_score=88.5,
                    is_redundant=False,
                    is_keyword_stuffed=False,
                )
                db.add(m2)

                db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial demo data: {e}")
    finally:
        db.close()
