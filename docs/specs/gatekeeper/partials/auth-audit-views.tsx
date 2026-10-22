import React from "react";
import {
  COLORS,
  WaskitaLogo,
  SemiCircleGauge,
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconPlus,
  IconArrowRight,
} from "./shared-ui";

export interface AuditStreamProps {
  isDesktop?: boolean;
  plusToggleId?: string;
}

/**
 * 1. HistoryOneAuditStream:
 * - Bubble Masukan 1 (#E9DFCA).
 * - Blok Analisis 1: SATU background utuh #D4E5F2 (ANTI-DOUBLE-BACKGROUND: tanpa kotak di dalam kotak,
 *   tiap seksi background transparent border none, hanya dipisah borderBottom 1px solid rgba(30,41,59,0.1)
 *   dan padding vertikal). CDS 70% Amber, threshold 75, metrik stilometri, chip celah topik,
 *   naskah anotasi 4-warna, overview & prompt bantuan, Top 3 SERP.
 * - Bubble Revisi Pengguna (#E9DFCA).
 * - Blok Analisis 2: SATU background utuh terpisah #D4E5F2, CDS 85% Emerald Siap Terbit.
 */
export const HistoryOneAuditStream: React.FC<AuditStreamProps> = ({ isDesktop = false }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%",
        maxWidth: isDesktop ? "840px" : "100%",
        margin: "0 auto",
        padding: isDesktop ? "24px 24px 120px 24px" : "16px 14px 100px 14px",
        boxSizing: "border-box",
      }}
    >
      {/* Bubble Masukan 1 (#E9DFCA) */}
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: isDesktop ? "70%" : "88%",
          background: COLORS.warmSand,
          color: COLORS.deepSlate,
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 16px",
          fontSize: "13px",
          lineHeight: 1.45,
          border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          boxShadow: "0 2px 8px rgba(30, 41, 59, 0.03)",
        }}
      >
        <span style={{ fontWeight: 700 }}>Draf Masukan #1:</span> Resep Kopi Tubruk Tradisional &amp; Takaran Pas
      </div>

      {/* BLOK ANALISIS 1: SATU background utuh #D4E5F2 */}
      <div
        style={{
          background: COLORS.softIceBlue,
          borderRadius: "24px",
          border: "1px solid var(--waskita-audit-border, rgba(192, 213, 229, 0.9))",
          padding: isDesktop ? "24px 28px" : "20px 18px",
          boxShadow: "0 4px 16px rgba(30, 41, 59, 0.05)",
          color: COLORS.deepSlate,
        }}
      >
        {/* Header Tag Analisis 1 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            paddingBottom: "10px",
            borderBottom: "1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.7))",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Hasil Analisis #1
          </span>
          <span style={{ fontSize: "11px", color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))" }}>10:15 WIB</span>
        </div>

        {/* Seksi 1: Status Kelayakan (CDS 70% Amber, threshold 75) */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "0 0 20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: COLORS.deepSlate }}>
                Status Kelayakan
              </h2>
              <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "2px 0 0 0" }}>
                CDS: 70% (Ambang Standar: 75%)
              </p>
            </div>
            <span
              style={{
                background: "var(--waskita-amber-bg, #FEF3C7)",
                color: "var(--waskita-amber-text, #B45309)",
                border: "1px solid var(--waskita-amber-border, transparent)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.2px",
              }}
            >
              Perlu Revisi
            </span>
          </div>

          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <SemiCircleGauge score={70} threshold={75} color="#D97706" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              color: "var(--waskita-amber-body, #92400E)",
              fontSize: "12.5px",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              <IconAlertCircle size={16} color="var(--waskita-amber-text, #D97706)" />
            </div>
            <div>
              Skor <strong>70%</strong> belum mencapai ambang standar lolos <strong>75%</strong>.
              Draf memiliki kemiripan struktur yang tinggi dengan Top 3 SERP serta defisit pada takaran suhu seduh dan rasio air.
            </div>
          </div>
        </section>

        {/* Seksi 2: Metrik Stilometri & Leksikal */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Metrik Stilometri &amp; Leksikal
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 14px 0" }}>
            Analisis matematis kemiripan vektor dan kekayaan kosakata naskah
          </p>

          <div
            style={{
              display: isDesktop ? "grid" : "flex",
              gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : undefined,
              flexDirection: isDesktop ? undefined : "column",
              gap: "14px",
            }}
          >
            {/* Progress 1: VSM Cosine Similarity */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>VSM Cosine Similarity</span>
                <span style={{ color: COLORS.deepSlate }}>
                  0.48 <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Maks 0.60)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "48%",
                    height: "100%",
                    background: "#10B981",
                    borderRadius: "9999px",
                  }}
                />
              </div>
            </div>

            {/* Progress 2: MATTR */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>MATTR (Kekayaan Leksikal)</span>
                <span style={{ color: COLORS.deepSlate }}>
                  0.61 <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Min 0.55)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "61%",
                    height: "100%",
                    background: "#10B981",
                    borderRadius: "9999px",
                  }}
                />
              </div>
            </div>

            {/* Progress 3: HKO Overlap */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>HKO Overlap (Sub-judul)</span>
                <span style={{ color: COLORS.deepSlate }}>
                  25% <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Maks 40%)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "25%",
                    height: "100%",
                    background: "#10B981",
                    borderRadius: "9999px",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seksi 3: Celah Topik · Information Gain */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Celah Topik · Information Gain
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Perbandingan entitas topik terhadap dominansi hasil pencarian Google
          </p>

          {/* Topic Deficit */}
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--waskita-rose-accent, #DC2626)",
                marginBottom: "6px",
              }}
            >
              Δ deficit (Topik Wajib Belum Ada):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Takaran Suhu 90°C", "Rasio Seduh 1:15", "Tingkat Gilingan Bubuk"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--waskita-rose-bg, #FEE2E2)",
                    color: "var(--waskita-rose-text, #991B1B)",
                    border: "1px solid var(--waskita-rose-border, transparent)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                  }}
                >
                  - {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Topic Gain */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--waskita-emerald-accent, #059669)",
                marginBottom: "6px",
              }}
            >
              Δ gain (Diferensiasi Unik Ditemukan):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Robusta Dampit", "Pemanis Aren Alami"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--waskita-emerald-bg, #D1FAE5)",
                    color: "var(--waskita-emerald-text, #065F46)",
                    border: "1px solid var(--waskita-emerald-border, transparent)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                  }}
                >
                  + {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Seksi 4: Naskah Terkurasi & Anotasi 4-Warna */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Naskah Terkurasi &amp; Anotasi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 10px 0" }}>
            Evaluasi per-paragraf dengan kode warna stilometri
          </p>

          {/* Legenda 4 Warna */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "12px",
              fontSize: "11px",
              color: COLORS.deepSlate,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#FEF08A" }} />
              <span>Kuning: Klise/Generik</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#FECACA" }} />
              <span>Merah: Celah Defisit</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#BFDBFE" }} />
              <span>Biru: VSM Tinggi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#BBF7D0" }} />
              <span>Hijau: Orisinalitas Kuat</span>
            </div>
          </div>

          {/* Teks Naskah Ber-stabilo */}
          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              color: "var(--waskita-text-body, #334155)",
              marginBottom: "12px",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring.{" "}
              <mark
                style={{
                  background: "var(--waskita-mark-yellow-bg, #FEF08A)",
                  color: "var(--waskita-mark-yellow-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Banyak orang menyukai kopi tubruk karena aromanya yang pekat dan cara pembuatannya yang sangat mudah sekali.
              </mark>
            </p>
            <p style={{ margin: 0 }}>
              <mark
                style={{
                  background: "var(--waskita-mark-red-bg, #FECACA)",
                  color: "var(--waskita-mark-red-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                [Defisit: Belum mencantumkan rekomendasi suhu air optimal dan rasio gramasi kopi terhadap mililiter air].
              </mark>{" "}
              <mark
                style={{
                  background: "var(--waskita-mark-green-bg, #BBF7D0)",
                  color: "var(--waskita-mark-green-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Penggunaan biji Robusta Dampit memberikan aksen earthy cokelat yang tegas, apalagi jika dipadukan gula aren cair alami.
              </mark>
            </p>
          </div>

          <div style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", fontStyle: "italic" }}>
            Catatan: Hapus frase klise pada kalimat awal dan segera masukkan rincian teknis penyeduhan agar memenuhi intensitas informasi SERP.
          </div>
        </section>

        {/* Seksi 5: Overview & Prompt Bantuan */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Overview &amp; Prompt Bantuan
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 10px 0" }}>
            Gunakan panduan instruksi ini untuk meminta asisten AI menulis ulang bagian yang defisit
          </p>

          <ul
            style={{
              margin: "0 0 12px 0",
              paddingLeft: "18px",
              fontSize: "12.5px",
              lineHeight: 1.5,
              color: "var(--waskita-text-body, #334155)",
            }}
          >
            <li>Perbaiki struktur sub-judul agar tidak menjiplak gaya artikel kompetitor.</li>
            <li>Sertakan panduan suhu air presisi (90°C - 94°C) dan rasio 1:15 untuk menutup gap defisit.</li>
          </ul>

          <div
            style={{
              background: "var(--waskita-code-bg, rgba(255, 255, 255, 0.7))",
              border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
              borderRadius: "12px",
              padding: "12px 14px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.6))" }}>
                prompt-bantuan.txt
              </span>
              <button
                type="button"
                style={{
                  background: COLORS.warmSand,
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IconCopy size={12} color={COLORS.deepSlate} /> Salin Prompt
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: "11.5px",
                lineHeight: 1.5,
                color: COLORS.deepSlate,
                whiteSpace: "pre-wrap",
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
{`Tolong tulis ulang paragraf pembuka artikel kopi tubruk ini agar lebih tajam dan kaya gaya stilometri.
Wajib sertakan poin penting berikut:
1. Suhu seduh air ideal (90-94°C) dan rasio bubuk:air (1:15).
2. Tekankan keunikan profil rasa Robusta Dampit dengan gula aren alami.
3. Hindari kalimat klise 'banyak orang menyukai kopi tubruk'.`}
            </pre>
          </div>
        </section>

        {/* Seksi 6: Referensi SERP · Top 3 Google */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0 0 0",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Referensi SERP · Top 3 Google
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Artikel kompetitor acuan untuk kueri "resep kopi tubruk tradisional"
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                rank: "#1",
                title: "Cara Membuat Kopi Tubruk yang Enak dan Pas Mantap",
                domain: "kompas.com/food",
                snippet: "Kunci kopi tubruk nikmat ada pada kesegaran gilingan dan air mendidih yang didiamkan sebentar...",
              },
              {
                rank: "#2",
                title: "Resep Kopi Tubruk Tradisional Khas Nusantara",
                domain: "resepkopi.id/tubruk",
                snippet: "Langkah mudah menyeduh kopi hitam tubruk tanpa ampas naik ke permukaan...",
              },
              {
                rank: "#3",
                title: "Panduan Seduh Manual: Kopi Tubruk Sempurna",
                domain: "ottencoffee.co.id/magazine",
                snippet: "Mengenal rasio seduh 1:15 dan profil gilingan medium to fine untuk tubruk...",
              },
            ].map((item) => (
              <div
                key={item.rank}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px dashed var(--waskita-border, rgba(30, 41, 59, 0.12))",
                }}
              >
                <span
                  style={{
                    background: COLORS.warmSand,
                    color: COLORS.deepSlate,
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "6px",
                    padding: "2px 6px",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {item.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        margin: 0,
                        color: COLORS.deepSlate,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </h4>
                    <IconExternalLink size={13} color="var(--waskita-text-muted, rgba(30, 41, 59, 0.6))" />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--waskita-emerald-accent, #059669)", fontWeight: 500 }}>
                    {item.domain}
                  </span>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      margin: "3px 0 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pemisah Antar-Analisis */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "4px 0",
        }}
      >
        <div style={{ height: "1px", background: "var(--waskita-border-strong, rgba(30, 41, 59, 0.15))", flex: 1 }} />
        <span
          style={{
            padding: "0 12px",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.5))",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Iterasi Revisi
        </span>
        <div style={{ height: "1px", background: "var(--waskita-border-strong, rgba(30, 41, 59, 0.15))", flex: 1 }} />
      </div>

      {/* Bubble Revisi Pengguna (#E9DFCA) */}
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: isDesktop ? "70%" : "88%",
          background: COLORS.warmSand,
          color: COLORS.deepSlate,
          borderRadius: "18px 18px 4px 18px",
          padding: "12px 16px",
          fontSize: "12.5px",
          lineHeight: 1.5,
          border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          boxShadow: "0 2px 8px rgba(30, 41, 59, 0.03)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "4px", color: COLORS.deepSlate }}>
          Revisi Draf Baru (Menutup Celah Defisit):
        </div>
        <p style={{ margin: 0 }}>
          "Menyeduh kopi tubruk Robusta Dampit dengan presisi memerlukan air bertemperatur 92°C serta rasio 1:15 (10g bubuk medium untuk 150ml air). Manisnya gula aren cair mengikat ketegasan body tanpa ampas berlebih..."
        </p>
      </div>

      {/* BLOK ANALISIS 2: SATU background utuh terpisah #D4E5F2, CDS 85% Emerald Siap Terbit */}
      <div
        style={{
          background: COLORS.softIceBlue,
          borderRadius: "24px",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          padding: isDesktop ? "24px 28px" : "20px 18px",
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)",
          color: COLORS.deepSlate,
        }}
      >
        {/* Header Tag Analisis 2 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            paddingBottom: "10px",
            borderBottom: "1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--waskita-emerald-accent, #059669)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Hasil Analisis #2 (Terbaru)
          </span>
          <span style={{ fontSize: "11px", color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))" }}>10:22 WIB</span>
        </div>

        {/* Seksi 1: Status Kelayakan (CDS 85% Emerald Siap Terbit) */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "0 0 20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: COLORS.deepSlate }}>
                Status Kelayakan
              </h2>
              <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "2px 0 0 0" }}>
                CDS: 85% (Ambang Standar: 75%)
              </p>
            </div>
            <span
              style={{
                background: "var(--waskita-emerald-bg, #D1FAE5)",
                color: "var(--waskita-emerald-text, #065F46)",
                border: "1px solid var(--waskita-emerald-border, transparent)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <IconCheck size={14} color="var(--waskita-emerald-accent, #059669)" /> Siap Terbit
            </span>
          </div>

          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <SemiCircleGauge score={85} threshold={75} color="#10B981" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              color: "var(--waskita-emerald-text, #065F46)",
              fontSize: "12.5px",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              <IconCheck size={16} color="var(--waskita-emerald-accent, #059669)" />
            </div>
            <div>
              Selamat! Skor <strong>85%</strong> berhasil melampaui standar <strong>75%</strong>.
              Seluruh defisit topik teratasi dan artikel memiliki nilai Information Gain yang sangat kompetitif di SERP Google.
            </div>
          </div>
        </section>

        {/* Seksi 2: Metrik Stilometri & Leksikal */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Metrik Stilometri &amp; Leksikal
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 14px 0" }}>
            Optimalisasi leksikal dan kemiripan semantik pasca revisi
          </p>

          <div
            style={{
              display: isDesktop ? "grid" : "flex",
              gridTemplateColumns: isDesktop ? "1fr 1fr" : undefined,
              flexDirection: isDesktop ? undefined : "column",
              gap: "14px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>VSM Cosine Similarity</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)" }}>0.36 (Optimal &lt; 0.60)</span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "36%", height: "100%", background: "#10B981", borderRadius: "9999px" }} />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>MATTR (Kekayaan Leksikal)</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)" }}>0.74 (Sangat Kaya &gt; 0.55)</span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "74%", height: "100%", background: "#10B981", borderRadius: "9999px" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Seksi 3: Celah Topik · Information Gain Terpenuhi */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Celah Topik · Information Gain Terpenuhi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Seluruh defisit topik telah teratasi dengan penambahan entitas spesifik
          </p>

          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--waskita-emerald-accent, #059669)", display: "block", marginBottom: "8px" }}>
              Δ gain Terpenuhi:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Suhu Presisi 92°C", "Rasio Takaran 1:15", "Robusta Dampit", "Pemanis Aren Alami"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--waskita-emerald-bg, #D1FAE5)",
                    color: "var(--waskita-emerald-text, #065F46)",
                    border: "1px solid var(--waskita-emerald-border, transparent)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <IconCheck size={12} color="var(--waskita-emerald-text, #065F46)" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Seksi 4: Naskah Anotasi Stabilo Hijau (#BBF7D0) */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Naskah Terkurasi &amp; Anotasi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 10px 0" }}>
            Tinjauan draf hasil revisi dengan pembuktian stilometri dan penutupan celah informasi
          </p>

          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              color: "var(--waskita-text-body, #334155)",
              marginBottom: "12px",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <mark
                style={{
                  background: "var(--waskita-mark-green-bg, #BBF7D0)",
                  color: "var(--waskita-mark-green-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Menyeduh kopi tubruk Robusta Dampit dengan presisi memerlukan air bertemperatur 92°C serta rasio 1:15 (10g bubuk medium untuk 150ml air).
              </mark>{" "}
              Proses blooming selama 30 detik melepaskan gas karbon dioksida tanpa mengorbankan minyak esensial kopi.
            </p>
            <p style={{ margin: 0 }}>
              <mark
                style={{
                  background: "var(--waskita-mark-green-bg, #BBF7D0)",
                  color: "var(--waskita-mark-green-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Manisnya gula aren cair mengikat ketegasan body tanpa ampas berlebih naik ke permukaan.
              </mark>{" "}
              Kombinasi ini menghasilkan profil rasa legit, tebal, dan bebas dari sensasi pahit getir yang tajam.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--waskita-emerald-accent, #059669)",
              fontWeight: 600,
            }}
          >
            <IconCheck size={14} color="var(--waskita-emerald-accent, #059669)" />
            <span>Kelulusan Anotasi: Naskah 100% orisinal, bebas klise, dan seluruh parameter teknis telah terverifikasi.</span>
          </div>
        </section>

        {/* Seksi 5: Overview Editorial Publikasi & Salin Ringkasan */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Overview Editorial Publikasi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 10px 0" }}>
            Catatan redaksi untuk kesiapan publikasi ke sistem CMS
          </p>

          <ul
            style={{
              margin: "0 0 12px 0",
              paddingLeft: "18px",
              fontSize: "12.5px",
              lineHeight: 1.5,
              color: "var(--waskita-text-body, #334155)",
            }}
          >
            <li>Draf telah siap diterbitkan langsung ke WordPress/Ghost dengan skor kelayakan 85%.</li>
            <li>Rekomendasi internal link: hubungkan dengan artikel "Profil Roasting Robusta Dampit".</li>
            <li>Snippet meta deskripsi otomatis terverifikasi dengan panjang karakter optimal (145 karakter).</li>
          </ul>

          <div
            style={{
              background: "var(--waskita-code-bg, rgba(255, 255, 255, 0.7))",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "12px",
              padding: "12px 14px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--waskita-emerald-text, #065F46)" }}>
                ringkasan-editorial-final.txt
              </span>
              <button
                type="button"
                style={{
                  background: COLORS.warmSand,
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IconCopy size={12} color={COLORS.deepSlate} /> Salin Ringkasan
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: "11.5px",
                lineHeight: 1.5,
                color: COLORS.deepSlate,
                whiteSpace: "pre-wrap",
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
{`[EDITORIAL PASSED] Kualitas Naskah Lolos Standar Waskita
- Topik: Resep Kopi Tubruk Tradisional & Takaran Pas
- CDS Score: 85% (Threshold: 75%) | Status: Siap Terbit
- VSM Cosine: 0.36 | MATTR: 0.74 (Orisinalitas Kuat)
- Draf siap diintegrasikan ke jadwal editorial blog.`}
            </pre>
          </div>
        </section>

        {/* Seksi 6: Referensi SERP · Top 3 Google */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0 0 0",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Referensi SERP · Top 3 Google
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Artikel kompetitor acuan untuk kueri "resep kopi tubruk tradisional"
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                rank: "#1",
                title: "Cara Membuat Kopi Tubruk yang Enak dan Pas Mantap",
                domain: "kompas.com/food",
                snippet: "Kunci kopi tubruk nikmat ada pada kesegaran gilingan dan air mendidih yang didiamkan sebentar...",
              },
              {
                rank: "#2",
                title: "Resep Kopi Tubruk Tradisional Khas Nusantara",
                domain: "resepkopi.id/tubruk",
                snippet: "Langkah mudah menyeduh kopi hitam tubruk tanpa ampas naik ke permukaan...",
              },
              {
                rank: "#3",
                title: "Panduan Seduh Manual: Kopi Tubruk Sempurna",
                domain: "ottencoffee.co.id/magazine",
                snippet: "Mengenal rasio seduh 1:15 dan profil gilingan medium to fine untuk tubruk...",
              },
            ].map((item) => (
              <div
                key={item.rank}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px dashed var(--waskita-border, rgba(30, 41, 59, 0.12))",
                }}
              >
                <span
                  style={{
                    background: COLORS.warmSand,
                    color: COLORS.deepSlate,
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "6px",
                    padding: "2px 6px",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {item.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        margin: 0,
                        color: COLORS.deepSlate,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </h4>
                    <IconExternalLink size={13} color="var(--waskita-text-muted, rgba(30, 41, 59, 0.6))" />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--waskita-emerald-accent, #059669)", fontWeight: 500 }}>
                    {item.domain}
                  </span>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      margin: "3px 0 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * 2. HistoryTwoAuditStream:
 * - Bubble Masukan (#E9DFCA: 'Draf Masukan: Panduan Optimasi SEO Teknis Core Web Vitals (LCP, INP, CLS)').
 * - Blok Analisis Utuh (#D4E5F2, CDS 88% Siap Terbit): Radial Gauge 88%, metrik stilometri
 *   VSM 0.36, MATTR 0.68, HKO 20%, chip gain INP & Speculation Rules API, naskah anotasi SEO,
 *   prompt bantuan, dan Top 3 SERP.
 */
export const HistoryTwoAuditStream: React.FC<AuditStreamProps> = ({ isDesktop = false }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%",
        maxWidth: isDesktop ? "840px" : "100%",
        margin: "0 auto",
        padding: isDesktop ? "24px 24px 120px 24px" : "16px 14px 100px 14px",
        boxSizing: "border-box",
      }}
    >
      {/* Bubble Masukan (#E9DFCA) */}
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: isDesktop ? "70%" : "88%",
          background: COLORS.warmSand,
          color: COLORS.deepSlate,
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 16px",
          fontSize: "13px",
          lineHeight: 1.45,
          border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          boxShadow: "0 2px 8px rgba(30, 41, 59, 0.03)",
        }}
      >
        <span style={{ fontWeight: 700 }}>Draf Masukan:</span> Panduan Optimasi SEO Teknis Core Web Vitals (LCP, INP, CLS)
      </div>

      {/* Blok Analisis Utuh (#D4E5F2, CDS 88% Siap Terbit) */}
      <div
        style={{
          background: COLORS.softIceBlue,
          borderRadius: "24px",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          padding: isDesktop ? "24px 28px" : "20px 18px",
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)",
          color: COLORS.deepSlate,
        }}
      >
        {/* Header Tag Riwayat 2 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            paddingBottom: "10px",
            borderBottom: "1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--waskita-emerald-accent, #059669)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Hasil Analisis Sesi #2
          </span>
          <span style={{ fontSize: "11px", color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))" }}>Kemarin, 16:40 WIB</span>
        </div>

        {/* Seksi 1: Status Kelayakan (CDS 88% Siap Terbit) */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "0 0 20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: COLORS.deepSlate }}>
                Status Kelayakan
              </h2>
              <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "2px 0 0 0" }}>
                CDS: 88% (Ambang Standar: 75%)
              </p>
            </div>
            <span
              style={{
                background: "var(--waskita-emerald-bg, #D1FAE5)",
                color: "var(--waskita-emerald-text, #065F46)",
                border: "1px solid var(--waskita-emerald-border, transparent)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <IconCheck size={14} color="var(--waskita-emerald-accent, #059669)" /> Siap Terbit
            </span>
          </div>

          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <SemiCircleGauge score={88} threshold={75} color="#10B981" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              color: "var(--waskita-emerald-text, #065F46)",
              fontSize: "12.5px",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              <IconCheck size={16} color="var(--waskita-emerald-accent, #059669)" />
            </div>
            <div>
              Kualitas naskah luar biasa! Skor <strong>88%</strong> melampaui ambang standar.
              Diferensiasi pembahasan INP (<span style={{ fontStyle: "italic" }}>Interaction to Next Paint</span>) dan arsitektur rendering modern memberikan keunggulan Information Gain di SERP.
            </div>
          </div>
        </section>

        {/* Seksi 2: Metrik Stilometri VSM 0.36, MATTR 0.68, HKO 20% */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Metrik Stilometri &amp; Leksikal
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 14px 0" }}>
            Hasil pemetaan vektor semantik dan kepadatan istilah teknis web
          </p>

          <div
            style={{
              display: isDesktop ? "grid" : "flex",
              gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : undefined,
              flexDirection: isDesktop ? undefined : "column",
              gap: "14px",
            }}
          >
            {/* VSM Cosine Similarity 0.36 */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>VSM Cosine Similarity</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)" }}>
                  0.36 <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Maks 0.60)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "36%", height: "100%", background: "#10B981", borderRadius: "9999px" }} />
              </div>
            </div>

            {/* MATTR 0.68 */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>MATTR (Kekayaan Leksikal)</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)" }}>
                  0.68 <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Min 0.55)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "68%", height: "100%", background: "#10B981", borderRadius: "9999px" }} />
              </div>
            </div>

            {/* HKO Overlap 20% */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
              >
                <span style={{ color: COLORS.deepSlate }}>HKO Overlap (Sub-judul)</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)" }}>
                  20% <span style={{ color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))", fontWeight: 400 }}>(Maks 40%)</span>
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  background: "var(--waskita-track, rgba(30, 41, 59, 0.12))",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "20%", height: "100%", background: "#10B981", borderRadius: "9999px" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Seksi 3: Celah Topik & Chip Gain INP & Speculation Rules API */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Celah Topik · Information Gain
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Analisis diferensiasi materi dibanding hasil pencarian kompetitor top SEO
          </p>

          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--waskita-emerald-accent, #059669)", display: "block", marginBottom: "6px" }}>
              Δ gain (Nilai Tambah Signifikan Ditemukan):
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[
                "Optimasi INP < 200ms",
                "Speculation Rules API",
                "Yielding Long Tasks (scheduler.yield)",
                "Fetch Priority High",
                "Back/Forward Cache (bfcache)",
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--waskita-emerald-bg, #D1FAE5)",
                    color: "var(--waskita-emerald-text, #065F46)",
                    border: "1px solid var(--waskita-emerald-border, transparent)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                  }}
                >
                  + {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Seksi 4: Naskah Anotasi SEO */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Naskah Terkurasi &amp; Anotasi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Tinjauan paragraf teknis Core Web Vitals dengan pembuktian empiris
          </p>

          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              color: "var(--waskita-text-body, #334155)",
              marginBottom: "12px",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              Transisi metrik FID menjadi{" "}
              <mark
                style={{
                  background: "var(--waskita-mark-green-bg, #BBF7D0)",
                  color: "var(--waskita-mark-green-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Interaction to Next Paint (INP) menuntut arsitektur JavaScript yang memprioritaskan main-thread responsiveness.
              </mark>{" "}
              Bukan hanya menunda eksekusi skrip, melainkan memecah long-tasks menggunakan API modern seperti <code>scheduler.yield()</code>.
            </p>
            <p style={{ margin: 0 }}>
              <mark
                style={{
                  background: "var(--waskita-mark-blue-bg, #BFDBFE)",
                  color: "var(--waskita-mark-blue-text, #1E293B)",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                Penggunaan Speculation Rules API untuk melakukan pre-render instan pada rute kritis terbukti menurunkan LCP hingga 40%
              </mark>{" "}
              tanpa membebani kuota data pengguna secara agresif.
            </p>
          </div>

          <div style={{ fontSize: "12px", color: "var(--waskita-emerald-accent, #059669)", fontStyle: "italic" }}>
            Komentar Kurator: Naskah sangat komprehensif, memiliki bukti implementasi kode nyata, dan bebas dari kalimat klise pendahuluan.
          </div>
        </section>

        {/* Seksi 5: Prompt Bantuan SEO */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Overview &amp; Prompt Bantuan
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 10px 0" }}>
            Instruksi otomatis untuk menyusun ringkasan eksekutif atau slide presentasi teknis
          </p>

          <div
            style={{
              background: "var(--waskita-code-bg, rgba(255, 255, 255, 0.7))",
              border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
              borderRadius: "12px",
              padding: "12px 14px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.6))" }}>
                seo-executive-summary-prompt.txt
              </span>
              <button
                type="button"
                style={{
                  background: COLORS.warmSand,
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IconCopy size={12} color={COLORS.deepSlate} /> Salin Prompt
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: "11.5px",
                lineHeight: 1.5,
                color: COLORS.deepSlate,
                whiteSpace: "pre-wrap",
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
{`Ringkas artikel Core Web Vitals ini menjadi 3 takeaway praktis bagi engineer frontend:
1. Target batas ambang batas INP (<200ms) dan strategi pemecahan microtask.
2. Konfigurasi aman Speculation Rules API untuk rute checkout/artikel.
3. Dampak langsung rasio LCP terhadap konversi dan skor Lighthouse.`}
            </pre>
          </div>
        </section>

        {/* Seksi 6: Top 3 SERP SEO Teknis */}
        <section
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 0,
            padding: "20px 0 0 0",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: COLORS.deepSlate }}>
            Referensi SERP · Top 3 Google
          </h3>
          <p style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))", margin: "0 0 12px 0" }}>
            Artikel kompetitor acuan untuk kueri "panduan optimasi core web vitals inp lcp"
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                rank: "#1",
                title: "Optimizing INP: Interaction to Next Paint Guide",
                domain: "web.dev/articles/optimize-inp",
                snippet: "Comprehensive guide by the Chrome team on profiling input latency and scheduling rendering...",
              },
              {
                rank: "#2",
                title: "Speculative Loading with the Speculation Rules API",
                domain: "developer.mozilla.org/web-performance",
                snippet: "Syntax, browser compatibility, and best practices for prefetching and prerendering documents...",
              },
              {
                rank: "#3",
                title: "Advanced Core Web Vitals Optimization in 2026",
                domain: "smashingmagazine.com/core-web-vitals",
                snippet: "Real-world case studies detailing how modern e-commerce sites achieve 90+ mobile scores...",
              },
            ].map((item) => (
              <div
                key={item.rank}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px dashed var(--waskita-border, rgba(30, 41, 59, 0.12))",
                }}
              >
                <span
                  style={{
                    background: COLORS.warmSand,
                    color: COLORS.deepSlate,
                    fontSize: "11px",
                    fontWeight: 800,
                    borderRadius: "6px",
                    padding: "2px 6px",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {item.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        margin: 0,
                        color: COLORS.deepSlate,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </h4>
                    <IconExternalLink size={13} color="var(--waskita-text-muted, rgba(30, 41, 59, 0.6))" />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--waskita-emerald-accent, #059669)", fontWeight: 500 }}>
                    {item.domain}
                  </span>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      margin: "3px 0 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * 3. NewAnalysisEmptyView:
 * - Tampilan kanvas kosong saat tombol 'Analisis Baru' dipencet.
 * - Hero 'Segera Periksa, ARTIKELMU!' tanpa duplikasi logo (karena logo sudah ada di header).
 * - Di Desktop: posisikan kapsul input berada di TENGAH LAYAR di bawah hero (karena belum ada hasil analisis).
 *   Diikuti teks disclaimer privasi tepat di bawah kapsul.
 * - Di Mobile: hero berada di tengah layar, kapsul input ditangani melayang di bawah.
 */
export const NewAnalysisEmptyView: React.FC<AuditStreamProps> = ({
  isDesktop = false,
  plusToggleId = "auth-plus-toggle",
}) => {
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isDesktop ? "0 32px 48px 32px" : "0 24px 96px 24px",
        textAlign: "center",
        maxWidth: isDesktop ? "760px" : "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Logo Resmi Waskita di atas Judul CTA */}
      <div style={{ marginBottom: isDesktop ? "24px" : "18px" }}>
        <WaskitaLogo width={isDesktop ? 160 : 140} height={isDesktop ? 34 : 30} />
      </div>

      <h1
        style={{
          fontSize: isDesktop ? "36px" : "24px",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: COLORS.deepSlate,
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        Segera Periksa, ARTIKELMU!
      </h1>

      {/* Di Desktop: Kapsul Input berada di TENGAH LAYAR mengalir tepat di bawah Judul Hero CTA */}
      {isDesktop && (
        <div
          style={{
            width: "100%",
            marginTop: "28px",
            position: "relative",
          }}
        >
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: "28px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 8px 24px rgba(30, 41, 59, 0.08)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Tombol Bulat Plus (+) */}
            <label
              htmlFor={plusToggleId}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: COLORS.mutedSkyBlue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: COLORS.deepSlate,
              }}
              title="Opsi Audit & Berkas"
            >
              <IconPlus size={20} color={COLORS.deepSlate} />
            </label>

            {/* Input / Textarea 'Ketik atau tempel naskah...' */}
            <textarea
              rows={1}
              placeholder="Ketik atau tempel naskah..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: "14px",
                fontFamily: "inherit",
                color: COLORS.deepSlate,
                lineHeight: "22px",
                padding: "9px 4px",
                boxSizing: "border-box",
              }}
            />

            {/* Tombol Bulat Panah Kanan (ArrowRight) */}
            <button
              type="button"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: COLORS.softPeriwinkle,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: COLORS.deepSlate,
              }}
              title="Kirim Analisis"
            >
              <IconArrowRight size={20} color={COLORS.deepSlate} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
