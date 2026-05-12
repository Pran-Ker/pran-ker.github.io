---
slug: propsplat
issue: 0
date: 2026-05-08
title: "PropSplat: 3D Gaussian splatting reconstructs RF fields with 5.38 dB RMSE, no maps needed"
thesis: "Site-specific RF propagation usually needs ray-tracing over detailed 3D maps or dense surveys. PropSplat instead fits anisotropic 3D Gaussian primitives to sparse wireless measurements alone — 5.38 dB RMSE outdoors at 300 m spacing and 0.19 m indoor localization error, all without a floor plan or terrain model."
lab: "World Labs"
lab_url: "https://www.worldlabs.ai/"
paper_url: "http://arxiv.org/abs/2605.08035v1"
paper_id: "arXiv 2605.08035"
authors_html: "Bjorndahl · Pal Singh · Nouri · Camp"
tags: [ai4science, world-models]
caption: "Anisotropic 3D Gaussians as a learnable propagation medium — splats, not rays."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.08035v1"}
  - {label: "lab: World Labs", url: "https://www.worldlabs.ai/"}
  - {label: "related: NeRF²", url: "https://arxiv.org/abs/2305.06118"}
  - {label: "related: 3D Gaussian Splatting", url: "https://arxiv.org/abs/2308.04079"}
---

## Training recipe
- **Base:** anisotropic 3D Gaussian primitives parameterized as a propagation field.
- **Data:** sparse RF measurements — sub-6 GHz outdoor drive tests; indoor BLE.
- **Compute:** not reported.
- **Loss / algo:** measurement-fitting via Gaussian propagation splatting; no geometry priors.
- **Eval:** RMSE on RSS prediction (outdoor) and localization error (indoor); against WRF-GS+, GSRF, NeRF².

## Key learnings
- **Maps are optional.** RF-native splatting reaches map-aware baselines without floor plans, terrain, or clutter data.
- **Anisotropy matters.** Directional Gaussians capture reflections and shadowing that isotropic radiance fields miss.
- **Sparse-survey friendly.** Works at 300 m drive-test spacing, which makes rapid deployments practical.

## Use when
- You need a fast site-specific propagation model where 3D maps are missing, outdated, or restricted.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="PropSplat">
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
    <rect class="box" x="0" y="0" width="160" height="60"/><text class="lbl" x="14" y="28">Sparse RF samples</text><text class="sm" x="14" y="48">no map / floor plan</text>
    <rect class="pill" x="190" y="0" width="180" height="60"/><text class="lbl" x="204" y="28">Anisotropic Gaussians</text><text class="sm" x="204" y="48">3D propagation splats</text>
    <rect class="box" x="400" y="0" width="160" height="60"/><text class="lbl" x="414" y="28">Fit by splatting</text><text class="sm" x="414" y="48">measurement loss</text>
    <rect class="box" x="590" y="0" width="170" height="60"/><text class="lbl" x="604" y="28">Continuous RF field</text><text class="sm" x="604" y="48">site-specific</text>
    <rect class="box" x="790" y="0" width="90" height="60"/><text class="lbl" x="802" y="28">Predict</text>
    <path class="arrow" d="M160 30 L190 30"/><path class="arrow" d="M370 30 L400 30"/><path class="arrow" d="M560 30 L590 30"/><path class="arrow" d="M760 30 L790 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Outdoor</text><text class="sm" x="14" y="50">sub-6 GHz drive tests</text><text class="sm" x="14" y="68">300 m measurement spacing</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">Indoor</text><text class="sm" x="304" y="50">Bluetooth Low Energy</text><text class="sm" x="304" y="68">localization task</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Baselines</text><text class="sm" x="594" y="50">WRF-GS+, GSRF, NeRF²</text><text class="sm" x="594" y="68">map-aware competitors</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Outdoor RMSE (lower is better)</text><text class="sm" x="14" y="52">• PropSplat: 5.38 dB</text><text class="sm" x="14" y="72">• WRF-GS+: 5.87 dB · GSRF: 7.46 dB</text><text class="sm" x="14" y="92">• NeRF²: 14.76 dB</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">Indoor localization</text><text class="sm" x="454" y="52">• PropSplat: 0.19 m mean error</text><text class="sm" x="454" y="72">• NeRF²: 1.84 m</text><text class="sm" x="454" y="92">• near-identical RSS prediction acc.</text>
  </g>
</svg>
```
