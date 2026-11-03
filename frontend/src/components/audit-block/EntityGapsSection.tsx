import React, { useState, useMemo } from 'react';
import { COLORS, IconCopy, IconX, IconCheck } from '../shared-ui';
import { AuditExecuteResponse, EntityGapItem, ConsensusEntityItem } from '../../types/waskita';

export interface EntityGapsSectionProps {
  audit: AuditExecuteResponse;
  isDesktop?: boolean;
}

export const EntityGapsSection: React.FC<EntityGapsSectionProps> = ({ audit, isDesktop = false }) => {
  const [selectedItem, setSelectedItem] = useState<EntityGapItem | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isConsensusExpanded, setIsConsensusExpanded] = useState<boolean>(false);
  const [consensusFilter, setConsensusFilter] = useState<'all' | 'deficit' | 'present'>('all');
  const [copiedConsensusTerm, setCopiedConsensusTerm] = useState<string | null>(null);

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedItem(term);
    setTimeout(() => {
      setCopiedItem((prev) => (prev === term ? null : prev));
    }, 2000);
  };

  const handleCopyConsensusTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedConsensusTerm(term);
    setTimeout(() => {
      setCopiedConsensusTerm((prev) => (prev === term ? null : prev));
    }, 2000);
  };

  const deficitItems = audit.entity_gaps.deficit || [];
  const priorityDeficits = deficitItems.filter((item) => item.is_consensus_priority);
  const additionalDeficits = deficitItems.filter((item) => !item.is_consensus_priority);

  // Kumpulkan list consensus_entities dengan fallback cerdas dari deficit/gain jika audit.consensus_entities kosong
  const consensusEntities: ConsensusEntityItem[] = useMemo(() => {
    if (audit.consensus_entities && audit.consensus_entities.length > 0) {
      return audit.consensus_entities;
    }
    const items: ConsensusEntityItem[] = [];
    const deficits = audit.entity_gaps?.deficit || [];
    const totalComp = audit.serp_competitors?.length || 10;

    for (const d of deficits) {
      items.push({
        term_string: d.term_string,
        term_surface_form: d.term_surface_form,
        doc_frequency: d.competitor_consensus_count || 3,
        total_competitors: totalComp,
        is_present_in_draft: false,
        competitor_snippet: d.competitor_snippet || undefined,
        competitor_domain: undefined,
      });
    }

    const gains = audit.entity_gaps?.gain || [];
    for (const g of gains.slice(0, 5)) {
      items.push({
        term_string: g.term_string,
        term_surface_form: g.term_surface_form,
        doc_frequency: g.competitor_consensus_count || 2,
        total_competitors: totalComp,
        is_present_in_draft: true,
        competitor_snippet: undefined,
        competitor_domain: undefined,
      });
    }
    return items;
  }, [audit.consensus_entities, audit.entity_gaps, audit.serp_competitors]);

  const presentCount = consensusEntities.filter((e) => e.is_present_in_draft).length;
  const deficitCount = consensusEntities.filter((e) => !e.is_present_in_draft).length;

  const filteredConsensus = consensusEntities.filter((e) => {
    if (consensusFilter === 'deficit') return !e.is_present_in_draft;
    if (consensusFilter === 'present') return e.is_present_in_draft;
    return true;
  });

  const INITIAL_CONSENSUS_COUNT = 5;
  const visibleConsensus = isConsensusExpanded
    ? filteredConsensus
    : filteredConsensus.slice(0, INITIAL_CONSENSUS_COUNT);
  const hiddenConsensusCount = Math.max(0, filteredConsensus.length - INITIAL_CONSENSUS_COUNT);

  return (
    <section style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
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
          Matriks Celah Informasi (Information Gain)
        </h3>
      </div>

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

      {/* Konsensus Pasar SERP Accordion (Sprint 4.4 White-Box) */}
      {consensusEntities.length > 0 && (
        <div
          id="consensus-serp-section"
          style={{
            marginTop: '16px',
            background: 'var(--waskita-surface-white, #FFFFFF)',
            borderRadius: '16px',
            padding: isDesktop ? '18px 20px' : '14px 16px',
            border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '12px',
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
                White-Box IR Konsensus Pasar
              </div>
              <h4
                style={{
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: COLORS.deepSlate,
                  margin: '0 0 4px 0',
                }}
              >
                Daftar {consensusEntities.length} Entitas Konsensus Google SERP &amp; Klausul Acuan
              </h4>
              <p
                style={{
                  fontSize: '11.5px',
                  color: 'var(--waskita-text-muted, rgba(30, 41, 59, 0.65))',
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                Entitas substantif yang paling banyak disepakati kompetitor halaman 1 Google untuk topik{' '}
                <strong>"{audit.target_query}"</strong>, beserta klausul nyata dari artikel kompetitor.
              </p>
            </div>

            {/* Telemetry pill */}
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: presentCount >= 20 ? 'var(--waskita-emerald-text, #065F46)' : COLORS.deepSlate,
                background: presentCount >= 20 ? 'var(--waskita-emerald-bg, #D1FAE5)' : 'rgba(30, 41, 59, 0.06)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.1))',
              }}
            >
              {presentCount} / {consensusEntities.length} Dicakup{' '}
              <span style={{ opacity: 0.8 }}>(Target 80%: 20 entitas)</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--waskita-border, rgba(30, 41, 59, 0.08))',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setConsensusFilter('all')}
              style={{
                background: consensusFilter === 'all' ? COLORS.deepSlate : 'rgba(30, 41, 59, 0.06)',
                color: consensusFilter === 'all' ? '#FFFFFF' : COLORS.deepSlate,
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Semua ({consensusEntities.length})
            </button>
            <button
              type="button"
              onClick={() => setConsensusFilter('deficit')}
              style={{
                background: consensusFilter === 'deficit' ? '#DC2626' : 'rgba(220, 38, 38, 0.08)',
                color: consensusFilter === 'deficit' ? '#FFFFFF' : '#991B1B',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              + Belum Ada di Draf ({deficitCount})
            </button>
            <button
              type="button"
              onClick={() => setConsensusFilter('present')}
              style={{
                background: consensusFilter === 'present' ? '#059669' : 'rgba(5, 150, 105, 0.08)',
                color: consensusFilter === 'present' ? '#FFFFFF' : '#065F46',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ✓ Sudah Dicakup ({presentCount})
            </button>
          </div>

          {/* List of visible entities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleConsensus.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--waskita-text-muted, #64748B)',
                  fontSize: '12px',
                }}
              >
                Tidak ada entitas dalam kategori filter ini.
              </div>
            ) : (
              visibleConsensus.map((ent, idx) => {
                const isPresent = ent.is_present_in_draft;
                return (
                  <div
                    key={`${ent.term_string}-${idx}`}
                    style={{
                      background: 'var(--waskita-bg, #F7F4EB)',
                      border: isPresent
                        ? '1px solid rgba(5, 150, 105, 0.25)'
                        : '1.5px solid rgba(220, 38, 38, 0.35)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: isPresent ? '#D1FAE5' : '#FEE2E2',
                            color: isPresent ? '#065F46' : '#991B1B',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
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
                            padding: '1px 7px',
                            borderRadius: '5px',
                            background: isPresent ? '#D1FAE5' : '#FEE2E2',
                            color: isPresent ? '#065F46' : '#991B1B',
                          }}
                        >
                          {isPresent ? '✓ Ada di Naskah' : '+ Belum Dicakup'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--waskita-text-muted, #64748B)',
                            background: 'rgba(30, 41, 59, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {ent.doc_frequency} / {ent.total_competitors || 10} SERP ({Math.round((ent.doc_frequency / (ent.total_competitors || 10)) * 100)}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyConsensusTerm(ent.term_surface_form)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            background: copiedConsensusTerm === ent.term_surface_form ? '#059669' : COLORS.softPeriwinkle,
                            color: copiedConsensusTerm === ent.term_surface_form ? '#FFFFFF' : COLORS.deepSlate,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Salin kata kunci ini"
                        >
                          {copiedConsensusTerm === ent.term_surface_form ? (
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

                    {/* Klausul cuplikan kompetitor */}
                    {ent.competitor_snippet ? (
                      <div
                        style={{
                          background: 'var(--waskita-warm-sand, #F1ECE1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          lineHeight: 1.45,
                          color: 'var(--waskita-text-body, #334155)',
                          borderLeft: isPresent ? '3px solid #059669' : '3px solid #DC2626',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            color: 'var(--waskita-text-muted, #64748B)',
                            marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>Klausul Kompetitor:</span>
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
                          fontSize: '10.5px',
                          color: 'var(--waskita-text-muted, #64748B)',
                          fontStyle: 'italic',
                        }}
                      >
                        Entitas ini disepakati oleh {ent.doc_frequency} artikel kompetitor SERP pada topik "{audit.target_query}".
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Accordion Toggle Button (PERSIS SEPERTI SERP COMPETITORS SECTION) */}
          {filteredConsensus.length > INITIAL_CONSENSUS_COUNT && (
            <button
              type="button"
              data-testid="toggle-more-consensus-btn"
              onClick={() => setIsConsensusExpanded((prev) => !prev)}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
                background: 'var(--waskita-card, #E9DFCA)',
                color: COLORS.deepSlate,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {isConsensusExpanded
                ? 'Sembunyikan Entitas Tambahan ▲'
                : `Tampilkan ${hiddenConsensusCount} Entitas Konsensus Lainnya (Total ${filteredConsensus.length} Entitas Google SERP) ▼`}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
