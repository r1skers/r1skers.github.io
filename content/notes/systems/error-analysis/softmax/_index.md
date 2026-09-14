---
date: '2026-08-04T00:10:00+09:00'
draft: false
title: 'Softmax 数值误差地图'
summary: "沿计算过程，找到推导、实验与研究记录。"
description: "Softmax 有限精度误差的计算阶段地图：输入表示、平移、exp、求和归约、除法与下游使用，以及 online 分块求值，各阶段链接对应的推导、实验与研究记录。"
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
  <nav class="atlas-foundations" aria-label="基础阅读"><span>基础阅读</span><a href="/notes/systems/error-analysis/softmax/directional-error/">方向性误差</a><span aria-hidden="true">·</span><a href="/notes/systems/error-analysis/softmax/geometry-spectrum/">Softmax 几何</a></nav>
</section>

<nav class="atlas-navigation" aria-label="计算阶段导航">
  <div class="atlas-navigation-top"><span>计算阶段地图</span><div><a href="#materialized">常规求值 <span aria-hidden="true">↓</span></a><a href="#online-softmax">Online 求值 <span aria-hidden="true">↓</span></a></div></div>
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
  <header class="atlas-track-heading"><span class="atlas-track-letter" aria-hidden="true">A</span><div><h2 id="materialized">常规求值 <span>Standard Softmax</span></h2><p>从输入表示到归一化，按中间量的计算顺序展开。</p></div><a class="atlas-back" href="#top" aria-label="返回总览">↑</a></header>
<div class="atlas-stages">
  <article class="atlas-stage" id="input">
    <div class="atlas-stage-meta"><span class="atlas-number">01</span><span class="atlas-stage-code">INPUT</span><div class="atlas-stage-formula">\(\hat{x}=\mathrm{round}(x)\)</div></div>
    <div class="atlas-stage-body"><h3>输入表示</h3><p class="atlas-question">Softmax 开始计算之前，输入中的差异还剩下多少？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/input-and-shift" fallback="/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/#5-稳定公式不是时间机器" fallbackTitle="误差分析 · Softmax 3：数学等价为什么不等于数值稳定（§5 输入量化）" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="shift">
    <div class="atlas-stage-meta"><span class="atlas-number">02</span><span class="atlas-stage-code">MAX / SHIFT</span><div class="atlas-stage-formula">\(s_i=\mathrm{fl}(\hat{x}_i-m)\)</div></div>
    <div class="atlas-stage-body"><h3>最大值与平移</h3><p class="atlas-question">减去最大值解决了什么，又有哪些误差无法恢复？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/input-and-shift" fragment="#6-平移自己要花多少" label="输入表示与平移 · §6 平移自己要花多少" fallback="/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/" fallbackTitle="误差分析 · Softmax 3：数学等价为什么不等于数值稳定" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="exp">
    <div class="atlas-stage-meta"><span class="atlas-number">03</span><span class="atlas-stage-code">EXP</span><div class="atlas-stage-formula">\(\hat{q}_i=\exp_{\mathrm{impl}}(s_i)\)</div></div>
    <div class="atlas-stage-body"><h3>指数实现</h3><p class="atlas-question">指数误差中，哪些会被归一化消掉，哪些会继续传播？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/exponentiation" fallback="/notes/systems/error-analysis/softmax/error-budget/#1-exp-误差先怎样进入-normalizer" fallbackTitle="浮点误差预算 · exp 与共同误差模式" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="reduction">
    <div class="atlas-stage-meta"><span class="atlas-number">04</span><span class="atlas-stage-code">REDUCTION</span><div class="atlas-stage-formula">\(\hat{\ell}=\mathrm{reduce}_G(\hat{q})\)</div></div>
    <div class="atlas-stage-body"><h3>分母归约</h3><p class="atlas-question">同一组数，换一种求和顺序，结果为什么会改变？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/denominator-reduction" fallback="/notes/systems/error-analysis/softmax/summation-stagnation/" fallbackTitle="求和停滞：小量何时不再改变部分和" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/foundations.md"><span class="atlas-kind">研究记录</span><span class="atlas-reading-title">Reduction-tree predictor · 理论与里程碑</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/results/wide_range_offline_tree_reuse_v1/README.md"><span class="atlas-kind">实验复盘</span><span class="atlas-reading-title">Offline tree reuse · 未通过部署门槛的实验</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="division">
    <div class="atlas-stage-meta"><span class="atlas-number">05</span><span class="atlas-stage-code">DIVISION</span><div class="atlas-stage-formula">\(\hat{p}_i=\mathrm{fl}(\hat{q}_i/\hat{\ell})\)</div></div>
    <div class="atlas-stage-body"><h3>归一化与除法</h3><p class="atlas-question">分母的共同误差与每次除法的局部舍入怎样叠加？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/normalization-division" fallback="/notes/systems/error-analysis/softmax/error-budget/#4-每个除法还有自己的舍入" fallbackTitle="浮点误差预算 · 除法传播与概率和" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="consumer">
    <div class="atlas-stage-meta"><span class="atlas-number">06</span><span class="atlas-stage-code">CONSUMER</span><div class="atlas-stage-formula">\(\hat{p}\to\mathrm{loss}\,/\,PV\)</div></div>
    <div class="atlas-stage-body"><h3>下游使用者</h3><p class="atlas-question">概率上的差异，在实际使用和最终存储中还重要吗？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/downstream-output" fallback="/notes/systems/error-analysis/softmax/consumer-mitigation/" fallbackTitle="从误差判定到 consumer-specific mitigation" >}}
