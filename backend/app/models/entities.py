import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "USERS"

    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="author")  # 'author' | 'editor' | 'admin'
    plan_tier = Column(String(30), nullable=False, default="Personal Plan")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    sessions = relationship("AuditSession", back_populates="user", cascade="all, delete-orphan")


class AuditSession(Base):
    __tablename__ = "AUDIT_SESSIONS"

    session_id = Column(String(36), primary_key=True, index=True)  # UUID str
    user_id = Column(Integer, ForeignKey("USERS.user_id", ondelete="SET NULL"), nullable=True, index=True)
    parent_session_id = Column(String(36), ForeignKey("AUDIT_SESSIONS.session_id", ondelete="SET NULL"), nullable=True, index=True)
    turn_number = Column(Integer, default=1, nullable=False)
    target_query = Column(String(255), nullable=False, index=True)
    draft_title = Column(String(255), nullable=False)
    draft_content = Column(Text, nullable=False)
    draft_word_count = Column(Integer, nullable=False)
    audit_timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    verdict_status = Column(String(32), nullable=False)  # 'Siap Terbit' | 'Perlu Revisi'
    is_pinned = Column(Boolean, default=False, nullable=False)
    degradation_warning = Column(Text, nullable=True)
    annotated_spans_json = Column(Text, nullable=True)  # JSON serialization
    remediation_prompt = Column(Text, nullable=True)
    thresholds_json = Column(Text, nullable=True)  # JSON serialization

    user = relationship("User", back_populates="sessions")
    parent_session = relationship("AuditSession", remote_side=[session_id], backref="child_sessions")
    metrics = relationship("MetricResult", back_populates="session", uselist=False, cascade="all, delete-orphan")
    snapshot = relationship("CompetitorSnapshot", back_populates="session", uselist=False, cascade="all, delete-orphan")
    entity_gaps = relationship("EntityGap", back_populates="session", cascade="all, delete-orphan")


class MetricResult(Base):
    __tablename__ = "METRIC_RESULTS"

    metric_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    session_id = Column(String(36), ForeignKey("AUDIT_SESSIONS.session_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    avg_cosine_similarity = Column(Float, nullable=False)
    max_cosine_similarity = Column(Float, nullable=False)
    euclidean_distance = Column(Float, nullable=False)
    ttr_score = Column(Float, nullable=False)
    mattr_score = Column(Float, nullable=False)
    hko_percentage = Column(Float, nullable=False)
    content_differentiation_score = Column(Float, nullable=False)
    is_redundant = Column(Boolean, nullable=False, default=False)
    is_keyword_stuffed = Column(Boolean, nullable=False, default=False)

    session = relationship("AuditSession", back_populates="metrics")


class CompetitorSnapshot(Base):
    __tablename__ = "COMPETITOR_SNAPSHOTS"

    snapshot_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    session_id = Column(String(36), ForeignKey("AUDIT_SESSIONS.session_id", ondelete="CASCADE"), nullable=False, index=True)
    query_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    search_engine = Column(String(50), default="Google Indonesia", nullable=False)
    serp_locale = Column(String(16), default="id-ID", nullable=False)
    total_retrieved = Column(Integer, default=0, nullable=False)
    snapshot_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    session = relationship("AuditSession", back_populates="snapshot")
    documents = relationship("CompetitorDocument", back_populates="snapshot", cascade="all, delete-orphan")


class CompetitorDocument(Base):
    __tablename__ = "COMPETITOR_DOCUMENTS"

    document_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    snapshot_id = Column(Integer, ForeignKey("COMPETITOR_SNAPSHOTS.snapshot_id", ondelete="CASCADE"), nullable=False, index=True)
    rank_position = Column(Integer, nullable=False)  # 1, 2, 3
    source_url = Column(Text, nullable=False)
    domain_name = Column(String(120), nullable=False)
    page_title = Column(String(500), nullable=False)
    snippet_text = Column(Text, nullable=True)
    clean_text = Column(Text, nullable=True)
    word_count = Column(Integer, default=0, nullable=False)
    cosine_similarity = Column(Float, nullable=True)  # Disetujui disimpan di SQLite untuk efisiensi dasbor
    main_text_hash = Column(String(64), nullable=True)  # SHA-256
    heading_structure = Column(Text, nullable=True)  # JSON text H1-H3
    fetch_status = Column(String(32), default="success", nullable=False)  # 'success' | 'fallback_curl_cffi' | 'failed'
    http_status_code = Column(Integer, nullable=True)

    snapshot = relationship("CompetitorSnapshot", back_populates="documents")


class EntityGap(Base):
    __tablename__ = "ENTITY_GAPS"

    gap_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    session_id = Column(String(36), ForeignKey("AUDIT_SESSIONS.session_id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(16), nullable=False)  # 'deficit' | 'gain'
    term_string = Column(String(120), nullable=False)
    term_surface_form = Column(String(120), nullable=False)
    tfidf_weight = Column(Float, nullable=False)
    competitor_consensus_count = Column(Integer, default=0, nullable=False)

    session = relationship("AuditSession", back_populates="entity_gaps")
