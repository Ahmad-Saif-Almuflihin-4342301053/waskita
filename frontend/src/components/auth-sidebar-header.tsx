import React, { useState, useEffect, useRef } from "react";
import { MobileSettingsSheet } from "./MobileSettingsSheet";
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
  IconSun,
  IconMoon,
  IconLaptop,
  IconHelpCircle,
  IconLogOut,
  IconUsers,
  IconSidebarClose,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  IconFileText,
  IconCoffee,
  IconMaximize2,
  IconMinimize2,
} from "./shared-ui";
import { countPureWords, extractSmartKeyword, sanitizePastedOrUploadedDraft } from "../utils/draftSanitizer";
import { useTheme } from "../context/ThemeContext";

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
  onOpenSettings,
  onSwitchAccount,
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
  const { theme, setTheme } = useTheme();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isWLogoHovered, setIsWLogoHovered] = useState(false);
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
      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfilePopoverOpen(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(target)
      ) {
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

  const isNewAnalysisActive = !activeSessionId || activeSessionId === 'session-new';

  const userName = userProfile.name || "author_demo";
  const userPlan = userProfile.plan || "Personal Plan";

  // Common Popover components
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

  const getProfilePopoverStyle = (collapsed: boolean): React.CSSProperties => {
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
      left: 0,
      right: "auto",
      bottom: "calc(100% + 8px)",
      zIndex: 70,
    };
  };

  const getSettingsPopoverStyle = (collapsed: boolean): React.CSSProperties => {
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

  const renderProfilePopover = (collapsed: boolean = false) => (
    <div style={getProfilePopoverStyle(collapsed)} onClick={(e) => e.stopPropagation()}>
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
          setProfilePopoverOpen(false);
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
          setProfilePopoverOpen(false);
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

  const renderSettingsPopover = (collapsed: boolean = false) => {
    // Determine flyout positioning: opens to the right with zero gap bridge
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

          {/* Submenu Flyout Tema with transparent bridge */}
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

  // Jika desktop dan dalam kondisi collapsed (Mini-Rail 68px)
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
          zIndex: 60,
          overflow: "visible",
          boxSizing: "border-box",
          padding: "12px 0",
          justifyContent: "space-between",
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
          {/* Monogram 'W' yang saat di-hover berganti menjadi IconMenu, klik untuk expand */}
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

          {/* Tombol Analisis Baru (Mini Rail) */}
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

        {/* Footer collapsed mini-rail: IconSettings di ATAS, Profil di PALING BAWAH (Gemini Style) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative" }}>
          {/* Settings Gir Mini-Rail (DI ATAS) */}
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
            {settingsPopoverOpen && renderSettingsPopover(true)}
          </div>

          {/* Avatar Profil Mini-Rail (DI PALING BAWAH) */}
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
            {profilePopoverOpen && renderProfilePopover(true)}
          </div>
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

          {/* Tombol Search & Tutup Sidebar (Kanan) */}
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
          {/* Tombol Analisis Baru: Border none, Background aktif jika di analisis baru, IconSquarePen + 'Analisis Baru' */}
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
                    {s.is_pinned && (
                      <IconPin size={13} color="var(--waskita-emerald-accent, #059669)" style={{ flexShrink: 0 }} />
                    )}
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
          {/* Avatar & Profil Trigger */}
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

            {isDesktop && profilePopoverOpen && renderProfilePopover(false)}
          </div>

          {/* Ikon Settings Trigger */}
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

            {isDesktop && settingsPopoverOpen && renderSettingsPopover(false)}
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
  isSidebarCollapsed = false,
  hasActiveSession = false,
  onOpenSidebar,
  onToggleSidebar,
  onNewAnalysis,
  onCopyRemediationPrompt,
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
  targetQuery?: string;
  onTargetQueryChange?: (query: string) => void;
  thresholds?: { min_cds_score?: number };
  showDisclaimer?: boolean;
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
  targetQuery = "",
  onTargetQueryChange,
  thresholds,
  showDisclaimer = false,
}) => {
  const isCentered = layoutMode === "centered";
  const [isMaximized, setIsMaximized] = useState(false);
  const [hoveredSample, setHoveredSample] = useState<"rev" | "ready" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Virtual Keyboard Detection via Visual Viewport API (Auto-adjust bottom offset above keyboard)
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisualResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      // Calculate viewport shrinkage difference when keyboard opens
      const diff = Math.max(0, window.innerHeight - (vv.height + (vv.offsetTop || 0)));
      if (diff > 60) {
        setKeyboardOffset(diff);
      } else {
        setKeyboardOffset(0);
      }
    };

    window.visualViewport?.addEventListener("resize", handleVisualResize);
    window.visualViewport?.addEventListener("scroll", handleVisualResize);
    window.addEventListener("resize", handleVisualResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleVisualResize);
      window.visualViewport?.removeEventListener("scroll", handleVisualResize);
      window.removeEventListener("resize", handleVisualResize);
    };
  }, []);

  const effectiveMobileBottom = keyboardOffset > 0
    ? `${keyboardOffset + 12}px`
    : "calc(32px + env(safe-area-inset-bottom, 16px))";

  const currentWordCount =
    typeof propWordCount === "number" ? propWordCount : countPureWords(draftText);
  const isEligibleToSubmit = currentWordCount >= minWordCount;
  const hasContent = draftText.trim().length > 0;

  // Auto-resize textarea when minimized with content
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      if (isMaximized) {
        el.style.height = isDesktop ? "380px" : "320px";
        el.style.overflowY = "auto";
      } else if (hasContent) {
        el.style.height = "auto";
        const nextHeight = Math.min(Math.max(el.scrollHeight, 72), 180);
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
      } else {
        el.style.height = "24px";
        el.style.overflowY = "hidden";
      }
    }
  }, [draftText, isMaximized, hasContent, isDesktop]);

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
        position: isCentered ? "relative" : isDesktop ? "absolute" : "fixed",
        bottom: isCentered
          ? "auto"
          : isDesktop
          ? "20px"
          : effectiveMobileBottom,
        left: 0,
        right: 0,
        padding: isCentered
          ? isDesktop
            ? "0 32px 32px 32px"
            : "0 16px 24px 16px"
          : isDesktop
          ? "0 24px"
          : "0 14px",
        background: "transparent",
        zIndex: 40,
        pointerEvents: "none",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isCentered ? "center" : "flex-end",
        transition:
          keyboardOffset > 0
            ? "bottom 0.15s ease-out"
            : "bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isDesktop ? "820px" : "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Turn revision banner if active turn > 1 and in docked mode */}
        {!isCentered && activeTurnNumber && activeTurnNumber > 1 && (
          <div
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              color: "var(--waskita-emerald-text, #065F46)",
              background: "var(--waskita-emerald-bg, #D1FAE5)",
              padding: "3px 12px",
              borderRadius: "9999px",
              marginBottom: "8px",
              pointerEvents: "auto",
            }}
          >
            Mode Revisi Turn #{activeTurnNumber} untuk kata kunci "{activeTargetQuery || targetQuery || "Target"}"
          </div>
        )}

        {/* COMPOSER CARD: Collapsed Pill vs Expanded Card (Gemini Style) */}
        {!hasContent && !isMaximized ? (
          /* 1. KAPSUL BERSIH SAAT KOSONG (Initial Collapsed State) */
          <div
            style={{
              width: "100%",
              background: COLORS.warmSand,
              borderRadius: "28px",
              padding: "6px 8px 6px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isCentered
                ? "0 10px 30px rgba(30, 41, 59, 0.1)"
                : "0 12px 36px rgba(30, 41, 59, 0.16), 0 2px 8px rgba(30, 41, 59, 0.06)",
              pointerEvents: "auto",
              boxSizing: "border-box",
              border: isCentered
                ? "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))"
                : "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.14))",
              position: "relative",
            }}
          >
            {/* Tombol Bulat Plus (Kiri) */}
            <button
              type="button"
              onClick={onOpenPlus}
              aria-label="Opsi Parameter & Berkas"
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
              title="Opsi Parameter & Berkas"
            >
              <IconPlus size={20} color={COLORS.deepSlate} />
            </button>

            {/* Input Textarea 1 Baris Bersih */}
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ketik atau tempel naskah artikel Anda..."
              value={draftText}
              onChange={(e) => onDraftTextChange && onDraftTextChange(e.target.value)}
              onFocus={() => {
                if (!isDesktop) {
                  setTimeout(() => {
                    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 120);
                }
              }}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                background: "transparent",
                fontSize: isDesktop ? "14.5px" : "16px",
                color: COLORS.deepSlate,
                resize: "none",
                outline: "none",
                padding: "8px 4px",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                lineHeight: "22px",
                height: "38px",
                boxSizing: "border-box",
              }}
            />

            {/* Counter Kata di Samping Kiri Tombol Panah (Tanpa Border) */}
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: isEligibleToSubmit
                  ? "var(--waskita-emerald-accent, #059669)"
                  : "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))",
                whiteSpace: "nowrap",
                padding: "0 6px",
                userSelect: "none",
                transition: "color 0.2s ease",
              }}
            >
              {currentWordCount} / {minWordCount} kata
            </span>

            {/* Tombol Bulat Panah Kanan (Kanan) */}
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
                opacity: isLoading || !isEligibleToSubmit ? 0.45 : 1,
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
        ) : (
          /* 2. KARTU MEGAR SAAT ADA TEKS BANYAK (Expanded State ala Gemini Gambar 5) */
          <div
            style={{
              width: "100%",
              background: COLORS.warmSand,
              borderRadius: isDesktop ? "24px" : "20px",
              padding: isDesktop ? "12px 14px 10px 14px" : "10px 12px 8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: isCentered
                ? "0 10px 30px rgba(30, 41, 59, 0.12)"
                : "0 14px 40px rgba(30, 41, 59, 0.18), 0 4px 12px rgba(30, 41, 59, 0.08)",
              pointerEvents: "auto",
              boxSizing: "border-box",
              border: isCentered
                ? "1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))"
                : "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.14))",
              position: "relative",
              transition: "all 0.25s ease",
            }}
          >
            {/* Header Mini: Tombol Maximize/Minimize di Sudut Kanan Atas */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 2px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))",
                }}
              >
                Naskah Draf Artikel
              </span>

              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? "Perkecil Tampilan (Minimize)" : "Perbesar Tampilan (Maximize)"}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  color: COLORS.deepSlate,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(30, 41, 59, 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {isMaximized ? (
                  <IconMinimize2 size={16} color={COLORS.deepSlate} />
                ) : (
                  <IconMaximize2 size={16} color={COLORS.deepSlate} />
                )}
              </button>
            </div>

            {/* Area Textarea yang Membesar */}
            <textarea
              ref={textareaRef}
              placeholder="Ketik atau tempel naskah artikel Anda..."
              value={draftText}
              onChange={(e) => onDraftTextChange && onDraftTextChange(e.target.value)}
              onFocus={() => {
                if (!isDesktop) {
                  setTimeout(() => {
                    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 120);
                }
              }}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{
                width: "100%",
                minHeight: isMaximized ? (isDesktop ? "380px" : "320px") : "72px",
                maxHeight: isMaximized ? (isDesktop ? "380px" : "320px") : "180px",
                border: "none",
                background: "transparent",
                fontSize: isDesktop ? "14.5px" : "16px",
                color: COLORS.deepSlate,
                resize: "none",
                outline: "none",
                padding: "4px 2px",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                lineHeight: "22px",
                boxSizing: "border-box",
                overflowY: "auto",
              }}
            />

            {/* Baris Bawah: Tombol Plus di Kiri, Counter Kata & Tombol Kirim di Kanan */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "6px",
                borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
              }}
            >
              {/* Tombol Bulat Plus (Kiri Bawah) */}
              <button
                type="button"
                onClick={onOpenPlus}
                aria-label="Opsi Parameter & Berkas"
                style={{
                  width: 36,
                  height: 36,
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
                title="Opsi Parameter & Berkas"
              >
                <IconPlus size={18} color={COLORS.deepSlate} />
              </button>

              {/* Sisi Kanan Bawah: Counter Kata (Tanpa Border) & Tombol Panah Bulat */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isEligibleToSubmit
                      ? "var(--waskita-emerald-accent, #059669)"
                      : "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))",
                    whiteSpace: "nowrap",
                    padding: "0 4px",
                    userSelect: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {currentWordCount} / {minWordCount} kata
                </span>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || !isEligibleToSubmit}
                  aria-label="Kirim Analisis"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: isEligibleToSubmit ? COLORS.softPeriwinkle : "rgba(30, 41, 59, 0.12)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLoading || !isEligibleToSubmit ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    color: COLORS.deepSlate,
                    opacity: isLoading || !isEligibleToSubmit ? 0.45 : 1,
                    pointerEvents: isLoading || !isEligibleToSubmit ? "none" : "auto",
                    transition: "all 0.2s ease",
                  }}
                  title={
                    !isEligibleToSubmit
                      ? `Minimal ${minWordCount} kata untuk memulai audit`
                      : "Mulai Audit Kualitas"
                  }
                >
                  <IconArrowRight size={18} color={COLORS.deepSlate} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUGGESTIONS CONTOH DRAF (ala ChatGPT Gambar 1 & Gemini Gambar 4) */}
        {isCentered && (
          <div
            style={{
              width: "100%",
              maxWidth: isDesktop ? "820px" : "100%",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "16px",
              pointerEvents: "auto",
            }}
          >
            {/* Suggestion 1: Draf Perlu Revisi */}
            <button
              type="button"
              onClick={() => onSelectSampleDraft && onSelectSampleDraft("revisionNeeded")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
                padding: isDesktop ? "10px 14px" : "8px 12px",
                borderRadius: "14px",
                background:
                  hoveredSample === "rev"
                    ? "var(--waskita-card, rgba(30, 41, 59, 0.08))"
                    : "transparent",
                border: "none",
                color: COLORS.deepSlate,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={() => setHoveredSample("rev")}
              onMouseLeave={() => setHoveredSample(null)}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "var(--waskita-card, rgba(30, 41, 59, 0.06))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconCoffee size={16} color={COLORS.deepSlate} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.deepSlate }}>
                  Coba Draf Perlu Revisi — Resep Kopi Tubruk Tradisional
                </div>
                {isDesktop && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      marginTop: "1px",
                    }}
                  >
                    Contoh artikel umum dengan defisit takaran suhu seduh dan rasio air
                  </div>
                )}
              </div>
            </button>

            {/* Suggestion 2: Draf Layak Terbit */}
            <button
              type="button"
              onClick={() => onSelectSampleDraft && onSelectSampleDraft("approvedReady")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
                padding: isDesktop ? "10px 14px" : "8px 12px",
                borderRadius: "14px",
                background:
                  hoveredSample === "ready"
                    ? "var(--waskita-card, rgba(30, 41, 59, 0.08))"
                    : "transparent",
                border: "none",
                color: COLORS.deepSlate,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={() => setHoveredSample("ready")}
              onMouseLeave={() => setHoveredSample(null)}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "var(--waskita-card, rgba(30, 41, 59, 0.06))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconSparkles size={16} color="var(--waskita-emerald-accent, #059669)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.deepSlate }}>
                  Coba Draf Layak Terbit — Robusta Dampit &amp; Takaran Seduh Presisi
                </div>
                {isDesktop && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      marginTop: "1px",
                    }}
                  >
                    Contoh artikel dengan entitas unik lokal (CDS 85% Siap Terbit)
                  </div>
                )}
              </div>
            </button>

            {/* Disclaimer HANYA untuk Pengguna Belum Login (Guest Mode) — Mengalir Wajar di Bawah Suggestion */}
            {showDisclaimer && (
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                  margin: "18px 0 0 0",
                  textAlign: "center",
                  lineHeight: 1.45,
                  padding: "0 12px",
                }}
              >
                Ketentuan Layanan dan Kebijakan Privasi Waskita berlaku. Waskita menyajikan panduan audit pra-publikasi untuk evaluasi draf artikel web.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
