import React from "react";
import { defineScreen } from "@mokly/mokly";
import { COLORS, AuditOptionsOverlay } from "./partials/shared-ui";
import {
  AuthSidebar,
  AuthHeader,
  FloatingComposerDock,
} from "./partials/auth-sidebar-header";
import {
  HistoryOneAuditStream,
  HistoryTwoAuditStream,
  NewAnalysisEmptyView,
} from "./partials/auth-audit-views";

// CSS State Machine Identifiers
const SIDEBAR_TOGGLE_ID_DESKTOP = "auth-sidebar-toggle-desktop";
const HEADER_MENU_TOGGLE_ID_MOBILE = "auth-header-menu-toggle-mobile";
const HEADER_MENU_TOGGLE_ID_DESKTOP = "auth-header-menu-toggle-desktop";
const PLUS_TOGGLE_ID_MOBILE = "auth-plus-toggle-mobile";
const PLUS_TOGGLE_ID_DESKTOP = "auth-plus-toggle-desktop";

// Unified Context-Aware Mobile Navigation Flow State Machine Identifiers
const MOBILE_NAV_FLOW = "mobile-nav-flow";
const VIEW_SESSION_1 = "view-session-1";
const VIEW_SESSION_2 = "view-session-2";
const VIEW_SESSION_NEW = "view-session-new";

// Context-Aware Drawer Open Radios (Preserves Current Active Session)
const DRAWER_FROM_1 = "drawer-from-1";
const DRAWER_FROM_2 = "drawer-from-2";
const DRAWER_FROM_NEW = "drawer-from-new";

// Desktop Session Radio State Identifiers
const ACTIVE_SESSION_RADIO_NAME_DESKTOP = "active-session-desktop";
const SESSION_NEW_DESKTOP = "session-new-desktop";
const SESSION_ONE_DESKTOP = "session-one-desktop";
const SESSION_TWO_DESKTOP = "session-two-desktop";

/**
 * Mobile View (390x844 Form Factor):
 * - 100% height, flex column, overflow hidden
 * - Off-canvas Drawer Sidebar (100% width)
 * - Main content with scrollable audit stream & pure CSS view switcher
 * - Floating bottom input capsule at bottom: 0, zIndex: 40
 * - Bottom sheet 58vh for Plus button options
 */
