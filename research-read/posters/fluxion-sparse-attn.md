---
slug: fluxion-sparse-attn
issue: 0
date: 2026-05-08
title: "Fluxion: hybrid CPU-GPU sparse attention gives 1.5–3.7× speedup, only −0.26 quality"
thesis: "Long-context decoding increasingly spills KV cache to host memory. Fluxion combines output-aware KV budgeting, head-specific sparsity, and a CPU-GPU scheduler so block-sparse attention runs across both devices — 1.5–3.7× faster than the strongest fixed sparse-hybrid baseline at worst-case −0.26 quality."
lab: "Meta Superintelligence Labs"
lab_url: "https://ai.meta.com/research/"
paper_url: "http://arxiv.org/abs/2605.07719v1"
paper_id: "arXiv 2605.07719"
authors_html: "Yao · Niu · Li · Xiong · Fang · Wang"
tags: [efficiency]
caption: "Three pieces: per-head sparsity, output-aware KV budget, CPU-GPU schedule."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.07719v1"}
  - {label: "lab: Meta Superintelligence Labs", url: "https://ai.meta.com/research/"}
  - {label: "related: H2O", url: "https://arxiv.org/abs/2306.14048"}
  - {label: "related: StreamingLLM", url: "https://arxiv.org/abs/2309.17453"}
---

## Training recipe
- **Base:** long-context LLMs with CPU-resident KV caches (disaggregated prefill/decode setup).
- **Data:** not applicable — inference-time system.
- **Compute:** CPU + GPU; no retraining required.
- **Loss / algo:** block-sparse attention with head-property predictor, granularity-budget selector, and priority-based CPU-GPU scheduler.
- **Eval:** 2 models, 3 benchmarks, 40 tasks vs. strongest fixed sparse-hybrid baseline.

## Key learnings
- **Output-aware budgeting.** Allocating KV budget to what the current output actually attends to beats fixed token budgets per head.
- **Heads aren't interchangeable.** Different heads want different sparsity patterns and granularities — encode that explicitly.
- **Schedule across devices.** Treating CPU and GPU as one priority queue is what turns sparsity from theoretical to real wins.

## Use when
- You're serving long context, your KV cache no longer fits on one GPU, and a uniform sparse policy is leaving throughput on the table.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="Fluxion">
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
    <rect class="box" x="0" y="0" width="150" height="60"/><text class="lbl" x="14" y="28">Long ctx Q</text><text class="sm" x="14" y="48">decode step</text>
    <rect class="box" x="180" y="0" width="170" height="60"/><text class="lbl" x="194" y="28">Head predictor</text><text class="sm" x="194" y="48">per-head pattern</text>
    <rect class="pill" x="380" y="0" width="170" height="60"/><text class="lbl" x="394" y="28">KV budget</text><text class="sm" x="394" y="48">output-aware</text>
    <rect class="box" x="580" y="0" width="180" height="60"/><text class="lbl" x="594" y="28">Sched: CPU + GPU</text><text class="sm" x="594" y="48">priority queue</text>
    <rect class="box" x="790" y="0" width="90" height="60"/><text class="lbl" x="802" y="28">Tokens</text>
    <path class="arrow" d="M150 30 L180 30"/><path class="arrow" d="M350 30 L380 30"/><path class="arrow" d="M550 30 L580 30"/><path class="arrow" d="M760 30 L790 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Where KV lives</text><text class="sm" x="14" y="50">CPU host memory</text><text class="sm" x="14" y="68">spillover from GPU</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">Sparsity pattern</text><text class="sm" x="304" y="50">block-sparse, per head</text><text class="sm" x="304" y="68">granularity selected</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Coordination</text><text class="sm" x="594" y="50">CPU does cold KV reads</text><text class="sm" x="594" y="68">GPU does dense compute</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• 2 models · 3 benchmarks · 40 tasks</text><text class="sm" x="14" y="72">• vs. strongest fixed sparse hybrid</text><text class="sm" x="14" y="92">• vs. FULL (dense) for quality floor</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• 1.5–3.7× speedup vs. best baseline</text><text class="sm" x="454" y="72">• worst-case quality −0.26 vs. FULL</text><text class="sm" x="454" y="92">• no model retraining required</text>
  </g>
</svg>
```
