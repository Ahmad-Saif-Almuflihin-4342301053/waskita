import React from "react";
import {
  COLORS,
  WaskitaLogo,
  IconMenu,
  IconMoreVertical,
  IconPlus,
  IconArrowRight,
  IconSearch,
  IconX,
  IconSquarePen,
  IconShare2,
  IconPin,
  IconPencil,
  IconTrash2,
  IconCopy,
  IconDownload,
  IconFileText,
  IconSettings,
  IconUser,
} from "./shared-ui";

export interface AuthSidebarProps {
  isDesktop?: boolean;
  sidebarToggleId: string;
  activeSessionRadioName: string;
  sessionNewId: string;
  sessionOneId: string;
  sessionTwoId: string;
  closeDrawerTargetId?: string;
  drawerFromOneId?: string;
  drawerFromTwoId?: string;
  drawerFromNewId?: string;
}

const DUMMY_HISTORY_ITEMS = [
  { id: "3", title: "Panduan Lengkap Merawat Mobil Listrik di Cuaca Ekstrem..." },
  { id: "4", title: "Review Ultrabook Tipis untuk Pemrogram & UI Designer..." },
  { id: "5", title: "Analisis Pasar Properti Jabodetabek Kuartal Pertama..." },
  { id: "6", title: "Strategi Konten Evergreen untuk Traffic Organik..." },
  { id: "7", title: "Daftar Rekomendasi Framework Web Modern Startup..." },
  { id: "8", title: "Eksplorasi Arsitektur Multi-Agent Pipeline Dev..." },
  { id: "9", title: "Panduan Typography & Skala Modular Redaksi AI..." },
  { id: "10", title: "Penerapan VSM Cosine Similarity Audit Redaksi..." },
  { id: "11", title: "Benchmark Efisiensi Energi Cloud vs On-Premise..." },
  { id: "12", title: "Tips Penulisan Headline Click-Worthy Tanpa Clickbait..." },
  { id: "13", title: "Evaluasi Core Web Vitals LCP & INP Blog Editorial..." },
];

