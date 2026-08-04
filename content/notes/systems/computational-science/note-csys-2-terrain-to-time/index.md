---
date: '2026-02-19T00:00:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第2部分：从地形到时间演化'
summary: "以 orogeny-inversion-validation-lab 为实例，把 Part 1 中的离散地形接上演化方程，说明梯度、kappa、通量与 CFL 如何展开一条 forward trajectory。"
description: "Part 2 on attaching the terrain to a PDE and evolving it into a forward trajectory."
tags: ["Computational Science", "Inverse Problem", "Reliability", "PDE"]
categories: ["Notes"]
series: ["Inverse Modeling and Reliable Computation"]
note_kind: "topic"
aliases:
  - /notes/笔记-应用数学2-误差分析与理查德森外推/
  - /notes/笔记-计算科学与高可靠系统设计2-从地形到时间演化/
  - /notes/笔记-计算科学与高可靠系统设计2-系统可靠性与误差控制/
  - /notes/note-csys-2-terrain-to-time/
---

> **主题入口：** [反问题与可靠计算档案](/notes/topics/inverse-modeling/)

# Part 2：从地形到时间演化

这一篇 Part 2，主要内容就是：我们不再描述一张地形，而是描述一个会随时间变化的场。

Part 1 结束的时候，我们手上已经有了一套可以计算的离散空间对象：

- 初始高度场 `h0`
- 对应的物理坐标 `x_coords`、`y_coords`

到了这一篇，问题就从“这张地形长什么样”，变成“这张地形接下来会怎么变”。

## 1. 静态地形变为“初始条件”

在 Part 1 里，`h0` 还是一张初始地形图；到了 Part 2，它的身份就变成了 PDE 的初始条件：

$$
h(x,y,0)=h_0(x,y)
$$

也就是说，`h0` 现在表示的是系统在 `t=0` 时刻的状态。

## 2. 加入演化规律（偏微分方程 PDE）

只有初始地形还不够，我们还需要告诉系统：它为什么会变，以及按什么规律变化。  
这里项目采用的演化规律是

$$
\frac{\partial h}{\partial t} = \nabla \cdot \left( \kappa(x,y)\,\nabla h \right)
$$

其中：

- $h(x,y,t)$ 是随时间变化的高度场；
- $\kappa(x,y)$ 是空间上不同位置的扩散强度；
- 这个方程规定了在给定初始地形和 $\kappa(x,y)$ 的情况下，高度场如何沿时间演化。

如果先不管公式细节，只看直觉，这里描述的其实就是一个局部扩散过程：  
高的地方会向低的地方摊开，而不同区域摊开的快慢，又会受到 $\kappa$ 的影响。

在项目里，这里的 $\kappa$ 场不是抽象设定，而是由  
`00_forward_variable_kappa/scripts/simulate_forward_variable_kappa.py`  
里的 `_build_kappa_field(...)` 构造出来的。

## 3. 观念变化：时间演化本质上是局部收支平衡

前面我们已经把视角从静态量高度 `h(x,y)`，转向了变化量 `h(x,y,t)`。  
现在研究的重点不再是某个点“有多高”，而是它在一个时间步里和周围区域交换了多少量。

也就是说，我们不能再只把某个离散点看成一个孤立的值，而要把它看成一个会和上下左右发生交换的局部区域。  
一旦把一个局部区域围起来，问题就自然变成：

**有多少量穿过了这个区域的边界？**

这也是后面为什么会出现通量、control volume 和边界条件。  
时间演化之所以能写成更新公式，本质上就是因为我们在做局部收支平衡。

![五点差分下的局部收支平衡示意](five-point-flux-balance.svg)

在项目代码里，真正把这种“局部收支平衡”落实成一步更新的，是  
`00_forward_variable_kappa/scripts/simulate_forward_variable_kappa.py`  
里的 `_step_flux_conservative_variable(...)`。

## 4. 梯度、$\kappa$ 和通量

如果用一个流沙模型来理解，梯度描述的是沙面哪里更陡、往哪里更容易流；  
而 $\kappa$ 描述的是局部区域对这种流动的响应能力，也就是这片区域本身有多容易发生扩散。

所以可以先把两者记成：

- 梯度决定流动趋势；
- $\kappa$ 决定流动效率。

从这个角度看，面上的通量可以先粗略理解成“$\kappa$ 乘上坡度”：

$$
q \sim -\,\kappa \nabla h
$$

这里的负号表示流动总是朝着高度降低的方向。  
也正因为如此，坐标几何在 Part 2 里不再只是背景：不同的距离会改变梯度，不同的梯度又会改变通量，最终影响下一时刻的演化结果。

## 5. 从一步更新到完整轨迹

真正的 forward solver 做的事情，压缩起来其实很直接：

1. 读取当前时刻的 `h`；
2. 结合 `x_coords`、`y_coords` 和 $\kappa(x,y)$，估计每个局部区域与周围的交换；
3. 统计净流入和净流出；
4. 得到下一时刻的新高度场；
5. 重复这个过程，形成

$$
h^0,\ h^1,\ h^2,\ \dots,\ h^N
$$

到这里，一张静态地形图才真正变成了一条时间上的演化轨迹。  
而这条轨迹，就是后面观测生成和参数反演要依赖的 truth。

## 6. CFL：在推进前先确认这条时间线能不能成立

因为项目里采用的是显式时间推进，所以步长 `dt` 不能随便设。  
如果一步迈得太大，数值解可能在第一步就已经失稳，后面整条轨迹也都会失去可信度。

所以在真正开始推进之前，必须先检查 CFL 条件。  
这个检查关注的通常是：

- 最大扩散强度 $\kappa_{\max}$
- 最小网格尺度 $dx_{\min}$、$dy_{\min}$

原因也很直观：最危险的地方，总是扩散最快、网格又最密的区域。  
只有先确认这套 $h0 + \kappa + geometry$ 的组合可以被稳定推进，后面的 forward trajectory 才有意义。

这一部分在项目里对应的是同一个脚本里的 `_conservative_cfl_limit_variable(...)`，  
它会根据 `\kappa_{\max}`、`dx_{\min}` 和 `dy_{\min}` 先给出一个保守的 CFL 上限。
