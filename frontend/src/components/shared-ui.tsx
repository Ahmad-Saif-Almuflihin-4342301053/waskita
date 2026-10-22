import React from "react";

// 5 Warna Palet Resmi Waskita (PZN Vibe Engineering Standard - Dual Theme CSS Variables)
export const COLORS = {
  warmCream: "var(--waskita-bg, #F7F4EB)", // Latar utama aplikasi, latar Sidebar, latar Bottom Sheet
  warmSand: "var(--waskita-card, #E9DFCA)", // Kontainer Floating Input Capsule, kartu Bottom Sheet, bubble masukan
  softIceBlue: "var(--waskita-audit-bg, #D4E5F2)", // Latar wajib untuk 1 blok kesatuan Hasil Analisis
  mutedSkyBlue: "var(--waskita-accent-subtle, #C0D5E5)", // Tombol bulat (+), track Range Slider, border halus analisis
  softPeriwinkle: "var(--waskita-accent-primary, #C0CEE8)", // Tombol kapsul Sign in, tombol kirim panah kanan (→), thumb aktif slider, badge Plan
  deepSlate: "var(--waskita-text, #1E293B)", // Warna teks utama dan stroke ikon SVG
} as const;

// Logo Waskita Official SVG Component (viewBox="0 0 160 34", fill adapts to Theme)
export const WaskitaLogo: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = 130, height = 28, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 160 34"
    fill="none"
    className={className}
    style={{ display: "block", ...style }}
  >
    <g id="logotype">
      <path
        d="M 112.97 0 C 110.65 0 108.68 1.71 108.36 4 C 108.03 6.29 109.52 8 111.84 8 C 114.16 8 116.13 6.29 116.45 4 C 116.78 1.71 115.29 0 112.97 0 z M 0 3.21 L 5.17 4.03 L 4.2 30.47 L 10.85 30.47 L 17.55 13.8 L 19.65 30.47 L 26.3 30.47 L 36.1 3.21 L 29.65 3.21 L 23 22.1 L 20.9 5.4 L 15.8 5.4 L 9.95 22.1 L 11.55 3.21 L 0 3.21 z M 85.8 3.21 L 82.86 24.13 L 89.21 23.97 L 89.51 21.88 L 90.4 21.1 L 92.28 23.89 L 98.95 23.72 L 95.4 18.8 L 105 9.88 L 97.2 9.88 L 90.31 16.18 L 92.13 3.21 L 85.8 3.21 z M 122.86 4.8 L 122.14 9.89 L 116.79 9.89 C 120.32 10.4 121.93 10.65 121.75 12.69 L 120.64 20.55 C 119.66 27.51 121.2 31.01 126.4 31.01 C 127.8 31.01 129.3 30.9 130.8 30.65 L 131.6 24.8 L 130.2 24.8 C 127.5 24.8 126.58 23.3 126.97 20.55 L 127.77 14.85 L 132.3 14.85 L 133 9.88 L 128.47 9.88 L 129.18 4.8 L 122.86 4.8 z M 54.2 9.33 C 59.1 9.36 67.8 10.01 66.55 11.07 C 64.8 12.5 63.8 14.2 63.4 16.42 C 62.7 21.38 67.32 22.09 70.13 22.51 L 70.51 22.57 C 72.22 22.82 73.52 23.02 73.34 24.3 C 73.22 25.18 72.49 25.84 70.55 25.84 C 69.28 25.84 68.55 25.55 68.3 24.96 L 68.3 25.17 L 61.93 25.17 L 56.94 25.17 L 46.73 25.17 C 46.69 25.17 46.64 25.18 46.6 25.18 C 46.55 25.18 46.51 25.17 46.47 25.17 L 37.65 25.17 L 44.73 24.83 C 43.05 24.13 42.18 22.41 42.49 20.18 C 42.91 17.22 45.14 15.17 48.01 15.17 C 50.87 15.17 52.53 17.22 52.11 20.18 C 51.82 22.21 50.68 23.82 49.05 24.62 L 57.08 24.23 L 59.09 9.88 L 52.76 9.88 L 52.45 12.1 C 51.85 10.3 50.14 9.34 47.65 9.34 C 41.6 9.34 36.96 13.92 36.08 20.18 C 35.2 26.43 38.6 31.01 44.68 31.01 C 47.17 31.01 49.14 30.05 50.19 28.22 L 49.87 30.47 L 56.2 30.47 L 56.81 26.15 L 62.13 26.15 C 62.99 29.25 65.79 31.01 69.91 31.01 C 75 31.01 78.81 28.45 79.69 24.54 C 80.61 24.7 81.6 24.94 82.71 25.21 L 81.97 30.47 L 88.3 30.47 L 89.01 25.4 L 93.29 25.4 L 96.7 30.47 L 103.8 30.47 L 100.15 25.4 L 106.23 25.4 L 105.51 30.47 L 111.84 30.47 L 112.69 24.45 L 106.36 24.45 L 99.47 24.45 L 92.65 24.45 L 89.15 24.45 L 82.82 24.45 L 82 24.45 L 79.71 24.45 C 79.75 24.28 79.78 24.1 79.8 23.93 C 80.49 19.05 76 18.26 73.07 17.84 L 72.81 17.8 C 71.04 17.53 69.68 17.32 69.85 16.13 C 69.97 15.3 70.71 14.51 72.27 14.51 C 73.54 14.51 74.31 15.05 74.34 16.01 L 80.5 16.01 C 80.89 12.3 78.1 9.34 72.92 9.34 L 54.2 9.33 z M 145.15 9.34 C 139.1 9.34 134.46 13.92 133.58 20.18 C 133.05 23.94 134.08 27.1 136.3 29.02 C 135.22 29.77 133.47 30.24 131.2 30.47 L 138.84 30.47 C 139.83 30.82 140.95 31.01 142.18 31.01 C 144.67 31.01 146.64 30.05 147.69 28.22 L 147.37 30.47 L 153.7 30.47 L 156.59 9.88 L 150.26 9.88 L 149.95 12.1 C 149.35 10.3 147.64 9.34 145.15 9.34 z M 108.41 9.88 L 106.49 23.53 L 112.84 23.37 L 114.74 9.88 L 108.41 9.88 z M 145.51 15.17 C 148.37 15.17 150.03 17.22 149.61 20.18 C 149.19 23.14 146.97 25.18 144.1 25.18 C 141.23 25.18 139.58 23.14 139.99 20.18 C 140.41 17.22 142.64 15.17 145.51 15.17 z "
        fill="var(--waskita-logo-fill, #10B981)"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

export interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

// 100% Inline Lucide SVG Icons (Zero Unicode Emoji)
export const IconMenu: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="16" y2="18" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconFileUp: React.FC<IconProps> = ({ size = 18, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M12 12v6" />
    <path d="m15 15-3-3-3 3" />
  </svg>
);

export const IconInfo: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconSquarePen: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

export const IconMoreVertical: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export const IconShare2: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IconPin: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </svg>
);

export const IconPencil: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const IconTrash2: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const IconFileText: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconAlertCircle: React.FC<IconProps> = ({ size = 16, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ size = 20, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = ({ size = 14, color = "currentColor", style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// SVG Radial Semi-Circle Gauge Component
export const SemiCircleGauge: React.FC<{
  score: number;
  threshold: number;
  color?: string;
  size?: number;
}> = ({ score, threshold, color = "#10B981" }) => {
  const radius = 68;
  const strokeWidth = 10;
  const cx = 90;
  const cy = 80;
  const circumference = Math.PI * radius; // ~213.63
  const progressRatio = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const thresholdAngle = Math.PI * (1 - threshold / 100);
  const dotX = cx + (radius - 1) * Math.cos(thresholdAngle);
  const dotY = cy - (radius - 1) * Math.sin(thresholdAngle);

  return (
    <div style={{ position: "relative", width: 180, height: 96, margin: "0 auto" }}>
      <svg width={180} height={96} viewBox="0 0 180 96">
        {/* Background Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="var(--waskita-track, rgba(30, 41, 59, 0.12))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        {/* Threshold Indicator Dot */}
        <circle cx={dotX} cy={dotY} r={3.5} fill="#EF4444" stroke="var(--waskita-surface-white, #FFFFFF)" strokeWidth={1.5} />
      </svg>
      {/* Centered Score Display */}
      <div
        style={{
          position: "absolute",
          bottom: 2,
          left: 0,
          right: 0,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "28px", fontWeight: 800, color: COLORS.deepSlate, lineHeight: 1 }}>
          {score}%
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--waskita-text-muted, #64748B)", marginTop: 2 }}>
          Target Ambang: {threshold}%
        </span>
      </div>
    </div>
  );
};

// Audit Options Overlay: Mobile Bottom Sheet (58vh) or Desktop Popover Menu (420px)
export const AuditOptionsOverlay: React.FC<{
  toggleId: string;
  isDesktop?: boolean;
}> = ({ toggleId, isDesktop = false }) => {
  return (
    <>
      <input type="checkbox" id={toggleId} style={{ display: "none" }} />
      <style>
        {`
          #${toggleId}:checked ~ .audit-options-backdrop {
            display: block !important;
          }
          #${toggleId}:checked ~ .audit-options-container {
            transform: ${isDesktop ? "translateY(0) scale(1)" : "translateY(0)"} !important;
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

      {/* Backdrop: Invisible for Desktop (to dismiss popover by clicking outside without darkening), Dark for Mobile */}
      <label
        htmlFor={toggleId}
        className="audit-options-backdrop"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDesktop ? "transparent" : "rgba(15, 23, 42, 0.45)",
          backdropFilter: isDesktop ? "none" : "blur(2px)",
          zIndex: 90,
          cursor: "pointer",
        }}
      />

      {/* Modal / Bottom Sheet / Desktop Floating Popover Content */}
      <div
        className="audit-options-container"
        style={
          isDesktop
            ? {
                position: "absolute",
                bottom: "84px",
                left: "max(32px, calc(50% - 380px))",
                width: "460px",
                maxWidth: "calc(100% - 64px)",
                maxHeight: "520px",
                background: COLORS.warmCream,
                borderRadius: "20px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 12px 32px rgba(30, 41, 59, 0.15)",
                opacity: 0,
                pointerEvents: "none",
                transform: "translateY(10px) scale(0.98)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                overflow: "hidden",
                border: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
              }
            : {
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                height: "58vh",
                background: COLORS.warmCream,
                borderRadius: "28px 28px 0 0",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.18)",
                transform: "translateY(100%)",
                opacity: 0,
                pointerEvents: "none",
                transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                overflow: "hidden",
              }
        }
      >
        {/* Header / Drag Handle */}
        {isDesktop ? (
          <div
            style={{
              padding: "16px 20px 12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.deepSlate }}>
              Opsi Audit & Kustomisasi Masukan
            </div>
            <label
              htmlFor={toggleId}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: "var(--waskita-track, rgba(30, 41, 59, 0.06))",
                color: COLORS.deepSlate,
              }}
            >
              <IconX size={16} />
            </label>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: "10px 0 6px 0",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "5px",
                borderRadius: "9999px",
                background: "#94A3B8",
              }}
            />
          </div>
        )}

        {/* Scrollable Content inside Sheet/Card */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isDesktop ? "16px 20px 20px 20px" : "8px 16px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* 1. Unggah Berkas Dokumen */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: "16px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: COLORS.warmCream,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.deepSlate,
                }}
              >
                <IconFileUp size={20} color={COLORS.deepSlate} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.deepSlate }}>
                  Unggah Berkas Dokumen
                </div>
                <div style={{ fontSize: "11px", color: "var(--waskita-text-muted, rgba(30, 41, 59, 0.7))" }}>
                  Mendukung .md, .txt, .docx
                </div>
              </div>
            </div>
            <button
              type="button"
              style={{
                background: COLORS.softPeriwinkle,
                border: "none",
                borderRadius: "9999px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: COLORS.deepSlate,
                cursor: "pointer",
              }}
            >
              Pilih Berkas
            </button>
          </div>

          {/* 2. Kueri Target */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: "16px",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconSearch size={16} color={COLORS.deepSlate} />
              <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.deepSlate }}>
                Kueri Target Analisis
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                defaultValue="resep kopi tubruk tradisional"
                placeholder="Ketik kueri target..."
                style={{
                  flex: 1,
                  background: COLORS.warmCream,
                  border: "1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: COLORS.deepSlate,
                  outline: "none",
                }}
              />
              <button
                type="button"
                style={{
                  background: COLORS.softPeriwinkle,
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: COLORS.deepSlate,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Simpan
              </button>
            </div>
          </div>

          {/* 3. Ambang Batas (4 Range Sliders) */}
          <div
            style={{
              background: COLORS.warmSand,
              borderRadius: "16px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.deepSlate }}>
              Ambang Batas Kualitas (Kustomisasi)
            </div>

            {/* Slider 1: VSM Cosine Similarity */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                  color: COLORS.deepSlate,
                }}
              >
                <span>VSM Cosine Similarity</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)", fontWeight: 700 }}>≤ 0.60</span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0.10"
                max="1.00"
                step="0.05"
                defaultValue="0.60"
              />
            </div>

            {/* Slider 2: MATTR (Kekayaan Leksikal) */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                  color: COLORS.deepSlate,
                }}
              >
                <span>MATTR (Kekayaan Leksikal)</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)", fontWeight: 700 }}>≥ 0.55</span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0.10"
                max="1.00"
                step="0.05"
                defaultValue="0.55"
              />
            </div>

            {/* Slider 3: HKO Overlap (Sub-judul) */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                  color: COLORS.deepSlate,
                }}
              >
                <span>HKO Overlap (Sub-judul)</span>
                <span style={{ color: "var(--waskita-amber-text, #D97706)", fontWeight: 700 }}>≤ 40%</span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="0"
                max="100"
                step="5"
                defaultValue="40"
              />
            </div>

            {/* Slider 4: Skor Lolos Standar (CDS) */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                  color: COLORS.deepSlate,
                }}
              >
                <span>Skor Lolos Standar (CDS)</span>
                <span style={{ color: "var(--waskita-emerald-accent, #059669)", fontWeight: 700 }}>≥ 75%</span>
              </div>
              <input
                type="range"
                className="waskita-slider-custom"
                min="50"
                max="100"
                step="5"
                defaultValue="75"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
