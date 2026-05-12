---
slug: mean-mode-screaming
issue: 0
date: 2026-05-07
title: "Mean-Mode Screaming: a mean–variance split residual trains a 1000-layer Diffusion Transformer"
thesis: "Stacking Diffusion Transformers past a few hundred layers triggers a silent collapse where tokens homogenize and centered variation dies — the authors call it Mean Mode Screaming. They trace it to gradient decomposition compounded by softmax-Jacobian null-space suppression. A Mean-Variance Split residual (centered update + leaky trunk-mean replacement) trains a stable 1000-layer DiT where LayerScale and baselines crash by 400."
lab: "Cohere"
lab_url: "https://cohere.com/research"
paper_url: "https://arxiv.org/abs/2605.06169"
paper_id: "arXiv 2605.06169"
authors_html: "Lu"
tags: [pretraining, multimodal]
caption: "Diagnose the collapse, then split residual into mean and centered components — 1000-layer DiTs train."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.06169"}
  - {label: "related: DiT", url: "https://arxiv.org/abs/2212.09748"}
  - {label: "related: LayerScale (CaiT)", url: "https://arxiv.org/abs/2103.17239"}
---

## Training recipe
- **Base:** Diffusion Transformer (DiT) scaled from baseline depth up to 1000 layers.
- **Data:** standard image diffusion pretraining (not specified in abstract).
- **Compute:** not reported.
- **Loss / algo:** flow/diffusion loss with Mean-Variance Split (MV-Split) residuals — centered residual update + leaky trunk-mean replacement.
- **Schedule / hparams:** not reported in abstract.
- **Eval:** training stability vs LayerScale and token-isotropic baselines across depth schedules; qualitative trajectory tracking.

## Key learnings
- **MMS is a structural failure mode.** Networks slide into a mean-dominated state that suppresses centered variation.
- **Softmax Jacobian null space** structurally suppresses attention-logit gradients, compounding the collapse.
- **400 layers is where baselines die.** LayerScale and token-isotropic methods diverge; MV-Split trains.
- **1000 layers stable.** First reported stable training run at this depth for DiTs.
- **Gradient decomposition is exact.** The mean-coherent vs centered split admits a clean analytical treatment.

## Use when
- **Scaling diffusion depth** past ~400 layers and observing silent quality regressions.
- **Diagnosing residual collapse** — measure centered variance per layer to catch MMS early.
- **Picking a normalization stack** for very deep transformers, vision or otherwise.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="Mean-Variance Split residual for deep DiTs">
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
    <text class="tag" x="0" y="-8">PIPELINE</text>
    <rect class="box" x="0" y="0" width="160" height="60"/>
    <text class="lbl" x="80" y="28" text-anchor="middle">Token x_l</text>
    <text class="sm"  x="80" y="46" text-anchor="middle">layer input</text>
    <line class="arrow" x1="160" y1="30" x2="210" y2="30"/>
    <rect class="pill" x="210" y="0" width="190" height="60"/>
    <text class="lbl" x="305" y="22" text-anchor="middle">Mean / centered split</text>
    <text class="sm"  x="305" y="42" text-anchor="middle">μ_l · (x_l − μ_l)</text>
    <line class="arrow" x1="400" y1="30" x2="450" y2="30"/>
    <rect class="box" x="450" y="0" width="200" height="60"/>
    <text class="lbl" x="550" y="22" text-anchor="middle">Centered residual</text>
    <text class="sm"  x="550" y="42" text-anchor="middle">gained update</text>
    <line class="arrow" x1="650" y1="30" x2="700" y2="30"/>
    <rect class="box" x="700" y="0" width="180" height="60"/>
    <text class="lbl" x="790" y="22" text-anchor="middle">Leaky trunk-mean</text>
    <text class="sm"  x="790" y="42" text-anchor="middle">replaces μ_l</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="280" height="80"/>
    <text class="lbl" x="140" y="28" text-anchor="middle">Baseline DiT</text>
    <text class="sm"  x="140" y="50" text-anchor="middle">collapses by 400 layers</text>
    <rect class="box" x="300" y="0" width="280" height="80"/>
    <text class="lbl" x="440" y="28" text-anchor="middle">LayerScale / isotropic</text>
    <text class="sm"  x="440" y="50" text-anchor="middle">also diverges at depth</text>
    <rect class="pill" x="600" y="0" width="260" height="80"/>
    <text class="lbl" x="730" y="28" text-anchor="middle">MV-Split</text>
    <text class="sm"  x="730" y="50" text-anchor="middle">stable to 1000 layers</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Failure mechanism</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">mean-coherent gradient grows</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">centered variance suppressed</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">softmax Jacobian null space</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Training stability</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">400-layer baseline: crashes</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">MV-Split: 1000-layer DiT runs</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">beats LayerScale across schedule</text>
  </g>
</svg>
```
