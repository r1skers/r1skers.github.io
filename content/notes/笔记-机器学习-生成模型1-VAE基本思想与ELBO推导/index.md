---
date: '2026-04-27T7:00:00+09:00'
draft: false
title: '机器学习 / 生成模型：VAE 的基本思想与 ELBO 推导'
summary: "围绕 VAE 论文中的核心问题，整理 Variational Autoencoder 的基本直觉、模型结构、ELBO 的来历，以及 reparameterization trick 为什么必要。"
description: "A study note on the basic idea of Variational Autoencoder and the intuition behind ELBO."
tags: ["Generative Models", "VAE", "ELBO", "Latent Variable Model", "Reparameterization"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-生成模型1-vae基本思想与elbo推导/
  - /notes/笔记-生成模型1-1-VariationalAutoencoder的基本思想与ELBO推导/
---

# 机器学习 / 生成模型：VAE 的基本思想与 ELBO 推导

**VAE 学习~**

论文链接：[Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114)

这一篇是 VAE 学习笔记的上篇，主要处理论文直觉和 ELBO 推导。下篇会把这些公式落到一个最小 PyTorch 复现里：[VAE：最小复现](/notes/笔记-机器学习-生成模型-vae最小复现/)。

# Abstract

- 提出问题：如何在有连续隐变量、后验分布不可解、数据集很大的有向概率模型中，高效地进行推断和学习？

- 解决方法：
  1. **Reparameterization Trick**: 通过对变分下界做 reparameterization，得到一个容易用标准随机梯度方法优化的下界估计器。
  2. **Encoder / Recognition Model**: 对于 i.i.d. 数据集，并且每个数据点都有自己的连续隐变量，作者提出可以训练一个 approximate inference model，也叫 recognition model，来高效近似真实后验。

# Introduction

## 分析问题

**如何在有连续隐变量、后验分布不可解、数据集很大的有向概率模型中，高效地进行推断和学习？**

- **推断**: 给定一个观测样本 $x$ , 推断它背后的隐变量 $z$ 。比如说手写数字图片 $x$ , 隐变量 $z$ 就可能表示数字风格、粗细、倾斜角度等。

$$p_{\theta}(z \mid x)$$

- **学习**: 学习模型参数 $\theta$，让模型更加会生成数据：

$$p_{\theta}(x \mid z)$$


## 局限：后验和边缘似然不可解

在隐变量模型中，我们想知道的是给定观测 $x$ 后，隐变量 $z$ 的后验分布：

$$\begin{aligned} p_{\theta}(z \mid x) = \frac{p_{\theta}(x \mid z)p_{\theta}(z)}{p_{\theta}(x)} \end{aligned}$$

但分母中的边缘似然：

$$\begin{aligned} p_{\theta}(x) = \int p_{\theta}(x \mid z)p_{\theta}(z)\,dz \end{aligned}$$

在复杂模型中通常不可解。这使得真实后验难以直接计算，也让直接最大化 $\log p_{\theta}(x)$ 变得困难。

这就是 VAE 要解决的核心矛盾：我们希望学习一个生成模型 $p_{\theta}(x \mid z)$，却无法直接处理其中需要的真实后验 $p_{\theta}(z \mid x)$。


# Method

论文的 Method 部分开始把前面的直觉形式化。作者说明，本节的目标是为一类带连续隐变量的有向概率图模型，构造一个可以用随机梯度优化的变分下界估计器。

本文主要讨论一个常见场景：**数据集中的样本是 i.i.d. 的，每个观测数据 $x^{(i)}$ 背后都有一个对应的连续隐变量 $z^{(i)}$。**我们希望学习全局的生成模型参数 $\theta$，同时对每个样本的隐变量 $z^{(i)}$ 做近似变分推断。

Figure 1 展示了这个结构：

$$z \rightarrow x$$

实线表示生成过程：

$$p_{\theta}(z)p_{\theta}(x \mid z)$$

也就是先从先验分布中采样隐变量 $z$，再根据条件分布 $p_{\theta}(x \mid z)$ 生成观测数据 $x$。

虚线表示近似推断过程：

$$q_{\phi}(z \mid x)$$

由于真实后验 $p_{\theta}(z \mid x)$ 通常不可解，论文引入一个由参数 $\phi$ 控制的 recognition model，用它来近似真实后验。也就是说，$\theta$ 负责描述 $z \rightarrow x$ 的生成关系，$\phi$ 负责描述 $x \rightarrow z$ 的近似推断关系。

## Problem Scenario

传统变分贝叶斯的思想同样是用一个简单分布去近似真实后验，但在复杂模型中，这个近似过程往往需要繁琐的解析推导，或者对每个数据点进行昂贵的迭代优化。VAE 的做法是引入一个带参数的 recognition model：

$$q_{\phi}(z \mid x)$$

它直接学习从观测数据 $x$ 到隐变量后验分布的映射，用一个统一的 encoder 来近似不可解的真实后验 $p_{\theta}(z \mid x)$。

我们可以这么理解：观测数据的生成过程分成两步：

$$z^{(i)} \sim p_{\theta^{*}}(z)$$

$$x^{(i)} \sim p_{\theta^{*}}(x \mid z)$$

也就是说，先生成隐变量，再由隐变量生成观测数据。

但训练时我们只能观测到 $x^{(i)}$，真实参数 $\theta^{*}$ 和每个样本对应的隐变量 $z^{(i)}$ 都是未知的。

在这个场景下，作者希望解决三个相关问题：

1. 高效学习生成模型参数 $\theta$，使模型能够生成类似真实数据的样本。
2. 给定观测 $x$，高效近似推断背后的隐变量 $z$。
3. 高效处理关于 $x$ 的边缘推断任务，例如图像去噪、修复和超分辨率。

从编码角度看，$z$ 可以被理解为 latent code。因此 $q_{\phi}(z \mid x)$ 被称为 probabilistic encoder：输入 $x$，输出 $z$ 的概率分布；$p_{\theta}(x \mid z)$ 被称为 probabilistic decoder：输入 $z$，输出 $x$ 的概率分布。

## The Variational Bound

由于数据集中的样本是 i.i.d. 的，整个数据集的边缘似然可以分解为每个样本边缘似然的乘积：

**边缘似然** $p_{\theta}(x)$ 可以理解为：在当前模型参数 $\theta$ 下，所有可能的隐变量 $z$ 生成观测数据 $x$ 的概率加权汇总。最大化边缘似然，就是让模型整体更容易生成真实数据。

$$\begin{aligned} p_{\theta}(x^{(1)}, \ldots, x^{(N)}) = \prod_{i=1}^{N} p_{\theta}(x^{(i)}) \end{aligned}$$

取对数后，乘积变成求和：

$$\begin{aligned} \log p_{\theta}(x^{(1)}, \ldots, x^{(N)}) = \sum_{i=1}^{N} \log p_{\theta}(x^{(i)}) \end{aligned}$$

因此，只要理解单个数据点的 $\log p_{\theta}(x^{(i)})$ 如何处理，就可以把它推广到整个数据集。

论文接着把单个数据点的边缘对数似然分解为两部分：

$$\begin{aligned} \log p_{\theta}(x^{(i)}) = D_{\mathrm{KL}} \left( q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)}) \right) + \mathcal{L}(\theta, \phi; x^{(i)}) \end{aligned}$$

