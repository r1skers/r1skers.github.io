---
date: '2026-03-04T21:00:00+09:00'
draft: false
title: '应用数学 Part 1：奇异矩阵与参数辨识性 / Applied Mathematics Part 1: Singular Matrices and Identifiability'
summary: "从奇异矩阵出发，串联信息丢失、维度下降导致的不可辨识性，并给出 FIM、剖面似然与敏感性分析的实用诊断框架。"
description: "A practical note linking singular matrices, information loss, identifiability, FIM, profile likelihood, and sensitivity analysis."
tags: ["Applied Mathematics", "Singular Matrix", "Identifiability", "FIM", "Profile Likelihood", "Sensitivity Analysis", "Inverse Problem"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-数学-奇异矩阵与辨识性/
---

# 应用数学 Part 1：奇异矩阵与参数辨识性
# Applied Mathematics Part 1: Singular Matrices and Identifiability

这篇主线是：  
奇异矩阵并不只是“算不出逆”，它在参数估计里对应的是“信息有缺口”，最终表现为参数不可辨识。  
This note follows one chain: a singular matrix is not only "non-invertible"; in parameter estimation, it means information gaps and eventually unidentifiability.

---

## 1. 奇异矩阵：定义与直觉
## 1. Singular Matrix: Definition and Intuition

对方阵 $A\in\mathbb{R}^{n\times n}$，以下条件等价：  
For a square matrix $A\in\mathbb{R}^{n\times n}$, the following are equivalent:

中文：
1. $\det(A)=0$。  
2. $\mathrm{rank}(A)\lt n$。  
3. 存在非零向量 $v$ 使得 $Av=0$（非平凡零空间）。  
4. $A^{-1}$ 不存在。

English:
1. $\det(A)=0$.  
2. $\mathrm{rank}(A)\lt n$.  
3. There exists nonzero $v$ such that $Av=0$ (nontrivial null space).  
4. $A^{-1}$ does not exist.

一个 $3\times3$ 的例子：  
A concrete $3\times3$ example:

$$
A=
\begin{bmatrix}
1 & 2 & 3\\
2 & 4 & 6\\
1 & 1 & 1
\end{bmatrix}
$$

这里第 2 行是第 1 行的 2 倍，因此行向量线性相关，$\mathrm{rank}(A)=2<3$，且 $\det(A)=0$，所以 $A$ 是奇异矩阵。  
Row 2 is twice row 1, so rows are linearly dependent; hence $\mathrm{rank}(A)=2<3$ and $\det(A)=0$, so $A$ is singular.

几何上，它表示至少一个方向被压扁，信息维度丢失。  
Geometrically, at least one direction is flattened, so information dimension is lost.

---

## 2. 海森矩阵：定义、方向曲率与本质
## 2. Hessian Matrix: Definition, Directional Curvature, and Essence

海森矩阵的本质：它是二阶项系数矩阵，控制局部曲面弯曲形状。  
Essence: the Hessian is the second-order coefficient matrix controlling local curvature geometry.

其在二阶泰勒展开中出现为：
It appears in the second-order Taylor expansion:

$$
f(\theta)\approx f(\theta_0)+\nabla f(\theta_0)^\top(\theta-\theta_0)+\frac12(\theta-\theta_0)^\top H(\theta_0)(\theta-\theta_0)
$$

所以，对标量函数 $f(\theta)$，海森矩阵定义为二阶偏导矩阵：
So, for a scalar function $f(\theta)$, the Hessian is defined as the matrix of second partial derivatives:

$$
H(\theta)=\nabla_\theta^2 f(\theta),\qquad
H_{ij}=\frac{\partial^2 f}{\partial\theta_i\partial\theta_j}
$$

二维情形可写成：
In 2D, it is written as:

$$
H=
\begin{bmatrix}
\frac{\partial^2 f}{\partial x^2} & \frac{\partial^2 f}{\partial x\partial y}\\
\frac{\partial^2 f}{\partial y\partial x} & \frac{\partial^2 f}{\partial y^2}
\end{bmatrix}
$$

沿方向向量 $v$ 的方向曲率常写作：
Directional curvature along vector $v$ is commonly written as:

$$
\kappa_v=v^\top H v
$$

若使用单位向量（$\|v\|=1$），它直接给出该方向的二次曲率大小。  
With unit vectors, it directly measures second-order curvature along that direction.

特征值可理解为主曲率（在特征向量方向上）：
Eigenvalues can be interpreted as principal curvatures (along eigenvector directions):

中文：
1. 特征值大：曲率大，局部变化陡。  
2. 特征值小：曲率小，局部更平坦。  
3. 特征值为 0（或近 0）：存在平坦方向，海森矩阵奇异（或近奇异），对应弱可辨识方向。

English:
1. Large eigenvalue: large curvature and steeper local geometry.  
2. Small eigenvalue: weak curvature and flatter local geometry.  
3. Zero (or near-zero) eigenvalue: flat direction exists, implying singular (or near-singular) Hessian and weak identifiability.

## 3. 不可辨识性：结构性 vs 实际性
## 3. Unidentifiability: Structural vs Practical

1. 结构不可辨识（structural）：理论上就无法区分（模型结构导致）。  
2. 实际不可辨识（practical）：理论可辨识，但数据噪声、激励不足、采样范围有限导致估计不稳定。

1. Structural unidentifiability: impossible even with perfect data (model structure issue).  
2. Practical unidentifiability: theoretically identifiable, but unstable under realistic data/noise/experiment limits.

---

## 4. FIM：局部信息几何
## 4. FIM: Local Information Geometry

在高斯噪声近似下，Fisher 信息矩阵常写作：

$$
F(\theta)=J(\theta)^\top \Sigma^{-1}J(\theta)
$$

其中 $\Sigma$ 是观测噪声协方差。  
where $\Sigma$ is the noise covariance matrix.

在最小二乘情形，海森矩阵常用 Gauss-Newton 近似：

$$
H(\theta)\approx J(\theta)^\top \Sigma^{-1}J(\theta)=F(\theta)
$$

因此 FIM 可理解为“海森矩阵的信息版本”，两者都在刻画局部曲率与可辨识方向。  
In least-squares settings, the Hessian is often approximated by Gauss-Newton, so FIM can be viewed as the information-form Hessian; both describe local curvature and identifiable directions.

判断要点：

1. 若 $F$ 奇异或病态（条件数很大），说明存在弱可辨识方向。  
2. $F^{-1}$（若存在）给出参数协方差近似；对角线大表示该参数不确定性高。  
3. 很小特征值对应“信息薄弱方向”。

1. If $F$ is singular or ill-conditioned (large condition number), weakly identifiable directions exist.  
2. $F^{-1}$ (if it exists) approximates parameter covariance; large diagonal values imply high uncertainty.  
3. Small eigenvalues indicate low-information directions.

---

## 5. 剖面似然：从“方向”到“参数级”诊断
## 5. Profile Likelihood: Parameter-Level Diagnosis

固定目标参数 $\theta_i$，对其余参数做最优化，定义剖面似然：

$$
\mathrm{PL}(\theta_i)=\min_{\theta_{-i}}\ \mathcal{L}(\theta_i,\theta_{-i})
$$

若曲线在较大区间内近乎平坦，说明该参数辨识弱或不可辨识。  
If the profile is flat over a wide interval, that parameter is weakly identifiable or unidentifiable.

与 FIM 的关系：  
FIM gives local quadratic approximation near optimum; profile likelihood shows nonlinear/global behavior around that parameter.

---

## 6. 敏感性分析：解释“谁在驱动输出”
## 6. Sensitivity Analysis: Who Drives the Output

### 6.1 局部敏感性
### 6.1 Local Sensitivity

可用归一化灵敏度系数：

$$
S_{ij}=\frac{\partial y_i}{\partial\theta_j}\cdot\frac{\theta_j}{y_i}
$$

$|S_{ij}|$ 小表示该输出对该参数不敏感，通常更难辨识。  
Small $|S_{ij}|$ means weak output response to that parameter, often implying harder identification.

### 6.2 全局敏感性
### 6.2 Global Sensitivity

可用 Morris / Sobol 等方法评估参数在全域不确定性中的贡献。  
Morris/Sobol-type methods assess parameter contribution across global uncertainty space.

若某参数在全局上贡献持续很低，通常不值得高成本精估。  
If a parameter has persistently low global contribution, high-cost precise estimation is usually unnecessary.

---

## 7. 实用工作流（建议）
## 7. Practical Workflow (Suggested)

1. 先看敏感性：排除几乎无影响参数。  
2. 再看 FIM：找秩亏/病态与高相关方向。  
3. 对关键参数做剖面似然：确认可辨识区间与不确定性。  
4. 若不可辨识：改实验设计、改激励、增可观测量或重参数化。

1. Start with sensitivity: remove nearly inactive parameters.  
2. Then inspect FIM: detect rank deficiency, ill-conditioning, and correlated directions.  
3. Use profile likelihood on key parameters: confirm identifiable ranges and uncertainty.  
4. If still unidentifiable: redesign experiment, enrich excitation, add observables, or reparameterize.

---

## 8. 小结
## 8. Summary

奇异矩阵在辨识问题里的真正含义是“信息维度塌缩”。  
The true meaning of singularity in identification is information-dimension collapse.

FIM 提供局部几何诊断，剖面似然提供参数级非线性证据，敏感性分析提供实验与建模优先级。  
FIM gives local geometric diagnosis, profile likelihood gives parameter-level nonlinear evidence, and sensitivity analysis sets experiment/modeling priorities.

三者结合，才能把“能不能估”与“值不值得估”分开讲清楚。  
Only by combining all three can we clearly separate "estimable" from "worth estimating precisely."
