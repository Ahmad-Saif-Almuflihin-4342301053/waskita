# SPRINT 4.1 MASTER ARCHITECTURAL & ALGORITHMIC SPECIFICATION
## Full Algorithmic Overhaul (14 Deep-Core Fixes), 4-Page Parallel SERP Harvester with Fast-Fail Concurrency, 3-Tier Relevance Guard, & Dynamic Top-K Competitor UI

**Target Versi:** `v1.5.1-SNAPSHOT.1`  
**Status:** Ready for Dispatch to Chat 2 (DevOps & GitHub Dispatcher)  
**Author:** System Analyst & Lead Architect (WASKITA R&D)  
**Referensi Audit Mendalam:** `docs/DEEP_DIVE_ALGORITHMIC_AND_SYSTEM_AUDIT_REPORT.md`  
**Tujuan Sprint:** Menyelesaikan secara tuntas 14 kelemahan algoritma, matematika IR, morfologi NLP, bottleneck konkurensi jaringan, dan bug skema UI yang ditemukan pada bedah forensik menyeluruh WASKITA.

---

## 1. Daftar 14 Perbaikan Inti Sprint 4.1 (End-to-End Matrix)

| No | Berkas Sasaran | Temuan Masalah & Bottleneck | Solusi Algoritma & Sistem Sprint 4.1 |
|:--:|:---|:---|:---|
| **1** | `nlp_pipeline.py` & `information_gain.py` | **Jebakan Potong Top-30 (`top_n=30`):** Selisih himpunan $\Delta_{\text{deficit}}$ dan $\Delta_{\text{gain}}$ hanya dihitung dari 30 kata tersering, menyebabkan tuduhan defisit palsu (*Arsitek, Menara, Unité*) & klaim gain hijau palsu pada kata jiplakan (*Beton Ekspos*). | Gunakan **100% Himpunan Stem Utuh Dokumen (`extract_full_stem_set`)** untuk uji eksistensi $\Delta_{\text{deficit}}$ dan $\Delta_{\text{gain}}$. |
| **2** | `nlp_pipeline.py` | **Kegagalan Morfologi Serapan & Sinonim Spinner:** Sastrawi gagal menyatukan akhiran `-isme`/`-is`/`-ist` (`brutalisme` vs `brutalist` vs `brutalis`) serta kata serapan (`exposed` vs `ekspos`), dan mudah dikelabui *Smart Spinner*. | Tambahkan **Canonical Loanword & Suffix Normalizer** di dalam `stem_word()` untuk menyatukan variasi sufiks serapan dan sinonim teknis utama. |
| **3** | `nlp_pipeline.py` & `information_gain.py` | **Bocornya Kata Ekspositori Umum & Derau Media:** Kata `Tahun`, `Mengenal`, `Bbc (1 SERP)`, `Highweb (1 SERP)`, `Caption (1 SERP)` masuk ke saran topik defisit. | Wajibkan filter **`consensus >= 2`** untuk seluruh entitas defisit + perluas `WEB_NOISE_STOPWORDS` dengan kata pengantar esai & derau media/CMS. |
| **4** | `information_gain.py` | **Duplikasi Unigram–Bigram (*Subsumption Redundancy*):** Muncul chip ganda `★ Beton Ekspos` dan `★ Ekspos` secara bersamaan di daftar 10 besar. | Terapkan **Bigram Subsumption Filter**: jika bigram `"A B"` sudah terpilih, eliminasi unigram penyusunnya (`"A"` atau `"B"`) kecuali konsensus dokumennya lebih tinggi. |
| **5** | `vsm_calculator.py` | **Delusi Normalisasi L2 pada Ketimpangan Panjang (*Length Asymmetry*):** Draf 350 kata yang menyalin 100% dari artikel kompetitor 1.222 kata hanya mendapat Cosine Sim 40.6%. | Terapkan **Sliding-Window Passage Cosine Similarity**: jika panjang kompetitor $> 1.35\times$ draf, ukur kemiripan terhadap jendela geser seukuran draf ($0.35 \cdot \text{global} + 0.65 \cdot \text{window\_max}$). |
| **6** | `stylometrics.py` | **Buta Sub-Judul Teks Polos (`HKO Overlap = 0%` Palsu):** Hanya mencari simbol `#` Markdown sehingga teks copy-paste biasa dianggap tanpa sub-judul. | Tambahkan **Plain-Text Sub-Heading Heuristic** (baris mandiri 2–12 kata, tanpa tanda titik di akhir, Title Case, diikuti paragraf). |
| **7** | `gatekeeper.py` | **Sub-Judul Menyatu dengan Kalimat, Prioritas Stabilo Terbalik, & Lemahnya Jaccard terhadap Spinner:** `_split_into_sentences` menggabungkan sub-judul dengan paragraf; warna Kuning/Biru menutupi Merah; Jaccard 0.65 gagal menangkap *Smart Spinner*. | Pecah kalimat pada `\n+` terlebih dahulu; jadikan **Merah Prioritas #1**; kombinasikan `jaccard >= 0.50` ATAU `containment >= 0.72` (dengan `overlap >= 4`). |
| **8** | `gatekeeper.py` & `audit_endpoints.py` | **Paradoks Penyebut $C_{\text{IG}}$ & Kompensasi Palsu CDS:** Saat kompetitor naik ke 10 artikel, penyebut `serp_entities_count` membengkak dan menghancurkan $C_{\text{IG}}$. Sebaliknya, artikel dangkal ($C_{\text{IG}} = 20\%$) bisa lolos "Siap Terbit" karena 70 poin gratis dari metrik lain. | Kunci penyebut `coverage_ratio` pada **Top-25 Entitas Konsensus SERP** ($\text{consensus} \ge 2$), dan tetapkan **Non-Compensatory Pillar Floor** ($C_{\text{IG}} \ge 45\%$ wajib untuk "Siap Terbit"). |
| **9** | `gatekeeper.py` | **Bug Kunci Dictionary `'Artikel Kompetitor Teratas'` & Teks Statis `"5 artikel"`:** gagal membaca `page_title` dan `domain_name`. | Baca `page_title`, `domain_name`, `source_url` dan jadikan jumlah kompetitor di prompt remediasi dinamis (`competitor_count`). |
| **10** | `serp_scraper.py` | **Kuota Terpotong di 15 Kandidat & Risiko *Semantic Drift* Halaman 4:** Hanya mendapat 3 artikel dan berisiko kemasukan toko online / topik melenceng di halaman belakang. | Tarik **4 Halaman Paralel (40 hasil)**, evaluasi **35 kandidat**, kawal dengan **3 Lapis Saringan Penjaga Relevansi**, dan deduplikasi konten kembar lintas-domain (`seen_text_hashes`). |
| **11** | `serp_scraper.py` | **Jebakan Waktu Tunggu Ekor Panjang (*Tail-Latency Trap* `7s + 8s = 15s`):** Jika 1 URL mati/timeout di `httpx` (7s), kode tetap memanggil `curl_cffi` (8s) dan membuat 35 instance `AsyncClient` terpisah. | **Fast-Fail Timeout Strategy**: Hanya panggil `curl_cffi` jika `httpx` mengembalikan status blokir bot (`401, 403, 406, 429, 503`), JANGAN saat timeout server mati! Batasi waktu tunggu per URL $\le 6.0\text{s}$. |
| **12** | `audit_endpoints.py` | **Stemming Kompetitor Sekuensial & Hilangnya `overview_bullets` di Riwayat Sidebar:** Loop preprocessing berjalan satu per satu; saat klik riwayat sesi lama, `overview_bullets` berubah jadi 2 kalimat dummy. | Jalankan `preprocess_text_async` secara paralel dengan `asyncio.gather`, dan rekonstruksi `overview_bullets` asli di `build_audit_execute_response`. |
| **13** | `SerpCompetitorsSection.tsx` | **Bug Nama Field `SerpAuditSummary` (`0 hasil Google dilewati`):** Backend mengirim `skipped_*_count`, tapi Frontend membaca `skipped_*` tanpa `_count` sehingga selalu tampil `0`! | Baca kedua variasi atribut (`skipped_video_social_count ?? skipped_video_social`) + tambahkan fitur **Accordion Toggle** (tampilkan 5 teratas + tombol ekspansi sisanya hingga Top 10). |
| **14** | `AnnotatedTextSection.tsx` | **Dinding Teks Raksasa di Kotak Stabilo:** Sub-judul tidak dipisahkan sebagai blok judul mandiri di UI. | Render span sub-judul sebagai blok judul tersendiri (`display: 'block'`, `fontWeight: 700`) agar struktur artikel rapi dan nyaman dibaca. |

