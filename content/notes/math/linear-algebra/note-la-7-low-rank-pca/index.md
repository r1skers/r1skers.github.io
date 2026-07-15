---
date: '2026-07-15T14:45:00+09:00'
draft: false
title: '线性代数 Part 7：低秩近似、PCA 与结构化近似'
summary: "从截断 SVD 出发证明 Eckart–Young–Mirsky 定理，再把同一最优子空间解释为 PCA；随后给出 randomized range finder、Nyström、NMF 与稀疏近似的严格定义、核心结论和边界。"
description: "有限维矩阵近似笔记：Eckart–Young–Mirsky 定理及证明、PCA 的最大方差和最小重构误差等价性、whitening、随机化低秩近似、Nyström、非负矩阵分解、稀疏表示、spark 与 mutual coherence。"
tags: ["Linear Algebra", "Low Rank Approximation", "Eckart-Young", "PCA", "Whitening", "Randomized SVD", "Nystrom", "NMF", "Sparse Approximation", "Proof"]
categories: ["Crucible"]
math: true
---

# 线性代数 Part 7：低秩近似、PCA 与结构化近似

> [Part 6](/notes/math/linear-algebra/note-la-6-matrix-factorizations/) 把任意矩阵写成奇异方向之和。本篇开始允许丢失信息：给定秩预算 $k$，怎样保留最重要的方向？截断 SVD 给出精确答案，PCA 是这一答案施加到中心化数据上的统计解释。随机化方法、Nyström、NMF 与稀疏近似则分别改变“怎样计算”或“允许什么结构”。

仍设 $A\in\mathbb F^{m\times n}$，底域为 $\mathbb R$ 或 $\mathbb C$，且

$$
A=U\Sigma V^*
=\sum_{i=1}^r\sigma_i u_i v_i^*,
$$

其中

$$
\sigma_1\ge\sigma_2\ge\cdots\ge\sigma_r>0.
$$

本篇严格区分四类结构：

$$
\text{低秩：少数方向},
$$

$$
\text{稀疏：少数坐标},
$$

$$
\text{非负：禁止符号抵消},
$$

$$
\text{随机化：用概率换计算规模}.
$$

它们可以组合，但互不等价。

---

## 1. 两个近似范数与秩预算

矩阵的谱范数定义为

$$
\|A\|_2
=\max_{\|x\|_2=1}\|Ax\|_2
=\sigma_1(A).
$$

它度量最坏方向上的最大放大。

Frobenius 范数定义为

$$
\|A\|_F
=\left(\sum_{i,j}|a_{ij}|^2\right)^{1/2}
=\left(\sum_i\sigma_i(A)^2\right)^{1/2}.
$$

它度量所有方向或所有元素的总平方误差。

给定 $k\lt r$，低秩近似问题是

$$
\min_{\operatorname{rank}(B)\le k}\|A-B\|.
$$

候选集合不是线性子空间：两个秩不超过 $k$ 的矩阵相加，秩可以达到 $2k$。因此这不是普通的正交投影问题；SVD 的作用正是为这个非线性集合找出全局最优点。

定义截断 SVD

$$
A_k
=\sum_{i=1}^k\sigma_i u_i v_i^*.
$$

---

## 2. Eckart–Young–Mirsky 定理

**定理**：对任意 $0\le k\lt r$，截断 SVD 同时满足

$$
\min_{\operatorname{rank}(B)\le k}
\|A-B\|_2
=\|A-A_k\|_2
=\sigma_{k+1},
$$

以及

$$
\min_{\operatorname{rank}(B)\le k}
\|A-B\|_F
=\|A-A_k\|_F
=\left(\sum_{i>k}\sigma_i^2\right)^{1/2}.
$$

### 2.1 谱范数部分的证明

先算截断误差：

$$
A-A_k
=\sum_{i>k}\sigma_i u_i v_i^*,
$$

所以

$$
\|A-A_k\|_2=\sigma_{k+1}.
$$

下面证明任何秩不超过 $k$ 的 $B$ 都不可能更好。考虑子空间

$$
S=\operatorname{span}\{v_1,\ldots,v_{k+1}\}.
$$

它的维数为 $k+1$。因为 $\operatorname{rank}(B)\le k$，

$$
\dim\ker(B)\ge n-k.
$$

由维数公式，$S\cap\ker(B)$ 至少一维。取其中单位向量 $x$。于是 $Bx=0$，且

