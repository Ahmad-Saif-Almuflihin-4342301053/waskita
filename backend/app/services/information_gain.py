from typing import Dict, List, Optional, Set, Tuple
from app.schemas.audit import EntityGapItem, EntityGapsGroup
from app.services.gatekeeper import is_commercial_or_sponsor
from app.services.nlp_pipeline import ALL_INDONESIAN_STOPWORDS


def _deduplicate_subsumed_unigrams(items: List[EntityGapItem], limit: int = 10) -> List[EntityGapItem]:
    """
    Bigram Subsumption Filter (Sprint 4.1):
    Jika suatu bigram 'A B' sudah masuk daftar teratas, hilangkan unigram 'A' atau 'B'
    yang konsensusnya tidak lebih tinggi dari bigram tersebut agar tidak terjadi duplikasi chip
    (misal mencegah munculnya 'Beton Ekspos' dan 'Ekspos' secara bersamaan).
    """
    bigram_parts_consensus: Dict[str, int] = {}
    for it in items:
        parts = it.term_string.split()
        if len(parts) >= 2:
            for p in parts:
                bigram_parts_consensus[p] = max(
                    bigram_parts_consensus.get(p, -1),
                    it.competitor_consensus_count,
                )

    filtered: List[EntityGapItem] = []
    for it in items:
        parts = it.term_string.split()
        if len(parts) == 1:
            uni = parts[0]
            if uni in bigram_parts_consensus and it.competitor_consensus_count <= bigram_parts_consensus[uni]:
                continue
        filtered.append(it)
        if len(filtered) >= limit:
            break
    return filtered


def calculate_information_gain(
    draft_entities: List[Tuple[str, str, int]],
    competitor_entities_list: List[List[Tuple[str, str, int]]],
    draft_tfidf_weights: Optional[Dict[str, float]] = None,
    full_draft_stems: Optional[Set[str]] = None,
    full_competitor_stems_list: Optional[List[Set[str]]] = None,
) -> EntityGapsGroup:
    r"""
    Ekstraksi Information Gain & Celah Topik (Bab 2.2.3 — Persamaan 2.4 & 2.5, Sprint 4.1):
    - \Delta_{gain} = Kandidat Entitas Draf yang 100% TIDAK ADA di seluruh kosakata utuh kompetitor SERP.
    - \Delta_{deficit} = Kandidat Entitas SERP (consensus >= 2) yang 100% ABSEN dari kosakata utuh draf.
    """
    if draft_tfidf_weights is None:
        draft_tfidf_weights = {}

    draft_map: Dict[str, str] = {}  # stem -> surface
    for stem, surface, _ in draft_entities:
        if stem in ALL_INDONESIAN_STOPWORDS:
            continue
        draft_map[stem] = surface

    # Himpunan penuh stem di draf (jika tidak disuplai, fallback ke draft_map.keys())
    complete_draft_stems: Set[str] = (
        set(full_draft_stems) if full_draft_stems is not None else set(draft_map.keys())
    )
    complete_draft_stems.update(draft_map.keys())
    # Tambahkan juga komponen kata dari bigram yang ada di draf agar jika draf punya "arsitek terkenal", kata "arsitek" tercatat ada
    for st in list(complete_draft_stems):
        for part in st.split():
            if len(part) > 2:
                complete_draft_stems.add(part)

    serp_map: Dict[str, str] = {}  # stem -> surface dari kandidat top kompetitor
    serp_consensus: Dict[str, int] = {}  # stem -> jumlah dokumen kompetitor yang memuatnya

    num_competitors = len(competitor_entities_list)

    for idx, comp_entities in enumerate(competitor_entities_list):
        seen_in_this_doc = set()
        for stem, surface, _ in comp_entities:
            if stem in ALL_INDONESIAN_STOPWORDS:
                continue
            if stem not in seen_in_this_doc:
                seen_in_this_doc.add(stem)
                if stem not in serp_map:
                    serp_map[stem] = surface

    # Hitung konsensus secara akurat menggunakan full_competitor_stems_list jika tersedia
    if full_competitor_stems_list and len(full_competitor_stems_list) == num_competitors:
        all_serp_full_stems: Set[str] = set()
        for comp_full_set in full_competitor_stems_list:
            all_serp_full_stems.update(comp_full_set)
            for part_st in list(comp_full_set):
                for p in part_st.split():
                    if len(p) > 2:
                        all_serp_full_stems.add(p)

        for candidate_stem in serp_map.keys():
            count_docs = sum(1 for comp_full_set in full_competitor_stems_list if candidate_stem in comp_full_set)
            serp_consensus[candidate_stem] = max(1, count_docs)
    else:
        all_serp_full_stems = set(serp_map.keys())
        for comp_entities in competitor_entities_list:
            seen = {s for s, _, _ in comp_entities if s not in ALL_INDONESIAN_STOPWORDS}
            for s in seen:
                serp_consensus[s] = serp_consensus.get(s, 0) + 1
                for p in s.split():
                    if len(p) > 2:
                        all_serp_full_stems.add(p)

    # 1. Delta Gain: Ada di draft, TIDAK ADA di seluruh kosakata utuh kompetitor SERP
    gain_stems = set(draft_map.keys()) - all_serp_full_stems
    gain_items: List[EntityGapItem] = []
    for stem in gain_stems:
        surface = draft_map[stem]
        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        parts = stem.split()
        if len(parts) > 1 and all(p in all_serp_full_stems for p in parts):
            continue
        weight = draft_tfidf_weights.get(stem, 0.75)
        if len(parts) >= 2:
            weight = round(weight * 1.15, 4)
        gain_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=round(weight, 4),
                competitor_consensus_count=0,
            )
        )
    gain_items.sort(key=lambda x: x.tfidf_weight, reverse=True)
    top_gain = _deduplicate_subsumed_unigrams(gain_items, limit=10)

    # 2. Delta Deficit: Ada di SERP (consensus >= 2), 100% ABSEN dari kosakata utuh draft
    deficit_stems = set(serp_map.keys()) - complete_draft_stems
    deficit_items: List[EntityGapItem] = []
    min_required_consensus = 2 if num_competitors >= 2 else 1

    for stem in deficit_stems:
        surface = serp_map[stem]
        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        # Jika bigram yang semua kata penyusunnya sudah ada di draf, lewati agar tidak redundan
        parts = stem.split()
        if len(parts) > 1 and all(p in complete_draft_stems for p in parts):
            continue

        consensus = serp_consensus.get(stem, 1)
        if consensus < min_required_consensus:
            continue

        weight = round(0.50 + (0.15 * min(consensus, 5)), 4)
        deficit_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=weight,
                competitor_consensus_count=consensus,
            )
        )

    deficit_items.sort(key=lambda x: (x.competitor_consensus_count, x.tfidf_weight), reverse=True)
    top_deficit = _deduplicate_subsumed_unigrams(deficit_items, limit=10)

    return EntityGapsGroup(deficit=top_deficit, gain=top_gain)