export const AuthSidebar: React.FC<AuthSidebarProps> = ({
  isDesktop = false,
  sidebarToggleId,
  activeSessionRadioName,
  sessionNewId,
  sessionOneId,
  sessionTwoId,
  closeDrawerTargetId,
  drawerFromOneId,
  drawerFromTwoId,
  drawerFromNewId,
}) => {
  return (
    <aside
      className={isDesktop ? "auth-sidebar-desktop" : "auth-sidebar-mobile"}
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
      <style>
        {`
          .auth-history-row {
            display: flex;
            align-items: center;
            justifyContent: space-between;
            padding: 9px 12px;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.15s ease;
            position: relative;
          }
          .auth-history-row:hover {
            background-color: ${COLORS.mutedSkyBlue};
          }
          .auth-popover-menu {
            position: absolute;
            right: 12px;
            top: 38px;
            width: 170px;
            background: var(--waskita-surface-white, #FFFFFF);
            border: 1px solid var(--waskita-border, rgba(30, 41, 59, 0.12));
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            padding: 6px;
            z-index: 50;
            display: none;
            flex-direction: column;
            gap: 2px;
          }
          .auth-popover-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            color: ${COLORS.deepSlate};
            background: transparent;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
          }
          .auth-popover-item:hover {
            background-color: ${COLORS.warmSand};
          }

          /* Checkbox to toggle item popover */
          .auth-popover-toggle:checked ~ .auth-popover-menu {
            display: flex !important;
          }
          .auth-popover-toggle:checked ~ .auth-popover-backdrop {
            display: block !important;
          }

          /* Button Analisis Baru Base & Hover Styles */
          .btn-new-analysis {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            border-radius: 12px;
            font-size: 13.5px;
            font-weight: 500;
            color: ${COLORS.deepSlate};
            cursor: pointer;
            text-align: left;
            margin-bottom: 10px;
            box-sizing: border-box;
            user-select: none;
            transition: background 0.15s ease;
            border: none;
            background-color: transparent;
          }
          .btn-new-analysis:hover {
            background-color: ${COLORS.mutedSkyBlue};
          }
          .btn-new-analysis-rail {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background-color: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: ${COLORS.deepSlate};
            transition: background 0.15s ease;
          }
          .btn-new-analysis-rail:hover {
            background-color: ${COLORS.mutedSkyBlue};
          }

          /* Active session indicator styling via external radio checks */
          #${sessionOneId}:checked ~ * .history-row-one,
          #drawer-from-1:checked ~ * .history-row-one,
          #session-one-desktop:checked ~ * .history-row-one {
            background-color: ${COLORS.warmSand} !important;
            font-weight: 700 !important;
          }
          #${sessionTwoId}:checked ~ * .history-row-two,
          #drawer-from-2:checked ~ * .history-row-two,
          #session-two-desktop:checked ~ * .history-row-two {
            background-color: ${COLORS.warmSand} !important;
            font-weight: 700 !important;
          }
          #${sessionNewId}:checked ~ * .btn-new-analysis,
          #drawer-from-new:checked ~ * .btn-new-analysis,
          #session-new-desktop:checked ~ * .btn-new-analysis {
            background-color: ${COLORS.warmSand} !important;
            font-weight: 700 !important;
          }
          #${sessionNewId}:checked ~ * .btn-new-analysis-rail,
          #drawer-from-new:checked ~ * .btn-new-analysis-rail,
          #session-new-desktop:checked ~ * .btn-new-analysis-rail {
            background-color: ${COLORS.warmSand} !important;
          }
        `}
      </style>

      {isDesktop ? (
        <>
          {/* Desktop Expanded State (280px) */}
          <div
            className="auth-sidebar-expanded-content"
            style={{
              width: "280px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Header: Toggle Menu Collapse & Logo Waskita, Search */}
            <header
              style={{
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                position: "relative",
                zIndex: 20,
                background: COLORS.warmCream,
                flexShrink: 0,
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
                  title="Ciutkan Sidebar"
                >
                  <IconMenu size={20} color={COLORS.deepSlate} />
                </label>
                <WaskitaLogo width={120} height={26} />
              </div>

              <button
                type="button"
                aria-label="Cari Riwayat"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
              >
                <IconSearch size={20} color={COLORS.deepSlate} />
              </button>
            </header>

            {/* Gradasi Transparan Bawah Header */}
            <div
              style={{
                height: "16px",
                background: `linear-gradient(to bottom, ${COLORS.warmCream} 65%, transparent 100%)`,
                position: "relative",
                zIndex: 10,
                flexShrink: 0,
                marginTop: "-1px",
              }}
            />

            {/* Konten Tengah (Scrollable Riwayat Analisis Gemini-style) */}
            <main
              style={{
                flex: 1,
                minHeight: 0,
                padding: "6px 14px 20px 14px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                boxSizing: "border-box",
              }}
            >
              {/* Tombol Analisis Baru (Membungkus Radio sessionNewId) */}
              <label
                htmlFor={sessionNewId}
                className="btn-new-analysis"
              >
                <IconSquarePen size={18} color={COLORS.deepSlate} />
                <span>Analisis Baru</span>
              </label>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.54))",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "0 8px 4px 8px",
                }}
              >
                Riwayat Analisis
              </div>

              {/* Daftar Riwayat Bersih ala Gemini */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Riwayat 1: Resep Kopi Tubruk Tradisional */}
                <div
                  className="auth-history-row history-row-one"
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type="checkbox"
                    id="popover-history-1-desktop"
                    className="auth-popover-toggle"
                    style={{ display: "none" }}
                  />

                  <label
                    htmlFor={sessionOneId}
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: COLORS.deepSlate,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "7px",
                      cursor: "pointer",
                      userSelect: "none",
                      display: "block",
                    }}
                    title="Resep Kopi Tubruk Tradisional & Takaran Pas"
                  >
                    Resep Kopi Tubruk Tradisional &amp; Takaran...
                  </label>

                  <label
                    htmlFor="popover-history-1-desktop"
                    aria-label="Opsi Riwayat"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.deepSlate,
                      borderRadius: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <IconMoreVertical size={18} color={COLORS.deepSlate} />
                  </label>

                  <label
                    htmlFor="popover-history-1-desktop"
                    className="auth-popover-backdrop"
                    style={{
                      display: "none",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 45,
                      background: "transparent",
                    }}
                  />

                  <div className="auth-popover-menu">
                    <button type="button" className="auth-popover-item">
                      <IconShare2 size={15} color={COLORS.deepSlate} />
                      <span>Share Analisis</span>
                    </button>
                    <button type="button" className="auth-popover-item">
                      <IconPin size={15} color={COLORS.deepSlate} />
                      <span>Pin</span>
                    </button>
                    <button type="button" className="auth-popover-item">
                      <IconPencil size={15} color={COLORS.deepSlate} />
                      <span>Rename</span>
                    </button>
                    <button
                      type="button"
                      className="auth-popover-item"
                      style={{ color: "#EF4444" }}
                    >
                      <IconTrash2 size={15} color="#EF4444" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Riwayat 2: Panduan Optimasi SEO Teknis Core Web Vitals */}
                <div
                  className="auth-history-row history-row-two"
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type="checkbox"
                    id="popover-history-2-desktop"
                    className="auth-popover-toggle"
                    style={{ display: "none" }}
                  />

                  <label
                    htmlFor={sessionTwoId}
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: COLORS.deepSlate,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "7px",
                      cursor: "pointer",
                      userSelect: "none",
                      display: "block",
                    }}
                    title="Panduan Optimasi SEO Teknis Core Web Vitals"
                  >
                    Panduan Optimasi SEO Teknis Core Web...
                  </label>

                  <label
                    htmlFor="popover-history-2-desktop"
                    aria-label="Opsi Riwayat"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.deepSlate,
                      borderRadius: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <IconMoreVertical size={18} color={COLORS.deepSlate} />
                  </label>

                  <label
                    htmlFor="popover-history-2-desktop"
                    className="auth-popover-backdrop"
                    style={{
                      display: "none",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 45,
                      background: "transparent",
                    }}
                  />

                  <div className="auth-popover-menu">
                    <button type="button" className="auth-popover-item">
                      <IconShare2 size={15} color={COLORS.deepSlate} />
                      <span>Share Analisis</span>
                    </button>
                    <button type="button" className="auth-popover-item">
                      <IconPin size={15} color={COLORS.deepSlate} />
                      <span>Pin</span>
                    </button>
                    <button type="button" className="auth-popover-item">
                      <IconPencil size={15} color={COLORS.deepSlate} />
                      <span>Rename</span>
                    </button>
                    <button
                      type="button"
                      className="auth-popover-item"
                      style={{ color: "#EF4444" }}
                    >
                      <IconTrash2 size={15} color="#EF4444" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Dummy Riwayat 3 s.d. 13 (Pelengkap Gemini Look & Scroll Test) */}
                {DUMMY_HISTORY_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="auth-history-row"
                    style={{
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: COLORS.deepSlate,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                        paddingRight: "7px",
                        opacity: 0.85,
                      }}
                    >
                      {item.title}
                    </span>
                    <button
                      type="button"
                      aria-label="Opsi Riwayat"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.deepSlate,
                        borderRadius: "6px",
                        flexShrink: 0,
                        opacity: 0.7,
                      }}
                    >
                      <IconMoreVertical size={18} color={COLORS.deepSlate} />
                    </button>
                  </div>
                ))}
              </div>
            </main>

            {/* Footer Sidebar: Profil Pengguna & Settings */}
            <footer
              style={{
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
                background: COLORS.warmCream,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: COLORS.mutedSkyBlue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: COLORS.deepSlate,
                    flexShrink: 0,
                  }}
                >
                  AS
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: COLORS.deepSlate,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "150px",
                    }}
                  >
                    ahmadsaifalmuflihin...
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        background: COLORS.softPeriwinkle,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        color: COLORS.deepSlate,
                      }}
                    >
                      Pro
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.68))" }}>
                      Personal Plan
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Pengaturan"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              >
                <IconSettings size={22} color={COLORS.deepSlate} />
              </button>
            </footer>
          </div>

          {/* Desktop Collapsed Mini Rail Content (68px) ala Gemini */}
          <div
            className="auth-sidebar-rail-content"
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

              {/* Analisis Baru (Mini Rail) */}
              <label
                htmlFor={sessionNewId}
                className="btn-new-analysis-rail"
                title="Analisis Baru"
              >
                <IconSquarePen size={20} color={COLORS.deepSlate} />
              </label>

              {/* Search Icon */}
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

            {/* Bottom Icons: Avatar & Settings */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: COLORS.mutedSkyBlue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                }}
                title="Profil Pengguna: ahmadsaifalmuflihin"
              >
                AS
              </div>

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
          {/* Mobile Fullscreen Drawer View (Dengan Auto-Close via HTML Labels) */}
          <header
            style={{
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              position: "relative",
              zIndex: 20,
              background: COLORS.warmCream,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <WaskitaLogo width={120} height={26} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                aria-label="Cari Riwayat"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
              >
                <IconSearch size={20} color={COLORS.deepSlate} />
              </button>

              {/* Context-aware Close X buttons for Mobile Drawer */}
              <label
                htmlFor={sessionOneId}
                className="auth-close-1"
                aria-label="Tutup Sidebar"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
                title="Tutup Sidebar"
              >
                <IconX size={22} color={COLORS.deepSlate} />
              </label>

              <label
                htmlFor={sessionTwoId}
                className="auth-close-2"
                aria-label="Tutup Sidebar"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
                title="Tutup Sidebar"
              >
                <IconX size={22} color={COLORS.deepSlate} />
              </label>

              <label
                htmlFor={sessionNewId}
                className="auth-close-new"
                aria-label="Tutup Sidebar"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                }}
                title="Tutup Sidebar"
              >
                <IconX size={22} color={COLORS.deepSlate} />
              </label>
            </div>
          </header>

          <div
            style={{
              height: "16px",
              background: `linear-gradient(to bottom, ${COLORS.warmCream} 65%, transparent 100%)`,
              position: "relative",
              zIndex: 10,
              flexShrink: 0,
              marginTop: "-1px",
            }}
          />

          <main
            style={{
              flex: 1,
              minHeight: 0,
              padding: "6px 14px 20px 14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxSizing: "border-box",
            }}
          >
            {/* Tombol Analisis Baru Mobile (Memilih sessionNewId sekaligus Auto-Close sidebar) */}
            <label
              htmlFor={sessionNewId}
              className="btn-new-analysis auth-mobile-nav-item"
            >
              <IconSquarePen size={18} color={COLORS.deepSlate} />
              <span>Analisis Baru</span>
            </label>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.54))",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "0 8px 4px 8px",
              }}
            >
              Riwayat Analisis
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {/* Riwayat 1 Mobile */}
              <div
                className="auth-history-row history-row-one"
                style={{
                  position: "relative",
                }}
              >
                <input
                  type="checkbox"
                  id="popover-history-1-mobile"
                  className="auth-popover-toggle"
                  style={{ display: "none" }}
                />

                <label
                  htmlFor={sessionOneId}
                  className="auth-mobile-nav-item"
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: COLORS.deepSlate,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingRight: "7px",
                    cursor: "pointer",
                    userSelect: "none",
                    display: "block",
                  }}
                  title="Resep Kopi Tubruk Tradisional & Takaran Pas"
                >
                  Resep Kopi Tubruk Tradisional &amp; Takaran...
                </label>

                <label
                  htmlFor="popover-history-1-mobile"
                  aria-label="Opsi Riwayat"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.deepSlate,
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                >
                  <IconMoreVertical size={18} color={COLORS.deepSlate} />
                </label>

                <label
                  htmlFor="popover-history-1-mobile"
                  className="auth-popover-backdrop"
                  style={{
                    display: "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 45,
                    background: "transparent",
                  }}
                />

                <div className="auth-popover-menu">
                  <button type="button" className="auth-popover-item">
                    <IconShare2 size={15} color={COLORS.deepSlate} />
                    <span>Share Analisis</span>
                  </button>
                  <button type="button" className="auth-popover-item">
                    <IconPin size={15} color={COLORS.deepSlate} />
                    <span>Pin</span>
                  </button>
                  <button type="button" className="auth-popover-item">
                    <IconPencil size={15} color={COLORS.deepSlate} />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    className="auth-popover-item"
                    style={{ color: "#EF4444" }}
                  >
                    <IconTrash2 size={15} color="#EF4444" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Riwayat 2 Mobile */}
              <div
                className="auth-history-row history-row-two"
                style={{
                  position: "relative",
                }}
              >
                <input
                  type="checkbox"
                  id="popover-history-2-mobile"
                  className="auth-popover-toggle"
                  style={{ display: "none" }}
                />

                <label
                  htmlFor={sessionTwoId}
                  className="auth-mobile-nav-item"
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: COLORS.deepSlate,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingRight: "7px",
                    cursor: "pointer",
                    userSelect: "none",
                    display: "block",
                  }}
                  title="Panduan Optimasi SEO Teknis Core Web Vitals"
                >
                  Panduan Optimasi SEO Teknis Core Web...
                </label>

                <label
                  htmlFor="popover-history-2-mobile"
                  aria-label="Opsi Riwayat"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.deepSlate,
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                >
                  <IconMoreVertical size={18} color={COLORS.deepSlate} />
                </label>

                <label
                  htmlFor="popover-history-2-mobile"
                  className="auth-popover-backdrop"
                  style={{
                    display: "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 45,
                    background: "transparent",
                  }}
                />

                <div className="auth-popover-menu">
                  <button type="button" className="auth-popover-item">
                    <IconShare2 size={15} color={COLORS.deepSlate} />
                    <span>Share Analisis</span>
                  </button>
                  <button type="button" className="auth-popover-item">
                    <IconPin size={15} color={COLORS.deepSlate} />
                    <span>Pin</span>
                  </button>
                  <button type="button" className="auth-popover-item">
                    <IconPencil size={15} color={COLORS.deepSlate} />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    className="auth-popover-item"
                    style={{ color: "#EF4444" }}
                  >
                    <IconTrash2 size={15} color="#EF4444" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Dummy Riwayat 3 s.d. 13 Mobile (Pelengkap Gemini Look & Scroll Test) */}
              {DUMMY_HISTORY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="auth-history-row"
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: COLORS.deepSlate,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                      paddingRight: "7px",
                      opacity: 0.85,
                    }}
                  >
                    {item.title}
                  </span>
                  <button
                    type="button"
                    aria-label="Opsi Riwayat"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.deepSlate,
                      borderRadius: "6px",
                      flexShrink: 0,
                      opacity: 0.7,
                    }}
                  >
                    <IconMoreVertical size={18} color={COLORS.deepSlate} />
                  </button>
                </div>
              ))}
            </div>
          </main>

          <footer
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
              background: COLORS.warmCream,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: COLORS.mutedSkyBlue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: COLORS.deepSlate,
                  flexShrink: 0,
                }}
              >
                AS
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: COLORS.deepSlate,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "150px",
                  }}
                >
                  ahmadsaifalmuflihin...
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      background: COLORS.softPeriwinkle,
                      padding: "1px 6px",
                      borderRadius: "4px",
                      color: COLORS.deepSlate,
                    }}
                  >
                    Pro
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.68))" }}>
                    Personal Plan
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Pengaturan"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.deepSlate,
                borderRadius: "8px",
                flexShrink: 0,
              }}
            >
              <IconSettings size={22} color={COLORS.deepSlate} />
            </button>
          </footer>
        </>
      )}
    </aside>
  );
};

