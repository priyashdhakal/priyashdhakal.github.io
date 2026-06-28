---
layout: post
title: "Deep MOLFT: A Late-Fusion Deep Learning Framework for Multi-Omics Disease Classification and Interpretable Biomarker Discovery"
date: 2026-06-28 10:00:00 +0900
tags: [Bioinformatics, Deep Learning, Multi-Omics, SHAP, Disease Classification]
image: /images/deep-molft-graphical-abstract.png
math: true
---

## Abstract

The integration of heterogeneous molecular data — genomic, epigenomic, and transcriptomic — is central to understanding the regulatory complexity of disease. However, prevailing integration strategies are hindered by high dimensionality, cross-platform heterogeneity, and limited interpretability. In this work I present **Deep MOLFT (Multi-Omics Late Fusion Technique)**, a deep learning framework that processes DNA methylation, microRNA (miRNA), and messenger RNA (mRNA) profiles through independent modality-specific sub-networks prior to systematic fusion. The architecture employs adaptive weighting and sparsity-inducing regularization to mitigate overfitting, and incorporates Shapley Additive Explanation (SHAP) analysis to render predictions interpretable. Evaluated across five benchmark cohorts (ROSMAP, BRCA, LUAD, THCA, UCEC), Deep MOLFT consistently outperforms classical, statistical, and contemporary deep learning baselines, while recovering biomarkers corroborated by independent literature.

## 1. Introduction

High-throughput sequencing has produced an abundance of molecular measurements, yet no single omics layer captures the full regulatory architecture of a disease. DNA methylation encodes epigenetic control of transcription; miRNAs govern post-transcriptional repression; mRNA quantifies transcriptional output. These layers are complementary, and their joint analysis is essential for accurate phenotype discrimination.

The central methodological question is how to combine them. **Early fusion** concatenates all modalities into a single feature vector before learning. While simple, it inflates dimensionality and propagates modality-specific noise, which is acute in the regime where feature count $$D \gg N$$ (sample count). **Late fusion**, by contrast, learns modality-specific representations independently and integrates them at a higher level of abstraction, preserving the distinct statistical structure of each data type. Deep MOLFT is built on this principle, augmented with explicit regularization and post-hoc interpretability.

## 2. Data and Notation

Let the three omics modalities be represented as matrices:

$$
X_{\text{methy}} \in \mathbb{R}^{N_{\text{methy}} \times D}, \quad
X_{\text{mirna}} \in \mathbb{R}^{N_{\text{mirna}} \times D}, \quad
X_{\text{mrna}} \in \mathbb{R}^{N_{\text{mrna}} \times D}
$$

where $$N_{(\cdot)}$$ denotes the number of features for each modality and $$D$$ the number of samples. Five benchmark datasets were used, summarized below:

| Dataset | Disease | Classes | Sample distribution |
|---------|---------|:-------:|---------------------|
| ROSMAP | Alzheimer's disease | 2 | NC: 169; AD: 182 |
| BRCA | Breast cancer subtype | 5 | LumA: 436; LumB: 147; HER2: 46; Normal: 115; Basal: 131 |
| LUAD | Lung adenocarcinoma | 2 | Mixed: 90; NOS: 281 |
| THCA | Thyroid carcinoma | 2 | Follicular: 102; Classical: 356 |
| UCEC | Uterine carcinoma grade | 2 | Grade 2: 122; Grade 3: 316 |

ROSMAP and BRCA were obtained from MOGONET; LUAD, THCA, and UCEC from GREMI. Beyond the standardized preprocessing of those studies (normalization, log-transformation, batch-effect correction, variance thresholding, and univariate filtering), I applied an additional correlation-based elimination step: for any feature pair with Pearson correlation $$|\rho_{ij}| > 0.85$$, one feature was removed to reduce redundancy and multicollinearity.

## 3. Methodology

### 3.1 Modality-specific feature extraction

Each modality $$m \in \{\text{methy}, \text{mirna}, \text{mrna}\}$$ is processed by a dedicated branch $$h_m(\cdot)$$ composed of fully connected layers with ReLU activations:

