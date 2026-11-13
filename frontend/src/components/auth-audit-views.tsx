import React from "react";
import { COLORS, WaskitaLogo, BetaBadge } from "./shared-ui";

export interface AuditStreamProps {
  isDesktop?: boolean;
  plusToggleId?: string;
}

/**
 * NewAnalysisEmptyView:
 * - Tampilan kanvas kosong saat tombol 'Analisis Baru' aktif atau belum ada hasil audit.
 * - Menampilkan Hero resmi Waskita di tengah kanvas (Desktop & Mobile).
 * - Tidak memiliki border berlebihan (Clean Minimalist Design).
 */
export const NewAnalysisEmptyView: React.FC<AuditStreamProps> = ({
  isDesktop = false,
}) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isDesktop ? "32px 24px" : "16px 14px",
        textAlign: "center",
        maxWidth: isDesktop ? "760px" : "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Logo Resmi Waskita di Tengah Layar (Desktop & Mobile) */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: isDesktop ? "20px" : "16px" }}>
        <WaskitaLogo width={isDesktop ? 160 : 130} height={isDesktop ? 34 : 28} />
        <BetaBadge size="md" />
      </div>

      <h1
        style={{
          fontSize: isDesktop ? "34px" : "24px",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: COLORS.deepSlate,
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        Periksa Kualitas &amp; Orisinalitas Artikel
      </h1>
    </div>
  );
};
