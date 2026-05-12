---
slug: cellrefine
issue: 0
date: 2026-05-08
title: "CellRefine: marker-gene-guided post-pretraining lifts single-cell tasks up to 15%"
thesis: "Single-cell foundation models inherit a long-tailed cell-type distribution from pretraining, which warps embeddings for rare populations. CellRefine inserts a marker-gene-guided post-pretraining stage between pretraining and fine-tuning, recovering up to 15% on downstream tasks without touching the base model's weights schedule."
lab: "Prior Labs"
lab_url: "https://www.priorlabs.ai/"
paper_url: "http://arxiv.org/abs/2605.07938v1"
paper_id: "arXiv 2605.07938"
authors_html: "Weerasekara · Darras · Kamarthi · Price · Isaacs"
tags: [ai4science, pretraining]
caption: "Three-stage flow: pretrain → marker-gene refinement → task fine-tune."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.07938v1"}
  - {label: "lab: Prior Labs", url: "https://www.priorlabs.ai/"}
  - {label: "related: scGPT", url: "https://arxiv.org/abs/2306.04371"}
  - {label: "related: Geneformer", url: "https://www.nature.com/articles/s41586-023-06139-9"}
---

## Training recipe
- **Base:** single-cell foundation model (gene-expression LM).
- **Data:** scRNA-seq with marker-gene sets as structural priors.
- **Compute:** not reported.
- **Loss / algo:** multi-faceted objective that aligns latent prototypes with curated marker-gene signatures during a post-pretraining stage.
- **Eval:** downstream SCRL tasks (cell-type ID, etc.) — gains up to 15% over pretrain-then-finetune baselines.

## Key learnings
- **Long-tail bites SCRL.** Naive pretraining underweights rare cell types; embeddings collapse toward majority states.
- **Marker genes as scaffolding.** Treating curated signatures as prototype anchors gives biological structure to latent space.
- **Sits between pretrain and FT.** Cheap, modular, doesn't require redoing the foundation pretrain.

## Use when
- You have a single-cell foundation model and downstream metrics on rare cell populations are the bottleneck.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="CellRefine">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#1c1917"/>
    </marker>
  </defs>
  <style>
    .lbl { font: 600 14px "Inter", sans-serif; fill: #1c1917; }
    .sm  { font: 500 12px "JetBrains Mono", monospace; fill: #57534e; }
    .tag { font: 600 11px "JetBrains Mono", monospace; fill: #c2410c; letter-spacing: .1em; }
    .box { fill: #fff; stroke: #1c1917; stroke-width: 1.2; }
    .pill{ fill: #fef1e7; stroke: #c2410c; stroke-width: 1.2; }
    .arrow { stroke: #1c1917; stroke-width: 1.6; fill: none; marker-end: url(#arr); }
  </style>
  <g transform="translate(20,40)">
    <text class="tag" x="0" y="-10">PIPELINE</text>
    <rect class="box" x="0" y="0" width="160" height="60"/><text class="lbl" x="14" y="28">scRNA-seq</text><text class="sm" x="14" y="48">gene-expression x</text>
    <rect class="box" x="190" y="0" width="160" height="60"/><text class="lbl" x="204" y="28">Pretrained FM</text><text class="sm" x="204" y="48">cell embeddings</text>
    <rect class="pill" x="380" y="0" width="180" height="60"/><text class="lbl" x="394" y="28">CellRefine stage</text><text class="sm" x="394" y="48">marker-gene prototypes</text>
    <rect class="box" x="590" y="0" width="160" height="60"/><text class="lbl" x="604" y="28">Task FT</text><text class="sm" x="604" y="48">cell-type ID, etc.</text>
    <rect class="box" x="780" y="0" width="100" height="60"/><text class="lbl" x="794" y="28">Predict</text>
    <path class="arrow" d="M160 30 L190 30"/><path class="arrow" d="M350 30 L380 30"/><path class="arrow" d="M560 30 L590 30"/><path class="arrow" d="M750 30 L780 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Stage 1 — Pretrain</text><text class="sm" x="14" y="50">large unlabeled scRNA-seq</text><text class="sm" x="14" y="68">long-tailed cell types</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">Stage 2 — Refine</text><text class="sm" x="304" y="50">marker-gene prototypes</text><text class="sm" x="304" y="68">structural priors</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Stage 3 — Fine-tune</text><text class="sm" x="594" y="50">downstream supervision</text><text class="sm" x="594" y="68">small labeled set</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• multiple SCRL downstream tasks</text><text class="sm" x="14" y="72">• rare cell-type identification</text><text class="sm" x="14" y="92">• standard pretrain → FT baselines</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• up to 15% improvement vs. baseline</text><text class="sm" x="454" y="72">• consistent gains across tasks</text><text class="sm" x="454" y="92">• modular: no retraining of base model</text>
  </g>
</svg>
```
