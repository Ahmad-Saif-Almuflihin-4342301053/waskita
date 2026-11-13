import numpy as np
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.preprocessing import normalize
from typing import Any, Dict, List


def compute_vsm_similarity(
    preprocessed_draft: str,
    preprocessed_competitors: List[str],
    k1: float = 1.5,
    b: float = 0.75,
) -> Dict[str, Any]:
    """
    Operasi CPU berat #3:
    Pembentukan matriks BM25-Saturated L2-Normalized Vector Space Model (Robertson & Zaragoza, 2009; DOM-02).
    Menerapkan saturasi frekuensi istilah k1 dan normalisasi panjang dokumen b ke dalam ruang vektor Euclidean L2,
    mempertahankan batas domain kedekatan sudut [0.0, 1.0] dan jarak Euclidean [0.0, sqrt(2)].
    Wajib dieksekusi via run_in_threadpool / asyncio.to_thread!
    """
    if not preprocessed_competitors:
        return {
            "cosine_similarities": [],
            "avg_cosine_similarity": 0.0,
            "max_cosine_similarity": 0.0,
            "euclidean_distance": 0.0,
            "draft_tfidf_weights": {},
        }

    corpus = [preprocessed_draft] + preprocessed_competitors
    vectorizer = CountVectorizer(ngram_range=(1, 2), min_df=1)
    tf_matrix = vectorizer.fit_transform(corpus)
    n_docs, n_vocab = tf_matrix.shape

    doc_lens = np.array(tf_matrix.sum(axis=1)).flatten()
    avgdl = float(np.mean(doc_lens)) if n_docs > 0 else 1.0
    if avgdl <= 0:
        avgdl = 1.0

    # Smoothed IDF untuk mikro-korpus web (Manning et al., 2008 & Robertson, 2009)
    # Mencegah bobot 0 atau negatif pada istilah yang muncul di beberapa dokumen korpus kecil (N=4)
    df = np.bincount(tf_matrix.indices, minlength=n_vocab)
    idf = np.log((1.0 + n_docs) / (1.0 + df)) + 1.0

    def _apply_bm25_l2(matrix: csr_matrix, lengths: np.ndarray) -> csr_matrix:
        coo = matrix.tocoo()
        if coo.nnz == 0:
            return matrix.astype(np.float64)
        row, col, data = coo.row, coo.col, coo.data
        len_norm = 1.0 - b + b * (lengths[row] / avgdl)
        denom = data + k1 * len_norm
        bm25_tf = (data * (k1 + 1.0)) / denom
        bm25_weights = bm25_tf * idf[col]
        sparse_mat = csr_matrix((bm25_weights, (row, col)), shape=matrix.shape, dtype=np.float64)
        return normalize(sparse_mat, norm="l2", axis=1)

    l2_corpus_matrix = _apply_bm25_l2(tf_matrix, doc_lens)
    draft_vec = l2_corpus_matrix[0:1]
    competitor_vecs = l2_corpus_matrix[1:]

    # Cosine Similarity Global pada ruang BM25-VSM L2
    global_cosine_sims = cosine_similarity(draft_vec, competitor_vecs)[0]

    # Sliding-Window Passage Cosine Similarity untuk mencegah delusi panjang dokumen (Sprint 4.1)
    draft_words = preprocessed_draft.split()
    draft_len = len(draft_words)
    effective_cosine_sims = []

    for idx, comp_text in enumerate(preprocessed_competitors):
        g_sim = float(global_cosine_sims[idx])
        comp_words = comp_text.split()
        comp_len = len(comp_words)

        # Jika dokumen kompetitor > 1.35x lebih panjang dari draf (dan draf >= 40 kata stem)
        if draft_len >= 40 and comp_len > int(draft_len * 1.35):
            window_size = draft_len
            stride = max(25, draft_len // 3)
            windows = []
            for start in range(0, comp_len - window_size + 1, stride):
                windows.append(" ".join(comp_words[start : start + window_size]))
            if comp_len > window_size:
                windows.append(" ".join(comp_words[-window_size:]))

            if windows:
                win_tf = vectorizer.transform(windows)
                win_lens = np.array(win_tf.sum(axis=1)).flatten()
                win_l2 = _apply_bm25_l2(win_tf, win_lens)
                win_sims = cosine_similarity(draft_vec, win_l2)[0]
                max_win_sim = float(np.max(win_sims))
                blended_sim = 0.35 * g_sim + 0.65 * max_win_sim
                effective_cosine_sims.append(max(g_sim, blended_sim))
            else:
                effective_cosine_sims.append(g_sim)
        else:
            effective_cosine_sims.append(g_sim)

    cosine_sims = np.array(effective_cosine_sims)

    # Euclidean Distance pada vektor ternormalisasi L2
    euclidean_dists = euclidean_distances(draft_vec, competitor_vecs)[0]

    avg_cosine = float(np.mean(cosine_sims)) if len(cosine_sims) > 0 else 0.0
    max_cosine = float(np.max(cosine_sims)) if len(cosine_sims) > 0 else 0.0
    avg_euclidean = float(np.mean(euclidean_dists)) if len(euclidean_dists) > 0 else 0.0

    # Mengambil bobot fitur pada draft untuk kalkulasi Information Gain
    feature_names = vectorizer.get_feature_names_out()
    draft_tfidf_weights = {}
    draft_nonzeros = draft_vec.tocoo()
    for col_idx, weight in zip(draft_nonzeros.col, draft_nonzeros.data):
        draft_tfidf_weights[feature_names[col_idx]] = float(weight)

    return {
        "cosine_similarities": [float(s) for s in cosine_sims],
        "avg_cosine_similarity": round(avg_cosine, 4),
        "max_cosine_similarity": round(max_cosine, 4),
        "euclidean_distance": round(avg_euclidean, 4),
        "draft_tfidf_weights": draft_tfidf_weights,
    }