---

## 2. Instruksi Kode Lengkap per Berkas (Mandatory Implementation Guide)

### BAGIAN A: WORKER 2 — BACKEND CORE & IR ENGINE

---

#### 1. Berkas: `backend/app/services/nlp_pipeline.py`

**A. Perluas `WEB_NOISE_STOPWORDS` & Tambahkan `LOANWORD_CANONICAL_MAP`:**
```python
WEB_NOISE_STOPWORDS: Set[str] = {
    # Kata navigasi & derau web dasar
    "baca", "juga", "halaman", "berikut", "klik", "komentar", "iklan",
    "copyright", "artikel", "konten", "sumber", "terkait", "simak",
    "selengkapnya", "dilansir", "dikutip", "redaksi", "editor", "penulis",
    "tribun", "kompas", "detik",
    # Protokol web, ekstensi berkas, & atribut teknis
    "www", "http", "https", "html", "htm", "php", "asp", "aspx", "jsp",
    "com", "org", "net", "gov", "edu", "mil", "co", "id", "io", "ai",
    "url", "uri", "link", "download", "pdf", "file", "doc", "docx",
    "web", "website", "portal", "site", "view", "share", "tag", "tags",
    "admin", "posted", "author", "post", "posts", "comment", "search",
    "cari", "menu", "home", "beranda", "navigasi", "navigation",
    "undefined", "null", "true", "false",
    # Sprint 4.1: Derau Media, Agensi Foto, & Elemen CMS
    "bbc", "cnn", "cnbc", "kompasiana", "idntimes", "liputan6", "tempo",
    "tirto", "antara", "reuters", "getty", "shutterstock", "unsplash",
    "pixabay", "freepik", "pinterest", "instagram", "youtube", "tiktok",
    "facebook", "twitter", "whatsapp", "telegram", "caption", "foto",
    "gambar", "ilustrasi", "video", "platform", "highweb", "berita",
    "kanal", "rubrik", "edisi", "publikasi",
    # Sprint 4.1: Kata Pengantar Ekspositori & Kata Umum Non-Topik
    "mengenal", "kenal", "pengertian", "arti", "definisi", "makna",
    "istilah", "ciri", "contoh", "jenis", "macam", "bentuk", "bagian",
    "tingkat", "proses", "hasil", "cara", "langkah", "tips", "trik",
    "panduan", "manfaat", "fungsi", "tujuan", "alasan", "faktor",
    "dampak", "efek", "ulasan", "pembahasan", "penjelasan", "detail",
    "utama", "umum", "besar", "kecil", "baru", "lama", "tinggi",
    "rendah", "mudah", "sulit", "penting", "menarik", "populer",
    "terkenal", "berbagai", "tahun", "abad", "bulan", "hari", "minggu",
    "zaman", "masa", "era", "orang", "masyarakat", "dunia", "negara",
    "kota", "tempat", "lokasi", "bahasa", "konsep", "model", "gaya",
    "sistem", "struktur", "pilihan", "warna", "ukuran", "jumlah",
    "keseluruhan", "aliran", "karya", "bahan", "debat", "kesan",
}

# Peta kanonikalisasi serapan teknis & ejaan dwibahasa (Sprint 4.1)
LOANWORD_CANONICAL_MAP: Dict[str, str] = {
    "exposed": "ekspos",
    "ekspose": "ekspos",
    "brutalist": "brutalis",
    "brutalism": "brutalis",
    "brutalisme": "brutalis",
    "minimalist": "minimalis",
    "minimalism": "minimalis",
    "minimalisme": "minimalis",
    "modernist": "modernis",
    "modernism": "modernis",
    "modernisme": "modernis",
    "architecture": "arsitektur",
    "architectural": "arsitektur",
    "architect": "arsitek",
}
```