export interface AuthHeaderProps {
  isDesktop?: boolean;
  sidebarToggleId: string;
  headerMenuToggleId: string;
  drawerFromOneId?: string;
  drawerFromTwoId?: string;
  drawerFromNewId?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  isDesktop = false,
  sidebarToggleId,
  headerMenuToggleId,
  drawerFromOneId,
  drawerFromTwoId,
  drawerFromNewId,
}) => {
  const menuPopover = (
    <div style={{ position: "relative" }}>
      {/* Tombol Titik Tiga Header */}
      <label
        htmlFor={headerMenuToggleId}
        aria-label="Opsi Lainnya"
        style={{
          width: isDesktop ? 36 : 40,
          height: isDesktop ? 36 : 40,
          cursor: "pointer",
          color: COLORS.deepSlate,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: isDesktop ? "rgba(30, 41, 59, 0.05)" : "transparent",
          transition: "background 0.15s ease",
        }}
        title="Opsi Lainnya"
      >
        <IconMoreVertical size={20} color={COLORS.deepSlate} />
      </label>

      {/* Backdrop untuk Menutup Menu Header */}
      <label
        htmlFor={headerMenuToggleId}
        className="auth-header-backdrop"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          background: "transparent",
        }}
      />

      {/* Dropdown Popover 7 Aksi SVG */}
      <div
        className="auth-header-popover"
        style={{
          position: "absolute",
          top: isDesktop ? 42 : 48,
          right: 0,
          width: 220,
          background: "var(--waskita-surface-white, #FFFFFF)",
          borderRadius: 14,
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${COLORS.warmSand}`,
          padding: "6px 0",
          zIndex: 50,
          display: "none",
          flexDirection: "column",
        }}
      >
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconCopy size={15} color="var(--waskita-text-muted, #64748B)" /> Salin Ringkasan Hasil
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconDownload size={15} color="var(--waskita-text-muted, #64748B)" /> Unduh Laporan (.md)
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconFileText size={15} color="var(--waskita-text-muted, #64748B)" /> Salin Teks Artikel
        </button>
        <div style={{ height: 1, background: COLORS.warmSand, margin: "4px 0" }} />
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconShare2 size={15} color="var(--waskita-text-muted, #64748B)" /> Share Analisis
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconPin size={15} color="var(--waskita-text-muted, #64748B)" /> Pin Analisis
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: COLORS.deepSlate,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconPencil size={15} color="var(--waskita-text-muted, #64748B)" /> Ganti Judul (Rename)
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "none",
            border: "none",
            fontSize: "13px",
            color: "#EF4444",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconTrash2 size={15} color="#EF4444" /> Hapus Riwayat
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "28px",
          zIndex: 35,
        }}
      >
        {menuPopover}
      </div>
    );
  }

  return (
    <header
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "relative",
        zIndex: 25,
        background: COLORS.warmCream,
        borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Context-aware Hamburger labels */}
        <label
          htmlFor={drawerFromOneId || sidebarToggleId}
          className="auth-burger-1"
          aria-label="Buka Navigasi"
          style={{
            padding: 8,
            cursor: "pointer",
            color: COLORS.deepSlate,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          <IconMenu size={22} color={COLORS.deepSlate} />
        </label>

        <label
          htmlFor={drawerFromTwoId || sidebarToggleId}
          className="auth-burger-2"
          aria-label="Buka Navigasi"
          style={{
            padding: 8,
            cursor: "pointer",
            color: COLORS.deepSlate,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          <IconMenu size={22} color={COLORS.deepSlate} />
        </label>

        <label
          htmlFor={drawerFromNewId || sidebarToggleId}
          className="auth-burger-new"
          aria-label="Buka Navigasi"
          style={{
            padding: 8,
            cursor: "pointer",
            color: COLORS.deepSlate,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          <IconMenu size={22} color={COLORS.deepSlate} />
        </label>

        <div style={{ display: "flex", alignItems: "center" }}>
          <WaskitaLogo width={124} height={26} />
        </div>
      </div>

      {menuPopover}
    </header>
  );
};

export interface FloatingComposerDockProps {
  isDesktop?: boolean;
  plusToggleId: string;
}

export const FloatingComposerDock: React.FC<FloatingComposerDockProps> = ({
  isDesktop = false,
  plusToggleId,
}) => {
  return (
    <div
      className={isDesktop ? "auth-floating-composer-dock-desktop" : "auth-floating-composer-dock-mobile"}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: isDesktop ? "16px 24px 24px 24px" : "12px 14px 16px 14px",
        background: `linear-gradient(to top, ${COLORS.warmCream} 80%, transparent 100%)`,
        zIndex: 40,
        pointerEvents: "none",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isDesktop ? "800px" : "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            background: COLORS.warmSand,
            borderRadius: 28,
            padding: "6px 8px 6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 24px rgba(30, 41, 59, 0.12)",
            pointerEvents: "auto",
            boxSizing: "border-box",
            border: "1px solid rgba(30, 41, 59, 0.06)",
            position: "relative",
          }}
        >
          {/* Tombol Plus Opsi Audit */}
          <label
            htmlFor={plusToggleId}
            aria-label="Tambah Opsi"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: COLORS.mutedSkyBlue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: COLORS.deepSlate,
            }}
            title="Opsi Audit & Masukan"
          >
            <IconPlus size={20} color={COLORS.deepSlate} />
          </label>

          {/* Input Textarea / Placeholder */}
          <textarea
            rows={1}
            placeholder="Ketik atau tempel naskah..."
            defaultValue=""
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "13.5px",
              color: COLORS.deepSlate,
              resize: "none",
              outline: "none",
              padding: "8px 0",
              fontFamily: "inherit",
            }}
          />

          {/* Tombol Kirim / Panah Kanan */}
          <button
            type="button"
            aria-label="Kirim Revisi"
            style={{
              width: 38,
              height: 38,
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
          >
            <IconArrowRight size={20} color={COLORS.deepSlate} />
          </button>
        </div>
      </div>
    </div>
  );
};
