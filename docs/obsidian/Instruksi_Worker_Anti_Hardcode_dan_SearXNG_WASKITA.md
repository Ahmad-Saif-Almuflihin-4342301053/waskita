# 🛠️ Instruksi Eksekusi Worker (Mode B): Eliminasi Hardcode Topik (SERP-Relative Context) & Integrasi SearXNG Tier-1

> **Target Pelaksana:** Model Worker Hemat Kuota (Mode B — Flash / Flash Lite / Coder Agent)  
> **Arsitek Perancang:** Ahmad Saif Almuflihin (NIM: 4342301053) & Lead AI System Architect  
> **Tanggal Spesifikasi:** Kamis, 19 November 2026  
> **Repositori Target:** `/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset`  
> **Tautan Terkait:** [[Dashboard]], [[Blueprint_Arsitektur_EEAT_dan_Stress_Test_WASKITA]], [[Daily_Logs/2026-11-19]]

---

## 📌 ATURAN MUTLAK UNTUK MODEL WORKER (WAJIB DIBACA!)
1. **DILARANG BERIMPROVISASI ATAU MENGARANG RUMUS BARU.** Ikuti langkah demi langkah di bawah ini secara presisi karakter demi karakter.
2. **PRINSIP ANTI-HARDCODE:** Jangan pernah menambahkan daftar kata topik tertentu (seperti `"klenik"`, `"mistis"`, `"dukun"`, `"kanker"`) sebagai pemblokir statis. Semua deteksi penyimpangan topik (*Bait-and-Switch / Commercial Drift*) wajib membandingkan pergeseran kata/vektor paragraf akhir terhadap **Konsensus Korpus SERP (`consensus_serp_stems`)** secara dinamis!
3. **WAJIB JALANKAN VERIFIKASI TEST** di bagian akhir dokumen ini dan pastikan **100% PASSED (0 Failed)**.

---

## 🎯 RINGKASAN 3 TUGAS EKSEKUSI

1. **Tugas 1 — Eliminasi Hardcode pada `detect_commercial_drift()` (`backend/app/services/gatekeeper.py`, `audit_endpoints.py`, & `evaluate_accuracy.py`):**
   - Ubah `detect_commercial_drift` dari sekadar pencocokan kata kaku menjadi **Algoritma SERP-Relative Tail Drift + Transactional Solicitation**:
     - Cek apakah bagian akhir naskah (35% bagian bawah / paragraf penutup) memiliki **irisan sangat rendah/nol terhadap `consensus_serp_stems`** (*Topic Drift dari SERP*) **DAN** mengandung minimal 2 sinyal **Transaksi/Kontak Eksplisit** (nomor telepon/WA `08xx/+62`, ajakan transaksi uang/judi/klaim garansi absolut).
     - Jika topik artikel memang sesuai dengan SERP (misalnya cerita mistis, budaya, folklor, atau ulasan produk resmi yang kata-katanya memang ada di konsensus SERP), **JANGAN DIHUKUM**!
2. **Tugas 2 — Generalisasi Morfologi Serapan Tanpa Hardcode Sempit (`backend/app/services/nlp_pipeline.py`):**
   - Ganti kamus sempit `LOANWORD_CANONICAL_MAP` menjadi **Aturan Sufiks Morfologis Universal Bahasa Indonesia** (menangani variasi serapan Indo-Eropa `-ism/-isme/-is`, `-ist/-is`, `-ization/-isasi`, `-architecture/-arsitektur`, `-exposed/-ekspos`) yang bekerja bersama kamus **778.514 kata `nlp-id` Kumparan** untuk seluruh bidang ilmu.
3. **Tugas 3 — Integrasi `SearXNG Client` sebagai Tier-1 SERP Provider (`backend/app/core/config.py` & `backend/app/services/serp_scraper.py`):**
   - Tambahkan variabel `SEARXNG_URL: Optional[str] = None` dan `SEARXNG_ENGINES: str = "google,startpage,brave"` di `config.py`.
   - Tambahkan fungsi `async def _fetch_searxng_results(query: str, max_results: int = 25) -> List[Dict[str, Any]]` di `serp_scraper.py`.
   - Terapkan urutan **4-Tier SERP Waterfall**:
     1. **Tier 1:** `SearXNG` (jika `settings.SEARXNG_URL` terisi).
     2. **Tier 2:** `Serper.dev` (jika `settings.SERPER_API_KEY` terisi).
     3. **Tier 3:** `DuckDuckGo / ddgs` (fallback live gratis).
     4. **Tier 4:** `Offline Benchmark Corpus` (jaring pengaman terakhir).

---

## 🛠️ LANGKAH 1: Update `backend/app/core/config.py`