**B. Perbarui `stem_word(word: str)` dengan Normalisasi Sufiks Serapan:**
```python
@functools.lru_cache(maxsize=100_000)
def stem_word(word: str) -> str:
    """
    Stemming kata tunggal Bahasa Indonesia dengan LRU Cache + normalisasi serapan teknis (Sprint 4.1).
    Menyatukan variasi sufiks '-isme' / '-ist' / '-is' dan padanan istilah serapan.
    """
    if not word or len(word) <= 2:
        return word
    w_low = word.lower().strip()
    if w_low in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[w_low]

    stemmed = _sastrawi_stemmer.stem(w_low)
    if stemmed in LOANWORD_CANONICAL_MAP:
        return LOANWORD_CANONICAL_MAP[stemmed]

    # Normalisasi akhiran '-isme' -> '-is' untuk kata serapan panjang (misal 'fungsionalisme' -> 'fungsionalis')
    if len(stemmed) > 7 and stemmed.endswith("isme"):
        stemmed = stemmed[:-2]
    elif len(stemmed) > 6 and stemmed.endswith("ist"):
        stemmed = stemmed[:-1]

    return stemmed
```

**C. Tambahkan Fungsi `extract_full_stem_set(text: str) -> Set[str]` & Perbarui `extract_candidate_entities`:**
```python
def extract_full_stem_set(text: str) -> Set[str]:
    """
    Mengekstrak 100% himpunan seluruh stem unigram dan stem bigram dari teks
    TANPA pemotongan top_n. Digunakan untuk uji eksistensi himpunan yang akurat
    pada Information Gain (mencegah tuduhan defisit palsu & klaim gain palsu).
    """
    tokens = _sync_clean_and_tokenize(text)
    if not tokens:
        return set()

    stems_list: List[str] = []
    full_stems: Set[str] = set()

    for tok in tokens:
        if len(tok) > 2 and tok not in ALL_INDONESIAN_STOPWORDS and not tok.isdigit():
            st = stem_word(tok)
            if st and len(st) > 2 and st not in ALL_INDONESIAN_STOPWORDS:
                full_stems.add(st)
                stems_list.append(st)
            else:
                stems_list.append("")
        else:
            stems_list.append("")

    for i in range(len(stems_list) - 1):
        s1, s2 = stems_list[i], stems_list[i + 1]
        if s1 and s2 and s1 != s2:
            full_stems.add(f"{s1} {s2}")

    return full_stems
```
Pada `extract_candidate_entities(text: str, top_n: int = 40)`:
- Pastikan `stem not in ALL_INDONESIAN_STOPWORDS` dicek setelah `stem_word`.
- Untuk bigram, pastikan `stem1 != stem2` dan kedua stem bukan stopword.
- Beri bobot urut `data["count"] * 1.35` untuk bigram yang muncul $\ge 2$ kali agar frasa spesifik lebih diutamakan daripada unigram lepas.
- Ekspor `extract_full_stem_set` di `backend/app/services/__init__.py` dan `backend/app/services/ir_engine.py`.

