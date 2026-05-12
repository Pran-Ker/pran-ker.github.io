---
slug: equino-qdeim
issue: 0
date: 2026-05-08
title: "EquiNO + Q-DEIM: physics-informed operator learning cuts per-step training cost ~1,000×"
thesis: "Physics-informed neural operators are attractive for microstructure surrogates but eating a full-field loss every step is too expensive to scale to 3D. Combining the Equilibrium Neural Operator (periodicity + divergence-free bases) with Q-DEIM hyperreduction restricts constitutive evaluations to a few pivot points, cutting per-step training cost by ~10³ and unlocking 10³–10⁴× speed-ups for hyperelastic homogenization."
lab: "Periodic Labs"
lab_url: "https://periodiclabs.ai/"
paper_url: "http://arxiv.org/abs/2605.07738v1"
paper_id: "arXiv 2605.07738"
authors_html: "Eivazi · Wessels"
tags: [ai4science, efficiency]
caption: "EquiNO learns modal coefficients on a periodic divergence-free basis; Q-DEIM restricts constitutive evals."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.07738v1"}
  - {label: "lab: Periodic Labs", url: "https://periodiclabs.ai/"}
  - {label: "related: DEIM", url: "https://epubs.siam.org/doi/10.1137/090766498"}
  - {label: "related: Neural Operators", url: "https://arxiv.org/abs/2108.08481"}
---

## Training recipe
- **Base:** Equilibrium Neural Operator (EquiNO) on a periodic, divergence-free Fourier-style basis.
- **Data:** 3D representative volume elements (RVEs) for finite-strain hyperelasticity.
- **Compute:** not reported; enables full-batch second-order optimization on 3D RVEs.
- **Loss / algo:** physics-informed loss with Q-DEIM hyperreduction — column-pivoted QR on the stress basis selects pivot points.
- **Eval:** stress-field accuracy on interpolation and extrapolation RVEs.

## Key learnings
- **Hyperreduce the loss, not the model.** Q-DEIM evaluates the constitutive law at pivot points only; gradients still match the full-field objective.
- **Bake physics into the basis.** Periodicity and equilibrium are enforced by construction, so the operator never has to learn them.
- **Three orders of magnitude.** Per-step training cost drops ~1000× and homogenization runs 10³–10⁴× faster than direct FE.

## Use when
- You're building a microstructure surrogate for multiscale FEM and direct full-field training is too expensive in 3D.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="EquiNO Q-DEIM">
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
    <rect class="box" x="0" y="0" width="150" height="60"/><text class="lbl" x="14" y="28">3D RVE input</text><text class="sm" x="14" y="48">macro strain</text>
    <rect class="box" x="180" y="0" width="160" height="60"/><text class="lbl" x="194" y="28">EquiNO</text><text class="sm" x="194" y="48">periodic div-free basis</text>
    <rect class="pill" x="370" y="0" width="160" height="60"/><text class="lbl" x="384" y="28">Q-DEIM pivots</text><text class="sm" x="384" y="48">col-pivoted QR</text>
    <rect class="box" x="560" y="0" width="170" height="60"/><text class="lbl" x="574" y="28">Constitutive law</text><text class="sm" x="574" y="48">evaluated at pivots only</text>
    <rect class="box" x="760" y="0" width="120" height="60"/><text class="lbl" x="774" y="28">Stress field</text>
    <path class="arrow" d="M150 30 L180 30"/><path class="arrow" d="M340 30 L370 30"/><path class="arrow" d="M530 30 L560 30"/><path class="arrow" d="M730 30 L760 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Hard constraints</text><text class="sm" x="14" y="50">periodicity by basis</text><text class="sm" x="14" y="68">equilibrium by div-free</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">Hyperreduced loss</text><text class="sm" x="304" y="50">stress basis pivots</text><text class="sm" x="304" y="68">minimal offline snapshots</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Optimization</text><text class="sm" x="594" y="50">full-batch, second-order</text><text class="sm" x="594" y="68">tractable in 3D</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• finite-strain hyperelastic RVEs</text><text class="sm" x="14" y="72">• interpolation + extrapolation loads</text><text class="sm" x="14" y="92">• 3D multiscale FE homogenization</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• ~1000× lower per-step training cost</text><text class="sm" x="454" y="72">• 10³–10⁴× speedup over direct FE</text><text class="sm" x="454" y="92">• accurate stress beyond train distribution</text>
  </g>
</svg>
```
