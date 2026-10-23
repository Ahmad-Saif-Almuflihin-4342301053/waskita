import React, { useState, useRef, useEffect } from "react";
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
  IconSun,
  IconMoon,
  IconLaptop,
  IconCheck,
  IconHelpCircle,
} from "./shared-ui";
import { useTheme } from "../context/ThemeContext";

export interface GuestSidebarProps {
  isDesktop?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  sidebarToggleId?: string;
  onSignIn?: () => void;
  onNewChat?: () => void;
  onToggleTheme?: () => void;
}

export const GuestSidebar: React.FC<GuestSidebarProps> = ({
  isDesktop = false,
  isOpen = false,
  onClose,
  sidebarToggleId,
  onSignIn,
  onNewChat,
  onToggleTheme,
}) => {
  const { theme, setTheme } = useTheme();
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setSettingsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: Array<{ id: "system" | "light" | "dark"; label: string; icon: React.ReactNode }> = [
    { id: "system", label: "System", icon: <IconLaptop size={15} color={COLORS.deepSlate} /> },
    { id: "light", label: "Light", icon: <IconSun size={15} color={COLORS.deepSlate} /> },
    { id: "dark", label: "Dark", icon: <IconMoon size={15} color={COLORS.deepSlate} /> },
  ];

  const basePopoverStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 70,
    width: "240px",
    background: "var(--waskita-surface-white, #FFFFFF)",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.08)",
    border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.14))",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    boxSizing: "border-box",
  };

  const getSettingsPopoverStyle = (collapsed: boolean): React.CSSProperties => {
    if (collapsed) {
      return {
        ...basePopoverStyle,
        left: "68px",
        right: "auto",
        bottom: "12px",
        zIndex: 100,
      };
    }
    return {
      ...basePopoverStyle,
      right: 0,
      left: "auto",
      bottom: "calc(100% + 8px)",
      zIndex: 70,
    };
  };

  const renderSettingsPopover = (collapsed: boolean = false) => (
    <div style={getSettingsPopoverStyle(collapsed)} onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          padding: "6px 8px 4px 8px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--waskita-text-muted, #64748B)",
        }}
      >
        Tema Aplikasi
      </div>

      {/* Menu Tema Vertikal ala Gemini Resmi dengan Centang ✓ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          padding: "2px 0",
        }}
      >
        {themeOptions.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--waskita-card, #E9DFCA)" : "transparent",
                color: COLORS.deepSlate,
                fontSize: "12.5px",
                fontWeight: isActive ? 700 : 500,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              {isActive && (
                <IconCheck size={16} color="var(--waskita-emerald-accent, #059669)" />
              )}
            </button>
          );
        })}
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          margin: "4px 0",
        }}
      />

      {/* Menu Bantuan */}
      <button
        type="button"
        onClick={() => {
          setSettingsPopoverOpen(false);
          window.open("https://github.com/Ahmad-Saif-Almuflihin-4342301053/waskita#readme", "_blank");
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "12.5px",
          fontWeight: 500,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: COLORS.deepSlate,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <IconHelpCircle size={16} color={COLORS.deepSlate} />
        <span>Bantuan & Dokumentasi</span>
      </button>
    </div>
  );

  return (
    <>
      {!isDesktop && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(30, 41, 59, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 55,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />
      )}

      <aside
        className={isDesktop ? "guest-sidebar-desktop" : "guest-sidebar-mobile"}
        style={{
          width: isDesktop ? "280px" : "280px",
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
          right: isDesktop ? "auto" : "auto",
          zIndex: 60,
          borderRight: isDesktop ? `1px solid ${COLORS.warmSand}` : "none",
          boxSizing: "border-box",
          overflow: "visible",
          flexShrink: 0,
          transition: isDesktop
            ? "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
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
              overflow: "visible",
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
              {/* Tombol Analisis Baru (IconSquarePen) - transparan secara default */}
              <button
                type="button"
                onClick={onNewChat}
                style={{
                  width: "100%",
                  background: "transparent",
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
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <IconSquarePen size={18} color={COLORS.deepSlate} />
                <span>Analisis Baru</span>
              </button>

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
                  onClick={onSignIn}
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
                position: "relative",
                overflow: "visible",
              }}
            >
              <button
                type="button"
                onClick={onSignIn}
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

              <div ref={settingsRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  aria-label="Pengaturan / Ganti Tema"
                  onClick={() => setSettingsPopoverOpen((prev) => !prev)}
                  style={{
                    background: settingsPopoverOpen ? "var(--waskita-card, #E9DFCA)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.deepSlate,
                    borderRadius: "8px",
                    transition: "background 0.15s ease",
                  }}
                  title="Pengaturan"
                >
                  <IconSettings size={22} color={COLORS.deepSlate} />
                </button>
                {settingsPopoverOpen && renderSettingsPopover(false)}
              </div>
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
              overflow: "visible",
              position: "relative",
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
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                title="Analisis Baru"
                onClick={onNewChat}
              >
                <IconSquarePen size={20} color={COLORS.deepSlate} />
              </button>

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

            {/* Bottom Icons (Mini-Rail Urutan: Pengaturan di ATAS, Profil di PALING BAWAH ala Gemini) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", position: "relative" }}>
              {/* Settings Mini-Rail */}
              <div ref={settingsRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setSettingsPopoverOpen((prev) => !prev)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: settingsPopoverOpen ? "var(--waskita-card, #E9DFCA)" : "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: COLORS.deepSlate,
                    transition: "background 0.15s ease",
                  }}
                  title="Pengaturan"
                >
                  <IconSettings size={20} color={COLORS.deepSlate} />
                </button>
                {settingsPopoverOpen && renderSettingsPopover(true)}
              </div>

              {/* Avatar Profil Mini-Rail (Paling Bawah) */}
              <button
                type="button"
                onClick={onSignIn}
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

            <button
              type="button"
              onClick={onClose}
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
            </button>
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
            <button
              type="button"
              onClick={() => {
                if (onNewChat) onNewChat();
                if (onClose) onClose();
              }}
              style={{
                width: "100%",
                background: "transparent",
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
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <IconSquarePen size={18} color={COLORS.deepSlate} />
              <span>Analisis Baru</span>
            </button>

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
                onClick={() => {
                  if (onSignIn) onSignIn();
                  if (onClose) onClose();
                }}
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
              position: "relative",
              overflow: "visible",
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onSignIn) onSignIn();
                if (onClose) onClose();
              }}
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

            <div ref={settingsRef} style={{ position: "relative" }}>
              <button
                type="button"
                aria-label="Pengaturan / Ganti Tema"
                onClick={() => setSettingsPopoverOpen((prev) => !prev)}
                style={{
                  background: settingsPopoverOpen ? "var(--waskita-card, #E9DFCA)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                  borderRadius: "8px",
                  transition: "background 0.15s ease",
                }}
                title="Pengaturan"
              >
                <IconSettings size={22} color={COLORS.deepSlate} />
              </button>
              {settingsPopoverOpen && renderSettingsPopover(false)}
            </div>
          </footer>
        </>
      )}
    </aside>
  </>
  );
};