---

#### 2. Berkas: `backend/app/services/information_gain.py`

Implementasikan uji himpunan penuh (`full_draft_stems` & `full_competitor_stems_list`), syarat mutlak `consensus >= 2`, serta **Bigram Subsumption Filter** (mencegah chip ganda seperti `★ Beton Ekspos` dan `★ Ekspos`):

```python
from typing import Dict, List, Optional, Set, Tuple
from app.schemas.audit import EntityGapItem, EntityGapsGroup
from app.services.gatekeeper import is_commercial_or_sponsor
from app.services.nlp_pipeline import ALL_INDONESIAN_STOPWORDS


def _deduplicate_subsumed_unigrams(items: List[EntityGapItem], limit: int = 10) -> List[EntityGapItem]:
    """
    Bigram Subsumption Filter (Sprint 4.1):
    Jika suatu bigram 'A B' sudah masuk daftar teratas, hilangkan unigram 'A' atau 'B'
    yang konsensusnya tidak lebih tinggi dari bigram tersebut agar tidak terjadi duplikasi chip
    (misal mencegah munculnya 'Beton Ekspos' dan 'Ekspos' secara bersamaan).
    """
    bigram_parts_consensus: Dict[str, int] = {}
    for it in items:
        parts = it.term_string.split()
        if len(parts) >= 2:
            for p in parts:
                bigram_parts_consensus[p] = max(
                    bigram_parts_consensus.get(p, -1),
                    it.competitor_consensus_count,
                )

    filtered: List[EntityGapItem] = []
    for it in items:
        parts = it.term_string.split()
        if len(parts) == 1:
            uni = parts[0]
            if uni in bigram_parts_consensus and it.competitor_consensus_count <= bigram_parts_consensus[uni]:
                continue
        filtered.append(it)
        if len(filtered) >= limit:
            break
    return filtered


def calculate_information_gain(
    draft_entities: List[Tuple[str, str, int]],
    competitor_entities_list: List[List[Tuple[str, str, int]]],
    draft_tfidf_weights: Optional[Dict[str, float]] = None,
    full_draft_stems: Optional[Set[str]] = None,
    full_competitor_stems_list: Optional[List[Set[str]]] = None,
) -> EntityGapsGroup:
    if draft_tfidf_weights is None:
        draft_tfidf_weights = {}

    draft_map: Dict[str, str] = {}
    for stem, surface, _ in draft_entities:
        if stem in ALL_INDONESIAN_STOPWORDS:
            continue
        draft_map[stem] = surface

    complete_draft_stems: Set[str] = (
        set(full_draft_stems) if full_draft_stems is not None else set(draft_map.keys())
    )
    complete_draft_stems.update(draft_map.keys())
    for st in list(complete_draft_stems):
        for part in st.split():
            if len(part) > 2:
                complete_draft_stems.add(part)

    serp_map: Dict[str, str] = {}
    serp_consensus: Dict[str, int] = {}
    num_competitors = len(competitor_entities_list)

    for comp_entities in competitor_entities_list:
        seen_in_this_doc = set()
        for stem, surface, _ in comp_entities:
            if stem in ALL_INDONESIAN_STOPWORDS:
                continue
            if stem not in seen_in_this_doc:
                seen_in_this_doc.add(stem)
                if stem not in serp_map:
                    serp_map[stem] = surface

    if full_competitor_stems_list and len(full_competitor_stems_list) == num_competitors:
        all_serp_full_stems: Set[str] = set()
        for comp_full_set in full_competitor_stems_list:
            all_serp_full_stems.update(comp_full_set)
            for part_st in list(comp_full_set):
                for p in part_st.split():
                    if len(p) > 2:
                        all_serp_full_stems.add(p)

        for candidate_stem in serp_map.keys():
            count_docs = sum(1 for comp_full_set in full_competitor_stems_list if candidate_stem in comp_full_set)
            serp_consensus[candidate_stem] = max(1, count_docs)
    else:
        all_serp_full_stems = set(serp_map.keys())
        for comp_entities in competitor_entities_list:
            seen = {s for s, _, _ in comp_entities if s not in ALL_INDONESIAN_STOPWORDS}
            for s in seen:
                serp_consensus[s] = serp_consensus.get(s, 0) + 1
                for p in s.split():
                    if len(p) > 2:
                        all_serp_full_stems.add(p)

    # 1. Delta Gain: Ada di draft, TIDAK ADA di seluruh kosakata utuh kompetitor SERP
    gain_stems = set(draft_map.keys()) - all_serp_full_stems
    gain_items: List[EntityGapItem] = []
    for stem in gain_stems:
        surface = draft_map[stem]
        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        parts = stem.split()
        if len(parts) > 1 and all(p in all_serp_full_stems for p in parts):
            continue
        weight = draft_tfidf_weights.get(stem, 0.75)
        if len(parts) >= 2:
            weight = round(weight * 1.15, 4)
        gain_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=round(weight, 4),
                competitor_consensus_count=0,
            )
        )
    gain_items.sort(key=lambda x: x.tfidf_weight, reverse=True)
    top_gain = _deduplicate_subsumed_unigrams(gain_items, limit=10)

    # 2. Delta Deficit: Ada di SERP (consensus >= 2), 100% ABSEN dari kosakata utuh draft
    deficit_stems = set(serp_map.keys()) - complete_draft_stems
    deficit_items: List[EntityGapItem] = []
    min_required_consensus = 2 if num_competitors >= 2 else 1

    for stem in deficit_stems:
        surface = serp_map[stem]
        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        parts = stem.split()
        if len(parts) > 1 and all(p in complete_draft_stems for p in parts):
            continue

        consensus = serp_consensus.get(stem, 1)
        if consensus < min_required_consensus:
            continue

        weight = round(0.50 + (0.15 * min(consensus, 5)), 4)
        deficit_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=weight,
                competitor_consensus_count=consensus,
            )
        )

    deficit_items.sort(key=lambda x: (x.competitor_consensus_count, x.tfidf_weight), reverse=True)
    top_deficit = _deduplicate_subsumed_unigrams(deficit_items, limit=10)

    return EntityGapsGroup(deficit=top_deficit, gain=top_gain)
```

