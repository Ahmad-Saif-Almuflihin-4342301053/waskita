# SPRINT 3.0 — INTEGRITAS DATA SERP LIVE & VALIDASI ALGORITMA (WASKITA)
**Penulis:** System Analyst (Chat 1) → **Penerima:** DevOps & GitHub Dispatcher (Chat 2)
**Status:** Blueprint siap eksekusi. Dilarang menulis kode di fase ini (AGENTS.md §5 Fase 1).
**Tujuan:** (1) membuktikan algoritma bekerja pada data Google asli, (2) menutup celah data palsu yang diam-diam menghasilkan vonis, (3) menentukan K (jumlah kompetitor) dan ambang batas berdasarkan data, BUKAN dugaan. Refactor "dinamis" (pemangkasan `App.tsx` dsb.) **ditunda sampai Fase C selesai**.

---

## 0. TEMUAN AUDIT (bukti dari kode, dibaca pada 27 Okt 2026)

| # | Temuan | Bukti | Dampak |
|---|---|---|---|
| T1 | `SERPER_API_KEY` kosong ⇒ seluruh SERP berasal dari korpus offline. Keyword yang tidak ada di daftar tema bawaan menghasilkan 3 dokumen sintetis `*.example.com/org/net`. | `serp_scraper.py` L201-205; `benchmark_corpus.py` L159-160, L207-213 | Vonis "Siap Terbit 83%" pada screenshot tidak bermakna. |
| T2 | UI tetap berlabel "Referensi SERP · Top 3 Google Competitor" dan menaruh link ke domain `example.*` padahal datanya palsu. | `SerpCompetitorsSection.tsx` | Menyesatkan pengguna. |
| T3 | Dokumen fallback ikut **di-cache 24 jam** dengan kunci yang sama dengan data live (`serp:v1`). | `serp_scraper.py` L204, L270, L276; `cache.py` `get_serp_cache` | Setelah key dipasang, keyword lama bisa tetap menyajikan data palsu. |
| T4 | Saat Serper gagal (non-200, <2 URL valid, exception) sistem **diam-diam** pindah ke korpus palsu walau key terpasang. | `serp_scraper.py` L222-223, L236-237, L268-277 | Kegagalan live tersamarkan menjadi hasil "sukses". |
| T5 | Flag `FEATURE_OFFLINE_CORPUS_FALLBACK` didefinisikan tetapi **tidak dipakai** di mana pun. | `config.py` L31; grep `app/` hanya 1 hasil | Tidak ada tombol untuk mematikan fallback. |
| T6 | Angka "3" ter-hardcode di banyak tempat: `len(candidate_urls) == 3`, `.slice(0, 3)`, judul "Top 3", pesan "2 dari 3". | `serp_scraper.py` L232; `SerpCompetitorsSection.tsx`; `audit_endpoints.py` L247 | K tidak bisa diubah/diuji. |
| T7 | **Bug turn ≥2:** saat memakai ulang snapshot SERP dari sesi induk, kunci dict adalah `rank/title/url/domain/snippet`, tetapi kode penyimpanan membaca `rank_position/page_title/source_url/domain_name/snippet_text`. | `audit_endpoints.py` L209-235 vs L377-390 | Turn kedua berpotensi menyimpan rank=1, judul & URL kosong (VSM tetap jalan karena `clean_text` cocok). Wajib direproduksi test. |
| T8 | **Tidak ada gerbang relevansi topik.** C_VSM bernilai penuh bila `max_cosine ≤ 0.25`, jadi draf yang **tidak nyambung** dengan topik pun mendapat skor tinggi. Hitung manual: C_VSM=100, C_IG=40 (coverage 0, gain≥5), MATTR=100, HKO=100 ⇒ **CDS ≈ 82 ≥ 75 ⇒ "Siap Terbit"**. | `gatekeeper.py` `calculate_composite_cds` L151-218 | Hipotesis berdasarkan rumus; **harus dibuktikan Kontrol C2 (§4)** sebelum diperbaiki. |
| T9 | Sampingan: backend mengirim `"Siap Terbit"`, tipe frontend `'Layak Terbit' \| 'Perlu Revisi'`; `App.tsx` L302 menghitung vonis lokal. | `waskita.ts` L69/L87; `App.tsx` | Catat saja; pastikan alur tunnel memakai backend, bukan jalur mock lokal. |

---

