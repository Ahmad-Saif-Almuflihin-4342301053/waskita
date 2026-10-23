import React, { useState } from "react";
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
  IconDownload,
  IconSettings,
} from "./shared-ui";
import { countPureWords, extractSmartKeyword, sanitizePastedOrUploadedDraft } from "../utils/draftSanitizer";

export const SAMPLE_DRAFTS = {
  revisionNeeded: {
    title: "Resep Kopi Tubruk Tradisional & Takaran Pas",
    query: "resep kopi tubruk tradisional",
    text: `Resep Kopi Tubruk Tradisional dan Takaran Pas

Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring sama sekali. Banyak orang menyukai kopi tubruk karena aromanya yang pekat dan cara pembuatannya yang sangat mudah sekali untuk dipraktikkan di rumah.

Dalam menyeduh kopi tubruk, kita hanya perlu menuangkan air mendidih ke dalam cangkir yang sudah berisi bubuk kopi. Kopi tubruk ini sangat cocok dinikmati pada pagi hari saat suasana masih tenang atau sore hari bersama teman sejawat. Kopi tubruk memiliki sejarah panjang dalam tradisi masyarakat Nusantara, terutama di pulau Jawa dan Bali.

Banyak penikmat kopi yang menganggap bahwa cara membuat kopi tubruk tanpa ampas naik ke permukaan dan langkah mudah menyeduhnya dengan air mendidih merupakan keterampilan mendasar. Namun seringkali rasa kopi menjadi terlalu pahit atau terlalu hambar karena takaran yang tidak diperhatikan dengan teliti.

Untuk membuat seduhan yang pas, pilihlah bubuk kopi yang masih segar. Kopi tubruk yang enak membutuhkan perpaduan antara kehangatan air dan kepekatan bubuk kopi. Jika air terlalu dingin, sari kopi tidak akan keluar sempurna. Sebaliknya jika air terlalu panas mendidih bergolak, rasa gosong akan mendominasi seduhan.

Nikmatilah setiap tegukan kopi tubruk dengan perlahan sambil menunggu ampasnya mengendap di dasar cangkir. Tradisi minum kopi tubruk mengajarkan kita tentang kesabaran dan menikmati proses dalam setiap sajian yang bersahaja. Selalu gunakan cangkir keramik tebal agar suhu kopi bertahan lebih lama saat dinikmati bersama biskuit atau pisang goreng hangat di beranda rumah Anda setiap pagi.`,
  },
  approvedReady: {
    title: "Eksplorasi Robusta Dampit: Resep Kopi Tubruk Otentik Rasio 1:15",
    query: "resep kopi tubruk tradisional",
    text: `Eksplorasi Robusta Dampit: Resep Kopi Tubruk Otentik Rasio 1:15

Menikmati seduhan kopi tubruk sejatinya merayakan kesederhanaan rasa yang jujur tanpa intervensi saringan mekanis kertas maupun kain. Menggunakan biji Robusta Dampit asal lereng Gunung Semeru Jawa Timur, seduhan ini menawarkan kekayaan profil rasa cokelat pekat (dark cocoa) dengan sentuhan rasa rempah karamel yang tegas dan body yang luar biasa tebal di lidah.

Kunci utama ekstraksi optimal terletak pada presisi parameter seduh:
1. Rasio Seduh 1:15 (15 gram bubuk gilingan medium-fine berbanding 225 ml air bersuhu stabil 92°C).
2. Fase Blooming: Tuangkan 45 ml air panas pertama dan biarkan mekar selama 30 detik untuk melepaskan gas karbon dioksida secara merata.
3. Tuangan Utama: Lanjutkan penuangan sisa air hingga 225 ml dengan gerakan melingkar perlahan dari pusat ke tepi cangkir.

Trik krusial agar ampas cepat mengendap sempurna tanpa sensasi berpasir di lidah adalah mengaduk permukaan seduhan sebanyak 3 putaran searah jarum jam pada menit ke-4, lalu membiarkannya diam selama dua menit. Tambahan pemanis berupa gula aren organik cair lokal memberikan lapisan sensasi karamel alami yang harmonis tanpa menenggelamkan karakter asli biji kopi.

Kombinasi ketepatan temperatur air 92°C, kontrol rasio air, dan waktu jeda pengendapan ini membuktikan bahwa metode tradisional tubruk mampu menghasilkan cangkir seduhan berkelas setara standar cupping profesional spesialisasi kopi modern.`,
  },
};

