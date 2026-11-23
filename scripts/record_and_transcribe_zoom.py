#!/usr/bin/env python3
"""
Zoom Audio Recorder & Offline Transcriber for Linux (PipeWire / PulseAudio)
Uses:
- ffmpeg (Loopback monitor + Mic mixer -> 16kHz mono WAV)
- faster-whisper (Int8 offline CPU speech-to-text in Indonesian)
Outputs directly to Obsidian Vault Markdown.
"""

import os
import sys
import time
import signal
import subprocess
import wave
import numpy as np
from datetime import datetime
from pathlib import Path

PID_FILE = Path("/tmp/waskita_zoom_recorder.pid")
AUDIO_FILE = Path("/tmp/waskita_zoom_audio.wav")
OBSIDIAN_VAULT = Path("/home/saifmpleh/ObsidianVault/Properti_Freelance")
OBSIDIAN_ASSETS = OBSIDIAN_VAULT / "assets"


def get_default_audio_devices():
    """Dapatkan device monitor (speaker/headphone Zoom) dan mikrofon aktif."""
    try:
        sink = subprocess.check_output(["pactl", "get-default-sink"], text=True).strip()
        source = subprocess.check_output(["pactl", "get-default-source"], text=True).strip()
        monitor = f"{sink}.monitor"
        return monitor, source
    except Exception as e:
        print(f"Warning: gagal mendeteksi pactl ({e}), menggunakan default pulse.")
        return "default", "default"


def start_recording():
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, 0)
            print(f"⚠️ Perekaman Zoom SUDAH BERJALAN dengan PID {pid}!")
            return
        except OSError:
            PID_FILE.unlink(missing_ok=True)

    monitor, mic = get_default_audio_devices()
    print("🎙️ Memulai Perekaman Zoom:")
    print(f"   - Suara Zoom/Speaker: {monitor}")
    print(f"   - Suara Mikrofon    : {mic}")

    AUDIO_FILE.unlink(missing_ok=True)

    cmd = [
        "ffmpeg", "-y",
        "-f", "pulse", "-i", monitor,
        "-f", "pulse", "-i", mic,
        "-filter_complex", "amix=inputs=2:duration=longest:weights=1.0 1.0",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        str(AUDIO_FILE)
    ]

    log_file = open("/tmp/waskita_zoom_ffmpeg.log", "w")
    proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)
    PID_FILE.write_text(str(proc.pid))
    print(f"✅ Perekaman aktif di latar belakang (PID: {proc.pid})")
    print(f"   Target berkas: {AUDIO_FILE}")
    print("   Untuk berhenti & transkrip otomatis: jalankan 'stop'")


def status_recording():
    if not PID_FILE.exists():
        print("❌ Tidak ada sesi perekaman Zoom yang sedang aktif.")
        return False
    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, 0)
        size_mb = AUDIO_FILE.stat().st_size / (1024 * 1024) if AUDIO_FILE.exists() else 0
        print(f"🔴 Perekaman SEDANG BERLANGSUNG (PID: {pid})")
        print(f"   Ukuran audio saat ini: {size_mb:.2f} MB")
        return True
    except OSError:
        print("⚠️ Berkas PID ditemukan tetapi proses ffmpeg sudah tidak ada.")
        PID_FILE.unlink(missing_ok=True)
        return False


