# 🛠️ Instruksi Eksekusi Worker (Mode B): Eliminasi Blokir Domain Sosial Media & Implementasi Arsitektur Multi-Modal SERP Extraction (Mengarahkan & Mengefisienkan)

> **Target Pelaksana:** Model Worker Hemat Kuota (Mode B — Flash / Flash Lite / Coder Agent)  
> **Arsitek Perancang:** Ahmad Saif Almuflihin (NIM: 4342301053) & Lead AI System Architect  
> **Tanggal Spesifikasi:** Senin, 23 November 2026  
> **Repositori Target:** `/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset`  
> **Tautan Terkait:** [[Dashboard]], [[Instruksi_Worker_DeadCode_10_Celah_dan_3_Log_WASKITA]], [[Audit_DeadCode_Celah_Algoritma_dan_Arsitektur_Logging_WASKITA]]

---

## 🧠 LATAR BELAKANG ARSITEKTUR (PLATFORM CONVERGENCE 2026)

Di lanskap Google SERP modern (pasca-pembaruan *Google Helpful Content & E-E-A-T Experience*), batas antara situs artikel konvensional dan platform sosial media/UGC (*User-Generated Content*) telah melebur:
1. **LinkedIn** (`/pulse/`, `/advice/`), **Quora**, **Medium**, **Reddit**, dan **X/Twitter Articles** sering menduduki peringkat 1–3 Google untuk kueri berbasis pengalaman nyata (contoh empiris: *"pengalaman kerja digital marketing"*).
2. **TikTok** memiliki fitur *Carousel / Notes* dengan caption mikro-blog panjang; **YouTube** memiliki *Community Posts*, deskripsi ribuan kata, dan bab transkrip; **Instagram** memiliki *Carousel edukasi* hingga 2.200 karakter.
3. Jika WASKITA memblokir berdasarkan nama domain (`VIDEO_SOCIAL_DOMAINS`), sistem akan kehilangan kompetitor halaman 1 yang justru paling dipercaya Google. Selain itu, menaruh kata `"instagram"`, `"tiktok"`, `"youtube"`, `"facebook"`, `"whatsapp"`, `"linkedin"` di dalam `WEB_NOISE_STOPWORDS` dan `COMMERCIAL_SPONSOR_KEYWORDS` membuat WASKITA **buta** terhadap entitas topik utama ketika pengguna menulis artikel bertema *Digital Marketing*, teknologi, atau media sosial!

### 🎯 Solusi Arsitektural: "Bukan Membatasi Domain, Tetapi Mengarahkan & Mengefisienkan Ekstraksi"
1. **Eliminasi Hardcode `VIDEO_SOCIAL_DOMAINS`:** Kosongkan daftar blokir domain sosial media agar **semua URL yang lolos ke halaman 1 Google dievaluasi secara objektif berdasarkan substansi teks yang berhasil dipanen**, bukan nama domainnya.
2. **Ekstraksi Hibrida 3-Lapis (*Zero-Waste Multi-Layer Text Harvesting*) di `serp_scraper.py`:**
   - **Lapis 1:** `trafilatura.extract(html)` (menarik teks artikel utama dari DOM HTML).
   - **Lapis 2:** `_extract_meta_and_jsonld_text(html)` (mengekstrak `og:title`, `og:description`, `twitter:description`, `meta[name="description"]`, serta field `articleBody` / `text` / `description` dari `<script type="application/ld+json">` menggunakan `lxml` + `json`). Ini sangat efisien untuk memanen teks dari platform SPA/sosial media (TikTok, IG, YouTube, LinkedIn, X) dalam hitungan milidetik tanpa browser headless!
   - **Lapis 3:** Menggabungkan dengan `SERP Snippet` (`meta.get("snippet")`) yang terbukti telah diindeks oleh Googlebot.
3. **Pengarahan Intensi Multi-Modal (*Multi-Modal Search Intent Guidance*) di `gatekeeper.py`:**
   - Jika di antara kompetitor halaman 1 Google terdeteksi platform sosial/multi-modal (`tiktok.com`, `instagram.com`, `youtube.com`, `linkedin.com`, `quora.com`, `x.com`, `twitter.com`, `medium.com`, `reddit.com`, `pinterest.com`), sistem tidak membuangnya, melainkan menambahkan **Arahan Strategis (*Search Intent Guidance*)** pada `overview_bullets` dan `remediation_prompt` agar penulis memperkuat pengalaman praktis (*first-hand experience*) atau menyertakan elemen visual/multimedia (`[gambar: ...]`, `[video: ...]`) guna menandingi intensi halaman pertama Google.
