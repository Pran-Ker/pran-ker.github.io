---
slug: aem-entropy-modulation
issue: 0
date: 2026-05-08
title: "AEM: response-level entropy modulation adds +1.4% to a SOTA SWE-bench RL agent, 1.5B–32B"
thesis: "Multi-turn agentic RL gets little signal from sparse outcome rewards. AEM is a supervision-free credit assignment that lifts entropy dynamics from the token level to the response level, then modulates exploration vs exploitation using the interaction of response advantage and relative surprisal. Dropped into a SOTA SWE RL framework it adds +1.4% on SWE-bench-Verified."
lab: "Ant BaiLing"
lab_url: "https://www.antgroup.com/en"
paper_url: "https://arxiv.org/abs/2605.00425"
paper_id: "arXiv 2605.00425"
authors_html: "Zhao · Zhou · Zhang · Yau · Zhang · Tian · Zhu · Huang · Zeng · Gu · Dong · Wu"
tags: [rl-post-training, agents]
caption: "Move entropy bookkeeping from tokens to whole responses; let advantage × surprisal pace exploration."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.00425"}
  - {label: "related: SWE-bench Verified", url: "https://openai.com/index/introducing-swe-bench-verified/"}
---

## Training recipe
- **Base:** LLM agents from 1.5B to 32B parameters.
- **Data:** task rollouts on ALFWorld, WebShop, and SWE-bench-Verified.
- **Compute:** not reported.
- **Loss / algo:** response-level entropy modulation as a supervision-free credit-assignment term; no process rewards.
- **Schedule / hparams:** entropy targets governed by sampled-response advantage × relative surprisal; exact hparams not reported.
- **Eval:** ALFWorld, WebShop, SWE-bench-Verified vs the base agentic RL framework.

## Key learnings
- **Granularity matters.** Token-level entropy mismatches LLM agent action granularity; response-level fits.
- **+1.4% on SWE-bench-Verified** when AEM is added to a SOTA SWE RL framework.
- **No dense supervision.** Avoids process rewards and auxiliary signals — fewer reward-hacking failure modes.
- **Auto exploration schedule.** Positive/negative sample balance drives the explore→exploit transition.
- **Scales 1.5B → 32B.** Gains persist across an order of magnitude of model size.

## Use when
- **Training an agent** with sparse outcome rewards across many turns and tools.
- **You already use GRPO/RLOO** — AEM is an entropy regularizer drop-in, not a new algo family.
- **Avoiding process-reward models** because of cost or hacking risk.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="AEM response-level entropy modulation">
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
    <text class="lbl" x="80" y="28" text-anchor="middle">Multi-turn rollouts</text>
    <text class="sm"  x="80" y="46" text-anchor="middle">tool use, env steps</text>
    <line class="arrow" x1="160" y1="30" x2="210" y2="30"/>
    <rect class="box" x="210" y="0" width="200" height="60"/>
    <text class="lbl" x="310" y="22" text-anchor="middle">Outcome reward</text>
    <text class="sm"  x="310" y="42" text-anchor="middle">sparse, trajectory-level</text>
    <line class="arrow" x1="410" y1="30" x2="460" y2="30"/>
    <rect class="pill" x="460" y="0" width="200" height="60"/>
    <text class="lbl" x="560" y="22" text-anchor="middle">AEM modulator</text>
    <text class="sm"  x="560" y="42" text-anchor="middle">advantage × surprisal</text>
    <line class="arrow" x1="660" y1="30" x2="710" y2="30"/>
    <rect class="box" x="710" y="0" width="170" height="60"/>
    <text class="lbl" x="795" y="22" text-anchor="middle">Policy update</text>
    <text class="sm"  x="795" y="42" text-anchor="middle">response-level entropy</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="210" height="80"/>
    <text class="lbl" x="105" y="28" text-anchor="middle">Token entropy</text>
    <text class="sm"  x="105" y="50" text-anchor="middle">prior work, too granular</text>
    <rect class="pill" x="230" y="0" width="210" height="80"/>
    <text class="lbl" x="335" y="28" text-anchor="middle">Response entropy</text>
    <text class="sm"  x="335" y="50" text-anchor="middle">matches agent action unit</text>
    <rect class="box" x="460" y="0" width="200" height="80"/>
    <text class="lbl" x="560" y="28" text-anchor="middle">Pos/neg sample mix</text>
    <text class="sm"  x="560" y="50" text-anchor="middle">drives explore → exploit</text>
    <rect class="box" x="680" y="0" width="180" height="80"/>
    <text class="lbl" x="770" y="28" text-anchor="middle">1.5B → 32B</text>
    <text class="sm"  x="770" y="50" text-anchor="middle">consistent gains</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Benchmarks</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">ALFWorld · WebShop · SWE-bench-Verified</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">multi-turn agentic environments</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">outcome-only rewards</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">SWE-bench-Verified</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">+1.4% over SOTA RL framework</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">no process rewards needed</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">supervision-free credit assignment</text>
  </g>
</svg>
```
