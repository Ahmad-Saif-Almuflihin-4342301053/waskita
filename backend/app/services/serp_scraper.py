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
from app.fixtures.benchmark_corpus import get_fallback_corpus

logger = logging.getLogger(__name__)

# FR-04: Domain yang dilarang/bukan artikel blog/informasional
BLOCKED_DOMAINS = {
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
}

BLOCKED_EXTENSIONS = (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar")


def is_valid_article_url(url: str) -> bool:
    """FR-04: Memvalidasi apakah URL merupakan artikel web dan bukan video/sosmed/ecommerce/dokumen."""
    if not url or not url.startswith("http"):
        return False
    try:
        parsed = urlparse(url.lower())
        domain = parsed.netloc
        if domain.startswith("www."):
            domain_no_www = domain[4:]
        else:
            domain_no_www = domain

        for blocked in BLOCKED_DOMAINS:
            if domain == blocked or domain.endswith("." + blocked) or domain_no_www == blocked:
                return False

        path = parsed.path
        for ext in BLOCKED_EXTENSIONS:
            if path.endswith(ext):
                return False

        return True
    except Exception:
        return False


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
    Jika status >= 400 atau timeout, fallback ke curl_cffi AsyncSession (chrome120 impersonation).
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
            else:
                logger.warning(f"HTTPX failed with status {resp.status_code} on {url}")
    except Exception as e:
        logger.warning(f"HTTPX fetch error on {url}: {e}")

    # Attempt 2: Fallback curl_cffi chrome120
    if (not html_content or status_code >= 400) and settings.FEATURE_CURL_CFFI_FALLBACK:
        try:
            from curl_cffi.requests import AsyncSession
            async with AsyncSession(impersonate="chrome120") as s:
                resp = await s.get(url, timeout=8.0)
                status_code = resp.status_code
                if resp.status_code == 200:
                    html_content = resp.text
                    fetch_method = "fallback_curl_cffi"
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


async def search_and_scrape_competitors(target_query: str) -> List[Dict[str, Any]]:
    """
    Mengambil Top 3 artikel kompetitor:
    1. Mencari lewat Serper.dev API (gl='id', hl='id', num=10) jika ada SERPER_API_KEY.
    2. Memfilter domain non-artikel (FR-04).
    3. Mengunduh secara paralel (asyncio.gather timeout 7s) via HTTPX + fallback curl_cffi.
    4. Jika SERPER_API_KEY tidak ada atau gagal, gunakan Fallback Korpus Lokal (FR-13 & NFR-06).
    """
    if not settings.SERPER_API_KEY:
        logger.info(f"Using offline benchmark fallback corpus for query: {target_query}")
        return get_fallback_corpus(target_query)

    try:
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": settings.SERPER_API_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "q": target_query,
            "gl": "id",
            "hl": "id",
            "num": 10,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Serper.dev returned {resp.status_code}, falling back to curated corpus.")
                return get_fallback_corpus(target_query)
            data = resp.json()

        organic_results = data.get("organic", [])
        candidate_urls = []
        for item in organic_results:
            link = item.get("link", "")
            if is_valid_article_url(link):
                candidate_urls.append(item)
                if len(candidate_urls) == 3:
                    break

        if len(candidate_urls) < 2:
            logger.warning("Fewer than 2 valid organic article URLs found from SERP. Using curated corpus.")
            return get_fallback_corpus(target_query)

        # Scrape paralel maksimal 3 artikel kandidat
        tasks = [fetch_page_content(item["link"]) for item in candidate_urls]
        fetched_results = await asyncio.gather(*tasks, return_exceptions=True)

        scraped_docs = []
        for rank, (meta, res) in enumerate(zip(candidate_urls, fetched_results), start=1):
            if isinstance(res, Exception) or not isinstance(res, dict) or res.get("fetch_status") == "failed":
                continue

            domain = urlparse(meta.get("link", "")).netloc
            doc = {
                "rank_position": rank,
                "page_title": meta.get("title", f"Kompetitor {rank}"),
                "source_url": meta.get("link", ""),
                "domain_name": domain,
                "snippet_text": meta.get("snippet", ""),
                "clean_text": res.get("clean_text", ""),
                "headings": res.get("headings", []),
                "word_count": res.get("word_count", 0),
                "fetch_status": res.get("fetch_status", "success"),
                "http_status_code": res.get("http_status_code", 200),
                "main_text_hash": res.get("main_text_hash", ""),
            }
            scraped_docs.append(doc)

        if len(scraped_docs) >= 2:
            return scraped_docs
        else:
            logger.warning("Scraping live articles yielded < 2 usable documents. Reverting to fallback corpus.")
            return get_fallback_corpus(target_query)

    except Exception as e:
        logger.error(f"Error in search_and_scrape_competitors: {e}. Reverting to fallback corpus.")
        return get_fallback_corpus(target_query)