export interface AuthSidebarProps {
  isDesktop?: boolean;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onOpenSettings?: () => void;
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
  onOpenSettings,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewAnalysis,
  onToggleTheme,
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleRowClick = (sessionId: string) => {
    if (onSelectSession) onSelectSession(sessionId);
    if (!isDesktop && onClose) onClose();
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  const userName = userProfile.name || "author_demo";
  const userEmail = userProfile.email || "author@waskita.id";

  // Jika desktop dan dalam kondisi collapsed
  if (isDesktop && isCollapsed) {
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
          zIndex: 20,
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
            aria-label="Buka Navigasi Sidebar"
            title="Buka Sidebar"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.deepSlate,
            }}
          >
            <IconMenu size={20} color={COLORS.deepSlate} />
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
              borderRadius: "14px",
              background: COLORS.warmSand,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: COLORS.deepSlate,
              transition: "opacity 0.15s ease",
            }}
          >
            <IconSquarePen size={18} color={COLORS.deepSlate} />
          </button>
        </div>

        {/* Footer collapsed mini-rail */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={onOpenSettings}
            title="Pengaturan"
            aria-label="Pengaturan"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "transparent",
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
        </div>
      </aside>
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
            zIndex: 44,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />
      )}

      <aside
        className={isDesktop ? "auth-sidebar-desktop" : "auth-sidebar-mobile"}
        style={{
          width: isDesktop ? "280px" : "280px",
          height: "100vh",
          backgroundColor: COLORS.warmCream,
          borderRight: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: isDesktop ? "relative" : "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: isDesktop ? 20 : 45,
          boxSizing: "border-box",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow: !isDesktop && isOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {/* Header Sidebar: Brand + Close/New Button */}
        <header
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: COLORS.warmCream,
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isDesktop && onToggleCollapse && (
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
                }}
              >
                <IconMenu size={20} color={COLORS.deepSlate} />
              </button>
            )}
            <WaskitaLogo width={124} height={26} />
          </div>

          {!isDesktop && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Menu"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: "8px",
                color: COLORS.deepSlate,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={20} color={COLORS.deepSlate} />
            </button>
          )}
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
          {/* Tombol Analisis Baru */}
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
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: "pointer",
              border: "none",
              background: COLORS.warmSand,
              transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
          >
            <IconSquarePen size={18} color={COLORS.deepSlate} />
            <span>+ Analisis Baru</span>
          </button>

          {/* Label Header Riwayat */}
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

          {/* Daftar Riwayat Sesi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sortedSessions.map((s) => {
              const isActive = activeSessionId === s.session_id;
              const isMenuOpen = activeMenuId === s.session_id;

              return (
                <div
                  key={s.session_id}
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
                    onClick={() => handleRowClick(s.session_id)}
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
                    title={s.draft_title}
                  >
                    {s.is_pinned && <span style={{ fontSize: "11px" }}>📌</span>}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.draft_title}
                    </span>
                  </button>

                  {/* Tombol Titik Tiga (⋮) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : s.session_id);
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

                  {/* Backdrop Penutup Menu Titik Tiga */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
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

                  {/* Dropdown Menu Aksi Titik Tiga */}
                  {isMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: "4px",
                        width: "180px",
                        background: "var(--waskita-surface-white, #FFFFFF)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                        border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))",
                        zIndex: 60,
                        padding: "6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          if (onPinSession) onPinSession(s.session_id);
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
                        <IconPin size={14} color={s.is_pinned ? "#059669" : COLORS.deepSlate} />
                        <span>{s.is_pinned ? "Lepas Sematan (Unpin)" : "Sematkan (Pin)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          if (onRenameSession) onRenameSession(s.session_id, s.draft_title);
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
                          setActiveMenuId(null);
                          if (onExportSession) onExportSession(s.session_id);
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
                          setActiveMenuId(null);
                          if (onDeleteSession) onDeleteSession(s.session_id);
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
            })}
          </div>
        </div>

        {/* Footer Sidebar: Profil Ringkas & Ikon Pengaturan */}
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
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: 0,
              flex: 1,
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
                  fontSize: "11px",
                  color: "var(--waskita-text-muted, #64748B)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userEmail}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Pengaturan"
            aria-label="Pengaturan"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(30, 41, 59, 0.06)",
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
        </footer>
      </aside>
    </>
  );
};

