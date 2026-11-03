# BLUEPRINT ARSITEKTUR & SPESIFIKASI MASTER SPRINT 4.3
## "Stabilo 4-Color Precision, Clause-Bound Long-Tail Gain, 80% Saturation CDS Ceiling, Contextual Visual Media Slots, & Slideshare Filter"

> **Status Dokumen:** APPROVED BLUEPRINT / READY FOR EXECUTION (DEVOPS & WORKERS)  
> **Target Rilis:** `v1.5.3-SNAPSHOT.1`  
> **Target Branch:** `feat/issue-92-sprint4-3-stabilo-precision-and-visual-slots`  
> **Komponen:** Backend Fast-API (`gatekeeper.py`, `nlp_pipeline.py`, `information_gain.py`, `stylometrics.py`, `serp_scraper.py`, `audit_endpoints.py`, `schemas/audit.py`) & Frontend React (`AnnotatedTextSection.tsx`, `App.tsx`, `FloatingComposerDock.tsx`, `draftSanitizer.ts`, `types/waskita.ts`)  
> **Lead Architect / System Analyst:** Tim Arsitektur WASKITA

---

## 1. LATAR BELAKANG & DIAGNOSTIK FORENSIK (THE ROOT CAUSES)

Berdasarkan hasil uji coba 5-putaran adversarial dan analisis tangkapan layar live `v1.5.2-SNAPSHOT.1`, ditemukan 7 cacat sistemik:

1. **False Red Penalti pada Sub-Judul Bernomor (`1. Unité d’Habitation`, `5. Kyoto...`):**
   Di `stylometrics.py`, validasi `line_clean[0].isupper()` mengabaikan angka (`'1'`, `'5'`), menyebabkan baris judul bernomor ditolak sebagai sub-judul (`is_heading = False`). Di `gatekeeper.py`, rumus *Containment* ($\ge 0.72$) menghukum nama gedung tersebut dengan `color = "red"`. Di React `AnnotatedTextSection.tsx`, span merah dipaksa inline, sehingga menempel rapat ke paragraf di bawahnya.
2. **Stabilo Hijau Mati Total (0 Triggers) Akibat Batasan Bigram:**
   Di `gatekeeper.py`, loop stem kalimat hanya memproduksi 1-kata dan 2-kata (bigram), sedangkan entitas Information Gain didominasi 3-kata (trigram: `Robin Hood Gardens`, `Austria Karya Fritz`). Selain itu, pemecahan `re.findall(r"\b\w+\b")` memutus tanda hubung (`Saint-Pierre`), dan teks belum dinormalisasi ASCII (`Pompéia`, `Unité`).
3. **Stabilo Biru Mati Secara Matematis:**
   Di `gatekeeper.py`, ambang batas `local_ttr < 0.40` pada kalimat tunggal manusia normal secara fisik hampir mustahil tercapai (kalimat repetitif sekalipun memiliki TTR $\ge 0.70$).
4. **"Frankenstein Trigrams" pada Information Gain:**
   Di `nlp_pipeline.py`, ekstraksi gain melompati koma dan kurung tanpa batas klausa, serta menggabungkan kata depan (`Austria Karya Fritz`, `Prancis Yaitu Beton`, `Eksplorasi Tipologis Dari`). Di `information_gain.py`, filter kompetitor bocor karena kata penyambung (*di, dan, yaitu, tanpa*) absen dari set stem kompetitor.
5. **Skor Mentok di 98% Akibat Ketiadaan Ambang Jenuh (Saturation Ceiling):**
   Di `gatekeeper.py`, `coverage_ratio` menuntut $100\%$ pemenuhan seluruh 25 entitas konsensus SERP yang dikumpulkan dari 10 artikel berbeda. Ini tidak realistis untuk artikel 900 kata.
6. **Kebocoran Domain Slideshare & Dokumen OCR di SERP:**
   URL presentasi/OCR seperti `slideshare.net` lolos ke dalam Top 10 kompetitor artikel teks, merusak bobot TF-IDF dengan teks hasil scan rusak.
