"""
Unit Test Sanitasi Media Cerdas ([gambar N], [video N]) & Perhitungan Kata Murni
Sesuai Dokumen Spesifikasi Teknis WASKITA Sprint 2 (Bab 1.2 & Bab 3.3, GitHub Issue #10).
"""

import os
import re
import subprocess
import pytest


def sanitize_media_tokens_py(raw_text: str) -> dict:
    """
    Spesifikasi sanitasi media cerdas (Standar Eko Kurniawan Khannedy / PZN):
    - Video embeds (<iframe ...>, <video ...>, embed): [video 1], [video 2], dst.
    - Gambar (HTML <img>, Markdown ![alt](url), [caption]): [gambar 1], [gambar 2], dst.
    """
    image_counter = 0
    video_counter = 0
    clean = raw_text

    # 1. Video embeds (<iframe ...></iframe>, <video>...</video>, <embed ...>)
    def replace_video(m):
        nonlocal video_counter
        video_counter += 1
        return f"\n[video {video_counter}]\n"

    clean = re.sub(r"<iframe[\s\S]*?</iframe>", replace_video, clean, flags=re.IGNORECASE)
    clean = re.sub(r"<video[\s\S]*?</video>", replace_video, clean, flags=re.IGNORECASE)
    clean = re.sub(r"<embed[\s\S]*?>", replace_video, clean, flags=re.IGNORECASE)

    # 2. Gambar HTML <img> tags
    def replace_image(m):
        nonlocal image_counter
        image_counter += 1
        return f"\n[gambar {image_counter}]\n"

    clean = re.sub(r"<img[\s\S]*?>", replace_image, clean, flags=re.IGNORECASE)

    # 3. WordPress [caption]...[/caption]
    clean = re.sub(r"\[caption[\s\S]*?\[/caption\]", replace_image, clean, flags=re.IGNORECASE)

    # 4. Markdown images: ![alt](url)
    clean = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", replace_image, clean)

    # 5. Data URI images: data:image/...;base64,...
    clean = re.sub(r"data:image/[a-zA-Z0-9.+_-]+;base64,[a-zA-Z0-9+/=]+", replace_image, clean, flags=re.IGNORECASE)

    # Strip remaining HTML tags
    clean = re.sub(r"</?[^>]+(>|$)", " ", clean)

    # Normalisasi spasi dan baris baru
    clean = re.sub(r"\r\n|\r", "\n", clean)
    clean = re.sub(r"[ \t]+", " ", clean)
    clean = re.sub(r"\n{3,}", "\n\n", clean).strip()

    return {
        "clean_text": clean,
        "image_count": image_counter,
        "video_count": video_counter,
    }


def count_pure_words_py(text: str) -> int:
    """
    Menghitung jumlah kata murni naskah dengan mengabaikan token [gambar N] dan [video N].
    Sesuai FR-02 Proposal TA: media tidak boleh mendistorsi word count atau TF-IDF.
    """
    if not text or not text.strip():
        return 0

    stripped = re.sub(r"\[gambar\s*\d+\]", " ", text, flags=re.IGNORECASE)
    stripped = re.sub(r"\[video\s*\d+\]", " ", stripped, flags=re.IGNORECASE)
    stripped = re.sub(r"[^\w\s-]", " ", stripped)
    words = [w for w in stripped.split() if w and not re.match(r"^[\d_-]+$", w)]
    return len(words)


class TestMediaSanitizerAndWordCount:
    """
    Test Suite Sanitasi Media & Word Count (Issue #10):
    1. Pembersihan <img src='...'>, ![alt](url), <iframe src='...'> -> [gambar 1], [gambar 2], [video 1].
    2. countPureWords mengabaikan token [gambar N] dan [video N].
    3. Integrasi eksekusi unit test frontend TypeScript runner.
    """

    def test_sanitize_img_markdown_and_iframe_to_tokens(self):
        raw_draft = (
            "Berikut panduan meracik kopi tubruk nusantara.\n"
            "<img src='https://example.com/biji.jpg' alt='Biji Kopi'>\n"
            "Giling biji kopi dengan tingkat medium.\n"
            "![Penggilingan Kopi](https://example.com/grind.png)\n"
            "Tuang air panas 90 derajat secara melingkar.\n"
            "<iframe src='https://www.youtube.com/embed/dQw4w9WgXcQ' width='560' height='315'></iframe>\n"
            "Diamkan empat menit hingga ampas kopi mengendap."
        )

        res = sanitize_media_tokens_py(raw_draft)

        assert res["image_count"] == 2
        assert res["video_count"] == 1
        assert "[gambar 1]" in res["clean_text"]
        assert "[gambar 2]" in res["clean_text"]
        assert "[video 1]" in res["clean_text"]
        assert "<img" not in res["clean_text"]
        assert "![Penggilingan Kopi]" not in res["clean_text"]
        assert "<iframe" not in res["clean_text"]

    def test_count_pure_words_ignores_media_tokens(self):
        base_text = "Kopi tubruk tradisional diseduh air mendidih tanpa filter"
        expected_pure_words = len(base_text.split())

        # Sisipkan token gambar dan video
        text_with_tokens = (
            f"Kopi tubruk [gambar 1] tradisional [gambar 2] diseduh air "
            f"[video 1] mendidih tanpa [video 2] filter [gambar 3]"
        )

        counted = count_pure_words_py(text_with_tokens)
        assert counted == expected_pure_words

    def test_count_pure_words_empty_or_only_media(self):
        assert count_pure_words_py("") == 0
        assert count_pure_words_py("   ") == 0
        assert count_pure_words_py("[gambar 1] [gambar 2] [video 1]") == 0

    def test_count_pure_words_boundary_300_with_media(self):
        # 300 kata artikel valid + 4 token media
        words = [f"kosakata_{i}" for i in range(300)]
        text = " ".join(words[:100]) + " [gambar 1] " + " ".join(words[100:200]) + " [video 1] " + " ".join(words[200:])
        assert count_pure_words_py(text) == 300

    def test_frontend_typescript_sanitizer_suite(self):
        """Verifikasi bahwa suite unit test frontend TypeScript lolos 100% via node runner."""
        test_file = os.path.join(
            os.path.dirname(__file__),
            "../../frontend/src/utils/__tests__/draftSanitizer.test.ts",
        )
        assert os.path.exists(test_file), f"Berkas {test_file} tidak ditemukan."

        cmd = ["node", "--experimental-strip-types", test_file]
        frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))
        run_res = subprocess.run(cmd, capture_output=True, text=True, cwd=frontend_dir)
        assert run_res.returncode == 0, f"Frontend sanitizer test failed:\nSTDOUT:\n{run_res.stdout}\nSTDERR:\n{run_res.stderr}"
        assert "0 gagal" in run_res.stdout and "lulus" in run_res.stdout
