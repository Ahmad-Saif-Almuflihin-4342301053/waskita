import React, { useRef, useState, useEffect } from 'react';
import {
  COLORS,
  IconX,
  IconFileUp,
  IconSearch,
  IconAlertTriangle,
  IconAlertCircle,
} from './shared-ui';
import { QualityThresholds } from '../types/waskita';

export interface AuditOptionsOverlayProps {
  toggleId?: string;
  isDesktop?: boolean;
  targetQuery?: string;
  onTargetQueryChange?: (q: string) => void;
  thresholds?: QualityThresholds;
  onThresholdsChange?: (t: QualityThresholds) => void;
  onFileUpload?: (file: File) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DEFAULT_THRESHOLDS: QualityThresholds = {
  max_cosine_similarity: 0.60,
  min_mattr: 0.55,
  max_hko_percentage: 40.0,
  min_cds_score: 75.0,
};

export const PRESET_OPTIONS = [
  {
    name: 'Standar Editorial (Default)',
    desc: 'Standar umum artikel informatif & web SEO',
    thresholds: {
      max_cosine_similarity: 0.60,
      min_mattr: 0.55,
      max_hko_percentage: 40.0,
      min_cds_score: 75.0,
    },
  },
  {
    name: 'Blog / Opini (Fleksibel)',
    desc: 'Lebih toleran untuk gaya bahasa santai atau personal',
    thresholds: {
      max_cosine_similarity: 0.70,
      min_mattr: 0.48,
      max_hko_percentage: 50.0,
      min_cds_score: 65.0,
    },
  },
  {
    name: 'Riset / Akademis (Ketat)',
    desc: 'Standar ketat orisinalitas riset & variasi kosakata',
    thresholds: {
      max_cosine_similarity: 0.45,
      min_mattr: 0.65,
      max_hko_percentage: 30.0,
      min_cds_score: 82.0,
    },
  },
];

export const AuditOptionsOverlay: React.FC<AuditOptionsOverlayProps> = ({
  toggleId,
  isDesktop = false,
  targetQuery = 'resep kopi tubruk tradisional',
  onTargetQueryChange,
  thresholds = DEFAULT_THRESHOLDS,
  onThresholdsChange,
  onFileUpload,
  isOpen = false,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini-Style Bottom Sheet Expansion & Drag Handle Gestures
  const [isExpandedSheet, setIsExpandedSheet] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef<number>(0);
  const touchCurrentYRef = useRef<number>(0);

  // Kueri Target Tag Support (Sprint 3.1)
  const [queryTags, setQueryTags] = useState<string[]>(() => {
    if (targetQuery && targetQuery.includes(',')) {
      return targetQuery.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [queryBuffer, setQueryBuffer] = useState<string>(() => {
    if (targetQuery && !targetQuery.includes(',')) {
      return targetQuery;
    }
    return '';
  });

  useEffect(() => {
    if (targetQuery.includes(',')) {
      const parts = targetQuery.split(',').map((s) => s.trim()).filter(Boolean);
      setQueryTags(parts);
      setQueryBuffer('');
    } else if (queryTags.length === 0) {
      setQueryBuffer(targetQuery);
    }
  }, [targetQuery]);

  const handleBufferChange = (val: string) => {
    if (val.includes(',')) {
      const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
      const newTags = [...queryTags, ...parts];
      setQueryTags(newTags);
      setQueryBuffer('');
      if (onTargetQueryChange) {
        onTargetQueryChange(newTags.join(', '));
      }
    } else {
      setQueryBuffer(val);
      if (onTargetQueryChange) {
        const full = queryTags.length > 0 ? `${queryTags.join(', ')}, ${val}` : val;
        onTargetQueryChange(full.trim());
      }
    }
  };

  const handleBufferKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (queryBuffer.trim()) {
        const newTags = [...queryTags, queryBuffer.trim()];
        setQueryTags(newTags);
        setQueryBuffer('');
        if (onTargetQueryChange) {
          onTargetQueryChange(newTags.join(', '));
        }
      }
    } else if (e.key === 'Backspace' && !queryBuffer && queryTags.length > 0) {
      const newTags = queryTags.slice(0, -1);
      setQueryTags(newTags);
      if (onTargetQueryChange) {
        onTargetQueryChange(newTags.join(', '));
      }
    }
  };

  const handleRemoveTag = (idx: number) => {
    const newTags = queryTags.filter((_, i) => i !== idx);
    setQueryTags(newTags);
    if (onTargetQueryChange) {
      onTargetQueryChange(newTags.join(', '));
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsExpandedSheet(false);
      setDragOffsetY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    touchCurrentYRef.current = e.touches[0].clientY;
    const deltaY = touchCurrentYRef.current - touchStartYRef.current;
    if (deltaY > 0) {
      // Dragging downward: slide down
      setDragOffsetY(deltaY);
    } else if (deltaY < -25 && !isExpandedSheet) {
      // Dragging upward: expand sheet!
      setIsExpandedSheet(true);
      setDragOffsetY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaY = touchCurrentYRef.current - touchStartYRef.current;
    if (deltaY > 75) {
      // Swipe down threshold reached -> close
      setDragOffsetY(0);
      setIsExpandedSheet(false);
      if (onClose) onClose();
    } else if (deltaY < -20) {
      setIsExpandedSheet(true);
      setDragOffsetY(0);
    } else {
      // Snap back to normal position
      setDragOffsetY(0);
    }
  };

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isDesktop) {
      if (e.currentTarget.scrollTop > 15 && !isExpandedSheet) {
        setIsExpandedSheet(true);
      }
    }
  };

  const handleSliderChange = (key: keyof QualityThresholds, val: number) => {
    if (onThresholdsChange) {
      onThresholdsChange({
        ...thresholds,
        [key]: val,
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const applyPreset = (presetThresholds: QualityThresholds) => {
    if (onThresholdsChange) {
      onThresholdsChange(presetThresholds);
    }
  };

  const isCurrentPreset = (presetThresholds: QualityThresholds) => {
    return (
      Math.abs(thresholds.max_cosine_similarity - presetThresholds.max_cosine_similarity) < 0.001 &&
      Math.abs(thresholds.min_mattr - presetThresholds.min_mattr) < 0.001 &&
      Math.abs(thresholds.max_hko_percentage - presetThresholds.max_hko_percentage) < 0.001 &&
      Math.abs(thresholds.min_cds_score - presetThresholds.min_cds_score) < 0.001
    );
  };

  // Evaluasi Peringatan Kombinasi Ngawur (Sanity Check)
  const isUnderConstrained =
    thresholds.max_cosine_similarity > 0.75 ||
    thresholds.min_cds_score < 55 ||
    (thresholds.min_mattr < 0.42 && thresholds.max_hko_percentage > 60);

  const isOverConstrained =
    thresholds.max_cosine_similarity < 0.35 ||
    thresholds.min_cds_score > 90 ||
    thresholds.min_mattr > 0.78 ||
    thresholds.max_hko_percentage < 20;

  if (!isOpen) return null;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".md,.txt,.docx"
        style={{ display: 'none' }}
      />
      <style>
        {`
          .waskita-slider-custom {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            background: ${COLORS.mutedSkyBlue};
            border-radius: 9999px;
            outline: none;
            margin: 6px 0;
            accent-color: ${COLORS.softPeriwinkle};
          }
          .waskita-slider-custom::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #7B8BA6;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            border: 2px solid #FFFFFF;
          }
          .waskita-slider-custom::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #7B8BA6;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            border: 2px solid #FFFFFF;
          }
        `}
      </style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(30, 41, 59, 0.4)',
          zIndex: 48,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Container Overlay: Desktop centered floating card or Mobile Gemini-style bottom sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: isDesktop ? 'auto' : 0,
          top: isDesktop ? '50%' : 'auto',
          left: isDesktop ? '50%' : 0,
          right: isDesktop ? 'auto' : 0,
          transform: isDesktop
            ? 'translate(-50%, -50%)'
            : `translateY(${dragOffsetY}px)`,
          width: isDesktop ? '460px' : '100%',
          maxHeight: isDesktop ? '86vh' : isExpandedSheet ? '94vh' : '76vh',
          height: isDesktop ? 'auto' : isExpandedSheet ? '94vh' : 'auto',
          background: COLORS.warmCream,
          borderRadius: isDesktop ? '24px' : '26px 26px 0 0',
          boxShadow: '0 20px 50px rgba(30, 41, 59, 0.28)',
          zIndex: 50,
          overflow: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          transition: isDragging
            ? 'none'
            : 'max-height 0.32s cubic-bezier(0.16, 1, 0.3, 1), height 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s ease',
        }}
      >
        {/* Mobile Drag Handle Bar ("Talenan Handle" ala Gemini) */}
        {!isDesktop && (
          <div
            onClick={() => setIsExpandedSheet((prev) => !prev)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 4px 0',
              cursor: 'grab',
              touchAction: 'none',
              background: COLORS.warmCream,
              flexShrink: 0,
              userSelect: 'none',
            }}
            title="Tarik ke bawah untuk menutup, atau geser ke atas untuk memperluas"
          >
            <div
              style={{
                width: isExpandedSheet ? '48px' : '38px',
                height: '4.5px',
                borderRadius: '9999px',
                background: 'rgba(30, 41, 59, 0.28)',
                transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          </div>
        )}

        {/* Header Overlay */}
        <div
          onTouchStart={!isDesktop ? handleTouchStart : undefined}
          onTouchMove={!isDesktop ? handleTouchMove : undefined}
          onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
          style={{
            padding: isDesktop ? '16px 20px 12px 20px' : '4px 20px 10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            background: COLORS.warmCream,
            zIndex: 10,
            flexShrink: 0,
            cursor: !isDesktop ? 'grab' : 'default',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, color: COLORS.deepSlate }}>
            Opsi Parameter Audit &amp; Masukan
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Opsi"
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: COLORS.deepSlate,
            }}
          >
            <IconX size={20} color={COLORS.deepSlate} />
          </button>
        </div>

        {/* Content Body */}
        <div
          onScroll={handleBodyScroll}
          style={{
            padding: '16px 20px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* 1. Unggah Berkas */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: COLORS.mutedSkyBlue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.deepSlate,
                }}
              >
                <IconFileUp size={20} color={COLORS.deepSlate} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: COLORS.deepSlate }}>
                  Unggah Naskah Artikel
                </div>
                <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
                  Mendukung .md, .txt, .docx (100% Client-Side)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: COLORS.softPeriwinkle,
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.deepSlate,
                cursor: 'pointer',
              }}
            >
              Pilih Berkas
            </button>
          </div>