## 1. KEPUTUSAN ARSITEKTUR (bisa dibantah Pimpro)
1. **Zero-schema mutation:** tidak ada kolom/tabel baru. Sumber data diturunkan dari `fetch_status` yang sudah tersimpan di `CompetitorDocument`.
2. **Label sumber data** (nilai baru `fetch_status`, jangan bentrok dengan `fallback_curl_cffi` yang berarti *live via curl_cffi*):
   - `success` / `fallback_curl_cffi` ⇒ **live**
   - `offline_curated` ⇒ korpus tulisan tangan tim (kopi tubruk, kanker serviks, SEO)
   - `offline_synthetic` ⇒ generator template `example.*`
3. **Field respons baru:** `serp_source: "live" | "offline_curated" | "offline_synthetic"` pada `AuditExecuteResponse`, diturunkan di `build_audit_execute_response` dan di jalur `execute` dari `fetch_status` dokumen.
4. **Vonis:** `offline_synthetic` ⇒ `verdict_status = "Mode Demo"` (tanpa gauge hijau/amber, tanpa remediation seolah valid). `offline_curated` ⇒ vonis boleh, tetapi banner "Korpus uji internal, bukan hasil Google". `live` ⇒ normal.
5. **Kebijakan fallback:** `FEATURE_OFFLINE_CORPUS_FALLBACK=false` ⇒ semua kegagalan SERP menghasilkan HTTP 503 berpesan humanis (tidak ada data palsu). `true` ⇒ fallback boleh, selalu berlabel. **Selama Fase C wajib `false`.**
6. **Cache:** kunci menjadi `serp:v2:k{K}`; dokumen `offline_*` **tidak pernah** di-cache.
7. **K dapat dikonfigurasi & Target Top 10:** `SERP_TOP_K` (default **10**), `SERP_MIN_DOC_WORDS` (default 150). Parameter Serper API diset `num: 15` (tetap 1 kredit) untuk menampung cadangan link. Kolam kandidat disaring secara terurut: buang media/sosmed/PDF, dan terapkan fallback `curl_cffi` chrome120 seketika pada HTTP 403/timeout (khusus situs kampus seperti `uib.ac.id`).
8. **Transparansi Hasil yang Dilewati (SERP Transparency):** 
   - Backend mengirimkan metadata `serp_audit_summary` pada respons yang merinci berapa hasil Google yang lolos dan berapa yang dilewati beserta alasannya (`"Dokumen PDF / Scribd"`, `"Sosmed / Video Reels"`, `"Bot Firewall / HTTP 403"`, `"Teks Terlalu Singkat"`).
   - Frontend menampilkan info transparan: *"Menampilkan N artikel acuan. (X hasil dilewati: format non-artikel / video / proteksi bot)."*
9. **Degradasi (FR-13):** ≥3 dokumen ⇒ normal; tepat 2 ⇒ `degradation_warning` ("X dari K"); <2 ⇒ 503.
10. Tidak ada perubahan rumus CDS di sprint ini. Perubahan rumus/ambang hanya setelah data Fase C (Fase D).

---

## 2. TUGAS PER WORKER (satu GitHub Issue per worker; branch `feat/issue-<N>-serp-live-integrity`)

### Worker 1 — Core/Backend (`worker-1`)
Berkas: `backend/app/services/serp_scraper.py`, `backend/app/fixtures/benchmark_corpus.py`, `backend/app/core/config.py`, `backend/app/core/cache.py`, `backend/app/schemas/audit.py`, `backend/app/api/v1/endpoints/audit_endpoints.py`, `backend/.env.example`.
1. Tambah setting `SERP_TOP_K=10`, `SERP_MIN_DOC_WORDS=150`; pakai `FEATURE_OFFLINE_CORPUS_FALLBACK` (T5).
2. Di Serper request, ubah `num: 15` (tetap 1 kredit). Ambil hingga 10 artikel valid yang berhasil di-scrape.
3. Tingkatkan ketahanan scraper untuk situs kampus/proteksi bot (seperti `uib.ac.id`): jika `httpx` menghasilkan status 403, 401, timeout, atau teks kosong, wajib otomatis lakukan fallback ke `curl_cffi` dengan `impersonate="chrome120"`.
4. Catat riwayat URL yang dilewati ke dalam struktur `serp_audit_summary` (kategori: video/sosmed, dokumen PDF, gagal fetch/proteksi, atau teks < 150 kata).
5. `get_fallback_corpus` mengembalikan **salinan** dokumen dengan `fetch_status` = `offline_curated`/`offline_synthetic` (jangan mutasi konstanta modul).
6. Hapus pemanggilan `set_serp_cache` untuk dokumen offline; kunci cache `serp:v2:k{K}` (T3).
7. Kegagalan live dengan key terpasang mengikuti Keputusan 5 (T4); key kosong + flag `false` ⇒ 503 humanis.
8. Tambah `serp_source` dan `serp_audit_summary` ke skema respons; terapkan vonis "Mode Demo" bila sintetis (Keputusan 4).
9. Perbaiki T7: samakan kunci dict snapshot-induk dengan kunci yang dibaca penyimpan (satu fungsi normalisasi, bukan dua format).
10. Log berjenjang; **dilarang** mencetak `SERPER_API_KEY` atau header `X-API-KEY` ke log/console (PZN Logging Standard). Boleh mencatat `bool(key)`.
11. `.env.example`: tambahkan `SERP_TOP_K=10`, `SERP_MIN_DOC_WORDS=150`.

