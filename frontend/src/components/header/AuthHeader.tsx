import React, { useState } from "react";
import {
  COLORS,
  WaskitaLogo,
  IconMenu,
  IconMoreVertical,
  IconSquarePen,
  IconShare2,
  IconPin,
  IconPencil,
  IconTrash2,
  IconSparkles,
  IconFileText,
} from "../shared-ui";

export interface AuthHeaderProps {
  isDesktop?: boolean;
  isSidebarCollapsed?: boolean;
  hasActiveSession?: boolean;
  onOpenSidebar?: () => void;
  onToggleSidebar?: () => void;
  onNewAnalysis?: () => void;
  onCopyRemediationPrompt?: () => void;
  onCopySummary?: () => void;
  onDownloadReport?: () => void;
  onCopyDraft?: () => void;
  onShare?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  onRename?: () => void;
  onDelete?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  isDesktop = false,
  hasActiveSession = false,
  onOpenSidebar,
  onNewAnalysis,
  onCopyRemediationPrompt,
  onCopySummary,
  onShare,
  onPin,
  isPinned = false,
  onRename,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuPopover = hasActiveSession ? (
    <div style={{ position: "relative" }}>
      {/* Tombol Titik Tiga Header */}
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
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
          border: "none",
          background: isDesktop ? "rgba(30, 41, 59, 0.05)" : "transparent",
          transition: "background 0.15s ease",
        }}
        title="Opsi Lainnya"
      >
        <IconMoreVertical size={20} color={COLORS.deepSlate} />
      </button>

      {/* Backdrop untuk Menutup Menu Header */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
        />
      )}

      {/* Dropdown Popover */}
      {isMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: isDesktop ? 42 : 48,
            right: 0,
            width: 230,
            background: "var(--waskita-surface, var(--waskita-surface-white, #FFFFFF))",
            color: "var(--waskita-text, #1E293B)",
            borderRadius: 14,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))",
            zIndex: 50,
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 1. Salin Prompt Rekomendasi */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onCopyRemediationPrompt) onCopyRemediationPrompt();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--waskita-card, rgba(30, 41, 59, 0.06))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconSparkles size={15} color="var(--waskita-emerald-accent, #059669)" /> Salin Prompt Rekomendasi
          </button>

          {/* 2. Salin Ringkasan Evaluasi */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onCopySummary) onCopySummary();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--waskita-card, rgba(30, 41, 59, 0.06))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconFileText size={15} color="var(--waskita-text-muted, #64748B)" /> Salin Ringkasan Evaluasi
          </button>

          {/* 3. Bagikan Analisis */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onShare) onShare();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--waskita-card, rgba(30, 41, 59, 0.06))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconShare2 size={15} color="var(--waskita-text-muted, #64748B)" /> Bagikan Analisis
          </button>

          {/* 4. Sematkan Analisis / Lepas Sematan */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onPin) onPin();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: isPinned ? "#059669" : "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--waskita-card, rgba(30, 41, 59, 0.06))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconPin size={15} color={isPinned ? "#059669" : "var(--waskita-text-muted, #64748B)"} />{" "}
            {isPinned ? "Lepas Sematan (Unpin)" : "Sematkan Analisis"}
          </button>

          {/* 5. Ganti Judul */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onRename) onRename();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--waskita-card, rgba(30, 41, 59, 0.06))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconPencil size={15} color="var(--waskita-text-muted, #64748B)" /> Ganti Judul
          </button>

          {/* 6. Garis divider tipis */}
          <div
            style={{
              borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
              margin: "4px 0",
            }}
          />

          {/* 7. Hapus Riwayat */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onDelete) onDelete();
            }}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <IconTrash2 size={15} color="#EF4444" /> Hapus Riwayat
          </button>
        </div>
      )}
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 28px 0 20px",
          zIndex: 35,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          {menuPopover}
        </div>
      </header>
    );
  }

  // Mobile Header
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
        background: "var(--waskita-bg, #F7F4EB)",
        borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka Navigasi"
          style={{
            padding: 8,
            cursor: "pointer",
            background: "transparent",
            border: "none",
            color: COLORS.deepSlate,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          <IconMenu size={22} color={COLORS.deepSlate} />
        </button>

        <div style={{ display: "flex", alignItems: "center" }}>
          <WaskitaLogo width={124} height={26} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {onNewAnalysis && (
          <button
            type="button"
            onClick={onNewAnalysis}
            aria-label="Analisis Baru"
            title="Analisis Baru"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.deepSlate,
              cursor: "pointer",
            }}
          >
            <IconSquarePen size={20} color={COLORS.deepSlate} />
          </button>
        )}
        {menuPopover}
      </div>
    </header>
  );
};
