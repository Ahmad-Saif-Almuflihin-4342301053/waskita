import React, { useState } from 'react';
import { COLORS, IconCopy, IconX } from '../shared-ui';
import { AuditExecuteResponse, EntityGapItem } from '../../types/waskita';

export interface EntityGapsSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const EntityGapsSection: React.FC<EntityGapsSectionProps> = ({ audit, isDesktop = false }) => {
  const [selectedItem, setSelectedItem] = useState<EntityGapItem | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedItem(term);
    setTimeout(() => {
      setCopiedItem((prev) => (prev === term ? null : prev));
    }, 2000);
  };

  const deficitItems = audit.entity_gaps.deficit || [];
  const priorityDeficits = deficitItems.filter((item) => item.is_consensus_priority);
  const additionalDeficits = deficitItems.filter((item) => !item.is_consensus_priority);

  return (
    <section style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 700,
          margin: '0 0 12px 0',
          color: COLORS.deepSlate,
        }}
      >
        Matriks Celah Informasi (Information Gain)
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: '12px',
        }}
      >
        {/* Card Defisit */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--waskita-rose-text, #991B1B)',
              marginBottom: '4px',
            }}
          >
            Entitas Defisit (Harus Ditambahkan)
          </div>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              margin: '0 0 8px 0',
            }}
          >
            Entitas penting kompetitor SERP yang absen di naskah Anda (klik chip untuk melihat cuplikan &amp; salin):
          </p>

          {deficitItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Kelompok 1: Entitas Konsensus Utama (Prioritas Paling Berpengaruh ke Skor 100%) */}
              {priorityDeficits.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--waskita-rose-text, #991B1B)',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🎯 Prioritas Utama Konsensus SERP (Paling Cepat Mendongkrak Skor ke 100%):</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {priorityDeficits.map((item, idx) => {
                      const isSelected = selectedItem?.term_string === item.term_string;
                      return (
                        <button
                          key={`prio-${idx}`}
                          type="button"
                          onClick={() => setSelectedItem(isSelected ? null : item)}
                          style={{
                            background: isSelected ? '#FEE2E2' : '#FFF1F2',
                            color: 'var(--waskita-rose-text, #991B1B)',
                            border: isSelected
                              ? '2px solid #DC2626'
                              : '1.5px solid rgba(220, 38, 38, 0.45)',
                            fontSize: '11.5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none',
                          }}
                          title="Klik untuk melihat cuplikan kompetitor & salin kata kunci"
                        >
                          <span>🎯 {item.term_surface_form}</span>
                          <span style={{ fontSize: '10px', opacity: 0.85 }}>({item.competitor_consensus_count} SERP)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kelompok 2: Entitas Kontekstual Tambahan */}
              {additionalDeficits.length > 0 && (
                <div>
                  {priorityDeficits.length > 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--waskita-text-muted, #64748B)',
                        marginBottom: '6px',
                      }}
                    >
                      Entitas Kontekstual Tambahan:
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {additionalDeficits.map((item, idx) => {
                      const isSelected = selectedItem?.term_string === item.term_string;
                      return (
                        <button
                          key={`add-${idx}`}
                          type="button"
                          onClick={() => setSelectedItem(isSelected ? null : item)}
                          style={{
                            background: isSelected ? '#FEE2E2' : 'var(--waskita-rose-bg, #FEE2E2)',
                            color: 'var(--waskita-rose-text, #991B1B)',
                            border: isSelected
                              ? '2px solid #DC2626'
                              : '1px solid var(--waskita-rose-border, rgba(220, 38, 38, 0.2))',
                            fontSize: '11.5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          title="Klik untuk melihat cuplikan kompetitor & salin kata kunci"
                        >
                          <span>+ {item.term_surface_form}</span>
                          <span style={{ fontSize: '10px', opacity: 0.85 }}>({item.competitor_consensus_count} SERP)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '11.5px', color: '#059669', fontStyle: 'italic' }}>
              ✓ Cakupan topik lengkap, tidak ditemukan celah defisit.
            </span>
          )}

          {/* Popover / Cuplikan Konteks Kompetitor Interaktif (Sprint 4.4) */}
          {selectedItem && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--waskita-warm-sand, #F1ECE1)',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.12))',
                boxShadow: '0 4px 12px rgba(30, 41, 59, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.deepSlate }}>
                    {selectedItem.is_consensus_priority ? '🎯' : '📄'} Cuplikan Kompetitor:
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--waskita-rose-text, #991B1B)',
                      background: 'var(--waskita-rose-bg, #FEE2E2)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedItem.term_surface_form}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyTerm(selectedItem.term_surface_form)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background:
                        copiedItem === selectedItem.term_surface_form ? '#059669' : COLORS.softPeriwinkle,
                      color: copiedItem === selectedItem.term_surface_form ? '#FFFFFF' : COLORS.deepSlate,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconCopy
                      size={12}
                      color={copiedItem === selectedItem.term_surface_form ? '#FFFFFF' : COLORS.deepSlate}
                    />
                    <span>{copiedItem === selectedItem.term_surface_form ? 'Tersalin ✓' : 'Salin Kata'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--waskita-text-muted, #64748B)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Tutup Cuplikan"
                  >
                    <IconX size={14} color="var(--waskita-text-muted, #64748B)" />
                  </button>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  lineHeight: 1.5,
                  color: 'var(--waskita-text-body, #334155)',
                  fontStyle: selectedItem.competitor_snippet ? 'italic' : 'normal',
                }}
              >
                {selectedItem.competitor_snippet
                  ? `“...${selectedItem.competitor_snippet}...”`
                  : 'Cuplikan kalimat kompetitor tidak tersedia untuk entitas ini. Tambahkan istilah ini secara alami ke dalam pembahasan naskah Anda.'}
              </p>
            </div>
          )}
        </div>

        {/* Card Gain */}
        <div
          style={{
            background: 'var(--waskita-surface-white, #FFFFFF)',
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
          }}
        >
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--waskita-emerald-text, #065F46)',
              marginBottom: '4px',
            }}
          >
            Information Gain (Nilai Tambah Baru)
          </div>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.6))',
              margin: '0 0 8px 0',
            }}
          >
            Entitas pembeda unik yang tidak dimiliki kompetitor:
          </p>

          {audit.entity_gaps.gain && audit.entity_gaps.gain.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {audit.entity_gaps.gain.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--waskita-emerald-bg, #D1FAE5)',
                    color: 'var(--waskita-emerald-text, #065F46)',
                    border: '1px solid var(--waskita-emerald-border, rgba(16, 185, 129, 0.25))',
                    fontSize: '11.5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  ★ {item.term_surface_form}
                </span>
              ))}
            </div>
          ) : (
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--waskita-text-muted, #64748B)',
                fontStyle: 'italic',
              }}
            >
              Belum ada entitas pembeda unik baru.
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
