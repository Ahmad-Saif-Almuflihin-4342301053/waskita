import re
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


def sanitize_xss(text: str) -> str:
    """
    Sanitasi input dari tag script, iframe, objek, event handler berbahaya (Anti-XSS).
    Menghapus tag <script>...</script>, <iframe>, <object>, <embed>, dan event handler seperti onerror/onload.
    """
    if not text:
        return text
    # 1. Hapus blok tag script beserta isinya
    cleaned = re.sub(r"<script[\s\S]*?>[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    # 2. Hapus tag iframe, object, embed, style
    cleaned = re.sub(r"</?(?:iframe|object|embed|style|meta|link)[\s\S]*?>", "", cleaned, flags=re.IGNORECASE)
    # 3. Hapus inline javascript: URIs
    cleaned = re.sub(r"javascript:[^\s\"'>]*", "", cleaned, flags=re.IGNORECASE)
    # 4. Hapus event handlers seperti onerror=..., onclick=..., onload=...
    cleaned = re.sub(r"\bon\w+\s*=\s*([\"'][^\"']*[\"']|[^\s>]+)", "", cleaned, flags=re.IGNORECASE)
    # 5. Hapus sisa tag pembuka/penutup script yang terisolasi
    cleaned = re.sub(r"</?script\b[^>]*>", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


class ThresholdConfig(BaseModel):
    max_cosine_similarity: float = Field(default=0.60, ge=0.0, le=1.0)
    min_mattr: float = Field(default=0.55, ge=0.0, le=1.0)
    max_hko_percentage: float = Field(default=40.0, ge=0.0, le=100.0)
    min_cds_score: float = Field(default=75.0, ge=0.0, le=100.0)


class AuditExecuteRequest(BaseModel):
    target_query: str = Field(..., min_length=2, max_length=255)
    draft_title: str = Field(..., min_length=3, max_length=255)
    draft_content: str = Field(..., min_length=50)
    parent_session_id: Optional[str] = None
    use_cached_serp: bool = True
    thresholds: Optional[ThresholdConfig] = Field(default_factory=ThresholdConfig)

    @field_validator("target_query", "draft_title", "draft_content", mode="before")
    @classmethod
    def sanitize_inputs(cls, v: str) -> str:
        if isinstance(v, str):
            return sanitize_xss(v)
        return v

    @field_validator("draft_content")
    @classmethod
    def validate_word_count(cls, v: str) -> str:
        # Menghitung jumlah kata murni (mengabaikan placeholder media [gambar N], [video N], dsb)
        cleaned_pure = re.sub(
            r"\[(?:gambar|video|foto|tabel|bagan|audio|grafik)\s*\d*[^\]]*\]",
            " ",
            v,
            flags=re.IGNORECASE,
        )
        words = re.findall(r"\b\w+\b", cleaned_pure)
        if len(words) < 300:
            raise ValueError(
                f"Draf artikel Anda hanya memuat {len(words)} kata murni. "
                "Sesuai standar audit WASKITA (FR-02), panjang naskah minimal adalah 300 kata "
                "agar analisis semantik IR dan stilometri dapat dihitung secara valid."
            )
        return v


class MetricResultSchema(BaseModel):
    content_differentiation_score: float
    avg_cosine_similarity: float
    max_cosine_similarity: float
    euclidean_distance: float
    ttr_score: float
    mattr_score: float
    hko_percentage: float
    is_redundant: bool
    is_keyword_stuffed: bool
    is_out_of_domain: bool = False
    topic_shift_detected: bool = False


class EntityGapItem(BaseModel):
    term_string: str
    term_surface_form: str
    tfidf_weight: float
    competitor_consensus_count: int


class EntityGapsGroup(BaseModel):
    deficit: List[EntityGapItem] = Field(default_factory=list)
    gain: List[EntityGapItem] = Field(default_factory=list)


# Tabel 3.6 Proposal TA: 'yellow' | 'red' | 'blue' | 'green'
StabiloColor = Literal["yellow", "red", "blue", "green"]


class AnnotatedSpan(BaseModel):
    text: str
    color: Optional[StabiloColor] = None
    label: Optional[str] = None


class SerpAuditSummary(BaseModel):
    skipped_video_social_count: int = 0
    skipped_pdf_doc_count: int = 0
    skipped_short_text_count: int = 0
    skipped_bot_protect_count: int = 0
    total_candidates_evaluated: int = 0


class SerpCompetitorItem(BaseModel):
    rank_position: int
    page_title: str
    source_url: str
    domain_name: str
    snippet_text: Optional[str] = None
    word_count: int = 0
    cosine_similarity: Optional[float] = None
    fetch_status: str = "success"


class AuditExecuteResponse(BaseModel):
    session_id: str
    parent_session_id: Optional[str] = None
    turn_number: int = 1
    target_query: str
    draft_title: str
    draft_content: str = ""
    draft_word_count: int
    audit_timestamp: str
    verdict_status: str
    degradation_warning: Optional[str] = None
    topic_shift_detected: bool = False
    thresholds: ThresholdConfig
    metrics: MetricResultSchema
    entity_gaps: EntityGapsGroup
    annotated_spans: List[AnnotatedSpan]
    overview_bullets: List[str]
    remediation_prompt: str
    serp_competitors: List[SerpCompetitorItem]
    serp_source: Optional[Literal["live", "offline_curated", "offline_synthetic"]] = "live"
    serp_audit_summary: Optional[SerpAuditSummary] = None


class SessionListItem(BaseModel):
    session_id: str
    turn_number: int
    target_query: str
    draft_title: str
    draft_word_count: int
    audit_timestamp: str
    verdict_status: str
    content_differentiation_score: float
    score_cds: float = 0.0
    is_pinned: bool
    parent_session_id: Optional[str] = None


class UserProfileSchema(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    plan_tier: str
    session_quota: int = 100
    used_sessions: int = 0


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileSchema


class LoginRequest(BaseModel):
    username_or_email: Optional[str] = None
    username: Optional[str] = None
    password: str

    @model_validator(mode="before")
    @classmethod
    def resolve_username_fields(cls, data):
        if isinstance(data, dict):
            u = data.get("username_or_email") or data.get("username")
            if not u:
                raise ValueError("Username atau email wajib diisi.")
            data["username_or_email"] = u
            data["username"] = u
        return data


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = "author"


class SessionUpdatePatch(BaseModel):
    draft_title: Optional[str] = None
    is_pinned: Optional[bool] = None
