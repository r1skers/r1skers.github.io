(function () {
  // Rendering and interaction layer. Keep graph/card content in la-map-data.js.
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

  const mapData = window.LA_MAP_DATA || {};
  const { matrixTex, foundationNode, branches, hubs } = mapData;
  if (!matrixTex || !foundationNode || !Array.isArray(branches) || branches.length === 0 || !(hubs instanceof Set)) {
    throw new Error('LA map data is missing or malformed.');
  }
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
      node.dataset.nodeName = data.name;
      node.addEventListener('mouseenter', (event) => {
        cancelHidePopup();
        showPopup(data, event.clientX, event.clientY, 'hover');
      });
      node.addEventListener('mouseleave', () => {
        scheduleHidePopup();
      });
    } else {
      node.textContent = data.name;
      node.dataset.nodeName = data.name;  // 用于搜索 pan-to
      // hover 显示卡片，移开延迟关闭（留时间过渡到 popup 上）
      node.addEventListener('mouseenter', (event) => {
        cancelHidePopup();
        showPopup(data, event.clientX, event.clientY, 'hover');
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
    makeNode(data, pos, classFor(data, branch, depth), (event) => {
      if (hasChildren) {
        // hub 节点：accordion 切换（同级兄弟自动收起）
        toggleHub(branch, data.name);
        renderMap();
      }
      showPopup(data, event.clientX, event.clientY, 'detail');
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

    makeNode(foundationNode, mapCenter, 'center', (event, data) => showPopup(data, event.clientX, event.clientY, 'detail'));

    branches.forEach(branch => {
      const branchPos = point(mapCenter.x, mapCenter.y, 390, branch.angle);
      drawEdge(mapCenter, branchPos, 'primary');

      const isExpanded = expanded.has(branch.name);
      const cls = isExpanded ? 'branch active' : 'branch';
      makeNode(branch, branchPos, cls, (event) => {
        // accordion：展开一支会自动收起其它 7 支（含所有嵌套）
        toggleBranch(branch.name);
        renderMap();
        showPopup(branch, event.clientX, event.clientY, 'detail');
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
  let popupMode = 'hover';
  function cancelHidePopup() {
    if (popupHideTimer) {
      clearTimeout(popupHideTimer);
      popupHideTimer = null;
    }
  }
  function scheduleHidePopup(delay = 150) {
    if (popupMode === 'detail') return;
    cancelHidePopup();
    popupHideTimer = setTimeout(hidePopup, delay);
  }

  function nodeChip(name) {
    return `<button type="button" class="la-card-chip" data-node-link="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
  }

  function renderDetailBody(data) {
    const detail = data.detail;
    if (!detail) {
      let body = data.intro || '<p>这是地图中的结构节点。后续可以展开成定义、等价刻画、几何意义、计算方法和相关链路。</p>';
      if (data.href) {
        body += `<div class="la-card-section"><div class="la-card-section-title">完整推导</div><p><a class="la-popup-link" href="${data.href}">打开对应笔记</a></p></div>`;
      }
      return body;
    }

    let body = `<p class="la-card-lead">${escapeHtml(detail.lead || data.summary || data.title || data.name)}</p>`;
    if (detail.prereq?.length) {
      body += '<div class="la-card-section"><div class="la-card-section-title">前置知识</div><div class="la-card-links">'
        + detail.prereq.map(nodeChip).join('')
        + '</div></div>';
    }
    if (detail.main?.length) {
      body += '<div class="la-card-section la-card-main"><div class="la-card-section-title">主要内容</div>'
        + detail.main.map(renderMainBlock).join('')
        + '</div>';
    }
    if (detail.idea) {
      body += `<div class="la-card-section"><div class="la-card-section-title">核心思想</div><p>${escapeHtml(detail.idea)}</p></div>`;
    }
    if (detail.example?.length) {
      body += '<div class="la-card-section la-card-main"><div class="la-card-section-title">例子</div>'
        + detail.example.map(renderMainBlock).join('')
        + '</div>';
    }
    if (detail.applications?.length) {
      body += '<div class="la-card-section"><div class="la-card-section-title">可能应用</div><ul class="la-card-list">'
        + detail.applications.map(item => `<li>${escapeHtml(item)}</li>`).join('')
        + '</ul></div>';
    }
    if (detail.next?.length) {
      body += '<div class="la-card-section"><div class="la-card-section-title">继续连接</div><div class="la-card-links">'
        + detail.next.map(nodeChip).join('')
        + '</div></div>';
    }
    return body;
  }

  function renderMainBlock(block) {
    if (typeof block === 'string') return block;
    if (block.type === 'formula') {
      return `<div class="la-card-formula">${block.tex}</div>`;
    }
    return `<p>${block.text || ''}</p>`;
  }

  function showPopup(data, x, y, mode = 'hover') {
    if (mode === 'hover' && popupMode === 'detail') return;
    cancelHidePopup();
    popupMode = mode;
    popupCurrent = data;
    popupShare.classList.remove('copied');
    popupShare.textContent = '📋 链接';
    const title = data.title || data.name || '';
    const body = mode === 'detail'
      ? renderDetailBody(data)
      : (data.summary ? `<p>${escapeHtml(data.summary)}</p>` : data.intro || '<p>这是地图中的结构节点。点击可查看更完整的知识卡。</p>');
    popupTitle.textContent = title;
    popupBody.innerHTML = body;
    popup.classList.toggle('detail-card', mode === 'detail');
    popup.classList.add('show');
    popup.style.left = `${x + 14}px`;
    popup.style.top = `${y + 14}px`;
    const rect = popup.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) popup.style.left = `${x - rect.width - 14}px`;
    if (rect.bottom > window.innerHeight - 12) popup.style.top = `${window.innerHeight - rect.height - 12}px`;
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([popup]).catch(() => {});
    }
  }

  function hidePopup() {
    cancelHidePopup();
    popupMode = 'hover';
    popup.classList.remove('show');
    popup.classList.remove('detail-card');
  }

  popupClose.addEventListener('click', hidePopup);
  popup.addEventListener('click', event => event.stopPropagation());
  popupBody.addEventListener('click', event => {
    const chip = event.target.closest('[data-node-link]');
    if (!chip) return;
    event.preventDefault();
    event.stopPropagation();
    const targetName = chip.dataset.nodeLink;
    const exact = searchIndex.find(item => item.name === targetName);
    const item = exact || searchIndex.find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (item) navigateTo(item);
  });
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
    const items = [{
      name: foundationNode.name,
      branch: '总根',
      path: '总根 / 基础篇',
      data: foundationNode,
      isCenter: true,
    }];
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
    if (item.isCenter) {
      renderMap();
      requestAnimationFrame(() => panToNode(item.name));
      if (!opts.fromURL) setURLNode(item.name);
      return;
    }
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
    if (!event.target.closest('.la-popup') && !event.target.closest('.la-node')) {
      hidePopup();
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
