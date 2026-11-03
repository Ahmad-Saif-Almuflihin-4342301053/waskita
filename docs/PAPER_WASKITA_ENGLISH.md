# Waskita: Pre-Publication Curation of Web Article Drafts via Multi-Dimensional Semantic Differentiation and Dual-Tier Veto Gating

**Running Title:** *Pre-Publication Curation via Semantic Differentiation* (53 characters)

**Ahmad Saif Almuflihin**¹*  
¹ *Software Engineering Technology Study Program (Teknologi Rekayasa Perangkat Lunak), Department of Informatics Engineering, Politeknik Negeri Batam, Jl. Ahmad Yani, Batam Kota, Batam 29461, Kepulauan Riau, Indonesia*  
\* **Corresponding Author:** Ahmad Saif Almuflihin (NIM: 4342301053; Email: `asamuphp@gmail.com`)

---

## Abstract
Generative artificial intelligence now produces nearly half of all newly published web articles, yet uncurated drafts frequently suffer from severe search engine ranking collapse due to topical redundancy and rigid stylometric patterns. Existing search engine optimization (SEO) platforms exhibit substantial metric discrepancies across commercial tools and rely on opaque scoring or shallow heading comparisons without measuring entity-level information gain. This paper presents **Waskita**, a deterministic, white-box pre-publication curation framework developed using the Design Science Research Methodology (DSRM) to audit Indonesian web article drafts prior to publication. Waskita integrates sublinear Term Frequency–Inverse Document Frequency (TF-IDF) cosine similarity, set-theoretic entity Information Gain ($\Delta_{\text{gain}}$ and $\Delta_{\text{deficit}}$), Moving-Average Type-Token Ratio ($\text{MATTR}_{50}$), and Heading-Keyword Overlap (HKO) into a composite Content Differentiation Score (CDS), reinforced by a Topic Relevance Gate and a sentence-level Red-Span Density Veto Gate. We evaluated the framework across a deterministic benchmark corpus of 30 annotated Indonesian web drafts and conducted live search engine results page (SERP) adversarial stress tests across five control conditions. Experimental evaluation demonstrated that Waskita achieved 100.0% classification accuracy, precision, recall, and F1-score ($1.0000$) on the 30-draft benchmark, separating publication-ready articles (mean $\text{CDS} = 83.5\% \pm 1.0\%$) from uncurated drafts (mean $\text{CDS} = 70.3\% \pm 1.0\%$). Multi-page SERP harvesting at a 30-candidate sweet spot yielded seven valid competitor articles within $7.19\text{ s}$, while the dual-veto gates reduced false-positive acceptance of partial plagiarism and out-of-domain drafts from $100.0\%$ to $0.0\%$. These findings confirm that interpretable multi-dimensional semantic gating provides an accurate, low-latency barrier against degraded web content.

**Keywords:** *Information Quality Assessment; Vector Space Model; Information Gain; Stylometric Analysis; Search Engine Optimization; Design Science Research Methodology*

### Research Highlights
* Develops a white-box pre-publication gatekeeper for Indonesian web article drafts.
* Combines sublinear TF-IDF cosine similarity, entity Information Gain, $\text{MATTR}_{50}$, and HKO.
* Introduces Topic Relevance and Red-Span Density Veto Gates against adversarial text.
* Achieves $1.0000$ F1-score on 30 benchmark drafts and $7.19\text{ s}$ live SERP audit latency.

---

## 1. Introduction

The proliferation of large language models (LLMs) has fundamentally altered the economics of web publishing, shifting the primary bottleneck from content generation to pre-publication quality control. A large-scale longitudinal analysis of Common Crawl web archives by Paredes et al. [1] revealed that AI-generated articles accounted for approximately 50% of newly published online articles by the first quarter of 2026. Because automated text generation reduces marginal production costs to near zero, digital publishers increasingly deploy mass-generation pipelines to capture search engine traffic. In response, commercial search engines have tightened algorithmic quality thresholds through Google Search Essentials and Scaled Content Abuse enforcement policies [2, 3], which penalize pages that replicate existing corpus knowledge without providing distinct informational value.

Despite the massive upstream volume of synthetic text, empirical ranking studies expose a sharp downstream performance paradox in search engine results pages (SERPs). An industry-wide audit of Ahrefs and Semrush ranking distributions by Fatai [4] demonstrated that human-curated articles still occupy 82.2% of Top 3 organic SERP positions. Similarly, a controlled 16-month longitudinal experiment by Babiak [5] tracked uncurated AI-generated web pages and documented a severe ranking collapse: while synthetic pages initially achieved 28% index visibility during the first month, their visibility dropped to 3% by the third month. Consequently, publishing uncurated drafts exposes domain owners to rapid de-indexing and wasted editorial expenditure.

The root cause of this ranking collapse lies in two measurable linguistic defects: semantic derivative redundancy and rigid surface stylometry. In a longitudinal study of search engine spam across European web corpora, Bevendorff et al. [6] proved that low-quality SEO texts exhibit artificially inflated Heading-Keyword Overlap (HKO, with a coefficient of determination $R^2 = 0.98$ against spam classifications) alongside depressed lexical diversity as measured by the Type-Token Ratio (TTR). Complementing these findings, Rodrigues et al. [7] conducted a linguistic comparison between human and AI texts using LIWC and SAGE lexicons, confirming that uncurated machine prose suffers from repetitive syntactic framing and narrower vocabulary dispersion. Furthermore, Rodrigues et al. [7] observed that the classification accuracy of black-box neural AI detectors drops from 93% on raw synthetic text to 75% when drafts undergo light human editing. Driven by these limitations, 64% of editorial practitioners have transitioned toward hybrid human-in-the-loop workflows [4], where human editors curate and enrich drafts prior to publication.

However, editorial teams currently lack transparent, pre-publication auditing software capable of quantifying whether a web draft is genuinely differentiated from active SERP competitors. At the macro platform level, Font-Julian et al. [8] evaluated commercial SEO auditing suites and uncovered substantial inter-tool metric discrepancies caused by proprietary black-box scoring heuristics that cannot be independently verified. At the micro algorithmic level, automated content-gap scripts—such as the keyword-clustering workflow proposed by Roque [9] and open-source heading comparators—evaluate topical coverage solely by matching surface strings in document titles or subheadings without inspecting paragraph-level semantic overlap. Although vector space models (VSM) enable multi-dimensional meaning representation in large text collections [10–12], and the Google patent by Cărbune and Anders [13] formalizes contextual link Information Gain as the set difference of informational entities between a candidate document and previously consumed pages, these mathematical constructs have not been unified into an interactive, deterministic pre-publication gatekeeper for Indonesian web articles.

