---
slug: fast-blt
issue: 0
date: 2026-05-08
title: "Fast BLT: byte-level LMs cut memory-bandwidth cost >50% via diffusion + self-speculation"
thesis: "Byte-level LMs avoid tokenizer baggage but generate one byte at a time. Fast BLT adds a block-wise diffusion head and a self-speculation decoder so a byte model drafts many bytes per forward pass — estimated memory-bandwidth cost drops by more than half versus standard BLT."
lab: "Meta Superintelligence Labs"
lab_url: "https://ai.meta.com/research/"
paper_url: "http://arxiv.org/abs/2605.08044v1"
paper_id: "arXiv 2605.08044"
authors_html: "Kallini · Pagnoni · Limisiewicz · Ghosh · Potts · Han · <a href='https://homes.cs.washington.edu/~lsz/'>Zettlemoyer</a> · Iyer"
tags: [efficiency, pretraining]
caption: "Three decoders on top of BLT: diffusion, self-speculation, and a verified hybrid."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.08044v1"}
  - {label: "lab: Meta Superintelligence Labs", url: "https://ai.meta.com/research/"}
  - {label: "PI: Luke Zettlemoyer", url: "https://homes.cs.washington.edu/~lsz/"}
  - {label: "related: BLT", url: "https://arxiv.org/abs/2412.09871"}
  - {label: "related: Speculative decoding", url: "https://arxiv.org/abs/2211.17192"}
---

## Training recipe
- **Base:** Byte Latent Transformer (BLT).
- **Data:** byte-level pretraining corpus (inherited from BLT).
- **Compute:** not reported.
- **Loss / algo:** next-byte AR + block-wise diffusion (BLT-D); self-speculation drafting (BLT-S); diffusion + AR verifier (BLT-DV).
- **Eval:** generation throughput / memory-bandwidth cost vs. BLT.

## Key learnings
- **Block-diffuse, then verify.** BLT-DV pairs parallel diffusion drafts with an AR verifier — quality of AR, speed of diffusion.
- **Local decoder doubles as drafter.** BLT-S extends BLT's local decoder past its window to draft bytes, then a single full-model pass verifies.
- **>50% lower memory-bandwidth.** All three variants beat BLT on the metric that actually bottlenecks byte-level decoding.

## Use when
- You want to ship a tokenizer-free LM (multilingual, code, robust to noise) but byte-by-byte decoding latency has been a non-starter.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="Fast BLT">
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
    <rect class="box" x="0" y="0" width="140" height="60"/><text class="lbl" x="14" y="28">Byte stream</text><text class="sm" x="14" y="48">no tokenizer</text>
    <rect class="box" x="170" y="0" width="160" height="60"/><text class="lbl" x="184" y="28">BLT encoder</text><text class="sm" x="184" y="48">local + global</text>
    <rect class="pill" x="360" y="0" width="200" height="60"/><text class="lbl" x="374" y="28">Parallel byte head</text><text class="sm" x="374" y="48">diffusion / speculate</text>
    <rect class="box" x="590" y="0" width="160" height="60"/><text class="lbl" x="604" y="28">AR verifier</text><text class="sm" x="604" y="48">1 pass / block</text>
    <rect class="box" x="780" y="0" width="100" height="60"/><text class="lbl" x="794" y="28">Bytes out</text>
    <path class="arrow" d="M140 30 L170 30"/><path class="arrow" d="M330 30 L360 30"/><path class="arrow" d="M560 30 L590 30"/><path class="arrow" d="M750 30 L780 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="pill" x="0" y="0" width="270" height="80"/><text class="lbl" x="14" y="28">BLT-D</text><text class="sm" x="14" y="50">block-wise byte diffusion</text><text class="sm" x="14" y="68">many bytes / step</text>
    <rect class="box" x="290" y="0" width="270" height="80"/><text class="lbl" x="304" y="28">BLT-S</text><text class="sm" x="304" y="50">local decoder drafts</text><text class="sm" x="304" y="68">global verifies</text>
    <rect class="pill" x="580" y="0" width="280" height="80"/><text class="lbl" x="594" y="28">BLT-DV</text><text class="sm" x="594" y="50">diffusion draft + AR verify</text><text class="sm" x="594" y="68">best quality / speed</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• generation tasks vs. BLT baseline</text><text class="sm" x="14" y="72">• memory-bandwidth cost (decoding bottleneck)</text><text class="sm" x="14" y="92">• quality preservation on language modeling</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• &gt;50% lower memory-bandwidth cost</text><text class="sm" x="454" y="72">• matches BLT quality with parallel decoding</text><text class="sm" x="454" y="92">• tokenizer-free LMs become serving-viable</text>
  </g>
</svg>
```
