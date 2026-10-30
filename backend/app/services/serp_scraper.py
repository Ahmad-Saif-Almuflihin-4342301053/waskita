import asyncio
import hashlib
import json
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
import trafilatura
from lxml import etree

from app.core.config import settings
from app.core.cache import get_serp_cache, set_serp_cache
from app.fixtures.benchmark_corpus import get_fallback_corpus

logger = logging.getLogger(__name__)

# FR-04: Domain video, sosmed, ecommerce
VIDEO_SOCIAL_DOMAINS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "tiktok.com",
    "www.tiktok.com",
    "instagram.com",
    "www.instagram.com",
    "facebook.com",
    "www.facebook.com",
    "twitter.com",
    "www.twitter.com",
    "x.com",
    "www.x.com",
    "shopee.co.id",
    "www.shopee.co.id",
    "tokopedia.com",
    "www.tokopedia.com",
    "bukalapak.com",
    "www.bukalapak.com",
    "lazada.co.id",
    "www.lazada.co.id",
    "blibli.com",
    "www.blibli.com",
    "pinterest.com",
    "www.pinterest.com",
    "linkedin.com",
    "www.linkedin.com",
}

DOC_EXTENSIONS = (
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar"
)
DOC_DOMAINS = {
    "scribd.com",
    "www.scribd.com",
    "academia.edu",
    "www.academia.edu",
    # Sprint 3.10: Ensiklopedia publik diblokir agar tidak mendistorsi bobot TF-IDF artikel komersial
    "wikipedia.org",
    "www.wikipedia.org",
    "id.wikipedia.org",
    "en.wikipedia.org",
}

# Sprint 3.8, 3.9, & 4.0: Domain proxy dan search engine eksternal
SEARCH_ENGINE_PROXY_DOMAINS = {
    "webcache.googleusercontent.com",
    "bing.com",
    "www.bing.com",
    "yahoo.com",
    "www.yahoo.com",
}

BLOCKED_DOMAINS = VIDEO_SOCIAL_DOMAINS | DOC_DOMAINS
BLOCKED_EXTENSIONS = DOC_EXTENSIONS


def classify_url_skip_reason(url: str) -> Optional[str]:
    """
    Mengklasifikasikan alasan URL dilewati sebelum fetch:
    - 'video_social'
    - 'pdf_doc'
    - 'search_engine_proxy'
    - None jika lolos
    """
    if not url or not url.startswith("http"):
        return "invalid_url"
    try:
        # Sprint 3.9: Link redirect resmi Google (/goto?url=) selalu diizinkan agar di-resolve oleh fetcher
        if "google.com/goto?" in url or "google.co.id/goto?" in url:
            return None

        parsed = urlparse(url.lower())
        domain = parsed.netloc
        domain_no_www = domain[4:] if domain.startswith("www.") else domain

        # Sprint 4.0: Google Translate & .translate.goog proxy handling
        # Jika memuat artikel substantif berbahasa Indonesia, jangan diblokir secara prematur
        if "translate.google." in domain or domain.endswith(".translate.goog") or domain == "translate.goog":
            from urllib.parse import parse_qs
            query_params = parse_qs(parsed.query)
            orig_url = query_params.get("u", [None])[0] or query_params.get("url", [None])[0]
            if orig_url:
                orig_skip = classify_url_skip_reason(orig_url)
                if orig_skip:
                    return orig_skip
            return None

        # Filter domain proxy dan search engine lain
        for proxy_dom in SEARCH_ENGINE_PROXY_DOMAINS:
            if domain == proxy_dom or domain.endswith("." + proxy_dom) or domain_no_www == proxy_dom:
                return "search_engine_proxy"

        for blocked in VIDEO_SOCIAL_DOMAINS:
            if domain == blocked or domain.endswith("." + blocked) or domain_no_www == blocked:
                return "video_social"

        for doc_dom in DOC_DOMAINS:
            if domain == doc_dom or domain.endswith("." + doc_dom) or domain_no_www == doc_dom:
                return "pdf_doc"

        path = parsed.path
        for ext in DOC_EXTENSIONS:
            if path.endswith(ext):
                return "pdf_doc"

        return None
    except Exception:
        return "invalid_url"


def is_valid_article_url(url: str) -> bool:
    """FR-04: Memvalidasi apakah URL merupakan artikel web dan bukan video/sosmed/ecommerce/dokumen."""
    return classify_url_skip_reason(url) is None


