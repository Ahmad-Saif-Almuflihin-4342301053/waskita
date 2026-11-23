#!/usr/bin/env bash
# Wrapper cepat kontrol perekam & transkrip Zoom
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/scripts/record_and_transcribe_zoom.py"

case "$1" in
  start)
    python3 "$PYTHON_SCRIPT" start
    ;;
  stop)
    python3 "$PYTHON_SCRIPT" stop
    ;;
  status)
    python3 "$PYTHON_SCRIPT" status
    ;;
  *)
    echo "Cara pakai:"
    echo "  ./rekam_zoom.sh start   # Mulai merekam suara Zoom (Pak Ari) + Mikrofon (Saif)"
    echo "  ./rekam_zoom.sh status  # Cek status & ukuran rekaman"
    echo "  ./rekam_zoom.sh stop    # Berhenti & otomatis transkrip ke Obsidian!"
    ;;
esac
