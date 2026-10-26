import React, { useRef } from 'react';
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

      {/* Container Overlay: Desktop centered floating card or Mobile bottom sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: isDesktop ? 'auto' : 0,
          top: isDesktop ? '50%' : 'auto',
          left: isDesktop ? '50%' : 0,
          right: isDesktop ? 'auto' : 0,
          transform: isDesktop ? 'translate(-50%, -50%)' : 'none',
          width: isDesktop ? '460px' : '100%',
          maxHeight: isDesktop ? '86vh' : '82vh',
          background: COLORS.warmCream,
          borderRadius: isDesktop ? '24px' : '28px 28px 0 0',
          boxShadow: '0 20px 50px rgba(30, 41, 59, 0.28)',
          zIndex: 50,
          overflowY: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 20px))',
        }}
      >
        {/* Header Overlay */}
        <div
          style={{
            padding: '16px 20px 12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            position: 'sticky',
            top: 0,
            background: COLORS.warmCream,
            zIndex: 10,
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
          style={{
            padding: '16px 20px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={targetQuery}
                onChange={(e) => onTargetQueryChange && onTargetQueryChange(e.target.value)}
                placeholder="Ketik kueri target..."
                style={{
                  flex: 1,
                  background: COLORS.warmCream,
                  border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: COLORS.deepSlate,
                  outline: 'none',
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
            padding: '12px 20px',
            borderTop: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            zIndex: 10,
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
