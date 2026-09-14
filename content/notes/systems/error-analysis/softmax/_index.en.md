---
date: '2026-08-04T00:10:00+09:00'
draft: false
title: 'Softmax Numerical Error Atlas'
summary: "Follow the computation. Find the derivations, experiments, and research notes."
description: "A computation-stage map of finite-precision error in Softmax: input representation, shifting, exp, reduction, division, downstream consumers, and online tiled evaluation, each linked to its derivations, experiments, and research notes."
tags: ["Error Analysis", "Numerical Analysis", "Softmax", "Floating Point"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "topic-index"
weight: 2
layout: "softmax-atlas"
disableAnchoredHeadings: true
---

<section class="softmax-formula-hero" aria-labelledby="softmax-formula-title">
  <p class="softmax-kicker" id="softmax-formula-title">Finite-precision error atlas</p>
  <div class="softmax-formula"><div class="atlas-main-equation">\(\displaystyle\operatorname{softmax}(x)_i=\frac{\exp(x_i-m)}{\sum_j\exp(x_j-m)}\)</div><div class="atlas-shift-equation">\(\displaystyle m=\max_j x_j\)</div></div>
  <nav class="atlas-foundations" aria-label="Foundations"><span>Foundations</span><a href="/en/notes/systems/error-analysis/softmax/directional-error/">Directional error</a><span aria-hidden="true">·</span><a href="/en/notes/systems/error-analysis/softmax/geometry-spectrum/">Softmax geometry</a></nav>
</section>

<nav class="atlas-navigation" aria-label="Computation-stage navigation">
  <div class="atlas-navigation-top"><span>COMPUTATION MAP</span><div><a href="#materialized">Standard evaluation <span aria-hidden="true">↓</span></a><a href="#online-softmax">Online evaluation <span aria-hidden="true">↓</span></a></div></div>
  <ol class="atlas-chain">
    <li><a href="#input"><span>01</span>input</a></li>
    <li><a href="#shift"><span>02</span>max / shift</a></li>
    <li><a href="#exp"><span>03</span>exp</a></li>
    <li><a href="#reduction"><span>04</span>reduction</a></li>
    <li><a href="#division"><span>05</span>division</a></li>
    <li><a href="#consumer"><span>06</span>consumer</a></li>
  </ol>
</nav>

<section class="atlas-track" aria-labelledby="materialized">
  <header class="atlas-track-heading"><span class="atlas-track-letter" aria-hidden="true">A</span><div><h2 id="materialized">Standard evaluation <span>Standard Softmax</span></h2><p>Follow the values from input representation through normalization and downstream use.</p></div><a class="atlas-back" href="#top" aria-label="Back to overview">↑</a></header>
<div class="atlas-stages">
  <article class="atlas-stage" id="input">
    <div class="atlas-stage-meta"><span class="atlas-number">01</span><span class="atlas-stage-code">INPUT</span><div class="atlas-stage-formula">\(\hat{x}=\mathrm{round}(x)\)</div></div>
    <div class="atlas-stage-body"><h3>Input representation</h3><p class="atlas-question">How much input contrast survives before Softmax begins?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/input-and-shift" fallback="/en/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/#5-a-stable-formula-is-not-a-time-machine" fallbackTitle="Stable evaluation · input quantization" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="shift">
    <div class="atlas-stage-meta"><span class="atlas-number">02</span><span class="atlas-stage-code">MAX / SHIFT</span><div class="atlas-stage-formula">\(s_i=\mathrm{fl}(\hat{x}_i-m)\)</div></div>
    <div class="atlas-stage-body"><h3>Maximum and shifting</h3><p class="atlas-question">What does subtract-max fix, and which errors remain?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/input-and-shift" fragment="#6-what-the-shift-itself-costs" label="Input representation and shifting · §6 what the shift itself costs" fallback="/en/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/" fallbackTitle="Stable evaluation · subtract-max and its limits" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="exp">
    <div class="atlas-stage-meta"><span class="atlas-number">03</span><span class="atlas-stage-code">EXP</span><div class="atlas-stage-formula">\(\hat{q}_i=\exp_{\mathrm{impl}}(s_i)\)</div></div>
    <div class="atlas-stage-body"><h3>Exponentiation</h3><p class="atlas-question">Which exponential errors cancel during normalization, and which propagate?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/exponentiation" fallback="/en/notes/systems/error-analysis/softmax/error-budget/#1-how-exp-error-enters-the-normalizer" fallbackTitle="Floating-point budget · exp and common error modes" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="reduction">
    <div class="atlas-stage-meta"><span class="atlas-number">04</span><span class="atlas-stage-code">REDUCTION</span><div class="atlas-stage-formula">\(\hat{\ell}=\mathrm{reduce}_G(\hat{q})\)</div></div>
    <div class="atlas-stage-body"><h3>Denominator reduction</h3><p class="atlas-question">Why can changing the reduction tree change the sum of the same values?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/denominator-reduction" fallback="/en/notes/systems/error-analysis/softmax/summation-stagnation/" fallbackTitle="Summation stagnation: when small terms stop changing the sum" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md"><span class="atlas-kind">Research notes</span><span class="atlas-reading-title">Reduction-tree predictor · theory and milestones</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/results/wide_range_offline_tree_reuse_v1/README.md"><span class="atlas-kind">Experiment review</span><span class="atlas-reading-title">Offline tree reuse · the failed deployment gate</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="division">
    <div class="atlas-stage-meta"><span class="atlas-number">05</span><span class="atlas-stage-code">DIVISION</span><div class="atlas-stage-formula">\(\hat{p}_i=\mathrm{fl}(\hat{q}_i/\hat{\ell})\)</div></div>
    <div class="atlas-stage-body"><h3>Normalization and division</h3><p class="atlas-question">How do shared denominator error and local division rounding combine?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/normalization-division" fallback="/en/notes/systems/error-analysis/softmax/error-budget/#4-every-division-has-its-own-rounding" fallbackTitle="Floating-point budget · division and the probability sum" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="consumer">
    <div class="atlas-stage-meta"><span class="atlas-number">06</span><span class="atlas-stage-code">CONSUMER</span><div class="atlas-stage-formula">\(\hat{p}\to\mathrm{loss}\,/\,PV\)</div></div>
    <div class="atlas-stage-body"><h3>Downstream consumers</h3><p class="atlas-question">Does a probability difference still matter after consumption and storage?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/downstream-output" fallback="/en/notes/systems/error-analysis/softmax/consumer-mitigation/" fallbackTitle="From error assessment to consumer-specific mitigation" >}}
</ul>
    </div>
  </article>
</div>
</section>

<section class="atlas-track atlas-track-online" aria-labelledby="online-softmax">
  <header class="atlas-track-heading"><span class="atlas-track-letter" aria-hidden="true">B</span><div><h2 id="online-softmax">Online evaluation <span>Online / Tiled Softmax</span></h2><p>Track the normalizer through block states, rescaling, and merges.</p></div><a class="atlas-back" href="#top" aria-label="Back to overview">↑</a></header>
  <div class="atlas-online-summary"><div>\((m_A,\ell_A)\oplus(m_B,\ell_B)\longrightarrow(m,\ell)\)</div><p>The normalizer state is (m, ℓ). Fused attention additionally carries a weighted numerator o and produces y = o / ℓ.</p></div>
<div class="atlas-stages">
  <article class="atlas-stage" id="block-state">
    <div class="atlas-stage-meta"><span class="atlas-number">01</span><span class="atlas-stage-code">BLOCK STATE</span><div class="atlas-stage-formula">\(S_B=(m_B,\ell_B)\)</div></div>
    <div class="atlas-stage-body"><h3>Block state</h3><p class="atlas-question">What must each block retain to recover the global normalizer?</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/online-block-state" fallback="/en/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/" fallbackTitle="Online Softmax · recurrence and block merging" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="merge">
    <div class="atlas-stage-meta"><span class="atlas-number">02</span><span class="atlas-stage-code">RESCALE / MERGE</span><div class="atlas-stage-formula">\(S_A\oplus S_B\to S\)</div></div>
    <div class="atlas-stage-body"><h3>Rescaling and merging</h3><p class="atlas-question">When the maximum changes, how is the old partial sum rescaled and rounded?</p>
<ul class="atlas-readings">
  {{< atlas-pending title="Stage article not yet written; existing research material below" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_normalizer_contract.md"><span class="atlas-kind">Research notes</span><span class="atlas-reading-title">Online normalizer · arithmetic contract and error decomposition</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="schedule">
    <div class="atlas-stage-meta"><span class="atlas-number">03</span><span class="atlas-stage-code">SCHEDULE</span><div class="atlas-stage-formula">\(G:\ S_1,\ldots,S_B\to S\)</div></div>
    <div class="atlas-stage-body"><h3>Merge topology</h3><p class="atlas-question">How do block size, chains, and balanced trees change the rounding path?</p>
<ul class="atlas-readings">
  {{< atlas-pending title="Stage article not yet written; existing research material below" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/README.md"><span class="atlas-kind">Experiment index</span><span class="atlas-reading-title">Online experiments · schedules and controlled comparisons</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="output">
    <div class="atlas-stage-meta"><span class="atlas-number">04</span><span class="atlas-stage-code">OUTPUT</span><div class="atlas-stage-formula">\(\hat{y}=\mathrm{fl}(\hat{o}/\hat{\ell})\)</div></div>
    <div class="atlas-stage-body"><h3>Output and storage <span class="atlas-extension">Attention extension</span></h3><p class="atlas-question">Does a better denominator survive weighted accumulation, division, and storage?</p>
<ul class="atlas-readings">
  {{< atlas-pending title="Online stage article not yet written; existing research material below" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_scalar_output_v1.md"><span class="atlas-kind">Experiment review</span><span class="atlas-reading-title">Scalar-output diagnostics · from normalizer to consumer</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
</div>
</section>

<footer class="softmax-source-footer"><div><strong>Error Atlas</strong><p>Research notes, reproducible experiments, and development history. Repository links point to the fixed 17ffd2a snapshot.</p></div><a href="https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax">Explore the repository <span aria-hidden="true">↗</span></a></footer>