7. **Ghost Image Alt-Text & Absennya Slot Visual Kontekstual:**
   Copy-paste dari WordPress membawa alt-text berulang (`.Mengenal Arsitektur Brutalisme dan Contoh`) dan metadata `Posted on ... by ...`. Belum ada sistem yang memandu pengguna di mana slot gambar harus diletakkan saat artikel dipublikasikan di CMS.

---

## 2. ARSITEKTUR TEKNIS & PERUBAHAN SPESIFIKASI

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION & SANITASI KONTEN (Frontend & Backend)                                    │
│    - draftSanitizer.ts: Bersihkan boilerplate WordPress ("Posted on..."), pisahkan titik│
│      yang menempel (.Mengenal -> . Mengenal), ekstrak [gambar N: Konteks Subjudul].   │
│    - serp_scraper.py: Blokir slideshare.net, scribd.com, academia.edu, researchgate.net│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. DETEKSI SUB-JUDUL & STABILO 4-WARNA (stylometrics.py & gatekeeper.py)               │
│    - Heading Regex: Izinkan penomoran daftar ^\d+[\.\)]\s+[A-Z\u00C0-\u024F].          │
│    - is_heading = True bebas 100% dari pengecekan stabilo merah!                       │
│    - Stabilo Hijau: Dukung Trigram, Substring langsung, dan normalisasi hyphen/aksen.  │
│    - Stabilo Biru: Deteksi kata konten repetitif (kata konten muncul >= 3x per kalimat│
│      atau Content-TTR < 0.65).                                                         │
│    - Stabilo Kuning: Perluas CLICHE_PHRASES dengan ekspositori generik Indonesia.      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. REKAYASA ENTITAS GAIN, DEFISIT & SKOR CDS 100% (nlp_pipeline.py & gatekeeper.py)   │
│    - Clause-Bound Gain: Ekstraksi gain dilarang melompati tanda baca koma, titik dua. │
│    - Larang kata hubung (di, dan, yaitu, tanpa, karya) di dalam entitas gain.          │
│    - Non-Topical Sanitizer: Tambahkan stem (pengaruh, dasar, tonjol, kembang, tekan,  │
│      anggap, khas, cepat, salah, letak, akses, padu, hidup) ke daftar blokir defisit.  │
│    - 80% Saturation Threshold: CDS tembus 100% jika coverage mencapai >= 80% SERP.    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. VISUAL MEDIA SLOT & UI FIXES (AnnotatedTextSection.tsx, App.tsx)                    │
│    - Render [gambar N: ...] sebagai Kartu Visual Slot Gambar interaktif di naskah.     │
│    - Perbaiki tombol "Buka Kunci" kueri di App.tsx (izinkan toggle murni).            │
│    - Sub-judul heading wajib display: block tanpa kebocoran status mark merah.         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. INSTRUKSI IMPLEMENTASI DETAIL

### A. WORKER 2: BACKEND ALGORITHMIC RE-ENGINEERING

#### 1. Perbaikan Deteksi Sub-Judul Bernomor
**Berkas:** `backend/app/services/stylometrics.py` & `backend/app/services/gatekeeper.py`
* Tambahkan dukungan regex penomoran daftar pada `extract_headings_from_markdown_or_text`:
  ```python
  is_numbered_heading = bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", line_clean))
  if not line_clean[0].isupper() and not is_numbered_heading:
      continue
  ```
* Di `_split_into_sentences` (`gatekeeper.py`):
  ```python
  is_numbered_heading = bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", line_clean))
  is_heading_line = (
      bool(re.match(r"^#{1,4}\s+", line_clean))
      or is_numbered_heading
      or (len(line_clean.split()) <= 14 and (line_clean.endswith("?") or not line_clean.endswith((".", "!", ":", ";"))))
  )
  ```