$$
\|(A-B)x\|_2=\|Ax\|_2.
$$

把 $x$ 写成 $x=\sum_{i=1}^{k+1}c_iv_i$，则

$$
\|Ax\|_2^2
=\sum_{i=1}^{k+1}\sigma_i^2|c_i|^2
\ge\sigma_{k+1}^2\sum_{i=1}^{k+1}|c_i|^2
=\sigma_{k+1}^2.
$$

因此

$$
\|A-B\|_2
\ge\|(A-B)x\|_2
\ge\sigma_{k+1}.
$$

$A_k$ 达到这个下界，谱范数部分得证。

### 2.2 Frobenius 范数部分的证明

任取 $\operatorname{rank}(B)\le k$，令 $P$ 为到 $\operatorname{range}(B)$ 的正交投影。因为 $(I-P)B=0$，有正交分解

$$
A-B=(I-P)A+(PA-B).
$$

第一项的列落在 $\operatorname{range}(P)^\perp$，第二项的列落在 $\operatorname{range}(P)$，因此 Frobenius 内积为零，

$$
\|A-B\|_F^2
=\|(I-P)A\|_F^2+\|PA-B\|_F^2
\ge\|(I-P)A\|_F^2.
$$

再由 SVD，

$$
\|PA\|_F^2
=\sum_{i=1}^r\sigma_i^2\|Pu_i\|_2^2.
$$

记 $\alpha_i=\|Pu_i\|_2^2$。它们满足

$$
0\le\alpha_i\le1,
\qquad
\sum_{i=1}^r\alpha_i\le\operatorname{rank}(P)\le k.
$$

因为 $\sigma_i^2$ 已按降序排列，在这些约束下加权和最大值由前 $k$ 个 $\alpha_i=1$、其余为零取得，所以

$$
\|PA\|_F^2
\le\sum_{i=1}^k\sigma_i^2.
$$

因此

$$
\|(I-P)A\|_F^2
=\|A\|_F^2-\|PA\|_F^2
\ge\sum_{i>k}\sigma_i^2.
$$

结合前面的不等式，

$$
\|A-B\|_F^2
\ge\sum_{i>k}\sigma_i^2.
$$

而 $A_k$ 恰好达到等号，Frobenius 部分得证。

当 $1\le k\lt r$ 时，如果

$$
\sigma_k>\sigma_{k+1},
$$

则最优 $k$ 维左右奇异子空间被谱间隙唯一确定，因此 Frobenius 范数下的最优秩 $k$ 近似唯一。没有谱间隙时，边界重奇异值对应的子空间可以旋转，最优解一般不唯一。$k=0$ 时可行集合只有零矩阵，最优解显然唯一。

---

## 3. PCA：最大方差与最小重构误差是同一问题

设 $n$ 个实样本作为行组成数据矩阵 $X\in\mathbb R^{n\times d}$。令

$$
X_c=X-\mathbf1\overline x^{\mathsf T}
$$

为中心化矩阵，并定义经验协方差

$$
S=\frac1nX_c^{\mathsf T}X_c.
$$

由 Part 5，$S$ 对称半正定。设

$$
S=V\Lambda V^{\mathsf T},
\qquad
\lambda_1\ge\cdots\ge\lambda_d\ge0.
$$

### 3.1 第一主成分

对单位方向 $v$，投影坐标为 $X_cv$，其经验方差为

$$
\frac1n\|X_cv\|_2^2
=v^{\mathsf T}Sv.
$$

**定义**：第一主方向是约束问题

$$
\max_{\|v\|_2=1}v^{\mathsf T}Sv
$$

的解。

由 Rayleigh 极值原理，最大值为 $\lambda_1$，解是最大特征值对应的单位特征向量 $v_1$。

### 3.2 前 $k$ 个主方向

令 $W\in\mathbb R^{d\times k}$ 满足 $W^{\mathsf T}W=I_k$。投影后的总方差为

$$
\frac1n\|X_cW\|_F^2
=\operatorname{tr}(W^{\mathsf T}SW).
$$

**定理（Ky Fan 极值形式）**：

$$
\max_{W^{\mathsf T}W=I_k}
\operatorname{tr}(W^{\mathsf T}SW)
=\sum_{i=1}^k\lambda_i.
$$

最大值由

$$
W=V_k=(v_1,\ldots,v_k)
$$

取得。

**证明**：令 $C=V^{\mathsf T}W$，则 $C^{\mathsf T}C=I_k$。记 $c_i^{\mathsf T}$ 为 $C$ 的第 $i$ 行，则