### Worker 2 — UI/UX (`worker-2`)
Berkas: `frontend/src/types/waskita.ts`, `SerpCompetitorsSection.tsx`, `VerdictSection.tsx`, `ExecutiveAuditPrintReport.tsx`, `frontend/src/utils/clientExporter.ts`.
1. Tipe: tambah `serp_source`, `serp_audit_summary`, dan `'Mode Demo'` pada union vonis.
2. `SerpCompetitorsSection`: 
   - Judul dinamis "Referensi SERP · Top {n} Google Competitor" (sesuai jumlah artikel yang berhasil dianalisis).
   - Tampilkan seluruh artikel kompetitor (hapus `.slice(0,3)`).
   - **Fitur Transparansi SERP:** Tambahkan sub-baris / chip informatif di bawah judul yang memberitahukan: *"Menampilkan {n} artikel acuan ({x} hasil Google dilewati: {y} video/sosmed, {z} PDF/dokumen)."*
   - Jika `serp_source !== 'live'`, tampilkan banner jelas (Mode Demo / Korpus Uji). Nonaktifkan tautan dummy `example.*`.
3. `VerdictSection`: vonis "Mode Demo" tampil netral (tanpa gauge hijau, tanpa label "Siap Terbit").
4. Cetak A4 & ekspor `.md/.csv/.json` wajib memuat baris ringkasan SERP dan sumber data bila bukan `live`.
5. Mobile-First (390–414px), kontras mode gelap memakai token semantik; tanpa emoji; komponen ≤400 baris (QA Gate 1–2).

### Worker 3 — QA (`worker-3`)
Berkas: `backend/tests/` + skrip validasi `backend/tests/validation/run_serp_validation.py` (baru, hanya untuk pengujian).
1. Test regresi untuk T1/T3/T4/T5/T7 (mock Serper dan jaringan; tanpa panggilan live di CI).
2. Perbarui test lama yang mengasumsikan vonis dari korpus sintetis: yang menguji mesin IR tetap memanggil mesin langsung; yang menguji endpoint harus meng-assert `serp_source` dan "Mode Demo".
3. Pastikan `evaluate_accuracy.py` tetap F1 = 1.0, `pytest` hijau, `npm run build` exit 0, bundle `dist/` < 350 KB.
4. Skrip validasi §4: baca daftar keyword + berkas draf dari folder `backend/tests/validation/samples/`, panggil `POST /api/v1/audit/execute` tanpa `parent_session_id`, simpan JSON mentah ke `backend/tests/validation/reports/` (masuk `.gitignore`) dan ringkasan Markdown ke `docs/validation/`. Tidak boleh memuat API key di keluaran.

---

## 3. TUGAS DEVOPS (operasional, tanpa mengubah kode)
**Fase A — sekarang, sebelum Worker mulai** (membuka blokir uji manual):
1. Buat `backend/.env` dari `.env.example`, isi `SERPER_API_KEY` dari pesan user di chat DevOps. Pastikan `git check-ignore backend/.env` mengembalikan path (artinya terabaikan).
2. **Jalankan uvicorn dari dalam folder `backend/`** karena `env_file=".env"` dan `DATABASE_URL=sqlite:///./waskita.db` bersifat relatif terhadap direktori kerja. Jika dijalankan dari root, key tidak terbaca dan database yang terpakai pun berbeda (ada `waskita.db` di root dan di `backend/`).
3. Verifikasi key terbaca tanpa mencetaknya: `python -c "from app.core.config import settings; print(bool(settings.SERPER_API_KEY))"` dari `backend/` ⇒ harus `True`.
4. Cek `curl_cffi` dan `trafilatura` ter-install di `.venv`; cek koneksi keluar.
5. Jalankan Vite (port 5173, proxy `/api` ke `localhost:8000` sudah ada) dan buka tunnel `cloudflared` quick tunnel (tanpa akun) ke port 5173.
6. Smoke test: sesi **Analisis Baru** (jangan melanjutkan sesi lama; snapshot sesi lama menyimpan data palsu), keyword baru, lalu laporkan 3+ domain, `fetch_status`, `word_count`. Tidak boleh ada `*.example.*`.
7. **Peringatan keamanan:** mode Tamu mengizinkan audit tanpa login, jadi siapa pun yang memegang URL tunnel dapat menghabiskan kredit Serper. Bagikan URL hanya ke user, tutup tunnel setelah selesai.

