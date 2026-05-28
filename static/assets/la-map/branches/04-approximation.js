window.LA_MAP_REGISTER_BRANCH(
{
      name: '近似',
      angle: 45,
      leaves: [
        {
          name: '投影近似',
          href: '/notes/note-la-1-inner-product-projection/#12-投影近似',
          title: '投影近似：用子空间表达复杂对象',
          intro: '<p>投影近似把对象分成可表示部分和正交误差，是低秩近似与 PCA 的前置模板。</p>'
        },
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
          name: 'PCA',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#1-pca寻找最大方差方向',
          title: 'PCA：主方向、投影近似与低维表示',
          summary: 'PCA 是把数据投影到方差最大的低维正交子空间上。',
          intro:
            '<p>PCA 是把数据投影到方差最大的低维正交子空间上。</p>',
          detail: {
            lead: 'PCA 接在协方差矩阵之后：既然 \\(u^\\top S u\\) 表示数据沿方向 \\(u\\) 的投影方差，那第一主方向就是让这个量最大的单位方向。',
            prereq: ['范数', '正交', '正交投影', '投影近似', '协方差矩阵', '特征分解', '奇异值分解', '低秩近似'],
            main: [
              { type: 'p', text: '从中心化数据矩阵 \\(X_c\\) 出发，先形成协方差矩阵：' },
              { type: 'formula', tex: '\\[S=\\frac1nX_c^\\top X_c.\\]' },
              { type: 'p', text: '第一主方向定义为投影方差最大的单位方向：' },
              { type: 'formula', tex: '\\[\\max_{\\|u\\|=1}u^\\top S u.\\]' },
              { type: 'p', text: '对这个约束优化写拉格朗日条件，会得到特征方程：' },
              { type: 'formula', tex: '\\[Su=\\lambda u.\\]' },
              { type: 'p', text: '把两边左乘 \\(u^\\top\\)，并用 \\(\\|u\\|=1\\)，得到：' },
              { type: 'formula', tex: '\\[u^\\top S u=\\lambda.\\]' },
              { type: 'p', text: '所以特征值 \\(\\lambda\\) 就是对应特征方向上的投影方差。最大特征值对应的特征向量，就是第一主方向。' },
              { type: 'p', text: '取前 \\(k\\) 个最大特征值对应的单位特征向量，组成主轴矩阵：' },
              { type: 'formula', tex: '\\[U_k=(u_1,u_2,\\ldots,u_k).\\]' },
              { type: 'p', text: '把中心化数据投影到这些主轴上，就得到 PCA 坐标：' },
              { type: 'formula', tex: '\\[Z=X_cU_k.\\]' },
              { type: 'p', text: '如果再从低维坐标投回原空间，得到 PCA 的重构：' },
              { type: 'formula', tex: '\\[\\hat X=ZU_k^\\top=X_cU_kU_k^\\top.\\]' },
              { type: 'p', text: 'SVD 视角下，若' },
              { type: 'formula', tex: '\\[X_c=U\\Sigma V^\\top,\\]' },
              { type: 'p', text: '那么 PCA 主方向就是右奇异向量，也就是 \\(V\\) 的列向量。截断 SVD 则给出最佳低秩近似。' }
            ],
            idea: 'PCA 的推理链是：中心化数据 → 协方差矩阵 → 方向方差 uᵀSu → 最大方差方向 → 特征向量 → 主轴矩阵 → 投影坐标。它不是凭感觉选轴，而是在所有单位方向里最大化投影方差。',
            example: [
              { type: 'p', text: '想象一批二维样本大致沿着直线 \\(y=x\\) 拉长分布。此时数据在 \\((1,1)\\) 方向上的变化最大，在垂直方向 \\((1,-1)\\) 上的变化很小。' },
              { type: 'formula', tex: '\\[v_1=\\frac1{\\sqrt2}\\begin{pmatrix}1\\\\1\\end{pmatrix},\\qquad v_2=\\frac1{\\sqrt2}\\begin{pmatrix}1\\\\-1\\end{pmatrix}.\\]' },
              { type: 'p', text: '如果只保留一维，PCA 会选择 \\(v_1\\) 作为主方向。每个样本 \\(x\\) 的一维坐标就是它在 \\(v_1\\) 上的投影：' },
              { type: 'formula', tex: '\\[z=x^\\top v_1.\\]' },
              { type: 'p', text: '重构时再把这个一维坐标放回原空间：' },
              { type: 'formula', tex: '\\[\\hat x=zv_1.\\]' },
              { type: 'p', text: '所以 PCA 的直觉是：把斜着的长椭圆换一组坐标轴，然后保留最长的那根轴。' }
            ],
            applications: ['降维', '去噪', '可视化前处理', '聚类前表示诊断', 'whitening 的前置步骤'],
            next: ['Whitening', '聚类前表示']
          }
        },
        {
          name: 'Whitening',
          parent: '聚类前表示',
          href: '/notes/note-ml-unsup-1-pca-whitening/#5-whitening把椭圆压成圆',
          title: 'Whitening：把椭圆压成圆',
          summary: 'Whitening 可以理解成 PCA 后多除一步标准差，让每个主方向的方差都变成 1。',
          intro:
            '<p>先用 PCA 转到主轴坐标，再把每个主轴坐标除以自己的标准差。直觉上就是把长椭圆压成圆。</p>',
          detail: {
            lead: 'Whitening 先别想复杂：PCA 已经把坐标轴旋到主方向上，Whitening 只是在这些 PCA 坐标上再做一次标准化，也就是每一列除以自己的标准差。',
            prereq: ['PCA', '协方差矩阵', '范数', '正交', '特征分解', '正定 / 半正定'],
            main: [
              { type: 'p', text: '一维标准化是先减均值，再除以标准差：' },
              { type: 'formula', tex: '\\[z=\\frac{x-\\mu}{\\sigma}.\\]' },
              { type: 'p', text: 'PCA 已经负责把多维数据旋转到互相正交的主方向。若第 \\(i\\) 个主方向的方差是 \\(\\lambda_i\\)，标准差就是 \\(\\sqrt{\\lambda_i}\\)。' },
              { type: 'p', text: '所以 whitening 只是把 PCA 坐标 \\(y_i\\) 再除以对应标准差：' },
              { type: 'formula', tex: '\\[z_i=\\frac{y_i}{\\sqrt{\\lambda_i}}.\\]' },
              { type: 'p', text: '把所有方向合起来写，若 \\(\\Sigma=V\\Lambda V^\\top\\)，PCA 坐标是 \\(y=V^\\top x\\)，白化坐标就是：' },
              { type: 'formula', tex: '\\[z=\\Lambda^{-1/2}V^\\top x.\\]' },
              { type: 'p', text: '白化后，每个主方向的方差都被归一化为 1：' },
              { type: 'formula', tex: '\\[\\operatorname{Cov}(z)=I.\\]' },
              { type: 'p', text: '实际计算时，如果某个方向方差太小，直接除会放大噪声，所以常在分母里加一个很小的稳定项：' },
              { type: 'formula', tex: '\\[\\Lambda^{-1/2}\\quad\\leadsto\\quad(\\Lambda+\\varepsilon I)^{-1/2}.\\]' }
            ],
            idea: 'Whitening 的核心就是“逐方向除以标准差”。PCA 解决方向相关，Whitening 解决尺度不一致：原来长轴方向变化太大，会主导欧氏距离；除以标准差后，各主方向在距离里变得更可比。',
            example: [
              { type: 'p', text: '想象二维数据像一个横向拉长的椭圆：第一主方向方差是 \\(9\\)，第二主方向方差是 \\(1\\)。' },
              { type: 'formula', tex: '\\[\\Lambda=\\begin{pmatrix}9&0\\\\0&1\\end{pmatrix}.\\]' },
              { type: 'p', text: '第一主方向的标准差是 \\(3\\)，第二主方向的标准差是 \\(1\\)。Whitening 就是第一维除以 \\(3\\)，第二维除以 \\(1\\)：' },
              { type: 'formula', tex: '\\[\\Lambda^{-1/2}=\\begin{pmatrix}1/3&0\\\\0&1\\end{pmatrix}.\\]' },
              { type: 'p', text: '于是原来的长椭圆被压成接近圆形。之后再用欧氏距离时，横向大方差不会自动获得更高权重。' }
            ],
            applications: ['聚类前距离尺度校正', 'embedding 各向异性缓解', 'PCA 后处理', '可视化前预处理'],
            next: ['t-SNE', 'UMAP', '聚类前表示']
          }
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
    }
);
