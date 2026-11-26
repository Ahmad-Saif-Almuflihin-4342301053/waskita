#!/bin/bash
# ==============================================================================
# 🛸 WASKITA SATELLITE CREW DISPATCHER (Non-Code Specialized Workers)
# Model: Fast, Efficient, Low-Cost (gemini-3.8-flash-low / Flash Lite)
# ==============================================================================

PROJECT_DIR="/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"
cd "$PROJECT_DIR"

MODEL="gemini-3.8-flash-low"
EFFORT="low"

show_menu() {
  clear
  echo "=================================================================="
  echo "🛸 WASKITA SATELLITE CREW — TIM SPESIALIS RISET & DATA (NON-CODE)"
  echo "=================================================================="
  echo "Pilih tugas worker mandiri yang ingin Anda jalankan:"
  echo ""
  echo " [1] 🎯 Market Scout   : Riset 50 Topik & Kata Kunci Klinik (Bidan Afita)"
  echo " [2] 🥊 Bug Hunter     : Uji Tembak Kueri Ekstrem & Adversarial Stress-Test"
  echo " [3] 📝 Paper Scribe   : Sinkronkan Draf Riset Ilmiah (IEEE / Scopus Paper)"
  echo " [4] 📈 Rank Tracker   : Cek & Catat Posisi Ranking Artikel di Google"
  echo " [5] 💰 System Guard   : Cek Database SQLite & Status Kuota API (0 Token!)"
  echo " [0] 🚪 Keluar"
  echo "=================================================================="
  echo -n "Masukkan nomor pilihan [0-5]: "
}

CHOICE=$1

if [ -z "$CHOICE" ]; then
  show_menu
  read CHOICE
fi

case "$CHOICE" in
  1|scout)
    echo ""
    echo "🚀 [Worker 1: Market Scout] Memulai riset pasar dan topik kesehatan..."
    echo "Target: Mengumpulkan kata kunci YMYL kebidanan & outline konten klinik."
    agy --model "$MODEL" --effort "$EFFORT" --dangerously-skip-permissions -p "Kamu adalah Worker Market Scout (Non-Code). Tugasmu adalah meriset 25 topik kesehatan ibu hamil, nifas, bayi, dan kebidanan paling dicari di Google Indonesia untuk klinik Bidan Afita. Analisis tren pencarian, buatkan rekomendasi target query yang berpotensi tinggi ranking di halaman 1, dan rancang draf outline edukasi kesehatan. Tulis hasilnya secara rapi dan profesional ke file: docs/satellite_reports/bidan_afita_market_scout.md. JANGAN MENGUBAH FILE KODE APAPUN."
    echo "✅ [Market Scout] Selesai! Laporan tersimpan di: docs/satellite_reports/bidan_afita_market_scout.md"
    ;;

  2|attack|hunter)
    echo ""
    echo "🥊 [Worker 2: Bug Hunter] Menjalankan uji ketahanan adversarial..."
    echo "Target: Menguji kueri ekstrem, koma, karakter aneh, dan mendeteksi potensi false-positive."
    agy --model "$MODEL" --effort "$EFFORT" --dangerously-skip-permissions -p "Kamu adalah Worker Bug Hunter (Non-Code). Tugasmu adalah mengevaluasi ketahanan sistem WASKITA terhadap serangan kueri liar (adversarial queries). Uji berbagai skenario: kueri dengan koma beruntun, kata-kata slang bahasa gaul, naskah dengan simbol aneh, dan evaluasi apakah ada celah false-positive pada skor CDS. Tulis laporan audit temuanmu beserta rekomendasi pencegahan ke file: docs/satellite_reports/adversarial_stress_test.md. JANGAN MENGUBAH FILE KODE APAPUN."
    echo "✅ [Bug Hunter] Selesai! Laporan tersimpan di: docs/satellite_reports/adversarial_stress_test.md"
    ;;

  3|paper|scribe)
    echo ""
    echo "📝 [Worker 3: Paper Scribe] Memperbarui naskah ilmiah bahasa Inggris..."
    echo "Target: Sinkronisasi docs/PAPER_WASKITA_ENGLISH.md dengan metrik akurasi terbaru."
    agy --model "$MODEL" --effort "$EFFORT" --dangerously-skip-permissions -p "Kamu adalah Worker Paper Scribe (Non-Code). Baca hasil evaluasi akurasi di backend/tests/fixtures/accuracy_evaluation_report.json dan periksa dokumen docs/PAPER_WASKITA_ENGLISH.md. Perbarui bab hasil eksperimen (Results & Discussion), lengkapi metrik Content Differentiation Score (CDS), VSM, MATTR, dan HKO dengan data riil terbaru agar siap untuk publikasi jurnal IEEE/Scopus. JANGAN MENGUBAH FILE KODE APLIKASI."
    echo "✅ [Paper Scribe] Selesai! Paper riset diperbarui di: docs/PAPER_WASKITA_ENGLISH.md"
    ;;

  4|rank)
    echo ""
    echo "📈 [Worker 4: Rank Tracker] Menganalisis visibilitas ranking SERP..."
    echo "Target: Memetakan potensi posisi naskah terbitan klinik di SERP Google."
    agy --model "$MODEL" --effort "$EFFORT" --dangerously-skip-permissions -p "Kamu adalah Worker Rank Tracker (Non-Code). Tugasmu adalah membuat framework pelacakan ranking Google SERP untuk artikel yang diaudit oleh WASKITA. Buat panduan dan tabel monitoring peringkat mingguan untuk artikel klinik Bidan Afita, metrik CTR Google Search Console yang harus dipantau, dan evaluasi dampak skor CDS terhadap ranking nyata. Tulis laporannya di: docs/satellite_reports/seo_rank_tracking_guide.md. JANGAN MENGUBAH FILE KODE APAPUN."
    echo "✅ [Rank Tracker] Selesai! Laporan tersimpan di: docs/satellite_reports/seo_rank_tracking_guide.md"
    ;;

  5|quota|guard)
    echo ""
    echo "💰 [Worker 5: System Guard] Menjalankan audit kesehatan sistem (0 Token AI)..."
    ./.venv/bin/python scripts/satellite/check_quota.py
    ;;

  0|exit|q)
    echo "Sampai jumpa! Semangat terus mengembangkan WASKITA! 🚀"
    exit 0
    ;;

  *)
    echo "Pilihan tidak valid. Silakan jalankan './crew.sh' kembali."
    exit 1
    ;;
esac
