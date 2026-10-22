import React, { useRef } from 'react';
import { COLORS, IconX, IconFileUp, IconSearch } from './shared-ui';
import { QualityThresholds } from '../types/waskita';

export interface AuditOptionsOverlayProps {
  toggleId: string;
  isDesktop?: boolean;
  targetQuery?: string;
  onTargetQueryChange?: (q: string) => void;
  thresholds?: QualityThresholds;
  onThresholdsChange?: (t: QualityThresholds) => void;
  onFileUpload?: (file: File) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuditOptionsOverlay: React.FC<AuditOptionsOverlayProps> = ({
  toggleId,
  isDesktop = false,
  targetQuery = 'resep kopi tubruk tradisional',
  onTargetQueryChange,
  thresholds = {
    max_cosine_similarity: 0.60,
    min_mattr: 0.55,
    max_hko_percentage: 40.0,
    min_cds_score: 75.0,
  },
  onThresholdsChange,
  onFileUpload,
  isOpen,
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

  return (
    <>
      <input type="checkbox" id={toggleId} style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".md,.txt,.docx"
        style={{ display: 'none' }}
      />
      <style>
        {`
          #${toggleId}:checked ~ .audit-options-backdrop {
            display: block !important;
          }
          #${toggleId}:checked ~ .audit-options-container {
            transform: ${isDesktop ? 'translateY(0) scale(1)' : 'translateY(0)'} !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
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

      {/* Backdrop: Invisible for Desktop, Dark for Mobile */}
      <label
        htmlFor={toggleId}
        onClick={onClose}
        className="audit-options-backdrop"
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDesktop ? 'transparent' : 'rgba(15, 23, 42, 0.45)',
          backdropFilter: isDesktop ? 'none' : 'blur(2px)',
          zIndex: 90,
          cursor: 'pointer',
        }}
      />

      {/* Modal / Bottom Sheet / Desktop Floating Popover Content */}
      <div
        className="audit-options-container"
        style={
          isDesktop
            ? {
                position: 'absolute',
                bottom: '84px',
                left: 'max(32px, calc(50% - 380px))',
                width: '460px',
                maxWidth: 'calc(100% - 64px)',
                maxHeight: '520px',
                background: COLORS.warmCream,
                borderRadius: '20px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(30, 41, 59, 0.15)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
              }
            : {
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '58vh',
                background: COLORS.warmCream,
                borderRadius: '28px 28px 0 0',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.18)',
                transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
              }
        }
      >
        {/* Header / Drag Handle */}
        {isDesktop ? (
          <div
            style={{
              padding: '16px 20px 12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700, color: COLORS.deepSlate }}>
              Opsi Audit &amp; Kustomisasi Masukan
            </div>
            <label
              htmlFor={toggleId}
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'var(--waskita-track, rgba(30, 41, 59, 0.06))',
                color: COLORS.deepSlate,
              }}
            >
              <IconX size={16} />
            </label>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '10px 0 6px 0',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '5px',
                borderRadius: '9999px',
                background: '#94A3B8',
              }}
            />
          </div>
        )}

        {/* Scrollable Content inside Sheet/Card */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isDesktop ? '16px 20px 20px 20px' : '8px 16px 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* 1. Unggah Berkas Dokumen */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: COLORS.warmCream,
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
                  Unggah Berkas Dokumen
                </div>
                <div style={{ fontSize: '11px', color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.7))' }}>
                  Mendukung .md, .txt, .docx
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: COLORS.softPeriwinkle,
                border: 'none',
                borderRadius: '9999px',
                padding: '6px 14px',
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

          {/* 3. Ambang Batas (4 Range Sliders) */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: COLORS.deepSlate }}>
              Ambang Batas Kualitas (Kustomisasi)
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
          </div>
        </div>
      </div>
    </>
  );
};
