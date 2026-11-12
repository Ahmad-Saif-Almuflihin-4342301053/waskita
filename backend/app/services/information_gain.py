import re
from typing import Any, Dict, List, Optional, Set, Tuple
from app.schemas.audit import EntityGapItem, EntityGapsGroup
from app.services.gatekeeper import is_commercial_or_sponsor
from app.services.nlp_pipeline import (
    ALL_INDONESIAN_STOPWORDS,
    FORBIDDEN_GAIN_CONNECTOR_WORDS,
    NON_TOPICAL_VERBS_AND_ADJECTIVES,
    is_narrative_noise,
)


def find_snippet_and_domain(
    term_stem: str, term_surface: str, competitor_docs: Optional[List[Any]]
) -> Tuple[Optional[str], Optional[str]]:
    """
    Ekstrak 1 kalimat cuplikan nyata dan domain artikel kompetitor untuk White-Box Forensics (Sprint 4.4).
    """
    if not competitor_docs:
        return None, None
    stem_low = term_stem.lower().strip()
    surface_low = term_surface.lower().strip()

    for doc in competitor_docs:
        text = ""
        domain = ""
        if isinstance(doc, dict):
            text = doc.get("clean_text") or doc.get("snippet_text") or ""
            domain = doc.get("domain_name") or ""
        elif isinstance(doc, str):
            text = doc

        if not text:
            continue

        sentences = re.split(r"(?<=[.!?])\s+", text)
        for s in sentences:
            s_clean = s.strip()
            s_low = s_clean.lower()
            # DOM-03: Word-boundary matching agar tidak mencocokkan substring acak di dalam kata lain
            matched = False
            for cand in (surface_low, stem_low):
                if not cand:
                    continue
                if re.search(rf"\b{re.escape(cand)}\b", s_low):
                    matched = True
                    break
            if matched and len(s_clean.split()) >= 5:
                if len(s_clean) > 160:
                    s_clean = s_clean[:157] + "..."
                return s_clean, domain or None
    return None, None


def _find_competitor_snippet(
    term_stem: str, term_surface: str, competitor_docs: Optional[List[Any]]
) -> Optional[str]:
    """
    Ekstrak 1 kalimat cuplikan nyata dari artikel kompetitor yang memuat kata defisit (Sprint 4.4).
    Memberikan konteks empiris kepada penulis mandiri tanpa perlu bertanya ke AI.
    """
    if not competitor_docs:
        return None
    stem_low = term_stem.lower().strip()
    surface_low = term_surface.lower().strip()

    for doc in competitor_docs:
        text = ""
        domain = ""
        if isinstance(doc, dict):
            text = doc.get("clean_text") or doc.get("snippet_text") or ""
            domain = doc.get("domain_name") or ""
        elif isinstance(doc, str):
            text = doc

        if not text:
            continue

        sentences = re.split(r"(?<=[.!?])\s+", text)
        for s in sentences:
            s_clean = s.strip()
            s_low = s_clean.lower()
            # DOM-03: Word-boundary matching agar cuplikan kompetitor presisi
            matched = False
            for cand in (surface_low, stem_low):
                if not cand:
                    continue
                if re.search(rf"\b{re.escape(cand)}\b", s_low):
                    matched = True
                    break
            if matched and len(s_clean.split()) >= 5:
                if len(s_clean) > 160:
                    s_clean = s_clean[:157] + "..."
                if domain:
                    return f'"{s_clean}" ({domain})'
                return f'"{s_clean}"'
    return None