---

#### 3. Berkas: `backend/app/services/vsm_calculator.py`

Tambahkan perhitungan **Sliding-Window Passage Cosine Similarity** pada `compute_vsm_similarity`:
```python
    # Cosine Similarity Global (Persamaan 2.2)
    global_cosine_sims = cosine_similarity(draft_vec, competitor_vecs)[0]

    # Sprint 4.1: Sliding-Window Passage Cosine Similarity untuk mencegah delusi panjang dokumen
    draft_words = preprocessed_draft.split()
    draft_len = len(draft_words)
    effective_cosine_sims = []

    for idx, comp_text in enumerate(preprocessed_competitors):
        g_sim = float(global_cosine_sims[idx])
        comp_words = comp_text.split()
        comp_len = len(comp_words)

        if draft_len >= 40 and comp_len > int(draft_len * 1.35):
            window_size = draft_len
            stride = max(25, draft_len // 3)
            windows = []
            for start in range(0, comp_len - window_size + 1, stride):
                windows.append(" ".join(comp_words[start : start + window_size]))
            if comp_len > window_size:
                windows.append(" ".join(comp_words[-window_size:]))

            if windows:
                window_vecs = vectorizer.transform(windows)
                win_sims = cosine_similarity(draft_vec, window_vecs)[0]
                max_win_sim = float(np.max(win_sims))
                blended_sim = 0.35 * g_sim + 0.65 * max_win_sim
                effective_cosine_sims.append(max(g_sim, blended_sim))
            else:
                effective_cosine_sims.append(g_sim)
        else:
            effective_cosine_sims.append(g_sim)

    cosine_sims = np.array(effective_cosine_sims)
```

