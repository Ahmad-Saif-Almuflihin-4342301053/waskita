# SPRINT 3.5 — TOPIC GUARD BLOCKER, DYNAMIC GAUGE COLORS, ACTIONABLE CMS PROMPT, & ONE-CLICK AUTO-FORK
**Penulis:** System Analyst (Chat 1) → **Penerima:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** Dokumen Resmi Rekayasa Perangkat Lunak (Sprint 3.5 Final)  
**Target Rilis:** `v1.4.5-SNAPSHOT.1`  

---

## 🎯 1. TUJUAN & RUANG LINGKUP
Sprint 3.5 menuntaskan empat kelemahan fungsional dan estetika UI/UX pada sistem WASKITA:
1. **Transformasi Prompt "Siap Terbit" Menjadi Prompt Pra-Publikasi CMS & SEO (Actionable):**  
   Mengganti kalimat pengumuman administratif statis pada draf yang lolos audit (skor $\ge 75\%$) menjadi prompt praktis siap pakai untuk menghasilkan Meta Title, Meta Description, Tag Kategori, dan Cuplikan Medsos.
2. **Prioritas Ekstraksi Judul Utama pada `draftSanitizer.ts`:**  
   Menghapus pembuangan entitas judul baris pertama agar kueri target tidak lagi nyasar mengambil sub-judul pinggiran naskah yang memicu video TikTok/sosmed di Google SERP.
3. **Menghentikan Evaluasi Lanjutan saat Salah Topik (Out-of-Domain Blocker Card):**  
   Jika naskah revisi terdeteksi melenceng dari topik sesi (< 5% kemiripan), sistem langsung menghentikan render ke bawah (sembunyikan 7 metrik, stabilo, dan SERP kompetitor yang salah), lalu menampilkan kartu penolakan terfokus dengan tombol pemindah sesi otomatis.
4. **Jembatan Satu Klik Buka Sesi Baru (*One-Click Auto-Fork*):**  
   Ketika tombol *"Mulai Sesi Baru dengan Draf Ini"* diklik, draf otomatis dibuka di sesi baru, kueri yang cocok langsung diekstrak, dan Google Serper dipanggil untuk topik baru tersebut.
5. **Warna Busur Lingkaran Dinamis (Dynamic SemiCircleGauge):**  
   Memperbaiki bug warna hardcoded hijau (`#10B981`) pada busur skor gauge. Skor 20% wajib berwarna Merah menyala.

---

## 🛑 2. SPESIFIKASI DETAIL IMPLEMENTASI

### A. Backend: Prompt Pra-Publikasi CMS di `gatekeeper.py`
* **Berkas:** `backend/app/services/gatekeeper.py` (pada fungsi `generate_overview_and_remediation`).
* **Saat `verdict_status == "Siap Terbit"` (skor CDS $\ge 75\%$):**
  - **DILARANG** menghasilkan kalimat pengumuman statis: *"Draf untuk kueri X telah memenuhi standar..."*.
  - **WAJIB** menghasilkan format instruksi pra-publikasi siap pakai ke AI (ChatGPT / Claude / Gemini):
    ```python
    gain_terms = ", ".join([g.term_surface_form for g in entity_gaps.gain[:4]]) if entity_gaps.gain else "konten orisinal naskah"
    remediation_prompt = (
        f"Draf artikel ini telah lolos audit orisinalitas WASKITA dengan skor tinggi ({cds_score}%) untuk topik '{target_query}'.\n\n"
        "Tolong siapkan paket materi pra-publikasi CMS & SEO untuk artikel ini tanpa mengubah isi naskah pokoknya:\n"
        f"1. Meta Title SEO: Buatkan judul menarik maksimal 60 karakter yang memuat kata kunci '{target_query}'.\n"
        "2. Meta Description: Buatkan deskripsi 140–155 karakter yang persuasif dan memicu CTR tinggi di Google.\n"
        f"3. Taksonomi & Tag: Ekstrak 3–5 tag kategori paling relevan untuk pengelompokan artikel di CMS.\n"
        "4. Ringkasan Eksekutif (Lead): Tuliskan cuplikan pembuka 2 kalimat untuk teaser media sosial dan newsletter.\n"
        f"5. Pertahankan Nilai Orisinal: Pastikan poin-poin kebaruan materi draf berikut tetap terjaga: {gain_terms}."
    )
    ```

### B. Backend: Penalti Keras CDS Out-of-Domain di `gatekeeper.py`
* Jika `is_out_of_domain == True` (`avg_cosine_sim < 0.05`):
  - Pangkas skor: `cds = min(cds, 20.0)` (skor wajib jatuh ke zona merah $\le 20\%$).
  - Vonis wajib: `"Perlu Revisi - Topik Tidak Relevan"`.
* Di `audit_endpoints.py`: Pastikan flag `is_topic_shift = True` diikutsertakan pada respons jika naskah revisi menyimpang dari sesi induk.