Buka file `backend/app/core/config.py`. Pada bagian `# Scraper & Engine Feature Flags` (sekitar baris 25–35), tambahkan pengaturan `SEARXNG_URL` dan `SEARXNG_ENGINES`:

### Cari kode ini (`backend/app/core/config.py` baris 31–35):
```python
    FEATURE_CURL_CFFI_FALLBACK: bool = True
    FEATURE_SERP_CACHE: bool = True
    FEATURE_OFFLINE_CORPUS_FALLBACK: bool = True
    SERPER_API_KEY: Optional[str] = None
```

### Ganti dengan kode ini:
```python
    FEATURE_CURL_CFFI_FALLBACK: bool = True
    FEATURE_SERP_CACHE: bool = True
    FEATURE_OFFLINE_CORPUS_FALLBACK: bool = True
    SEARXNG_URL: Optional[str] = None
    SEARXNG_ENGINES: str = "google,startpage,brave"
    SERPER_API_KEY: Optional[str] = None
```

---

## 🛠️ LANGKAH 2: Tambahkan Konektor SearXNG Tier-1 di `backend/app/services/serp_scraper.py`

Buka file `backend/app/services/serp_scraper.py`.

### 2A. Tambahkan fungsi `_fetch_searxng_results` tepat di atas `_fetch_duckduckgo_results` (sekitar baris 350):

```python
async def _fetch_searxng_results(query: str, max_results: int = 25) -> List[Dict[str, Any]]:
    """
    Tier-1 SERP Provider: Mengambil hasil pencarian organik dari instance SearXNG (Google, Startpage, Brave)
    dalam format JSON (gl=ID, language=id-ID) tanpa biaya per-kueri.
    """
    if not settings.SEARXNG_URL:
        return []
    base_url = settings.SEARXNG_URL.rstrip("/")
    search_url = f"{base_url}/search"
    params = {
        "q": query,
        "format": "json",
        "language": "id-ID",
        "engines": settings.SEARXNG_ENGINES,
    }
    headers = {
        "User-Agent": settings.USER_AGENT,
        "Accept": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
            resp = await client.get(search_url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                raw_results = data.get("results", [])
                organic: List[Dict[str, Any]] = []
                for r in raw_results[:max_results]:
                    link = r.get("url", "")
                    if not link:
                        continue
                    organic.append({
                        "title": r.get("title", ""),
                        "link": link,
                        "snippet": r.get("content", ""),
                    })
                logger.info(f"SearXNG Tier-1 returned {len(organic)} results for query '{query}'")
                return organic
            else:
                logger.warning(f"SearXNG Tier-1 returned HTTP {resp.status_code} on query '{query}'")
                return []
    except Exception as e:
        logger.warning(f"SearXNG Tier-1 fetch error on query '{query}': {e}")
        return []
```

### 2B. Ubah blok pengambilan `organic_results` di `search_and_scrape_competitors` (`backend/app/services/serp_scraper.py` baris 452–482):

#### Cari kode ini:
```python
    if not settings.SERPER_API_KEY:
        logger.info(f"SERPER_API_KEY is not set. Trying live search fallback via DDGS for query: {clean_query}")
        organic_results = await _fetch_duckduckgo_results(clean_query, max_results=20)
        if not organic_results:
            if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                logger.warning("SERPER_API_KEY is not configured, DDGS failed, and FEATURE_OFFLINE_CORPUS_FALLBACK is disabled.")
                return []
            logger.info(f"DDGS returned 0 results. Using offline fallback corpus for query: {clean_query}")
            fallback_docs = get_fallback_corpus(clean_query)
            return fallback_docs

    try:
        organic_results: List[Dict[str, Any]] = []
        async with httpx.AsyncClient(timeout=12.0) as client:
            # Sprint 4.1: Tarik 4 halaman paralel (40 hasil mentah Google)
            page_tasks = [
                _fetch_serper_page(client, clean_query, page_num=p)
                for p in (1, 2, 3, 4)
            ]
            pages_data = await asyncio.gather(*page_tasks)
            for p_res in pages_data:
                organic_results.extend(p_res)

        if not organic_results:
            logger.warning("Serper.dev returned 0 results. Trying live search fallback via DDGS...")
            organic_results = await _fetch_duckduckgo_results(clean_query, max_results=20)
            if not organic_results:
                if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                    return []
                return get_fallback_corpus(clean_query)
```