To bridge this gap, this study adopts the Design Science Research Methodology (DSRM) formalized by Geerts [14] and Peffers et al. [15]. In engineering research, it is essential to distinguish between the engineering task and the scientific objectives. Our engineering task is to design and implement **Waskita** (*Web-Article Semantic and Quality Inspection Tool for Pre-Publishing Audit*), a five-layer white-box software artifact tailored for Indonesian morphological processing. Our scientific objectives are threefold: (1) to evaluate whether combining sublinear TF-IDF cosine similarity, set-theoretic entity Information Gain ($\Delta_{\text{gain}}$ and $\Delta_{\text{deficit}}$), Moving-Average Type-Token Ratio ($\text{MATTR}_{50}$), and HKO accurately discriminates publication-ready drafts from degraded web texts; (2) to investigate failure modes of macro document-level scoring under adversarial partial plagiarism and topic shifts; and (3) to determine the optimal SERP harvesting depth that balances competitor coverage against interactive response latency [16, 17].

Specifically, the main contributions of this work are fourfold:
* **Unified Multi-Dimensional Semantic Formulation:** We formulate a deterministic Content Differentiation Score (CDS) that integrates macro VSM cosine similarity (35% weight), meso entity-level Information Gain (30% weight), and micro lexical stylometrics via $\text{MATTR}_{50}$ (20% weight) and HKO (15% weight) over Nazief–Adriani stemmed Indonesian corpora [18, 19].
* **Dual-Tier Adversarial Veto Gating:** Through iterative DSRM prototyping, we identify and resolve two structural blind spots in macro document-level aggregation by introducing a Topic Relevance Gate (average cosine similarity $< 0.05$) and a sentence-level Red-Span Density Veto Gate (redundant sentence ratio $\ge 0.20$).
* **Resilient Multi-Page SERP Harvesting Architecture:** We engineer an asynchronous three-page SERP acquisition pipeline combining HTTP/2 client pooling, Chrome TLS fingerprint impersonation fallback, and graceful degradation to guarantee competitor corpus extraction under anti-bot constraints.
* **Empirical Benchmark and Live Stress Validation:** We validate Waskita on a deterministic fixture of 30 annotated Indonesian drafts (achieving an F1-score of $1.0000$) and five live SERP adversarial control scenarios, establishing a 30-candidate sweet spot that completes full audits in $7.19\text{ s}$.

The remainder of this paper is organized as follows. Section 2 reviews related work on search engine quality degradation, vector space semantics, and content gap analysis. Section 3 details the DSRM research workflow, five-layer software architecture, and mathematical formulations of Waskita. Section 4 presents the quantitative evaluation results across the 30-draft benchmark and live SERP stress tests. Section 5 discusses the mechanistic explanations, literature comparisons, and scope limitations, and Section 6 concludes the paper.

---

## 2. Related Work

### 2.1 Longitudinal Analyses of Search Engine Spam and AI Text Characteristics
Recent empirical investigations have quantified the structural degradation of web search ecosystems caused by automated content generation. Paredes et al. [1] analyzed Common Crawl snapshots and demonstrated that synthetic articles reached parity with human-authored articles by early 2026, while Babiak [5] proved through a 16-month controlled field experiment that uncurated synthetic pages experience a 28% to 3% visibility collapse within 90 days of indexing. Whereas Paredes et al. [1] and Babiak [5] characterize macro-level indexing outcomes, they do not provide a computational software instrument to diagnose draft quality prior to publication.

At the linguistic level, Bevendorff et al. [6] conducted a one-year longitudinal study of SEO spam across commercial search engines and established that low-quality SEO pages share two robust statistical signatures: excessive keyword repetition inside structural headings (HKO, $R^2 = 0.98$) and compressed vocabulary diversity (TTR). In a complementary study, Rodrigues et al. [7] compared human-written and LLM-generated texts using psycholinguistic dictionaries, showing that synthetic drafts exhibit uniform sentence complexity and that black-box neural classifiers suffer an 18-percentage-point accuracy drop (from 93% to 75%) when evaluating hybrid human-edited texts. In contrast to black-box neural detectors that attempt to guess author identity (AI vs. human), Waskita operationalizes the interpretable stylometric boundaries of Bevendorff et al. [6] alongside length-invariant moving-average lexical diversity to evaluate intrinsic text quality regardless of whether the draft was written by a human, an LLM, or a hybrid workflow.

### 2.2 Automated Content Gap Analysis and Vector Space Representations
Evaluating whether a draft contributes new knowledge requires comparing its semantic representation against existing top-ranked documents. Font-Julian et al. [8] audited commercial SEO platforms across scholarly and informational web domains, demonstrating that proprietary scoring algorithms produce inconsistent metrics due to undisclosed weighting rules. To automate topical gap discovery, Roque [9] developed a semantic keyword-clustering pipeline for Portuguese search queries. However, Roque's approach [9] operates on external keyword lists and heading tags rather than full-text discourse, leaving paragraph-level redundancy undetected.

To capture document-level semantics transparently, Poschmann et al. [10] demonstrated that classic Vector Space Models (VSM) grounded in Salton et al.'s [11] and Manning et al.'s [12] TF-IDF representations provide interpretable, deterministic measures of relational meaning across large text collections without the opacity of deep neural embeddings. Furthermore, Cărbune and Anders [13] formalized Contextual Estimation of Link Information Gain in U.S. Patent 11,354,342 B2, defining the informational value of a candidate document relative to previously viewed documents on the same topic. While Cărbune and Anders [13] formulated Information Gain for search engine ranking and browser link prediction, Waskita adapts their set-theoretic entity differentiation principle into a pre-publication editorial gatekeeper, explicitly decomposing entities into novel contributions ($\Delta_{\text{gain}}$) and missing consensus topics ($\Delta_{\text{deficit}}$).

### 2.3 State-of-the-Art Comparison Matrix
To position our contribution clearly against prior literature, Table 1 synthesizes five representative studies across their primary research focus, underlying methodology, key empirical findings, and technical limitations relative to pre-publication curation.

**Table 1:** State-of-the-art comparison between prior studies and the proposed Waskita framework.

