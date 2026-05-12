---
slug: biotool
issue: 3
date: 2026-05-07
title: "BioTool: 7,040 verified tool calls turn a 4B model into a better biomedical agent than GPT-5.1"
thesis: "The bottleneck for biomedical LLM agents isn't capacity — it's a clean, human-verified dataset of real API calls against NCBI, Ensembl and UniProt. Curate that, fine-tune, and a small open model out-dispatches a frontier closed one. The lift carries into expert-rated downstream answers."
lab: MBZUAI
lab_url: https://mbzuai.ac.ae/
paper_url: https://arxiv.org/abs/2605.05758
paper_id: arXiv 2605.05758
authors_html: 'Gao · Zhang · Du · Qin · <a href="https://pengtaoxie.github.io/" target="_blank" rel="noopener">Xie</a>'
tags: [agents, tool-use, science]
caption: "The harness is unchanged from any tool-use agent. Only the SFT data is new — and verified call-by-call against live APIs."
links:
  - {label: paper,             url: https://arxiv.org/abs/2605.05758}
  - {label: code,              url: https://github.com/gxx27/BioTool}
  - {label: dataset,           url: https://huggingface.co/datasets/gxx27/BioTool}
  - {label: "lab: MBZUAI",     url: https://mbzuai.ac.ae/}
  - {label: "PI: Pengtao Xie", url: https://pengtaoxie.github.io/}
  - {label: "related: ToolLLM",url: https://arxiv.org/abs/2307.16789}
  - {label: "related: Gorilla",url: https://arxiv.org/abs/2305.15334}
---

## Training recipe
- **Base:** 4B open model, no biomedical pretraining.
- **Data:** 7,040 (query → API call) pairs, each verified against the live API.
- **Tools:** 34, picked by real usage frequency at NCBI / Ensembl / UniProt.
- **Loss:** plain SFT on tool name + typed JSON args. No RL, no rejection sampling.
- **Eval:** held-out call accuracy + blind expert ratings of downstream answers.

## Key learnings
- **Data > scale.** A verified 7k-pair set beats raw frontier capacity on schema-heavy domains.
- **Verification is the moat.** "Call returns the answer the query asked for" — not just syntactic validity — is what generic tool-use SFT misses.
- **Coverage prevents collapse.** Five balanced surfaces stops the model from over-specialising on gene lookups while staying terrible at proteomics.
- **Small dispatcher + big synthesiser** is a cheaper, more reliable stack than one frontier model doing both.

## Use when
- Building a **biomedical agent** that hallucinates on database-grounded questions.
- You want a **small dispatcher** in front of a larger synthesiser.
- You need a **published, verified** tool-call set to blend into your tool-use SFT mix.

## Diagram
```svg
<svg viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="BioTool pipeline">
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
    <text class="tag" y="-14">PIPELINE — query → dispatcher → live API → grounded answer</text>
    <rect class="box" x="0"    y="0" width="180" height="80" rx="2"/>
    <text class="lbl" x="90"  y="28" text-anchor="middle">User query</text>
    <text class="sm"  x="90"  y="50" text-anchor="middle">"variants of BRCA1</text>
    <text class="sm"  x="90"  y="66" text-anchor="middle">in hereditary cancer?"</text>
    <path class="arrow" d="M185 40 L235 40"/>
    <rect class="pill" x="240" y="0" width="220" height="80" rx="2"/>
    <text class="lbl" x="350" y="28" text-anchor="middle">4B model · BioTool SFT</text>
    <text class="sm"  x="350" y="50" text-anchor="middle">picks tool ∈ 34</text>
    <text class="sm"  x="350" y="66" text-anchor="middle">fills typed JSON args</text>
    <path class="arrow" d="M465 40 L515 40"/>
    <rect class="box" x="520" y="0" width="180" height="80" rx="2"/>
    <text class="lbl" x="610" y="28" text-anchor="middle">Live biomedical API</text>
    <text class="sm"  x="610" y="50" text-anchor="middle">NCBI · Ensembl</text>
    <text class="sm"  x="610" y="66" text-anchor="middle">UniProt · PubMed</text>
    <path class="arrow" d="M705 40 L755 40"/>
    <rect class="box" x="760" y="0" width="120" height="80" rx="2"/>
    <text class="lbl" x="820" y="34" text-anchor="middle">Grounded</text>
    <text class="lbl" x="820" y="52" text-anchor="middle">answer</text>
  </g>

  <g transform="translate(20,180)">
    <text class="tag" y="-14">COVERAGE — 34 tools · 7,040 human-verified pairs · 5 biomedical surfaces</text>
    <rect class="box" x="0"   y="0" width="166" height="58" rx="2"/>
    <text class="lbl" x="83"  y="24" text-anchor="middle">variation</text>
    <text class="sm"  x="83"  y="44" text-anchor="middle">ClinVar · dbSNP</text>
    <rect class="box" x="180" y="0" width="166" height="58" rx="2"/>
    <text class="lbl" x="263" y="24" text-anchor="middle">genomics</text>
    <text class="sm"  x="263" y="44" text-anchor="middle">Gene · Ensembl</text>
    <rect class="box" x="360" y="0" width="166" height="58" rx="2"/>
    <text class="lbl" x="443" y="24" text-anchor="middle">proteomics</text>
    <text class="sm"  x="443" y="44" text-anchor="middle">UniProt</text>
    <rect class="box" x="540" y="0" width="166" height="58" rx="2"/>
    <text class="lbl" x="623" y="24" text-anchor="middle">evolution</text>
    <text class="sm"  x="623" y="44" text-anchor="middle">HomoloGene · Taxonomy</text>
    <rect class="box" x="720" y="0" width="160" height="58" rx="2"/>
    <text class="lbl" x="800" y="24" text-anchor="middle">general bio</text>
    <text class="sm"  x="800" y="44" text-anchor="middle">PubMed · MeSH</text>
  </g>

  <g transform="translate(20,300)">
    <text class="tag" y="-14">EVALUATION — two separate tests, same conclusion</text>
    <rect class="box" x="0" y="0" width="420" height="120" rx="2"/>
    <text class="lbl" x="20" y="26">① Tool-call accuracy</text>
    <text class="sm"  x="20" y="50">held-out (query → API call) pairs</text>
    <text class="sm"  x="20" y="68">scored against human-verified ground truth</text>
    <text class="sm"  x="20" y="92" fill="#c2410c">→ 4B + BioTool SFT &gt; GPT-5.1 zero-shot</text>
    <text class="sm"  x="20" y="108" fill="#c2410c">→ 4B base model alone: well below both</text>
    <rect class="box" x="440" y="0" width="440" height="120" rx="2"/>
    <text class="lbl" x="460" y="26">② Downstream answer quality</text>
    <text class="sm"  x="460" y="50">same base LLM, with/without BioTool caller</text>
    <text class="sm"  x="460" y="68">rated blind by biomedical domain experts</text>
    <text class="sm"  x="460" y="92" fill="#c2410c">→ BioTool variant preferred by clear margin</text>
    <text class="sm"  x="460" y="108" fill="#c2410c">→ gap = "found a real DB hit", not fluency</text>
  </g>
</svg>
```
