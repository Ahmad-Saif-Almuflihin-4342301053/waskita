import React from "react";
import { COLORS, WaskitaLogo, IconMenu, IconPlus, IconArrowRight } from "./shared-ui";

export interface GuestWorkspaceProps {
  isDesktop?: boolean;
  plusToggleId: string;
  sidebarToggleId: string;
}

export const GuestWorkspace: React.FC<GuestWorkspaceProps> = ({
  isDesktop = false,
  plusToggleId,
  sidebarToggleId,
}) => {
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: COLORS.warmCream,
        color: COLORS.deepSlate,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header Mobile (56px) vs Desktop Standalone Sign In Button (Tanpa Background Header & Tanpa Logo Duplikat) */}
      {isDesktop ? (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "28px",
            zIndex: 30,
          }}
        >
          <button
            type="button"
            style={{
              background: COLORS.softPeriwinkle,
              border: "none",
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(30, 41, 59, 0.06)",
            }}
          >
            Sign in
          </button>
        </div>
      ) : (
        <header
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
            flexShrink: 0,
            background: COLORS.warmCream,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              htmlFor={sidebarToggleId}
              style={{
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "8px",
                color: COLORS.deepSlate,
              }}
              title="Buka Menu"
            >
              <IconMenu size={22} color={COLORS.deepSlate} />
            </label>
            <WaskitaLogo width={120} height={26} />
          </div>

          <div>
            <button
              type="button"
              style={{
                background: COLORS.softPeriwinkle,
                border: "none",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 600,
                color: COLORS.deepSlate,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </div>
        </header>
      )}

      {/* Desktop Centered Content (Hero + Kapsul Input + Disclaimer) vs Mobile Separated Content */}
      {isDesktop ? (
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 32px 48px 32px",
            textAlign: "center",
            maxWidth: "760px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Logo Resmi Waskita di atas Judul CTA */}
          <div style={{ marginBottom: "24px" }}>
            <WaskitaLogo width={160} height={34} />
          </div>

          {/* Judul Hero CTA (Teks deskripsi kecil dihapus) */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: COLORS.deepSlate,
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Segera Periksa, ARTIKELMU!
          </h1>

          {/* Kapsul Input Tengah */}
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

          {/* Teks Disclaimer Privasi di bawah Kapsul Tengah */}
          <p
            style={{
              fontSize: "11px",
              color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.6))",
              textAlign: "center",
              marginTop: "14px",
              marginBottom: 0,
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Ketentuan Layanan dan Kebijakan Privasi Waskita berlaku. Waskita menyajikan panduan audit pra-publikasi untuk evaluasi draf artikel web.
          </p>
        </main>
      ) : (
        <>
          {/* Mobile Hero Tengah */}
          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px 120px 24px",
              textAlign: "center",
              width: "100%",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            {/* Logo Resmi Waskita di atas Judul CTA Mobile */}
            <div style={{ marginBottom: "18px" }}>
              <WaskitaLogo width={140} height={30} />
            </div>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: COLORS.deepSlate,
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              Segera Periksa, ARTIKELMU!
            </h1>
          </main>

          {/* Mobile Floating Input Capsule Bawah dengan Teks Keterangan di Bawahnya */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "16px",
              right: "16px",
              boxSizing: "border-box",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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

            {/* Keterangan / Disclaimer di Bawah Field Text Mobile */}
            <p
              style={{
                fontSize: "10px",
                color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.6))",
                textAlign: "center",
                marginTop: "10px",
                marginBottom: 0,
                lineHeight: 1.4,
                padding: "0 8px",
              }}
            >
              Ketentuan Layanan dan Kebijakan Privasi Waskita berlaku. Waskita menyajikan panduan audit pra-publikasi untuk evaluasi draf artikel web.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