def _extract_headings_from_html(html_str: str) -> List[Dict[str, str]]:
    """Mengekstrak struktur H1, H2, H3 dari HTML menggunakan lxml."""
    headings = []
    if not html_str:
        return headings
    try:
        parser = etree.HTMLParser(recover=True, encoding="utf-8")
        tree = etree.fromstring(html_str.encode("utf-8"), parser=parser)
        if tree is None:
            return headings
        for el in tree.iter():
            tag = el.tag.lower() if isinstance(el.tag, str) else ""
            if tag in ("h1", "h2", "h3"):
                text = "".join(el.itertext()).strip()
                if text:
                    headings.append({"level": tag.upper(), "text": text})
    except Exception as e:
        logger.warning(f"Heading extraction fallback error: {e}")
    return headings


def _heavy_trafilatura_extract(html_str: str) -> str:
    """
    Operasi CPU berat #1: Ekstraksi teks web bersih dari DOM XML Trafilatura.
    Wajib dieksekusi via asyncio.to_thread!
    """
    if not html_str:
        return ""
    extracted = trafilatura.extract(
        html_str,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
    )
    return extracted or ""


# Korpus fallback diekstrak ke app.fixtures.benchmark_corpus

# --- HTTP Fetcher dengan Fallback curl_cffi ---

async def fetch_page_content(url: str) -> Dict[str, Any]:
    """
    Mengunduh konten HTML halaman URL dengan httpx HTTP/2.
    Jika status >= 400 (khususnya 403, 401), timeout, atau teks kosong,
    langsung fallback seketika ke curl_cffi AsyncSession (chrome120 impersonation).
    """
    result = {
        "source_url": url,
        "clean_text": "",
        "headings": [],
        "word_count": 0,
        "fetch_status": "failed",
        "http_status_code": 0,
        "main_text_hash": "",
    }

    html_content = ""
    fetch_method = "success"
    status_code = 0
    trigger_curl_fallback = False

    # Attempt 1: httpx HTTP/2
    try:
        headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        async with httpx.AsyncClient(http2=True, timeout=7.0, follow_redirects=True, headers=headers) as client:
            resp = await client.get(url)
            status_code = resp.status_code
            if resp.status_code == 200:
                html_content = resp.text
                fetch_method = "success"
                result["source_url"] = str(resp.url)
            elif resp.status_code in (401, 403) or resp.status_code >= 400:
                logger.warning(f"HTTPX blocked/failed with status {resp.status_code} on {url}, falling back to curl_cffi")
                trigger_curl_fallback = True
    except (httpx.TimeoutException, httpx.RequestError) as e:
        logger.warning(f"HTTPX timeout or request error on {url}: {e}, falling back to curl_cffi")
        trigger_curl_fallback = True
    except Exception as e:
        logger.warning(f"HTTPX fetch error on {url}: {e}")
        trigger_curl_fallback = True

    # Attempt 2: Fallback curl_cffi chrome120 seketika saat HTTPX 403/401/timeout/gagal/kosong
    if (trigger_curl_fallback or not html_content or status_code >= 400) and settings.FEATURE_CURL_CFFI_FALLBACK:
        try:
            from curl_cffi.requests import AsyncSession
            async with AsyncSession(impersonate="chrome120") as s:
                resp = await s.get(url, timeout=8.0, allow_redirects=True)
                status_code = resp.status_code
                if resp.status_code == 200 and resp.text:
                    html_content = resp.text
                    fetch_method = "fallback_curl_cffi"
                    if hasattr(resp, "url") and resp.url:
                        result["source_url"] = str(resp.url)
                    logger.info(f"curl_cffi impersonate=chrome120 succeeded on {url}")
                else:
                    logger.warning(f"curl_cffi returned status {resp.status_code} on {url}")
        except Exception as e:
            logger.warning(f"curl_cffi fallback error on {url}: {e}")

    result["http_status_code"] = status_code

    if html_content:
        # CPU berat #1: trafilatura.extract dibungkus to_thread
        clean_text = await asyncio.to_thread(_heavy_trafilatura_extract, html_content)
        headings = _extract_headings_from_html(html_content)

        if clean_text:
            result["clean_text"] = clean_text
            result["headings"] = headings
            result["word_count"] = len(re.findall(r"\b\w+\b", clean_text))
            result["fetch_status"] = fetch_method
            result["main_text_hash"] = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()
        else:
            result["fetch_status"] = "failed"
    else:
        result["fetch_status"] = "failed"

    return result