$$
\operatorname{tr}(W^{\mathsf T}SW)
=\operatorname{tr}(C^{\mathsf T}\Lambda C)
=\sum_{i=1}^d\lambda_i\|c_i\|_2^2.
$$

权重 $\alpha_i=\|c_i\|_2^2$ 满足

$$
0\le\alpha_i\le1,
\qquad
\sum_i\alpha_i=k.
$$

因为 $\lambda_i$ 降序，最大加权和为前 $k$ 个权重取 $1$。取 $W=V_k$ 达到该值。证毕。

### 3.3 最小重构误差

把数据投到 $\operatorname{range}(W)$ 再投回原空间，重构为

$$
\widehat X_c=X_cWW^{\mathsf T}.
$$

误差满足

$$
\|X_c-X_cWW^{\mathsf T}\|_F^2
=\|X_c\|_F^2-\|X_cW\|_F^2.
$$

因此最小化重构误差等价于最大化投影总方差：

$$
\min_{W^{\mathsf T}W=I_k}
\|X_c-X_cWW^{\mathsf T}\|_F^2
$$

与

$$
\max_{W^{\mathsf T}W=I_k}
\operatorname{tr}(W^{\mathsf T}SW)
$$

有同一个解 $W=V_k$。

若

$$
X_c=U\Sigma V^{\mathsf T},
$$

则

$$
S=V\frac{\Sigma^{\mathsf T}\Sigma}{n}V^{\mathsf T},
\qquad
\lambda_i=\frac{\sigma_i(X_c)^2}{n}.
$$

所以 PCA 主方向就是 $X_c$ 的右奇异向量，且

$$
X_cV_kV_k^{\mathsf T}
=U_k\Sigma_kV_k^{\mathsf T}
=(X_c)_k.
$$

PCA 的最小重构误差结论正是 Eckart–Young–Mirsky 定理作用于中心化数据矩阵。

---

## 4. Whitening：在可观测子空间上统一尺度

设随机向量或中心化数据的协方差为

$$
S=V\Lambda V^{\mathsf T}.
$$

若 $S\succ0$，定义 PCA whitening 变换

$$
z=\Lambda^{-1/2}V^{\mathsf T}x.
$$

则

$$
\operatorname{Cov}(z)
=\Lambda^{-1/2}V^{\mathsf T}SV\Lambda^{-1/2}
=I.
$$

这是一条精确恒等式：先旋转到协方差特征基，再把第 $i$ 个方向除以标准差 $\sqrt{\lambda_i}$。

若 $S$ 只有秩 $r\lt d$，零特征值方向无法被求逆。此时有两种不同操作：

1. 只在 $\operatorname{range}(S)$ 上使用 $\Lambda_r^{-1/2}V_r^{\mathsf T}$，得到 $r$ 维精确白化；
2. 使用

$$
(\Lambda+\varepsilon I)^{-1/2}V^{\mathsf T},
$$

得到正则化的尺度校正，但协方差不再严格等于 $I$。

PCA 与 whitening 的机器学习使用、预处理选择和聚类接口由 [无监督表征 Part 1：PCA 与 Whitening](/notes/ml/unsupervised-representation/note-ml-unsup-1-pca-whitening/) 承接；本篇只保留它们的线性代数定理。

---

## 5. Randomized range finder：先随机找到主列空间

完整 SVD 可能比所需信息更昂贵。若目标只是一份秩 $k$ 近似，可以先近似 $A$ 的主要列空间。

本节为使用标准实 Gaussian 旋转不变性，将矩阵限定为 $A\in\mathbb R^{m\times n}$；复数版本需要相应的复 Gaussian 测试矩阵与同型矩估计。

给定目标秩 $k\ge2$ 与 oversampling 参数 $p\ge2$，并假设

$$
\ell=k+p\le\min(m,n).
$$

并取随机矩阵

$$
\Omega\in\mathbb R^{n\times\ell},
$$

其元素独立服从标准高斯分布。构造

$$
Y=A\Omega,
$$

再令 $Q$ 的列为 $\operatorname{range}(Y)$ 的标准正交基。于是

$$
A\approx QQ^*A.
$$

最后只需对较小矩阵

$$
B=Q^*A
$$

做 SVD；若 $B=\widetilde U\Sigma V^*$，则

$$
A\approx(Q\widetilde U)\Sigma V^*.
$$