4. **Pembebasan Entitas Platform dari Stopwords (`nlp_pipeline.py` & `gatekeeper.py`):**
   - Hapus nama-nama platform (`instagram`, `youtube`, `tiktok`, `facebook`, `twitter`, `whatsapp`, `telegram`, `pinterest`, `shopee`, `tokopedia`, `lazada`, `blibli`) dari `WEB_NOISE_STOPWORDS` dan `COMMERCIAL_SPONSOR_KEYWORDS` agar sah menjadi entitas topik ketika relevan dengan kueri.

---

## 📌 ATURAN MUTLAK UNTUK MODEL WORKER
1. **ZERO IMPROVISATION:** Terapkan perubahan kode di bawah ini secara presisi.
2. **JAGA KONTRAK DATA API:** Field `skipped_video_social_count` di `serp_audit_summary` **tetap dipertahankan di dictionary** (bernilai `0` atau menghitung halaman media yang murni kosong `0 kata` pasca-ekstraksi 3-lapis) agar kontrak JSON schema dan unit test `test_api_resilience.py` tetap 100% kompatibel!
3. **WAJIB JALANKAN VERIFIKASI TEST** di akhir dokumen dan pastikan **100% PASSED**.

---

## 🔧 DETAIL IMPLEMENTASI KODE LANGKAH DEMI LANGKAH

### 📦 LANGKAH 1: Bebaskan Entitas Sosial Media di `backend/app/services/nlp_pipeline.py`

Buka `backend/app/services/nlp_pipeline.py` sekitar baris 225–235.
Di dalam set `WEB_NOISE_STOPWORDS`:

#### Cari baris ini (`nlp_pipeline.py` baris 225–240):
```python
    "freepik",
    "pinterest",
    "instagram",
    "youtube",
    "tiktok",
    "facebook",
    "twitter",
    "whatsapp",
    "telegram",
    "caption",
    "foto",
    "gambar",
    "ilustrasi",
    "video",
    "platform",
    "highweb",
```

#### Ganti dengan kode ini (nama platform dikeluarkan dari stopwords agar artikel bertopik Digital Marketing / Medsos tidak kehilangan entitas utamanya):
```python
    "freepik",
    # Catatan Arsitektur Multi-Modal (Sprint 4.6): Nama platform (instagram, youtube, tiktok,
    # facebook, twitter, whatsapp, telegram, pinterest, linkedin) TIDAK dimasukkan ke stopwords
    # agar artikel bertopik Digital Marketing, Teknologi, dan Media Sosial tetap dapat mengekstrak
    # entitas platform tersebut secara akurat. Pembersihan tombol share dilakukan di level baris (WEB_CHROME_LINE_PATTERNS).
    "caption",
    "highweb",
```

---

### 📦 LANGKAH 2: Bebaskan Entitas Platform & Tambahkan Pengarahan Multi-Modal di `backend/app/services/gatekeeper.py`

#### 2A. Buka `backend/app/services/gatekeeper.py` baris 42–78 (`COMMERCIAL_SPONSOR_KEYWORDS`):
Keluarkan nama platform sosial media & marketplace umum (`shopee`, `tokopedia`, `lazada`, `blibli`, `whatsapp`, `instagram`, `facebook`, `youtube`, `tiktok`) dari daftar blokir kaku `COMMERCIAL_SPONSOR_KEYWORDS`, sehingga hanya menyisakan merek sponsor material bangunan dan kata transaksi murni:

##### Cari kode ini (`gatekeeper.py` baris 58–77):
```python
    "alustar",
    "shopee",
    "tokopedia",
    "lazada",
    "blibli",
    "whatsapp",
    "instagram",
    "facebook",
    "youtube",
    "tiktok",
    "hubungi",
    "kontak",
    "promo",
    "diskon",
    "harga",
    "jual",
    "beli",
    "distributor",
    "supplier",
}
```

##### Ganti dengan kode ini:
```python
    "alustar",
    "hubungi",
    "kontak",
    "promo",
    "diskon",
    "distributor",
    "supplier",
}
```

#### 2B. Tambahkan Deteksi & Arahan Lanskap Multi-Modal SERP di `generate_overview_and_remediation()` (`gatekeeper.py` sekitar baris 670):
Di dalam fungsi `generate_overview_and_remediation()`, tepat setelah blok `other_domains_str = ...` (sekitar baris 680), tambahkan detektor kehadiran platform sosial/UGC/multi-modal di SERP:

```python
    # Deteksi kehadiran platform sosial / UGC / multi-modal di lanskap kompetitor SERP (Sprint 4.6)
    MULTIMODAL_UGC_DOMAINS = (
        "tiktok.com", "instagram.com", "youtube.com", "youtu.be",
        "linkedin.com", "quora.com", "medium.com", "reddit.com",
        "x.com", "twitter.com", "pinterest.com", "kompasiana.com",
    )
    multimodal_competitor_domains: List[str] = []
    if serp_competitors:
        for c in serp_competitors:
            d = (c.get("domain_name") or c.get("domain") or "").lower()
            if any(m_dom in d for m_dom in MULTIMODAL_UGC_DOMAINS) and d not in multimodal_competitor_domains:
                multimodal_competitor_domains.append(d)
```

Lalu di dalam `generate_overview_and_remediation()`, tepat sebelum `return { "overview_bullets": bullets, ... }` (di akhir fungsi, sekitar baris 870), tambahkan poin arahan strategis jika `multimodal_competitor_domains` ditemukan:

```python
    if multimodal_competitor_domains:
        mm_str = ", ".join(multimodal_competitor_domains[:3])
        bullets.append(
            f"Sinyal Lanskap Multi-Modal & UGC SERP: Kompetitor halaman pertama memuat platform sosial/komunitas ({mm_str}). "
            "Perkuat narasi pengalaman praktis (first-hand experience) dan sertakan elemen visual/multimedia ([gambar: ...] atau [video: ...]) agar selaras dengan intensi pencarian pengguna."
        )
```

---

### 📦 LANGKAH 3: Implementasi Ekstraksi Hibrida 3-Lapis & Eliminasi Blokir Domain Sosmed di `backend/app/services/serp_scraper.py`

Buka `backend/app/services/serp_scraper.py`.

#### 3A. Kosongkan `VIDEO_SOCIAL_DOMAINS` (baris 18–48):
Agar tidak ada lagi pemblokiran *hardcode* berdasarkan nama domain sosial media sebelum halaman dievaluasi isinya:

##### Cari kode ini (`serp_scraper.py` baris 18–49):
```python
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
```

##### Ganti dengan kode ini:
```python
# Sprint 4.6 (Platform Convergence Architecture):
# WASKITA tidak lagi memblokir domain sosial media/UGC (LinkedIn, Quora, Medium, TikTok Carousel,
# Instagram, YouTube Post, X) secara hardcode di awal. Seluruh URL dievaluasi secara objektif
# melalui Ekstraksi Hibrida 3-Lapis (Trafilatura Body + OpenGraph/JSON-LD Metadata + SERP Snippet)
# dan Saringan Relevansi 3-Tier.
VIDEO_SOCIAL_DOMAINS: Set[str] = set()

# Penanda domain platform multi-modal/sosial untuk pengayaan ekstraksi metadata & snippet
MULTIMODAL_SOCIAL_DOMAINS = (
    "youtube.com", "youtu.be", "tiktok.com", "instagram.com",
    "facebook.com", "twitter.com", "x.com", "pinterest.com",
    "linkedin.com", "quora.com", "medium.com", "reddit.com", "threads.net",
)
```

#### 3B. Tambahkan Fungsi Ekstraktor Metadata OpenGraph & JSON-LD (`_extract_meta_and_jsonld_text`) di bawah `_extract_headings_from_html` (sekitar baris 161):

Tambahkan fungsi berikut di `backend/app/services/serp_scraper.py`:

