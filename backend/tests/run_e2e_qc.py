"""
WASKITA Automated E2E Quality Control & Verification Script
Menjalankan pengujian otomatis end-to-end langsung ke backend yang sedang aktif (http://127.0.0.1:8000)
tanpa perlu mengetik atau mengklik manual di browser!
"""
import json
import sys
import httpx

BACKEND_URL = "http://127.0.0.1:8000"
DATASET_PATH = "backend/tests/fixtures/dataset_30_drafts.json"

def run_automated_qc():
    print("=" * 80)
    print("  WASKITA AUTOMATED QUALITY CONTROL (QC) RUNNER - D4 TRPL POLIBATAM")
    print("=" * 80)
    
    # 1. Cek Kesiapan Backend
    try:
        health_resp = httpx.get(f"{BACKEND_URL}/health", timeout=5.0)
        if health_resp.status_code != 200:
            print(f"[ERROR] Backend tidak sehat: Status {health_resp.status_code}")
            return False
        print(f"[OK] Backend aktif: {health_resp.json().get('service')} (Env: {health_resp.json().get('environment')})")
    except Exception as e:
        print(f"[ERROR] Gagal terhubung ke backend di {BACKEND_URL}. Pastikan uvicorn menyala!")
        print(f"Detail: {e}")
        return False

    # 2. Muat Dataset Ground Truth
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        drafts = json.load(f)
        
    print(f"[OK] Memuat {len(drafts)} draf benchmark dari {DATASET_PATH}")
    print("-" * 80)

    # Uji 2 Skenario Kontras: Draf #1 (Layak Terbit) vs Draf #2 (Perlu Revisi)
    sample_tests = [
        ("Draf #1 [ORISINAL - SIAP TERBIT]", drafts[0]),
        ("Draf #2 [GENERIK/DEFISIT - PERLU REVISI]", drafts[1])
    ]

    client = httpx.Client(base_url=BACKEND_URL, timeout=60.0)
    all_passed = True

    for label, d in sample_tests:
        print(f"\n>>> [PENGUJIAN ROBOT OTOMATIS] {label}")
        print(f"    Judul Naskah : \"{d['draft_title']}\"")
        print(f"    Target Kueri : \"{d['target_query']}\"")
        print(f"    Ground Truth : {d['ground_truth_label']}")
        
        payload = {
            "target_query": d["target_query"],
            "draft_title": d["draft_title"],
            "draft_content": d["draft_content"],
            "use_cached_serp": True
        }
        
        resp = client.post("/api/v1/audit/execute", json=payload)
        if resp.status_code != 200:
            print(f"    [FAIL] HTTP Error {resp.status_code}: {resp.text}")
            all_passed = False
            continue
            
        data = resp.json()
        verdict = data.get("verdict_status")
        metrics = data.get("metrics", {})
        spans = data.get("annotated_spans", [])
        
        red_spans = [s for s in spans if s.get("color") == "red"]
        yellow_spans = [s for s in spans if s.get("color") == "yellow"]
        blue_spans = [s for s in spans if s.get("color") == "blue"]
        green_spans = [s for s in spans if s.get("color") == "green"]
        
        cds = metrics.get("content_differentiation_score")
        sim = metrics.get("max_cosine_similarity")
        mattr = metrics.get("mattr_score")
        
        print(f"    * Keputusan Sistem : {verdict}")
        print(f"    * Skor Akhir CDS   : {cds} / 100")
        print(f"    * Max Cosine VSM   : {sim}")
        print(f"    * Nilai MATTR      : {mattr}")
        print(f"    * Deteksi Stabilo  : 🟥 {len(red_spans)} Merah | 🟨 {len(yellow_spans)} Defisit | 🟦 {len(blue_spans)} Gain | 🟩 {len(green_spans)} Konsensus")
        
        is_pass = False
        if d["ground_truth_label"] == "Layak Terbit" and "Siap Terbit" in str(verdict):
            is_pass = True
        elif d["ground_truth_label"] == "Perlu Revisi" and "Perlu Revisi" in str(verdict):
            is_pass = True
            
        if is_pass:
            print(f"    ✅ STATUS QC: LULUS (Akurasi Keputusan 100% Cocok)")
        else:
            print(f"    ❌ STATUS QC: GAGAL (Tidak cocok dengan Ground Truth)")
            all_passed = False

    print("\n" + "=" * 80)
    if all_passed:
        print("  KESIMPULAN: SELURUH PENGUJIAN END-TO-END OTOMATIS DINYATAKAN LULUS! (PASSED)")
    else:
        print("  KESIMPULAN: TERDAPAT PENGUJIAN YANG GAGAL.")
    print("=" * 80)
    return all_passed

if __name__ == "__main__":
    success = run_automated_qc()
    sys.exit(0 if success else 1)