### 5.1 精确低秩情形

**命题**：若 $\operatorname{rank}(A)=s\le k$，且 $V_s^*\Omega$ 行满秩，则

$$
QQ^*A=A.
$$

**证明**：写 reduced SVD

$$
A=U_s\Sigma_sV_s^*.
$$

则

$$
Y=A\Omega
=U_s\Sigma_s(V_s^*\Omega).
$$

$\Sigma_s$ 可逆，而 $V_s^*\Omega$ 行满秩，所以

$$
\operatorname{range}(Y)=\operatorname{range}(U_s)=\operatorname{range}(A).
$$

$QQ^*$ 正是到该空间的正交投影，故 $QQ^*A=A$。证毕。

对高斯 $\Omega$，当 $\ell\ge s$ 时，$V_s^*\Omega$ 以概率 $1$ 行满秩。

### 5.2 近似低秩情形的误差结论

**标准定理（高斯 range finder 的期望谱误差，本文不证）**：按上面方法构造 $Q$，则

$$
\mathbb E\|A-QQ^*A\|_2
\le
\left(1+\sqrt{\frac{k}{p-1}}\right)\sigma_{k+1}
+\frac{e\sqrt{k+p}}{p}
\left(\sum_{j>k}\sigma_j^2\right)^{1/2}.
$$

这个结论属于 randomized numerical linear algebra，证明还依赖标准 Gaussian 矩阵的伪逆矩估计与条件期望界，超出本文已经建立的确定性线性代数，因此在这里明确作为外部定理使用而不展开证明。第一项由最佳秩 $k$ 误差 $\sigma_{k+1}$ 控制，第二项由尾部 Frobenius 能量控制。因此随机化并没有绕过谱尾部：当奇异值衰减快时，小量随机探测就足够；当尾部平坦时，需要更大 oversampling 或额外幂迭代。

幂迭代使用

$$
Y=(AA^*)^qA\Omega.
$$

若 $A=U\Sigma V^*$，则

$$
(AA^*)^qA
=U\Sigma^{2q+1}V^*.
$$

主奇异值与尾部奇异值的比值被提升到 $2q+1$ 次方，从而扩大谱间隙。代价是额外的矩阵乘法，以及实现时必须反复正交化以免数值上丢失较小方向。

---

## 6. Nyström：PSD 核矩阵的列采样近似

Nyström 不是任意矩阵的通用公式。它针对对称或 Hermitian PSD 矩阵

$$
K\in\mathbb F^{n\times n},
\qquad
K\succeq0.
$$

选取索引集合 $S\subset\{1,\ldots,n\}$，$|S|=m$，定义

$$
C=K_{:,S},
\qquad
W=K_{S,S}.
$$

Nyström 近似为

$$
\widetilde K=CW^\dagger C^*,
$$

其中 $W^\dagger$ 是 Moore–Penrose 伪逆。

### 6.1 近似仍保持 PSD

因为 $W\succeq0$，所以 $W^\dagger\succeq0$。于是对任意 $x$，

$$
x^*\widetilde Kx
=(C^*x)^*W^\dagger(C^*x)
\ge0.
$$

因此

$$
\widetilde K\succeq0,
\qquad
\operatorname{rank}(\widetilde K)\le m.
$$

### 6.2 何时精确恢复

**定理**：若 $K\succeq0$、$\operatorname{rank}(K)=r$，且被采样列张成 $\operatorname{range}(K)$，则

$$
K=CW^\dagger C^*.
$$

**证明**：写 Gram 因子分解

$$
K=XX^*,
\qquad
X\in\mathbb F^{n\times r}
$$

且 $X$ 满列秩。令 $X_S$ 为抽取 $S$ 中行得到的 $m\times r$ 矩阵，则

$$
C=XX_S^*,
\qquad
W=X_SX_S^*.
$$

采样列张成 $\operatorname{range}(K)$ 等价于 $X_S$ 满列秩。于是

$$
X_S^*(X_SX_S^*)^\dagger X_S=I_r,
$$

因为左边是到 $X_S$ 行空间的正交投影，而该行空间为整个 $\mathbb F^r$。所以

$$
CW^\dagger C^*
=XX_S^*(X_SX_S^*)^\dagger X_SX^*
=XX^*
=K.
$$

证毕。

近似情形的质量取决于采样是否覆盖主特征子空间。均匀采样在 leverage score 高度不均匀时可能漏掉关键方向；leverage score sampling 正是针对这一问题调整采样概率。