def _deduplicate_subsumed_unigrams(items: List[EntityGapItem], limit: int = 12) -> List[EntityGapItem]:
    """
    Bigram Subsumption Filter (Sprint 4.1 & 4.4):
    Jika suatu bigram 'A B' sudah masuk daftar teratas, hilangkan unigram 'A' atau 'B'
    yang konsensusnya tidak lebih tinggi dari bigram tersebut agar tidak terjadi duplikasi chip.
    Item konsensus prioritas dipertahankan.
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
        if len(parts) == 1 and not it.is_consensus_priority:
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
    consensus_serp_stems: Optional[Set[str]] = None,
    competitor_docs: Optional[List[Any]] = None,
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
        if stem in NON_TOPICAL_VERBS_AND_ADJECTIVES or surface.lower() in NON_TOPICAL_VERBS_AND_ADJECTIVES:
            continue
        parts = stem.split()
        if any(p in FORBIDDEN_GAIN_CONNECTOR_WORDS for p in parts):
            continue
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
    # Sprint 4.4: Sinkronisasi Top-25 Konsensus SERP (Single Source of Truth)
    missing_consensus_stems: Set[str] = set()
    if consensus_serp_stems:
        clean_consensus = {
            st for st in consensus_serp_stems
            if st not in NON_TOPICAL_VERBS_AND_ADJECTIVES
            and not is_narrative_noise(st)
            and st not in ALL_INDONESIAN_STOPWORDS
        }
        missing_consensus_stems = clean_consensus - complete_draft_stems

    deficit_stems = (set(serp_map.keys()) - complete_draft_stems) | missing_consensus_stems
    deficit_items: List[EntityGapItem] = []
    min_required_consensus = 2 if num_competitors >= 2 else 1

    for stem in deficit_stems:
        surface = serp_map.get(stem)
        if not surface:
            # Cari surface form dari daftar entitas kompetitor jika tersedia
            for comp_ents in competitor_entities_list:
                for s, surf, _ in comp_ents:
                    if s == stem:
                        surface = surf
                        break
                if surface:
                    break
            if not surface:
                surface = stem.title()

        if is_commercial_or_sponsor(stem) or is_commercial_or_sponsor(surface):
            continue
        # Filter kata kerja/sifat non-topikal & polusi klitik naratif (Sprint 4.2 & 4.4)
        if (
            stem in NON_TOPICAL_VERBS_AND_ADJECTIVES
            or surface.lower() in NON_TOPICAL_VERBS_AND_ADJECTIVES
            or is_narrative_noise(stem)
            or is_narrative_noise(surface)
        ):
            continue
        if len(stem) < 4 and " " not in stem:
            continue
        parts = stem.split()
        if any(p in NON_TOPICAL_VERBS_AND_ADJECTIVES for p in parts):
            continue
        if any(p in FORBIDDEN_GAIN_CONNECTOR_WORDS for p in parts):
            continue
        if any(is_narrative_noise(p) for p in parts):
            continue

        # Jika bigram yang semua kata penyusunnya sudah ada di draf, lewati agar tidak redundan
        if len(parts) > 1 and all(p in complete_draft_stems for p in parts):
            continue

        consensus = serp_consensus.get(stem, 1)
        is_priority = stem in missing_consensus_stems

        # Item konsensus prioritas wajib lolos meskipun consensus < min_required_consensus
        if not is_priority and consensus < min_required_consensus:
            continue

        weight = round(0.50 + (0.15 * min(consensus, 5)), 4)
        if is_priority:
            weight = round(weight * 1.25, 4)

        snippet = _find_competitor_snippet(stem, surface, competitor_docs)

        deficit_items.append(
            EntityGapItem(
                term_string=stem,
                term_surface_form=surface.title(),
                tfidf_weight=weight,
                competitor_consensus_count=consensus,
                is_consensus_priority=is_priority,
                competitor_snippet=snippet,
            )
        )

    # Urutkan: Konsensus prioritas (#1) paling atas, diikuti frekuensi konsensus dan bobot TF-IDF
    deficit_items.sort(
        key=lambda x: (1 if x.is_consensus_priority else 0, x.competitor_consensus_count, x.tfidf_weight),
        reverse=True,
    )
    top_deficit = _deduplicate_subsumed_unigrams(deficit_items, limit=12)

    return EntityGapsGroup(deficit=top_deficit, gain=top_gain)