export interface AuthHeaderProps {
  isDesktop?: boolean;
  isSidebarCollapsed?: boolean;
  onOpenSidebar?: () => void;
  onToggleSidebar?: () => void;
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
  isSidebarCollapsed = false,
  onOpenSidebar,
  onToggleSidebar,
  onCopySummary,
  onDownloadReport,
  onCopyDraft,
  onShare,
  onPin,
  isPinned = false,
  onRename,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuPopover = (
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
            width: 220,
            background: "var(--waskita-surface-white, #FFFFFF)",
            borderRadius: 14,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.12))",
            zIndex: 50,
            padding: "8px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
              color: COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>📋</span> Salin Ringkasan
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onDownloadReport) onDownloadReport();
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
              color: COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconDownload size={15} color="var(--waskita-text-muted, #64748B)" /> Unduh Laporan (.md)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onCopyDraft) onCopyDraft();
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
              color: COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>📄</span> Salin Naskah Draf
          </button>
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
              color: COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconShare2 size={15} color="var(--waskita-text-muted, #64748B)" /> Share Analisis
          </button>
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
              color: isPinned ? "#059669" : COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconPin size={15} color={isPinned ? "#059669" : "var(--waskita-text-muted, #64748B)"} />{" "}
            {isPinned ? "Unpin Analisis" : "Pin Analisis"}
          </button>
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
              color: COLORS.deepSlate,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconPencil size={15} color="var(--waskita-text-muted, #64748B)" /> Ganti Judul (Rename)
          </button>
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
          >
            <IconTrash2 size={15} color="#EF4444" /> Hapus Riwayat
          </button>
        </div>
      )}
    </div>
  );

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
          justifyContent: "space-between",
          padding: "0 28px 0 20px",
          zIndex: 35,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center" }}>
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Buka Sidebar Navigasi"
              title="Buka Navigasi Sidebar"
              style={{
                width: 36,
                height: 36,
                cursor: "pointer",
                color: COLORS.deepSlate,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "none",
                background: "rgba(30, 41, 59, 0.05)",
                transition: "background 0.15s ease",
              }}
            >
              <IconMenu size={20} color={COLORS.deepSlate} />
            </button>
          )}
        </div>

        <div style={{ pointerEvents: "auto" }}>
          {menuPopover}
        </div>
      </header>
    );
  }

  // Mobile Header: Hanya 1 tombol hamburger tunggal dengan IconMenu
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

      {menuPopover}
    </header>
  );
};

