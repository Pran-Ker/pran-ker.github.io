---
slug: ts-dfm
issue: 0
date: 2026-05-08
title: "TS-DFM: 8-step student beats 1024-step teacher by 32% perplexity, runs 128× faster"
thesis: "Discrete flow matching for text usually needs hundreds of forward passes; distilled students fail because the random sampling trajectory itself is the bottleneck. TS-DFM uses a lightweight 'energy compass' during training to pick coherent intermediate states, so an 8-step 170M-param student beats its 1,024-step teacher by 32% perplexity at 128× the speed."
lab: "Apple Intelligence"
lab_url: "https://machinelearning.apple.com/"
paper_url: "http://arxiv.org/abs/2605.07924v1"
paper_id: "arXiv 2605.07924"
authors_html: "Karimi Monsefi · Culver · Bhendawade · Ciosici · Zhang · Belousova"
tags: [distillation, efficiency]
caption: "Energy compass at training time only; inference path is unchanged."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.07924v1"}
  - {label: "lab: Apple Intelligence", url: "https://machinelearning.apple.com/"}
  - {label: "related: Discrete Flow Matching", url: "https://arxiv.org/abs/2407.15595"}
  - {label: "related: Consistency Models", url: "https://arxiv.org/abs/2303.01469"}
---

## Training recipe
- **Base:** 170M-param discrete flow matching language model.
- **Data:** standard text corpus; teacher = 1,024-step DFM.
- **Compute:** not reported.
- **Loss / algo:** trajectory-shaped DFM — energy evaluator scores candidate intermediate continuations during student training.
- **Eval:** perplexity, generation quality vs. teacher and discrete-gen baselines.

## Key learnings
- **Trajectory > capacity.** The bottleneck for few-step distillation is the noisy training path, not the student's parameter count.
- **Energy compass is training-only.** Inference speed of the student is preserved — pure quality gain at zero deploy cost.
- **Beats data and parameter scaling.** TS-DFM outperforms baselines trained on 6× more data or with 5× larger models.

## Use when
- You want fast text generation from a small model and have hit the wall on naive flow-matching distillation.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="TS-DFM">
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
    <rect class="box" x="0" y="0" width="160" height="60"/><text class="lbl" x="14" y="28">Noise tokens</text>
    <rect class="box" x="190" y="0" width="160" height="60"/><text class="lbl" x="204" y="28">1024-step teacher</text><text class="sm" x="204" y="48">DFM trajectory</text>
    <rect class="pill" x="380" y="0" width="160" height="60"/><text class="lbl" x="394" y="28">Energy compass</text><text class="sm" x="394" y="48">pick coherent state</text>
    <rect class="box" x="570" y="0" width="160" height="60"/><text class="lbl" x="584" y="28">8-step student</text><text class="sm" x="584" y="48">trains on shaped path</text>
    <rect class="box" x="760" y="0" width="120" height="60"/><text class="lbl" x="774" y="28">Text out</text>
    <path class="arrow" d="M160 30 L190 30"/><path class="arrow" d="M350 30 L380 30"/><path class="arrow" d="M540 30 L570 30"/><path class="arrow" d="M730 30 L760 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">Vanilla distillation</text><text class="sm" x="14" y="50">random jumps in trajectory</text><text class="sm" x="14" y="68">student underperforms</text>
    <rect class="pill" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">TS-DFM (this work)</text><text class="sm" x="304" y="50">energy-shaped trajectory</text><text class="sm" x="304" y="68">student catches teacher</text>
    <rect class="box" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">Inference unchanged</text><text class="sm" x="594" y="50">no compass at test time</text><text class="sm" x="594" y="68">same 8-step path</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• 170M-param language model</text><text class="sm" x="14" y="72">• vs. 1024-step DFM teacher</text><text class="sm" x="14" y="92">• vs. baselines with 6× data / 5× params</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• 32% lower perplexity than teacher</text><text class="sm" x="454" y="72">• 128× faster at inference</text><text class="sm" x="454" y="92">• gains hold across source distributions</text>
  </g>
</svg>
```
