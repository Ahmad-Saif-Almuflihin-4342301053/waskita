# SPRINT 3.7 TECHNICAL SPECIFICATION
## Per-Session Composer Draft Isolation & State Preservation

**Dokumen Versi:** 1.0.0  
**Tanggal:** 28 Oktober 2026  
**Peran:** System Analyst & Lead Architect (Chat 1)  
**Target Eksekusi:** DevOps & GitHub Dispatcher (Chat 2)  
**Status:** READY FOR DISPATCH

---

### 1. Masalah & Evaluasi UX
Pengguna melaporkan dua anomali UX yang mengganggu pada alur *multi-session*:
1. **State Leakage (Kebocoran Teks Antar-Sesi):**
   Saat naskah disuntikkan ke "Analisis Baru" (misalnya draf Kopi Tubruk dari tombol *Lanjutkan di Sesi Baru*), teks tersebut muncul di composer. Namun ketika pengguna mengeklik sesi lama di sidebar (misalnya sesi "Draf: ruang kolaborasi terbuka"), teks Kopi Tubruk tersebut **ikut terbawa** ke kolom input sesi lama.
2. **State Loss on Return (Draf Hilang Saat Kembali):**
   Ketika pengguna kembali mengeklik "Analisis Baru", fungsi `handleNewAnalysis()` memanggil `setDraftInput('')`, sehingga ketikan/draf naskah yang belum sempat diaudit **hilang tanpa jejak**.

### 2. Standar Industri AI (Gemini, Antigravity, Claude, ChatGPT)
Aplikasi AI modern **TIDAK MENGGUNAKAN POPUP ALERT** konfirmasi (*"teks Anda tidak akan disimpan"*), karena popup alert mengganggu alur kerja (*flow breaker*) dan terkesan kaku.

Standar baku yang diterapkan pada Gemini, ChatGPT, dan Antigravity adalah:
> **Setiap sesi percakapan/analisis memiliki penyangga draf mandiri (*Per-Session Draft Buffer / Isolated Scratchpad*).**
> - Ketikan pada Sesi A tersimpan di *buffer* Sesi A.
> - Saat beralih ke Sesi B, kolom composer menampilkan *buffer* Sesi B (atau kosong jika belum ada ketikan).
> - Saat kembali ke Sesi A, ketikan sebelumnya kembali muncul utuh.
> - Buffer hanya dibersihkan setelah naskah **berhasil diaudit/dikirimkan**.

---

### 3. Cetak Biru Arsitektur Teknis (`App.tsx`)

#### A. State Isolation Map
Tambahkan state pemetaan buffer naskah per sesi:
```tsx
// Penyimpan draf aktif per session_id (mencegah kebocoran & kehilangan teks antar-sesi)
const [sessionDrafts, setSessionDrafts] = useState<Record<string, string>>({});
```

#### B. Handler Perubahan Input (`onDraftTextChange`)
Ganti mutasi langsung `setDraftInput` dengan sinkronisasi ke map sesi aktif:
```tsx
const handleDraftInputChange = (text: string) => {
  setDraftInput(text);
  setSessionDrafts((prev) => ({
    ...prev,
    [activeSessionId]: text,
  }));
};
```

#### C. Navigasi Antar Sesi (`handleSelectSession`)
Sebelum berganti `activeSessionId`, kunci buffer draf sesi saat ini, lalu muat draf milik sesi tujuan:
```tsx
const handleSelectSession = async (sessionId: string) => {
  // 1. Kunci draf yang sedang diketik pada sesi lama ke dalam buffer map
  setSessionDrafts((prev) => ({
    ...prev,
    [activeSessionId]: draftInput,
  }));

  // 2. Ambil draf yang tersimpan pada sesi tujuan (atau kosong jika belum pernah ada ketikan)
  const targetDraft = sessionDrafts[sessionId] || '';
  setDraftInput(targetDraft);

  // 3. Pindah sesi
  setIsTransitioningToDock(false);
  setActiveSessionId(sessionId);
  ...
```

#### D. Beralih ke Analisis Baru (`handleNewAnalysis`)
Simpan draf sesi yang sedang dibuka, lalu aktifkan kembali naskah yang tersimpan di buffer `session-new`:
```tsx
const handleNewAnalysis = () => {
  // 1. Simpan draf sesi aktif saat ini
  setSessionDrafts((prev) => ({
    ...prev,
    [activeSessionId]: draftInput,
  }));

  // 2. Berpindah ke sesi baru dan pulihkan draf yang belum terkirim di sesi baru
  setActiveSessionId('session-new');
  setCurrentTurns([]);
  setTargetQuery('');
  setDraftInput(sessionDrafts['session-new'] || '');
  setIsTransitioningToDock(false);
};
```

#### E. Mulai Sesi Baru dengan Draf Hasil Blocker (`handleStartNewSessionWithDraft`)
Simpan langsung ke buffer `session-new`:
```tsx
const handleStartNewSessionWithDraft = (text: string) => {
  // 1. Simpan naskah ke buffer 'session-new'
  setSessionDrafts((prev) => ({
    ...prev,
    'session-new': text,
  }));
  setActiveSessionId('session-new');
  setCurrentTurns([]);
  setDraftInput(text);
  setIsTransitioningToDock(false);

  // 2. Ekstrak kueri semantik baru
  const smartKey = extractSmartKeyword(text);
  if (smartKey) {
    setTargetQuery(smartKey);
  }
  showToast({
    type: 'info',
    title: 'Membuka Sesi Baru',
    message: 'Naskah dipindahkan ke sesi baru dengan acuan topik yang tepat.',
  });
};
```

#### F. Pembersihan Buffer Pasca Audit Berhasil (`handleExecuteAudit`)
Setelah audit selesai dan masuk ke `currentTurns`:
```tsx
// Bersihkan hanya buffer untuk sesi yang baru saja berhasil dieksekusi
setSessionDrafts((prev) => ({
  ...prev,
  [activeSessionId]: '',
}));
setDraftInput('');
```

---

### 4. Tugas Worker Chat 2 (DevOps)
1. **Worker 1 (Frontend):** Terapkan logika `sessionDrafts` di `frontend/src/App.tsx`.
2. **Worker 3 (QA):**
   - Tes ketik naskah di "Analisis Baru", klik sesi lain di riwayat sidebar: pastikan composer di sesi lain kosong/bersih (tidak bocor).
   - Klik kembali ke "Analisis Baru": pastikan teks naskah tetap ada utuh.
   - Tes "Lanjutkan di Sesi Baru" dari Blocker Card: pastikan teks termuat di Analisis Baru, tidak bocor saat buka sesi lain, dan tetap aman saat kembali.