export interface FloatingComposerDockProps {
  isDesktop?: boolean;
  layoutMode?: "centered" | "docked";
  plusToggleId?: string;
  onOpenPlus?: () => void;
  draftText?: string;
  onDraftTextChange?: (text: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  wordCount?: number;
  minWordCount?: number;
  isPlusGlowing?: boolean;
  detectedKeywordHint?: string | null;
  onPasteSanitized?: (text: string, keywordCandidate: string) => void;
  onSelectSampleDraft?: (sampleKey: "revisionNeeded" | "approvedReady") => void;
  activeTurnNumber?: number;
  activeTargetQuery?: string;
}

export const FloatingComposerDock: React.FC<FloatingComposerDockProps> = ({
  isDesktop = false,
  layoutMode = "docked",
  onOpenPlus,
  draftText = "",
  onDraftTextChange,
  onSubmit,
  isLoading = false,
  wordCount: propWordCount,
  minWordCount = 300,
  isPlusGlowing = false,
  detectedKeywordHint = null,
  onPasteSanitized,
  onSelectSampleDraft,
  activeTurnNumber,
  activeTargetQuery,
}) => {
  const isCentered = layoutMode === "centered";

  const currentWordCount =
    typeof propWordCount === "number" ? propWordCount : countPureWords(draftText);
  const isEligibleToSubmit = currentWordCount >= minWordCount;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && isEligibleToSubmit && onSubmit) {
        onSubmit();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const rawHtml = e.clipboardData.getData("text/html");
    const rawText = e.clipboardData.getData("text/plain");

    if (rawHtml || rawText) {
      e.preventDefault();
      const sanitized = sanitizePastedOrUploadedDraft(rawText, rawHtml);
      const keywordCandidate = extractSmartKeyword(sanitized.cleanText);

      if (onPasteSanitized) {
        onPasteSanitized(sanitized.cleanText, keywordCandidate);
      } else if (onDraftTextChange) {
        onDraftTextChange(sanitized.cleanText);
      }
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes plusGlowPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }
            50% {
              transform: scale(1.18);
              box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            }
          }
          @keyframes fadeInTooltip {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div
        className={
          isDesktop
            ? isCentered
              ? "auth-floating-composer-centered-desktop"
              : "auth-floating-composer-dock-desktop"
            : isCentered
            ? "auth-floating-composer-centered-mobile"
            : "auth-floating-composer-dock-mobile"
        }
        style={{
          position: isCentered ? "relative" : "absolute",
          bottom: isCentered ? "auto" : 0,
          left: 0,
          right: 0,
          padding: isCentered
            ? isDesktop
              ? "0 32px 32px 32px"
              : "0 16px 24px 16px"
            : isDesktop
            ? "16px 24px 24px 24px"
            : "12px 14px 16px 14px",
          background: isCentered
            ? "transparent"
            : `linear-gradient(to top, ${COLORS.warmCream} 80%, transparent 100%)`,
          zIndex: 40,
          pointerEvents: isCentered ? "auto" : "none",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isCentered ? "center" : "flex-end",
          transition:
            "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isDesktop ? "780px" : "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Turn revision banner if active turn > 0 */}
          {activeTurnNumber && activeTurnNumber > 1 && (
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "var(--waskita-emerald-text, #065F46)",
                background: "var(--waskita-emerald-bg, #D1FAE5)",
                padding: "3px 12px",
                borderRadius: "9999px",
                marginBottom: "6px",
                pointerEvents: "auto",
              }}
            >
              Mode Revisi Turn #{activeTurnNumber} untuk kata kunci "{activeTargetQuery || "Target"}"
            </div>
          )}

          {/* Indikator Tipis Jumlah Kata di Atas Kapsul */}
          {draftText.trim().length > 0 && (
            <div
              style={{
                alignSelf: "flex-start",
                marginLeft: "18px",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: isEligibleToSubmit
                  ? "var(--waskita-emerald-accent, #059669)"
                  : "#D97706",
                transition: "color 0.2s ease",
                pointerEvents: "auto",
              }}
            >
              {isEligibleToSubmit
                ? `✓ ${currentWordCount} kata — Naskah siap diaudit`
                : `Kata-kata belum cukup (${currentWordCount} / ${minWordCount} kata minimum)`}
            </div>
          )}