- $D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)})\right)$：KL 误差，表示近似后验 $q_{\phi}(z \mid x)$ 和真实后验 $p_{\theta}(z \mid x)$ 的差距。

- $\mathcal{L}(\theta, \phi; x^{(i)})$：ELBO，即 evidence lower bound，也就是边缘对数似然的变分下界。

由于 KL 散度非负：

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)})\right) \ge 0 \end{aligned}$$

因此：

$$\begin{aligned} \log p_{\theta}(x^{(i)}) \ge \mathcal{L}(\theta, \phi; x^{(i)}) \end{aligned}$$

这就是 ELBO 被称为 lower bound 的原因：它位于真实目标 $\log p_{\theta}(x^{(i)})$ 的下方，但它更容易被估计和优化。

{{< details summary="推导：为什么真实目标可以分解为 KL 误差 + ELBO" >}}

这个分解可以从 KL 误差本身推出。首先展开近似后验和真实后验之间的 KL 散度：

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log q_{\phi}(z \mid x) - \log p_{\theta}(z \mid x) \right] \end{aligned}$$

由贝叶斯公式可知：

$$\begin{aligned} p_{\theta}(z \mid x) = \frac{p_{\theta}(x,z)}{p_{\theta}(x)} \end{aligned}$$

因此：

$$\begin{aligned} \log p_{\theta}(z \mid x) = \log p_{\theta}(x,z) - \log p_{\theta}(x) \end{aligned}$$

