window.LA_MAP_REGISTER_BRANCH(
{
      name: '几何',
      angle: -90,
      leaves: [
        {
          name: '内积',
          href: '/notes/note-la-1-inner-product-projection/#2-内积',
          title: '内积：给向量空间装上几何传感器',
          intro: '<p>内积把两个向量送到一个数，从而定义长度、角度、正交和投影。</p>'
        },
        {
          name: '范数',
          href: '/notes/note-la-1-inner-product-projection/#3-范数',
          title: '范数：由内积诱导的长度',
          intro: '<p>范数衡量向量大小。本篇主要使用二范数，因为正交投影、最小二乘和 PCA 的基本几何都建立在二范数上。</p>'
        },
        {
          name: '正交',
          href: '/notes/note-la-1-inner-product-projection/#5-正交',
          title: '正交：误差分解的关键条件',
          intro: '<p>正交意味着内积为零。它让平方范数可以按 Pythagoras 干净分解，是投影和最小二乘的核心。</p>'
        },
        {
          name: '正交投影',
          href: '/notes/note-la-1-inner-product-projection/#7-正交投影',
          title: '正交投影：子空间里的最近点',
          intro: '<p>正交投影把向量分成子空间内的可表示部分和垂直于子空间的残差。</p>'
        },
        {
          name: '四基本子空间',
          href: '/notes/note-la-1-inner-product-projection/#6-正交补与四基本子空间',
          title: '四基本子空间：列空间、零空间与正交补',
          intro: '<p>列空间、左零空间、行空间和零空间成对正交，解释了 Ax=b 的可解性和最小二乘。</p>'
        },
        '二次型',
        {
          name: '距离 / 角度',
          href: '/notes/note-la-1-inner-product-projection/#4-距离与角度',
          title: '距离与角度：从范数和内积读几何',
          intro: '<p>距离来自范数，角度来自内积。cosine similarity 也是这一节的直接产物。</p>'
        }
      ]
    }
);