| Author(s) & Year | Research Focus | Methodology / Core Metrics | Key Empirical Findings | Technical Limitation / Gap Addressed by Waskita |
| :--- | :--- | :--- | :--- | :--- |
| **Roque [9] (2023)** | Automated SEO content gap discovery | Semantic clustering of search keywords & heading comparison | Reduced manual keyword grouping time for Portuguese web editors | Inspects only keyword lists and H1–H3 tags; ignores full-text redundancy and lexical stylometrics |
| **Bevendorff et al. [6] (2024)** | Longitudinal audit of SEO spam in web search | Surface stylometrics: TTR, Heading-Keyword Overlap (HKO), link density | Proved HKO ($R^2 = 0.98$) and low TTR strongly predict SEO spam rankings | Diagnostic observation study only; classic TTR is biased by document length and lacks entity gap extraction |
| **Poschmann et al. [10] (2024)** | Multidimensional meaning in text corpora | TF-IDF Vector Space Model (VSM) & cosine similarity | Validated transparent VSM interpretability over opaque neural models | Does not measure asymmetrical entity Information Gain ($\Delta_{\text{gain}}$ / $\Delta_{\text{deficit}}$) or sentence-level plagiarism |
| **Font-Julian et al. [8] (2026)** | Reliability of commercial SEO auditing platforms | Cross-platform comparative metric analysis | Exposed substantial discrepancies across black-box commercial SEO scores | Highlights the need for a deterministic, open-formula (white-box) pre-publication auditing engine |
| **Rodrigues et al. [7] (2026)** | Linguistic comparison of human vs. AI content | LIWC & SAGE psycholinguistic features; AI detector testing | Showed AI text homogeneity; AI detector accuracy fell from 93% to 75% on edited text | Binary authorship classifiers fail on hybrid workflows and provide no actionable SERP entity gap feedback |
| **Waskita (This Study, 2026)** | Deterministic pre-publication web article curation | Sublinear TF-IDF VSM + Set Information Gain + $\text{MATTR}_{50}$ + HKO + Dual-Veto Gates | $1.0000$ F1-score on 30 Indonesian drafts; 0% false positives on live SERP adversarial tests ($7.19\text{ s}$) | Unifies macro VSM, meso entity Information Gain, micro $\text{MATTR}_{50}$/HKO, and sentence-level veto gating |

As summarized in Table 1, prior works either diagnose web degradation post-hoc [6–8] or evaluate isolated linguistic dimensions [9, 10]. Waskita closes this gap by integrating vector space similarity, set-theoretic entity Information Gain, and length-invariant stylometrics into a unified, white-box gatekeeper.

---

## 3. Methodology and System Architecture

### 3.1 Design Science Research Methodology (DSRM) and System Overview
We structured the engineering lifecycle of Waskita using the six-phase Design Science Research Methodology (DSRM) established by Geerts [14] and Peffers et al. [15]: (1) *Problem Identification* (quantifying SERP ranking collapse and tooling opacity); (2) *Definition of Solution Objectives* (specifying deterministic white-box mathematical requirements with pure math execution time $T_{\text{math}} < 100\text{ ms}$); (3) *Artifact Design and Development* (constructing the five-layer software architecture); (4) *Demonstration* (executing multi-turn pre-publication audits on real Indonesian queries); (5) *Evaluation* (system-centric validation via a 30-draft Confusion Matrix [16] and live SERP latency stress testing [17]); and (6) *Communication* (synthesizing architectural and empirical findings in this manuscript). Within DSRM Phase 3, we employed Evolutionary Prototyping to iteratively calibrate threshold parameters and resolve adversarial failure modes discovered during live SERP testing.

To guarantee modularity and reproducibility, Waskita is architected into five isolated layers, where each computational stage in the pipeline corresponds one-to-one with Subsections 3.2 through 3.4, as illustrated in the five-layer pipeline (Fig. 1).

### 3.2 Stage 1: Asynchronous SERP Acquisition and Indonesian NLP Pipeline
When an editor submits a target search query $Q$ and an article draft $d_{\text{draft}}$, the application orchestrator (FastAPI v0.115) first validates that the draft contains at least $W_{\text{draft}} \ge 300$ words, as shorter snippets lack sufficient lexical variance for stable moving-average entropy estimation. Next, the Ingestion Layer queries the Serper.dev Google Search API configured for the Indonesian locale (`gl = "id"`, `hl = "id"`). Because a single SERP page of 10 raw links frequently contains non-article URLs, Waskita dispatches three concurrent pagination requests (pages 1, 2, and 3) via `asyncio.gather` to harvest up to 30 candidate URLs. A deterministic domain filter purges social media platforms (YouTube, TikTok, Instagram, X), e-commerce marketplaces (Shopee, Tokopedia, Lazada), and binary documents (`.pdf`, `.docx`), while unwrapping search proxy redirects.

To extract clean competitor prose under anti-bot protections, our dual-engine scraper attempts parallel HTTP/2 retrieval using `httpx.AsyncClient` ($7.0\text{ s}$ timeout). If a host returns HTTP 403 Forbidden or a Cloudflare TLS challenge, the scraper automatically falls back to `curl_cffi` with Chrome 120 TLS fingerprint impersonation, selecting the top $k = 5$ valid competitor articles (each $\ge 150$ words). Clean body text and structural headings (`H1`, `H2`, `H3`) are extracted via `Trafilatura` XML parsing in a background thread pool. To ensure high availability (Graceful Degradation, FR-13), if only $k \in \{2, 3, 4\}$ pages succeed, Waskita computes metrics proportionally and attaches a partial-degradation banner; if $k < 2$ pages succeed, the transaction aborts safely with HTTP 503.

In Layer 4, both $d_{\text{draft}}$ and the competitor corpus $D_{\text{SERP}} = \{d_1, \dots, d_k\}$ undergo Indonesian morphological normalization. Following case folding and regular-expression tokenization, tokens are filtered against a composite stopword list combining the Sastrawi Indonesian dictionary [18, 19] with a curated web-cruft stoplist (`www`, `http`, `https`, `html`, `pdf`, `url`, `baca`, `klik`, `komentar`, `iklan`). Remaining tokens are reduced to their root lemmas using the `PySastrawi` Nazief–Adriani morphological stemmer [18, 19] accelerated by an in-memory least-recently-used cache (`@lru_cache(maxsize=100,000)`) while preserving a bidirectional mapping between each stemmed root (`term_string`) and its original surface inflection (`term_surface_form`).

### 3.3 Stage 2: Vector Space Modeling and Set-Theoretic Information Gain
We selected a deterministic TF-IDF Vector Space Model [10–12] over black-box deep neural embeddings (such as BERT) for three engineering reasons: (1) VSM provides exact, auditable feature weights for every unigram and bigram; (2) sparse matrix algebra executes in $< 50\text{ ms}$ on a standard CPU without GPU acceleration; and (3) vector dimensions map directly to discrete topical entities required for set-difference Information Gain. Across the active session corpus $D = \{d_{\text{draft}}\} \cup D_{\text{SERP}}$ of size $N = 1 + k$, Waskita constructs a vocabulary $V$ of unigrams and bigrams and applies sublinear TF-IDF weighting as defined in

$$\text{TF-IDF}(t, d, D) = \left[1 + \ln \text{TF}(t, d)\right] \times \left[\ln\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1\right] \qquad (1)$$

