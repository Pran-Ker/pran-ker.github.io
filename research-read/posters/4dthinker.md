---
slug: 4dthinker
issue: 0
date: 2026-05-07
title: "4DThinker: VLMs reason in a continuous 4D latent — annotation-free pipeline, no external geometry module"
thesis: "Verbalizing space-time as text is verbose and slow; bolting on a 3D module is brittle. 4DThinker teaches a VLM to imagine in a continuous hidden 4D space via Dynamic-Imagery Fine-Tuning (jointly supervising text tokens and 4D latents) and 4D Reinforcement Learning (outcome rewards, gradients only on text). Trained on annotation-free 4D data synthesized from raw video."
lab: "World Labs"
lab_url: "https://worldlabs.ai/"
paper_url: "https://arxiv.org/abs/2605.05997"
paper_id: "arXiv 2605.05997"
authors_html: "Chen · Zhang · Yu · An · Li · Xie · Wang · Sun · Chen · Li · Hu · <a href='https://www.sigs.tsinghua.edu.cn/hrq/'>Huang</a>"
tags: [multimodal, reasoning, world-models]
caption: "Imagine the scene in 4D latents, talk in tokens — VLMs do spatial reasoning without explicit 3D."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.05997"}
  - {label: "related: SpatialVLM", url: "https://arxiv.org/abs/2401.12168"}
---

## Training recipe
- **Base:** vision-language model (specific checkpoint not stated in abstract).
- **Data:** annotation-free pipeline synthesizing 4D reasoning data from raw videos.
- **Compute:** not reported.
- **Loss / algo:** DIFT — joint supervision over text tokens and 4D latents; 4DRL — outcome rewards with policy gradient restricted to text tokens.
- **Schedule / hparams:** not reported.
- **Eval:** multiple dynamic spatial reasoning benchmarks vs strong VLM baselines (specifics not enumerated in abstract).

## Key learnings
- **Latent 4D imagination** is more compact than verbalized chains of thought for spatial reasoning.
- **No 3D module needed.** Continuous hidden-space simulation replaces explicit geometry pipelines.
- **Restricted policy-gradient on text** stabilizes RL — latents are shaped by SFT only.
- **Annotation-free data** scales 4D supervision without expensive human labels.
- **Numbers** vs named baselines are not enumerated in the abstract; check the paper tables.

## Use when
- **Building a VLM** that must answer "where will the object be next?" or "what occludes what?"
- **You lack 3D ground truth** — annotation-free 4D synthesis is the practical path.
- **Studying internal simulation** as an alternative to verbalized chain-of-thought.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="4DThinker">
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
    <text class="lbl" x="80" y="28" text-anchor="middle">Raw video</text>
    <text class="sm"  x="80" y="46" text-anchor="middle">monocular</text>
    <line class="arrow" x1="160" y1="30" x2="210" y2="30"/>
    <rect class="pill" x="210" y="0" width="200" height="60"/>
    <text class="lbl" x="310" y="22" text-anchor="middle">4D synth pipeline</text>
    <text class="sm"  x="310" y="42" text-anchor="middle">annotation-free</text>
    <line class="arrow" x1="410" y1="30" x2="460" y2="30"/>
    <rect class="box" x="460" y="0" width="200" height="60"/>
    <text class="lbl" x="560" y="22" text-anchor="middle">DIFT</text>
    <text class="sm"  x="560" y="42" text-anchor="middle">text + 4D latent SFT</text>
    <line class="arrow" x1="660" y1="30" x2="710" y2="30"/>
    <rect class="box" x="710" y="0" width="170" height="60"/>
    <text class="lbl" x="795" y="22" text-anchor="middle">4DRL</text>
    <text class="sm"  x="795" y="42" text-anchor="middle">text-token PG</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="280" height="80"/>
    <text class="lbl" x="140" y="28" text-anchor="middle">Text tokens</text>
    <text class="sm"  x="140" y="50" text-anchor="middle">answers, traces</text>
    <rect class="pill" x="300" y="0" width="280" height="80"/>
    <text class="lbl" x="440" y="28" text-anchor="middle">4D latents</text>
    <text class="sm"  x="440" y="50" text-anchor="middle">continuous scene state</text>
    <rect class="box" x="600" y="0" width="260" height="80"/>
    <text class="lbl" x="730" y="28" text-anchor="middle">No external 3D module</text>
    <text class="sm"  x="730" y="50" text-anchor="middle">imagination in-network</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Benchmarks</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">multiple dynamic spatial reasoning sets</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">vs strong VLM baselines</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">numbers not in abstract</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Why it works</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">latents simulate scene evolution</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">tokens stay short and verifiable</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">RL gradients only on text</text>
  </g>
</svg>
```