---

#### 4. Berkas: `backend/app/services/stylometrics.py`

Perbarui `extract_headings_from_markdown_or_text(text: str)` agar mendeteksi baik heading Markdown (`#`, `##`, `###`) maupun **baris sub-judul teks polos (Plain-Text Sub-Headings)**:
```python
def extract_headings_from_markdown_or_text(text: str) -> List[str]:
    headings: List[str] = []
    raw_lines = [l.strip() for l in text.split("\n") if l.strip()]
    num_lines = len(raw_lines)

    for idx, line_clean in enumerate(raw_lines):
        if re.match(r"^#{1,4}\s+", line_clean):
            heading_text = re.sub(r"^#{1,4}\s+", "", line_clean).strip()
            if heading_text:
                headings.append(heading_text)
            continue

        if idx >= num_lines - 1:
            continue

        if line_clean[-1] in (".", ",", ";", ":", "!"):
            continue

        words = line_clean.split()
        word_count = len(words)
        if not (2 <= word_count <= 12 and 10 <= len(line_clean) <= 95):
            continue

        if not line_clean[0].isupper():
            continue

        next_line = raw_lines[idx + 1]
        next_is_paragraph = len(next_line.split()) >= 12 or next_line.endswith(".")

        content_words = [w for w in words if w.lower() not in ALL_INDONESIAN_STOPWORDS]
        cap_ratio = (
            sum(1 for w in content_words if w[0].isupper()) / len(content_words)
            if content_words
            else 0.0
        )

        if next_is_paragraph and cap_ratio >= 0.50:
            headings.append(line_clean)

    return headings
```

---

#### 5. Berkas: `backend/app/services/gatekeeper.py`

