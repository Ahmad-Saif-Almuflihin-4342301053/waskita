#!/usr/bin/env bash
# Menyalakan WASKITA sekaligus: backend (8000), frontend (5173), dan tunnel publik (opsional).
# Pemakaian:
#   ./start.sh           -> backend + frontend (lokal saja)
#   ./start.sh tunnel    -> backend + frontend + Cloudflare tunnel
# Tekan Ctrl+C untuk mematikan semuanya.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/.run-logs"
mkdir -p "$LOG_DIR"
PIDS=()

cleanup() {
  echo
  echo "Mematikan semua proses WASKITA..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  wait 2>/dev/null
  exit 0
}
trap cleanup INT TERM EXIT

# Backend harus dijalankan dari dalam folder backend/ (.env dan SQLite bersifat relatif)
echo "[1/3] Menyalakan backend di port 8000..."
(cd "$ROOT/backend" && exec ../.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) \
  > "$LOG_DIR/backend.log" 2>&1 &
PIDS+=($!)

echo "[2/3] Menyalakan frontend di port 5173..."
(cd "$ROOT/frontend" && exec npm run dev -- --host 0.0.0.0 --port 5173) \
  > "$LOG_DIR/frontend.log" 2>&1 &
PIDS+=($!)

if [ "$1" = "tunnel" ]; then
  echo "[3/3] Menyalakan Cloudflare tunnel..."
  cloudflared tunnel --url http://localhost:5173 > "$LOG_DIR/tunnel.log" 2>&1 &
  PIDS+=($!)
  for _ in $(seq 1 30); do
    URL=$(grep -o 'https://[-a-z0-9]*\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | head -n 1)
    [ -n "$URL" ] && break
    sleep 1
  done
  echo "URL publik: ${URL:-belum muncul, cek .run-logs/tunnel.log}"
  echo "PERINGATAN: siapa pun yang punya URL ini bisa memakai kuota Serper (mode Tamu)."
else
  echo "[3/3] Tunnel dilewati (pakai './start.sh tunnel' untuk menyalakan)."
fi

echo
echo "Lokal : http://localhost:5173"
echo "Log   : $LOG_DIR"
echo "Tekan Ctrl+C untuk berhenti."
wait