---

## 7. NMF：低秩之外再加非负锥约束

设数据矩阵逐元素非负：

$$
A\in\mathbb R_+^{m\times n}.
$$

给定内维 $k$，非负矩阵分解（NMF）求解

$$
\min_{W\ge0,\ H\ge0}
\frac12\|A-WH\|_F^2,
$$

其中

$$
W\in\mathbb R_+^{m\times k},
\qquad
H\in\mathbb R_+^{k\times n}.
$$

任何乘积 $WH$ 都满足

$$
\operatorname{rank}(WH)\le k,
$$

所以 NMF 是低秩近似加上逐元素非负约束。但它不再继承 SVD 的正交性与闭式最优解。

### 7.1 优化结构

固定 $H$ 时，目标关于 $W$ 是带非负约束的凸二次问题；固定 $W$ 时，目标关于 $H$ 也是凸二次问题。然而联合映射 $(W,H)\mapsto WH$ 是双线性的，因此问题对 $(W,H)$ 联合非凸。

此外，对任意正对角矩阵 $D$，

$$
WH=(WD)(D^{-1}H),
$$

且两个新因子仍非负。这说明即使乘积唯一，因子本身通常也至少存在缩放不唯一性。

NMF 的归属因此很清楚：它是一类带锥约束的非凸矩阵分解问题。线性代数负责秩与可表示性；算法收敛、初始化与语义解释属于优化和无监督学习，而不是谱定理的直接推论。相关机器学习路线见 [无监督表征路线图](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)。

---

## 8. 稀疏近似：少数坐标，而不是少数奇异方向

设字典

$$
D=(d_1,\ldots,d_p)\in\mathbb F^{m\times p}
$$

的列已归一化为 $\|d_j\|_2=1$。给定目标 $b\in\mathbb F^m$，严格稀疏表示问题可以写成

$$
\min_\alpha\|\alpha\|_0
\quad\text{subject to}\quad
D\alpha=b,
$$

其中 $\|\alpha\|_0$ 表示非零坐标个数；它不是范数。含噪版本常写成

$$
\min_{\|\alpha\|_0\le k}
\|D\alpha-b\|_2.
$$

### 8.1 spark 与稀疏表示唯一性

定义字典的 spark：

$$
\operatorname{spark}(D)
=\min\{|S|:D_S\text{ 的列线性相关}\}.
$$

如果 $D$ 的全部列线性无关，使得上面的集合为空，则约定

$$
\operatorname{spark}(D)=+\infty.
$$

**定理**：若 $b=D\alpha$ 且

$$
\|\alpha\|_0
\lt\frac{\operatorname{spark}(D)}2,
$$

则 $\alpha$ 是 $b$ 的唯一最稀疏表示。

**证明**：若另有 $D\beta=b$ 且 $\|\beta\|_0\le\|\alpha\|_0$，则

$$
D(\alpha-\beta)=0.
$$

若 $\alpha\ne\beta$，则 $\alpha-\beta$ 是一个非零零空间向量，其支撑大小满足

$$
\|\alpha-\beta\|_0
\le\|\alpha\|_0+\|\beta\|_0
\lt\operatorname{spark}(D).
$$

这意味着少于 $\operatorname{spark}(D)$ 个字典列线性相关，与定义矛盾。故 $\alpha=\beta$。证毕。

### 8.2 mutual coherence 给出可计算条件

定义 mutual coherence

$$
\mu(D)
=\max_{i\ne j}|d_i^*d_j|.
$$

若 $\mu(D)=0$，所有字典列两两正交，因而 $D$ 满列秩，任意可表示向量的系数都唯一。下面只需讨论 $\mu(D)>0$。

**命题**：若 $\mu(D)>0$，则

$$
\operatorname{spark}(D)
\ge1+\frac1{\mu(D)}.
$$

**证明**：若所有列线性无关，则左边为 $+\infty$，结论立即成立。否则设最少的 $s$ 个相关列满足

$$
\sum_{i\in S}c_id_i=0,
$$

并选 $j\in S$ 使 $|c_j|=\max_{i\in S}|c_i|$。左乘 $d_j^*$ 得

$$
|c_j|
=\left|\sum_{i\in S\setminus\{j\}}c_i d_j^*d_i\right|
\le\mu(D)\sum_{i\ne j}|c_i|
\le\mu(D)(s-1)|c_j|.
$$