**Fase B — implementasi:** buat 3 GitHub Issue (W1/W2/W3) berisi §2 sebagai Instruction Manual, dispatch W1 dan W2 paralel (berkas tidak tumpang tindih), W3 setelah W1 merge ke branch proyek. Review dengan QA Gate 1–5, merge, tag `v1.4.0-SNAPSHOT.1`. Pasang `FEATURE_OFFLINE_CORPUS_FALLBACK=false` di `.env`.

**Fase C — eksekusi validasi:** jalankan skrip W3 sesuai §4 dan serahkan laporan ke Chat Analis.

---

## 4. PROTOKOL VALIDASI (Fase C)
**Keyword:** 3 buah, sifatnya berbeda (umum-informasional, niche, ambigu). Usulan: `memahami fondasi desain arsitektur`, `cara menyeduh kopi tubruk`, `manfaat kecerdasan buatan dalam pendidikan`. Semua draf ≥ 300 kata murni (`validate_word_count`).

**Lima draf per keyword (kontrol positif/negatif):**
| Kode | Draf | Hasil yang diharapkan | Tipe uji |
|---|---|---|---|
| C1 | Salin `clean_text` kompetitor peringkat 1 (gabung peringkat 2 bila <300 kata) | `max_cosine` sangat tinggi, `is_redundant=true`, "Perlu Revisi", stabilo merah | LULUS/GAGAL |
| C2 | Artikel **tidak nyambung** (mis. resep nasi goreng untuk keyword arsitektur) | Harus **bukan** "Siap Terbit" (hipotesis T8 menyatakan sistem salah meluluskan) | LULUS/GAGAL |
| C3 | ChatGPT, prompt generik tanpa riset | Klise (kuning) muncul, defisit terdeteksi; skor jadi garis dasar | Kalibrasi |
| C4 | ChatGPT, prompt = C3 + `remediation_prompt` dari hasil C3 | CDS(C4) > CDS(C3) dan jumlah defisit turun | LULUS/GAGAL (tes janji produk) |
| C5 | Naskah dengan keyword diulang berlebihan | `is_keyword_stuffed=true` (HKO atau MATTR) | LULUS/GAGAL |

**Template prompt ChatGPT (user yang menjalankan):**
- C3: `Tulis artikel blog Bahasa Indonesia sekitar 700 kata dengan judul dan beberapa subjudul tentang: <KEYWORD>.`
- C4: `Revisi artikel di bawah ini mengikuti panduan berikut, pertahankan sudut pandang unik: <tempel remediation_prompt dari hasil C3>. Artikel: <tempel C3>`

**Uji tambahan:**
- **Determinisme:** draf yang sama dijalankan 2× dengan snapshot SERP yang sama ⇒ metrik identik.
- **Pemilihan K:** untuk setiap keyword ulangi C3 dan C4 dengan `SERP_TOP_K` = 3, 5, 8 (restart backend tiap perubahan). Catat CDS, daftar defisit, latensi total.
- **Kredit:** 3 keyword hanya memakai ±3–9 kredit dari 2.500. Cache memori mencegah panggilan ganda untuk keyword sama selama 24 jam atau sampai backend restart.

**Format laporan (`docs/validation/SERP_VALIDATION_<tanggal>.md`):** tabel keyword × draf berisi `serp_source`, jumlah dokumen live, `max_cosine`, `avg_cosine`, MATTR, HKO, CDS, vonis, jumlah defisit/gain, latensi detik, plus daftar domain tiap keyword.

**Kriteria lulus Fase C (Gate Sprint 3.0):**
1. Semua `serp_source=live`; tidak ada `example.*` pada ketiga keyword.
2. C1 dan C5 terdeteksi; C4 > C3 pada ≥2 dari 3 keyword; determinisme identik.
3. C2 tidak diloloskan. Jika C2 lolos (T8 terbukti) ⇒ **Fase D wajib**: Analis menyusun blueprint gerbang relevansi topik dengan ambang yang dikalibrasi dari data laporan ini (tidak boleh menebak angka).
4. Rekomendasi K diputuskan dari data latensi dan stabilitas skor.

---

## 5. DI LUAR CAKUPAN (jangan dikerjakan sprint ini)
Redis, LLM API apa pun, perombakan rumus CDS, pemangkasan `App.tsx`/penggabungan `guest-sidebar.tsx`, rate-limit endpoint publik (catat sebagai Level 2 bila tunnel dipakai lebih dari uji sesaat).