const MobileAuthenticatedScreen: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: COLORS.warmCream,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* State Machine Inputs */}
      <input
        type="checkbox"
        id={HEADER_MENU_TOGGLE_ID_MOBILE}
        style={{ display: "none" }}
      />

      {/* Unified Mobile Navigation Flow Radio Inputs */}
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={VIEW_SESSION_1}
        defaultChecked
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={VIEW_SESSION_2}
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={VIEW_SESSION_NEW}
        style={{ display: "none" }}
      />

      {/* Context-Aware Drawer Open Radios */}
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={DRAWER_FROM_1}
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={DRAWER_FROM_2}
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={MOBILE_NAV_FLOW}
        id={DRAWER_FROM_NEW}
        style={{ display: "none" }}
      />

      <style>
        {`
          /* Sidebar Mobile Drawer Animation (Opens for any context-aware drawer state) */
          #${DRAWER_FROM_1}:checked ~ .auth-sidebar-mobile,
          #${DRAWER_FROM_2}:checked ~ .auth-sidebar-mobile,
          #${DRAWER_FROM_NEW}:checked ~ .auth-sidebar-mobile {
            transform: translateX(0) !important;
          }
          #${DRAWER_FROM_1}:checked ~ .auth-sidebar-backdrop-mobile-1,
          #${DRAWER_FROM_2}:checked ~ .auth-sidebar-backdrop-mobile-2,
          #${DRAWER_FROM_NEW}:checked ~ .auth-sidebar-backdrop-mobile-new {
            display: block !important;
          }

          /* Header Popover Menu Toggle */
          #${HEADER_MENU_TOGGLE_ID_MOBILE}:checked ~ * .auth-header-popover {
            display: flex !important;
          }
          #${HEADER_MENU_TOGGLE_ID_MOBILE}:checked ~ * .auth-header-backdrop {
            display: block !important;
          }

          /* Active Session View Switching in Mobile */
          .mobile-view-session-1,
          .mobile-view-session-2,
          .mobile-view-session-new {
            display: none;
            width: 100%;
          }

          #${VIEW_SESSION_1}:checked ~ main .mobile-view-session-1,
          #${DRAWER_FROM_1}:checked ~ main .mobile-view-session-1 {
            display: block !important;
          }
          #${VIEW_SESSION_2}:checked ~ main .mobile-view-session-2,
          #${DRAWER_FROM_2}:checked ~ main .mobile-view-session-2 {
            display: block !important;
          }
          #${VIEW_SESSION_NEW}:checked ~ main,
          #${DRAWER_FROM_NEW}:checked ~ main {
            display: flex !important;
            flex-direction: column !important;
            height: calc(100vh - 56px) !important;
          }
          #${VIEW_SESSION_NEW}:checked ~ main .mobile-view-session-new,
          #${DRAWER_FROM_NEW}:checked ~ main .mobile-view-session-new {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            height: 100% !important;
            min-height: 100% !important;
          }

          /* Context-aware Hamburger Menu in Mobile Header */
          .auth-burger-1, .auth-burger-2, .auth-burger-new { display: none !important; }
          #${VIEW_SESSION_1}:checked ~ * .auth-burger-1,
          #${DRAWER_FROM_1}:checked ~ * .auth-burger-1 { display: flex !important; }

          #${VIEW_SESSION_2}:checked ~ * .auth-burger-2,
          #${DRAWER_FROM_2}:checked ~ * .auth-burger-2 { display: flex !important; }

          #${VIEW_SESSION_NEW}:checked ~ * .auth-burger-new,
          #${DRAWER_FROM_NEW}:checked ~ * .auth-burger-new { display: flex !important; }

          /* Context-aware Close X in Mobile Drawer Header */
          .auth-close-1, .auth-close-2, .auth-close-new { display: none !important; }
          #${VIEW_SESSION_1}:checked ~ * .auth-close-1,
          #${DRAWER_FROM_1}:checked ~ * .auth-close-1 { display: flex !important; }

          #${VIEW_SESSION_2}:checked ~ * .auth-close-2,
          #${DRAWER_FROM_2}:checked ~ * .auth-close-2 { display: flex !important; }

          #${VIEW_SESSION_NEW}:checked ~ * .auth-close-new,
          #${DRAWER_FROM_NEW}:checked ~ * .auth-close-new { display: flex !important; }
        `}
      </style>

      {/* Header dengan Burger Context-Aware dan Titik Tiga 7 Aksi */}
      <AuthHeader
        isDesktop={false}
        sidebarToggleId={DRAWER_FROM_1}
        headerMenuToggleId={HEADER_MENU_TOGGLE_ID_MOBILE}
        drawerFromOneId={DRAWER_FROM_1}
        drawerFromTwoId={DRAWER_FROM_2}
        drawerFromNewId={DRAWER_FROM_NEW}
      />

      {/* Scrollable Main Analysis Canvas (Padded at bottom for floating dock) */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div className="mobile-view-session-1">
          <HistoryOneAuditStream isDesktop={false} />
        </div>
        <div className="mobile-view-session-2">
          <HistoryTwoAuditStream isDesktop={false} />
        </div>
        <div className="mobile-view-session-new">
          <NewAnalysisEmptyView isDesktop={false} />
        </div>
      </main>

      {/* Floating Composer Dock (100% MELAYANG PERMANEN) */}
      <FloatingComposerDock
        isDesktop={false}
        plusToggleId={PLUS_TOGGLE_ID_MOBILE}
      />

      {/* Mobile Drawer Backdrops (Context-aware: closes back to active session) */}
      <label
        htmlFor={VIEW_SESSION_1}
        className="auth-sidebar-backdrop-mobile-1"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 55,
          cursor: "pointer",
        }}
        title="Tutup Menu"
      />
      <label
        htmlFor={VIEW_SESSION_2}
        className="auth-sidebar-backdrop-mobile-2"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 55,
          cursor: "pointer",
        }}
        title="Tutup Menu"
      />
      <label
        htmlFor={VIEW_SESSION_NEW}
        className="auth-sidebar-backdrop-mobile-new"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 55,
          cursor: "pointer",
        }}
        title="Tutup Menu"
      />

      {/* Mobile Off-canvas Drawer (100% fullscreen width) */}
      <AuthSidebar
        isDesktop={false}
        sidebarToggleId={DRAWER_FROM_1}
        activeSessionRadioName={MOBILE_NAV_FLOW}
        sessionNewId={VIEW_SESSION_NEW}
        sessionOneId={VIEW_SESSION_1}
        sessionTwoId={VIEW_SESSION_2}
        drawerFromOneId={DRAWER_FROM_1}
        drawerFromTwoId={DRAWER_FROM_2}
        drawerFromNewId={DRAWER_FROM_NEW}
      />

      {/* Popup Opsi Audit & Masukan (Bottom Sheet 58vh) */}
      <AuditOptionsOverlay
        toggleId={PLUS_TOGGLE_ID_MOBILE}
        isDesktop={false}
      />
    </div>
  );
};

/**
 * Desktop View (1440x900 Widescreen 2-Column Layout):
 * - Root Container: flex row, 100vh, overflow hidden
 * - Left Column: Persistent Sidebar (280px, borderRight: 1px solid #E9DFCA)
 * - Right Column: Workspace flex 1, header atas, main content terpusat maxWidth 840px margin 0 auto
 * - Floating Composer Dock: maxWidth 800px terpusat di bawah kolom kanan
 * - Popup Plus: Centered Popover Card (width 480px, maxHeight 75vh, borderRadius 24px)
 */