where $\text{TF}(t, d) > 0$ denotes the raw frequency of term $t$ in document $d$, $\text{DF}(t)$ represents the number of documents in $D$ containing term $t$, and sublinear logarithmic scaling dampens the influence of bursty term repetition. Let $\mathbf{A}$ and $\mathbf{B}_j$ denote the L2-normalized TF-IDF vectors of the user draft and the $j$-th SERP competitor ($j \in \{1, \dots, k\}$), respectively. Semantic overlap is quantified via Cosine Similarity in

$$\text{CosineSim}(\mathbf{A}, \mathbf{B}_j) = \frac{\mathbf{A} \cdot \mathbf{B}_j}{\|\mathbf{A}\| \times \|\mathbf{B}_j\|}, \quad S_{\cos,\max} = \max_{j} \text{CosineSim}(\mathbf{A}, \mathbf{B}_j) \qquad (2)$$

where $S_{\cos,\max}$ captures peak redundancy against the closest single competitor and $S_{\cos,\text{avg}} = \frac{1}{k}\sum_{j=1}^{k} \text{CosineSim}(\mathbf{A}, \mathbf{B}_j)$ measures mean topical alignment across the SERP cohort. Because unnormalized Euclidean distance is biased by physical document length, Waskita computes Euclidean distance strictly on L2-normalized vectors as a secondary geometric diagnostic in

$$d_{L2}(\mathbf{A}, \mathbf{B}_j) = \sqrt{\sum_{i=1}^{|V|} (A_i - B_{j,i})^2} = \sqrt{2 - 2\,\text{CosineSim}(\mathbf{A}, \mathbf{B}_j)} \qquad (3)$$

where $A_i$ and $B_{j,i}$ are the L2-normalized TF-IDF weights of term $i$. Building on Cărbune and Anders [13], let $E_{\text{draft}}$ denote the set of top informative unigram and bigram entities extracted from the user draft, and let $E_{\text{SERP}} = \bigcup_{j=1}^{k} E_j$ denote the union of competitor entities accompanied by their document consensus count $c(e) \in \{1, \dots, k\}$. We decompose entity-level semantic differentiation into Novel Information Gain ($\Delta_{\text{gain}}$) and Content Deficit ($\Delta_{\text{deficit}}$) via the set-difference operations

$$\Delta_{\text{gain}} = E_{\text{draft}} \setminus E_{\text{SERP}} \qquad (4)$$

$$\Delta_{\text{deficit}} = \left\{ e \in E_{\text{SERP}} \setminus E_{\text{draft}} \;\middle|\; c(e) \ge 2 \text{ or } \text{TF-IDF}(e) \ge P_{75} \right\} \qquad (5)$$

where $P_{75}$ is the 75th-percentile TF-IDF weight across the competitor corpus. Filtering $\Delta_{\text{deficit}}$ by $c(e) \ge 2$ ensures that authors are prompted to cover substantive subtopics shared by at least two top-ranking competitors rather than idiosyncratic noise from a single web page.

### 3.4 Stage 3: Lexical Stylometrics and Composite Gatekeeper Aggregation
To detect surface-level stylometric degradation [6, 7], Waskita computes three complementary metrics. While the classic Type-Token Ratio is defined as $\text{TTR} = |V_{\text{draft}}| / W_{\text{draft}}$, classic TTR decreases monotonically as document length $W_{\text{draft}}$ grows. To eliminate length sensitivity, Waskita computes the Moving-Average Type-Token Ratio ($\text{MATTR}_{50}$) across a sliding window of length $L = 50$ tokens:

$$\text{MATTR}_{50} = \frac{1}{W_{\text{draft}} - L + 1} \sum_{i=1}^{W_{\text{draft}} - L + 1} \frac{|\text{UniqueTokens}(w_i, \dots, w_{i+L-1})|}{L} \qquad (6)$$

where $w_i$ is the $i$-th token in the draft. Next, to guard against heading keyword stuffing identified by Bevendorff et al. [6], Heading-Keyword Overlap (HKO) measures the percentage of structural subheadings (`H1`–`H3`) containing at least one primary query token from $K_{\text{query}}$:

$$\text{HKO}(\%) = \frac{|\{ h \in \text{Headings}(d_{\text{draft}}) : h \cap K_{\text{query}} \neq \emptyset \}|}{\max(1, |\text{Headings}(d_{\text{draft}})|)} \times 100\% \qquad (7)$$

where $\text{Headings}(d_{\text{draft}})$ is the set of Markdown or HTML subheadings in the draft. The four normalized component scores—vector differentiation $C_{\text{VSM}}$ (weight $0.35$), entity Information Gain $C_{\text{IG}}$ (weight $0.30$), lexical richness $C_{\text{MATTR}}$ (weight $0.20$), and heading hygiene $C_{\text{HKO}}$ (weight $0.15$)—are combined into the macro Content Differentiation Score ($\text{CDS}_{\text{macro}} \in [0, 100]$):

$$\text{CDS}_{\text{macro}} = 0.35\,C_{\text{VSM}} + 0.30\,C_{\text{IG}} + 0.20\,C_{\text{MATTR}} + 0.15\,C_{\text{HKO}} \qquad (8)$$

where $C_{\text{VSM}} = \text{clip}(100 \times [1 - \max(0, (S_{\cos,\max} - 0.25)/0.75)], 0, 100)$, $C_{\text{IG}} = \text{clip}(100 \times [0.6(|E_{\text{SERP}} \cap E_{\text{draft}}|/|E_{\text{SERP}}|) + 0.4 \min(1, |\Delta_{\text{gain}}|/5)], 0, 100)$, $C_{\text{MATTR}} = \text{clip}(100 \times \min(1, \text{MATTR}_{50}/\tau_{\text{mattr}}), 0, 100)$, and $C_{\text{HKO}}$ penalizes HKO values exceeding $\tau_{\text{hko}}$.

During Phase 3 DSRM evolutionary prototyping, live SERP stress tests revealed two critical edge cases where $\text{CDS}_{\text{macro}}$ alone produced false-positive acceptances: (1) an out-of-domain draft unrelated to query $Q$ exhibits near-zero cosine similarity ($S_{\cos,\max} \approx 0.02$), which misleadingly maximizes $C_{\text{VSM}} = 100$ and inflates $\text{CDS}_{\text{macro}}$ above $80\%$; and (2) a 350-word draft copied verbatim from a 1,200-word competitor article exhibits a diluted document-level cosine similarity of $0.395$ ($< \tau_{\cos} = 0.60$) despite having $50\%$ plagiarized sentences. To eliminate both vulnerabilities, Waskita enforces a Dual-Tier Veto Gate on the final score $\text{CDS}$:

$$\text{CDS} = \begin{cases} \min(\text{CDS}_{\text{macro}},\, 20.0) & \text{if } S_{\cos,\text{avg}} < \tau_{\text{topic}}, \\ \min(\text{CDS}_{\text{macro}},\, 58.0[1 - (\rho_{\text{red}} - \tau_{\text{red}})]) & \text{if } \rho_{\text{red}} \ge \tau_{\text{red}}, \\ \text{CDS}_{\text{macro}} & \text{otherwise} \end{cases} \qquad (9)$$

where $\tau_{\text{topic}} = 0.05$ is the Topic Relevance Gate threshold, and $\rho_{\text{red}} = |S_{\text{red}}| / |S_{\text{total}}|$ is the proportion of draft sentences exhibiting local sentence-level cosine similarity $\ge 0.65$ against any competitor sentence (with Red-Span Density Veto threshold $\tau_{\text{red}} = 0.20$). Finally, each sentence in the draft is annotated with one of four diagnostic highlighter colors: **red** (sentence-level VSM redundancy $\ge 0.65$), **yellow** (local $\text{TTR} < 0.50$, AI cliché opener, or HKO repetition), **blue** (missing $\Delta_{\text{deficit}}$ topic recommendation), and **green** (high-originality sentence containing $\Delta_{\text{gain}}$ entities).

### 3.5 Parameters, Threshold Calibration, and Experimental Protocol
Following Laramee's reproducibility standard for algorithmic parameters, Table 2 specifies the configurable range, calibrated default value, and functional role of every threshold in Waskita.

**Table 2:** Mathematical parameters, configurable ranges, and calibrated default thresholds in Waskita.

| Parameter Symbol | Software Key | Valid Range | Calibrated Default | Functional Role in Gatekeeper Decision |
| :--- | :--- | :--- | :--- | :--- |
| $W_{\min}$ | `min_draft_words` | $150\text{–}500$ words | $300$ words | Minimum draft length required for stable $\text{MATTR}_{50}$ estimation (FR-02) |
| $k$ (SERP Top-$K$) | `TARGET_COMPETITORS` | $2\text{–}10$ articles | $5$ articles | Active SERP competitor articles extracted from 30 candidates (3 pages) |
| $L$ (Window) | `mattr_window` | $25\text{–}100$ tokens | $50$ tokens | Sliding window length for length-invariant lexical diversity ($\text{MATTR}_{50}$) |
| $\tau_{\cos}$ | `max_cosine_similarity` | $0.30\text{–}0.85$ | $0.60$ | Maximum allowable macro document-level cosine similarity before penalty |
| $\tau_{\text{mattr}}$ | `min_mattr` | $0.40\text{–}0.75$ | $0.55$ | Minimum required Moving-Average Type-Token Ratio for vocabulary richness |
| $\tau_{\text{hko}}$ | `max_hko_percentage` | $20.0\%\text{–}70.0\%$ | $40.0\%$ | Maximum percentage of H1–H3 headings containing primary query tokens |
| $\tau_{\text{topic}}$ | `topic_relevance_floor` | $0.02\text{–}0.15$ | $0.05$ | Topic Relevance Gate: vetoes out-of-domain drafts (caps $\text{CDS} \le 20.0\%$) |
| $\tau_{\text{red}}$ | `red_span_veto_ratio` | $0.10\text{–}0.40$ | $0.20$ | Red-Span Density Veto Gate: vetoes drafts with $\ge 20\%$ plagiarized sentences |
| $\tau_{\text{cds}}$ | `min_cds_score` | $60.0\%\text{–}90.0\%$ | $75.0\%$ | Minimum composite Content Differentiation Score for "Ready to Publish" |

To evaluate classification accuracy objectively without subjective human-survey bias (such as System Usability Scale questionnaires), we executed a system-centric evaluation [14, 16] on a deterministic benchmark corpus (`dataset_30_drafts.json`) comprising 30 Indonesian informational web article drafts ($354$ to $408$ words per draft) spanning 15 distinct topical domains (including culinary arts, clinical oncology, on-page SEO, botany, personal finance, sleep hygiene, electric vehicles, composting, Python programming, ophthalmology, mutual funds, biofloc aquaculture, corporate communication, and thermal burn first aid). Exactly 15 drafts carry an expert ground-truth label of *Publication-Ready* (Positive class), and 15 uncurated synthetic/SEO-stuffed drafts carry a ground-truth label of *Revision-Required* (Negative class). Following Powers [16], classification performance is quantified via Precision, Recall, and F1-score:

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad \text{F1-Score} = \frac{2 \times \text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} \qquad (10)$$

where $\text{TP}, \text{TN}, \text{FP}$, and $\text{FN}$ denote true positives, true negatives, false positives, and false negatives, respectively. All experiments were executed on a Linux workstation (Ubuntu/Mint kernel, Python 3.12, SQLite 3 WAL mode) constrained to a $2.0\text{ GB}$ RAM ceiling.

---

## 4. Experimental Results

### 4.1 Discriminatory Accuracy on the 30-Draft Benchmark Corpus
Multi-dimensional semantic differentiation achieved 100.0% classification accuracy ($30/30$ correct predictions), with a Precision of $1.0000$, a Recall of $1.0000$, and an F1-score of $1.0000$ across the 30-draft Indonesian benchmark corpus (Table 3). Publication-ready drafts consistently attained higher composite Content Differentiation Scores (mean $\text{CDS} = 83.5\% \pm 1.0\%$, range $82.3\%$ to $85.4\%$) than uncurated revision-required drafts (mean $\text{CDS} = 70.3\% \pm 1.0\%$, range $69.1\%$ to $72.4\%$), establishing a clear 13.2-percentage-point separation between the two quality tiers (Fig. 2).

**Table 3:** Confusion matrix and statistical summary (mean $\pm$ SD, min–max) across the 30-draft benchmark dataset.

