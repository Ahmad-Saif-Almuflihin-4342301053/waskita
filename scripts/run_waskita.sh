#!/usr/bin/env bash

# ==============================================================================
# WASKITA Fullstack Launcher (Backend + Frontend + Cloudflare Tunnel)
# Menjalankan FastAPI Backend (port 8000), Vite Frontend (port 5173),
# dan Cloudflare Tunnel agar bisa diakses langsung dari HP tanpa 1 Wi-Fi.
# ==============================================================================

export PATH="$HOME/.local/bin:$PATH"

PROJECT_DIR="/home/saifmpleh/Downloads/Telegram Desktop/proyekmagang/waskitariset"
cd "$PROJECT_DIR" || exit 1

LOG_DIR="$PROJECT_DIR/.run-logs"
mkdir -p "$LOG_DIR"

echo "=========================================================="
echo "          MENJALANKAN WASKITA FULLSTACK ENGINE            "
echo "=========================================================="
echo "Direktori Proyek: $PROJECT_DIR"

# 1. Hentikan proses lama jika port 8000, 5173, atau tunnel lama masih menyangkut
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null

# 2. Jalankan Backend (FastAPI + Uvicorn) di background
echo "[1/4] Menyalakan Backend FastAPI (http://127.0.0.1:8000)..."
PYTHONPATH=backend ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload > "$LOG_DIR/backend.log" 2>&1 &
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
echo "[2/4] Menyalakan Frontend React Vite (http://localhost:5173)..."
cd frontend || exit 1
npm run dev -- --host > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_DIR" || exit 1

# Tunggu frontend siap
for i in {1..20}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "      -> Frontend AKTIF!"
        break
    fi
    sleep 0.5
done

# 4. Jalankan Cloudflare Tunnel untuk akses jarak jauh dari HP
echo "[3/4] Menyalakan Cloudflare Tunnel (Akses Luar Jaringan / HP)..."
> "$LOG_DIR/tunnel.log"
cloudflared tunnel --url http://localhost:5173 > "$LOG_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

TUNNEL_URL=""
for i in {1..40}; do
    TUNNEL_URL=$(grep -o 'https://[-a-z0-9]*\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | head -n 1)
    if [ -n "$TUNNEL_URL" ]; then
        echo "      -> Tunnel AKTIF!"
        break
    fi
    sleep 0.5
done

# Simpan link tunnel ke file agar mudah dibaca kapan pun
if [ -n "$TUNNEL_URL" ]; then
    echo "$TUNNEL_URL" > "$LOG_DIR/current_tunnel_url.txt"
    echo -n "$TUNNEL_URL" | xclip -selection clipboard 2>/dev/null
    notify-send "Waskita Cloudflare Tunnel Siap!" "Link HP: $TUNNEL_URL (Tersalin ke clipboard)" 2>/dev/null
fi

# 5. Buka otomatis di browser laptop
echo "[4/4] Membuka Waskita di Browser Laptop..."
xdg-open "http://localhost:5173" > /dev/null 2>&1 &

echo "=========================================================="
echo " ✅ WASKITA FULLSTACK & TUNNEL BERHASIL AKTIF!"
echo "----------------------------------------------------------"
echo " 💻 Akses Laptop (Lokal)  : http://localhost:5173"
echo " 🛠️ Backend API Docs      : http://127.0.0.1:8000/docs"
if [ -n "$TUNNEL_URL" ]; then
echo " 📱 AKSES DARI HP (PUBLIK): $TUNNEL_URL"
echo "    -> Bisa dibuka dari HP di mana saja (tanpa perlu 1 Wi-Fi)!"
echo "    -> Link ini sudah otomatis disalin ke Clipboard laptopmu."
else
echo " 📱 Link Tunnel HP sedang disiapkan di: $LOG_DIR/tunnel.log"
fi
echo "=========================================================="
echo " CATATAN: Jangan tutup jendela terminal ini selama memakai Waskita."
echo " Tekan [CTRL + C] di jendela ini untuk mematikan semua server & tunnel."
echo "=========================================================="

# Tangkap sinyal CTRL+C / exit untuk mematikan seluruh proses dengan bersih
cleanup() {
    echo ""
    echo "Mematikan server Waskita & Cloudflare Tunnel..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $TUNNEL_PID 2>/dev/null
    pkill -f "cloudflared tunnel" 2>/dev/null
    fuser -k 8000/tcp 2>/dev/null
    fuser -k 5173/tcp 2>/dev/null
    echo "Semua server dan tunnel telah dihentikan. Sampai jumpa!"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Jaga agar proses tetap berjalan
wait
