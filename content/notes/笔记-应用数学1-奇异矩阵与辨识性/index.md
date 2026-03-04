---
date: '2026-03-04T21:00:00+09:00'
draft: false
title: '应用数学 Part 1：奇异矩阵与参数辨识性'
summary: "从奇异矩阵出发，串联信息丢失、维度下降导致的不可辨识性，并给出 FIM、剖面似然与敏感性分析的实用诊断框架。"
description: "A practical note linking singular matrices, information loss, identifiability, FIM, profile likelihood, and sensitivity analysis."
tags: ["Applied Mathematics", "Singular Matrix", "Identifiability", "FIM", "Profile Likelihood", "Sensitivity Analysis", "Inverse Problem"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-数学-奇异矩阵与辨识性/
---

# 应用数学 Part 1：奇异矩阵与参数辨识性

这篇主线是：  
奇异矩阵并不只是“算不出逆”，它在参数估计里对应的是“信息有缺口”，最终表现为参数不可辨识。  

---

## 1. 奇异矩阵：定义与直觉

对方阵 $A\in\mathbb{R}^{n\times n}$，以下条件等价：  
1. $\det(A)=0$。  
2. $\mathrm{rank}(A)\lt n$。  
3. 存在非零向量 $v$ 使得 $Av=0$（非平凡零空间）。  
4. $A^{-1}$ 不存在。

一个 $3\times3$ 的例子：  

$$
A=
\begin{bmatrix}
1 & 2 & 3\\
2 & 4 & 6\\
1 & 1 & 1
\end{bmatrix}
$$

这里第 2 行是第 1 行的 2 倍，因此行向量线性相关，$\mathrm{rank}(A)=2\lt 3$，且 $\det(A)=0$，所以 $A$ 是奇异矩阵。  

几何上，它表示至少一个方向被压扁，信息维度丢失。  

---

## 2. 可辨识性判断

可辨识性判断的核心问题是：参数变化是否会在观测上产生可区分的响应。  

常见分两类：
1. 结构不可辨识（structural）：理论上就无法区分（模型结构导致）。  
2. 实际不可辨识（practical）：理论可辨识，但数据噪声、激励不足、采样范围有限导致估计不稳定。

### 2.1 海森矩阵（Hessian）：局部曲率视角

海森矩阵的本质：它是二阶项系数矩阵，控制局部曲面弯曲形状。  

其在二阶泰勒展开中出现为：

$$
f(\theta)\approx f(\theta_0)+\nabla f(\theta_0)^\top(\theta-\theta_0)+\frac12(\theta-\theta_0)^\top H(\theta_0)(\theta-\theta_0)
$$

所以，对标量函数 $f(\theta)$，海森矩阵定义为二阶偏导矩阵：

$$
H(\theta)=\nabla_\theta^2 f(\theta),\qquad
H_{ij}=\frac{\partial^2 f}{\partial\theta_i\partial\theta_j}
$$

二维情形可写成：

$$
H=
\begin{bmatrix}
\frac{\partial^2 f}{\partial x^2} & \frac{\partial^2 f}{\partial x\partial y}\\
\frac{\partial^2 f}{\partial y\partial x} & \frac{\partial^2 f}{\partial y^2}
\end{bmatrix}
$$

沿方向向量 $v$ 的方向曲率常写作：

$$
\kappa_v=v^\top H v
$$

若使用单位向量（$\|v\|=1$），它直接给出该方向的二次曲率大小。  

特征值可理解为主曲率（在特征向量方向上）：
1. 特征值大：曲率大，局部变化陡。  
2. 特征值小：曲率小，局部更平坦。  
3. 特征值为 0（或近 0）：存在平坦方向，海森矩阵奇异（或近奇异），对应弱可辨识方向。

### 2.2 FIM（Fisher Information Matrix）：信息几何视角

在高斯噪声近似下，Fisher 信息矩阵常写作：

$$
F(\theta)=J(\theta)^\top \Sigma^{-1}J(\theta)
$$

其中 $\Sigma$ 是观测噪声协方差。  

在最小二乘情形，海森矩阵常用 Gauss-Newton 近似：

$$
H(\theta)\approx J(\theta)^\top \Sigma^{-1}J(\theta)=F(\theta)
$$

因此 FIM 可理解为“海森矩阵的信息版本”，两者都在刻画局部曲率与可辨识方向。  

判断要点：

1. 若 $F$ 奇异或病态（条件数很大），说明存在弱可辨识方向。  
2. $F^{-1}$（若存在）给出参数协方差近似；对角线大表示该参数不确定性高。  
3. 很小特征值对应“信息薄弱方向”。

### 2.3 剖面似然（Profile Likelihood）：参数级诊断

固定目标参数 $\theta_i$，对其余参数做最优化，定义剖面似然：

$$
\mathrm{PL}(\theta_i)=\min_{\theta_{-i}}\ \mathcal{L}(\theta_i,\theta_{-i})
$$

若曲线在较大区间内近乎平坦，说明该参数辨识弱或不可辨识。  

与 FIM 的关系：  
FIM 给的是最优点附近的局部二阶近似；剖面似然给的是沿参数轴的非线性全局形状。两者结合更稳健。

### 2.4 敏感性分析：解释“谁在驱动输出”

#### 2.4.1 局部敏感性

用归一化灵敏度系数：

$$
S_{ij}=\frac{\partial y_i}{\partial\theta_j}\cdot\frac{\theta_j}{y_i}
$$

$|S_{ij}|$ 小表示该输出对该参数不敏感，通常更难辨识。  

#### 2.4.2 全局敏感性

可用 Morris 或 Sobol 方法评估参数在全参数空间内的影响强度与交互作用。  

若某参数在全局上贡献持续很低，通常不值得高成本精估。  