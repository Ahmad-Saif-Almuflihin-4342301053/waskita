import { AuditExecuteResponse } from '../types/waskita';

export const INITIAL_AUDIT_TURN_1: AuditExecuteResponse = {
  session_id: "8f14e45f-ceea-467f-a8f1-44c09e08b912",
  parent_session_id: null,
  turn_number: 1,
  target_query: "resep kopi tubruk tradisional",
  draft_title: "Resep Kopi Tubruk Tradisional & Takaran Pas",
  draft_word_count: 412,
  audit_timestamp: "2026-10-22T10:15:00+07:00",
  verdict_status: "Perlu Revisi",
  degradation_warning: null,
  thresholds: {
    max_cosine_similarity: 0.60,
    min_mattr: 0.55,
    max_hko_percentage: 40.0,
    min_cds_score: 75.0,
  },
  metrics: {
    content_differentiation_score: 70.0,
    avg_cosine_similarity: 0.44,
    max_cosine_similarity: 0.68,
    euclidean_distance: 1.02,
    ttr_score: 0.53,
    mattr_score: 0.51,
    hko_percentage: 45.0,
    is_redundant: true,
    is_keyword_stuffed: true,
  },
  entity_gaps: {
    deficit: [
      {
        term_string: "takaran suhu 90c",
        term_surface_form: "Takaran Suhu 90°C",
        tfidf_weight: 0.84,
        competitor_consensus_count: 3,
      },
      {
        term_string: "rasio seduh 1 15",
        term_surface_form: "Rasio Seduh 1:15",
        tfidf_weight: 0.79,
        competitor_consensus_count: 2,
      },
    ],
    gain: [
      {
        term_string: "robusta dampit",
        term_surface_form: "Robusta Dampit",
        tfidf_weight: 0.91,
        competitor_consensus_count: 0,
      },
    ],
  },
  annotated_spans: [
    {
      text: "Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring.",
      color: null,
      label: null,
    },
    {
      text: "Banyak orang menyukai kopi tubruk karena aromanya yang pekat dan cara pembuatannya yang sangat mudah sekali.",
      color: "yellow",
      label: "Klise/Generik",
    },
    {
      text: "[Defisit: Belum mencantumkan rekomendasi suhu air optimal dan rasio gramasi kopi terhadap mililiter air].",
      color: "blue",
      label: "Saran Celah Defisit",
    },
    {
      text: "Cara membuat kopi tubruk tanpa ampas naik ke permukaan dan langkah mudah menyeduhnya dengan air mendidih...",
      color: "red",
      label: "Redundansi VSM Tinggi",
    },
    {
      text: "Penggunaan biji Robusta Dampit memberikan aksen earthy cokelat yang tegas, apalagi jika dipadukan gula aren cair alami.",
      color: "green",
      label: "Orisinalitas Kuat",
    },
  ],
  overview_bullets: [
    "Perbaiki struktur sub-judul agar tidak menjiplak gaya artikel kompetitor.",
    "Sertakan panduan suhu air presisi (90°C - 94°C) dan rasio 1:15 untuk menutup gap defisit.",
    "Tingkatkan variasi leksikal kata ganti dan kata sifat agar MATTR melampaui 0.55.",
  ],
  remediation_prompt:
    "Tolong tulis ulang paragraf pembuka artikel kopi tubruk ini agar lebih tajam dan kaya gaya stilometri.\nWajib sertakan poin penting berikut:\n1. Suhu seduh air ideal (90-94°C) dan rasio bubuk:air (1:15).\n2. Tekankan keunikan cita rasa Robusta Dampit.\n3. Hindari frasa pembuka generik 'di era saat ini' atau repetisi kata berulang.",
};

export const INITIAL_AUDIT_TURN_2: AuditExecuteResponse = {
  session_id: "c92e718b-4a31-419b-a0f2-b8832a819b01",
  parent_session_id: "8f14e45f-ceea-467f-a8f1-44c09e08b912",
  turn_number: 2,
  target_query: "resep kopi tubruk tradisional",
  draft_title: "Resep Kopi Tubruk Tradisional & Takaran Pas (Revisi #2)",
  draft_word_count: 538,
  audit_timestamp: "2026-10-22T10:22:00+07:00",
  verdict_status: "Layak Terbit",
  degradation_warning: null,
  thresholds: {
    max_cosine_similarity: 0.60,
    min_mattr: 0.55,
    max_hko_percentage: 40.0,
    min_cds_score: 75.0,
  },
  metrics: {
    content_differentiation_score: 85.0,
    avg_cosine_similarity: 0.38,
    max_cosine_similarity: 0.52,
    euclidean_distance: 1.28,
    ttr_score: 0.64,
    mattr_score: 0.62,
    hko_percentage: 20.0,
    is_redundant: false,
    is_keyword_stuffed: false,
  },
  entity_gaps: {
    deficit: [],
    gain: [
      {
        term_string: "robusta dampit",
        term_surface_form: "Robusta Dampit",
        tfidf_weight: 0.93,
        competitor_consensus_count: 0,
      },
      {
        term_string: "suhu 92c presisi",
        term_surface_form: "Suhu 92°C Presisi",
        tfidf_weight: 0.88,
        competitor_consensus_count: 1,
      },
      {
        term_string: "gula aren organik",
        term_surface_form: "Gula Aren Organik",
        tfidf_weight: 0.82,
        competitor_consensus_count: 0,
      },
    ],
  },
  annotated_spans: [
    {
      text: "Menikmati seduhan kopi tubruk sejatinya merayakan kesederhanaan rasa yang jujur tanpa saringan mekanis.",
      color: "green",
      label: "Orisinalitas Kuat",
    },
    {
      text: "Biji Robusta Dampit asal lereng Semeru diekstraksi sempurna pada suhu air 92°C dengan rasio seduh 1:15 yang presisi.",
      color: "green",
      label: "Orisinalitas Kuat",
    },
    {
      text: "Sensasi body tebal berpadu manis legit gula aren cair menghadirkan profil rasa earthy cokelat yang autentik.",
      color: "green",
      label: "Orisinalitas Kuat",
    },
  ],
  overview_bullets: [
    "Skor CDS meningkat dari 70% menjadi 85% (Siap Terbit).",
    "Seluruh celah defisit suhu seduh dan rasio air telah tercakup secara alami.",
    "Kemiripan kosinus terhadap korpus kompetitor turun ke level aman (0.52 <= 0.60).",
  ],
  remediation_prompt:
    "Naskah sudah memenuhi standar orisinalitas tinggi dan siap diterbitkan ke CMS editorial.",
};