* Di `generate_annotated_spans` (`gatekeeper.py`):
  Pastikan `is_heading` bernilai `True` jika `bool(re.match(r"^\d+[\.\)]\s+[A-Z\u00C0-\u024F]", sentence))` terpenuhi. Baris heading langsung di-append dengan `color=None, is_heading=True` dan **`continue`** (tidak boleh dievaluasi di prioritas merah!).

#### 2. Perbaikan Stabilo Hijau, Biru, dan Kuning
**Berkas:** `backend/app/services/gatekeeper.py`
* **Stabilo Hijau:**
  Normalisasi ASCII kalimat (`sentence_clean = normalize_text_ascii(s_lower)`).
  Bangun unigram, bigram, dan **trigram**:
  ```python
  for i in range(len(sentence_stems_list) - 2):
      sentence_stems_all.add(f"{sentence_stems_list[i]} {sentence_stems_list[i+1]} {sentence_stems_list[i+2]}")
  ```
  Cocokkan juga surface form substring:
  ```python
  gain_surfaces = [item.term_surface_form.lower() for item in entity_gaps.gain]
  has_gain_entity = any(gs in sentence_stems_all for gs in gain_stems) or any(surf in sentence_clean for surf in gain_surfaces)
  ```
* **Stabilo Biru (Normalisasi Matematis):**
  Ubah kriteria stabilo biru:
  ```python
  content_words = [w for w in words if w not in ALL_INDONESIAN_STOPWORDS and len(w) > 2]
  word_freq = {}
  for cw in content_words:
      word_freq[cw] = word_freq.get(cw, 0) + 1
  has_repetitive_words = any(cnt >= 3 for cnt in word_freq.values())
  content_ttr = len(set(content_words)) / len(content_words) if len(content_words) >= 6 else 1.0
  if has_repetitive_words or (len(words) >= 10 and content_ttr < 0.60):
      spans.append(AnnotatedSpan(text=sentence, color="blue", label="Kosakata Monoton"))
      continue
  ```
* **Stabilo Kuning:**
  Perluas `CLICHE_PHRASES` dengan:
  `"tak ayal"`, `"hingga saat ini"`, `"tidak terlepas dari"`, `"seiring perkembangan zaman"`, `"bukan sekadar"`, `"memainkan peran penting"`, `"perlu diketahui bahwa"`, `"dapat disimpulkan bahwa"`.

#### 3. Clause-Bound Information Gain & Pembersihan Stopwords Defisit
**Berkas:** `backend/app/services/nlp_pipeline.py` & `backend/app/services/information_gain.py`
* Di `extract_candidate_gain_entities`:
  Pecah baris menjadi klausa-klausa berdasarkan tanda baca:
  `clauses = re.split(r"[,;:\(\)\[\]\{\}—\-]", line)`
  Proses n-gram **hanya di dalam masing-masing klausa** (dilarang menabrak koma).
  Larang kata hubung/depan (`di`, `ke`, `dari`, `dan`, `atau`, `yaitu`, `tanpa`, `karya`, `untuk`, `dengan`) berada di dalam frasa Bigram/Trigram.
* Di `NON_TOPICAL_VERBS_AND_ADJECTIVES`:
  Tambahkan:
  `"pengaruh"`, `"dasar"`, `"tonjol"`, `"kembang"`, `"tekan"`, `"anggap"`, `"khas"`, `"cepat"`, `"salah"`, `"letak"`, `"akses"`, `"padu"`, `"hidup"`, `"mempengaruhi"`, `"berdasarkan"`, `"penonjolan"`, `"perkembangan"`, `"penekanan"`, `"dianggap"`, `"khasnya"`, `"kehidupan"`.
  Keluarkan `"inggris"` dari daftar blokir ini.

#### 4. Ambang Jenuh Cakupan Entitas 80% (100% CDS Capable)
**Berkas:** `backend/app/services/gatekeeper.py`
* Di `calculate_composite_cds`:
  ```python
  # Ambang jenuh cakupan pasar 80% (Sprint 4.3)
  saturated_serp_target = max(1, int(serp_entities_count * 0.80))
  coverage_ratio = min(1.0, shared_entities_count / saturated_serp_target)
  gain_ratio = min(1.0, gain_count / 5.0)
  c_ig_raw = 100.0 * (0.6 * coverage_ratio + 0.4 * gain_ratio)
  c_ig = max(0.0, min(100.0, c_ig_raw))
  ```