| Evaluation Metric / Sub-Metric | Publication-Ready Group ($n = 15$) | Revision-Required Group ($n = 15$) | Between-Group Separation / Benchmark Result |
| :--- | :--- | :--- | :--- |
| **Confusion Matrix Counts** | $\text{TP} = 15, \text{FN} = 0$ | $\text{TN} = 15, \text{FP} = 0$ | Total $N = 30$ ($100.0\%$ Match) |
| **Classification Metrics (Eq. 10)** | $\text{Precision} = 1.0000$ ($100.0\%$) | $\text{Recall} = 1.0000$ ($100.0\%$) | $\text{F1-Score} = 1.0000$, $\text{Accuracy} = 100.0\%$ |
| **Document Length ($W_{\text{draft}}$, words)** | $371.9 \pm 15.3$ ($357\text{–}408$) | $370.5 \pm 9.6$ ($354\text{–}387$) | $\Delta = 1.4$ words (Length-balanced corpus) |
| **Moving-Average TTR ($\text{MATTR}_{50}$)** | $0.9199 \pm 0.0138$ ($0.8939\text{–}0.9482$) | $0.6646 \pm 0.0298$ ($0.6250\text{–}0.7344$) | $+0.2553$ higher lexical diversity in curated drafts |
| **Heading-Keyword Overlap (HKO, %)** | $10.0\% \pm 12.7\%$ ($0.0\%\text{–}25.0\%$) | $100.0\% \pm 0.0\%$ ($100.0\%\text{–}100.0\%$) | $-90.0\%$ lower heading keyword saturation |
| **Composite CDS Score (%)** | $83.5\% \pm 1.0\%$ ($82.3\%\text{–}85.4\%$) | $70.3\% \pm 1.0\%$ ($69.1\%\text{–}72.4\%$) | $+13.2\%$ composite margin above/below $\tau_{\text{cds}} = 75.0\%$ |

Crucially, the word counts of both groups were nearly identical ($371.9 \pm 15.3$ words vs. $370.5 \pm 9.6$ words; Table 3), confirming that the 25.5-percentage-point gap in $\text{MATTR}_{50}$ ($0.9199$ vs. $0.6646$) reflects genuine vocabulary richness rather than document-length artifacts. Uncurated synthetic drafts saturated every subheading with primary query tokens ($\text{HKO} = 100.0\%$), triggering the HKO penalty and depressing their composite CDS below the $75.0\%$ gatekeeper threshold.

### 4.2 Live SERP Adversarial Stress Testing and Ablation of Dual-Veto Gates
While standard benchmark evaluation validates normal operating conditions, rigorous design science requires exposing where initial mathematical formulations fail under adversarial inputs. During live SERP validation across four Indonesian queries (*"memahami fondasi desain arsitektur"*, *"cara menyeduh kopi tubruk"*, *"manfaat kecerdasan buatan dalam pendidikan"*, and *"arsitektur brutalisme beton ekspos"*), we tested five adversarial control conditions: C1 (100% verbatim copy of Rank-1 SERP competitor), C1-Part (partial copy-paste of 350 words from a 1,222-word competitor page), C2 (out-of-domain culinary draft submitted under an architectural query), C3 (generic uncurated LLM baseline), C4 (editor-curated revision incorporating $\Delta_{\text{deficit}}$ entities), and C5 (keyword-stuffed draft).

Ablation testing revealed that the pre-calibration baseline (Macro CDS Eq. 8 alone, without veto gates) correctly rejected full-document plagiarism C1 ($S_{\cos,\max} = 1.0000$, $\text{CDS} = 49.0\%$ to $50.7\%$) but suffered two critical false-positive failures on C1-Part and C2 (Table 4 and Fig. 3b). In control C1-Part, copying 350 words from a 1,222-word competitor page yielded a macro document-level cosine similarity of only $0.3950$ ($< \tau_{\cos} = 0.60$) because the remaining 872 words of the competitor page diluted the global term vector, causing Macro CDS to assign an erroneous passing score of $82.0\%$. However, sentence-level inspection flagged $50.0\%$ of the draft's sentences in red ($\rho_{\text{red}} = 0.50 \ge 0.20$). Activating the Red-Span Density Veto Gate (Eq. 9) capped the score at $40.6\%$ and forced the verdict *"Revision Required – High Sentence Redundancy."* Similarly, in control C2, submitting an unrelated fried-rice recipe under an architectural query produced near-zero cosine similarity ($S_{\cos,\text{avg}} = 0.0162 < \tau_{\text{topic}} = 0.05$), which tricked the uncalibrated VSM formula into awarding maximum differentiation ($82.2\%$). Activating the Topic Relevance Gate immediately vetoed C2 to $20.0\%$ (*"Revision Required – Out-of-Domain Topic"*), reducing false-positive acceptance across all adversarial controls from $100.0\%$ to $0.0\%$ (Table 4).

**Table 4:** Live SERP adversarial stress testing and ablation of the Topic Relevance and Red-Span Density Veto Gates.

| Control Code & Scenario | $S_{\cos,\max}$ | $S_{\cos,\text{avg}}$ | $\text{MATTR}_{50}$ | Red-Span Ratio ($\rho_{\text{red}}$) | Macro CDS (No Veto) | Calibrated CDS (With Veto) | Final Gatekeeper Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **C1: Full Rank-1 Plagiarism** | $1.0000$ | $0.2958$ | $0.8335$ | $0.92$ ($92\%$) | $50.7\%$ (Reject) | $50.7\%$ | Revision Required (Macro VSM Redundancy) |
| **C1-Part: 50% Partial Copy-Paste** | $0.3950$ | $0.2140$ | $0.8010$ | $0.50$ ($50\%$) | $82.0\%$ (**FALSE POS**) | $40.6\%$ | Revision Required (Red-Span Density Veto) |
| **C2: Out-of-Domain Topic Shift** | $0.0272$ | $0.0162$ | $0.8705$ | $0.00$ ($0\%$) | $82.2\%$ (**FALSE POS**) | $20.0\%$ | Revision Required (Topic Relevance Veto) |
| **C5: HKO & Lexical Stuffing** | $0.1525$ | $0.1181$ | $0.5120$ | $0.08$ ($8\%$) | $70.2\%$ (Reject) | $70.2\%$ | Revision Required (Keyword Stuffing Flag) |
| **C4: Curated Draft + $\Delta_{\text{deficit}}$** | $0.1442$ | $0.1164$ | $0.9461$ | $0.00$ ($0\%$) | $84.4\%$ (Accept) | $84.4\%$ | Ready to Publish (Passed All Gates) |

### 4.3 Multi-Page SERP Harvesting Yield and Computational Latency
Evaluating SERP pagination depth from 2 to 5 concurrent pages revealed a non-linear trade-off between competitor corpus yield and network scraping latency (Table 5 and Fig. 3a). Fetching only 1 page (10 raw results) frequently yielded fewer than 3 valid articles because Wikipedia, academic PDFs, and social video links consumed up to 70% of Page-1 slots. Expanding acquisition to 3 parallel pages (30 raw results, 25 clean candidate URLs) yielded 7 valid competitor articles ($\ge 150$ words) in $7.19\text{ s}$ total latency ($4.08\text{ s}$ SERP API + $3.11\text{ s}$ parallel `HTTPX`/`curl_cffi` scraping), satisfying our 5-article target quota well below the $8.0\text{ s}$ interactive threshold (Fig. 3a). Conversely, expanding to 5 pages (50 raw results) triggered anti-bot rate limiting and connection timeouts on long-tail domains, causing total latency to more than double to $16.63\text{ s}$.