1. **`_split_into_sentences(text: str)`:**
   Pecah berdasarkan `\n+` terlebih dahulu sebelum `(?<=[.!?])\s+` agar sub-judul terpisah dari kalimat paragraf di bawahnya.
2. **`generate_annotated_spans`:**
   - Pra-komputasi himpunan stem kalimat kompetitor di luar loop kalimat draf.
   - **Urutan Prioritas Stabilo:**
     1. **MERAH (`red`)**: Cek terlebih dahulu! Untuk kalimat `word_count >= 6` dan `len(sentence_stems) >= 4`, tandai merah jika `jaccard >= 0.50` ATAU (`containment >= 0.72` dan `overlap >= 4`).
     2. **KUNING (`yellow`)**: Cek `CLICHE_PHRASES`.
     3. **BIRU (`blue`)**: Cek `local_ttr < 0.40`.
     4. **HIJAU (`green`)**: Hanya untuk kalimat bebas merah/kuning/biru yang memiliki `word_count >= 7`, diakhiri tanda baca kalimat (`.!?`), dan memuat `gain_stems`.
3. **`calculate_composite_cds`:**
   - Integrasikan `red_span_ratio` ke dalam `c_vsm`:
     ```python
     c_vsm_doc = 100.0 * (1.0 - max(0.0, (max_cosine_sim - 0.25) / 0.75))
     c_vsm_sent = 100.0 * (1.0 - min(1.0, red_span_ratio * 1.5))
     c_vsm_raw = min(c_vsm_doc, 0.45 * c_vsm_doc + 0.55 * c_vsm_sent) if red_span_ratio >= 0.20 else c_vsm_doc
     c_vsm = max(0.0, min(100.0, c_vsm_raw))
     ```
   - Tambahkan **Non-Compensatory Pillar Floor**: pada syarat `"Siap Terbit"`, pastikan `c_ig >= 45.0` (jika `serp_entities_count >= 3`) agar artikel yang sangat dangkal tidak lolos hanya karena 3 metrik lain tinggi.
4. **`generate_overview_and_remediation`:**
   - Tambahkan parameter `competitor_count: int = 5`.
   - Baca `highest_competitor.get("page_title") or highest_competitor.get("title")`, `domain_name` / `domain`, dan `source_url` / `url`.
   - Ganti teks statis `"5 artikel kompetitor"` menjadi `f"{competitor_count} artikel kompetitor"`.

---

#### 6. Berkas: `backend/app/services/serp_scraper.py`

1. **Fast-Fail HTTPX & Selective `curl_cffi` Fallback di `fetch_page_content`:**
   - Gunakan `httpx.Timeout(4.5, connect=2.5)`.
   - **PENTING:** Hanya set `trigger_curl_fallback = True` jika `resp.status_code in (401, 403, 406, 429, 503)`! Jika `httpx` gagal karena `TimeoutException` atau `ConnectError` (server tujuan memang mati/lambat), **JANGAN** jalankan `curl_cffi` agar tidak membuang waktu tunggu tambahan 8 detik!
   - Gunakan timeout `4.5` detik pada `curl_cffi`.
2. **Penarikan 4 Halaman Paralel (40 Hasil Google) & 35 Kandidat:**
   - Panggil `_fetch_serper_page(client, clean_query, page_num=p)` untuk `p in (1, 2, 3, 4)` secara paralel dengan `asyncio.gather`.
   - Naikkan batas `candidate_urls` menjadi `35` kandidat unik.
3. **Implementasikan `passes_three_tier_relevance_guard` & Deduplikasi Hash Konten (`seen_text_hashes`):**
   - Terapkan 3 lapis saringan penjaga (*Lexical Anchor* di judul/200 kata pembuka, *Anchor Centroid Similarity* $\ge 0.08$ terhadap 3 artikel valid pertama Halaman 1, serta *Transactional Store Guard*).
   - Gunakan `seen_text_hashes: Set[str]` (berdasarkan `main_text_hash`) di samping `seen_domains` agar artikel sindikasi kembar lintas-domain tidak dihitung ganda.
   - Kumpulkan seluruh artikel valid yang lolos hingga maksimal `settings.SERP_TOP_K` (10 artikel).