代回 KL 并整理：

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log q_{\phi}(z \mid x) - \log p_{\theta}(x,z) \right] + \log p_{\theta}(x) \end{aligned}$$

移项后得到：

$$\begin{aligned} \log p_{\theta}(x) = D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) + \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log p_{\theta}(x,z) - \log q_{\phi}(z \mid x) \right] \end{aligned}$$

于是后面的期望项就被定义为 ELBO：

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log p_{\theta}(x,z) - \log q_{\phi}(z \mid x) \right] \end{aligned}$$

{{< /details >}}


ELBO 首先可以写成下面这种形式：

$$\begin{aligned} \mathcal{L}(\theta, \phi; x^{(i)}) = \mathbb{E}_{q_{\phi}(z \mid x^{(i)})} \left[ \log p_{\theta}(x^{(i)}, z) - \log q_{\phi}(z \mid x^{(i)}) \right] \end{aligned}$$

意思是：在近似后验 $q_{\phi}(z \mid x^{(i)})$ 下，对“联合概率减去近似后验概率”取期望。这里的期望出现并不突兀，因为 KL 散度本身就是一个关于 $q_{\phi}(z \mid x)$ 的期望。

利用联合分布分解：

$$\begin{aligned} p_{\theta}(x^{(i)}, z) = p_{\theta}(z)p_{\theta}(x^{(i)} \mid z) \end{aligned}$$

可以把 ELBO 改写成 VAE 最常见的形式：

$$\begin{aligned} \mathcal{L}(\theta, \phi; x^{(i)}) = - D_{\mathrm{KL}} \left( q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z) \right) + \mathbb{E}_{q_{\phi}(z \mid x^{(i)})} \left[ \log p_{\theta}(x^{(i)} \mid z) \right] \end{aligned}$$

这一形式直接对应 VAE 的训练直觉：

- $\mathbb{E}_{q_{\phi}(z \mid x^{(i)})}\left[\log p_{\theta}(x^{(i)} \mid z)\right]$ 是重构项。它衡量从 encoder 推出的隐变量 $z$，能否通过 decoder 解释或重构原始数据 $x^{(i)}$。

- $D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z)\right)$ 是正则项。它约束 encoder 得到的近似后验不要偏离先验 $p_{\theta}(z)$ 太远。

因此，最大化 ELBO 等价于同时做两件事：一方面让 $z$ 能有效解释 $x$，另一方面让 $z$ 的分布保持在先验附近。若先验取标准正态分布 $p(z)=\mathcal{N}(0,I)$，这一项就会推动隐空间变得更规整，方便后续从先验中采样并生成新数据。

如果把这一形式落到后面的 MNIST 复现里，训练时通常不是直接最大化 ELBO，而是最小化负 ELBO：

$$\begin{aligned} \mathrm{loss} = \mathrm{reconstruction\ loss} + \mathrm{KL\ loss} \end{aligned}$$

其中 reconstruction loss 对应 $-\log p_{\theta}(x \mid z)$。在 MNIST 这种像素值被归一化到 $[0,1]$ 的场景里，可以把 decoder 的输出看成每个像素为 1 的 Bernoulli 概率，因此重构项可以用 binary cross entropy 实现：

$$\begin{aligned} -\log p_{\theta}(x \mid z) = -\sum_{j=1}^{784}\left[x_j\log \pi_{\theta,j}(z) + (1-x_j)\log(1-\pi_{\theta,j}(z))\right] \end{aligned}$$

KL loss 则对应近似后验和先验之间的距离。如果令：

$$\begin{aligned} q_{\phi}(z \mid x)=\mathcal{N}\left(\mu,\mathrm{diag}(\sigma^2)\right), \qquad p(z)=\mathcal{N}(0,I) \end{aligned}$$

那么 KL 项有闭式解：

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x)\middle\|p(z)\right) = -\frac{1}{2}\sum_j\left(1+\log\sigma_j^2-\mu_j^2-\sigma_j^2\right) \end{aligned}$$

