import React from "react";
import {
  COLORS,
  IconUsers,
  IconLogOut,
  IconLaptop,
  IconSun,
  IconMoon,
  IconChevronRight,
  IconCheck,
  IconHelpCircle,
} from "../shared-ui";

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

export interface SidebarProfilePopoverProps {
  collapsed?: boolean;
  userName: string;
  userPlan: string;
  onClosePopover: () => void;
  onSwitchAccount?: () => void;
  onSignOut?: () => void;
}

export const SidebarProfilePopover: React.FC<SidebarProfilePopoverProps> = ({
  collapsed = false,
  userName,
  userPlan,
  onClosePopover,
  onSwitchAccount,
  onSignOut,
}) => {
  const style: React.CSSProperties = collapsed
    ? {
        ...basePopoverStyle,
        left: "68px",
        right: "auto",
        bottom: "12px",
        zIndex: 100,
      }
    : {
        ...basePopoverStyle,
        left: 0,
        right: "auto",
        bottom: "calc(100% + 8px)",
        zIndex: 70,
      };

  return (
    <div style={style} onClick={(e) => e.stopPropagation()}>
      {/* Kartu Profil Pengguna */}
      <div
        style={{
          padding: "10px 12px",
          background: "var(--waskita-card, #E9DFCA)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
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
          </div>
          <div style={{ marginTop: "3px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                background: "rgba(217, 119, 6, 0.15)",
                color: "#D97706",
                padding: "2px 7px",
                borderRadius: "10px",
                letterSpacing: "0.04em",
                display: "inline-block",
              }}
            >
              {userPlan}
            </span>
          </div>
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          margin: "4px 0",
        }}
      />

      {/* Opsi Ganti Akun */}
      <button
        type="button"
        onClick={() => {
          onClosePopover();
          if (onSwitchAccount) {
            onSwitchAccount();
          } else if (onSignOut) {
            onSignOut();
          }
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
        <IconUsers size={16} color={COLORS.deepSlate} />
        <span>Ganti Akun</span>
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={() => {
          onClosePopover();
          if (onSignOut) onSignOut();
        }}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderRadius: "8px",
          padding: "8px 10px",
          fontSize: "12.5px",
          fontWeight: 600,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#EF4444",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <IconLogOut size={16} color="#EF4444" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export interface SidebarSettingsPopoverProps {
  collapsed?: boolean;
  isDesktop?: boolean;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
  themeFlyoutOpen: boolean;
  setThemeFlyoutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onThemeFlyoutEnter: () => void;
  onThemeFlyoutLeave: () => void;
  onClosePopover: () => void;
}

export const SidebarSettingsPopover: React.FC<SidebarSettingsPopoverProps> = ({
  collapsed = false,
  isDesktop = false,
  theme,
  setTheme,
  themeFlyoutOpen,
  setThemeFlyoutOpen,
  onThemeFlyoutEnter,
  onThemeFlyoutLeave,
  onClosePopover,
}) => {
  const getSettingsPopoverStyle = (): React.CSSProperties => {
    if (collapsed) {
      return {
        ...basePopoverStyle,
        width: "220px",
        left: "68px",
        right: "auto",
        bottom: "12px",
        zIndex: 100,
      };
    }
    if (isDesktop) {
      return {
        ...basePopoverStyle,
        width: "220px",
        left: "calc(100% + 8px)",
        right: "auto",
        bottom: 0,
        zIndex: 100,
      };
    }
    return {
      ...basePopoverStyle,
      width: "220px",
      right: 0,
      left: "auto",
      bottom: "calc(100% + 8px)",
      zIndex: 70,
    };
  };

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

  const flyoutStyle: React.CSSProperties = {
    position: "absolute",
    left: "100%",
    top: "-6px",
    paddingLeft: "8px",
    zIndex: 110,
  };

  return (
    <div style={getSettingsPopoverStyle()} onClick={(e) => e.stopPropagation()}>
      {/* 1. Baris Tema dengan Chevron & Flyout Sub-menu */}
      <div
        style={{ position: "relative" }}
        onMouseEnter={onThemeFlyoutEnter}
        onMouseLeave={onThemeFlyoutLeave}
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

        {/* Submenu Flyout Tema with transparent bridge */}
        {themeFlyoutOpen && (
          <div
            style={flyoutStyle}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={onThemeFlyoutEnter}
            onMouseLeave={onThemeFlyoutLeave}
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
          onClosePopover();
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
