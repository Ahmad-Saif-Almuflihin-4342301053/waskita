"""
Multi-Tier Cache Provider (Fase 1 Production Roadmap)
Menyediakan abstraksi Cache-Aside untuk SERP Snapshot & Hasil Pra-pemrosesan Sastrawi.
Mendukung:
1. Redis (Production scale jika REDIS_URL diset di .env)
2. In-Memory TTL Cache (Local / Offline / Sidang TA dengan graceful fallback otomatis)
"""
import hashlib
import json
import logging
import time
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class MemoryCacheEntry:
    def __init__(self, value: Any, expire_at: float):
        self.value = value
        self.expire_at = expire_at

    def is_expired(self) -> bool:
        return time.time() > self.expire_at


class MultiTierCache:
    def __init__(self):
        self._memory_store: Dict[str, MemoryCacheEntry] = {}
        self._redis_client = None
        self._redis_available: Optional[bool] = None

    async def _get_redis(self):
        if not settings.REDIS_URL:
            return None
        if self._redis_available is False:
            return None
        if self._redis_client is None:
            try:
                import redis.asyncio as aioredis
                self._redis_client = aioredis.from_url(
                    settings.REDIS_URL,
                    socket_connect_timeout=2.0,
                    decode_responses=True,
                )
                await self._redis_client.ping()
                self._redis_available = True
                logger.info("Connected to Redis cache successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Redis at {settings.REDIS_URL}: {e}. Falling back to In-Memory cache.")
                self._redis_available = False
                self._redis_client = None
        return self._redis_client

    async def get(self, key: str) -> Optional[Any]:
        # 1. Coba Redis jika aktif
        redis = await self._get_redis()
        if redis:
            try:
                raw = await redis.get(key)
                if raw is not None:
                    return json.loads(raw)
            except Exception as e:
                logger.warning(f"Redis get error for key '{key}': {e}. Falling back to memory cache.")

        # 2. Cek In-Memory Cache
        entry = self._memory_store.get(key)
        if entry:
            if entry.is_expired():
                del self._memory_store[key]
                return None
            return entry.value
        return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 86400) -> bool:
        serialized = json.dumps(value, ensure_ascii=False)
        # 1. Simpan ke Redis jika aktif
        redis = await self._get_redis()
        if redis:
            try:
                await redis.set(key, serialized, ex=ttl_seconds)
            except Exception as e:
                logger.warning(f"Redis set error for key '{key}': {e}.")

        # 2. Simpan juga ke in-memory store
        self._memory_store[key] = MemoryCacheEntry(value, time.time() + ttl_seconds)

        # Cleanup memory store jika terlalu besar (> 5.000 entitas)
        if len(self._memory_store) > 5000:
            now = time.time()
            self._memory_store = {
                k: v for k, v in self._memory_store.items() if v.expire_at > now
            }
        return True


cache = MultiTierCache()


def _hash_key(prefix: str, text: str) -> str:
    cleaned = text.strip().lower()
    digest = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
    return f"waskita:{prefix}:{digest}"


async def get_serp_cache(target_query: str) -> Optional[List[Dict[str, Any]]]:
    if not settings.FEATURE_SERP_CACHE:
        return None
    key = _hash_key(f"serp:v2:k{settings.SERP_TOP_K}", target_query)
    cached = await cache.get(key)
    if cached and isinstance(cached, list):
        return cached
    return None


async def set_serp_cache(target_query: str, docs: List[Dict[str, Any]], ttl_seconds: Optional[int] = None) -> None:
    if not settings.FEATURE_SERP_CACHE or not docs:
        return
    ttl = ttl_seconds or settings.CACHE_TTL_SERP_SECONDS
    key = _hash_key(f"serp:v2:k{settings.SERP_TOP_K}", target_query)
    await cache.set(key, docs, ttl_seconds=ttl)


async def get_nlp_preproc_cache(text: str) -> Optional[str]:
    if not text:
        return None
    key = _hash_key("nlp:preproc:v1", text)
    cached = await cache.get(key)
    if cached and isinstance(cached, str):
        return cached
    return None


async def set_nlp_preproc_cache(text: str, preprocessed_text: str, ttl_seconds: Optional[int] = None) -> None:
    if not text or not preprocessed_text:
        return
    ttl = ttl_seconds or settings.CACHE_TTL_NLP_SECONDS
    key = _hash_key("nlp:preproc:v1", text)
    await cache.set(key, preprocessed_text, ttl_seconds=ttl)