def stop_and_transcribe():
    if not PID_FILE.exists():
        print("❌ Tidak ada sesi perekaman aktif.")
        if not AUDIO_FILE.exists():
            return
    else:
        try:
            pid = int(PID_FILE.read_text().strip())
            print(f"⏹️ Menghentikan perekaman (PID: {pid})...")
            os.kill(pid, signal.SIGINT)
            for _ in range(30):
                time.sleep(0.5)
                try:
                    os.kill(pid, 0)
                except OSError:
                    break
        except Exception as e:
            print(f"Catatan penghentian proses: {e}")
        finally:
            PID_FILE.unlink(missing_ok=True)

    if not AUDIO_FILE.exists() or AUDIO_FILE.stat().st_size < 1000:
        print("❌ Berkas rekaman audio tidak ditemukan atau terlalu pendek.")
        return

    duration_sec = 0
    try:
        with wave.open(str(AUDIO_FILE), "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration_sec = frames / float(rate)
            raw_data = wf.readframes(frames)
            audio_data = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
    except Exception as e:
        print(f"❌ Gagal membaca audio WAV: {e}")
        return

    minutes = int(duration_sec // 60)
    seconds = int(duration_sec % 60)
    print(f"🎧 Durasi audio rekaman: {minutes:02d}:{seconds:02d} ({duration_sec:.1f} detik)")

    # Simpan salinan ke Obsidian assets
    today_str = datetime.now().strftime("%Y-%m-%d")
    time_str = datetime.now().strftime("%H%M")
    OBSIDIAN_ASSETS.mkdir(parents=True, exist_ok=True)
    saved_wav_name = f"rekaman_bimbingan_{today_str}_{time_str}.wav"
    saved_wav_path = OBSIDIAN_ASSETS / saved_wav_name
    subprocess.run(["cp", str(AUDIO_FILE), str(saved_wav_path)], check=True)
    print(f"💾 Salinan rekaman disimpan ke: {saved_wav_path}")

    # Transkripsi Offline dengan faster-whisper
    print("🤖 Memuat model faster-whisper (small, int8 CPU)...")
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")

    print("✍️ Memulai proses transkripsi teks bahasa Indonesia...")
    t0 = time.time()
    segments, info = model.transcribe(audio_data, language="id", beam_size=2)

    transcript_lines = []
    plain_text_lines = []
    for s in segments:
        m_start = int(s.start // 60)
        s_start = int(s.start % 60)
        m_end = int(s.end // 60)
        s_end = int(s.end % 60)
        time_tag = f"[{m_start:02d}:{s_start:02d} -> {m_end:02d}:{s_end:02d}]"
        text_clean = s.text.strip()
        transcript_lines.append(f"- **{time_tag}**: {text_clean}")
        plain_text_lines.append(text_clean)
        print(f"  {time_tag} {text_clean}")

    elapsed_trans = time.time() - t0
    print(f"✅ Transkripsi selesai dalam {elapsed_trans:.1f} detik!")

    # Format Markdown untuk Obsidian
    md_filename = f"Transkrip_Bimbingan_Pak_Ari_{today_str}.md"
    md_path = OBSIDIAN_VAULT / md_filename

    md_content = f"""# 🎙️ Transkrip Sesi Bimbingan Tugas Akhir — Pak Ari Wibowo

> **Tanggal:** {datetime.now().strftime("%A, %d %B %Y (%H:%M WIB)")}  
> **Dosen Pembimbing:** Pak Ari Wibowo  
> **Mahasiswa:** Ahmad Saif Almuflihin (NIM: 4342301053)  
> **Topik Pembahasan:** Validasi Alur WASKITA v2, Evaluasi Bab 4 (System-Centric 60 Naskah), & Sistematika Laporan Bab 4 vs Bab 5  
> **Aset Rekaman Suara:** [[assets/{saved_wav_name}]]  
> **Durasi Rekaman:** {minutes:02d}:{seconds:02d}  
> **Mesin Transkrip:** faster-whisper (model: *small-int8* offline)

---

## 💡 Rangkuman Eksekutif & Poin Arahan Pak Ari
*(Akan disintesis dan dilengkapi bersama asisten AI setelah sesi bimbingan)*

---

## 📝 Transkrip Lengkap Percakapan (Verbatim Berbasis Waktu)

{chr(10).join(transcript_lines) if transcript_lines else "_Tidak ada suara percakapan terdeteksi._"}

---
*Dihasilkan otomatis oleh modul Audio Pipeline WASKITA & faster-whisper.*
"""

    md_path.write_text(md_content, encoding="utf-8")
    print(f"🎉 Dokumen transkrip berhasil disimpan di Obsidian:")
    print(f"   [[{md_filename}]] -> {md_path}")


if __name__ == "__main__":
    action = sys.argv[1].lower() if len(sys.argv) > 1 else "help"
    if action == "start":
        start_recording()
    elif action == "stop":
        stop_and_transcribe()
    elif action == "status":
        status_recording()
    else:
        print("Penggunaan:")
        print("  python3 record_and_transcribe_zoom.py start   -> Mulai rekam Zoom & Mic")
        print("  python3 record_and_transcribe_zoom.py status  -> Cek status perekaman")
        print("  python3 record_and_transcribe_zoom.py stop    -> Berhenti & langsung transkrip ke Obsidian")
