# TECHNICAL BLUEPRINT & UX SPECIFICATION (REVISED V4.1 — DARK MODE CONTRAST, WARM CREAM LOGO, & SEMANTIC TOKENS): WASKITA

> **Dokumen Resmi Handover:** System Analyst / Lead Architect (Chat 1) $\rightarrow$ DevOps & GitHub Dispatcher (Chat 2)  
> **Standar Rekayasa Wajib:** `docs/PZN_VIBE_ENGINEERING_STANDARD.md` (Kurikulum Eko Kurniawan Khannedy / PZN)  
> **Identitas Produk:** **Waskita** (Pre-Publishing Quality Gatekeeper)  
> **Target Katalog:** HANYA **2 File Layar Interaktif Hidup** di `specs/gatekeeper/`:
> 1. `specs/gatekeeper/01-waskita-guest.mockup.tsx` (*Mode Belum Login / Tamu*)
> 2. `specs/gatekeeper/02-waskita-authenticated.mockup.tsx` (*Mode Sudah Login / Member*)

---

## 🌙 1. AUDIT & PERBAIKAN DARK MODE (V4.1)

Berdasarkan inspeksi perbandingan langsung Mode Terang vs Mode Gelap:

1. **Logo Waskita di Mode Gelap Menggunakan Warm Cream (`#F7F4EB`):**
   * `--waskita-logo-fill` pada `data-theme="dark"` diset ke **`#F7F4EB`** (*Warm Cream* khas Waskita), menciptakan inversi editorial yang elegan di atas kanvas gelap `#0B1120`.
   * Di Mode Terang, logo tetap menggunakan Emerald `#10B981`.

2. **Perbaikan Teks Sekunder yang Sebelumnya Hilang/Terkamuflase di Mode Gelap:**
   * **Akar Masalah:** Sebelumnya, sub-judul (`CDS: 70%`, `HASIL ANALISIS #1`, `10:15 WIB`, `(Maks 0.60)`, `(Min 0.55)`, `RIWAYAT ANALISIS`, `Personal Plan`) menggunakan warna statis `rgba(30, 41, 59, 0.55)` s/d `0.65`. Karena `rgb(30, 41, 59)` adalah kode RGB dari `#1E293B`, teks tersebut memiliki kontras **0%** di atas kartu gelap `#1E293B` sehingga tampak hilang/kosong!
   * **Solusi:** Seluruh teks sekunder, *caption*, *track* progress bar, dan garis pembatas kini dipetakan ke variabel semantik:
     - `--waskita-text-body`: `#334155` (Light) $\rightarrow$ `#CBD5E1` (Dark)
     - `--waskita-text-muted`: `rgba(30, 41, 59, 0.68)` (Light) $\rightarrow$ `#94A3B8` (Dark)
     - `--waskita-text-subtle`: `rgba(30, 41, 59, 0.54)` (Light) $\rightarrow$ `#78879E` (Dark)
     - `--waskita-track`: `rgba(30, 41, 59, 0.12)` (Light) $\rightarrow$ `rgba(247, 244, 235, 0.14)` (Dark)
     - `--waskita-border`: `rgba(30, 41, 59, 0.1)` (Light) $\rightarrow$ `rgba(247, 244, 235, 0.1)` (Dark)

3. **Harmonisasi Badge Status ("Perlu Revisi", "Siap Terbit"), Chip Defisit/Gain, & Stabilo Naskah:**
   * **Akar Masalah:** Di Mode Gelap, warna latar pastel solid berbasis putih (`#FEF3C7`, `#FEE2E2`, `#D1FAE5`) dan kotak kode putih `rgba(255,255,255,0.7)` terlihat mencolok seperti tempelan stiker yang tidak menyatu dengan kartu gelap.
   * **Solusi (Translucent Tinted Dark Surfaces):**
     - **Badge "Perlu Revisi" (Amber):**
       - Light: bg `#FEF3C7`, text `#B45309`
       - Dark: bg `rgba(245, 158, 11, 0.16)`, text `#FCD34D`, border `rgba(245, 158, 11, 0.35)`
     - **Chip Defisit (Rose/Coral):**
       - Light: bg `#FEE2E2`, text `#991B1B`
       - Dark: bg `rgba(239, 68, 68, 0.16)`, text `#FCA5A5`, border `rgba(239, 68, 68, 0.35)`
     - **Badge "Siap Terbit" & Chip Gain (Emerald):**
       - Light: bg `#D1FAE5`, text `#065F46`
       - Dark: bg `rgba(16, 185, 129, 0.16)`, text `#6EE7B7`, border `rgba(16, 185, 129, 0.35)`
     - **Stabilo Anotasi 4-Warna (`<mark>`):**
       - Di Mode Gelap menggunakan *translucent glow* (`0.22` opacity) dengan teks pastel cerah (`#FEF08A`, `#FECACA`, `#BFDBFE`, `#BBF7D0`) sehingga menyatu mulus dengan latar kartu audit gelap `#131C2E`.
     - **Kotak Prompt (`prompt-bantuan.txt`):**
       - Light: `rgba(255, 255, 255, 0.72)`
       - Dark: `rgba(11, 17, 32, 0.65)` (*Recessed Dark Terminal*)
