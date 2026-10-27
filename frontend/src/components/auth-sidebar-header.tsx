/**
 * Modular Monolith Public Contract / Barrel Re-Export
 * Memisahkan domain Sidebar, Header, Floating Composer, dan Sample Drafts
 * ke sub-modul independen tanpa memutus kompatibilitas kontrak impor.
 */
export { SAMPLE_DRAFTS } from "../fixtures/sampleDrafts";
export { AuthSidebar, type AuthSidebarProps } from "./sidebar/AuthSidebar";
export { AuthHeader, type AuthHeaderProps } from "./header/AuthHeader";
export {
  FloatingComposerDock,
  type FloatingComposerDockProps,
} from "./composer/FloatingComposerDock";