### C. Frontend: Prioritaskan Judul Baris Pertama di `draftSanitizer.ts`
* **Berkas:** `frontend/src/utils/draftSanitizer.ts`.
* **Masalah:** Baris 276–279 membuang entitas judul jika frasa tersebut tidak diulang persis di dalam badan teks (`if (titleText && countInBody === 0 && countInAll === 1) continue;`). Ini membuat judul seperti *"Prinsip Tata Letak Fungsional Kampus"* dibuang dan sistem malah mengambil *"ruang kolaborasi terbuka"* yang memicu video TikTok.
* **Perbaikan:**
  - Hapus aturan pembuangan entitas judul tersebut.
  - Jika baris pertama naskah valid sebagai judul ($\le 100$ karakter dan $\le 15$ kata), **prioritaskan entitas substantif dari judul sebagai Kueri Utama (Primary Tag)**.

### D. Frontend: Out-of-Domain Blocker Card di `AuditBlockView.tsx`
* **Kondisi:** `isTopicShift === true` atau `audit.verdict_status.includes('Topik Tidak Relevan')` atau `audit.metrics.is_out_of_domain === true`.
* **Perilaku Render:**
  - Render Header Turn.
  - Render **`TopicShiftBlockerCard`** terfokus.
  - **Sembunyikan seluruh komponen audit lanjutan di bawahnya:**
    * ❌ Sembunyikan `VerdictSection`.
    * ❌ Sembunyikan `AuditMetricsGrid` (7 Metrik).
    * ❌ Sembunyikan `InformationGainSection` (Celah Informasi).
    * ❌ Sembunyikan `AnnotatedSpansSection` (Stabilo).
    * ❌ Sembunyikan `RemediationPromptSection`.
    * ❌ Sembunyikan `SerpCompetitorsSection`.
* **Tombol Aksi Utama:** `[ 🚀 Mulai Sesi Baru dengan Draf Ini ]` $\rightarrow$ memanggil `onStartNewSessionWithDraft`.

### E. Frontend: Jembatan Pindah Sesi di `App.tsx`
* Implementasikan `handleStartNewSessionWithDraft(text)`:
  - Panggil `handleNewAnalysis()`.
  - Set `draftInput = text`.
  - Ekstrak kueri target dengan `extractSmartKeyword(text)`.
  - Tampilkan toast pemberitahuan: *"Membuka Sesi Baru dengan topik yang sesuai."*

### F. Frontend: 3 Warna Dinamis `SemiCircleGauge` di `shared-ui.tsx` & `VerdictSection.tsx`
* Busur SVG lingkaran diwarnai dinamis:
  - 🔴 **Merah (`#EF4444`)**: jika skor $< 50\%$ atau `isOutOfDomain === true`.
  - 🟡 **Kuning (`#F59E0B`)**: jika skor $50\% - 74\%$.
  - 🟢 **Hijau Emerald (`#10B981`)**: jika skor $\ge 75\%$ dan bukan out-of-domain.

---

## 📦 3. DELEGASI TUGAS SPESIALIS

### Worker 1 (Backend Core Logic)
1. Perbarui `generate_overview_and_remediation` di `gatekeeper.py` dengan Prompt Pra-Publikasi CMS & SEO untuk draf yang lulus.
2. Terapkan penalti CDS Out-of-Domain ($\le 20.0\%$) dan vonis "Perlu Revisi - Topik Tidak Relevan".
3. Pastikan flag `is_topic_shift` aktif di `audit_endpoints.py`.
4. Jalankan ulang uvicorn dengan flag `--reload`.

### Worker 2 (Frontend UI/UX Polish)
1. Perbaiki `draftSanitizer.ts`: Prioritaskan baris judul utama (jangan buang entitas judul).
2. Terapkan 3 warna dinamis pada `SemiCircleGauge` (`shared-ui.tsx` dan `VerdictSection.tsx`).
3. Terapkan `TopicShiftBlockerCard` di `AuditBlockView.tsx` dan sembunyikan semua seksi metrik lanjutan saat naskah melenceng.
4. Hubungkan tombol "Mulai Sesi Baru" di `App.tsx`.

### Worker 3 (QA & Testing Verification)
1. Uji draf yang lolos skor tinggi: verifikasi tombol "Salin Prompt" menghasilkan prompt pra-publikasi CMS lengkap (Meta Title, Meta Description, dsb.).
2. Uji paste naskah tata letak kampus: verifikasi kueri yang terdeteksi adalah istilah kampus (bukan ruang kolaborasi terbuka/TikTok).
3. Uji naskah melenceng: verifikasi kartu penolakan muncul terfokus tanpa tabel 7 metrik, dan busur gauge berwarna Merah.
4. Pastikan `tsc && vite build` dan `pytest backend` 100% lulus.
5. Buka PR ke main dan rilis tag `v1.4.5-SNAPSHOT.1`.
