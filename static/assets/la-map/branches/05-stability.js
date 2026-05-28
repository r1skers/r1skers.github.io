window.LA_MAP_REGISTER_BRANCH(
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
    }
);
