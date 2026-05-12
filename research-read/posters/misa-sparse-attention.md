---
slug: misa-sparse-attention
issue: 0
date: 2026-05-08
title: "MISA: a routed mixture of indexer heads gives DeepSeek Sparse Attention a 3.82× indexer speedup on H200"
thesis: "DeepSeek Sparse Attention (DSA) selects tokens with a 64-head indexer that dominates cost. MISA treats indexer heads as experts and routes 8 of them per query, matching DSA's selection quality while running 3.82× faster on H200, with no retraining."
lab: "DeepSeek"
lab_url: "https://www.deepseek.com/"
paper_url: "https://arxiv.org/abs/2605.07363"
paper_id: "arXiv 2605.07363"
authors_html: "Zhou · Meng · Xu · Liu · Lu · Zhang · Pei"
tags: [efficiency, pretraining]
caption: "Route indexer heads as MoE: 8 of 64 active, ≥92% selection overlap, 3.82× speedup on long context."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.07363"}
  - {label: "lab: DeepSeek", url: "https://www.deepseek.com/"}
  - {label: "related: DeepSeek-V3.2 / DSA", url: "https://arxiv.org/abs/2412.19437"}
---

## Training recipe
- **Base:** DeepSeek-V3.2 and GLM-5 with their pretrained DSA indexers.
- **Data:** evaluation on LongBench and Needle-in-a-Haystack; no fine-tuning.
- **Compute:** NVIDIA H200 GPU for inference benchmarks.
- **Loss / algo:** lightweight router selects task-dependent subsets of indexer heads (MoE-style); no additional training.
- **Schedule / hparams:** 8 active heads from 64 on DeepSeek-V3.2; 4× fewer heads on GLM-5.
- **Eval:** LongBench accuracy parity; NIAH passing up to 128K tokens; speed vs dense DSA indexer.

## Key learnings
- **Indexer heads are redundant.** 8 of 64 heads suffice to keep ≥92% per-layer token overlap with the dense DSA indexer.
- **3.82× indexer speedup** on H200 with no quality loss on LongBench.
- **128K needles still found.** NIAH remains fully green across positions.
- **Training-free.** Routing is plug-in; no weight updates to the host model.
- **Generalizes across architectures.** GLM-5 needs only 4× fewer indexer heads for matched quality.

## Use when
- **Serving** DSA-style models on H100/H200 and the indexer is your inference bottleneck.
- **Long-context retrieval** workloads (LongBench, NIAH) where token-selection cost dominates.
- **Researching** sparse-attention designs — MISA is a clean drop-in baseline to beat.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="MISA mixture-of-indexer-heads">
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
    <text class="lbl" x="80" y="28" text-anchor="middle">Query / prefix</text>
    <text class="sm"  x="80" y="46" text-anchor="middle">long context tokens</text>
    <line class="arrow" x1="160" y1="30" x2="210" y2="30"/>
    <rect class="pill" x="210" y="0" width="180" height="60"/>
    <text class="lbl" x="300" y="22" text-anchor="middle">Router</text>
    <text class="sm"  x="300" y="42" text-anchor="middle">pick 8/64 heads</text>
    <line class="arrow" x1="390" y1="30" x2="440" y2="30"/>
    <rect class="box" x="440" y="0" width="190" height="60"/>
    <text class="lbl" x="535" y="22" text-anchor="middle">MoE indexer</text>
    <text class="sm"  x="535" y="42" text-anchor="middle">score prefix tokens</text>
    <line class="arrow" x1="630" y1="30" x2="680" y2="30"/>
    <rect class="box" x="680" y="0" width="180" height="60"/>
    <text class="lbl" x="770" y="22" text-anchor="middle">Sparse attention</text>
    <text class="sm"  x="770" y="42" text-anchor="middle">selected tokens only</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="210" height="80"/>
    <text class="lbl" x="105" y="28" text-anchor="middle">DeepSeek-V3.2</text>
    <text class="sm"  x="105" y="50" text-anchor="middle">8 / 64 active heads</text>
    <rect class="box" x="230" y="0" width="210" height="80"/>
    <text class="lbl" x="335" y="28" text-anchor="middle">GLM-5</text>
    <text class="sm"  x="335" y="50" text-anchor="middle">4× fewer heads</text>
    <rect class="pill" x="460" y="0" width="200" height="80"/>
    <text class="lbl" x="560" y="28" text-anchor="middle">Token overlap</text>
    <text class="sm"  x="560" y="50" text-anchor="middle">≥ 92% vs dense DSA</text>
    <rect class="box" x="680" y="0" width="180" height="80"/>
    <text class="lbl" x="770" y="28" text-anchor="middle">No retraining</text>
    <text class="sm"  x="770" y="50" text-anchor="middle">plug-in router</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">LongBench (quality)</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">matches dense DSA indexer</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">≥92% per-layer token overlap</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">NIAH green to 128K context</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Speed on H200</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">3.82× faster indexer vs DSA</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">8 active heads instead of 64</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">scales to GLM-5 with 4× fewer heads</text>
  </g>
</svg>
```
