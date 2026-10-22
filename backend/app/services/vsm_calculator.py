import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from typing import Dict, List, Tuple


def compute_vsm_similarity(
    preprocessed_draft: str,
    preprocessed_competitors: List[str],
) -> Dict[str, any]:
    """
    Operasi CPU berat #3:
    Pembentukan matriks TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2))
    dan kalkulasi cosine_similarity & euclidean_distances.
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
    
    # Sublinear TF-IDF Weighting (Persamaan 2.1)
    vectorizer = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 2),
        min_df=1,
        norm="l2",
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    draft_vec = tfidf_matrix[0:1]
    competitor_vecs = tfidf_matrix[1:]
    
    # Cosine Similarity (Persamaan 2.2)
    cosine_sims = cosine_similarity(draft_vec, competitor_vecs)[0]
    
    # Euclidean Distance pada vektor ternormalisasi L2 (Persamaan 2.3)
    euclidean_dists = euclidean_distances(draft_vec, competitor_vecs)[0]
    
    avg_cosine = float(np.mean(cosine_sims)) if len(cosine_sims) > 0 else 0.0
    max_cosine = float(np.max(cosine_sims)) if len(cosine_sims) > 0 else 0.0
    avg_euclidean = float(np.mean(euclidean_dists)) if len(euclidean_dists) > 0 else 0.0
    
    # Mengambil bobot TF-IDF kata pada draft untuk kalkulasi Information Gain
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