          {/* Tooltip Deteksi Kata Kunci di Atas Tombol + */}
          {detectedKeywordHint && (
            <div
              onClick={onOpenPlus}
              style={{
                position: "absolute",
                top: draftText.trim().length > 0 ? "-32px" : "-36px",
                left: "8px",
                background: "var(--waskita-surface-white, #FFFFFF)",
                border: "1.5px solid var(--waskita-emerald-border, #059669)",
                color: "var(--waskita-emerald-text, #065F46)",
                fontSize: "11.5px",
                fontWeight: 700,
                borderRadius: "8px",
                padding: "4px 10px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                zIndex: 45,
                cursor: "pointer",
                pointerEvents: "auto",
                animation: "fadeInTooltip 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🔍 Kata kunci terdeteksi: "{detectedKeywordHint}" — Klik (+) untuk lihat</span>
            </div>
          )}

          {/* Input Capsule Box */}
          <div
            style={{
              width: "100%",
              background: COLORS.warmSand,
              borderRadius: 28,
              padding: "6px 8px 6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: isCentered
                ? "0 10px 30px rgba(30, 41, 59, 0.12)"
                : "0 8px 24px rgba(30, 41, 59, 0.12)",
              pointerEvents: "auto",
              boxSizing: "border-box",
              border: "1px solid rgba(30, 41, 59, 0.08)",
              position: "relative",
            }}
          >
            {/* Tombol Plus Opsi Audit */}
            <button
              type="button"
              onClick={onOpenPlus}
              aria-label="Tambah Opsi"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: COLORS.mutedSkyBlue,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: COLORS.deepSlate,
                animation: isPlusGlowing ? "plusGlowPulse 1.8s infinite" : "none",
                transition: "all 0.2s ease",
              }}
              title="Opsi Audit & Berkas"
            >
              <IconPlus size={20} color={COLORS.deepSlate} />
            </button>

            {/* Input Textarea */}
            <textarea
              rows={isCentered ? 2 : 1}
              placeholder="Ketik atau tempel naskah artikel Anda..."
              value={draftText}
              onChange={(e) => onDraftTextChange && onDraftTextChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "14px",
                color: COLORS.deepSlate,
                resize: "none",
                outline: "none",
                padding: "8px 0",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                lineHeight: "22px",
              }}
            />

            {/* Tombol Kirim / Panah Kanan */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !isEligibleToSubmit}
              aria-label="Kirim Analisis"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: isEligibleToSubmit ? COLORS.softPeriwinkle : "rgba(30, 41, 59, 0.12)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isLoading || !isEligibleToSubmit ? "not-allowed" : "pointer",
                flexShrink: 0,
                color: COLORS.deepSlate,
                opacity: isLoading || !isEligibleToSubmit ? 0.4 : 1,
                pointerEvents: isLoading || !isEligibleToSubmit ? "none" : "auto",
                transition: "all 0.2s ease",
              }}
              title={
                !isEligibleToSubmit
                  ? `Minimal ${minWordCount} kata untuk memulai audit`
                  : "Mulai Audit Kualitas"
              }
            >
              <IconArrowRight size={20} color={COLORS.deepSlate} />
            </button>
          </div>

          {/* ChatGPT-Style Action Pills (Hanya saat mode Centered) */}
          {isCentered && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginTop: "16px",
                flexWrap: "wrap",
                pointerEvents: "auto",
              }}
            >
              <button
                type="button"
                onClick={() => onSelectSampleDraft && onSelectSampleDraft("revisionNeeded")}
                style={{
                  borderRadius: "9999px",
                  padding: "8px 16px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: "rgba(192, 213, 229, 0.45)",
                  border: "1px solid rgba(30, 41, 59, 0.1)",
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                ☕ Coba Draf Perlu Revisi (Kopi Tubruk)
              </button>

              <button
                type="button"
                onClick={() => onSelectSampleDraft && onSelectSampleDraft("approvedReady")}
                style={{
                  borderRadius: "9999px",
                  padding: "8px 16px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: "rgba(192, 213, 229, 0.45)",
                  border: "1px solid rgba(30, 41, 59, 0.1)",
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                ✨ Coba Draf Layak Terbit (Robusta Dampit)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gemini-Style Bottom Pinned Disclaimer */}
      <footer
        className="no-print"
        style={{
          position: "fixed",
          bottom: "8px",
          left: 0,
          right: 0,
          zIndex: 30,
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
            margin: 0,
            padding: "0 12px",
            lineHeight: 1.4,
          }}
        >
          Ketentuan Layanan dan Kebijakan Privasi Waskita berlaku. Waskita menyajikan panduan audit pra-publikasi untuk evaluasi draf artikel web.
        </p>
      </footer>
    </>
  );
};
