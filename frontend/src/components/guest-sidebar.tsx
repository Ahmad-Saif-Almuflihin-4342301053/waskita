import React, { useState, useRef, useEffect } from "react";
import { MobileSettingsSheet } from "./MobileSettingsSheet";
import {
  COLORS,
  WaskitaLogo,
  IconX,
  IconSquarePen,
  IconSettings,
  IconSearch,
  IconUser,
  IconMenu,
  IconSun,
  IconMoon,
  IconLaptop,
  IconCheck,
  IconHelpCircle,
  IconChevronRight,
  IconSidebarClose,
} from "./shared-ui";
import { useTheme } from "../context/ThemeContext";

export interface GuestSidebarProps {
  isDesktop?: boolean;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  sidebarToggleId?: string;
  onSignIn?: () => void;
  onNewChat?: () => void;
  onToggleTheme?: () => void;
}

export const GuestSidebar: React.FC<GuestSidebarProps> = ({
  isDesktop = false,
  isOpen = false,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
  onSignIn,
  onNewChat,
}) => {
  const { theme, setTheme } = useTheme();
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [themeFlyoutOpen, setThemeFlyoutOpen] = useState(false);
  const [isWLogoHovered, setIsWLogoHovered] = useState(false);
  const themeFlyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settingsRef = useRef<HTMLDivElement>(null);

  const handleThemeFlyoutEnter = () => {
    if (themeFlyoutTimerRef.current) {
      clearTimeout(themeFlyoutTimerRef.current);
      themeFlyoutTimerRef.current = null;
    }
    setThemeFlyoutOpen(true);
  };

  const handleThemeFlyoutLeave = () => {
    if (themeFlyoutTimerRef.current) {
      clearTimeout(themeFlyoutTimerRef.current);
    }
    themeFlyoutTimerRef.current = setTimeout(() => {
      setThemeFlyoutOpen(false);
    }, 150);
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setSettingsPopoverOpen(false);
        setThemeFlyoutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (themeFlyoutTimerRef.current) {
        clearTimeout(themeFlyoutTimerRef.current);
      }
    };
  }, []);

  const themeOptions: Array<{ id: "system" | "light" | "dark"; label: string; icon: React.ReactNode }> = [
    { id: "system", label: "System", icon: <IconLaptop size={15} color={COLORS.deepSlate} /> },
    { id: "light", label: "Light", icon: <IconSun size={15} color={COLORS.deepSlate} /> },
    { id: "dark", label: "Dark", icon: <IconMoon size={15} color={COLORS.deepSlate} /> },
  ];

  const currentThemeIcon =
    theme === "dark" ? (
      <IconMoon size={15} color={COLORS.deepSlate} />
    ) : theme === "light" ? (
      <IconSun size={15} color={COLORS.deepSlate} />
    ) : (
      <IconLaptop size={15} color={COLORS.deepSlate} />
    );

  const basePopoverStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 70,
    width: "220px",
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
    if (isDesktop) {
      return {
        ...basePopoverStyle,
        left: "calc(100% + 8px)",
        right: "auto",
        bottom: 0,
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

  const renderSettingsPopover = (collapsed: boolean = false) => {
    const flyoutStyle: React.CSSProperties = {
      position: "absolute",
      left: "100%",
      top: "-6px",
      paddingLeft: "8px",
      zIndex: 110,
    };

    return (
      <div style={getSettingsPopoverStyle(collapsed)} onClick={(e) => e.stopPropagation()}>
        {/* 1. Baris Tema dengan Chevron & Flyout Sub-menu */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={handleThemeFlyoutEnter}
          onMouseLeave={handleThemeFlyoutLeave}
        >
          <button
            type="button"
            onClick={() => setThemeFlyoutOpen((prev) => !prev)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: themeFlyoutOpen ? "var(--waskita-card, #E9DFCA)" : "transparent",
              color: COLORS.deepSlate,
              fontSize: "12.5px",
              fontWeight: 500,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
            }}
            onMouseLeave={(e) => {
              if (!themeFlyoutOpen) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {currentThemeIcon}
              <span>Tema</span>
            </div>
            <IconChevronRight size={14} color="var(--waskita-text-muted, #64748B)" />
          </button>

          {/* Submenu Flyout Tema */}
          {themeFlyoutOpen && (
            <div
              style={flyoutStyle}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleThemeFlyoutEnter}
              onMouseLeave={handleThemeFlyoutLeave}
            >
              <div
                style={{
                  width: "160px",
                  background: "var(--waskita-surface-white, #FFFFFF)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.08)",
                  border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.14))",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {themeOptions.map((opt) => {
                  const isActive = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeFlyoutOpen(false);
                      }}
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
            </div>
          )}
        </div>

        {/* 2. Baris Bantuan & Dokumentasi */}
        <button
          type="button"
          onClick={() => {
            setSettingsPopoverOpen(false);
            setThemeFlyoutOpen(false);
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
  };

  // Jika Desktop dan dalam kondisi collapsed (Mini-Rail 68px)
  if (isDesktop && isCollapsed) {
    return (
      <aside
        className="guest-sidebar-desktop-collapsed"
        style={{
          width: "68px",
          height: "100vh",
          backgroundColor: COLORS.warmCream,
          borderRight: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 60,
          overflow: "visible",
          boxSizing: "border-box",
          padding: "12px 0",
          justifyContent: "space-between",
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
          {/* Monogram 'W' (hover berubah jadi burger IconMenu, klik untuk expand) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            onMouseEnter={() => setIsWLogoHovered(true)}
            onMouseLeave={() => setIsWLogoHovered(false)}
            aria-label="Buka Navigasi Sidebar"
            title="Buka Navigasi Sidebar"
            style={{
              width: "40px",
              height: "40px",
              background: isWLogoHovered ? "var(--waskita-card, #E9DFCA)" : "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.deepSlate,
              transition: "background 0.15s ease, transform 0.15s ease",
            }}
          >
            {isWLogoHovered ? (
              <IconMenu size={22} color={COLORS.deepSlate} />
            ) : (
              <span
                style={{
                  fontFamily: "serif",
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "var(--waskita-logo-fill, #10B981)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                W
              </span>
            )}
          </button>

          {/* Bawah 'W': Icon 'Analisis Baru' (dengan background aktif di Mode Tamu) */}
          <button
            type="button"
            onClick={onNewChat}
            aria-label="Analisis Baru"
            title="Analisis Baru"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "var(--waskita-card, #E9DFCA)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: COLORS.deepSlate,
              transition: "background 0.15s ease",
            }}
          >
            <IconSquarePen size={18} color={COLORS.deepSlate} />
          </button>
        </div>

        {/* Footer Rail: Tombol Pengaturan (IconSettings) di ATAS, dan Profil (IconUser di Tamu) di PALING BAWAH */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative" }}>
          {/* Settings Gir Mini-Rail (DI ATAS) */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setSettingsPopoverOpen((prev) => !prev)}
              title="Pengaturan"
              aria-label="Pengaturan"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: settingsPopoverOpen ? "var(--waskita-card, #E9DFCA)" : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.deepSlate,
                transition: "background 0.15s ease",
              }}
            >
              <IconSettings size={18} color={COLORS.deepSlate} />
            </button>
            {settingsPopoverOpen && renderSettingsPopover(true)}
          </div>

          {/* Profil IconUser Mini-Rail (DI PALING BAWAH) - Klik langsung memicu onSignIn */}
          <button
            type="button"
            onClick={onSignIn}
            title="Profil / Masuk"
            aria-label="Profil / Masuk"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: COLORS.softPeriwinkle,
              color: COLORS.deepSlate,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.15s ease",
            }}
          >
            <IconUser size={18} color={COLORS.deepSlate} />
          </button>
        </div>
      </aside>
    );
  }

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
          width: isDesktop ? "260px" : "100%",
          maxWidth: isDesktop ? "260px" : "100vw",
          minWidth: isDesktop ? "auto" : "100vw",
          height: isDesktop ? "100vh" : "100dvh",
          maxHeight: isDesktop ? "100vh" : "100dvh",
          backgroundColor: COLORS.warmCream,
          borderRight: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: isDesktop ? "relative" : "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 60,
          overflow: "visible",
          boxSizing: "border-box",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: !isDesktop && isOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {/* Header Sidebar: Brand (Kiri) + Search & Tutup Sidebar (Kanan) */}
        <header
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            background: COLORS.warmCream,
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
            flexShrink: 0,
          }}
        >
          {/* Logo Waskita (Kiri) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <WaskitaLogo width={124} height={26} />
          </div>

          {/* Tombol Search & Tutup/Collapse Sidebar (Kanan) */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              aria-label="Cari Sesi Analisis"
              title="Cari Sesi Analisis"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
              <IconSearch size={18} color={COLORS.deepSlate} />
            </button>

            {isDesktop ? (
              onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Tutup Navigasi Sidebar"
                  title="Tutup Navigasi Sidebar"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                  <IconSidebarClose size={18} color={COLORS.deepSlate} />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Menu"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                  color: COLORS.deepSlate,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <IconX size={18} color={COLORS.deepSlate} />
              </button>
            )}
          </div>
        </header>

        {/* Content Body: Analisis Baru & Info Masuk */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Tombol Analisis Baru: Border none, Background aktif di Guest Mode, IconSquarePen + 'Analisis Baru' */}
          <button
            type="button"
            onClick={() => {
              if (onNewChat) onNewChat();
              if (!isDesktop && onClose) onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: "pointer",
              border: "none",
              background: "var(--waskita-card, #E9DFCA)",
              transition: "background 0.15s ease, opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
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
                if (!isDesktop && onClose) onClose();
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
        </div>

        {/* Footer Sidebar: Kiri Sign In Kapsul, Kanan Ikon Pengaturan */}
        <footer
          style={{
            minHeight: isDesktop ? "64px" : "76px",
            height: isDesktop ? "64px" : "auto",
            paddingTop: isDesktop ? "0" : "10px",
            paddingBottom: isDesktop ? "0" : "max(env(safe-area-inset-bottom, 0px), 28px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "14px",
            paddingRight: "14px",
            borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
            background: COLORS.warmCream,
            flexShrink: 0,
            gap: "10px",
            position: "relative",
            overflow: "visible",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onSignIn) onSignIn();
              if (!isDesktop && onClose) onClose();
            }}
            style={{
              background: COLORS.softPeriwinkle,
              border: "none",
              borderRadius: "9999px",
              padding: "9px 22px",
              fontSize: "13px",
              fontWeight: 700,
              color: COLORS.deepSlate,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            Sign In
          </button>

          {/* Ikon Settings Trigger */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                if (!isDesktop) {
                  setMobileSettingsOpen(true);
                } else {
                  setSettingsPopoverOpen((prev) => !prev);
                }
              }}
              title="Pengaturan"
              aria-label="Pengaturan"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: settingsPopoverOpen ? "var(--waskita-card, #E9DFCA)" : "rgba(30, 41, 59, 0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.deepSlate,
                flexShrink: 0,
                transition: "background 0.15s ease",
              }}
            >
              <IconSettings size={18} color={COLORS.deepSlate} />
            </button>

            {isDesktop && settingsPopoverOpen && renderSettingsPopover(false)}
          </div>
        </footer>
      </aside>

      {/* Unified Mobile Settings & Account Sheet (Guest Mode) */}
      {!isDesktop && (
        <MobileSettingsSheet
          isOpen={mobileSettingsOpen}
          onClose={() => setMobileSettingsOpen(false)}
          isGuest={true}
          onSignIn={() => {
            setMobileSettingsOpen(false);
            if (onClose) onClose();
            if (onSignIn) onSignIn();
          }}
        />
      )}
    </>
  );
};
