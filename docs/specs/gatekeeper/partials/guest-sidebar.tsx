import React from "react";
import {
  COLORS,
  WaskitaLogo,
  IconX,
  IconSquarePen,
  IconInfo,
  IconSettings,
  IconSearch,
  IconUser,
  IconMenu,
} from "./shared-ui";

export interface GuestSidebarProps {
  isDesktop?: boolean;
  sidebarToggleId: string;
}

export const GuestSidebar: React.FC<GuestSidebarProps> = ({
  isDesktop = false,
  sidebarToggleId,
}) => {
  return (
    <aside
      className={isDesktop ? "guest-sidebar-desktop" : "guest-sidebar-mobile"}
      style={{
        width: isDesktop ? "280px" : "100%",
        height: "100vh",
        backgroundColor: COLORS.warmCream,
        color: COLORS.deepSlate,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: "flex",
        flexDirection: "column",
        position: isDesktop ? "relative" : "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: isDesktop ? "auto" : 0,
        zIndex: isDesktop ? 30 : 60,
        borderRight: isDesktop ? `1px solid ${COLORS.warmSand}` : "none",
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
        transition: isDesktop
          ? "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isDesktop ? "none" : "translateX(-100%)",
      }}
    >
      {isDesktop ? (
        <>
          {/* Expanded State Content (280px) */}
          <div
            className="guest-sidebar-expanded-content"
            style={{
              width: "280px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Header: Menu Toggle & Logo Waskita */}
            <header
              style={{
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  htmlFor={sidebarToggleId}
                  style={{
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    borderRadius: "8px",
                    color: COLORS.deepSlate,
                  }}
                  title="Kecilkan Sidebar"
                >
                  <IconMenu size={20} color={COLORS.deepSlate} />
                </label>
                <WaskitaLogo width={120} height={26} />
              </div>
            </header>

            {/* Konten Tengah: Jarak 30px ke tombol 'Analisis Baru', lalu kartu info */}
            <main
              style={{
                flex: 1,
                padding: "30px 18px 20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                boxSizing: "border-box",
              }}
            >
              {/* Tombol Analisis Baru (IconSquarePen) */}
              <div
                style={{
                  width: "100%",
                  background: COLORS.warmSand,
                  border: "none",
                  borderRadius: "12px",
                  padding: "9px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  textAlign: "left",
                  boxSizing: "border-box",
                }}
              >
                <IconSquarePen size={18} color={COLORS.deepSlate} />
                <span>Analisis Baru</span>
              </div>

              {/* Teks Info 'Masuk untuk menyimpan riwayat analisis Anda' */}
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "18px",
                  color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.75))",
                  fontWeight: 500,
                  padding: "0 6px",
                }}
              >
                <span
                  style={{
                    textDecoration: "underline",
                    fontWeight: 700,
                    color: COLORS.deepSlate,
                    cursor: "pointer",
                  }}
                >
                  Masuk
                </span>{" "}
                untuk menyimpan riwayat analisis Anda
              </div>
            </main>

            {/* Footer: Kiri tombol 'Sign In' kapsul (#C0CEE8), Kanan tombol 'Settings' (IconSettings) */}
            <footer
              style={{
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                style={{
                  background: COLORS.softPeriwinkle,
                  border: "none",
                  borderRadius: "9999px",
                  padding: "10px 24px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                aria-label="Pengaturan"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
                title="Pengaturan"
              >
                <IconSettings size={22} color={COLORS.deepSlate} />
              </button>
            </footer>
          </div>

          {/* Collapsed Mini Rail Content (68px) ala Gemini */}
          <div
            className="guest-sidebar-rail-content"
            style={{
              width: "68px",
              height: "100%",
              display: "none",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0 16px 0",
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            {/* Top Icons: Menu Toggle & Analisis Baru & Search */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
              <label
                htmlFor={sidebarToggleId}
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: "12px",
                  color: COLORS.deepSlate,
                }}
                title="Perluas Sidebar"
              >
                <IconMenu size={22} color={COLORS.deepSlate} />
              </label>

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: COLORS.warmSand,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: COLORS.deepSlate,
                }}
                title="Analisis Baru"
              >
                <IconSquarePen size={20} color={COLORS.deepSlate} />
              </div>

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: COLORS.deepSlate,
                }}
                title="Cari"
              >
                <IconSearch size={20} color={COLORS.deepSlate} />
              </div>
            </div>

            {/* Bottom Icons: Profil (Sign In) & Settings */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
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
                  color: COLORS.deepSlate,
                }}
                title="Profil / Sign In"
              >
                <IconUser size={18} color={COLORS.deepSlate} />
              </button>

              <button
                type="button"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: COLORS.deepSlate,
                }}
                title="Pengaturan"
              >
                <IconSettings size={20} color={COLORS.deepSlate} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mobile Fullscreen Drawer View */}
          <header
            style={{
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <WaskitaLogo width={120} height={26} />
            </div>

            <label
              htmlFor={sidebarToggleId}
              aria-label="Tutup Sidebar"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.deepSlate,
                borderRadius: "8px",
              }}
              title="Tutup Sidebar"
            >
              <IconX size={22} color={COLORS.deepSlate} />
            </label>
          </header>

          <main
            style={{
              flex: 1,
              padding: "30px 18px 20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor={sidebarToggleId}
              style={{
                width: "100%",
                background: COLORS.warmSand,
                border: "none",
                borderRadius: "12px",
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                fontWeight: 700,
                color: COLORS.deepSlate,
                cursor: "pointer",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            >
              <IconSquarePen size={18} color={COLORS.deepSlate} />
              <span>Analisis Baru</span>
            </label>

            {/* Teks Info 'Masuk untuk menyimpan riwayat analisis Anda' */}
            <div
              style={{
                fontSize: "13px",
                lineHeight: "18px",
                color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.75))",
                fontWeight: 500,
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  textDecoration: "underline",
                  fontWeight: 700,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                }}
              >
                Masuk
              </span>{" "}
              untuk menyimpan riwayat analisis Anda
            </div>
          </main>

          <footer
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              style={{
                background: COLORS.softPeriwinkle,
                border: "none",
                borderRadius: "9999px",
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 700,
                color: COLORS.deepSlate,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              aria-label="Pengaturan"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.deepSlate,
                borderRadius: "8px",
              }}
              title="Pengaturan"
            >
              <IconSettings size={22} color={COLORS.deepSlate} />
            </button>
          </footer>
        </>
      )}
    </aside>
  );
};
