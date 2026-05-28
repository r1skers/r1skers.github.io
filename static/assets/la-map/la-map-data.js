(function () {
  // Registry layer. Add a file under branches/ to register another top-level framework.
  const matrixTex = '\\(A = \\begin{pmatrix}'
    + 'a_{11} & a_{12} & \\cdots & a_{1n} \\\\'
    + 'a_{21} & a_{22} & \\cdots & a_{2n} \\\\'
    + '\\vdots & \\vdots & \\ddots & \\vdots \\\\'
    + 'a_{m1} & a_{m2} & \\cdots & a_{mn}'
    + '\\end{pmatrix}\\)';

  const foundationNode = {
    name: '矩阵 A',
    href: '/notes/note-la-0-foundation/',
    title: '基础篇：矩阵、线性映射与坐标语言',
    intro:
      '<p>整张地图的中心：矩阵不是一张数表，而是线性映射在选定基下的坐标表示。</p>'
      + '<p>基础篇先把空间、线性映射、基、坐标、矩阵乘法和换基统一起来，再说明八个一级分支如何从这里长出。</p>'
  };

  const hubs = new Set([
    '内积', '对称 / Hermitian', '低秩近似', '投影近似', '无监督学习 / 表征结构',
    '聚类前表示', '图表示 / 谱方法', '聚类算法', '聚类评估',
    '正则化', '梯度下降', 'Ax=b', '矩阵乘法'
  ]);

  const mapData = { matrixTex, foundationNode, branches: [], hubs };

  window.LA_MAP_DATA = mapData;
  window.LA_MAP_REGISTER_BRANCH = function registerBranch(branch) {
    mapData.branches.push(branch);
  };
})();
