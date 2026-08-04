---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: '误差分析 · Taylor 6：把噪声写进误差预算'
summary: "带相关噪声的中心差分把 Taylor 截断偏差、随机方差、MSE 和最优步长连接成一个可验证模型。"
description: "推导 noisy central difference 的 bias–variance 分解、相关性效应、Monte Carlo 验证和最优步长。"
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion", "Monte Carlo"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 6
---

确定性模型说明了 truncation 与 roundoff 的竞争。现实中的函数值还可能来自传感器、随机模拟或小批量估计，因此需要把观测噪声也放进误差预算。

继续估计

\[
A=f'(0)=1,\qquad f(x)=e^x.
\]

一次带噪中心差分为

\[
D_i(h)=
\frac{[e^h+\varepsilon_{i,+}]
-[e^{-h}+\varepsilon_{i,-}]}{2h}.
\]

单个估计器平均 \(N\) 次观测：

\[
\bar D_{h,N}
=\frac1N\sum_{i=1}^{N}D_i(h).
\]

## 1. 先分清 \(N\) 和 \(M\)

- \(N\)：构成一次估计的内部采样数；它真的会降低估计器方差；
- \(M\)：把整个估计器独立重复多少次；它只用于 Monte Carlo 测量 bias、variance 和 RMSE。

增加 \(M\) 会让我们更准确地看见估计器性能，却不会改变被测估计器本身，也不会改变理论最优步长。

## 2. 截断偏差

无噪声中心差分为

\[
\frac{e^h-e^{-h}}{2h}
=\frac{\sinh h}{h}.
\]

因此 exact bias 是

\[
b(h)=\frac{\sinh h}{h}-1,
\]

小步长下

\[
b(h)=\frac{h^2}{6}+O(h^4).
\]

## 3. 相关噪声怎样经过差分

令 \(Z_1,Z_2\) 为独立标准正态变量，构造

\[
\varepsilon_+=\sigma Z_1,
\]

\[
\varepsilon_-=
\sigma\left(
\rho Z_1+\sqrt{1-\rho^2}Z_2
\right).
\]

两侧噪声标准差均为 \(\sigma\)，相关系数为 \(\rho\)。经过中心差分并平均 \(N\) 次后，

\[
\boxed{
V(h,N,\rho)=
\operatorname{Var}(\bar D_{h,N})=
\frac{\sigma^2(1-\rho)}{2Nh^2}.
}
\]

这里同时出现三条控制规律：

- 样本平均使随机标准差按 \(N^{-1/2}\) 下降；
- 差分中的除法使噪声标准差按 \(h^{-1}\) 放大；
- 正相关的 common-mode noise 会被左右相减抵消。

## 4. MSE 把偏差和方差放到同一尺度

写成

\[
\bar D_{h,N}=A+b(h)+\xi,
\qquad \mathbb E[\xi]=0,
\]

则

\[
\operatorname{MSE}=
\mathbb E[(\bar D_{h,N}-A)^2]
=b(h)^2+V(h,N,\rho).
\]

因此

\[
\boxed{
\operatorname{RMSE}(h,N,\rho)=
\sqrt{
\left(\frac{\sinh h}{h}-1\right)^2
+
\frac{\sigma^2(1-\rho)}{2Nh^2}
}.
}
\]

偏差与随机标准差不能直接相加；进入 MSE 的是 bias squared 与 variance。

## 5. 最优点不要求 U 形对称

使用主导项

\[
b(h)\approx Ch^2,
\qquad C=\frac16,
\]

并记

\[
K=\frac{\sigma^2(1-\rho)}{2N},
\]

得到

\[
\operatorname{MSE}(h)
\approx
C^2h^4+\frac{K}{h^2}.
\]

求导后

\[
\boxed{
h_*=
\left(
\frac{\sigma^2(1-\rho)}
{4NC^2}
\right)^{1/6}.
}
\]

这里不是因为“两边误差相等”，也不要求 U 形左右对称。最优点来自两项导数的斜率抵消：

\[
\frac{K}{h_*^2}
=2C^2h_*^4.
\]

在最优点，随机方差恰好是偏差平方的两倍。

## 6. 运行前预测与实验结果

实验设置

\[
\sigma=10^{-3},\qquad N=100,\qquad\rho=0
\]

给出主导阶预测

\[
h_*\approx0.06694.
\]

运行前可以预测：

- 左侧随机噪声主导，log-log 斜率为 \(-1\)；
- 右侧截断偏差主导，斜率约为 \(2\)；
- \(N\) 增加四倍，随机标准差减半；
- \(h\) 减半，截断偏差约除以 \(4\)，随机标准差约乘以 \(2\)。

![带噪中心差分的理论与经验 RMSE](statistical_noise_error.png)

对 41 个对数间隔步长、每个步长 \(M=2000\) 次重复，结果为：

- 左侧理论斜率 \(-1.0000\)；
- 右侧理论斜率 \(2.0541\)；
- 理论与经验网格最优点均为 \(h=0.06310\)；
- 理论和经验 RMSE 的中位相对差约 \(0.60\%\)；
- 最大相对差约 \(3.18\%\)。

这说明 Taylor 截断偏差、相关噪声传播、平均律与 MSE 优化可以组成一个可复现的统一模型。

## 7. 理论抵消后仍可能留下机器误差

当 \(\rho=1\) 时，

\[
\varepsilon_+=\varepsilon_-,
\]

公共噪声在实数算术中应精确抵消。但程序分别计算

\[
\operatorname{fl}(e^h+\varepsilon),
\qquad
\operatorname{fl}(e^{-h}+\varepsilon)
\]

时，两次加法落在不同的浮点网格位置，留下不同舍入痕迹。公共噪声相减后，实验仍观察到约 \(10^{-16}\) 量级的残余。

所以验证一个统计模型时，还要继续追问：

\[
\boxed{
\text{模型没有解释的残差，是随机波动，还是实现过程新增的误差？}
}
\]

完整实验、测试与 closed-book rewrite 保存在 [Error Atlas](https://github.com/r1skers/error-atlas/tree/main/topics/taylor-expansion/experiments)。这一步也完成了 Taylor topic 的闭环：从余项定义出发，最终得到一个可以推导、预测、运行和审查的误差控制流程。

---

**本 Topic 已完成：** [返回 Taylor 展开父页面](/notes/systems/error-analysis/taylor-expansion/)
