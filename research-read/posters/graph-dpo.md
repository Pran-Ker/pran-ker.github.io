---
slug: graph-dpo
issue: 0
date: 2026-05-08
title: "GraphDPO: optimize over preference DAGs at linear-per-prompt cost, not just pairs"
thesis: "DPO reduces multi-rollout feedback to independent pairs, throwing away transitivity. GraphDPO treats per-prompt rollouts as a directed acyclic preference graph, aggregates with log-sum-exp at linear per-prompt cost, and outperforms pairwise and listwise alignment baselines on reasoning and program-synthesis tasks."
lab: "Anthropic"
lab_url: "https://www.anthropic.com/research"
paper_url: "http://arxiv.org/abs/2605.08037v1"
paper_id: "arXiv 2605.08037"
authors_html: "Liu · Sun · Klinkner · Malmasi"
tags: [alignment, rl-post-training]
caption: "Per-prompt rollouts form a DAG; ground-truth solutions anchor as dominant nodes."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.08037v1"}
  - {label: "lab: Anthropic", url: "https://www.anthropic.com/research"}
  - {label: "related: DPO", url: "https://arxiv.org/abs/2305.18290"}
  - {label: "related: Listwise PO", url: "https://arxiv.org/abs/2402.01878"}
---

## Training recipe
- **Base:** instruction-tuned LM (any DPO-amenable base).
- **Data:** multiple rollouts per prompt with rankings; optional verified solutions as dominant nodes.
- **Compute:** not reported.
- **Loss / algo:** Graph DPO — log-sum-exp over directed acyclic preference graphs with annealed anchoring of ground-truth nodes; layer-based equivalence-class handling.
- **Eval:** reasoning and program-synthesis benchmarks vs. pairwise / listwise PO.

## Key learnings
- **Transitivity is signal.** Pair-only DPO forgets that A>B and B>C imply A>C; the graph keeps the structure.
- **Linear per-prompt.** Log-sum-exp aggregation makes the full DAG no more expensive than independent pairs.
- **Anchor with verified answers.** Annealed dominance from a ground-truth node stabilizes training where the preference signal is sparse.

## Use when
- You have rollout rankings (or graders that produce orderings), and pair-only DPO has plateaued on reasoning tasks.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="GraphDPO">
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
    <rect class="box" x="0" y="0" width="150" height="60"/><text class="lbl" x="14" y="28">Prompt</text>
    <rect class="box" x="180" y="0" width="160" height="60"/><text class="lbl" x="194" y="28">Multi rollouts</text><text class="sm" x="194" y="48">ranked outputs</text>
    <rect class="pill" x="370" y="0" width="160" height="60"/><text class="lbl" x="384" y="28">Preference DAG</text><text class="sm" x="384" y="48">+ GT anchor node</text>
    <rect class="box" x="560" y="0" width="170" height="60"/><text class="lbl" x="574" y="28">Graph DPO loss</text><text class="sm" x="574" y="48">log-sum-exp agg.</text>
    <rect class="box" x="760" y="0" width="120" height="60"/><text class="lbl" x="774" y="28">Aligned LM</text>
    <path class="arrow" d="M150 30 L180 30"/><path class="arrow" d="M340 30 L370 30"/><path class="arrow" d="M530 30 L560 30"/><path class="arrow" d="M730 30 L760 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Pairwise DPO</text><text class="sm" x="14" y="50">independent (A,B) pairs</text><text class="sm" x="14" y="68">loses transitivity</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">Graph DPO</text><text class="sm" x="304" y="50">DAG of preferences</text><text class="sm" x="304" y="68">linear per-prompt cost</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Equivalence layers</text><text class="sm" x="594" y="50">no spurious gradients</text><text class="sm" x="594" y="68">discrete/sparse signals OK</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• reasoning benchmarks</text><text class="sm" x="14" y="72">• program-synthesis tasks</text><text class="sm" x="14" y="92">• vs. pairwise + listwise PO</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• graph-structured PO beats baselines</text><text class="sm" x="454" y="72">• scales with more rollouts per prompt</text><text class="sm" x="454" y="92">• stable training with GT anchor anneal</text>
  </g>
</svg>
```
