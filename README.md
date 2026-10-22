# WASKITA (Web-Article Semantic & Quality Inspection Tool for Pre-Publishing Audit)

Tool audit kualitas dan semantik artikel pra-publikasi untuk mendeteksi orisinalitas, keterbacaan, optimasi SEO, serta relevansi konten terhadap topik web target.

---

## 🏛️ Arsitektur Proyek (Clean Architecture)

```text
waskita/
├── backend/                  # FastAPI Backend Service (Python 3.12)
│   ├── app/
│   │   ├── api/              # API Endpoints & Routers
│   │   ├── core/             # Configuration, Database Setup (SQLite WAL)
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── schemas/          # Pydantic v2 Validation Schemas
│   │   └── services/         # Scraper, NLP Engine (PySastrawi), VSM Calculator
│   ├── requirements.txt      # Python Dependencies
│   └── .env.example          # Environment variables template
├── frontend/                 # Frontend App (Vite + React + Tailwind CSS)
│   └── ...                   # Mengacu ke mockup specs/gatekeeper/
├── docs/                     # Dokumentasi & Spesifikasi Desain
│   └── specs/                # Visual specs & Mockup Gatekeeper
├── .gitignore                # Git Ignore Rules
└── README.md
```

---

## 🚀 Alur Kerja Multi-Agent & Disiplin Git (AGENTS.md)
Proyek ini dikelola menggunakan pola **Multi-Agent Pipeline**:
1. **Chat 1: System Analyst & Orchestrator** - Perancangan Blueprint & Analisis Kebutuhan.
2. **Chat 2: DevOps & GitHub Dispatcher** - Manajemen Issue, Branching, Dispatch Worker, dan PR Gatekeeper.
3. **3 Terminal Workers**:
   - `Worker 1`: Core Logic & Database Engine.
   - `Worker 2`: UI/UX Polish & Frontend Components.
   - `Worker 3`: QA, Reliability & Integration Verification.