$$
F_{\text{methy}} = h_{\text{methy}}(X_{\text{methy}}), \quad
F_{\text{mirna}} = h_{\text{mirna}}(X_{\text{mirna}}), \quad
F_{\text{mrna}} = h_{\text{mrna}}(X_{\text{mrna}})
$$

Each branch follows a contracting topology of $$128 \to 64 \to 32$$ units, with dropout rates of $$0.5$$, $$0.3$$, and $$0.2$$ applied after the successive layers, and $$L_1$$ kernel regularization ($$\lambda = 0.001$$) at every dense layer to induce sparse representations.

### 3.2 Late fusion

The modality-specific embeddings are concatenated into a unified representation:

$$
X_{\text{fused}} = \big[\, F_{\text{methy}} \;;\; F_{\text{mirna}} \;;\; F_{\text{mrna}} \,\big]
$$

$$X_{\text{fused}}$$ is then passed through additional dense layers (ReLU activations, $$L_1$$ regularization with $$\lambda = 0.001$$, and dropout) that model cross-modal interactions. The output layer applies an activation appropriate to the task:

$$
\hat{y} =
\begin{cases}
\sigma(z), & n_{\text{classes}} = 1 \quad \text{(sigmoid, binary)} \\
\text{softmax}(z), & n_{\text{classes}} > 1 \quad \text{(multiclass)}
\end{cases}
$$

### 3.3 Objective function

Training optimizes a single loss on the final prediction:

$$
\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{pred}}(Y_{\text{pred}}, Y_{\text{true}})
$$

$$
\mathcal{L}_{\text{pred}} =
\begin{cases}
\text{Binary Cross-Entropy}, & n_{\text{classes}} = 1 \\
\text{Categorical Cross-Entropy}, & n_{\text{classes}} > 1
\end{cases}
$$

Class imbalance is addressed through balanced class weighting in the loss. Optimization uses Adam, with early stopping on validation loss (patience $$= 50$$, best-weight restoration) over a maximum of $$500$$ epochs at batch size $$32$$. Hyperparameters governing the fused layers were tuned via Optuna.

### 3.4 Interpretability via SHAP

To attribute predictions to molecular features, I employ SHAP within a cooperative game-theoretic framework. For a model $$f$$ and feature $$i$$, the SHAP value $$\phi_i$$ is the average marginal contribution of $$i$$ across all feature subsets $$S \subseteq N \setminus \{i\}$$:

$$
\phi_i = \sum_{S \subseteq N \setminus \{i\}}
\frac{|S|!\,(|N| - |S| - 1)!}{|N|!}
\big[\, f(S \cup \{i\}) - f(S) \,\big]
$$

where $$N$$ is the full feature set and $$f(S)$$ is the model output using only the features in $$S$$; the combinatorial coefficient is the Shapley weight that fairly averages marginal contributions. Because exact computation is intractable for high-dimensional deep models, the **Deep Explainer** approximation is used, leveraging background reference data and model gradients. Biomarkers were ranked by reproducibility across independent runs to suppress spurious attributions.

## 4. Evaluation Metrics

Model performance was assessed using accuracy (ACC), the F1 score, and the area under the ROC curve (AUC). For multiclass tasks, both the macro-averaged F1 ($$\text{F1}_{\text{macro}}$$) and weighted F1 ($$\text{F1}_{\text{weighted}}$$) were reported to account for class imbalance.

## 5. Results

### 5.1 Binary and multiclass benchmarks

On the ROSMAP Alzheimer's cohort, Deep MOLFT attained $$\text{ACC} = 0.887$$ and $$\text{F1} = 0.885$$, exceeding MOGONET by 7.2% in accuracy and MODILM by 4.4%, with comparable AUC. On the five-subtype BRCA task it achieved $$\text{ACC} = 0.860$$, $$\text{F1}_{\text{weighted}} = 0.869$$, and $$\text{F1}_{\text{macro}} = 0.851$$ — improving on MOGONET's macro F1 by 7.7%. The macro-F1 advantage is notable, as it reflects balanced performance across minority subtypes rather than dominance by majority classes; statistical baselines such as block PLSDA collapsed here ($$\text{F1}_{\text{macro}} \approx 0.37$$).

