window.LA_MAP_REGISTER_BRANCH(
{
      name: '结构',
      angle: -45,
      leaves: [
        '正交 / 酉', '对称 / Hermitian',
        {
          name: '正定 / 半正定',
          title: '正定 / 半正定：二次型与非负能量',
          summary: '正定和半正定矩阵刻画非负能量，是协方差矩阵、最小二乘 Hessian 和二次型的共同结构。'
        },
        {
          name: '协方差矩阵',
          parent: '正定 / 半正定',
          title: '协方差矩阵：数据点云的二阶几何',
          summary: '协方差矩阵记录数据各方向的方差和方向之间的相关性，是 PCA 与 whitening 的共同支点。',
          intro:
            '<p>协方差矩阵把中心化数据的方向、尺度和相关性编码成一个对称半正定矩阵。</p>',
          detail: {
            lead: '协方差矩阵承接“中心化数据矩阵”这一步：它把一批样本在所有方向上的投影方差，压缩成一个对称半正定矩阵。',
            prereq: ['内积', '范数', '正定 / 半正定', '特征分解'],
            main: [
              { type: 'p', text: '第一步是把数据中心化。设中心化后的数据矩阵为 \\(X_c\\in\\mathbb R^{n\\times d}\\)，每一行是一个样本，每一列是一个特征。' },
              { type: 'p', text: '协方差矩阵定义为：' },
              { type: 'formula', tex: '\\[S=\\frac1nX_c^\\top X_c.\\]' },
              { type: 'p', text: '现在任取一个单位方向 \\(u\\)，把所有样本投影到这个方向上，得到一维坐标：' },
              { type: 'formula', tex: '\\[z=X_cu.\\]' },
              { type: 'p', text: '这些一维坐标的平均平方就是这个方向上的投影方差：' },
              { type: 'formula', tex: '\\[\\frac1n\\sum_{i=1}^n z_i^2=\\frac1n\\|X_cu\\|^2.\\]' },
              { type: 'p', text: '把它写回矩阵形式，就得到协方差矩阵最关键的二次型：' },
              { type: 'formula', tex: '\\[u^\\top S u.\\]' },
              { type: 'p', text: '所以 \\(u^\\top S u\\) 的意义非常具体：它就是数据沿方向 \\(u\\) 的方差。' },
              { type: 'p', text: '由于 \\(S\\) 是对称半正定矩阵，可以做特征分解：' },
              { type: 'formula', tex: '\\[S=V\\Lambda V^\\top.\\]' }
            ],
            idea: '协方差矩阵的核心不是“记录原始数据”，而是回答一个方向问题：沿任意单位方向 u 看过去，数据展开得有多大？PCA 正是继续问：哪个方向让这个方差最大？',
            example: [
              { type: 'p', text: '如果二维数据沿横轴变化很大、纵轴变化很小，并且两个方向几乎不相关，协方差可能近似为：' },
              { type: 'formula', tex: '\\[S=\\begin{pmatrix}9&0\\\\0&1\\end{pmatrix}.\\]' },
              { type: 'p', text: '这说明第一坐标方向的方差是第二坐标方向的 9 倍。如果换一个方向 \\(u\\)，方向方差就由 \\(u^\\top S u\\) 给出。PCA 会在所有单位方向里找这个量最大的方向。' }
            ],
            applications: ['PCA 主方向', 'Whitening 尺度校正', '二次型几何', '高维表征各向异性诊断'],
            next: ['PCA', 'Whitening']
          }
        },
        '正规矩阵', '可对角化',
        {
          name: '投影矩阵',
          href: '/notes/note-la-1-inner-product-projection/#8-投影矩阵',
          title: '投影矩阵：幂等与正交投影',
          intro: '<p>投影矩阵满足 P²=P；正交投影矩阵还满足 Pᵀ=P。</p>'
        },
        '低秩结构', '稀疏 / 特殊结构'
      ]
    }
);
