from typing import Dict, List, Tuple
from app.schemas.audit import EntityGapItem, EntityGapsGroup
from app.services.gatekeeper import is_commercial_or_sponsor


def calculate_information_gain(
    draft_entities: List[Tuple[str, str, int]],
    competitor_entities_list: List[List[Tuple[str, str, int]]],
    draft_tfidf_weights: Dict[str, float] = None,
) -> EntityGapsGroup:
    r"""
    Ekstraksi Information Gain & Celah Topik (Bab 2.2.3 — Persamaan 2.4 & 2.5):
    \Delta_{gain} = E_{draft} \setminus E_{SERP} (Kebaruan Informasi unik dari draf)
    \Delta_{deficit} = { e in E_{SERP} \setminus E_{draft} | consensus(e) >= 2 atau tfidf(e) >= P75 }
    """
    if draft_tfidf_weights is None:
        draft_tfidf_weights = {}

    draft_map: Dict[str, str] = {}  # stem -> surface
    for stem, surface, _ in draft_entities:
        draft_map[stem] = surface

    serp_map: Dict[str, str] = {}  # stem -> surface
    serp_consensus: Dict[str, int] = {}  # stem -> count of competitor documents containing it

    for comp_entities in competitor_entities_list:
        seen_in_this_doc = set()
        for stem, surface, _ in comp_entities:
            if stem not in seen_in_this_doc:
                seen_in_this_doc.add(stem)
                serp_consensus[stem] = serp_consensus.get(stem, 0) + 1
                if stem not in serp_map:
                    serp_map[stem] = surface

    draft_set = set(draft_map.keys())
    serp_set = set(serp_map.keys())

    # 1. Delta Gain: Ada di draft, TIDAK ada di seluruh kompetitor SERP
    gain_stems = draft_set - serp_set
    gain_items: List[EntityGapItem] = []
    for stem in gain_stems:
        # tfidf weight dari vectorizer atau bobot default
        weight = draft_tfidf_weights.get(stem, 0.75)
        gain_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=draft_map[stem].title(),
                tfidf_weight=round(weight, 4),
                competitor_consensus_count=0,
            )
        )
    # Urutkan berdasarkan bobot TF-IDF menurun, ambil top 5-10
    gain_items.sort(key=lambda x: x.tfidf_weight, reverse=True)
    top_gain = gain_items[:10]

    # 2. Delta Deficit: Ada di SERP, TIDAK ada di draft
    deficit_stems = serp_set - draft_set
    deficit_items: List[EntityGapItem] = []
    for stem in deficit_stems:
        surface = serp_map[stem]
        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        consensus = serp_consensus.get(stem, 1)
        # Prioritaskan yang muncul di minimal 2 artikel kompetitor (konsensus tinggi)
        weight = round(0.50 + (0.20 * min(consensus, 3)), 4)
        deficit_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=weight,
                competitor_consensus_count=consensus,
            )
        )
    # Urutkan berdasarkan consensus count lalu tfidf_weight menurun
    deficit_items.sort(key=lambda x: (x.competitor_consensus_count, x.tfidf_weight), reverse=True)
    top_deficit = deficit_items[:10]

    return EntityGapsGroup(deficit=top_deficit, gain=top_gain)