async def _fetch_serper_page(client: httpx.AsyncClient, query: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """Helper untuk mengambil hasil organik Google per halaman dari Serper.dev."""
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": settings.SERPER_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "q": query,
        "gl": "id",
        "hl": "id",
        "page": page_num,
    }
    try:
        resp = await client.post(url, headers=headers, json=payload, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("organic", [])
        else:
            logger.warning(f"Serper.dev returned {resp.status_code} on page {page_num}")
            return []
    except Exception as e:
        logger.error(f"Error fetching Serper page {page_num}: {e}")
        return []


async def search_and_scrape_competitors(
    target_query: str,
    audit_summary: Optional[Dict[str, int]] = None,
) -> List[Dict[str, Any]]:
    """
    Mengambil Top K artikel kompetitor (default SERP_TOP_K=10):
    1. Mencari lewat Serper.dev API (gl='id', hl='id', num=15) jika ada SERPER_API_KEY.
    2. Memfilter domain non-artikel (video, sosmed, ecommerce, PDF/dokumen).
    3. Seleksi kandidat: maksimal 1 dokumen per domain unik.
    4. Mengunduh secara paralel via HTTPX + fallback curl_cffi seketika.
    5. Menyaring dokumen dengan kata < SERP_MIN_DOC_WORDS (150 kata).
    6. Mengumpulkan metrik ke audit_summary (serp_audit_summary).
    7. Graceful degradation: >=2 dokumen valid -> success; jika gagal dan fallback aktif -> fallback; jika tidak -> raises/returns.
    """
    summary = audit_summary if audit_summary is not None else {}
    for k in (
        "skipped_video_social_count",
        "skipped_pdf_doc_count",
        "skipped_proxy_count",
        "skipped_short_text_count",
        "skipped_bot_protect_count",
        "total_candidates_evaluated",
    ):
        if k not in summary:
            summary[k] = 0

    # Sprint 3.9: Bersihkan kueri dari koma dan ambil frase utama agar Google tidak membatasi hasil secara ekstrem
    clean_query = target_query.split(",")[0].strip() if target_query else ""
    if not clean_query:
        clean_query = target_query.strip() if target_query else ""

    # 0. Cache-Aside Check (Fase 1 Production Roadmap - Redis / Multi-Tier)
    cached_serp = await get_serp_cache(clean_query)
    if cached_serp and len(cached_serp) >= 2:
        logger.info(f"Cache-Aside HIT: SERP snapshot for query '{clean_query}' resolved in < 5ms.")
        return cached_serp

    if not settings.SERPER_API_KEY:
        if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
            logger.warning("SERPER_API_KEY is not configured and FEATURE_OFFLINE_CORPUS_FALLBACK is disabled.")
            return []
        logger.info(f"SERPER_API_KEY is not set. Using offline fallback corpus for query: {clean_query}")
        fallback_docs = get_fallback_corpus(clean_query)
        # SPRINT 3.0: Dokumen offline TIDAK di-cache sebagai data live
        return fallback_docs

    try:
        organic_results: List[Dict[str, Any]] = []
        async with httpx.AsyncClient(timeout=12.0) as client:
            page_1_results = await _fetch_serper_page(client, clean_query, page_num=1)
            organic_results.extend(page_1_results)

            # Hitung kandidat lolos filter awal dari page 1
            valid_p1 = [
                item for item in page_1_results
                if classify_url_skip_reason(item.get("link", "")) is None
            ]

            # Sprint 4.0: Dynamic Pagination jika kandidat bersih page 1 < 8
            if len(valid_p1) < 8:
                logger.info(f"Page 1 yielded {len(valid_p1)} valid candidates (< 8). Fetching page 2...")
                page_2_results = await _fetch_serper_page(client, clean_query, page_num=2)
                organic_results.extend(page_2_results)

                valid_p2 = [
                    item for item in organic_results
                    if classify_url_skip_reason(item.get("link", "")) is None
                ]
                if len(valid_p2) < 8:
                    logger.info(f"Page 1+2 yielded {len(valid_p2)} valid candidates (< 8). Fetching page 3...")
                    page_3_results = await _fetch_serper_page(client, clean_query, page_num=3)
                    organic_results.extend(page_3_results)

        if not organic_results:
            logger.warning("Serper.dev returned 0 organic results across queried pages.")
            if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                return []
            return get_fallback_corpus(clean_query)

        summary["total_candidates_evaluated"] = len(organic_results)

        candidate_urls = []
        candidate_domains = set()

        for item in organic_results:
            link = item.get("link", "")
            skip_reason = classify_url_skip_reason(link)
            if skip_reason == "video_social":
                summary["skipped_video_social_count"] += 1
                continue
            elif skip_reason == "pdf_doc":
                summary["skipped_pdf_doc_count"] += 1
                continue
            elif skip_reason == "search_engine_proxy":
                summary["skipped_proxy_count"] += 1
                continue
            elif skip_reason is not None:
                continue

            parsed_url = urlparse(link.lower())
            domain = parsed_url.netloc
            if domain.startswith("www."):
                domain = domain[4:]

            # Sprint 3.9: Link redirect Google (/goto?url=) diizinkan jamak karena domain tujuan aslinya baru diketahui pasca-fetch
            is_google_goto = "google.com/goto?" in link or "google.co.id/goto?" in link
            if not is_google_goto:
                if domain in candidate_domains:
                    continue
                candidate_domains.add(domain)

            candidate_urls.append(item)
            if len(candidate_urls) >= 15:
                break

        if len(candidate_urls) < 2:
            logger.warning("Fewer than 2 valid candidate URLs found from SERP.")
            if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                return []
            return get_fallback_corpus(clean_query)

        # Scrape paralel seluruh kandidat URL unik
        tasks = [fetch_page_content(item["link"]) for item in candidate_urls]
        fetched_results = await asyncio.gather(*tasks, return_exceptions=True)

        scraped_docs = []
        current_rank = 1
        min_words = settings.SERP_MIN_DOC_WORDS
        seen_domains = set()

        for meta, res in zip(candidate_urls, fetched_results):
            if isinstance(res, Exception) or not isinstance(res, dict):
                summary["skipped_bot_protect_count"] += 1
                continue

            fetch_st = res.get("fetch_status", "failed")
            http_st = res.get("http_status_code", 0)

            if fetch_st == "failed" or not res.get("clean_text"):
                # Gagal fetch atau terkena proteksi bot / firewall
                summary["skipped_bot_protect_count"] += 1
                continue

            # Periksa URL akhir setelah redirect (misal redirect google goto ke detik, youtube, pdf, dll.)
            final_url = res.get("source_url") or meta.get("link", "")
            final_skip = classify_url_skip_reason(final_url)
            if final_skip == "video_social":
                summary["skipped_video_social_count"] += 1
                continue
            elif final_skip == "pdf_doc":
                summary["skipped_pdf_doc_count"] += 1
                continue
            elif final_skip == "search_engine_proxy":
                summary["skipped_proxy_count"] += 1
                continue

            word_count = res.get("word_count", 0)
            if word_count < min_words:
                # Teks terlalu pendek (< SERP_MIN_DOC_WORDS)
                summary["skipped_short_text_count"] += 1
                continue

            # Sprint 3.9: Ambil domain dari URL tujuan akhir untuk deduplikasi seen_domains
            final_parsed = urlparse(final_url.lower())
            final_domain = final_parsed.netloc
            if final_domain.startswith("www."):
                final_domain = final_domain[4:]

            if not final_domain or final_domain in seen_domains:
                continue
            seen_domains.add(final_domain)

            doc = {
                "rank_position": current_rank,
                "page_title": meta.get("title", f"Kompetitor {current_rank}"),
                "source_url": final_url,
                "domain_name": final_domain,
                "snippet_text": meta.get("snippet", ""),
                "clean_text": res.get("clean_text", ""),
                "headings": res.get("headings", []),
                "word_count": word_count,
                "fetch_status": fetch_st,
                "http_status_code": http_st,
                "main_text_hash": res.get("main_text_hash", ""),
            }
            scraped_docs.append(doc)
            current_rank += 1

            if len(scraped_docs) >= settings.SERP_TOP_K:
                break

        if len(scraped_docs) >= 2:
            await set_serp_cache(clean_query, scraped_docs)
            return scraped_docs
        else:
            logger.warning(f"Scraping live articles yielded {len(scraped_docs)} usable documents (< 2).")
            if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                return scraped_docs
            return get_fallback_corpus(clean_query)

    except Exception as e:
        logger.error(f"Error in search_and_scrape_competitors: {e}")
        if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
            return []
        return get_fallback_corpus(clean_query)