          {/* 2. Kueri Target */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSearch size={16} color={COLORS.deepSlate} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: COLORS.deepSlate }}>
                Kueri Target Analisis
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
                background: COLORS.warmCream,
                border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                borderRadius: '10px',
                padding: '6px 10px',
                minHeight: '40px',
                boxSizing: 'border-box',
              }}
            >
              {queryTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--waskita-surface-white, #FFFFFF)',
                    border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: COLORS.deepSlate,
                  }}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--waskita-text-muted, #64748B)',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={queryBuffer}
                onChange={(e) => handleBufferChange(e.target.value)}
                onKeyDown={handleBufferKeyDown}
                placeholder={queryTags.length === 0 ? "Ketik kueri target (koma / Enter untuk membuat tag)..." : "Tambah kata kunci..."}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  color: COLORS.deepSlate,
                  outline: 'none',
                  padding: '2px 4px',
                }}
              />
            </div>
          </div>

          {/* 3. Ambang Batas (4 Range Sliders) & 3 Segmented Preset Pills */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
            }}
          >
            {/* Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: COLORS.deepSlate }}>
                Ambang Batas Kualitas
              </div>
            </div>

            {/* 3 Segmented Preset Pills Langsung di Atas Slider (1-Tap Selection) */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              {PRESET_OPTIONS.map((preset) => {
                const active = isCurrentPreset(preset.thresholds);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.thresholds)}
                    style={{
                      flex: isDesktop ? 1 : '1 1 auto',
                      borderRadius: '10px',
                      padding: '7px 10px',
                      fontSize: '11.5px',
                      fontWeight: active ? 700 : 500,
                      background: active
                        ? 'var(--waskita-accent-primary, #C0CEE8)'
                        : 'rgba(30, 41, 59, 0.06)',
                      border: active
                        ? '1px solid rgba(30, 41, 59, 0.2)'
                        : '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
                      color: COLORS.deepSlate,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    title={preset.desc}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>

            {/* Slider 1: VSM Cosine Similarity */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '2px',
                  color: COLORS.deepSlate,
                }}
              >
                <span>VSM Cosine Similarity</span>
                <span style={{ color: 'var(--waskita-emerald-accent, #059669)', fontWeight: 700 }}>
                  ≤ {thresholds.max_cosine_similarity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0.10"
                max="1.00"
                step="0.05"
                value={thresholds.max_cosine_similarity}
                onChange={(e) => handleSliderChange('max_cosine_similarity', parseFloat(e.target.value))}
              />
            </div>

            {/* Slider 2: MATTR (Kekayaan Leksikal) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '2px',
                  color: COLORS.deepSlate,
                }}
              >
                <span>MATTR (Kekayaan Leksikal)</span>
                <span style={{ color: 'var(--waskita-emerald-accent, #059669)', fontWeight: 700 }}>
                  ≥ {thresholds.min_mattr.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0.10"
                max="1.00"
                step="0.05"
                value={thresholds.min_mattr}
                onChange={(e) => handleSliderChange('min_mattr', parseFloat(e.target.value))}
              />
            </div>

            {/* Slider 3: HKO Overlap (Sub-judul) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '2px',
                  color: COLORS.deepSlate,
                }}
              >
                <span>HKO Overlap (Sub-judul)</span>
                <span style={{ color: 'var(--waskita-amber-text, #D97706)', fontWeight: 700 }}>
                  ≤ {Math.round(thresholds.max_hko_percentage)}%
                </span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0"
                max="100"
                step="5"
                value={thresholds.max_hko_percentage}
                onChange={(e) => handleSliderChange('max_hko_percentage', parseFloat(e.target.value))}
              />
            </div>

            {/* Slider 4: Skor Lolos Standar (CDS) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '2px',
                  color: COLORS.deepSlate,
                }}
              >
                <span>Skor Lolos Standar (CDS)</span>
                <span style={{ color: 'var(--waskita-emerald-accent, #059669)', fontWeight: 700 }}>
                  ≥ {Math.round(thresholds.min_cds_score)}%
                </span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="50"
                max="100"
                step="5"
                value={thresholds.min_cds_score}
                onChange={(e) => handleSliderChange('min_cds_score', parseFloat(e.target.value))}
              />
            </div>

            {/* Sanity Check Warning Banner (Zero Emoji) */}
            {isUnderConstrained && (
              <div
                style={{
                  background: 'var(--waskita-amber-bg, #FEF3C7)',
                  border: '1px solid var(--waskita-amber-border, #F59E0B)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: 'var(--waskita-amber-body, #92400E)',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <IconAlertTriangle size={16} color="var(--waskita-amber-text, #D97706)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Ambang batas terlalu longgar:</strong> Draf yang sangat mirip kompetitor atau miskin kosakata berisiko tetap diloloskan.
                </span>
              </div>
            )}

            {isOverConstrained && (
              <div
                style={{
                  background: 'var(--waskita-rose-bg, #FEE2E2)',
                  border: '1px solid var(--waskita-rose-border, #EF4444)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: 'var(--waskita-rose-text, #991B1B)',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <IconAlertCircle size={16} color="var(--waskita-rose-accent, #DC2626)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Kombinasi terlalu ekstrem:</strong> Hampir semua artikel normal akan divonis "Perlu Revisi" dengan standar seketat ini.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer: Tombol Terapkan & Simpan Parameter (Tinggi 46px) */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: COLORS.warmCream,
            padding: isDesktop
              ? '12px 20px'
              : '10px 16px calc(14px + env(safe-area-inset-bottom, 12px)) 16px',
            borderTop: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '46px',
              width: '100%',
              borderRadius: '12px',
              background: COLORS.softPeriwinkle,
              border: '1px solid rgba(30, 41, 59, 0.12)',
              color: COLORS.deepSlate,
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(30, 41, 59, 0.06)',
              transition: 'background 0.15s ease',
            }}
          >
            Terapkan &amp; Simpan Parameter
          </button>
        </div>
      </div>
    </>
  );
};