```python
def _extract_meta_and_jsonld_text(html_str: str) -> str:
    """
    Lapis 2 Ekstraksi Hibrida (Sprint 4.6):
    Mengekstrak teks substantif dari meta tags (og:title, og:description, twitter:description,
    description) serta blok JSON-LD (articleBody, text, description, headline).
    Sangat efektif memanen teks caption panjang dari TikTok Carousel, Instagram Post,
    YouTube Community/Video Description, LinkedIn Pulse/Advice, Quora, dan X Articles
    tanpa membutuhkan headless browser.
    """
    if not html_str:
        return ""
    fragments: List[str] = []
    seen_fragments: Set[str] = set()

    def _add_frag(val: str) -> None:
        if not val or not isinstance(val, str):
            return
        cleaned = re.sub(r"\s+", " ", val).strip()
        # Abaikan boilerplate login pendek
        if len(cleaned) < 25:
            return
        low = cleaned.lower()
        if any(b in low for b in ("log in to", "sign in to", "masuk untuk melanjutkan", "buat akun atau masuk")):
            return
        if low not in seen_fragments:
            seen_fragments.add(low)
            fragments.append(cleaned)

    try:
        import json
        parser = etree.HTMLParser(recover=True, encoding="utf-8")
        tree = etree.fromstring(html_str.encode("utf-8"), parser=parser)
        if tree is None:
            return ""

        # 1. Panen Meta Description & OpenGraph / Twitter Card
        for meta in tree.xpath("//meta"):
            prop = (meta.get("property") or meta.get("name") or "").lower().strip()
            content = meta.get("content") or ""
            if prop in (
                "og:title", "og:description", "twitter:title",
                "twitter:description", "description",
            ):
                _add_frag(content)

        # 2. Panen JSON-LD (Schema.org Article, SocialMediaPosting, DiscussionForumPosting, VideoObject, FAQPage)
        for script in tree.xpath("//script[@type='application/ld+json']"):
            raw_json = "".join(script.itertext()).strip()
            if not raw_json:
                continue
            try:
                data = json.loads(raw_json)
                stack = [data]
                while stack:
                    curr = stack.pop()
                    if isinstance(curr, dict):
                        for k in ("headline", "name", "description", "articleBody", "text", "transcript"):
                            if isinstance(curr.get(k), str):
                                _add_frag(curr[k])
                        for v in curr.values():
                            if isinstance(v, (dict, list)):
                                stack.append(v)
                    elif isinstance(curr, list):
                        for item in curr:
                            if isinstance(item, (dict, list)):
                                stack.append(item)
            except Exception:
                continue
    except Exception as e:
        logger.debug(f"Meta/JSON-LD extraction fallback error: {e}")

    return "\n\n".join(fragments)
```

#### 3C. Perbarui `_heavy_trafilatura_extract(html_str: str) -> str` agar Menggabungkan Lapis 1 (Trafilatura Body) + Lapis 2 (Meta & JSON-LD):

Ganti fungsi `_heavy_trafilatura_extract` (sekitar baris 162–176) menjadi:

```python
def _heavy_trafilatura_extract(html_str: str) -> str:
    """
    Operasi CPU berat #1: Ekstraksi teks web bersih Hibrida (DOM XML Trafilatura + OpenGraph/JSON-LD Metadata).
    Jika teks body utama dari Trafilatura panjangnya memadai (>= 150 kata), gunakan body utama.
    Jika halaman merupakan platform sosial/SPA (TikTok Carousel, IG, YouTube, LinkedIn, Quora)
    di mana body HTML tipis, perkaya dengan ekstraksi Meta & JSON-LD secara efisien.
    """
    if not html_str:
        return ""
    extracted = trafilatura.extract(
        html_str,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
    ) or ""

    body_words = len(re.findall(r"\b\w+\b", extracted))
    if body_words >= 150:
        return extracted

    meta_jsonld_text = _extract_meta_and_jsonld_text(html_str)
    if not extracted:
        return meta_jsonld_text
    if meta_jsonld_text and meta_jsonld_text.lower() not in extracted.lower():
        return f"{extracted}\n\n{meta_jsonld_text}".strip()
    return extracted
```

#### 3D. Perkaya dengan Lapis 3 (Google SERP Snippet Fallback) di `search_and_scrape_competitors()` (`serp_scraper.py` sekitar baris 610–645):

Di dalam loop `for idx_cand, (meta, res) in enumerate(zip(candidate_urls, fetched_results)):` (sekitar baris 605–645):
Ketika halaman dari platform sosial media/komunitas (`MULTIMODAL_SOCIAL_DOMAINS`) membatasi *crawler* (misalnya mengembalikan teks `< min_words` atau terkena *login wall*), jangan langsung dibuang jika **Judul + SERP Snippet + hasil Meta** yang terindeks oleh Googlebot sudah memuat informasi topikal yang kaya ($\ge 25$ kata untuk kandidat halaman 1 Google)!

##### Cari kode ini (`serp_scraper.py` baris 610–639):
```python
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

            clean_text = res.get("clean_text", "")
            page_title = meta.get("title", f"Kompetitor {current_rank}")
```

