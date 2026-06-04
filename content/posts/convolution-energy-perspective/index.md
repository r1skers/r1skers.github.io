---
date: '2026-06-04T15:00:00+09:00'
draft: true
title: "卷积的能量视角：维纳滤波是 Fourier 基下的 Ridge"
summary: "把卷积放到 Ax=b 能量地图的延长线上：卷积算子的能量基永远是 Fourier，$\\sigma_k$ 是频率响应的幅度，Wiener 滤波就是 Fourier 基下的 Ridge。"
description: "从平移不变性出发，看清卷积算子的能量基为什么固定成 Fourier 基，并把上一篇 Ax=b 的能量视角直接对位到滤波、反卷积、Wiener、Landweber 这一族信号处理操作上。"
tags: ["Linear Algebra", "Convolution", "Fourier Transform", "Signal Processing", "Wiener Filter", "Deconvolution", "Energy", "Engineering Perspective"]
categories: ["Posts"]
---

# 起点

<!-- TODO: 接 Ax=b 那篇的姊妹篇钩子；点出"卷积算子的能量基不依赖 h，永远是 Fourier" 这件惊人的事 -->

# 一、卷积是什么：两种本质等价的直觉

## 1.1 滑动印章 / 模板匹配

<!-- 核心直觉：每个输出点是输入信号在邻域内的加权观感；等价读法是"在每个位置做内积" = 模板匹配 / matched filter -->

## 1.2 脉冲响应叠加：Green 函数视角

<!-- 核心直觉：每个输入点激发系统一个 h 形状的响应，所有响应叠加成输出；这是 LTI 脉冲响应、光学 PSF、热核、静电势的统一形式 -->

# 二、复指数：卷积唯一的"不变形音符"

<!-- 核心直觉：平移不变 + 线性 ⇒ e^{iωt} 是任何卷积算子的特征向量，与 h 长什么样无关 -->

# 三、Fourier 基：卷积算子的能量坐标

<!-- 核心直觉：接 Ax=b 那篇——能量基不再依赖具体矩阵，固定成宇宙通用的 Fourier 基；σ_k = |ĥ_k| 是频率响应的幅度；Parseval 是时频能量守恒的精确陈述 -->

# 四、滤波 = 在频率轴上挑哪些 σ 保留

<!-- 核心直觉：低通 / 高通 / 带通 / 陷波都是"对频率 σ 不同保留策略"的不同口味 -->

# 五、反卷积：弱频率方向反向爆炸

<!-- 核心直觉：ĥ 在某些 ω 上接近 0 ⇒ 反向取倒数放大成噪声黑洞；这就是 Ax=b 篇求逆爆炸的频域版 -->

# 六、Wiener 滤波：Fourier 基下的 Ridge

<!-- 核心直觉：ĥ*/(|ĥ|² + λ) 字面就是 σ/(σ²+λ) 在 Fourier 基下的实例；带噪声假设的 Wiener 形式 -->

# 七、Landweber：卷积版梯度下降

<!-- 核心直觉：频率独立收敛；条件数 = max|ĥ| / min|ĥ|；和 Ax=b 篇 GD 的窄谷形成镜像 -->

# 八、FFT：把这一切压成 O(N log N)

<!-- 核心直觉：卷积是"特殊优秀生"——能量基永远是 Fourier，所以一整套静态/动态操作都能 FFT 加速 -->

# 合幕

<!-- 把 8 节穿成一段；和 Ax=b 那篇 + Born 规则那篇形成"能量视角"系列 -->
