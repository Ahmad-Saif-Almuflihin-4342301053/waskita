#!/usr/bin/env bash

# ==============================================================================
# WASKITA Fullstack Launcher (Backend + Frontend)
# Menjalankan FastAPI Backend (port 8000) dan Vite Frontend (port 5173) sekaligus
# ==============================================================================

PROJECT_DIR="/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"
cd "$PROJECT_DIR" || exit 1

echo "=========================================================="
echo "          MENJALANKAN WASKITA FULLSTACK ENGINE            "
echo "=========================================================="
echo "Direktori Proyek: $PROJECT_DIR"

# 1. Hentikan proses lama jika port 8000 atau 5173 masih menyangkut
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# 2. Jalankan Backend (FastAPI + Uvicorn) di background
echo "[1/3] Menyalakan Backend FastAPI (http://127.0.0.1:8000)..."
PYTHONPATH=backend ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Tunggu backend siap (maksimal 10 detik)
for i in {1..20}; do
    if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo "      -> Backend AKTIF!"
        break
    fi
    sleep 0.5
done

# 3. Jalankan Frontend (Vite + React) di background
echo "[2/3] Menyalakan Frontend React Vite (http://localhost:5173)..."
cd frontend || exit 1
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

# Tunggu frontend siap
for i in {1..20}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "      -> Frontend AKTIF!"
        break
    fi
    sleep 0.5
done

# 4. Buka otomatis di browser
echo "[3/3] Membuka Waskita di Browser..."
xdg-open "http://localhost:5173" > /dev/null 2>&1 &

echo "=========================================================="
echo " WASKITA BERHASIL DIJALANKAN!"
echo " - Backend API : http://127.0.0.1:8000/docs"
echo " - Frontend Web: http://localhost:5173"
echo "=========================================================="
echo "CATATAN: Jangan tutup jendela terminal ini selama memakai Waskita."
echo "Tekan [CTRL + C] di jendela ini untuk mematikan seluruh server."
echo "=========================================================="

# Tangkap sinyal CTRL+C / exit untuk mematikan backend dan frontend dengan bersih
cleanup() {
    echo ""
    echo "Mematikan server Waskita..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    fuser -k 8000/tcp 2>/dev/null
    fuser -k 5173/tcp 2>/dev/null
    echo "Semua server telah dihentikan. Sampai jumpa!"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Jaga agar proses tetap berjalan
wait
