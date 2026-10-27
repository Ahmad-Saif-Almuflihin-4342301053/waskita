import React, { useState, useEffect, useRef } from "react";
import { MobileSettingsSheet } from "../MobileSettingsSheet";
import {
  COLORS,
  WaskitaLogo,
  IconSearch,
  IconX,
  IconSquarePen,
  IconSettings,
  IconSidebarClose,
} from "../shared-ui";
import { useTheme } from "../../context/ThemeContext";
import { SidebarProfilePopover, SidebarSettingsPopover } from "./SidebarPopovers";
import { SidebarMiniRail } from "./SidebarMiniRail";
import { SidebarSessionItem } from "./SidebarSessionItem";

export interface AuthSidebarProps {
  isDesktop?: boolean;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onOpenSettings?: () => void;
  onSwitchAccount?: () => void;
  sidebarToggleId?: string;
  activeSessionRadioName?: string;
  sessionNewId?: string;
  sessionOneId?: string;
  sessionTwoId?: string;
  sessions?: Array<{ session_id: string; draft_title: string; is_pinned?: boolean }>;
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewAnalysis?: () => void;
  onToggleTheme?: () => void;
  onSignOut?: () => void;
  onRenameSession?: (id: string, currentTitle: string) => void;
  onPinSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onExportSession?: (id: string) => void;
  userProfile?: {
    name?: string;
    email?: string;
    plan?: string;
  };
}

export const AuthSidebar: React.FC<AuthSidebarProps> = ({
  isDesktop = false,
  isOpen = false,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
  onSwitchAccount,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewAnalysis,
  onSignOut,
  onRenameSession,
  onPinSession,
  onDeleteSession,
  onExportSession,
  userProfile = {
    name: "author_demo",
    email: "author@waskita.id",
    plan: "Personal Plan",
  },
}) => {
  const { theme, setTheme } = useTheme();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [themeFlyoutOpen, setThemeFlyoutOpen] = useState(false);
  const themeFlyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
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

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfilePopoverOpen(false);
      }
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

  const handleRowClick = (sessionId: string) => {
    if (onSelectSession) onSelectSession(sessionId);
    if (!isDesktop && onClose) onClose();
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  const isNewAnalysisActive = !activeSessionId || activeSessionId === "session-new";
  const userName = userProfile.name || "author_demo";
  const userPlan = userProfile.plan || "Personal Plan";

  // Desktop Mini-Rail (Collapsed 68px)
  if (isDesktop && isCollapsed) {
    return (
      <SidebarMiniRail
        userName={userName}
        userPlan={userPlan}
        isNewAnalysisActive={isNewAnalysisActive}
        theme={theme}
        setTheme={setTheme}
        onToggleCollapse={onToggleCollapse}
        onNewAnalysis={onNewAnalysis}
        onSwitchAccount={onSwitchAccount}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <>
      {/* Mobile Backdrop Overlay Gelap */}
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
        className={isDesktop ? "auth-sidebar-desktop" : "auth-sidebar-mobile"}
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
        {/* Header Sidebar: Brand + Search & Close */}
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <WaskitaLogo width={124} height={26} />
          </div>

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

        {/* Content Body: Analisis Baru & Riwayat */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onNewAnalysis) onNewAnalysis();
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
              background: isNewAnalysisActive ? "var(--waskita-card, #E9DFCA)" : "transparent",
              transition: "background 0.15s ease, opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              if (!isNewAnalysisActive) {
                (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isNewAnalysisActive) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
          >
            <IconSquarePen size={18} color={COLORS.deepSlate} />
            <span>Analisis Baru</span>
          </button>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.54))",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "8px 6px 4px 6px",
            }}
          >
            Riwayat Sesi Percakapan
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sortedSessions.map((s) => (
              <SidebarSessionItem
                key={s.session_id}
                sessionId={s.session_id}
                draftTitle={s.draft_title}
                isPinned={s.is_pinned}
                isActive={activeSessionId === s.session_id}
                isMenuOpen={activeMenuId === s.session_id}
                onSelect={handleRowClick}
                onToggleMenu={(id) => setActiveMenuId(activeMenuId === id ? null : id)}
                onCloseMenu={() => setActiveMenuId(null)}
                onPin={onPinSession}
                onRename={onRenameSession}
                onExport={onExportSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        </div>

        {/* Footer Sidebar: Profil & Ikon Pengaturan */}
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
          <div ref={profileRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <div
              onClick={() => {
                if (!isDesktop) {
                  setMobileSettingsOpen(true);
                } else {
                  setSettingsPopoverOpen(false);
                  setProfilePopoverOpen((prev) => !prev);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: 0,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: "10px",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--waskita-card, #E9DFCA)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: COLORS.deepSlate,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {userName.charAt(0).toUpperCase()}
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
                  }}
                >
                  {userName}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#D97706",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textTransform: "uppercase",
                  }}
                >
                  {userPlan}
                </span>
              </div>
            </div>

            {isDesktop && profilePopoverOpen && (
              <SidebarProfilePopover
                collapsed={false}
                userName={userName}
                userPlan={userPlan}
                onClosePopover={() => setProfilePopoverOpen(false)}
                onSwitchAccount={onSwitchAccount}
                onSignOut={onSignOut}
              />
            )}
          </div>

          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                if (!isDesktop) {
                  setMobileSettingsOpen(true);
                } else {
                  setProfilePopoverOpen(false);
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

            {isDesktop && settingsPopoverOpen && (
              <SidebarSettingsPopover
                collapsed={false}
                isDesktop={isDesktop}
                theme={theme}
                setTheme={setTheme}
                themeFlyoutOpen={themeFlyoutOpen}
                setThemeFlyoutOpen={setThemeFlyoutOpen}
                onThemeFlyoutEnter={handleThemeFlyoutEnter}
                onThemeFlyoutLeave={handleThemeFlyoutLeave}
                onClosePopover={() => {
                  setSettingsPopoverOpen(false);
                  setThemeFlyoutOpen(false);
                }}
              />
            )}
          </div>
        </footer>
      </aside>

      {/* Unified Mobile Settings & Account Sheet */}
      {!isDesktop && (
        <MobileSettingsSheet
          isOpen={mobileSettingsOpen}
          onClose={() => setMobileSettingsOpen(false)}
          isGuest={false}
          userProfile={userProfile}
          onSignOut={() => {
            setMobileSettingsOpen(false);
            if (onClose) onClose();
            if (onSignOut) onSignOut();
          }}
          onSwitchAccount={() => {
            setMobileSettingsOpen(false);
            if (onClose) onClose();
            if (onSwitchAccount) onSwitchAccount();
          }}
        />
      )}
    </>
  );
};