| Method | ROSMAP ACC | ROSMAP F1 | ROSMAP AUC | BRCA ACC | BRCA F1<sub>w</sub> | BRCA F1<sub>m</sub> |
|--------|:---------:|:--------:|:---------:|:-------:|:------:|:------:|
| XGBoost | 0.760 | 0.772 | 0.837 | 0.781 | 0.764 | 0.701 |
| MOGONET | 0.815 | 0.821 | 0.874 | 0.829 | 0.825 | 0.774 |
| MODILM | 0.843 | 0.850 | 0.891 | 0.845 | 0.840 | 0.804 |
| **Deep MOLFT** | **0.887** | **0.885** | 0.890 | **0.860** | **0.869** | **0.851** |

### 5.2 Cross-dataset generalization

Across three additional oncological cohorts, Deep MOLFT matched or surpassed GREMI, the strongest recent competitor, and substantially exceeded MOGONET and Dynamic.

| Method | LUAD (ACC / F1 / AUC) | THCA (ACC / F1 / AUC) | UCEC (ACC / F1 / AUC) |
|--------|:---------------------:|:---------------------:|:---------------------:|
| MOGONET | 0.804 / 0.879 / 0.752 | 0.847 / 0.904 / 0.849 | 0.792 / 0.863 / 0.706 |
| GREMI | 0.834 / 0.896 / 0.792 | 0.893 / 0.933 / 0.905 | 0.858 / 0.906 / 0.850 |
| **Deep MOLFT** | **0.866 / 0.914 / 0.838** | 0.884 / 0.926 / 0.908 | **0.860 / 0.911 / 0.861** |

On LUAD, Deep MOLFT improved over GREMI by 3.2% (ACC) and 4.3% (AUC). Performance on THCA was competitive with GREMI, while UCEC showed marginal gains across all metrics. Ablation over modality combinations further indicated that, although multi-omics fusion is generally beneficial, certain disease contexts are best served by a single modality — motivating *adaptive* rather than uniform integration.

### 5.3 Biomarker validation

SHAP-derived rankings recovered biomarkers consistent with established literature. In **BRCA**, these spanned all three modalities: the tumor-suppressor miRNA *hsa-miR-205* (targeting *ErbB3* and *ZEB1*), the hypermethylation-silenced pro-apoptotic gene *DAPK1*, and transcriptomic markers *FGD3* and *MASTL* linked to metastasis and chromosomal instability. In **ROSMAP**, top features included *PRTN3* (associated with tau pathology) and *MEIS3* (implicated in cognitive resilience). The convergence of data-driven attributions with prior biological knowledge supports the framework's translational relevance.

## 6. Discussion

The consistent gains over early-fusion and statistical baselines are attributable to the modality-specific branches, which extract features tailored to the distinct statistical properties of each omics layer before integration. This design circumvents the dimensionality and noise amplification characteristic of early fusion, particularly where $$D \gg N$$. The integration of SHAP transforms the model from a predictive black box into an interpretable instrument, yielding candidate biomarkers amenable to experimental follow-up.

## 7. Conclusion

Deep MOLFT demonstrates that a late-fusion architecture, coupled with sparsity-inducing regularization and game-theoretic interpretability, provides an effective and generalizable approach to multi-omics disease classification. Future directions include scaling to single-cell multi-omics, improving computational efficiency for larger cohorts, and prospective clinical validation. By coupling methodological rigor with explainability, Deep MOLFT advances multi-omics analysis from prediction toward mechanistic insight.

## Data and Code Availability

ROSMAP data are available through the AMP-AD Knowledge Portal (Synapse); BRCA, LUAD, THCA, and UCEC data through the TCGA / GDC Data Portal. Preprocessed inputs follow the MOGONET and GREMI pipelines, and the framework implementation is released publicly.
