export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green' | null;

export interface AnnotatedSpan {
  text: string;
  color: HighlightColor;
  label: string | null;
}

export interface EntityGapItem {
  term_string: string;
  term_surface_form: string;
  tfidf_weight: number;
  competitor_consensus_count: number;
}

export interface EntityGaps {
  deficit: EntityGapItem[];
  gain: EntityGapItem[];
}

export interface AuditMetrics {
  content_differentiation_score: number;
  avg_cosine_similarity: number;
  max_cosine_similarity: number;
  euclidean_distance: number;
  ttr_score: number;
  mattr_score: number;
  hko_percentage: number;
  is_redundant: boolean;
  is_keyword_stuffed: boolean;
}

export interface QualityThresholds {
  max_cosine_similarity: number;
  min_mattr: number;
  max_hko_percentage: number;
  min_cds_score: number;
}

export interface AuditExecuteRequest {
  target_query: string;
  draft_title?: string;
  draft_content: string;
  parent_session_id?: string | null;
  use_cached_serp?: boolean;
  thresholds?: QualityThresholds;
}

export interface AuditExecuteResponse {
  session_id: string;
  parent_session_id: string | null;
  turn_number: number;
  target_query: string;
  draft_title: string;
  draft_word_count: number;
  audit_timestamp: string;
  verdict_status: 'Layak Terbit' | 'Perlu Revisi';
  degradation_warning: string | null;
  thresholds: QualityThresholds;
  metrics: AuditMetrics;
  entity_gaps: EntityGaps;
  annotated_spans: AnnotatedSpan[];
  overview_bullets: string[];
  remediation_prompt: string;
}

export interface AuditSessionSummary {
  session_id: string;
  parent_session_id: string | null;
  turn_number: number;
  target_query: string;
  draft_title: string;
  audit_timestamp: string;
  verdict_status: 'Layak Terbit' | 'Perlu Revisi';
  score_cds: number;
  is_pinned?: boolean;
}

export interface ExtractFileResponse {
  filename: string;
  file_format: string;
  extracted_text: string;
  word_count: number;
}
