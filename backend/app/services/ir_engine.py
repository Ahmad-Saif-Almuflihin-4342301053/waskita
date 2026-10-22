"""
IR Engine Module for WASKITA
White-Box Deterministik Information Retrieval & Stylometric Engine
Menggabungkan VSM, Information Gain, Stilometri, dan Gatekeeper Decision.
"""

from typing import Any, Dict, List, Optional, Tuple

from app.schemas.audit import AnnotatedSpan, EntityGapsGroup, ThresholdConfig
from app.services.vsm_calculator import compute_vsm_similarity
from app.services.information_gain import calculate_information_gain
from app.services.stylometrics import (
    calculate_stylometrics,
    calculate_ttr,
    calculate_mattr,
    calculate_hko,
    extract_headings_from_markdown_or_text,
    _tokenize_words,
)
from app.services.gatekeeper import (
    calculate_composite_cds,
    generate_annotated_spans,
    generate_overview_and_remediation,
    CLICHE_PHRASES,
)

# Aliases sesuai nomenklatur Proposal TA Bab 2 & Dokumen Blueprint Bab 6
calculate_stylometry = calculate_stylometrics
aggregate_gatekeeper_decision = calculate_composite_cds

__all__ = [
    "compute_vsm_similarity",
    "calculate_information_gain",
    "calculate_stylometrics",
    "calculate_stylometry",
    "calculate_ttr",
    "calculate_mattr",
    "calculate_hko",
    "extract_headings_from_markdown_or_text",
    "_tokenize_words",
    "calculate_composite_cds",
    "aggregate_gatekeeper_decision",
    "generate_annotated_spans",
    "generate_overview_and_remediation",
    "CLICHE_PHRASES",
]