**Table 5:** Empirical benchmark of multi-page SERP harvesting yield and component execution latency.

| SERP Depth (Pages) | Raw SERP Results | Clean Candidate URLs | Valid Articles ($\ge 150$ Words) | SERP API Time (s) | Async Scraping Time (s) | Pure Math VSM/IG Time (s) | Total End-to-End Latency (s) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2 Pages** | $20$ | $17$ | $5$ articles | $2.72\text{ s}$ | $4.34\text{ s}$ | $0.038\text{ s}$ | $7.07\text{ s}$ (Meets minimum quota) |
| **3 Pages (Sweet Spot)** | $30$ | $25$ | $7$ articles (Top 5 used) | $4.08\text{ s}$ | $3.11\text{ s}$ | $0.042\text{ s}$ | $7.19\text{ s}$ (Optimal stability & speed) |
| **4 Pages** | $40$ | $34$ | $11$ articles | $2.84\text{ s}$ | $5.48\text{ s}$ | $0.045\text{ s}$ | $8.32\text{ s}$ (Exceeds $8.0\text{ s}$ target) |
| **5 Pages (Saturated)** | $50$ | $40$ | $13$ articles | $5.44\text{ s}$ | $11.19\text{ s}$ | $0.049\text{ s}$ | $16.63\text{ s}$ (Bot-guard timeout spike) |

Once competitor texts are cached via SHA-256 query hashing (12-hour TTL), subsequent multi-turn draft revisions bypass network scraping entirely and complete end-to-end mathematical re-evaluation in $0.12\text{ s}$ to $0.31\text{ s}$ (with pure sparse-matrix VSM and Information Gain computation requiring only $38\text{ ms}$ to $49\text{ ms}$; Table 5). Under Locust concurrent load testing (20 virtual users, spawn rate 2 users/s) [17], SQLite WAL mode handled all concurrent read/write transactions with zero database-lock errors and a peak resident memory footprint of $412\text{ MB}$, well below the $2.0\text{ GB}$ hardware constraint.

---

## 5. Discussion

### 5.1 Mechanistic Interpretation of Multi-Dimensional Semantic Gating
Our experimental findings demonstrate that integrating macro vector similarity, meso entity set-difference, and micro lexical stylometrics achieves 100.0% separation on benchmark drafts while neutralizing adversarial partial plagiarism and topic shifts when coupled with dual-tier veto gates. Mechanistically, this synergy occurs because each mathematical layer targets a distinct linguistic scale of content degradation. Uncurated synthetic drafts frequently pass traditional readability formulas by generating grammatically fluent, short sentences; however, because LLMs sample high-probability token sequences, they repetitively reuse core vocabulary within local 50-word spans (depressing $\text{MATTR}_{50}$ to $0.6646$) and mechanically echo the search query inside every subheading (inflating HKO to $100.0\%$). Conversely, human-curated or editorially enriched drafts introduce domain-specific terminology and varied subheading phrasing ($\text{MATTR}_{50} = 0.9199$, $\text{HKO} = 10.0\%$). Consequently, pre-publication quality assessment cannot rely on a single metric dimension; surface fluency must be cross-examined against local vocabulary entropy and competitor entity sets.

### 5.2 Comparison with Prior Literature
In our benchmark and live SERP experiments, we found that combining HKO and $\text{MATTR}_{50}$ with entity Information Gain accurately flags SEO-stuffed and derivative drafts while providing deterministic entity recommendations. This finding aligns with Bevendorff et al. [6], who reported that HKO and TTR serve as primary statistical discriminators of SEO spam in web search engines. However, whereas Bevendorff et al. [6] evaluated static web archives using length-dependent classic TTR, Waskita replaces raw TTR with sliding-window $\text{MATTR}_{50}$ and embeds it inside an interactive pre-publication gatekeeper. Furthermore, our approach contrasts with binary neural authorship detectors evaluated by Rodrigues et al. [7], which suffer accuracy degradation (from 93% to 75%) when authors lightly edit AI text. By auditing intrinsic semantic differentiation ($\Delta_{\text{gain}}$ and $\Delta_{\text{deficit}}$) derived from Cărbune and Anders [13] rather than guessing authorship origin, Waskita directly supports the 64% of practitioners who use hybrid human–AI workflows [4] and resolves the black-box metric inconsistencies identified by Font-Julian et al. [8] and the shallow heading-only scope of Roque [9].

### 5.3 Addressing Alternative Interpretations
One might argue that the observed separation in Content Differentiation Scores is either an artifact of document length variations or a consequence of overfitting threshold parameters ($\tau_{\text{cds}} = 75.0\%$, $\tau_{\text{red}} = 0.20$) to the 30-draft corpus. If longer documents naturally accumulated more unique entities or higher cosine overlap, length differences could confound the gatekeeper verdict. Indeed, in classical information retrieval, unnormalized Euclidean distance and raw Type-Token Ratio are strongly correlated with text length [10, 12]. However, three empirical controls refute this alternative explanation: (1) the mean word counts of the positive and negative benchmark groups are virtually identical ($371.9$ vs. $370.5$ words; Table 3); (2) $\text{MATTR}_{50}$ normalizes lexical diversity over a fixed 50-word sliding window; and (3) a wide 9.9-percentage-point buffer separates the highest-scoring negative draft ($72.4\%$) from the lowest-scoring positive draft ($82.3\%$), confirming that classification accuracy remains 100.0% across any threshold setting $\tau_{\text{cds}} \in [73.0\%, 82.0\%]$.

### 5.4 Scope Conditions and Limitations
While the current evaluation validates Waskita on structured Indonesian informational web articles ($\ge 300$ words), two scope conditions merit consideration. First, the morphological normalization pipeline relies on the `PySastrawi` Nazief–Adriani stemmer [18, 19]; however, because the downstream VSM, Information Gain, and $\text{MATTR}_{50}$ equations operate on language-agnostic token sets, the architecture can be extended to English or multilingual web publishing by substituting the stemmer module (e.g., Snowball or SpaCy lemmatizers). Second, live SERP acquisition depends on external search API reachability and target website responsiveness; nevertheless, our dual-engine `HTTPX`/`curl_cffi` scraper, 12-hour SHA-256 snapshot cache, and graceful degradation protocol (FR-13) ensure continuous editorial operation even when individual competitor hosts block automated requests.

---

## 6. Conclusions

