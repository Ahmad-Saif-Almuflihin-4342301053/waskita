import React from 'react';
import { COLORS, IconExternalLink, IconAlertTriangle, IconInfo } from '../shared-ui';
import { AuditExecuteResponse } from '../../types/waskita';

export interface SerpCompetitorsSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const SerpCompetitorsSection: React.FC<SerpCompetitorsSectionProps> = ({ audit, isDesktop = false }) => {
  if (!audit.serp_competitors || audit.serp_competitors.length === 0) {
    return null;
  }

  const competitors = audit.serp_competitors;
  const n = competitors.length;
  const isLive = !audit.serp_source || audit.serp_source === 'live';
  const isSynthetic = audit.serp_source === 'offline_synthetic';
  const isCurated = audit.serp_source === 'offline_curated';

  // SERP Audit Summary Transparency metrics
  const summary = audit.serp_audit_summary;
  const skippedVideo = summary?.skipped_video_social ?? summary?.reasons?.video_social ?? 0;
  const skippedPdf = summary?.skipped_pdf_doc ?? summary?.reasons?.pdf_doc ?? 0;
  const skippedBot = summary?.skipped_bot_protected ?? summary?.reasons?.bot_protected ?? 0;
  const skippedShort = summary?.skipped_short_text ?? summary?.reasons?.short_text ?? 0;
  const xSkipped = summary?.skipped_total ?? (skippedVideo + skippedPdf + skippedBot + skippedShort);

  // Helper untuk mengecek apakah domain dummy example.*
  const isDummyDomain = (domain?: string, url?: string): boolean => {
    const d = (domain || '').toLowerCase();
    const u = (url || '').toLowerCase();
    return (
      d.includes('example.com') ||
      d.includes('example.org') ||
      d.includes('example.net') ||
      d.includes('example.') ||
      u.includes('example.com') ||
      u.includes('example.org') ||
      u.includes('example.net')
    );
  };

  return (
    <section
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: '16px 0 0 0',
        borderTop: '1px dashed var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
        marginTop: '14px',
      }}
    >
      {/* Header Baris Utama */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '4px',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            margin: 0,
            color: COLORS.deepSlate,
          }}
        >
          Referensi SERP · Top {n} Google Competitor
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
          }}
        >
          Target: "{audit.target_query}"
        </span>
      </div>

      {/* Sub-baris Transparansi SERP */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          margin: '0 0 10px 0',
          fontSize: '12px',
          color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.75))',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: 'var(--waskita-emerald-text, #065F46)',
            background: 'var(--waskita-emerald-bg, #D1FAE5)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        >
          Menampilkan {n} artikel acuan ({xSkipped} hasil Google dilewati: {skippedVideo} video/sosmed, {skippedPdf} PDF/dokumen)
        </span>
      </div>

      {/* Banner Peringatan Demo / Korpus Uji Internal */}
      {!isLive && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: isSynthetic ? 'var(--waskita-amber-bg, #FEF3C7)' : 'var(--waskita-card, #E9DFCA)',
            border: '1px solid var(--waskita-border-strong, rgba(180, 83, 9, 0.3))',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
          }}
        >
          <IconAlertTriangle
            size={18}
            color={isSynthetic ? 'var(--waskita-amber-text, #B45309)' : COLORS.deepSlate}
            style={{ flexShrink: 0, marginTop: '2px' }}
          />
          <div style={{ fontSize: '12px', lineHeight: 1.5, color: COLORS.deepSlate }}>
            <strong style={{ display: 'block', marginBottom: '2px' }}>
              {isSynthetic
                ? 'Mode Demo / Korpus Uji Internal, bukan hasil Google langsung'
                : 'Korpus Uji Internal (Offline Curated), bukan hasil Google langsung'}
            </strong>
            <span>
              Pencarian SERP dijalankan dalam mode benchmark lokal offline. Tautan dummy dinonaktifkan untuk menjaga integritas pengujian.
            </span>
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: '12px',
          color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
          margin: '0 0 12px 0',
        }}
      >
        Artikel kompetitor acuan hasil pencarian Google SERP untuk pembanding VSM Cosine Similarity &amp; Information Gain
      </p>

      {/* Daftar Top 10 Kompetitor tanpa .slice() */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {competitors.map((item) => {
          const isDummy = (!isLive && isDummyDomain(item.domain_name, item.source_url)) || isSynthetic;

          return (
            <div
              key={item.rank_position}
              style={{
                background: 'var(--waskita-surface-white, #FFFFFF)',
                borderRadius: '12px',
                padding: isDesktop ? '12px 14px' : '10px 12px',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              {/* Badge Rank */}
              <span
                style={{
                  background:
                    item.rank_position === 1
                      ? 'var(--waskita-amber-bg, #FEF3C7)'
                      : 'var(--waskita-card, #E9DFCA)',
                  color:
                    item.rank_position === 1
                      ? 'var(--waskita-amber-text, #B45309)'
                      : COLORS.deepSlate,
                  fontSize: '11.5px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  padding: '3px 8px',
                  flexShrink: 0,
                  marginTop: '2px',
                  border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
                }}
              >
                #{item.rank_position}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '2px',
                  }}
                >
                  {isDummy ? (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'not-allowed',
                      }}
                      title="Tautan eksternal dinonaktifkan (Domain dummy/demo)"
                    >
                      {item.page_title}
                    </span>
                  ) : (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: COLORS.deepSlate,
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item.page_title}
                    </a>
                  )}

                  {!isDummy ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi Dokumen Sumber"
                      style={{
                        color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconExternalLink size={13} color="currentColor" />
                    </a>
                  ) : (
                    <span
                      title="Tautan dinonaktifkan pada data dummy"
                      style={{
                        color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.35))',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        cursor: 'not-allowed',
                      }}
                    >
                      <IconInfo size={13} color="currentColor" />
                    </span>
                  )}
                </div>

                {/* Domain & Metrics Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: isDummy
                        ? 'var(--waskita-text-muted, #64748B)'
                        : 'var(--waskita-emerald-accent, #059669)',
                      fontWeight: 600,
                    }}
                  >
                    {item.domain_name}
                  </span>
                  {typeof item.cosine_similarity === 'number' && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--waskita-text-muted, #64748B)',
                        background: 'rgba(30, 41, 59, 0.06)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      Cosine Sim: {item.cosine_similarity.toFixed(2)}
                    </span>
                  )}
                  {typeof item.word_count === 'number' && item.word_count > 0 && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--waskita-text-muted, #64748B)',
                        background: 'rgba(30, 41, 59, 0.06)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      ~{item.word_count} kata
                    </span>
                  )}
                  {isDummy && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--waskita-amber-text, #B45309)',
                        background: 'var(--waskita-amber-bg, #FEF3C7)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      Demo/Dummy Link
                    </span>
                  )}
                </div>

                {/* Snippet */}
                {item.snippet_text && (
                  <p
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.7))',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.snippet_text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