</ul>
    </div>
  </article>
</div>
</section>

<section class="atlas-track atlas-track-online" aria-labelledby="online-softmax">
  <header class="atlas-track-heading"><span class="atlas-track-letter" aria-hidden="true">B</span><div><h2 id="online-softmax">Online 求值 <span>Online / Tiled Softmax</span></h2><p>以块状态维护归一化因子，沿重标定和合并过程展开。</p></div><a class="atlas-back" href="#top" aria-label="返回总览">↑</a></header>
  <div class="atlas-online-summary"><div>\((m_A,\ell_A)\oplus(m_B,\ell_B)\longrightarrow(m,\ell)\)</div><p>归一化因子状态为 (m, ℓ)。融合 attention 时，额外维护加权分子 o，最终得到 y = o / ℓ。</p></div>
<div class="atlas-stages">
  <article class="atlas-stage" id="block-state">
    <div class="atlas-stage-meta"><span class="atlas-number">01</span><span class="atlas-stage-code">BLOCK STATE</span><div class="atlas-stage-formula">\(S_B=(m_B,\ell_B)\)</div></div>
    <div class="atlas-stage-body"><h3>块内状态</h3><p class="atlas-question">每个块保留什么，才能在后续恢复全局归一化因子？</p>
<ul class="atlas-readings">
  {{< atlas-article page="/notes/systems/error-analysis/softmax/online-block-state" fallback="/notes/systems/ai-infra/note-systems-io-attn-2-online-softmax/" fallbackTitle="Online Softmax · 从递推到分块合并" >}}
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="merge">
    <div class="atlas-stage-meta"><span class="atlas-number">02</span><span class="atlas-stage-code">RESCALE / MERGE</span><div class="atlas-stage-formula">\(S_A\oplus S_B\to S\)</div></div>
    <div class="atlas-stage-body"><h3>重标定与合并</h3><p class="atlas-question">最大值发生变化时，旧的部分和如何重标定，舍入又在哪里发生？</p>
<ul class="atlas-readings">
  {{< atlas-pending title="专题正文尚未完成，下方为现有研究资料" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_normalizer_contract.md"><span class="atlas-kind">研究记录</span><span class="atlas-reading-title">Online normalizer · 算术契约与误差分解</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="schedule">
    <div class="atlas-stage-meta"><span class="atlas-number">03</span><span class="atlas-stage-code">SCHEDULE</span><div class="atlas-stage-formula">\(G:\ S_1,\ldots,S_B\to S\)</div></div>
    <div class="atlas-stage-body"><h3>合并拓扑</h3><p class="atlas-question">块大小、chain 与 balanced tree，怎样改变实际的舍入路径？</p>
<ul class="atlas-readings">
  {{< atlas-pending title="专题正文尚未完成，下方为现有研究资料" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/experiments/online/README.md"><span class="atlas-kind">实验记录</span><span class="atlas-reading-title">Online 实验入口 · schedule 与受控对照</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
  <article class="atlas-stage" id="output">
    <div class="atlas-stage-meta"><span class="atlas-number">04</span><span class="atlas-stage-code">OUTPUT</span><div class="atlas-stage-formula">\(\hat{y}=\mathrm{fl}(\hat{o}/\hat{\ell})\)</div></div>
    <div class="atlas-stage-body"><h3>输出与存储 <span class="atlas-extension">Attention 扩展</span></h3><p class="atlas-question">分母的改善，能否穿过加权累加、除法和存储格式？</p>
<ul class="atlas-readings">
  {{< atlas-pending title="Online 专题正文尚未完成，下方为现有研究资料" >}}
  <li><a href="https://github.com/r1skers/error-atlas/blob/17ffd2a/topics/softmax/notes/online_scalar_output_v1.md"><span class="atlas-kind">实验复盘</span><span class="atlas-reading-title">标量输出诊断 · 从 normalizer 到 consumer</span><span class="atlas-link-end"><span class="atlas-source">Error Atlas</span><span aria-hidden="true">↗</span></span></a></li>
</ul>
    </div>
  </article>
</div>
</section>

<footer class="softmax-source-footer"><div><strong>Error Atlas</strong><p>研究笔记、可复现实验与开发过程。仓库链接固定到 17ffd2a 快照。</p></div><a href="https://github.com/r1skers/error-atlas/tree/17ffd2a/topics/softmax">进入研究仓库 <span aria-hidden="true">↗</span></a></footer>
