#!/bin/bash
BASE_DIR="/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang"
CODER_MODEL="gemini-3.8-flash-low"
QA_MODEL="gemini-3.8-flash-high"

echo "=== DISPATCHING WORKERS ==="

(
  cd "$BASE_DIR/waskita-worker-1"
  git checkout feat/issue-2-core-backend-ir-engine
  nohup agy --model "$CODER_MODEL" --effort low --dangerously-skip-permissions -p "Kamu adalah Worker 1 (Core Backend Engineer) untuk proyek WASKITA.
Baca GitHub Issue #2 dan dokumentasi resmi docs/TECHNICAL_BLUEPRINT_WASKITA.md (Bab 1, 2, 3, 4, 5, dan Bab 6 Porsi Worker 1).
Fokus pada: backend/app/ (core/config.py, core/database.py SQLite WAL, models/entities.py 6 tabel Tabel 3.5 TA, schemas/audit.py, services/serp_scraper.py, services/nlp_pipeline.py dgn @lru_cache, services/vsm_calculator.py, services/information_gain.py, services/stylometrics.py, services/gatekeeper.py, services/export_service.py, dan api/v1 routers).
Patuhi aturan 3 operasi CPU berat dengan asyncio.to_thread / run_in_threadpool.
Lakukan commit terstruktur 'feat: implement core backend, sqlite wal, nlp sastrawi, vsm ir engine & routers (#2)' di branch feat/issue-2-core-backend-ir-engine, dan buka Pull Request ke main jika selesai." > "$BASE_DIR/dispatch_worker1.log" 2>&1 &
)

(
  cd "$BASE_DIR/waskita-worker-2"
  git checkout feat/issue-3-frontend-react-mokly
  nohup agy --model "$CODER_MODEL" --effort low --dangerously-skip-permissions -p "Kamu adalah Worker 2 (Frontend UI/UX Polish Engineer) untuk proyek WASKITA.
Baca GitHub Issue #3 dan dokumentasi resmi docs/TECHNICAL_BLUEPRINT_WASKITA.md (Bab 6 Porsi Worker 2).
JANGAN MEMBUAT DESAIN DARI NOL. Komponen hidup sudah lengkap di docs/specs/gatekeeper/.
Tugasmu: Setup frontend React 18 + Vite + Tailwind, copy & refactor komponen dari docs/specs/gatekeeper/ ke frontend/src/components/, sesuaikan 4 warna stabilo sesuai Tabel 3.6 Proposal TA (Kuning, Merah, Biru, Hijau), buat waskitaClient.ts terhubung ke API backend, sediakan Live Stepper 5 tahap saat submit, 4 range sliders & file uploader, dual-theme, dan multi-turn audit stream.
Lakukan commit 'feat: implement frontend react vite, gatekeeper components & multi-turn audit (#3)' di branch feat/issue-3-frontend-react-mokly, dan buka Pull Request ke main jika selesai." > "$BASE_DIR/dispatch_worker2.log" 2>&1 &
)

(
  cd "$BASE_DIR/waskita-worker-3"
  git checkout feat/issue-4-qa-reliability-confusion-matrix
  nohup agy --model "$QA_MODEL" --effort high --dangerously-skip-permissions -p "Kamu adalah Worker 3 (QA & Reliability Engineer) untuk proyek WASKITA.
Baca GitHub Issue #4 dan dokumentasi resmi docs/TECHNICAL_BLUEPRINT_WASKITA.md (Bab 6 Porsi Worker 3).
Tugasmu:
1. Buat dataset fixture deterministik statis 30 draf artikel riil (15 Layak Terbit, 15 Perlu Revisi) di backend/tests/fixtures/dataset_30_drafts.json. DILARANG random generator.
2. Buat unit tests backend/tests/test_ir_engine.py (matematis VSM, MATTR, TTR, HKO, Information Gain).
3. Buat tests resilience backend/tests/test_api_resilience.py (FR-02 < 300 kata, FR-13 graceful degradation, Anti-XSS sanitization).
4. Buat script evaluasi akurasi backend/tests/evaluate_accuracy.py menghitung Confusion Matrix, Precision, Recall, F1-Score.
5. Buat backend/tests/locustfile.py untuk load testing virtual user.
Lakukan commit 'test: implement deterministic 30-drafts dataset, confusion matrix evaluation & qa test suites (#4)' di branch feat/issue-4-qa-reliability-confusion-matrix, dan buka Pull Request ke main jika selesai." > "$BASE_DIR/dispatch_worker3.log" 2>&1 &
)

echo "=== DISPATCHED SUCCESSFULLY ==="
