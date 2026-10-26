import React, { useState, useEffect, useRef } from "react";
import {
  COLORS,
  IconPlus,
  IconArrowRight,
  IconSparkles,
  IconCoffee,
  IconMaximize2,
  IconMinimize2,
} from "../shared-ui";
import {
  countPureWords,
  extractSmartKeyword,
  sanitizePastedOrUploadedDraft,
} from "../../utils/draftSanitizer";

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
  onPasteSanitized,
  onSelectSampleDraft,
  activeTurnNumber,
  activeTargetQuery,
  targetQuery = "",
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

  const effectiveMobileBottom =
    keyboardOffset > 0
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

        {/* COMPOSER CARD: Collapsed Pill vs Expanded Card */}
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
          /* 2. KARTU MEGAR SAAT ADA TEKS BANYAK (Expanded State) */
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "6px",
                borderTop: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.06))",
              }}
            >
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

        {/* SUGGESTIONS CONTOH DRAF */}
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