#### Ganti dengan arsitektur **4-Tier Waterfall** ini:
```python
    try:
        organic_results: List[Dict[str, Any]] = []

        # TIER 1: Self-Hosted SearXNG (Google + Startpage + Brave) jika SEARXNG_URL dikonfigurasi
        if settings.SEARXNG_URL:
            organic_results = await _fetch_searxng_results(clean_query, max_results=30)

        # TIER 2: Serper.dev Google.co.id API jika Tier 1 kosong/tidak aktif dan SERPER_API_KEY tersedia
        if not organic_results and settings.SERPER_API_KEY:
            async with httpx.AsyncClient(timeout=12.0) as client:
                page_tasks = [
                    _fetch_serper_page(client, clean_query, page_num=p)
                    for p in (1, 2, 3, 4)
                ]
                pages_data = await asyncio.gather(*page_tasks)
                for p_res in pages_data:
                    organic_results.extend(p_res)

        # TIER 3: DuckDuckGo Indonesia (ddgs) Live Fallback jika Tier 1 & Tier 2 tidak menghasilkan kandidat
        if not organic_results:
            logger.info(f"Trying Tier-3 live search fallback via DDGS for query: {clean_query}")
            organic_results = await _fetch_duckduckgo_results(clean_query, max_results=20)

        # TIER 4: Offline Benchmark Corpus (Jaring Pengaman Terakhir)
        if not organic_results:
            if not settings.FEATURE_OFFLINE_CORPUS_FALLBACK:
                logger.warning("All live SERP tiers (SearXNG, Serper, DDGS) returned 0 results and offline fallback is disabled.")
                return []
            logger.info(f"All live SERP tiers empty. Using Tier-4 offline fallback corpus for query: {clean_query}")
            return get_fallback_corpus(clean_query)
```

---

## 🛠️ LANGKAH 3: Ganti Detektor Hardcode di `backend/app/services/gatekeeper.py` Menjadi **SERP-Relative Tail Drift Detector**

Buka `backend/app/services/gatekeeper.py` (sekitar baris 116–135).
Kita pastikan fungsi `detect_commercial_drift` **TIDAK menghukum topik mistis/budaya/cerita fiksi**, melainkan memeriksa apakah terjadi **pembelokan topik pada paragraf akhir (Tail Drift)** terhadap konsensus SERP (`consensus_serp_stems`) yang disertai **sinyal transaksi/spam langsung**.

### Cari kode ini (`backend/app/services/gatekeeper.py` baris 116–134):
```python
COMMERCIAL_HARD_SELLING_PATTERNS = [
    re.compile(r"\b(?:08\d{8,12}|\+62\d{8,12})\b"),
    re.compile(r"\b(?:kode\s+voucher|voucher\s+diskon|tebus\s+murah|diskon\s+spesial)\b", re.IGNORECASE),
    re.compile(r"\b(?:promo\s+terbatas|hubungi\s+admin|pemesanan\s+agen|beli\s+sekarang)\b", re.IGNORECASE),
    re.compile(r"\b(?:sembuh\s+total\s+tanpa\s+operasi|dijamin\s+sembuh\s+dalam\s+\w+\s+hari|obat\s+ajaib)\b", re.IGNORECASE),
    re.compile(r"\b(?:slot\s+gacor|jackpot\s+sensational|deposit\s+pulsa|tanpa\s+potongan)\b", re.IGNORECASE),
]


def detect_commercial_drift(text: str) -> Tuple[bool, List[str]]:
    """Mendeteksi pergeseran naskah ke arah hard-selling produk, kontak WA, atau klaim komersial agresif (Bait-and-Switch)."""
    matches = []
    for pat in COMMERCIAL_HARD_SELLING_PATTERNS:
        found = pat.findall(text)
        if found:
            matches.extend(found[:2])
    has_drift = len(matches) >= 2
    return has_drift, matches
```