$c_j\ne0$，所以 $1\le\mu(D)(s-1)$，即

$$
s\ge1+\frac1{\mu(D)}.
$$

证毕。

因此只要

$$
\|\alpha\|_0
\lt\frac12\left(1+\frac1{\mu(D)}\right),
$$

稀疏表示便唯一。

### 8.3 $\ell_1$ 凸松弛何时恢复原解

组合目标 $\|\alpha\|_0$ 通常难以直接优化。无噪声凸松弛是 basis pursuit：

$$
\min_\beta\|\beta\|_1
\quad\text{subject to}\quad
D\beta=b.
$$

含噪版本是 Lasso 型目标：

$$
\min_\beta
\frac12\|D\beta-b\|_2^2
+\lambda\|\beta\|_1.
$$

**定理（coherence 恢复条件）**：设 $\mu(D)>0$。若 $b=D\alpha$，$\alpha$ 为 $k$-稀疏，并满足

$$
k\lt\frac12\left(1+\frac1{\mu(D)}\right),
$$

则 $\alpha$ 是 basis pursuit 的唯一解。若 $\mu(D)=0$，$D$ 满列秩，可行系数本来就唯一，因此不需要这一充分条件。

**证明**：若 $\ker(D)=\{0\}$，可行系数唯一，结论立即成立。否则任取非零 $h\in\ker(D)$。由 $Dh=0$，对每个 $j$ 有

$$
0=d_j^*Dh
=h_j+\sum_{i\ne j}h_i d_j^*d_i.
$$

于是

$$
|h_j|
\le\mu(D)\bigl(\|h\|_1-|h_j|\bigr),
$$

从而

$$
|h_j|
\le\frac{\mu(D)}{1+\mu(D)}\|h\|_1.
$$

若 $S=\operatorname{supp}(\alpha)$，$|S|=k$，则

$$
\|h_S\|_1
\le\frac{k\mu(D)}{1+\mu(D)}\|h\|_1
\lt\frac12\|h\|_1
=\frac12\bigl(\|h_S\|_1+\|h_{S^c}\|_1\bigr).
$$

所以

$$
\|h_S\|_1\lt\|h_{S^c}\|_1.
$$

任何其他可行点都写成 $\alpha+h$，且

$$
\|\alpha+h\|_1
=\|\alpha_S+h_S\|_1+\|h_{S^c}\|_1
\ge\|\alpha\|_1-\|h_S\|_1+\|h_{S^c}\|_1
\mathrel{>}\|\alpha\|_1.
$$

故 $\alpha$ 是唯一极小点。证毕。

这条结果明确说明：$\ell_1$ 并非无条件等于 $\ell_0$。恢复需要字典列之间足够不相干，或更一般的 null-space property、restricted isometry 等条件。

---

## 9. 四种近似的归属边界

| 方法 | 约束对象 | 主要结论 | 不承诺什么 |
|---|---|---|---|
| 截断 SVD | $\operatorname{rank}(B)\le k$ | 谱范数与 Frobenius 范数下全局最优 | 不保证非负或稀疏 |
| randomized range finder | 主列空间的随机探测 | 用较小子空间近似 SVD；误差受谱尾控制 | 不消除平坦谱的困难 |
| Nyström | PSD 核矩阵的采样列 | 保持 PSD；列空间覆盖时精确 | 不适用于任意非对称矩阵 |
| NMF | $W,H\ge0$ 且内维为 $k$ | 非负的低秩部件表示 | 无 SVD 式闭式全局最优保证 |
| 稀疏近似 | $\alpha$ 的非零坐标数 | spark / coherence 条件下唯一与可恢复 | 不等价于低秩 |

PCA、谱嵌入、聚类和可视化的任务层解释继续放在 [无监督表征系列](/notes/ml/unsupervised-representation/note-ml-unsup-0-roadmap/)；本系列只保存低秩、PSD、随机投影与稀疏恢复的线性代数主干。

下一篇转向另一种“不精确”：输入、矩阵和浮点计算本身带有扰动时，解会放大多少？这会把奇异值从“压缩的重要性排序”改读为“反演的风险排序”。

[上一篇：Part 6——LU、QR、Cholesky、SVD 与极分解](/notes/math/linear-algebra/note-la-6-matrix-factorizations/)

[下一篇：Part 8——条件数、数值稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/)

[返回：Part 0——矩阵、线性映射与坐标语言](/notes/math/linear-algebra/note-la-0-foundation/)
