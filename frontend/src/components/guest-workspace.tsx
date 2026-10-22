import React, { useState } from "react";
import { COLORS, WaskitaLogo, IconMenu } from "./shared-ui";
import { FloatingComposerDock, SAMPLE_DRAFTS } from "./auth-sidebar-header";
import { countPureWords, extractSmartKeyword, sanitizePastedOrUploadedDraft } from "../utils/draftSanitizer";

export interface GuestWorkspaceProps {
  isDesktop?: boolean;
  plusToggleId?: string;
  sidebarToggleId?: string;
  onOpenSidebar?: () => void;
  onOpenPlus?: () => void;
  onSignIn?: () => void;
  draftText?: string;
  onDraftTextChange?: (text: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  onSelectSampleDraft?: (sampleKey: "revisionNeeded" | "approvedReady") => void;
}

export const GuestWorkspace: React.FC<GuestWorkspaceProps> = ({
  isDesktop = false,
  onOpenSidebar,
  onOpenPlus,
  onSignIn,
  draftText = "",
  onDraftTextChange,
  onSubmit,
  isLoading = false,
  onSelectSampleDraft,
}) => {
  const [isPlusGlowing, setIsPlusGlowing] = useState(false);
  const [detectedKeywordHint, setDetectedKeywordHint] = useState<string | null>(null);

  const wordCount = countPureWords(draftText);

  const handlePasteSanitized = (cleanText: string, keywordCandidate: string) => {
    if (onDraftTextChange) {
      onDraftTextChange(cleanText);
    }
    if (keywordCandidate) {
      setDetectedKeywordHint(keywordCandidate);
      setIsPlusGlowing(true);
      setTimeout(() => {
        setIsPlusGlowing(false);
      }, 3500);
      setTimeout(() => {
        setDetectedKeywordHint(null);
      }, 6000);
    }
  };

  const handleSelectSample = (sampleKey: "revisionNeeded" | "approvedReady") => {
    const sample = SAMPLE_DRAFTS[sampleKey];
    if (sample && onDraftTextChange) {
      onDraftTextChange(sample.text);
      setDetectedKeywordHint(sample.query);
      setIsPlusGlowing(true);
      setTimeout(() => setIsPlusGlowing(false), 3500);
      setTimeout(() => setDetectedKeywordHint(null), 6000);
    }
    if (onSelectSampleDraft) {
      onSelectSampleDraft(sampleKey);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: COLORS.warmCream,
        color: COLORS.deepSlate,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header Mobile vs Desktop Standalone Sign In Button */}
      {isDesktop ? (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "28px",
            zIndex: 35,
          }}
        >
          <button
            type="button"
            onClick={onSignIn}
            style={{
              background: COLORS.softPeriwinkle,
              border: "none",
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.deepSlate,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(30, 41, 59, 0.06)",
            }}
          >
            Sign in
          </button>
        </div>
      ) : (
        <header
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
            flexShrink: 0,
            background: COLORS.warmCream,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={onOpenSidebar}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "8px",
                color: COLORS.deepSlate,
              }}
              title="Buka Menu"
            >
              <IconMenu size={22} color={COLORS.deepSlate} />
            </button>
            <WaskitaLogo width={120} height={26} />
          </div>

          <div>
            <button
              type="button"
              onClick={onSignIn}
              style={{
                background: COLORS.softPeriwinkle,
                border: "none",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 600,
                color: COLORS.deepSlate,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </div>
        </header>
      )}

      {/* Main Area with Centered Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isDesktop ? "0 32px 48px 32px" : "0 16px 80px 16px",
          textAlign: "center",
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Logo Resmi Waskita */}
        <div style={{ marginBottom: "20px" }}>
          <WaskitaLogo width={isDesktop ? 160 : 130} height={isDesktop ? 34 : 28} />
        </div>

        {/* Judul Hero CTA */}
        <h1
          style={{
            fontSize: isDesktop ? "36px" : "26px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: COLORS.deepSlate,
            margin: "0 0 24px 0",
            lineHeight: 1.25,
          }}
        >
          Segera Periksa, ARTIKELMU!
        </h1>

        {/* Kapsul Komposer Terpadu Tunggal Mode Centered */}
        <div style={{ width: "100%", position: "relative" }}>
          <FloatingComposerDock
            isDesktop={isDesktop}
            layoutMode="centered"
            onOpenPlus={onOpenPlus}
            draftText={draftText}
            onDraftTextChange={onDraftTextChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
            wordCount={wordCount}
            minWordCount={300}
            isPlusGlowing={isPlusGlowing}
            detectedKeywordHint={detectedKeywordHint}
            onPasteSanitized={handlePasteSanitized}
            onSelectSampleDraft={handleSelectSample}
          />
        </div>
      </main>
    </div>
  );
};
