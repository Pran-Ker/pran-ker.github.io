---
slug: autotts-discovery
issue: 0
date: 2026-05-08
title: "AutoTTS: agentic search discovers new test-time scaling strategies for $39.9 and 160 GPU-minutes"
thesis: "Test-time scaling is usually hand-crafted heuristics (CoT, best-of-N, MCTS). AutoTTS frames it as a controller-synthesis problem over pre-collected reasoning trajectories — an agent decides whether to branch, continue, probe, prune or stop. For $39.9 and 160 minutes of compute it discovers strategies that beat strong manual baselines on math benchmarks and transfer to held-out tasks and model scales."
lab: "Anthropic"
lab_url: "https://www.anthropic.com/research"
paper_url: "https://arxiv.org/abs/2605.08083"
paper_id: "arXiv 2605.08083"
authors_html: "Zheng · Liu · Huang · Bao · Zhang · Liu · Dai · Chen · Liu · Xiong · Wu · Zhang · Huang"
tags: [agents, reasoning, evaluation]
caption: "Let an LLM search the space of TTS controllers — 160 minutes of compute, generalizes off-distribution."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.08083"}
  - {label: "related: Self-Consistency", url: "https://arxiv.org/abs/2203.11171"}
  - {label: "related: Tree-of-Thought", url: "https://arxiv.org/abs/2305.10601"}
---

## Training recipe
- **Base:** target reasoning LLMs at multiple scales (held-out scales for transfer).
- **Data:** pre-collected reasoning trajectories with probe signals used as the search environment.
- **Compute:** $39.9 and 160 GPU-minutes total to discover strategies.
- **Loss / algo:** controller synthesis with beta-parameterized actions {branch, continue, probe, prune, stop}; fine-grained trace feedback.
- **Schedule / hparams:** not reported in detail.
- **Eval:** mathematical reasoning benchmarks; comparison to strong manually designed TTS baselines; held-out benchmarks and model scales.

## Key learnings
- **TTS is searchable.** Decomposing TTS into 5 atomic actions makes the space tractable for an LLM agent.
- **$39.9 / 160 minutes** is enough to beat strong handcrafted baselines on accuracy–cost tradeoff.
- **Strategies transfer.** Discovered controllers generalize across held-out benchmarks and unseen model scales.
- **Fine-grained traces help.** Execution-level feedback signals beat coarse outcome-only signals.
- **Beta parameterization** stabilizes the controller-synthesis loop.

## Use when
- **Designing TTS** for a new domain — skip months of hand-tuning best-of-N / verifiers.
- **You have rollouts** with probe signals already; AutoTTS turns them into a usable controller.
- **Cost-controlled inference** where accuracy-per-dollar matters more than peak accuracy.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="AutoTTS controller discovery">
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
    <rect class="box" x="0" y="0" width="170" height="60"/>
    <text class="lbl" x="85" y="28" text-anchor="middle">Trajectory pool</text>
    <text class="sm"  x="85" y="46" text-anchor="middle">+ probe signals</text>
    <line class="arrow" x1="170" y1="30" x2="220" y2="30"/>
    <rect class="pill" x="220" y="0" width="200" height="60"/>
    <text class="lbl" x="320" y="22" text-anchor="middle">LLM controller</text>
    <text class="sm"  x="320" y="42" text-anchor="middle">branch / continue / probe</text>
    <line class="arrow" x1="420" y1="30" x2="470" y2="30"/>
    <rect class="box" x="470" y="0" width="190" height="60"/>
    <text class="lbl" x="565" y="22" text-anchor="middle">Search loop</text>
    <text class="sm"  x="565" y="42" text-anchor="middle">trace-level feedback</text>
    <line class="arrow" x1="660" y1="30" x2="710" y2="30"/>
    <rect class="box" x="710" y="0" width="170" height="60"/>
    <text class="lbl" x="795" y="22" text-anchor="middle">TTS policy</text>
    <text class="sm"  x="795" y="42" text-anchor="middle">deployed at test time</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="160" height="80"/>
    <text class="lbl" x="80" y="28" text-anchor="middle">Branch</text>
    <text class="sm"  x="80" y="50" text-anchor="middle">fork solution</text>
    <rect class="box" x="175" y="0" width="160" height="80"/>
    <text class="lbl" x="255" y="28" text-anchor="middle">Continue</text>
    <text class="sm"  x="255" y="50" text-anchor="middle">extend</text>
    <rect class="pill" x="350" y="0" width="160" height="80"/>
    <text class="lbl" x="430" y="28" text-anchor="middle">Probe</text>
    <text class="sm"  x="430" y="50" text-anchor="middle">verify partial</text>
    <rect class="box" x="525" y="0" width="160" height="80"/>
    <text class="lbl" x="605" y="28" text-anchor="middle">Prune</text>
    <text class="sm"  x="605" y="50" text-anchor="middle">drop weak path</text>
    <rect class="box" x="700" y="0" width="160" height="80"/>
    <text class="lbl" x="780" y="28" text-anchor="middle">Stop</text>
    <text class="sm"  x="780" y="50" text-anchor="middle">commit answer</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Discovery cost</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">$39.9 total compute</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">160 minutes wall-clock</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">one-shot search</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Generalization</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">beats manual TTS on math</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">transfers to held-out benchmarks</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">transfers to unseen model scales</text>
  </g>
</svg>
```