所以在代码里，VAE 的损失函数就可以理解成：

$$\begin{aligned} \text{BCE}(x,\hat{x}) + D_{\mathrm{KL}}\left(q_{\phi}(z \mid x)\middle\|p(z)\right) \end{aligned}$$

这也是为什么后面的复现会把 loss 拆成 `recon` 和 `kl` 两部分来观察。

{{< details summary="推导：从联合分布形式到重构项 - KL 项" >}}

从 ELBO 的联合分布形式出发：

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x,z) - \log q_{\phi}(z \mid x)\right] \end{aligned}$$

由于：

$$\begin{aligned} \log p_{\theta}(x,z) = \log p_{\theta}(z) + \log p_{\theta}(x \mid z) \end{aligned}$$

代入可得：

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x \mid z)\right] + \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(z) - \log q_{\phi}(z \mid x)\right] \end{aligned}$$

后一项正好是负 KL：

$$\begin{aligned} \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(z) - \log q_{\phi}(z \mid x)\right] = -D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$

所以：

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x \mid z)\right] - D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$

{{< /details >}}

不过，目前为止问题还在。我们希望同时优化生成模型参数 $\theta$ 和近似后验参数 $\phi$。其中 $\theta$ 出现在 $p_{\theta}(x \mid z)$ 里，比较容易通过反向传播处理；麻烦的是 $\phi$，因为它出现在采样分布本身中：

$$\begin{aligned} z \sim q_{\phi}(z \mid x^{(i)}) \end{aligned}$$

也就是说，ELBO 中的期望依赖于一个带参数的采样过程。朴素的 Monte Carlo 梯度估计可以写成：

$$\begin{aligned} \nabla_{\phi}\mathbb{E}_{q_{\phi}(z)}[f(z)] = \mathbb{E}_{q_{\phi}(z)}\left[f(z)\nabla_{\phi}\log q_{\phi}(z)\right] \end{aligned}$$

但这种估计器通常方差很高，不适合高效训练。于是论文下一步引出 **reparameterization trick**：把随机性从参数化分布中分离出来，使得采样过程也能参与稳定的反向传播。

总结，2.2 说明了从真实目标到可优化目标的转换：

$$\begin{aligned} \log p_{\theta}(x) \quad \longrightarrow \quad \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}[\log p_{\theta}(x \mid z)] - D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$


## The SGVB Estimator and AEVB Algorithm

VAE 的核心直觉是：VAE 学习的是两个概率映射。

第一个是从观测数据到隐变量分布的近似推断过程：

$$\begin{aligned} x \longrightarrow q_{\phi}(z \mid x) \end{aligned}$$

第二个是从隐变量到观测数据分布的生成过程：

$$\begin{aligned} z \longrightarrow p_{\theta}(x \mid z) \end{aligned}$$

所以 VAE 学习的是：

$$\begin{aligned} x \longrightarrow q_{\phi}(z \mid x) \longrightarrow z \longrightarrow p_{\theta}(x \mid z) \end{aligned}$$

其中 encoder 并不是直接吐出一个确定的 latent code，而是输出隐变量分布的参数。以高斯近似后验为例：

$$\begin{aligned} q_{\phi}(z \mid x) = \mathcal{N}\left(\mu_{\phi}(x), \sigma_{\phi}^{2}(x)\right) \end{aligned}$$

也就是说，encoder 接收 $x$，输出 $\mu_{\phi}(x)$ 和 $\sigma_{\phi}(x)$。它们共同定义了 $z$ 的近似后验分布。随后我们从这个分布里采样 $z$，再交给 decoder 去解释或生成 $x$。

问题在于，直接写：

$$\begin{aligned} z \sim q_{\phi}(z \mid x) \end{aligned}$$

会让采样过程依赖 $\phi$，梯度难以直接穿过随机采样。重参数化技巧的作用，就是把这个“无规律采样”改写成一条有迹可循的可微路径。高斯情况下：

$$\begin{aligned} \epsilon \sim \mathcal{N}(0,I), \qquad z = \mu_{\phi}(x) + \sigma_{\phi}(x)\odot\epsilon \end{aligned}$$

