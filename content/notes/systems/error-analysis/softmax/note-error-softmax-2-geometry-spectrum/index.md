---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: '误差分析 · Softmax 2：概率单纯形上的方向与谱'
summary: "Softmax Jacobian 不只是偏导数组成的矩阵：它先减去概率加权平均，再把扰动限制到概率总量守恒的切空间。"
description: "推导 Softmax Jacobian 的函数作用、三分类局部谱、全局二范数界，并连接 covariance、Fisher 与熵正则化。"
tags: ["Error Analysis", "Softmax", "Jacobian", "Information Geometry"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 2
---

对 logits $z\in\mathbb R^K$，Softmax 定义为

\[
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
\]

直接求偏导得到

\[
\frac{\partial p_i}{\partial z_j}
=p_i(\delta_{ij}-p_j),
\]

因此 Jacobian 为

\[
\boxed{
J_s(z)=\operatorname{diag}(p)-pp^T.
}
\]

用这个来看清乘一个扰动向量时具体发生了什么。

## 1. 每一行都是一个局部线性泛函

令 logits 发生小扰动 $\delta z$，则

\[
\delta p_i
=\sum_j\frac{\partial p_i}{\partial z_j}\delta z_j
=p_i\left(
\delta z_i-\sum_jp_j\delta z_j
\right).
\]

记概率加权平均

\[
\mu_p(\delta z)=\sum_jp_j\delta z_j,
\]

那么 Softmax Jacobian 的动作可以压缩为：

1. 计算 logits 扰动的概率加权平均；
2. 从每个分量中减去这个共同部分；
3. 再按该类别的概率 $p_i$ 缩放。

矩阵形式是

\[
J_s\delta z
=D_p(I-\mathbf1p^T)\delta z.
\]

这比“第 $i$ 行点乘第 $j$ 列”更接近 Softmax 实际做的事：它不响应共同平移，只响应类别之间的 contrast。

## 2. 平移不变性就是 Jacobian 的零空间

Softmax 满足

\[
s(z+c\mathbf1)=s(z).
\]

微分形式是

\[
J_s\mathbf1=0.
\]

这里输入扰动 $c\mathbf1$ 通常不是零向量；它只是位于 Jacobian 的零空间，
所以输出变化为零。

另一方面，所有精确 Softmax 输出都满足

\[
\mathbf1^Tp=1.
\]

因此任何小的概率变化都必须满足

\[
\mathbf1^T\delta p=0.
\]

几何上，概率点位于单纯形中；Jacobian 的输出只能沿着单纯形的切空间 $\mathbf1^\perp$ 移动。直觉上就是：一类概率流入多少，其他类别必须流出同样多，总概率不能凭空增加或减少。

## 3. 三分类均匀点：整个 contrast plane 等价

在

\[
p=\left(\frac13,\frac13,\frac13\right)
\]

处，

\[
J_s
=\frac13\left(I-\frac13\mathbf1\mathbf1^T\right).
\]

括号中的矩阵正是到 $\mathbf1^\perp$ 的正交投影。因此：

- 共同平移方向 $\mathbf1$ 的特征值为 $0$；
- 任意 contrast direction 的特征值都为 $1/3$。

可以选一组正交基

\[
v_1=\frac{1}{\sqrt2}(1,-1,0)^T,
\qquad
v_2=\frac{1}{\sqrt6}(1,1,-2)^T.
\]

它们不是因为“彼此正交”才自动成为特征向量，而是因为我们已经先证明整个 contrast plane 都是不变子空间，随后才可以在其中任取正交基。

## 4. 非均匀点：同一个平面出现不同增益

改为

\[
p=\left(\frac12,\frac14,\frac14\right).
\]

由于后两类仍对称，可以分出两个 contrast modes：

\[
J_s(2,-1,-1)^T
=\frac38(2,-1,-1)^T,
\]

\[
J_s(0,1,-1)^T
=\frac14(0,1,-1)^T.
\]

第一种模式让类别 1 对抗类别 2、3；第二种模式只在类别 2、3 之间搬运概率。
同一个二维切平面不再各向同性，局部最大增益变成 $3/8$。

常见直觉 $p_i(1-p_i)$ 只描述对角偏导

\[
\frac{\partial p_i}{\partial z_i}=p_i(1-p_i),
\]

即某一坐标的 self-response。它能解释概率靠近 $0$ 或 $1$ 时该坐标趋于
饱和，却不能代替整个 Jacobian 的谱。多分类方向会同时耦合多个概率。

## 5. 局部 $3/8$ 与全局 $1/2$

因为 $J_s$ 对称半正定，operator norm 等于最大特征值。对任意单位向量
$v$，

\[
v^TJ_sv
=\sum_i p_iv_i^2-\left(\sum_i p_iv_i\right)^2
=\operatorname{Var}_{i\sim p}(v_i).
\]

也可以写为

\[
v^TJ_sv
=\frac12\sum_{i,j}p_ip_j(v_i-v_j)^2.
\]

固定 $v$ 时，方差并不是在均匀 $p$ 上最大，而是在 $v$ 的最小值与
最大值之间各放一半概率质量时最大。由

\[
\operatorname{Var}_p(v_i)
\le\frac{(v_{\max}-v_{\min})^2}{4}
\]

以及单位向量的 range 不超过 $\sqrt2$，得到

\[
\boxed{\|J_s(z)\|_2\le\frac12.}
\]

因此：

- $3/8$ 是 $p=(1/2,1/4,1/4)$ 这个固定点的局部最坏增益；
- $1/2$ 是跨所有概率分布的全局紧上确界；
- 二分类均衡点可以达到 $1/2$，多分类可在概率质量趋向集中于两类各一半
  时逼近。

共同平移方向始终给出零增益；即使限制到 contrast directions，概率饱和时
局部增益也能趋近零。因此 Softmax 没有正的全局下界。

## 6. 固定 Jacobian 只控制局部

如果扰动不再足够小，不能一直使用起点的 $J_s(z)$。精确差值是

\[
s(z+\Delta z)-s(z)
=\int_0^1J_s(z+t\Delta z)\Delta z\,dt.
\]

路径上概率改变，Jacobian 也随之改变。但全局上界仍给出

\[
\|s(z+\Delta z)-s(z)\|_2
\le\frac12\|\Delta z\|_2.
\]

这一区分对应两种不同问题：固定点的局部谱告诉我们“现在最敏感的方向”，
全局 Lipschitz 界则给有限输入扰动一个统一但更松的保证。

## 7. 熵与 Fisher 为什么会在这里出现

令

\[
A(z)=\log\sum_i e^{z_i}.
\]

则

\[
\nabla A(z)=p,
\qquad
\nabla^2A(z)=J_s(z).
\]

若随机类别 $Y\sim p$，one-hot 向量记为 $e_Y$，那么

\[
J_s=\operatorname{Cov}(e_Y).
\]

同一个矩阵也是 categorical model 对 logits 的 Fisher information。另一边，
log-sum-exp 还有变分表示

\[
\log\sum_i e^{z_i}
=\max_{p\in\Delta}
\left(p^Tz+H(p)\right),
\]

最优解正是 Softmax。所以谱分解、概率方差、Fisher 与最大熵并不是四条偶然
碰见的线，而是同一个凸函数及其梯度、Hessian 和对偶结构的不同侧面。

---

**下一篇：** [Softmax 3：数学等价为什么不等于数值稳定](/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/)
