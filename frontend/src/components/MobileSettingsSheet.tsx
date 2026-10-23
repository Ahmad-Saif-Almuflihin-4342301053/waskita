import React, { useState } from "react";
import {
  COLORS, IconX, IconCheck, IconLaptop, IconSun, IconMoon,
  IconHelpCircle, IconUsers, IconLogOut, IconChevronDown, IconChevronRight, IconUser, IconPencil
} from "./shared-ui";
import { useTheme } from "../context/ThemeContext";

export interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isGuest?: boolean;
  userProfile?: { name?: string; email?: string; plan?: string };
  onSignIn?: () => void;
  onSignOut?: () => void;
  onSwitchAccount?: () => void;
}

export const MobileSettingsSheet: React.FC<MobileSettingsSheetProps> = ({
  isOpen, onClose, isGuest = false,
  userProfile = { name: "author_demo", email: "author@waskita.id", plan: "Personal Plan" },
  onSignIn, onSignOut, onSwitchAccount,
}) => {
  const { theme, setTheme } = useTheme();
  const [accountAccordionOpen, setAccountAccordionOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  if (!isOpen) return null;

  const userName = userProfile.name || "author_demo";
  const userEmail = userProfile.email || "author@waskita.id";
  const userPlan = userProfile.plan || "Personal Plan";

  const themeOptions: Array<{ id: "system" | "light" | "dark"; label: string; icon: React.ReactNode }> = [
    { id: "system", label: "Sistem", icon: <IconLaptop size={18} color={COLORS.deepSlate} /> },
    { id: "light", label: "Terang", icon: <IconSun size={18} color={COLORS.deepSlate} /> },
    { id: "dark", label: "Gelap", icon: <IconMoon size={18} color={COLORS.deepSlate} /> },
  ];

  const currentThemeLabel = theme === "dark" ? "Gelap" : theme === "light" ? "Terang" : "Sistem";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--waskita-bg, #FBF7EE)", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box", paddingBottom: "max(env(safe-area-inset-bottom, 0px), 28px)" }}>
      {/* Header Sheet: Tombol Silang (X) di kanan atas */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 20px 12px", flexShrink: 0 }}>
        <button type="button" onClick={onClose} aria-label="Tutup Pengaturan" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "none", background: "var(--waskita-surface, rgba(30, 41, 59, 0.06))", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.deepSlate }}>
          <IconX size={20} color={COLORS.deepSlate} />
        </button>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: "18px", maxWidth: "500px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {/* Zona 1: Area Akun (Atas) */}
        {!isGuest ? (
          <div style={{ borderRadius: "20px", background: "var(--waskita-card, #E9DFCA)", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div onClick={() => setAccountAccordionOpen((prev) => !prev)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "var(--waskita-text, #1E293B)", color: "var(--waskita-bg, #FFFFFF)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px" }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--waskita-surface-white, #FFFFFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                    <IconPencil size={11} color={COLORS.deepSlate} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: COLORS.deepSlate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "9999px", background: COLORS.softPeriwinkle, color: "#0F172A", letterSpacing: "0.04em" }}>{userPlan.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.7))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>{userEmail}</span>
                </div>
              </div>
              <div style={{ padding: "6px", borderRadius: "50%", color: COLORS.deepSlate, display: "flex", alignItems: "center", justifyContent: "center", transform: accountAccordionOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>
                <IconChevronDown size={18} color={COLORS.deepSlate} />
              </div>
            </div>

            {accountAccordionOpen && (
              <div style={{ borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <button type="button" onClick={() => { onClose(); if (onSwitchAccount) onSwitchAccount(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", border: "none", background: "var(--waskita-surface-white, rgba(255, 255, 255, 0.6))", color: COLORS.deepSlate, fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <IconUsers size={16} color={COLORS.deepSlate} />
                  <span>Ganti Akun</span>
                </button>
                <button type="button" onClick={() => { onClose(); if (onSignOut) onSignOut(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", border: "none", background: "rgba(239, 68, 68, 0.08)", color: "#EF4444", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <IconLogOut size={16} color="#EF4444" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ borderRadius: "20px", background: "var(--waskita-card, #E9DFCA)", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: COLORS.softPeriwinkle, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.deepSlate, flexShrink: 0 }}>
                <IconUser size={22} color={COLORS.deepSlate} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: COLORS.deepSlate }}>Mode Penjelajah Tamu</span>
                <span style={{ fontSize: "12px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.75))", marginTop: "2px" }}>
                  Masuk untuk menyimpan riwayat analisis dan akses fitur lengkap
                </span>
              </div>
            </div>
            <button type="button" onClick={() => { onClose(); if (onSignIn) onSignIn(); }} style={{ width: "100%", padding: "12px 20px", borderRadius: "9999px", border: "none", background: COLORS.softPeriwinkle, color: COLORS.deepSlate, fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              Masuk / Sign In
            </button>
          </div>
        )}

        {/* Zona 2: Area Pengaturan & Preferensi (Bawah) */}
        <div style={{ borderRadius: "20px", background: "var(--waskita-surface, #1A2436)", border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))", padding: "8px 14px", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          {/* Menu 'Tema' (ON-TAP / ON-CLICK) */}
          <div style={{ borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))" }}>
            <div onClick={() => setThemePickerOpen((prev) => !prev)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 6px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>🌓</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: COLORS.deepSlate }}>Tema</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.6))", fontWeight: 500 }}>{currentThemeLabel}</span>
                <div style={{ transform: themePickerOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease", display: "flex", alignItems: "center" }}>
                  <IconChevronRight size={16} color={COLORS.deepSlate} />
                </div>
              </div>
            </div>

            {themePickerOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "4px 0 12px 0" }}>
                {themeOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button key={opt.id} type="button" onClick={() => setTheme(opt.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "12px", border: "none", background: isSelected ? "var(--waskita-audit-bg, rgba(255, 255, 255, 0.08))" : "transparent", color: COLORS.deepSlate, fontSize: "13.5px", fontWeight: isSelected ? 700 : 500, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <IconCheck size={18} color="var(--waskita-emerald-accent, #059669)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Menu 'Bantuan & Dokumentasi' */}
          <div onClick={() => window.open("https://github.com/Ahmad-Saif-Almuflihin-4342301053/waskita#readme", "_blank")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 6px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconHelpCircle size={18} color={COLORS.deepSlate} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: COLORS.deepSlate }}>Bantuan & Dokumentasi</span>
            </div>
            <IconChevronRight size={16} color={COLORS.deepSlate} />
          </div>
        </div>

        {/* Identitas Footer Aplikasi */}
        <div style={{ textAlign: "center", marginTop: "auto", padding: "20px 10px 10px", fontSize: "11px", fontWeight: 500, color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.45))", lineHeight: 1.5 }}>
          Waskita v1.1.5 (Pre-Publishing Inspection) — TRPL Polibatam
        </div>
      </main>
    </div>
  );
};
