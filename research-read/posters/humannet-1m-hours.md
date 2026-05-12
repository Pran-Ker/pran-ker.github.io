---
slug: humannet-1m-hours
issue: 0
date: 2026-05-07
title: "HumanNet: 1,000 hours of egocentric human video beats 100 hours of real-robot data for VLA training"
thesis: "Embodied AI is bottlenecked by robot data. HumanNet scales human-centric video to one million hours — first- and third-person, fine-grained activities and tool use, with captions and hand/body signals. In a controlled ablation, 1,000 hours of egocentric HumanNet beat 100 hours of real-robot data (Magic Cobot) for training a Qwen-VLM vision-language-action model."
lab: "World Labs"
lab_url: "https://worldlabs.ai/"
paper_url: "https://arxiv.org/abs/2605.06747"
paper_id: "arXiv 2605.06747"
authors_html: "Deng · <a href='https://daquanzhou.github.io/'>Zhou</a>"
tags: [robotics, multimodal, pretraining]
caption: "A million hours of human video, captioned and motion-tagged — egocentric pretraining as a robot-data substitute."
links:
  - {label: paper, url: "https://arxiv.org/abs/2605.06747"}
  - {label: "related: Ego4D", url: "https://arxiv.org/abs/2110.07058"}
---

## Training recipe
- **Base:** Qwen VLM, continued training on egocentric video samples from HumanNet.
- **Data:** 1M hours human-centric video; first- and third-person; activities, human-object interaction, tool use, long-horizon behavior; captions + motion + hand/body signals.
- **Compute:** not reported.
- **Loss / algo:** standard VLM continued pretraining (specifics not enumerated in abstract).
- **Schedule / hparams:** not reported.
- **Eval:** controlled VLA ablation — 1,000h egocentric HumanNet vs 100h real-robot data (Magic Cobot) under matched conditions.

## Key learnings
- **Egocentric > robot at scale.** 10× more human video outperforms scarce robot data on the same VLA validation.
- **Million-hour scale.** Largest reported human-centric video corpus for embodied learning.
- **Annotations matter.** Captions, motion descriptions, and hand/body signals enable supervised VLA losses.
- **Bridges 1st/3rd person.** Both perspectives included to teach viewpoint-invariant action understanding.
- **Substitution claim.** Authors argue human video is a scalable, cost-effective substitute for robot data.

## Use when
- **Pretraining a VLA** model and you cannot collect millions of teleop hours.
- **Studying viewpoint transfer** — first-person vs third-person grounding of the same actions.
- **Designing curricula** mixing scarce robot data with abundant human video at a measured ratio.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="HumanNet pipeline">
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
    <rect class="box" x="0" y="0" width="180" height="60"/>
    <text class="lbl" x="90" y="28" text-anchor="middle">Web human video</text>
    <text class="sm"  x="90" y="46" text-anchor="middle">1st + 3rd person</text>
    <line class="arrow" x1="180" y1="30" x2="230" y2="30"/>
    <rect class="pill" x="230" y="0" width="200" height="60"/>
    <text class="lbl" x="330" y="22" text-anchor="middle">Annotation pipeline</text>
    <text class="sm"  x="330" y="42" text-anchor="middle">caption · motion · hands</text>
    <line class="arrow" x1="430" y1="30" x2="480" y2="30"/>
    <rect class="box" x="480" y="0" width="180" height="60"/>
    <text class="lbl" x="570" y="22" text-anchor="middle">HumanNet 1M h</text>
    <text class="sm"  x="570" y="42" text-anchor="middle">curated corpus</text>
    <line class="arrow" x1="660" y1="30" x2="710" y2="30"/>
    <rect class="box" x="710" y="0" width="170" height="60"/>
    <text class="lbl" x="795" y="22" text-anchor="middle">VLA training</text>
    <text class="sm"  x="795" y="42" text-anchor="middle">Qwen VLM cont'd</text>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-8">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="210" height="80"/>
    <text class="lbl" x="105" y="28" text-anchor="middle">Activities</text>
    <text class="sm"  x="105" y="50" text-anchor="middle">fine-grained, long-horizon</text>
    <rect class="box" x="230" y="0" width="210" height="80"/>
    <text class="lbl" x="335" y="28" text-anchor="middle">Object / tool use</text>
    <text class="sm"  x="335" y="50" text-anchor="middle">manipulation grounding</text>
    <rect class="pill" x="460" y="0" width="210" height="80"/>
    <text class="lbl" x="565" y="28" text-anchor="middle">Hand + body signals</text>
    <text class="sm"  x="565" y="50" text-anchor="middle">action supervision</text>
    <rect class="box" x="690" y="0" width="170" height="80"/>
    <text class="lbl" x="775" y="28" text-anchor="middle">Captions</text>
    <text class="sm"  x="775" y="50" text-anchor="middle">VLM alignment</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-8">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/>
    <text class="lbl" x="210" y="30" text-anchor="middle">Ablation setup</text>
    <text class="sm"  x="210" y="58" text-anchor="middle">1,000 h egocentric HumanNet</text>
    <text class="sm"  x="210" y="78" text-anchor="middle">vs 100 h real-robot (Magic Cobot)</text>
    <text class="sm"  x="210" y="98" text-anchor="middle">matched VLA validation</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/>
    <text class="lbl" x="650" y="30" text-anchor="middle">Result</text>
    <text class="sm"  x="650" y="58" text-anchor="middle">human video wins under matched setup</text>
    <text class="sm"  x="650" y="78" text-anchor="middle">scaling laws favor cheap pretrain data</text>
    <text class="sm"  x="650" y="98" text-anchor="middle">robot data still needed for fine-tune</text>
  </g>
</svg>
```
