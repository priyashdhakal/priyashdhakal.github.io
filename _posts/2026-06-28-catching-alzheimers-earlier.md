---
layout: post
title: "Catching Alzheimer's Earlier: Pairing Brain Scans With a Blood Test"
date: 2026-06-28 12:00:00 +0900
permalink: /blog/catching-alzheimers-earlier/
tags: [Alzheimer's, Multimodal AI, Deep Learning, Explainable AI, Neuroimaging]
image: /images/blogpost.jpg
---

Alzheimer's disease is easiest to fight early — and hardest to catch early. By the time memory problems are obvious to a family or a clinic, the disease has usually been quietly at work in the brain for years. The most valuable window opens earlier, at a stage called **mild cognitive impairment (MCI)**, when intervention might still change the course of the illness. The catch is that telling early MCI apart from ordinary aging is one of the toughest open problems in computer-aided diagnosis.

A framework I have been developing, **DeepNeuroFusion**, takes aim at exactly that problem by combining two very different, non-invasive signals: a structural brain MRI and a routine blood sample.

### Two windows into the same disease

A brain scan and a blood draw see Alzheimer's from different angles. MRI captures *structure* — the shrinkage of memory-related regions such as the hippocampus and the thinning of the cortex that accompany the disease. Whole-blood gene expression captures something quite different: molecular traces of the inflammatory and degenerative processes happening throughout the body, which echo what is going on in the brain.

Each signal is informative, and each is incomplete. Structure tends to speak loudly once damage is established; the blood may carry subtler, earlier hints. The promise of using both is that they cover for each other's blind spots — especially at the early, ambiguous MCI stage.

### Why combining them is harder than it sounds

The naive approach — pour every MRI measurement and every gene into one big table and hand it to a model — usually disappoints. The two data types live on different scales and carry different kinds of noise, and there are *thousands* of molecular features but only a few hundred patients. In that regime, a model can easily memorize noise instead of learning biology, and quietly flatter itself with inflated accuracy if the evaluation isn't done carefully.

> With only a few hundred patients and thousands of measurements, the danger isn't building a model — it's fooling yourself about how good it is.

### A team of models, not a single oracle

DeepNeuroFusion treats each modality on its own terms first. A compact neural network gives the MRI features and the gene-expression features their own encoders, learning a distilled summary of each before merging them into a shared representation — a strategy known as *late fusion*.

The twist is what happens next. Rather than trusting one classifier, the framework combines three that make *different kinds* of mistakes: a simple linear model that stays interpretable in the original feature space, a kernel-based model that captures non-linear patterns in the learned representation, and the deep network itself. Their votes are blended together. Because the three disagree in uncorrelated ways, the ensemble is steadier and more reliable than any one alone.

Just as important is the discipline behind the numbers. Every preprocessing step — scaling the data, selecting informative genes, balancing the classes — is redone *inside* each round of cross-validation, so information from the test set never leaks backward into training. It is an unglamorous detail, but on small cohorts it is the difference between an honest result and a flattering illusion.

### Closing the early-detection gap

Tested on the public **ANMerge** cohort, DeepNeuroFusion distinguished Alzheimer's patients from healthy controls with high reliability. More notably, it made real headway on the hardest and most clinically meaningful comparison — early MCI versus normal cognition — and did so *without* leaning on cognitive test scores, which would otherwise smuggle the answer into the question. That is the contrast where most methods stumble, and where progress matters most for screening.

### Explaining its decisions

A prediction a clinician can't interrogate is hard to act on. So the framework pairs its outputs with **SHAP**, a method that credits each feature for its role in a decision. The explanations told a biologically coherent story: on the imaging side, the model leaned on the hippocampus, amygdala, and entorhinal cortex — precisely the regions Alzheimer's is known to attack. On the molecular side, a handful of blood transcripts (including *GNL2*, *LCOR*, *NACA*, and *RNF13*) surfaced as influential, offering concrete candidates for future biological validation. Intriguingly, the blood signal mattered *more* as the task shifted toward the earliest stage — hinting that peripheral molecular changes may be especially useful before structural damage is obvious.

### Why it matters

A brain scan plus a blood test is a realistic, non-invasive combination — the kind of thing that could plausibly scale toward population screening. By pairing strong, honestly evaluated performance with explanations that point back to real biology, DeepNeuroFusion aims to be more than a verdict: a transparent second opinion that also nominates biomarkers worth chasing in the lab.

There is plenty left to do — validating these findings in independent cohorts and, eventually, in the clinic. But the direction is one I find compelling: non-invasive, multimodal, and willing to show its reasoning.

*DeepNeuroFusion is part of my ongoing PhD research in bioinformatics. More write-ups to follow as the work develops.*
