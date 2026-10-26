import React, { useState, useRef } from "react";
import {
  COLORS,
  IconMenu,
  IconSquarePen,
  IconSettings,
} from "../shared-ui";
import { SidebarProfilePopover, SidebarSettingsPopover } from "./SidebarPopovers";

export interface SidebarMiniRailProps {
  userName: string;
  userPlan: string;
  isNewAnalysisActive: boolean;
  theme: "system" | "light" | "dark";
  setTheme: (t: "system" | "light" | "dark") => void;
  onToggleCollapse?: () => void;
  onNewAnalysis?: () => void;
  onSwitchAccount?: () => void;
  onSignOut?: () => void;
}

export const SidebarMiniRail: React.FC<SidebarMiniRailProps> = ({
  userName,
  userPlan,
  isNewAnalysisActive,
  theme,
  setTheme,
  onToggleCollapse,
  onNewAnalysis,
  onSwitchAccount,
  onSignOut,
}) => {
  const [isWLogoHovered, setIsWLogoHovered] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
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

  return (
    <aside
      className="auth-sidebar-desktop-collapsed"
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

        <button
          type="button"
          onClick={() => {
            if (onNewAnalysis) onNewAnalysis();
          }}
          aria-label="Analisis Baru"
          title="Analisis Baru"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: isNewAnalysisActive ? "var(--waskita-card, #E9DFCA)" : "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: COLORS.deepSlate,
            transition: "background 0.15s ease",
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
        </button>
      </div>

      {/* Footer collapsed mini-rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative" }}>
        <div ref={settingsRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setProfilePopoverOpen(false);
              setSettingsPopoverOpen((prev) => !prev);
            }}
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
          {settingsPopoverOpen && (
            <SidebarSettingsPopover
              collapsed={true}
              isDesktop={true}
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

        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setSettingsPopoverOpen(false);
              setProfilePopoverOpen((prev) => !prev);
            }}
            title={`Profil: ${userName}`}
            aria-label="Menu Profil"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: COLORS.deepSlate,
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              transition: "transform 0.15s ease",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </button>
          {profilePopoverOpen && (
            <SidebarProfilePopover
              collapsed={true}
              userName={userName}
              userPlan={userPlan}
              onClosePopover={() => setProfilePopoverOpen(false)}
              onSwitchAccount={onSwitchAccount}
              onSignOut={onSignOut}
            />
          )}
        </div>
      </div>
    </aside>
  );
};