---

#### 7. Berkas: `backend/app/api/v1/endpoints/audit_endpoints.py`

1. **Paralelisasi Preprocessing Sastrawi:**
   ```python
   prep_tasks = [preprocess_text_async(draft_content)] + [
       preprocess_text_async(c.get("clean_text", "")) for c in competitor_docs
   ]
   prep_results = await asyncio.gather(*prep_tasks)
   prep_draft = prep_results[0]
   prep_competitors = list(prep_results[1:])
   ```
2. **Integrasi `extract_full_stem_set` & Top-25 Consensus Entities untuk $C_{\text{IG}}$:**
   - Hitung `full_draft_stems = extract_full_stem_set(draft_content)` dan `full_comp_stems_list = [extract_full_stem_set(c.get("clean_text", "")) for c in competitor_docs]`.
   - Teruskan keduanya ke `calculate_information_gain`.
   - Untuk `calculate_composite_cds`, ambil maksimal **Top-25 Entitas Konsensus SERP** (`doc_freq >= 2`, diurutkan berdasarkan `doc_freq` tertinggi) sebagai `consensus_serp_stems`, lalu hitung `shared_consensus = consensus_serp_stems.intersection(full_draft_stems)`.
3. **Rekonstruksi `overview_bullets` Asli di `build_audit_execute_response(session)`:**
   - Saat memuat ulang sesi dari database (`GET /api/v1/sessions/{session_id}`), panggil `generate_overview_and_remediation(...)` menggunakan data metrik, `entity_gaps`, kompetitor dengan `cosine_similarity` tertinggi, dan span merah dari `annotated_spans` sehingga poin ringkasan diagnostik tetap tampil lengkap dan akurat!

---

### BAGIAN B: WORKER 1 — FRONTEND UI & SKEMA TRANSPARANSI SERP

---

#### 1. Berkas: `frontend/src/components/audit-block/SerpCompetitorsSection.tsx`

1. **Perbaiki Pembacaan Field `SerpAuditSummary` (Baris 22–27):**
   ```tsx
   const summary = audit.serp_audit_summary as any;
   const skippedVideo = summary?.skipped_video_social_count ?? summary?.skipped_video_social ?? summary?.reasons?.video_social ?? 0;
   const skippedPdf = summary?.skipped_pdf_doc_count ?? summary?.skipped_pdf_doc ?? summary?.reasons?.pdf_doc ?? 0;
   const skippedBot = summary?.skipped_bot_protect_count ?? summary?.skipped_bot_protected ?? summary?.reasons?.bot_protected ?? 0;
   const skippedShort = summary?.skipped_short_text_count ?? summary?.skipped_short_text ?? summary?.reasons?.short_text ?? 0;
   const skippedProxy = summary?.skipped_proxy_count ?? 0;
   const xSkipped = summary?.skipped_total ?? (skippedVideo + skippedPdf + skippedBot + skippedShort + skippedProxy);
   ```
2. **Tambahkan Fitur Lipat (*Accordion Toggle*) untuk Kompetitor $> 5$ Artikel:**
   - Gunakan `const [isExpanded, setIsExpanded] = React.useState<boolean>(false);` dengan `INITIAL_VISIBLE_COUNT = 5`.
   - Tampilkan 5 kompetitor pertama secara langsung. Jika `n > 5`, tampilkan tombol lipat/buka (`data-testid="toggle-more-competitors-btn"`):
     - Tertutup: `"Tampilkan {n - 5} Kompetitor Lainnya (Total Top {n} Google Competitor) ▼"`
     - Terbuka: `"Sembunyikan Kompetitor Tambahan ▲"`

---

#### 2. Berkas: `frontend/src/components/audit-block/AnnotatedTextSection.tsx`

Render span sub-judul pendek (`!span.color && wordsCount >= 2 && wordsCount <= 12 && !/[.!?:;,]$/.test(span.text.trim())`) sebagai blok judul tersendiri (`display: 'block'`, `fontWeight: 700`, `marginTop: idx === 0 ? '0px' : '12px'`, `marginBottom: '4px'`) agar sub-judul tidak menyatu menjadi satu paragraf raksasa dengan kalimat di bawahnya.
