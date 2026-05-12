---
slug: rethinking-rl-reasoning
issue: 0
date: 2026-05-07
title: "RL for reasoning edits only 1–3% of tokens — and a contrastive shortcut matches full RL ~1000× cheaper"
thesis: "The authors argue RL post-training on LLMs is sparse policy selection, not capability acquisition. Improvements concentrate at high-entropy decision points where promoted tokens already lie in the base model's top-5. A contrastive method, ReasonMaxxer, exploits this to match RL using a few hundred rollouts and minutes of single-GPU training."
lab: "Thinking Machines"
lab_url: "https://thinkingmachines.ai/"
paper_url: "https://arxiv.org/abs/2605.06241"
paper_id: "arXiv 2605.06241"
authors_html: "Akgül · Kannan · Neiswanger · <a href='https://sites.usc.edu/prasanna/'>Prasanna</a>"
tags: [rl-post-training, reasoning, efficiency]
caption: "RL doesn't add new strategies — it nudges a tiny fraction of high-entropy tokens within the base model's top-5."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.06241"}
  - {label: "lab: Thinking Machines", url: "https://thinkingmachines.ai/"}
  - {label: "related: GRPO/DeepSeek-R1", url: "https://arxiv.org/abs/2501.12948"}
---

## Training recipe
- **Base:** three model families, six scales (specific sizes not enumerated in abstract).
- **Data:** a few hundred base-model rollouts on math problems.
- **Compute:** minutes of single-GPU training.
- **Loss / algo:** contrastive loss applied only at entropy-gated decision points.
- **Schedule / hparams:** not reported in abstract.
- **Eval:** six math reasoning benchmarks; baseline is full RL post-training.

## Key learnings
- **RL is sparse.** Only 1–3% of token positions are altered relative to the base policy.
- **No new strategies.** Promoted tokens stay inside the base model's top-5 alternatives.
- **High-entropy gates matter.** Edits cluster where the base model is already uncertain.
- **Cheap surrogate works.** ReasonMaxxer reaches RL-level scores at ~3 orders of magnitude lower training cost.
- **Generalizes across scales.** The effect holds across three families and six model sizes.

## Use when
- **Diagnosing** what your RL run actually changed — entropy-gated token deltas localize the lift.
- **Bootstrapping reasoning** on a tight compute budget — skip RL infra, train a contrastive head on rollouts.
- **Auditing claims** that RL "teaches reasoning" — measure top-k overlap before celebrating.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="RL as sparse policy selection">
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
    <text class="lbl" x="75" y="28" text-anchor="middle">Base LLM</text>
    <text class="sm"  x="75" y="46" text-anchor="middle">rollouts on math</text>
    <line class="arrow" x1="150" y1="30" x2="200" y2="30"/>
    <rect class="box" x="200" y="0" width="180" height="60"/>
    <text class="lbl" x="290" y="22" text-anchor="middle">Entropy gate</text>
    <text class="sm"  x="290" y="42" text-anchor="middle">find top-k decision pts</text>
    <line class="arrow" x1="380" y1="30" x2="430" y2="30"/>
    <rect class="pill" x="430" y="0" width="200" height="60"/>
    <text class="lbl" x="530" y="22" text-anchor="middle">Contrastive update</text>
    <text class="sm"  x="530" y="42" text-anchor="middle">at 1–3% of tokens</text>
    <line class="arrow" x1="630" y1="30" x2="680" y2="30"/>
    <rect class="box" x="680" y="0" width="180" height="60"/>
    <text class="lbl" x="770" y="22" text-anchor="middle">ReasonMaxxer</text>
    <text class="sm"  x="770" y="42" text-anchor="middle">matches full-RL acc.</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="200" height="80"/>
    <text class="lbl" x="100" y="28" text-anchor="middle">3 model families</text>
    <text class="sm"  x="100" y="50" text-anchor="middle">cross-architecture</text>
    <rect class="box" x="220" y="0" width="200" height="80"/>
    <text class="lbl" x="320" y="28" text-anchor="middle">6 model scales</text>
    <text class="sm"  x="320" y="50" text-anchor="middle">sweep small → large</text>
    <rect class="box" x="440" y="0" width="200" height="80"/>
    <text class="lbl" x="540" y="28" text-anchor="middle">6 math benchmarks</text>
    <text class="sm"  x="540" y="50" text-anchor="middle">held-out eval</text>
    <rect class="pill" x="660" y="0" width="200" height="80"/>
    <text class="lbl" x="760" y="28" text-anchor="middle">Promoted ∈ top-5</text>
    <text class="sm"  x="760" y="50" text-anchor="middle">base-policy support</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Where do RL gains live?</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">1–3% of token positions</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">all promoted tokens in base top-5</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">concentrated at high-entropy gates</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">ReasonMaxxer vs full RL</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">~1000× cheaper training cost</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">few-hundred rollouts, minutes / 1 GPU</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">matches RL on 6 math benchmarks</text>
  </g>
</svg>
```
