---
slug: specblock-decoding
issue: 0
date: 2026-05-08
title: "SpecBlock: block-iterative speculative drafting beats EAGLE-3 by 8–13% at ~half the drafting cost"
thesis: "Speculative decoding pits autoregressive drafters (high accuracy, high latency) against parallel drafters (fast but path-incoherent). SpecBlock produces K dependent positions per forward pass via layer-wise shift and cross-block inheritance, and adapts the draft tree online with a cost-aware bandit. It outpaces EAGLE-3 by 8–13% at 44–52% of the drafting cost."
lab: "SSI"
lab_url: "https://ssi.inc/"
paper_url: "https://arxiv.org/abs/2605.07243"
paper_id: "arXiv 2605.07243"
authors_html: "Shi · Xu · Deng · Wu · Liu · Xu · Chen · Zhu · Xu · Huang · Yang · Zhou"
tags: [efficiency, distillation]
caption: "Path-dependent block drafts + a bandit on draft cost — EAGLE-3 quality at half the price."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.07243"}
  - {label: "related: EAGLE-3", url: "https://arxiv.org/abs/2503.01840"}
---

## Training recipe
- **Base:** standard target LLM with speculative decoding; drafter co-trained with a rank head.
- **Data:** standard draft-training corpora (not specified in abstract).
- **Compute:** not reported.
- **Loss / algo:** block-iterative draft producing K dependent positions per pass; valid-prefix masking; cost-aware bandit for online tree updates.
- **Schedule / hparams:** not reported.
- **Eval:** end-to-end mean speedup and drafting cost vs EAGLE-3.

## Key learnings
- **8–13% speedup over EAGLE-3** at 44–52% of EAGLE-3's drafting cost.
- **+11–19% extra lead** when cost-aware deployment-time bandit is enabled.
- **Layer-wise shift** keeps hidden states within a block, restoring path dependence cheaply.
- **Valid-prefix mask** prevents the drafter from training on prefixes the verifier would reject.
- **Trees adapt online** — verifier feedback steers the draft topology without offline retraining.

## Use when
- **Latency-critical inference** where you've already deployed EAGLE-style speculative decoding.
- **Cost-constrained drafting** on small GPUs — half the draft compute matters a lot.
- **Long-form generation** where path coherence across many drafted tokens governs acceptance rate.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="SpecBlock pipeline">
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
    <rect class="box" x="0" y="0" width="150" height="60"/>
    <text class="lbl" x="75" y="28" text-anchor="middle">Drafter</text>
    <text class="sm"  x="75" y="46" text-anchor="middle">block of K tokens</text>
    <line class="arrow" x1="150" y1="30" x2="200" y2="30"/>
    <rect class="pill" x="200" y="0" width="190" height="60"/>
    <text class="lbl" x="295" y="22" text-anchor="middle">Layer-wise shift</text>
    <text class="sm"  x="295" y="42" text-anchor="middle">path dependence preserved</text>
    <line class="arrow" x1="390" y1="30" x2="440" y2="30"/>
    <rect class="box" x="440" y="0" width="190" height="60"/>
    <text class="lbl" x="535" y="22" text-anchor="middle">Dynamic tree</text>
    <text class="sm"  x="535" y="42" text-anchor="middle">rank-head branching</text>
    <line class="arrow" x1="630" y1="30" x2="680" y2="30"/>
    <rect class="box" x="680" y="0" width="180" height="60"/>
    <text class="lbl" x="770" y="22" text-anchor="middle">Target verifier</text>
    <text class="sm"  x="770" y="42" text-anchor="middle">one forward pass</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="210" height="80"/>
    <text class="lbl" x="105" y="28" text-anchor="middle">K dependent tokens</text>
    <text class="sm"  x="105" y="50" text-anchor="middle">per drafter pass</text>
    <rect class="box" x="230" y="0" width="210" height="80"/>
    <text class="lbl" x="335" y="28" text-anchor="middle">Valid-prefix mask</text>
    <text class="sm"  x="335" y="50" text-anchor="middle">skip rejected prefixes</text>
    <rect class="box" x="460" y="0" width="210" height="80"/>
    <text class="lbl" x="565" y="28" text-anchor="middle">Cross-block inherit</text>
    <text class="sm"  x="565" y="50" text-anchor="middle">continue good paths</text>
    <rect class="pill" x="690" y="0" width="170" height="80"/>
    <text class="lbl" x="775" y="28" text-anchor="middle">Cost-aware bandit</text>
    <text class="sm"  x="775" y="50" text-anchor="middle">online tree update</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">vs EAGLE-3</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">+8–13% end-to-end speedup</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">44–52% of EAGLE-3 drafting cost</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">no quality loss reported</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Cost-aware adaptation</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">+11–19% extra lead at deployment</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">selective online drafter updates</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">driven by verifier feedback</text>
  </g>
</svg>
```