#### 5. Pemblokiran Dokumen Slideshare/OCR di SERP
**Berkas:** `backend/app/services/serp_scraper.py`
* Tambahkan ke dalam `PDF_DOCUMENT_EXTENSIONS_OR_DOMAINS`:
  `"slideshare.net"`, `"www.slideshare.net"`, `"scribd.com"`, `"www.scribd.com"`, `"academia.edu"`, `"researchgate.net"`, `"studocu.com"`.
  Dokumen dari domain ini otomatis ditolak dan dicatat di `skipped_pdf_doc_count`.

---

### B. WORKER 1: FRONTEND WORKSPACE & VISUAL SLOTS

#### 1. Contextual Visual Media Slot Component
**Berkas:** `frontend/src/utils/draftSanitizer.ts` & `frontend/src/components/audit-block/AnnotatedTextSection.tsx`
* Di `draftSanitizer.ts`:
  Ekstrak konteks gambar dari HTML: jika tag `<img>` didahului oleh heading H2/H3 atau berada di bawah subjudul bernomor, jadikan token:
  `\n[gambar ${imageCounter}: Ilustrasi ${subheadingText || 'Bagian Ini'}]\n`
  Bersihkan boilerplate WordPress `Posted on ... by ...` dan perbaiki titik menempel (`.([A-Z])` $\to$ `. \1`).
* Di `AnnotatedTextSection.tsx`:
  Cek regex `/^\[gambar\s+(\d+)(?::\s*([^\]]+))?\]/i`. Jika cocok, render sebagai **Kartu Slot Gambar**:
  ```tsx
  <div style={{
    background: 'rgba(59, 130, 246, 0.05)',
    border: '1px dashed rgba(59, 130, 246, 0.4)',
    borderRadius: '8px',
    padding: '8px 12px',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#1E40AF'
  }}>
    <span>🖼️</span>
    <span><strong>Slot Gambar #{match[1]}:</strong> {match[2] || 'Ilustrasi Pendukung Konten'} (Letakkan aset visual di sini saat rilis CMS)</span>
  </div>
  ```

#### 2. Perbaikan Logika Buka Kunci Kueri di App.tsx
**Berkas:** `frontend/src/App.tsx`
* Ubah state `isQueryLocked`:
  Pisahkan status `isExplicitlyLockedByUser` sehingga saat tombol "Buka Kunci" diklik, sistem benar-benar membuka kunci kueri (`isQueryLocked = false`).

---

## 4. RENCANA VERIFIKASI SPRINT 4.3 (ACCEPTANCE CRITERIA)

1. **Uji Sub-Judul Bernomor:** Masukkan draf dengan `1. Unité d’Habitation (Marseille, Prancis)` dan `5. Kyoto International Conference Center (Kyoto, Jepang)`. Pastikan keduanya **bebas dari stabilo merah** dan tampil rapi sebagai blok sub-judul tebal!
2. **Uji Stabilo Hijau:** Naskah yang memuat `Robin Hood Gardens`, `Habitat 67`, `Gereja Saint-Pierre`, dan `Gereja Wotruba` **wajib menyala hijau** (Orisinalitas Kuat).
3. **Uji Skor 100%:** Draf yang mencakup $\ge 80\%$ topik konsensus kompetitor dan memiliki $\ge 5$ Information Gain unik wajib mencapai **skor CDS 99% - 100%**.
4. **Uji Filter Slideshare:** Pencarian SERP yang mendapati `slideshare.net` otomatis mengabaikan domain tersebut dan mencatatnya sebagai hasil dilewati.
5. **Uji Visual Media Slot:** Naskah dengan tag `[gambar 1: ...]` tampil sebagai banner kartu visual slot gambar yang elegan.
