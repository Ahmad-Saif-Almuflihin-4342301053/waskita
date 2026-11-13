import React, { useState, useEffect, useRef } from "react";
import {
  COLORS,
  IconPlus,
  IconArrowRight,
  IconArrowUp,
  IconSparkles,
  IconCoffee,
  IconMaximize2,
  IconMinimize2,
  IconSearch,
  IconPencil,
  IconLock,
  IconUnlock,
} from "../shared-ui";
import {
  countPureWords,
  extractSmartKeyword,
  sanitizePastedOrUploadedDraft,
} from "../../utils/draftSanitizer";
import { QualityThresholds } from "../../types/waskita";

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
  isQueryLocked?: boolean;
  onToggleQueryLock?: () => void;
  thresholds?: QualityThresholds;
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
  isQueryLocked = false,
  onToggleQueryLock,
  thresholds,
  showDisclaimer = false,
}) => {
  const isCentered = layoutMode === "centered";
  const [isMaximized, setIsMaximized] = useState(false);
  const [hoveredSample, setHoveredSample] = useState<"rev" | "ready" | null>(null);
  const [isWordShake, setIsWordShake] = useState(false);
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

  const getWordCountFeedback = () => {
    const budgetMin = thresholds?.word_budget_min;
    const budgetMax = thresholds?.word_budget_max;

    if (currentWordCount < minWordCount) {
      return {
        text: isDesktop
          ? `${currentWordCount} / ${minWordCount} kata min`
          : `${currentWordCount}/${minWordCount} kata`,
        color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))",
        title: `Minimal ${minWordCount} kata untuk memulai audit`,
      };
    }

    if (budgetMax && currentWordCount > budgetMax) {
      return {
        text: isDesktop
          ? `${currentWordCount} kata (Melebihi budget ${budgetMax})`
          : `${currentWordCount} kata (> ${budgetMax})`,
        color: "#B45309",
        title: `Naskah melebihi batas target maksimum (${budgetMax} kata)`,
      };
    }

    if (budgetMin && budgetMax) {
      if (currentWordCount < budgetMin) {
        return {
          text: isDesktop
            ? `${currentWordCount} kata (Target: ${budgetMin}–${budgetMax})`
            : `${currentWordCount} kata (${budgetMin}–${budgetMax})`,
          color: "var(--waskita-text-muted, #64748B)",
          title: `Panjang naskah di bawah target (${budgetMin}–${budgetMax} kata)`,
        };
      }
      return {
        text: isDesktop
          ? `${currentWordCount} kata (Target: ${budgetMin}–${budgetMax})`
          : `${currentWordCount} kata (${budgetMin}–${budgetMax})`,
        color: "var(--waskita-emerald-accent, #059669)",
        title: `Panjang naskah ideal sesuai budget target (${budgetMin}–${budgetMax} kata)`,
      };
    }

    return {
      text: `${currentWordCount} kata`,
      color: "var(--waskita-emerald-accent, #059669)",
      title: "Panjang naskah memenuhi syarat audit",
    };
  };

  const wordFeedback = getWordCountFeedback();

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

  useEffect(() => {
    const handleGlobalSlash = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalSlash);
    return () => window.removeEventListener("keydown", handleGlobalSlash);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (tanpa Shift) atau Ctrl/Cmd + Enter mengeksekusi submit jika >= 300 kata
    if (e.key === "Enter" && (!e.shiftKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && isEligibleToSubmit && onSubmit) {
        onSubmit();
      } else if (!isEligibleToSubmit && !isLoading) {
        // Animasi getar indikator kata untuk memberi tahu batas minimal belum terpenuhi
        setIsWordShake(true);
        setTimeout(() => setIsWordShake(false), 500);
      }
    }
    // Shift + Enter dibiarkan natural (membuat baris / paragraf baru)
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const rawHtml = e.clipboardData.getData("text/html");
    const rawText = e.clipboardData.getData("text/plain");

    if (!rawHtml && !rawText) return;

    // Bersihkan token media & normalisasi naskah paste
    const sanitized = sanitizePastedOrUploadedDraft(rawText, rawHtml);
    const textToInsert = sanitized.cleanText;

    // 1. Kotak kosong -> Paste naskah awal lengkap dengan ekstraksi kata kunci cerdas
    if (!draftText || !draftText.trim()) {
      e.preventDefault();
      const keywordCandidate = extractSmartKeyword(textToInsert);
      if (onPasteSanitized) {
        onPasteSanitized(textToInsert, keywordCandidate);
      } else if (onDraftTextChange) {
        onDraftTextChange(textToInsert);
      }
      return;
    }

    // 2. Kotak sudah berisi teks -> Cursor-aware partial paste (pertahankan naskah & riwayat undo Ctrl+Z)
    e.preventDefault();
    const textarea = e.currentTarget;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    let insertSuccess = false;
    try {
      insertSuccess = document.execCommand("insertText", false, textToInsert);
    } catch {
      insertSuccess = false;
    }

    if (!insertSuccess) {
      // Fallback: sisipkan teks di antara selectionStart dan selectionEnd
      const before = draftText.substring(0, start);
      const after = draftText.substring(end);
      const updated = before + textToInsert + after;
      if (onDraftTextChange) {
        onDraftTextChange(updated);
      }
      setTimeout(() => {
        if (textareaRef.current) {
          const nextCursor = start + textToInsert.length;
          textareaRef.current.setSelectionRange(nextCursor, nextCursor);
        }
      }, 0);
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
          : 0,
        left: 0,
        right: 0,
        padding: isCentered
          ? isDesktop
            ? "0 32px 32px 32px"
            : "0 16px 24px 16px"
          : isDesktop
          ? "20px 24px 20px 24px"
          : "14px 14px 16px 14px",
        background: isCentered
          ? "transparent"
          : "linear-gradient(to top, var(--waskita-bg) 65%, transparent 100%)",
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
        {/* COMPOSER CARD: Perplexity-Style 2-Row Rounded Rectangle */}
        {!hasContent && !isMaximized ? (
          /* 1. KOTAK BERSIH SAAT KOSONG (Perplexity 2-Row Layout) */
          <div
            style={{
              width: "100%",
              background: "var(--waskita-surface, #FFFFFF)",
              borderRadius: isDesktop ? "18px" : "16px",
              padding: isDesktop ? "12px 14px 10px 14px" : "10px 12px 8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: isCentered
                ? "0 8px 30px rgba(0, 0, 0, 0.06)"
                : "0 10px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
              pointerEvents: "auto",
              boxSizing: "border-box",
              border: "1px solid var(--waskita-border-strong, rgba(28, 25, 23, 0.12))",
              position: "relative",
            }}
          >
            {/* Baris 1: Textarea Area */}
            <textarea
              ref={textareaRef}
              rows={isDesktop ? 2 : 1}
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
                border: "none",
                background: "transparent",
                fontSize: isDesktop ? "14.5px" : "15px",
                color: "var(--waskita-text, #1C1917)",
                resize: "none",
                outline: "none",
                padding: "4px 6px",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                lineHeight: "22px",
                minHeight: isDesktop ? "44px" : "38px",
                boxSizing: "border-box",
              }}
            />

            {/* Baris 2: Integrated Action Tray (Perplexity Standard) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                paddingTop: "4px",
                borderTop: "1px solid var(--waskita-border-subtle, rgba(0, 0, 0, 0.04))",
              }}
            >
              {/* Kiri: Tombol (+) & Chip Kueri/Revisi */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: isDesktop ? "wrap" : "nowrap", flex: 1, minWidth: 0, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={onOpenPlus}
                  aria-label="Opsi Parameter & Berkas"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--waskita-surface-subtle, #F5F5F4)",
                    border: "1px solid var(--waskita-border, rgba(0, 0, 0, 0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    color: "var(--waskita-text, #1C1917)",
                    animation: isPlusGlowing ? "plusGlowPulse 1.8s infinite" : "none",
                    transition: "all 0.15s ease",
                  }}
                  title="Opsi Parameter & Berkas"
                >
                  <IconPlus size={16} color="var(--waskita-text, #1C1917)" />
                </button>

                {/* Integrated Query / Revision Chip (Borderless ala Gambar 5) */}
                {(targetQuery || (activeTurnNumber && activeTurnNumber > 1) || isQueryLocked) && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "2px 4px",
                      background: "transparent",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--waskita-text-body, #44403C)",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <IconSearch size={11} color="currentColor" style={{ flexShrink: 0 }} />
                    <span style={{ maxWidth: isDesktop ? "220px" : "105px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      "{activeTargetQuery || targetQuery || "Target"}"
                    </span>
                    {activeTurnNumber && activeTurnNumber > 1 && (
                      <span style={{ fontSize: "10px", color: "var(--waskita-text-muted, #78716C)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {isDesktop ? `• Turn #${activeTurnNumber}` : `#${activeTurnNumber}`}
                      </span>
                    )}
                    {onToggleQueryLock && (
                      <button
                        type="button"
                        onClick={onToggleQueryLock}
                        title={isQueryLocked ? "Buka kunci kueri" : "Kunci kueri"}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 2px",
                          display: "flex",
                          alignItems: "center",
                          color: "inherit",
                          flexShrink: 0,
                        }}
                      >
                        {isQueryLocked ? <IconLock size={11} color="#B45309" /> : <IconUnlock size={11} color="#78716C" />}
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Sample Chips if empty */}
                {onSelectSampleDraft && !targetQuery && (!activeTurnNumber || activeTurnNumber <= 1) && (
                  <button
                    type="button"
                    onClick={() => onSelectSampleDraft("approvedReady")}
                    style={{
                      background: "transparent",
                      border: "1px dashed var(--waskita-border-strong, rgba(0, 0, 0, 0.14))",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      color: "var(--waskita-text-muted, #78716C)",
                      cursor: "pointer",
                      display: isDesktop ? "inline-flex" : "none",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <IconCoffee size={11} color="currentColor" />
                    <span>Coba Draf (~700 kata)</span>
                  </button>
                )}
              </div>

              {/* Kanan: Feedback Jumlah Kata & Tombol Submit (↑) */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                {isLoading ? (
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "var(--waskita-emerald-accent, #059669)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sedang menganalisis...
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 500,
                      color: wordFeedback.color,
                      whiteSpace: "nowrap",
                      animation: isWordShake ? "waskita-shake 0.45s ease" : "none",
                      display: "inline-block",
                    }}
                    title={
                      !isEligibleToSubmit
                        ? `${wordFeedback.title} (Shift+Enter untuk baris baru)`
                        : "Tekan Enter untuk mulai audit"
                    }
                  >
                    {wordFeedback.text}
                  </span>
                )}

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || !isEligibleToSubmit}
                  aria-label="Kirim Analisis"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isEligibleToSubmit ? "var(--waskita-emerald-accent, #059669)" : "var(--waskita-track, rgba(125, 125, 125, 0.15))",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLoading || !isEligibleToSubmit ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    color: isEligibleToSubmit ? "#FFFFFF" : "var(--waskita-text-subtle, #A8A29E)",
                    transition: "all 0.15s ease",
                  }}
                  title={
                    !isEligibleToSubmit
                      ? `Minimal ${minWordCount} kata untuk memulai audit (Tekan Shift+Enter untuk baris baru)`
                      : "Mulai Audit (Tekan Enter)"
                  }
                >
                  <IconArrowUp size={16} color={isEligibleToSubmit ? "#FFFFFF" : "currentColor"} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 2. KARTU MEGAR SAAT ADA TEKS BANYAK (Expanded State) */
          <div
            style={{
              width: "100%",
              background: "var(--waskita-surface, #FFFFFF)",
              borderRadius: isDesktop ? "18px" : "16px",
              padding: isDesktop ? "12px 14px 10px 14px" : "10px 12px 8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: isCentered
                ? "0 8px 30px rgba(0, 0, 0, 0.06)"
                : "0 10px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
              pointerEvents: "auto",
              boxSizing: "border-box",
              border: "1px solid var(--waskita-border-strong, rgba(28, 25, 23, 0.12))",
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--waskita-text-subtle, rgba(30, 41, 59, 0.55))",
                  }}
                >
                  Naskah Draf Artikel
                </span>
                {targetQuery && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={onOpenPlus}
                      title="Klik untuk memeriksa atau mengubah kueri target di menu tombol (+)"
                      style={{
                        background: "rgba(5, 150, 105, 0.08)",
                        border: "1px solid rgba(5, 150, 105, 0.25)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: COLORS.deepSlate,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <IconSearch size={11} color="#065F46" />
                      <span style={{ fontSize: "10px", color: "var(--waskita-text-muted, #64748B)" }}>Topik:</span>
                      <span style={{ color: "#065F46" }}>"{targetQuery}"</span>
                      <IconPencil size={10} color="#065F46" style={{ opacity: 0.7 }} />
                    </button>
                    <button
                      type="button"
                      onClick={onToggleQueryLock}
                      title={isQueryLocked ? "Kueri Terkunci (Klik untuk buka kunci)" : "Kunci Kueri (Mencegah penimpaan saat paste draf baru)"}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: "3px 6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isQueryLocked ? "#B45309" : "var(--waskita-text-muted, #64748B)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isQueryLocked ? (
                        <IconLock size={12} color="#B45309" />
                      ) : (
                        <IconUnlock size={12} color="var(--waskita-text-muted, #64748B)" />
                      )}
                    </button>
                  </div>
                )}
              </div>

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
                {isLoading ? (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--waskita-emerald-accent, #059669)",
                      whiteSpace: "nowrap",
                      padding: "0 4px",
                      userSelect: "none",
                    }}
                  >
                    {activeTurnNumber && activeTurnNumber > 1
                      ? "Sedang menganalisis revisi draf..."
                      : "Sedang menganalisis..."}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: wordFeedback.color,
                      whiteSpace: "nowrap",
                      padding: "0 4px",
                      userSelect: "none",
                      transition: "color 0.2s ease",
                      animation: isWordShake ? "waskita-shake 0.45s ease" : "none",
                      display: "inline-block",
                    }}
                    title={
                      !isEligibleToSubmit
                        ? `${wordFeedback.title} (Shift+Enter untuk baris baru)`
                        : "Tekan Enter untuk mulai audit"
                    }
                  >
                    {wordFeedback.text}
                  </span>
                )}

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || !isEligibleToSubmit}
                  aria-label="Kirim Analisis"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isEligibleToSubmit ? "var(--waskita-emerald-accent, #059669)" : "var(--waskita-track, rgba(125, 125, 125, 0.15))",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLoading || !isEligibleToSubmit ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    color: isEligibleToSubmit ? "#FFFFFF" : "var(--waskita-text-subtle, #A8A29E)",
                    transition: "all 0.15s ease",
                  }}
                  title={
                    !isEligibleToSubmit
                      ? `Minimal ${minWordCount} kata untuk memulai audit (Tekan Shift+Enter untuk baris baru)`
                      : "Mulai Audit (Tekan Enter)"
                  }
                >
                  <IconArrowUp size={16} color={isEligibleToSubmit ? "#FFFFFF" : "currentColor"} />
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
                <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.deepSlate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isDesktop ? "Coba Draf Perlu Revisi — Resep Kopi Tubruk Tradisional" : "Draf Perlu Revisi · Kopi Tubruk"}
                </div>
                {isDesktop && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      marginTop: "1px",
                    }}
                  >
                    Contoh artikel umum dengan defisit takaran suhu seduh dan rasio air (~700 kata)
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
                <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.deepSlate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isDesktop ? "Coba Draf Layak Terbit — Robusta Dampit & Takaran Seduh Presisi" : "Draf Siap Terbit · Robusta Dampit Presisi"}
                </div>
                {isDesktop && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.65))",
                      marginTop: "1px",
                    }}
                  >
                    Contoh artikel dengan entitas unik lokal (CDS 85% Siap Terbit, ~700 kata)
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
