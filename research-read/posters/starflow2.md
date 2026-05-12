---
slug: starflow2
issue: 0
date: 2026-05-08
title: "STARFlow2: KV-cached normalizing flows fuse with an LLM for unified text+image generation"
thesis: "STARFlow2 vertically interleaves a pretrained vision-language model with a TarFlow autoregressive normalizing-flow stream under a shared causal mask, so image tokens flow through the same KV cache as text. The result is a single model that understands and generates interleaved text and images without re-encoding."
lab: "Apple Intelligence"
lab_url: "https://machinelearning.apple.com/"
paper_url: "http://arxiv.org/abs/2605.08029v1"
paper_id: "arXiv 2605.08029"
authors_html: "Shen · Chen · Gao · Zhang · Wang · Bautista · Zhai · Susskind · <a href='https://jiataogu.me/'>Gu</a>"
tags: [multimodal, pretraining]
caption: "Pretzel architecture: VLM + TarFlow share the causal mask; FAE latents reuse the KV cache."
links:
  - {label: paper, url: "http://arxiv.org/abs/2605.08029v1"}
  - {label: "lab: Apple Intelligence", url: "https://machinelearning.apple.com/"}
  - {label: "PI: Jiatao Gu", url: "https://jiataogu.me/"}
  - {label: "related: STARFlow", url: "https://arxiv.org/abs/2506.05236"}
  - {label: "related: TarFlow", url: "https://arxiv.org/abs/2412.06329"}
---

## Training recipe
- **Base:** pretrained vision-language model + TarFlow normalizing-flow stream (Pretzel architecture).
- **Data:** interleaved text-image sequences; unified FAE latent space.
- **Compute:** not reported.
- **Loss / algo:** AR language modeling + AR normalizing-flow likelihood under a shared causal mask.
- **Eval:** image-generation and multimodal-understanding benchmarks.

## Key learnings
- **AR flows are AR Transformers.** Same causal mask and KV cache, so flows slot into LLM serving stacks.
- **Deep-shallow design.** A deep VLM stream paired with a shallow flow stream gives most of the quality at a fraction of the flow compute.
- **Cache-friendly interleaving.** Text and visual outputs enter the KV cache directly — no re-encoding between modalities.

## Use when
- You want one model for interleaved text+image gen and understanding, served on standard KV-cache infra rather than a separate diffusion U-Net.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="STARFlow2">
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
    <rect class="box" x="0" y="0" width="160" height="60"/><text class="lbl" x="14" y="28">Text+image tokens</text><text class="sm" x="14" y="48">FAE latent</text>
    <rect class="box" x="200" y="0" width="160" height="60"/><text class="lbl" x="220" y="28">VLM stream</text><text class="sm" x="220" y="48">pretrained</text>
    <rect class="pill" x="400" y="0" width="160" height="60"/><text class="lbl" x="420" y="28">TarFlow stream</text><text class="sm" x="420" y="48">shared mask</text>
    <rect class="box" x="600" y="0" width="160" height="60"/><text class="lbl" x="620" y="28">Shared KV cache</text><text class="sm" x="620" y="48">no re-encode</text>
    <rect class="box" x="780" y="0" width="80" height="60"/><text class="lbl" x="792" y="28">Output</text><text class="sm" x="792" y="48">txt+img</text>
    <path class="arrow" d="M160 30 L200 30"/><path class="arrow" d="M360 30 L400 30"/><path class="arrow" d="M560 30 L600 30"/><path class="arrow" d="M760 30 L780 30"/>
  </g>
  <g transform="translate(20,180)">
    <text class="tag" x="0" y="-10">STRUCTURE</text>
    <rect class="box" x="0" y="0" width="200" height="80"/><text class="lbl" x="14" y="28">Deep VLM</text><text class="sm" x="14" y="50">pretrained LM weights</text><text class="sm" x="14" y="68">handles understanding</text>
    <rect class="pill" x="220" y="0" width="200" height="80"/><text class="lbl" x="234" y="28">Shallow flow</text><text class="sm" x="234" y="50">residual skip in</text><text class="sm" x="234" y="68">handles image gen</text>
    <rect class="box" x="440" y="0" width="200" height="80"/><text class="lbl" x="454" y="28">FAE latent</text><text class="sm" x="454" y="50">unified text+image</text><text class="sm" x="454" y="68">tokenization</text>
    <rect class="box" x="660" y="0" width="200" height="80"/><text class="lbl" x="674" y="28">Causal mask</text><text class="sm" x="674" y="50">same as decoder LM</text><text class="sm" x="674" y="68">KV-cache reused</text>
  </g>
  <g transform="translate(20,300)">
    <text class="tag" x="0" y="-10">EVALUATION</text>
    <rect class="box" x="0" y="0" width="420" height="120"/><text class="lbl" x="14" y="28">Tested on</text><text class="sm" x="14" y="52">• image-generation benchmarks</text><text class="sm" x="14" y="72">• multimodal understanding suites</text><text class="sm" x="14" y="92">• interleaved gen settings</text><text class="sm" x="14" y="112">• 19-page paper, 9 figures</text>
    <rect class="pill" x="440" y="0" width="420" height="120"/><text class="lbl" x="454" y="28">What won</text><text class="sm" x="454" y="52">• strong perf on image gen + understanding</text><text class="sm" x="454" y="72">• KV-cache reuse across modalities</text><text class="sm" x="454" y="92">• AR-flow viable for unified multimodal LMs</text><text class="sm" x="454" y="112">• exact numbers: not reported in abstract</text>
  </g>
</svg>
```