##### Ganti dengan kode ini:
```python
            fetch_st = res.get("fetch_status", "failed")
            http_st = res.get("http_status_code", 0)
            final_url = res.get("source_url") or meta.get("link", "")
            page_title = meta.get("title", f"Kompetitor {current_rank}")
            serp_snippet = (meta.get("snippet") or "").strip()

            # Periksa URL akhir setelah redirect (misal redirect google goto ke pdf, proxy, dll.)
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

            clean_text = (res.get("clean_text") or "").strip()
            # Lapis 3 Ekstraksi Hibrida: Gabungkan SERP Snippet yang diindeks Google jika teks hasil fetch tipis
            if serp_snippet and serp_snippet.lower() not in clean_text.lower():
                if len(re.findall(r"\b\w+\b", clean_text)) < min_words:
                    clean_text = f"{page_title}. {serp_snippet}\n\n{clean_text}".strip()
                    if fetch_st == "failed" and clean_text:
                        fetch_st = "serp_snippet_enriched"

            if not clean_text:
                summary["skipped_bot_protect_count"] += 1
                continue

            word_count = len(re.findall(r"\b\w+\b", clean_text))
            is_multimodal_social = any(m_dom in final_url.lower() for m_dom in MULTIMODAL_SOCIAL_DOMAINS)
            # Untuk platform sosial/UGC multi-modal di halaman 1 (idx_cand < 10) yang sudah diperkaya
            # metadata/snippet, ambang batas efektif adalah 35 kata; untuk situs web standar tetap min_words (150)
            effective_min_words = 35 if (is_multimodal_social and idx_cand < 10) else min_words

            if word_count < effective_min_words:
                if is_multimodal_social:
                    summary["skipped_video_social_count"] += 1
                else:
                    summary["skipped_short_text_count"] += 1
                continue
```

---

## 🧪 LANGKAH 4: Tambahkan Unit Test Verifikasi Konvergensi Multi-Modal di `backend/tests/test_ir_engine.py`

Buka `backend/tests/test_ir_engine.py` dan tambahkan test method berikut di bagian paling bawah kelas test terakhir:

```python
    def test_multimodal_social_domains_not_blocked_and_meta_extracted(self):
        """
        Sprint 4.6: Platform sosial/UGC (LinkedIn, Quora, Medium, TikTok, Instagram, YouTube)
        tidak lagi diblokir hardcode oleh classify_url_skip_reason, dan _extract_meta_and_jsonld_text
        mampu memanen caption/articleBody secara efisien.
        """
        from app.services.serp_scraper import classify_url_skip_reason, _extract_meta_and_jsonld_text
        from app.services.nlp_pipeline import ALL_INDONESIAN_STOPWORDS

        for url in [
            "https://www.linkedin.com/advice/0/how-does-feel-work-digital-marketing-agency",
            "https://id.quora.com/Bagaimana-pengalamanmu-bekerja-di-digital-agency",
            "https://medium.com/@adnan/suka-duka-bekerja-di-bidang-digital-marketing",
            "https://www.tiktok.com/@creator/photo/734567890123",
            "https://www.instagram.com/p/C9xyz123/",
            "https://www.youtube.com/post/Ugkx12345",
        ]:
            assert classify_url_skip_reason(url) is None, f"URL {url} tidak boleh diblokir hardcode"

        # Pastikan entitas platform sosial tidak lagi dibuang oleh stopwords
        for platform in ("instagram", "tiktok", "youtube", "facebook", "whatsapp"):
            assert platform not in ALL_INDONESIAN_STOPWORDS

        # Uji ekstraksi Lapis 2 (OpenGraph + JSON-LD)
        sample_html = """
        <html>
        <head>
            <meta property="og:title" content="Pengalaman Kerja Digital Marketing Agency dan Strategi Konten TikTok" />
            <meta property="og:description" content="Bekerja di agensi pemasaran digital membutuhkan kemampuan analisis kampanye Instagram Reels, optimasi SEO website, serta manajemen iklan berbayar yang terukur." />
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "SocialMediaPosting",
                "articleBody": "Panduan lengkap mengelola kampanye digital marketing lintas platform mulai dari riset audiens hingga evaluasi konversi organik."
            }
            </script>
        </head>
        <body><div id="app"></div></body>
        </html>
        """
        harvested = _extract_meta_and_jsonld_text(sample_html)
        assert "Pengalaman Kerja Digital Marketing" in harvested
        assert "Instagram Reels" in harvested
        assert "Panduan lengkap mengelola kampanye" in harvested
```

---

## ✅ PERINTAH VERIFIKASI WAJIB (JALANKAN OLEH WORKER)

Setelah menyelesaikan seluruh langkah di atas, jalankan perintah berikut dan pastikan seluruhnya hijau (**0 Failed**):

```bash
# 1. Jalankan seluruh unit & integration test Backend
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset/backend"
../.venv/bin/pytest -q

# 2. Jalankan seluruh unit test Frontend
cd "/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset/frontend"
npm test
```
