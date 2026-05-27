---
date: '2026-05-26T00:00:00+09:00'
draft: false
title: '线性代数大一统笔记'
summary: "一张可拖动缩放的二维线性代数知识地图：从矩阵出发，把主干与分支一次性铺开。"
description: "A draggable two-dimensional linear algebra knowledge map with expandable room for related branches."
tags: ["Linear Algebra", "Map", "Index"]
categories: ["Crucible"]
layout: map
ShowToc: false
ShowReadingTime: false
aliases:
  - /notes/笔记-线性代数-大一统笔记/
---

> 拖动平移 · 滚轮缩放 · 点击节点看概念卡片 · 双击回到初始视图。

<style>
  .la-map-wrap {
    margin: 1.2rem 0 2rem;
  }
  .la-stage {
    position: relative;
    width: 100%;
    height: 74vh;
    min-height: 560px;
    overflow: hidden;
    border: 1px solid #1f2937;
    border-radius: 10px;
    background:
      radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.14), transparent 34%),
      radial-gradient(circle at 72% 72%, rgba(245, 158, 11, 0.10), transparent 28%),
      #020617;
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .la-stage.dragging {
    cursor: grabbing;
  }
  .la-canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 3200px;
    height: 2800px;
    transform-origin: 0 0;
  }
  .la-edges {
    position: absolute;
    left: 0;
    top: 0;
    overflow: visible;
    pointer-events: none;
  }
  .la-edge {
    fill: none;
    stroke: #334155;
    stroke-width: 1.35;
    opacity: 0.55;
  }
  .la-edge.primary {
    stroke: #38bdf8;
    stroke-width: 1.8;
    opacity: 0.62;
  }
  .la-edge.detail {
    stroke: #64748b;
    stroke-width: 1.5;
    opacity: 0.65;
  }
  .la-edge.accent {
    stroke: #fbbf24;
    stroke-width: 1.9;
    opacity: 0.78;
  }
  .la-node {
    position: absolute;
    z-index: 4;
    transform: translate(-50%, -50%);
    padding: 7px 12px;
    border: 1px solid rgba(100, 116, 139, 0.9);
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.88);
    color: #e2e8f0;
    white-space: nowrap;
    cursor: pointer;
    font: 13px/1.18 -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(6px);
    transition: transform .16s, border-color .16s, background .16s, box-shadow .16s, opacity .16s;
  }
  .la-node:hover {
    z-index: 8;
    border-color: #60a5fa;
    background: rgba(30, 41, 59, 0.96);
    box-shadow: 0 0 18px rgba(96, 165, 250, 0.42);
    transform: translate(-50%, -52%);
  }
  .la-node.center {
    z-index: 6;
    min-width: 250px;
    padding: 14px 18px 12px;
    border-color: #93c5fd;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(30, 58, 138, 0.96), rgba(30, 64, 175, 0.94));
    color: #f8fafc;
    text-align: center;
    box-shadow: 0 0 32px rgba(96, 165, 250, 0.48);
  }
  .la-node.center mjx-container {
    margin: 0 !important;
    color: #f8fafc !important;
    font-size: 1.16em !important;
  }
  .la-core-sub {
    display: block;
    margin-top: 7px;
    color: #bfdbfe;
    font-size: 12px;
    line-height: 1.3;
  }
  .la-node.branch {
    padding: 10px 20px;
    border-color: rgba(125, 211, 252, 0.78);
    background: rgba(8, 47, 73, 0.9);
    color: #e0f2fe;
    font-size: 16px;
    font-weight: 650;
  }
  .la-node.branch.active {
    border-color: #fbbf24;
    color: #fde68a;
    box-shadow: 0 0 24px rgba(251, 191, 36, 0.4);
  }
  .la-node.detail {
    z-index: 7;
    border-color: #475569;
    background: rgba(30, 41, 59, 0.9);
  }
  .la-node.detail.hub {
    border-color: #7dd3fc;
    background: rgba(8, 47, 73, 0.94);
    font-weight: 650;
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.35);
  }
  .la-node.detail.accent {
    border-color: rgba(251, 191, 36, 0.85);
    color: #fde68a;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.28);
  }
  .la-popup {
    position: fixed;
    z-index: 40;
    display: none;
    max-width: 380px;
    min-width: 250px;
    padding: 14px 16px 12px;
    border: 1px solid #334155;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.98);
    color: #e2e8f0;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
    font-size: 13.5px;
    line-height: 1.55;
  }
  .la-popup.show {
    display: block;
  }
  .la-popup-title {
    margin: 0 0 8px;
    padding-right: 22px;
    color: #93c5fd;
    font-size: 14.5px;
    font-weight: 650;
  }
  .la-popup-body p {
    margin: 4px 0;
  }
  .la-popup-link {
    color: #60a5fa;
    text-decoration: none;
    border-bottom: 1px dashed #60a5fa;
  }
  .la-popup-link:hover {
    color: #93c5fd;
    border-bottom-style: solid;
  }
  .la-popup-close {
    position: absolute;
    top: 8px;
    right: 10px;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
  }
  .la-popup-close:hover {
    color: #cbd5e1;
  }
  .la-popup-share {
    position: absolute;
    top: 7px;
    right: 32px;
    color: #64748b;
    cursor: pointer;
    font-size: 11.5px;
    line-height: 1;
    padding: 2px 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    user-select: none;
  }
  .la-popup-share:hover {
    color: #cbd5e1;
    border-color: #334155;
  }
  .la-popup-share.copied {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.5);
  }
  .la-hint {
    margin-top: 7px;
    color: #64748b;
    font-size: 12px;
    text-align: center;
  }
  /* 搜索框 + 结果下拉 */
  .la-search {
    position: relative;
    margin-bottom: 8px;
  }
  .la-search input {
    width: 100%;
    padding: 9px 14px;
    border: 1px solid #334155;
    border-radius: 8px;
    background: rgba(15, 23, 42, 0.7);
    color: #e2e8f0;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
  }
  .la-search input::placeholder { color: #475569; }
  .la-search input:focus { border-color: #60a5fa; background: rgba(15, 23, 42, 0.88); }
  .la-search-results {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 320px;
    overflow-y: auto;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
    display: none;
    z-index: 30;
  }
  .la-search-results.show { display: block; }
  .la-search-result {
    padding: 8px 14px;
    cursor: pointer;
    border-bottom: 1px solid rgba(51, 65, 85, 0.4);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .la-search-result:last-child { border-bottom: none; }
  .la-search-result:hover,
  .la-search-result.active { background: rgba(30, 41, 59, 0.95); }
  .la-search-result .r-name {
    color: #e2e8f0;
    font-weight: 500;
    font-size: 13.5px;
  }
  .la-search-result .r-path {
    color: #64748b;
    font-size: 11.5px;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-width: 0;
  }
  .la-search-empty {
    padding: 10px 14px;
    color: #64748b;
    font-size: 12.5px;
  }
  /* 搜索定位到节点后的短暂高亮 */
  @keyframes la-flash {
    0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
    25% { box-shadow: 0 0 28px 6px rgba(251, 191, 36, 0.7); }
    50% { box-shadow: 0 0 36px 10px rgba(251, 191, 36, 0.9); }
    75% { box-shadow: 0 0 28px 6px rgba(251, 191, 36, 0.7); }
  }
  .la-node.flash { animation: la-flash 1.4s ease-in-out; }
</style>

<div class="la-map-wrap">
  <div class="la-search">
    <input type="search" id="la-search-input" placeholder="搜索概念，如 PCA、SVD、Kronecker...（按 / 快速聚焦）" autocomplete="off">
    <div class="la-search-results" id="la-search-results"></div>
  </div>
  <div class="la-stage" id="la-stage">
    <div class="la-canvas" id="la-canvas">
      <svg class="la-edges" id="la-edges"></svg>
      <div id="la-nodes"></div>
    </div>
  </div>
  <div class="la-hint">搜索定位 · 拖动平移 · 滚轮缩放 · 双击重置 · 鼠标悬停看卡片</div>
  <div class="la-popup" id="la-popup">
    <span class="la-popup-share" id="la-popup-share" title="复制分享链接">📋 链接</span>
    <span class="la-popup-close" id="la-popup-close">×</span>
    <div class="la-popup-title" id="la-popup-title"></div>
    <div class="la-popup-body" id="la-popup-body"></div>
  </div>
</div>

<script>
(function () {
  const stage = document.getElementById('la-stage');
  const canvas = document.getElementById('la-canvas');
  const edgesEl = document.getElementById('la-edges');
  const nodesEl = document.getElementById('la-nodes');
  const popup = document.getElementById('la-popup');
  const popupTitle = document.getElementById('la-popup-title');
  const popupBody = document.getElementById('la-popup-body');
  const popupClose = document.getElementById('la-popup-close');
  const popupShare = document.getElementById('la-popup-share');
  let popupCurrent = null;  // 当前 popup 关联的节点 data，用于"复制链接"
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const matrixTex = '\\(A = \\begin{pmatrix}'
    + 'a_{11} & a_{12} & \\cdots & a_{1n} \\\\'
    + 'a_{21} & a_{22} & \\cdots & a_{2n} \\\\'
    + '\\vdots & \\vdots & \\ddots & \\vdots \\\\'
    + 'a_{m1} & a_{m2} & \\cdots & a_{mn}'
    + '\\end{pmatrix}\\)';

  const branches = [
    { name: '几何', angle: -90, leaves: ['内积', '范数', '正交', '正交投影', '四基本子空间', '二次型', '距离 / 角度'] },
    { name: '结构', angle: -45, leaves: ['正交 / 酉', '对称 / Hermitian', '正定 / 半正定', '正规矩阵', '可对角化', '投影矩阵', '低秩结构', '稀疏 / 特殊结构'] },
    { name: '分解', angle: 0, leaves: ['奇异值分解', 'Schur 分解', '特征分解', '谱分解', 'Cholesky 分解', '极分解', 'Jordan 标准型', 'LU 分解', 'QR 分解'] },
    {
      name: '近似',
      angle: 45,
      leaves: [
        '投影近似',
        {
          name: '无监督学习 / 表征结构',
          parent: '投影近似',
          href: '/notes/note-ml-unsup-0-roadmap/',
          title: '无监督学习：从表征结构到聚类评估',
          intro:
            '<p>这条支路接在投影近似后面：先把高维数据投到更可读的表示空间，再讨论图结构、聚类算法和评估稳定性。</p>'
            + '<p>它在大一统图里的位置更像“投影近似”的应用支路，而不是和近似、稳定性并列的新一级支。</p>'
        },
        {
          name: '聚类前表示',
          parent: '无监督学习 / 表征结构',
          href: '/notes/note-ml-unsup-1-pca-whitening/',
          title: '聚类前表示：PCA / Whitening / 邻域可视化',
          intro:
            '<p>这篇笔记接在投影近似后面：先检查高维表征空间的方向、尺度和局部邻域，再讨论后续聚类是否可信。</p>'
            + '<p>关键词：PCA、whitening、t-SNE、UMAP；它们不是直接证明簇结构，而是为聚类前的数据几何做诊断。</p>'
        },
        {
          name: 'PCA 降维',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#1-pca寻找最大方差方向',
          title: 'PCA 降维',
          intro:
            '<p>找数据方差最大的方向，把高维投到少量主轴。</p>'
            + '<p>详解里覆盖三种理解：最大方差、最小重构误差、explained variance。</p>'
        },
        {
          name: 'Whitening',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#5-whitening把椭圆压成圆',
          title: 'Whitening：把椭圆压成圆',
          intro:
            '<p>用协方差矩阵的逆平方根做变换，让协方差变成单位阵——后续聚类距离才有可比性。</p>'
            + '<p>详解里继续到 PCA Whitening 与 ZCA Whitening 的差别。</p>'
        },
        {
          name: 't-SNE',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#8-t-sne--umap可视化局部邻域',
          title: 't-SNE：保局部邻域的可视化',
          intro:
            '<p>非线性降维，保留高维样本的局部邻域结构。适合可视化但不可直接当作聚类的依据。</p>'
            + '<p>详解里讨论它与 KL 散度、VAE 的连接，以及为什么误差控制困难。</p>'
        },
        {
          name: 'UMAP',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#8-t-sne--umap可视化局部邻域',
          title: 'UMAP：保局部邻域的可视化',
          intro:
            '<p>与 t-SNE 同类的非线性降维：更快、保留更多全局结构。</p>'
            + '<p>详解里和 t-SNE 在同一节中对比。</p>'
        },
        {
          name: '图表示 / 谱方法',
          parent: '无监督学习 / 表征结构',
          href: '/notes/note-ml-unsup-2-spectral/',
          title: '图表示与谱聚类',
          intro:
            '<p>这部分把样本关系先改写成图：近邻图给出局部连接，图拉普拉斯刻画平滑性与割，Spectral Embedding 再把图结构投到可聚类的坐标里。</p>'
        },
        { name: '近邻图', parent: '图表示 / 谱方法' },
        { name: '图拉普拉斯', parent: '图表示 / 谱方法' },
        { name: 'Spectral Embedding', parent: '图表示 / 谱方法' },
        { name: 'Spectral Clustering', parent: '图表示 / 谱方法' },
        {
          name: '聚类算法',
          parent: '无监督学习 / 表征结构',
          href: '/notes/note-ml-unsup-3-clustering-algorithms/',
          title: '聚类算法：KMeans / GMM / 层次 / DBSCAN',
          intro:
            '<p>这一组是从表示空间走向分组规则：中心、概率模型、层次结构和密度连通分别给出不同的“什么算同一簇”。</p>'
        },
        { name: 'KMeans', parent: '聚类算法' },
        { name: '普通 KMeans', parent: 'KMeans' },
        { name: 'Spherical KMeans', parent: 'KMeans' },
        { name: 'GMM', parent: '聚类算法' },
        { name: '层次聚类', parent: '聚类算法' },
        { name: 'DBSCAN', parent: '聚类算法' },
        { name: 'HDBSCAN', parent: 'DBSCAN' },
        {
          name: '聚类评估',
          parent: '无监督学习 / 表征结构',
          href: '/notes/note-ml-unsup-4-cluster-evaluation/',
          title: '聚类评估：内部、外部与稳定性',
          intro:
            '<p>评估支路回答“这组簇是否可信”：内部指标看几何紧凑与分离，外部指标对照标签或参考划分，稳定性评估看重采样扰动下是否仍然站得住。</p>'
        },
        { name: '内部指标', parent: '聚类评估' },
        { name: 'Silhouette', parent: '内部指标' },
        { name: 'Davies-Bouldin', parent: '内部指标' },
        { name: 'Calinski-Harabasz', parent: '内部指标' },
        { name: '外部指标', parent: '聚类评估' },
        { name: 'NMI', parent: '外部指标' },
        { name: 'ARI', parent: '外部指标' },
        { name: 'Purity', parent: '外部指标' },
        { name: '稳定性评估', parent: '聚类评估' },
        { name: 'Resampling', parent: '稳定性评估' },
        '低秩近似', '随机化近似', '稀疏近似', 'Nyström', 'NMF', '量化', 'Neumann 级数'
      ]
    },
    {
      name: '稳定性',
      angle: 90,
      leaves: [
        '条件数 / 病态',  // 合并原"条件数"+"病态性"（同一概念两面）
        '扰动理论',
        '误差放大',
        '正则化',         // hub: 下挂 4 种具体正则化技术
        { name: 'Tikhonov / L2', parent: '正则化' },
        { name: 'L1 稀疏',       parent: '正则化' },
        { name: '截断 SVD',      parent: '正则化' },
        { name: 'Early Stopping', parent: '正则化' },
      ],
    },
    { name: '优化', angle: 135, leaves: ['最小二乘优化', '凸优化', '梯度下降', 'Newton / 拟 Newton', '约束优化 (KKT)', '梯度', '海森矩阵'] },
    { name: '方程', angle: 180, leaves: ['Ax=b', '可解性', '唯一性', '伪逆解', '最小二乘', '最小范数解', '特征值问题'] },
    { name: '计算', angle: 225, leaves: ['行变换', '矩阵加法', '矩阵乘法', 'Hadamard 积', 'Kronecker 积', '消元', '换基', '矩阵幂 / exp', '迭代法'] },
  ];

  const hubs = new Set([
    '内积', '对称 / Hermitian', '低秩近似', '投影近似', '无监督学习 / 表征结构',
    '聚类前表示', '图表示 / 谱方法', '聚类算法', '聚类评估',
    '正则化', '梯度下降', 'Ax=b', '矩阵乘法'
  ]);
  const expanded = new Set();  // 当前已展开的分支名
  const canvasSize = { w: 3200, h: 2800 };
  const mapCenter = { x: 1600, y: 1400 };
  const view = { x: 0, y: 0, scale: 0.66 };
  let dragging = false;
  let dragStart = { x: 0, y: 0, viewX: 0, viewY: 0 };

  function nodeName(node) {
    return typeof node === 'string' ? node : node.name;
  }

  function point(cx, cy, radius, angleDeg) {
    const a = angleDeg * Math.PI / 180;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  }

  function clearMap() {
    edgesEl.replaceChildren();
    nodesEl.replaceChildren();
  }

  function drawEdge(a, b, cls = '') {
    const path = document.createElementNS(SVG_NS, 'path');
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const mx = (a.x + b.x) / 2 - dy / len * Math.min(28, len * 0.08);
    const my = (a.y + b.y) / 2 + dx / len * Math.min(28, len * 0.08);
    path.setAttribute('d', `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`);
    path.setAttribute('class', `la-edge ${cls}`);
    edgesEl.appendChild(path);
  }

  function normalizeNode(node) {
    return typeof node === 'string' ? { name: node } : node;
  }

  function makeNode(data, pos, cls, onClick) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `la-node ${cls}`;
    node.style.left = `${pos.x}px`;
    node.style.top = `${pos.y}px`;
    if (cls.includes('center')) {
      node.innerHTML = matrixTex + '<span class="la-core-sub">线性映射 T · 选基后的坐标表示 · 换基改变坐标不改变映射</span>';
    } else {
      node.textContent = data.name;
      node.dataset.nodeName = data.name;  // 用于搜索 pan-to
      // hover 显示卡片，移开延迟关闭（留时间过渡到 popup 上）
      node.addEventListener('mouseenter', (event) => {
        cancelHidePopup();
        showPopup(data, event.clientX, event.clientY);
      });
      node.addEventListener('mouseleave', () => {
        scheduleHidePopup();
      });
    }
    node.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick?.(event, data);
    });
    nodesEl.appendChild(node);
    return node;
  }

  function childrenOf(branch, itemName) {
    return branch.leaves.filter(leaf => leaf.parent === itemName);
  }

  // 找一个节点在同一支里"同 parent 的兄弟" —— 用于 accordion
  function getSiblings(branch, name) {
    const node = branch.leaves.find(l => nodeName(l) === name);
    const parent = (node && typeof node === 'object' && node.parent) || null;
    return branch.leaves.filter(l => {
      const lp = (typeof l === 'object' && l.parent) || null;
      return lp === parent && nodeName(l) !== name;
    });
  }

  // 递归收集一个节点的所有后代名 —— 收起时一并清出 expanded
  function getDescendants(branch, name) {
    const direct = branch.leaves.filter(l => typeof l === 'object' && l.parent === name);
    const out = direct.map(nodeName);
    direct.forEach(child => out.push(...getDescendants(branch, nodeName(child))));
    return out;
  }

  // 切换一个嵌套 hub：展开时收起同级兄弟，收起时把自己 + 后代都清除
  function toggleHub(branch, name) {
    if (expanded.has(name)) {
      expanded.delete(name);
      getDescendants(branch, name).forEach(d => expanded.delete(d));
    } else {
      getSiblings(branch, name).forEach(sib => {
        const sibName = nodeName(sib);
        if (expanded.has(sibName)) {
          expanded.delete(sibName);
          getDescendants(branch, sibName).forEach(d => expanded.delete(d));
        }
      });
      expanded.add(name);
    }
  }

  // 切换一个顶层 branch：展开时收起其它 7 支（含其所有嵌套）
  function toggleBranch(name) {
    if (expanded.has(name)) {
      expanded.delete(name);
      const b = branches.find(b => b.name === name);
      if (b) b.leaves.forEach(leaf => expanded.delete(nodeName(leaf)));
    } else {
      branches.forEach(b => {
        if (b.name !== name) {
          expanded.delete(b.name);
          b.leaves.forEach(leaf => expanded.delete(nodeName(leaf)));
        }
      });
      expanded.add(name);
    }
  }

  function spanOf(branch, itemName) {
    if (!expanded.has(itemName)) return 1;  // 折叠时只占 1 个 slot
    const children = childrenOf(branch, itemName);
    if (!children.length) return 1;
    return children.reduce((sum, child) => sum + spanOf(branch, child.name), 0);
  }

  function classFor(data, branch, depth) {
    const hasChildren = childrenOf(branch, data.name).length > 0;
    const hub = hasChildren || hubs.has(data.name);
    return `detail ${hub ? 'hub' : ''} ${data.href ? 'accent' : ''}`;
  }

  function placeSubtree(branch, node, parentPos, axis, side, depth, startSlot, slots, slotGap, levelGap) {
    const data = normalizeNode(node);
    const centerSlot = startSlot + (slots - 1) / 2;
    const pos = {
      x: parentPos.x + axis.x * levelGap + side.x * centerSlot * slotGap,
      y: parentPos.y + axis.y * levelGap + side.y * centerSlot * slotGap,
    };
    const hasChildren = childrenOf(branch, data.name).length > 0;
    drawEdge(parentPos, pos, data.href || hasChildren ? 'accent' : 'detail');
    makeNode(data, pos, classFor(data, branch, depth), () => {
      if (hasChildren) {
        // hub 节点：accordion 切换（同级兄弟自动收起）
        toggleHub(branch, data.name);
        renderMap();
      }
      // 叶子节点：click 无动作，hover 已显示卡片
    });

    if (!hasChildren || !expanded.has(data.name)) return;

    let cursor = startSlot;
    childrenOf(branch, data.name).forEach(child => {
      const childSlots = spanOf(branch, child.name);
      placeSubtree(branch, child, pos, axis, side, depth + 1, cursor, childSlots, slotGap, levelGap * 0.9);
      cursor += childSlots;
    });
  }

  function renderMap() {
    clearMap();
    edgesEl.setAttribute('width', canvasSize.w);
    edgesEl.setAttribute('height', canvasSize.h);
    edgesEl.setAttribute('viewBox', `0 0 ${canvasSize.w} ${canvasSize.h}`);
    canvas.style.width = `${canvasSize.w}px`;
    canvas.style.height = `${canvasSize.h}px`;

    makeNode({ name: '矩阵 A' }, mapCenter, 'center', () => resetView());

    branches.forEach(branch => {
      const branchPos = point(mapCenter.x, mapCenter.y, 390, branch.angle);
      drawEdge(mapCenter, branchPos, 'primary');

      const isExpanded = expanded.has(branch.name);
      const cls = isExpanded ? 'branch active' : 'branch';
      makeNode(branch, branchPos, cls, () => {
        // accordion：展开一支会自动收起其它 7 支（含所有嵌套）
        toggleBranch(branch.name);
        renderMap();
      });

      if (!isExpanded) return;

      const angle = branch.angle * Math.PI / 180;
      const axis = { x: Math.cos(angle), y: Math.sin(angle) };
      const side = { x: -Math.sin(angle), y: Math.cos(angle) };
      const roots = branch.leaves.filter(leaf => !leaf.parent);
      const totalSlots = roots.reduce((sum, root) => sum + spanOf(branch, nodeName(root)), 0);
      const slotGap = totalSlots > 18 ? 44 : 58;
      const levelGap = branch.name === '近似' ? 150 : 138;
      let cursor = -(totalSlots - 1) / 2;

      roots.forEach(root => {
        const slots = spanOf(branch, nodeName(root));
        placeSubtree(branch, root, branchPos, axis, side, 0, cursor, slots, slotGap, levelGap);
        cursor += slots;
      });
    });

    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([canvas]).catch(() => {});
    }
  }

  function applyView() {
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  }

  function resetView() {
    const rect = stage.getBoundingClientRect();
    view.scale = Math.max(0.45, Math.min(0.72, rect.width / 1650, rect.height / 1120));
    view.x = rect.width / 2 - mapCenter.x * view.scale;
    view.y = rect.height / 2 - mapCenter.y * view.scale;
    hidePopup();
    applyView();
  }

  let popupHideTimer = null;
  function cancelHidePopup() {
    if (popupHideTimer) {
      clearTimeout(popupHideTimer);
      popupHideTimer = null;
    }
  }
  function scheduleHidePopup(delay = 150) {
    cancelHidePopup();
    popupHideTimer = setTimeout(hidePopup, delay);
  }

  function showPopup(data, x, y) {
    cancelHidePopup();
    popupCurrent = data;
    popupShare.classList.remove('copied');
    popupShare.textContent = '📋 链接';
    const title = data.title || data.name || '';
    let body = data.intro || '<p>这是地图中的结构节点。后续可以展开成定义、等价刻画、几何意义、计算方法和相关链路。</p>';
    if (data.href) {
      body += `<p><a class="la-popup-link" href="${data.href}">→ 详解笔记</a></p>`;
    }
    popupTitle.textContent = title;
    popupBody.innerHTML = body;
    popup.classList.add('show');
    popup.style.left = `${x + 14}px`;
    popup.style.top = `${y + 14}px`;
    const rect = popup.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) popup.style.left = `${x - rect.width - 14}px`;
    if (rect.bottom > window.innerHeight - 12) popup.style.top = `${window.innerHeight - rect.height - 12}px`;
  }

  function hidePopup() {
    cancelHidePopup();
    popup.classList.remove('show');
  }

  popupClose.addEventListener('click', hidePopup);
  // 鼠标进入 popup 取消关闭计时，移出再排队关闭——保证用户能点 popup 里的链接
  popup.addEventListener('mouseenter', cancelHidePopup);
  popup.addEventListener('mouseleave', () => scheduleHidePopup());
  // 📋 链接：复制带 ?node=... 的分享 URL 到剪贴板
  popupShare.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!popupCurrent) return;
    const url = new URL(window.location.href);
    url.searchParams.set('node', popupCurrent.name);
    const text = url.toString();
    const flash = () => {
      popupShare.classList.add('copied');
      popupShare.textContent = '✓ 已复制';
      setTimeout(() => {
        popupShare.classList.remove('copied');
        popupShare.textContent = '📋 链接';
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(flash, () => prompt('手动复制：', text));
    } else {
      prompt('手动复制：', text);
    }
  });

  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('.la-node')) return;
    dragging = true;
    dragStart = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
    stage.classList.add('dragging');
    stage.setPointerCapture?.(event.pointerId);
    hidePopup();
  });

  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    view.x = dragStart.viewX + event.clientX - dragStart.x;
    view.y = dragStart.viewY + event.clientY - dragStart.y;
    applyView();
  });

  stage.addEventListener('pointerup', event => {
    dragging = false;
    stage.classList.remove('dragging');
    stage.releasePointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointercancel', () => {
    dragging = false;
    stage.classList.remove('dragging');
  });

  stage.addEventListener('wheel', event => {
    event.preventDefault();
    const rect = stage.getBoundingClientRect();
    const oldScale = view.scale;
    const nextScale = Math.max(0.32, Math.min(1.35, oldScale * (event.deltaY < 0 ? 1.08 : 0.92)));
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const worldX = (px - view.x) / oldScale;
    const worldY = (py - view.y) / oldScale;
    view.scale = nextScale;
    view.x = px - worldX * nextScale;
    view.y = py - worldY * nextScale;
    hidePopup();
    applyView();
  }, { passive: false });

  stage.addEventListener('dblclick', resetView);
  stage.addEventListener('click', () => hidePopup());
  window.addEventListener('resize', resetView);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') resetView();
  });

  renderMap();
  resetView();

  // ====== 搜索功能 ======
  const searchInput = document.getElementById('la-search-input');
  const resultsEl = document.getElementById('la-search-results');
  let activeIndex = -1;

  // 扁平化所有节点 → 搜索索引
  function buildIndex() {
    const items = [];
    branches.forEach(branch => {
      // branch 本身也可搜
      items.push({
        name: branch.name,
        branch: branch.name,
        path: '顶层分支',
        data: branch,
        isBranch: true,
      });
      branch.leaves.forEach(leaf => {
        const name = nodeName(leaf);
        // 走 parent 链构造完整路径
        const segments = [];
        let cur = (typeof leaf === 'object' && leaf.parent) || null;
        while (cur) {
          segments.unshift(cur);
          const parentLeaf = branch.leaves.find(l => nodeName(l) === cur);
          cur = parentLeaf && typeof parentLeaf === 'object' ? parentLeaf.parent : null;
        }
        items.push({
          name,
          branch: branch.name,
          path: [branch.name, ...segments].join(' / '),
          data: leaf,
          isBranch: false,
        });
      });
    });
    return items;
  }
  const searchIndex = buildIndex();

  function filterIndex(q) {
    if (!q) return [];
    const needle = q.toLowerCase();
    const exact = [], starts = [], contains = [];
    for (const item of searchIndex) {
      const hay = item.name.toLowerCase();
      if (hay === needle) exact.push(item);
      else if (hay.startsWith(needle)) starts.push(item);
      else if (hay.includes(needle)) contains.push(item);
    }
    return [...exact, ...starts, ...contains].slice(0, 10);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function renderResults(results) {
    resultsEl.replaceChildren();
    activeIndex = -1;
    if (!results.length) {
      if (searchInput.value.trim()) {
        const empty = document.createElement('div');
        empty.className = 'la-search-empty';
        empty.textContent = '没有匹配的节点';
        resultsEl.appendChild(empty);
        resultsEl.classList.add('show');
      } else {
        resultsEl.classList.remove('show');
      }
      return;
    }
    results.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'la-search-result';
      row.dataset.idx = String(i);
      row.innerHTML = `<span class="r-name">${escapeHtml(item.name)}</span><span class="r-path">${escapeHtml(item.path)}</span>`;
      row.addEventListener('click', () => navigateTo(item));
      resultsEl.appendChild(row);
    });
    resultsEl.classList.add('show');
  }

  function navigateTo(item, opts = {}) {
    // 关闭搜索 UI
    searchInput.value = '';
    resultsEl.classList.remove('show');
    hidePopup();

    // 清空已展开，根据 item 路径重新展开
    expanded.clear();
    if (item.isBranch) {
      expanded.add(item.branch);
    } else {
      expanded.add(item.branch);
      const branch = branches.find(b => b.name === item.branch);
      let cur = item.data && typeof item.data === 'object' ? item.data.parent : null;
      while (cur) {
        expanded.add(cur);
        const parentLeaf = branch.leaves.find(l => nodeName(l) === cur);
        cur = parentLeaf && typeof parentLeaf === 'object' ? parentLeaf.parent : null;
      }
    }
    renderMap();
    // 等 DOM 更新后再 pan + flash
    requestAnimationFrame(() => panToNode(item.name));

    // 同步到 URL（方便分享）；从 URL 加载时不再写一次
    if (!opts.fromURL) setURLNode(item.name);
  }

  function setURLNode(name) {
    try {
      const url = new URL(window.location.href);
      if (name) url.searchParams.set('node', name);
      else url.searchParams.delete('node');
      window.history.replaceState({}, '', url);
    } catch (_) { /* 安静失败：history API 限制等 */ }
  }

  function navigateFromURL() {
    let target = null;
    try {
      target = new URLSearchParams(window.location.search).get('node');
    } catch (_) { return; }
    if (!target) return;
    const exact = searchIndex.find(it => it.name === target);
    const ci = exact || searchIndex.find(it => it.name.toLowerCase() === target.toLowerCase());
    if (ci) navigateTo(ci, { fromURL: true });
  }

  function panToNode(name) {
    const node = nodesEl.querySelector(`.la-node[data-node-name="${CSS.escape(name)}"]`);
    if (!node) return;
    const x = parseFloat(node.style.left);
    const y = parseFloat(node.style.top);
    const rect = stage.getBoundingClientRect();
    view.x = rect.width / 2 - x * view.scale;
    view.y = rect.height / 2 - y * view.scale;
    applyView();
    node.classList.remove('flash');
    // 强制重排重启动画
    void node.offsetWidth;
    node.classList.add('flash');
  }

  searchInput.addEventListener('input', () => {
    renderResults(filterIndex(searchInput.value.trim()));
  });
  searchInput.addEventListener('focus', () => {
    hidePopup();
    if (searchInput.value.trim()) renderResults(filterIndex(searchInput.value.trim()));
  });
  searchInput.addEventListener('keydown', (event) => {
    const rows = resultsEl.querySelectorAll('.la-search-result');
    if (event.key === 'Escape') {
      searchInput.value = '';
      resultsEl.classList.remove('show');
      searchInput.blur();
      setURLNode(null);
    } else if (event.key === 'ArrowDown' && rows.length) {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % rows.length;
      rows.forEach((r, i) => r.classList.toggle('active', i === activeIndex));
      rows[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp' && rows.length) {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + rows.length) % rows.length;
      rows.forEach((r, i) => r.classList.toggle('active', i === activeIndex));
      rows[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = activeIndex >= 0 ? rows[activeIndex] : rows[0];
      if (target) target.click();
    }
  });
  // 点外面关下拉
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.la-search')) {
      resultsEl.classList.remove('show');
    }
  });
  // "/" 快捷聚焦（不在 input 内时）
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== searchInput) {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        event.preventDefault();
        searchInput.focus();
      }
    }
  });

  // 浏览器前进/后退时响应 URL 变化
  window.addEventListener('popstate', navigateFromURL);

  // 初次加载：若 URL 已带 ?node=...，直接跳过去
  navigateFromURL();
})();
</script>