This study has demonstrated that deterministic, multi-dimensional semantic differentiation effectively audits and filters web article drafts prior to publication without relying on opaque black-box neural classifiers. By unifying sublinear TF-IDF vector similarity, set-theoretic entity Information Gain, Moving-Average Type-Token Ratio, and Heading-Keyword Overlap within a five-layer software architecture, Waskita achieved 100.0% classification accuracy and an F1-score of $1.0000$ across 30 benchmark Indonesian web drafts. Furthermore, our live SERP adversarial stress tests proved that macro document-level scoring must be paired with a Topic Relevance Gate and a sentence-level Red-Span Density Veto Gate to eliminate false-positive acceptance of out-of-domain texts and partial copy-paste plagiarism, while three-page parallel SERP harvesting provides an optimal $7.19\text{ s}$ response time.

For digital newsrooms, content management system (CMS) engineers, and SEO practitioners, Waskita offers a transparent quality gatekeeper that diagnoses exact sentence-level redundancy, highlights missing competitor consensus entities, and generates actionable pre-publication remediation prompts on modest server hardware ($< 420\text{ MB}$ RAM). Future work will extend the framework in two concrete directions: (1) integrating cross-paragraph entity-relation graph verification to detect factual hallucinations alongside semantic redundancy, and (2) developing plug-in adapters for multilingual morphological analyzers and headless CMS publishing pipelines.

---

## Declarations

* **Competing Interests:** The author declares no competing financial or non-financial interests.
* **Data and Software Availability:** The deterministic 30-draft Indonesian benchmark fixture (`dataset_30_drafts.json`), live SERP validation logs, and the five-layer FastAPI/React source code of Waskita are maintained in the institutional repository of Politeknik Negeri Batam.
* **Declaration of Generative AI and AI-Assisted Technologies in the Writing Process:** During the preparation of this manuscript, the author used an AI-assisted academic editing environment solely to refine English grammatical accuracy, verify terminology consistency, and format visual tables from verified empirical logs. After using this tool, the author reviewed and verified all mathematical formulations, citations, and experimental data, and takes full responsibility for the content of the publication.

---

## References

1. J. L. Paredes, G. Druck, B. Benson, and E. Smith, "AI now writes as many online articles as humans," *Graphite Growth Research Report*, 2026. [Online]. Available: https://graphite.io/five-percent/research/ai-now-writes-as-many-online-articles-as-humans-do
2. Google LLC, "Google Search Essentials (formerly Webmaster Guidelines)," *Google Search Central Documentation*, Dec. 18, 2025. [Online]. Available: https://developers.google.com/search/docs/essentials
3. Google LLC, "Creating helpful, reliable, people-first content," *Google Search Central Documentation*, Dec. 18, 2025. [Online]. Available: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
4. B. Fatai, "AI vs. human content for SEO: Which workflow should you use in 2026?" *BriefIQ Research Blog*, Jun. 19, 2026. [Online]. Available: https://www.briefiq.io/blog/ai-vs-human-content-for-seo-what-actually-ranks-in-2026/
5. B. Babiak, "How AI-generated content performs in Google Search: A 16-month experiment," *Search Engine Land*, Mar. 23, 2026. [Online]. Available: https://searchengineland.com/ai-generated-content-google-search-experiment-472234
6. J. Bevendorff, M. Wiegmann, M. Potthast, and B. Stein, "Is Google getting worse? A longitudinal investigation of SEO spam in search engines," in *Advances in Information Retrieval (ECIR 2024)*, Lecture Notes in Computer Science, vol. 14610, Cham, Switzerland: Springer Nature, 2024, pp. 56–71, doi: 10.1007/978-3-031-56063-7_4.
7. F. A. Rodrigues, N. F. Sturm, and F. L. Pinheiro, "A linguistic comparison between human- and AI-generated content," *iScience*, vol. 29, no. 3, Art. no. 114976, 2026, doi: 10.1016/j.isci.2026.114976.
8. C. I. Font-Julian, C. Lopezosa, E. Orduña-Malea, and I. F. Aguillo, "Assessing discrepancies across SEO tools in the collection of scholarly web metrics," *Journal of Information Science*, vol. 52, no. 4, pp. 1075–1088, 2026, doi: 10.1177/01655515261445903.
9. I. R. V. G. Roque, "Automation and optimisation of SEO content gap analysis task with semantic clustering of Portuguese search keywords," Master's Internship Report, NOVA Information Management School, Universidade Nova de Lisboa, Lisbon, Portugal, 2023.
10. P. Poschmann, J. Goldenstein, S. Büchel, and U. Hahn, "A vector space approach for measuring relationality and multidimensionality of meaning in large text collections," *Organizational Research Methods*, vol. 27, no. 4, pp. 650–680, 2024, doi: 10.1177/10944281231213068.
11. G. Salton, A. Wong, and C. S. Yang, "A vector space model for automatic indexing," *Communications of the ACM*, vol. 18, no. 11, pp. 613–620, Nov. 1975, doi: 10.1145/361219.361220.
12. C. D. Manning, P. Raghavan, and H. Schütze, *Introduction to Information Retrieval*. Cambridge, U.K.: Cambridge Univ. Press, 2008. [Online]. Available: https://nlp.stanford.edu/IR-book/
13. V. Cărbune and P. G. Anders, "Contextual estimation of link information gain," U.S. Patent 11,354,342 B2, Jun. 7, 2022. [Online]. Available: https://patents.google.com/patent/US11354342B2/en
14. G. L. Geerts, "A design science research methodology and its application to accounting information systems research," *International Journal of Accounting Information Systems*, vol. 12, no. 2, pp. 142–151, 2011, doi: 10.1016/j.accinf.2011.02.004.
15. K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A design science research methodology for information systems research," *Journal of Management Information Systems*, vol. 24, no. 3, pp. 45–77, 2007, doi: 10.2753/MIS0742-1222240302.
16. D. M. W. Powers, "Evaluation: From precision, recall and F-measure to ROC, informedness, markedness and correlation," *Journal of Machine Learning Technologies*, vol. 2, no. 1, pp. 37–63, 2011 (Tech. Rep. SIE-07-001, Flinders Univ., 2007), arXiv:2010.16061.
17. C. Ho and L. Williams, "An introduction to performance testing," Dept. of Computer Science, North Carolina State Univ., Raleigh, NC, USA, Tech. Rep. TR-2006-25, 2006.
18. F. Z. Tala, "A study of stemming effects on information retrieval in Bahasa Indonesia," M.S. thesis, Institute for Logic, Language and Computation, Universiteit van Amsterdam, Amsterdam, Netherlands, 2003.
19. J. Asian, H. E. Williams, and S. M. M. Tahaghoghi, "Stemming Indonesian," in *Proc. 28th Australasian Computer Science Conf. (ACSC)*, vol. 38, Newcastle, Australia, 2005, pp. 307–314.