### Ganti dengan kode **SERP-Relative Contextual Drift** ini:
```python
TRANSACTIONAL_SOLICITATION_PATTERNS = [
    re.compile(r"\b(?:08\d{8,12}|\+62\d{8,12})\b"),
    re.compile(r"\b(?:kode\s+voucher|voucher\s+diskon|tebus\s+murah|diskon\s+spesial)\b", re.IGNORECASE),
    re.compile(r"\b(?:promo\s+terbatas|hubungi\s+admin|pemesanan\s+agen|beli\s+sekarang|order\s+sekarang|transfer\s+mahar)\b", re.IGNORECASE),
    re.compile(r"\b(?:sembuh\s+total\s+tanpa\s+operasi|dijamin\s+sembuh\s+dalam\s+\w+\s+hari|obat\s+ajaib)\b", re.IGNORECASE),
    re.compile(r"\b(?:slot\s+gacor|jackpot\s+sensational|deposit\s+pulsa|tanpa\s+potongan)\b", re.IGNORECASE),
]


def detect_commercial_drift(
    text: str,
    consensus_serp_stems: Optional[Set[str]] = None,
    target_query: str = "",
) -> Tuple[bool, List[str]]:
    """
    Mendeteksi Bait-and-Switch (Kuda Troya) secara kontekstual dan SERP-Relative (Tanpa Hardcode Topik):
    1. Tidak pernah menghukum topik cerita mistis/klenik/budaya/hiburan selama konsisten dengan kueri/SERP.
    2. Hanya memicu veto apabila naskah memuat >= 2 sinyal ajakan transaksi/kontak komersial eksplisit
       YANG TIDAK ADA di dalam target_query maupun konsensus SERP (Tail Semantic Drift).
    """
    if not text:
        return False, []

    q_lower = (target_query or "").lower()
    matches: List[str] = []
    for pat in TRANSACTIONAL_SOLICITATION_PATTERNS:
        found = pat.findall(text)
        for item in found[:2]:
            item_low = item.lower().strip()
            # Jika frasa tersebut memang bagian dari kueri yang dicari pengguna, jangan anggap penyimpangan
            if item_low and item_low in q_lower:
                continue
            matches.append(item)

    if len(matches) < 2:
        return False, matches

    # Jika consensus_serp_stems tersedia, cek apakah paragraf akhir (tail) mengalami penyimpangan dari konsensus SERP
    if consensus_serp_stems:
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip().split()) >= 6]
        if len(paragraphs) >= 2:
            tail_text = " ".join(paragraphs[-2:]).lower()
            tail_tokens = set(re.findall(r"\b[a-z]{3,}\b", tail_text))
            # Jika tail masih sangat padat dengan istilah konsensus SERP (>= 5 irisan) dan tidak memuat spam judi/klaim medis palsu, izinkan
            overlap_with_serp = len(tail_tokens.intersection(consensus_serp_stems))
            has_hard_scam = any(
                re.search(r"slot\s+gacor|jackpot\s+sensational|sembuh\s+total\s+tanpa\s+operasi|obat\s+ajaib", m, re.IGNORECASE)
                for m in matches
            )
            if overlap_with_serp >= 5 and not has_hard_scam:
                return False, matches

    return True, matches
```

### 3B. Update pemanggilan `detect_commercial_drift` di `backend/app/api/v1/endpoints/audit_endpoints.py` (baris 594):
Cari:
```python
    is_commercial_drift, _ = detect_commercial_drift(draft_content)
```
Ganti menjadi:
```python
    is_commercial_drift, _ = detect_commercial_drift(
        draft_content,
        consensus_serp_stems=consensus_serp_stems,
        target_query=request.target_query,
    )
```

### 3C. Update pemanggilan `detect_commercial_drift` di `backend/tests/evaluate_accuracy.py` (baris 125):
Cari:
```python
    is_commercial_drift, _ = detect_commercial_drift(content)
```
Ganti menjadi:
```python
    is_commercial_drift, _ = detect_commercial_drift(
        content,
        consensus_serp_stems=consensus_serp_stems,
        target_query=target_query,
    )
```

---

## ✅ LANGKAH 4: Verifikasi Wajib oleh Model Worker (Quality Gate)

Setelah ketiga langkah di atas selesai diedit, Model Worker **WAJIB** menjalankan 3 perintah terminal berikut dan memastikan semuanya **100% PASSED**:

```bash
# 1. Jalankan seluruh unit test & integrasi backend (Wajib 85 passed)
.venv/bin/pytest backend/tests/

# 2. Jalankan seluruh unit test frontend (Wajib 34 passed)
node --experimental-strip-types frontend/src/utils/__tests__/draftSanitizer.test.ts

# 3. Uji khusus: Pastikan cerita mistis/horor/budaya TIDAK terkena False Positive Commercial Drift
.venv/bin/python -c "
from app.services.gatekeeper import detect_commercial_drift
cerita_mistis = '''
Mitos Klenik Malam Satu Suro dan Cerita Mistis Pendakian Gunung Lawu.
Banyak pendaki menceritakan pengalaman mistis mendengar suara gamelan gaib di sekitar pasar setan.
Dari sisi budaya dan folklor Jawa, tradisi ini merupakan bentuk penghormatan masyarakat terhadap alam.
Catatan: Cerita ini adalah kisah pengalaman pribadi dan hiburan budaya semata.
'''
drift, matches = detect_commercial_drift(cerita_mistis, target_query='cerita mistis gunung lawu')
assert drift is False, f'Cerita mistis tidak boleh dianggap drift! {matches}'
print('SUCCESS: Cerita mistis/klenik hiburan lolos 100% tanpa False Positive!')
"
```
