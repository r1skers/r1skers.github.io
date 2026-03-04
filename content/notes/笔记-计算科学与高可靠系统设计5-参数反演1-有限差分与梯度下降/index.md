---
date: '2026-03-01T00:00:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第5部分：参数反演1（有限差分梯度与梯度下降）'
summary: "本篇聚焦有限差分梯度与梯度下降，并用 1D 热方程反演扩散系数 κ 作为主例子，讲清推导、意义和可执行流程。"
description: "Part 5 note focused on finite-difference gradient derivation and gradient descent for PDE parameter inversion."
tags: ["PDE", "Inverse Problem", "Finite Difference", "Gradient Descent", "Parameter Inversion", "Reliability"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学5-参数反演/
  - /notes/笔记-计算科学与高可靠系统设计5-参数反演基础/
---

# 计算科学与高可靠系统设计 Part 5：参数反演1（有限差分梯度与梯度下降）

这一篇只讲一件事：用有限差分近似梯度，再用梯度下降反推出 PDE 参数 $\kappa$。  

主线是：PDE 正问题设定 -> 失配目标函数 -> 有限差分梯度 -> 梯度下降更新 -> 参数约束与收敛判据。  

---

## 1. PDE 问题定义（以 1D 热方程为例）

考虑一维热方程：  

$$
\frac{\partial u}{\partial t}=\kappa\frac{\partial^2 u}{\partial x^2},
\quad x\in[0,1],\ t\in[0,T]
$$

其中 $\kappa$ 是待识别的扩散系数。给定初值、边界条件和观测快照 $u^{\text{obs}}$，目标是反演 $\kappa$。  

用显式差分离散（连接 Part 1 与 Part 2）：  

$$
u_i^{n+1}=u_i^n+r(\kappa)\left(u_{i+1}^n-2u_i^n+u_{i-1}^n\right),
\quad r(\kappa)=\frac{\kappa\Delta t}{\Delta x^2}
$$

稳定性要求（1D 显式热方程）：  

$$
0 \lt r(\kappa)\le \frac{1}{2}
$$

以终点时刻 $t=T$ 为例，采用“失配 + 正则”目标函数：  

$$
J(\kappa)=
\underbrace{\frac12\sum_i\left(u_i^{N}(\kappa)-u_{i,\text{obs}}^{N}\right)^2}_{\text{Mismatch}}
\;+\;
\lambda\underbrace{R(\kappa)}_{\text{Regularization}}
$$

其中 $\lambda\ge 0$ 为正则权重；基础版本可先取 $\lambda=0$。  

参数反演即：  

$$
\kappa^\star=\arg\min_\kappa J(\kappa)
$$

---

## 2. 有限差分梯度推导（核心）

若没有解析梯度 $\frac{dJ}{d\kappa}$，用中心差分：  

$$
\frac{dJ}{d\kappa}\approx
\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}
$$

来源于泰勒展开：  

$$
J(\kappa+\delta)=J(\kappa)+\delta J'(\kappa)+\frac{\delta^2}{2}J''(\kappa)+\frac{\delta^3}{6}J'''(\kappa)+\cdots
$$

$$
J(\kappa-\delta)=J(\kappa)-\delta J'(\kappa)+\frac{\delta^2}{2}J''(\kappa)-\frac{\delta^3}{6}J'''(\kappa)+\cdots
$$

两式相减得：  

$$
J'(\kappa)=\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}+O(\delta^2)
$$

所以中心差分是二阶精度（误差 $O(\delta^2)$）。  

---

## 3. 梯度下降更新式与意义

第 $m$ 轮更新：  

$$
\kappa^{m+1}=\kappa^m-\eta g^m,
\quad
g^m\approx\frac{J(\kappa^m+\delta)-J(\kappa^m-\delta)}{2\delta}
$$

其中：  

中文：
1. $\delta$：有限差分扰动量，控制梯度近似精度与数值噪声敏感性。  
2. $\eta$：学习率，控制每步更新幅度。  
3. $g^m$ 的符号给方向，大小给强度。


若有参数物理范围，可加投影：  

$$
\kappa^{m+1}=\Pi_{[\kappa_{\min},\kappa_{\max}]}\left(\kappa^m-\eta g^m\right)
$$

---

## 4. PDE 数值例子：反演热扩散系数 $\kappa$

设定：  

中文：
1. 网格步长 $\Delta x=0.1$，时间步长 $\Delta t=0.002$。  
2. 当前参数 $\kappa^m=0.80$，扰动 $\delta=0.02$。  
3. 对 $\kappa^m+\delta=0.82$ 和 $\kappa^m-\delta=0.78$ 各做一次完整前向求解，并计算损失。


$$
J(0.82)=1.20\times10^{-3},\qquad
J(0.78)=1.68\times10^{-3}
$$

梯度近似：  

$$
g^m\approx\frac{1.20\times10^{-3}-1.68\times10^{-3}}{2\times0.02}
=-1.2\times10^{-2}
$$

若学习率 $\eta=0.5$，则  

$$
\kappa^{m+1}=0.80-0.5(-1.2\times10^{-2})=0.806
$$

解释：梯度为负，表示增大 $\kappa$ 会降低失配，所以更新后 $\kappa$ 变大。  

---

## 5. 参数选择建议

中文：
1. $\delta$ 过大，差分偏差大；$\delta$ 过小，易被数值误差淹没。  
2. 可用比例扰动：$\delta=\max(10^{-4},10^{-2}|\kappa|)$。  
3. $\eta$ 过大会震荡，过小会收敛慢；建议先小后大试探。  
4. 记录 $J_m, |g_m|, \kappa_m$ 三条曲线做稳定性判断。  
5. 常见停止条件：$|g_m|<\varepsilon_g$ 或 $|J_{m+1}-J_m|/J_m<\varepsilon_J$。


## 6. 小结

Part 5 的核心三步：  

$$
J(\kappa)\rightarrow
g(\kappa)\approx\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}
\rightarrow
\kappa\leftarrow\kappa-\eta g
$$

从初值 $\kappa^0$ 出发，每轮先用有限差分估计当前斜率，再沿下降方向更新 $\kappa$。  

优化器最小化的是失配目标 $J(\kappa)$，而不是 $|\kappa-\kappa_{\text{true}}|$；后者只在有真值的合成实验中用于评估。  

它给出最直接、最可解释的 PDE 参数反演起点；后续可升级到 L-BFGS-B 提升效率与稳健性。  
