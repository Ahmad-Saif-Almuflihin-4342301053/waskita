from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "WASKITA"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security & Auth
    SECRET_KEY: str = "waskita_secret_development_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database
    DATABASE_URL: str = "sqlite:///./waskita.db"

    # Redis & Multi-Tier Caching (Fase 1 Production Roadmap)
    REDIS_URL: Optional[str] = None
    CACHE_TTL_SERP_SECONDS: int = 86400  # 24 Jam
    CACHE_TTL_NLP_SECONDS: int = 604800  # 7 Hari

    # Scraper & Engine Feature Flags
    SERP_TOP_K: int = 10
    SERP_MIN_DOC_WORDS: int = 150
    MAX_CRAWL_DEPTH: int = 1
    REQUEST_TIMEOUT: int = 15
    USER_AGENT: str = "Waskita-Auditor/1.0"
    FEATURE_CURL_CFFI_FALLBACK: bool = True
    FEATURE_SERP_CACHE: bool = True
    FEATURE_OFFLINE_CORPUS_FALLBACK: bool = True
    SERPER_API_KEY: Optional[str] = None

    # Global Default Thresholds (Tabel 3.5 & FR-10)
    DEFAULT_MAX_COSINE_SIMILARITY: float = 0.60
    DEFAULT_MIN_MATTR: float = 0.55
    DEFAULT_MAX_HKO_PERCENTAGE: float = 40.0
    DEFAULT_MIN_CDS_SCORE: float = 75.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
