import React, { useState } from 'react';
import { COLORS, IconX, IconCopy, IconCheck } from './shared-ui';
import { ConsensusEntityItem } from '../types/waskita';

export interface ConsensusInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  consensusEntities: ConsensusEntityItem[];
  targetQuery?: string;
  totalCompetitors?: number;
}

export const ConsensusInspectorModal: React.FC<ConsensusInspectorModalProps> = ({
  isOpen,
  onClose,
  consensusEntities = [],
  targetQuery = '',
  totalCompetitors = 10,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'deficit' | 'present'>('all');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedTerm(term);
    setTimeout(() => {
      setCopiedTerm((prev) => (prev === term ? null : prev));
    }, 2000);
  };

  const presentCount = consensusEntities.filter((e) => e.is_present_in_draft).length;
  const deficitCount = consensusEntities.length - presentCount;

  const filteredEntities = consensusEntities.filter((e) => {
    if (filterMode === 'deficit') return !e.is_present_in_draft;
    if (filterMode === 'present') return e.is_present_in_draft;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          background: 'var(--waskita-bg, #F7F4EB)',
          border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.16))',
          borderRadius: '22px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--waskita-emerald-text, #065F46)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '2px',
              }}
            >
              Forensik White-Box Information Retrieval
            </div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: COLORS.deepSlate,
                margin: 0,
              }}
            >
              Rincian 25 Entitas Konsensus Google SERP
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--waskita-text-muted, #64748B)',
                margin: '4px 0 0 0',
              }}
            >
              Daftar entitas substantif yang paling banyak disepakati kompetitor untuk topik{' '}
              <strong>"{targetQuery}"</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            style={{
              background: 'rgba(30, 41, 59, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: COLORS.deepSlate,
              flexShrink: 0,
              transition: 'background 0.15s ease',
            }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Filter Bar & Summary Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '14px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              style={{
                background: filterMode === 'all' ? COLORS.deepSlate : 'rgba(30, 41, 59, 0.06)',
                color: filterMode === 'all' ? '#FFFFFF' : COLORS.deepSlate,
                border: 'none',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Semua ({consensusEntities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('deficit')}
              style={{
                background: filterMode === 'deficit' ? '#DC2626' : 'rgba(220, 38, 38, 0.08)',
                color: filterMode === 'deficit' ? '#FFFFFF' : '#991B1B',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              + Belum Ada ({deficitCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('present')}
              style={{
                background: filterMode === 'present' ? '#059669' : 'rgba(5, 150, 105, 0.08)',
                color: filterMode === 'present' ? '#FFFFFF' : '#065F46',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ✓ Sudah Dicakup ({presentCount})
            </button>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--waskita-text-muted, #64748B)' }}>
            Target Jenuh 80%: <strong>20 entitas</strong>
          </div>
        </div>

        {/* Scrollable Entity List with Clauses */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '4px',
          }}
        >
          {filteredEntities.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--waskita-text-muted, #64748B)',
                fontSize: '13px',
              }}
            >
              Tidak ada entitas dalam kategori ini.
            </div>
          ) : (
            filteredEntities.map((ent, idx) => {
              const isPresent = ent.is_present_in_draft;
              return (
                <div
                  key={`${ent.term_string}-${idx}`}
                  style={{
                    background: 'var(--waskita-surface-white, #FFFFFF)',
                    border: isPresent
                      ? '1px solid rgba(5, 150, 105, 0.2)'
                      : '1.5px solid rgba(220, 38, 38, 0.35)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(30, 41, 59, 0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: COLORS.deepSlate,
                        }}
                      >
                        {ent.term_surface_form}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isPresent ? '#D1FAE5' : '#FEE2E2',
                          color: isPresent ? '#065F46' : '#991B1B',
                        }}
                      >
                        {isPresent ? '✓ Ada di Naskah Anda' : '+ Belum Dicakup (Defisit)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--waskita-text-muted, #64748B)',
                          background: 'rgba(30, 41, 59, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {ent.doc_frequency} / {ent.total_competitors || totalCompetitors} SERP ({Math.round((ent.doc_frequency / (ent.total_competitors || totalCompetitors)) * 100)}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(ent.term_surface_form)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '3px 8px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          background: copiedTerm === ent.term_surface_form ? '#059669' : COLORS.softPeriwinkle,
                          color: copiedTerm === ent.term_surface_form ? '#FFFFFF' : COLORS.deepSlate,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Salin kata kunci ini"
                      >
                        {copiedTerm === ent.term_surface_form ? (
                          <>
                            <IconCheck size={11} />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <IconCopy size={11} />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Klausul Cuplikan Kalimat Kompetitor */}
                  {ent.competitor_snippet ? (
                    <div
                      style={{
                        background: 'var(--waskita-warm-sand, #F1ECE1)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        lineHeight: 1.45,
                        color: 'var(--waskita-text-body, #334155)',
                        borderLeft: isPresent
                          ? '3px solid #059669'
                          : '3px solid #DC2626',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--waskita-text-muted, #64748B)',
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Contoh Klausul di Artikel Kompetitor:</span>
                        {ent.competitor_domain && (
                          <span
                            style={{
                              background: 'rgba(30, 41, 59, 0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              color: COLORS.deepSlate,
                            }}
                          >
                            {ent.competitor_domain}
                          </span>
                        )}
                      </div>
                      <span style={{ fontStyle: 'italic' }}>
                        "{ent.competitor_snippet.replace(/^["']|["']$/g, '')}"
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--waskita-text-muted, #64748B)',
                        fontStyle: 'italic',
                      }}
                    >
                      Entitas ini dibahas pada {ent.doc_frequency} artikel kompetitor SERP.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--waskita-text-muted, #64748B)' }}>
            Diperbarui secara deterministik dari analisis spasial VSM & TF-IDF Google SERP.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: COLORS.deepSlate,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
