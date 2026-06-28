---
layout: post
title: "Reading Disease in Layers: Multi-Omics AI That Explains Itself"
date: 2026-06-28 10:00:00 +0900
permalink: /blog/reading-disease-in-layers/
tags: [Bioinformatics, Deep Learning, Multi-Omics, Explainable AI]
image: /images/blogpost.jpg
---

Every disease leaves its mark in more than one place. A tumor doesn't just rewrite a cell's genes — it reshapes how those genes are switched on and off, which molecular messages the cell sends, and which it quietly silences. Each of these layers tells part of the story. None of them tells all of it.

![Deep MOLFT graphical abstract](/images/deep-molft-graphical-abstract.png)
{:.blog-figure}
*Deep MOLFT processes each molecular layer through its own network before fusing them, then explains its predictions with SHAP.*

That is the central challenge of modern biomedical data. We can now measure these molecular layers — DNA methylation, microRNA activity, messenger RNA expression — in extraordinary detail. Reading them *together*, though, is far harder than reading any one of them alone. A framework I have been building, **Deep MOLFT**, takes a fresh approach to that problem, and adds something most AI models in this space still lack: the ability to explain its own conclusions.

### No single layer tells the whole story

Think of the molecular state of a cell as a set of transparencies stacked on a projector. DNA methylation captures the epigenetic switches that decide whether a gene can be read at all. MicroRNAs act as fine-grained dimmers, dampening certain messages after they are written. Messenger RNA records what the cell is actually producing. Lay these sheets over one another and a clearer picture emerges than any single sheet can offer — which is exactly why studying them jointly matters for telling one disease, or one disease subtype, apart from another.

### The trouble with combining data too early

The obvious way to merge these measurements is to stitch them into one enormous table and hand it to a model. It sounds reasonable, but it tends to backfire. Each layer is measured on a different scale and carries its own quirks and noise. Worse, biomedical studies usually have far more measurements than patients — thousands of molecular features but only hundreds of people — and pouring everything into a single pile makes that imbalance worse, inviting a model to memorize noise rather than learn biology.

### Learning each layer first, then bringing them together

Deep MOLFT works the other way around. Rather than mixing everything up front, it gives **each molecular layer its own small neural network**, letting that network learn the patterns specific to its data type. Only after each layer has been distilled into a compact, meaningful summary are those summaries brought together — a strategy known as *late fusion*. The model then learns how the layers interact, with built-in restraint that discourages it from overfitting to any single noisy signal.

> By learning each layer on its own terms before combining them, the model preserves what makes each kind of data distinctive — instead of drowning it out.

### Opening the black box

Accuracy alone is rarely enough in medicine. A model that makes a confident prediction but can't say *why* is difficult to trust and harder still to act on. So Deep MOLFT pairs its predictions with **SHAP**, a technique borrowed from game theory that fairly credits each molecular feature for its contribution to a decision. The result is not just a label, but a ranked list of the genes and molecules that drove it.

Encouragingly, when the model's explanations were examined, they kept pointing back to genes and regulators already implicated in the diseases under study — a sign that it is latching onto real biology rather than statistical coincidence. That turns the model from a black box into something closer to a hypothesis generator: a tool that can suggest candidates worth a closer look at the lab bench.

### Why it matters

The broader lesson is simple. Combining biological data well is less about throwing everything into one model and more about respecting the structure of each data type — and then insisting the model show its work. Done that way, multi-omics analysis can move beyond prediction toward genuine insight: not only flagging *that* something is wrong, but offering clues about *why*.

There is plenty left to do — scaling these ideas to single-cell data, making them faster on larger cohorts, and validating them in the clinic. But the direction feels right: AI that is both more capable and more transparent, working with biology rather than around it.

*Deep MOLFT is part of my ongoing PhD research in bioinformatics. I'll share more technical write-ups and follow-ups here as the work develops.*
