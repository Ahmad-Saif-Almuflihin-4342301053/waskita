import React, { useRef, useState, useEffect } from "react";
import {
  COLORS,
  IconPin,
  IconPencil,
  IconTrash2,
  IconDownload,
  IconMoreVertical,
} from "../shared-ui";

export interface SidebarSessionItemProps {
  sessionId: string;
  draftTitle: string;
  isPinned?: boolean;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelect: (id: string) => void;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  onPin?: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  onExport?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const SidebarSessionItem: React.FC<SidebarSessionItemProps> = ({
  sessionId,
  draftTitle,
  isPinned = false,
  isActive,
  isMenuOpen,
  onSelect,
  onToggleMenu,
  onCloseMenu,
  onPin,
  onRename,
  onExport,
  onDelete,
}) => {
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Hitung posisi floating fixed saat menu dibuka (Anti-glitch & Anti-overflow)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isMenuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const POPUP_HEIGHT = 175; // Tinggi total popover (4 menu item + padding)
      const spaceBelow = viewportHeight - rect.bottom;
      const rightCoord = window.innerWidth - rect.right;

      // Jika ruang di bawah kurang dari 180px, buka ke atas tombol
      if (spaceBelow < 180) {
        const topCoord = Math.max(10, rect.top - POPUP_HEIGHT - 4);
        setMenuPosition({ top: topCoord, right: rightCoord });
      } else {
        setMenuPosition({ top: rect.bottom + 4, right: rightCoord });
      }
    } else {
      setMenuPosition(null);
    }
  }, [isMenuOpen]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        borderRadius: "10px",
        background: isActive ? COLORS.warmSand : "transparent",
        transition: "background 0.15s ease",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(sessionId)}
        style={{
          flex: 1,
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "8px 10px",
          fontSize: "12.5px",
          fontWeight: isActive ? 700 : 500,
          color: COLORS.deepSlate,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        title={draftTitle}
      >
        {isPinned && (
          <IconPin size={13} color="var(--waskita-emerald-accent, #059669)" style={{ flexShrink: 0 }} />
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {draftTitle}
        </span>
      </button>

      <button
        ref={menuButtonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu(sessionId);
        }}
        aria-label="Opsi Sesi"
        style={{
          background: "transparent",
          border: "none",
          padding: "6px 8px",
          cursor: "pointer",
          borderRadius: "6px",
          color: COLORS.deepSlate,
          opacity: isActive || isMenuOpen ? 1 : 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconMoreVertical size={16} color={COLORS.deepSlate} />
      </button>

      {isMenuOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onCloseMenu();
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 55,
          }}
        />
      )}

      {isMenuOpen && menuPosition && (
        <div
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            width: "180px",
            background: "var(--waskita-surface-white, #FFFFFF)",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
            border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))",
            zIndex: 70,
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onCloseMenu();
              if (onPin) onPin(sessionId);
            }}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              fontSize: "12px",
              fontWeight: 500,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.deepSlate,
            }}
          >
            <IconPin size={14} color={isPinned ? "#059669" : COLORS.deepSlate} />
            <span>{isPinned ? "Lepas Sematan (Unpin)" : "Sematkan (Pin)"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCloseMenu();
              if (onRename) onRename(sessionId, draftTitle);
            }}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              fontSize: "12px",
              fontWeight: 500,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.deepSlate,
            }}
          >
            <IconPencil size={14} color={COLORS.deepSlate} />
            <span>Ganti Nama (Rename)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCloseMenu();
              if (onExport) onExport(sessionId);
            }}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              fontSize: "12px",
              fontWeight: 500,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.deepSlate,
            }}
          >
            <IconDownload size={14} color={COLORS.deepSlate} />
            <span>Ekspor Laporan (.MD)</span>
          </button>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
              margin: "2px 0",
            }}
          />

          <button
            type="button"
            onClick={() => {
              onCloseMenu();
              if (onDelete) onDelete(sessionId);
            }}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "7px 10px",
              fontSize: "12px",
              fontWeight: 500,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#EF4444",
            }}
          >
            <IconTrash2 size={14} color="#EF4444" />
            <span>Hapus Sesi</span>
          </button>
        </div>
      )}
    </div>
  );
};