const DesktopAuthenticatedScreen: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: COLORS.warmCream,
        display: "flex",
        flexDirection: "row",
        boxSizing: "border-box",
      }}
    >
      {/* State Machine Inputs */}
      <input
        type="checkbox"
        id={SIDEBAR_TOGGLE_ID_DESKTOP}
        style={{ display: "none" }}
      />
      <input
        type="checkbox"
        id={HEADER_MENU_TOGGLE_ID_DESKTOP}
        style={{ display: "none" }}
      />

      {/* Session State Radio Inputs (Default: session-one checked) */}
      <input
        type="radio"
        name={ACTIVE_SESSION_RADIO_NAME_DESKTOP}
        id={SESSION_ONE_DESKTOP}
        defaultChecked
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={ACTIVE_SESSION_RADIO_NAME_DESKTOP}
        id={SESSION_TWO_DESKTOP}
        style={{ display: "none" }}
      />
      <input
        type="radio"
        name={ACTIVE_SESSION_RADIO_NAME_DESKTOP}
        id={SESSION_NEW_DESKTOP}
        style={{ display: "none" }}
      />

      <style>
        {`
          /* Desktop Collapsible Sidebar CSS */
          #${SIDEBAR_TOGGLE_ID_DESKTOP}:checked ~ .auth-sidebar-desktop {
            width: 68px !important;
          }
          #${SIDEBAR_TOGGLE_ID_DESKTOP}:checked ~ .auth-sidebar-desktop .auth-sidebar-expanded-content {
            display: none !important;
          }
          #${SIDEBAR_TOGGLE_ID_DESKTOP}:checked ~ .auth-sidebar-desktop .auth-sidebar-rail-content {
            display: flex !important;
          }

          /* Header Popover Menu Toggle Desktop */
          #${HEADER_MENU_TOGGLE_ID_DESKTOP}:checked ~ * .auth-header-popover {
            display: flex !important;
          }
          #${HEADER_MENU_TOGGLE_ID_DESKTOP}:checked ~ * .auth-header-backdrop {
            display: block !important;
          }

          /* Active Session View Switching in Desktop */
          .desktop-view-session-1,
          .desktop-view-session-2,
          .desktop-view-session-new {
            display: none;
            width: 100%;
          }

          #${SESSION_ONE_DESKTOP}:checked ~ * .desktop-view-session-1 {
            display: block !important;
          }
          #${SESSION_TWO_DESKTOP}:checked ~ * .desktop-view-session-2 {
            display: block !important;
          }
          #${SESSION_NEW_DESKTOP}:checked ~ * main {
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
          }
          #${SESSION_NEW_DESKTOP}:checked ~ * .desktop-view-session-new {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            height: 100% !important;
          }

          /* Desktop Floating Dock: Only visible when session 1 or 2 is active, hidden on session-new */
          #${SESSION_NEW_DESKTOP}:checked ~ * .auth-floating-composer-dock-desktop {
            display: none !important;
          }
        `}
      </style>

      {/* Kolom Kiri: Persistent Left Sidebar (280px) */}
      <AuthSidebar
        isDesktop={true}
        sidebarToggleId={SIDEBAR_TOGGLE_ID_DESKTOP}
        activeSessionRadioName={ACTIVE_SESSION_RADIO_NAME_DESKTOP}
        sessionNewId={SESSION_NEW_DESKTOP}
        sessionOneId={SESSION_ONE_DESKTOP}
        sessionTwoId={SESSION_TWO_DESKTOP}
      />

      {/* Kolom Kanan: Workspace Utama */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Header Desktop dengan Tombol Titik Tiga 7 Aksi */}
        <AuthHeader
          isDesktop={true}
          sidebarToggleId={SIDEBAR_TOGGLE_ID_DESKTOP}
          headerMenuToggleId={HEADER_MENU_TOGGLE_ID_DESKTOP}
        />

        {/* Scrollable Main Content (Area Baca Terpusat maxWidth 840px) */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <div className="desktop-view-session-1">
            <HistoryOneAuditStream isDesktop={true} />
          </div>
          <div className="desktop-view-session-2">
            <HistoryTwoAuditStream isDesktop={true} />
          </div>
          <div className="desktop-view-session-new">
            <NewAnalysisEmptyView isDesktop={true} plusToggleId={PLUS_TOGGLE_ID_DESKTOP} />
          </div>
        </main>

        {/* Floating Composer Dock Terpusat di Bawah Kolom Kanan */}
        <FloatingComposerDock
          isDesktop={true}
          plusToggleId={PLUS_TOGGLE_ID_DESKTOP}
        />

        {/* Popover Opsi Audit Desktop Mengembang ke Kanan di dalam Kolom 2 Workspace */}
        <AuditOptionsOverlay
          toggleId={PLUS_TOGGLE_ID_DESKTOP}
          isDesktop={true}
        />
      </div>
    </div>
  );
};

export default defineScreen({
  title: "02. Waskita - Mode Terautentikasi (Sudah Login)",
  description:
    "Antarmuka Waskita V3.0 mode terautentikasi (sudah login): Sidebar riwayat Gemini-style interaktif yang dapat memindahkan alur analisis saat diklik, header dengan menu popover 7 aksi, floating composer dock permanen, dan tata letak responsif sejati untuk Mobile (390x844) dan Widescreen Desktop (1440x900).",
  relatedDocs: [],
  mobile: <MobileAuthenticatedScreen />,
  desktop: <DesktopAuthenticatedScreen />,
});