这里随机性来自固定噪声 $\epsilon$，而 $\mu_{\phi}(x)$ 和 $\sigma_{\phi}(x)$ 仍然由 encoder 给出。于是 $z$ 仍然依赖 $\phi$，但这种依赖变成了确定的可微函数：

$$\begin{aligned} z = g_{\phi}(\epsilon,x) \end{aligned}$$

论文接下来把这个形式用于 ELBO 的 Monte Carlo 估计。对于任意函数 $f(z)$，原本关于 $q_{\phi}(z \mid x)$ 的期望可以改写为：

$$\begin{aligned} \mathbb{E}_{q_{\phi}(z \mid x^{(i)})}[f(z)] = \mathbb{E}_{p(\epsilon)}\left[f(g_{\phi}(\epsilon,x^{(i)}))\right] \end{aligned}$$

再用采样近似：

$$\begin{aligned} \mathbb{E}_{p(\epsilon)}\left[f(g_{\phi}(\epsilon,x^{(i)}))\right] \simeq \frac{1}{L}\sum_{l=1}^{L} f(g_{\phi}(\epsilon^{(l)},x^{(i)})), \qquad \epsilon^{(l)} \sim p(\epsilon) \end{aligned}$$

把这个技巧代入 ELBO，就得到通用的 SGVB estimator：

$$\begin{aligned} \tilde{\mathcal{L}}^{A}(\theta,\phi;x^{(i)}) = \frac{1}{L}\sum_{l=1}^{L}\left[\log p_{\theta}(x^{(i)},z^{(i,l)}) - \log q_{\phi}(z^{(i,l)} \mid x^{(i)})\right] \end{aligned}$$

其中：

$$\begin{aligned} z^{(i,l)} = g_{\phi}(\epsilon^{(i,l)},x^{(i)}), \qquad \epsilon^{(i,l)} \sim p(\epsilon) \end{aligned}$$

如果 KL 项可以解析计算，论文还给出一个更常用、方差通常更低的 estimator：

$$\begin{aligned} \tilde{\mathcal{L}}^{B}(\theta,\phi;x^{(i)}) = -D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z)\right) + \frac{1}{L}\sum_{l=1}^{L}\log p_{\theta}(x^{(i)} \mid z^{(i,l)}) \end{aligned}$$

这个形式和 VAE 的训练直觉完全对应：前一项是 KL 正则，后一项是基于采样的重构项。

对于整个数据集，训练时不会每次用全量数据，而是用 minibatch 构造估计：

$$\begin{aligned} \mathcal{L}(\theta,\phi;X) \simeq \tilde{\mathcal{L}}^{M}(\theta,\phi;X^{M}) = \frac{N}{M}\sum_{i=1}^{M}\tilde{\mathcal{L}}(\theta,\phi;x^{(i)}) \end{aligned}$$

其中 $X^{M}$ 是从完整数据集 $X$ 中随机抽取的 $M$ 个样本。

Algorithm 1 可以理解成下面的训练循环：

1. 初始化 encoder 参数 $\phi$ 和 decoder 参数 $\theta$。
2. 从数据集中随机取一个 minibatch $X^{M}$。
3. 从固定噪声分布 $p(\epsilon)$ 中采样 $\epsilon$。
4. 用 $z=g_{\phi}(\epsilon,x)$ 得到隐变量样本。
5. 用 SGVB estimator 估计 ELBO 及其梯度。
6. 使用 SGD、Adagrad 或 Adam 之类的优化器更新 $\theta,\phi$。
7. 重复直到收敛。

训练结束后，我们同时获得：

- encoder：$q_{\phi}(z \mid x)$，用于从数据推断隐变量分布；
- decoder：$p_{\theta}(x \mid z)$，用于从隐变量生成或重构数据。

## The Reparameterization Trick

论文中 2.4 进一步讨论了重参数化技巧的适用范围。高斯分布只是最常见的例子；对于 inverse CDF 可求的分布、location-scale family，以及可以由其他随机变量组合得到的分布，也可以构造类似的 $g_{\phi}(\epsilon,x)$。因此，reparameterization trick 的核心是能否把采样过程改写成固定噪声经过可微变换。

下一篇：[生成模型 Part 1-2：Variational Autoencoder 的最小复现](/notes/笔记-生成模型1-2-vae最小复现/)。
