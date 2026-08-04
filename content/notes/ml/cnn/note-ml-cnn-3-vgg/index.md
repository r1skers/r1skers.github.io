---
date: '2026-05-09T10:30:00+09:00'
draft: false
title: '机器学习 / CNN 与视觉表征：VGG，深度与小卷积核'
summary: "从 VGG 论文出发，理解为什么统一使用 3x3 小卷积核、规则化堆叠和增加深度，能把 AlexNet 之后的 CNN 推向更强的视觉表征，并自然引出 ResNet。"
description: "A study note on VGG, repeated 3x3 convolutions, VGG-16 architecture, parameter count, and the bridge from AlexNet to ResNet."
tags: ["Machine Learning", "CNN", "Visual Representation"]
categories: ["Notes"]
series: ["CNN and Visual Representation"]
note_kind: "topic"
aliases:
  - /notes/笔记-CNN与视觉表征3-VGG深度与小卷积核/
  - /notes/笔记-机器学习-cnn与视觉表征3-vgg深度与小卷积核/
  - /notes/note-ml-cnn-3-vgg/
---

# 机器学习 / CNN 与视觉表征：VGG，深度与小卷积核

论文链接：[Very Deep Convolutional Networks for Large-Scale Image Recognition](https://arxiv.org/abs/1409.1556)


## 写在前面

VGG 的主要价值，是它将 CNN 架构整理成一种非常规整的深层形式，并且系统性地回答了：

```text
在大规模图像识别中，网络深度到底有多重要？
```

它将 CNN 的设计语言规范化，规则化小卷积和深度的提高为后续 ResNet 的出现铺垫了条件。

## Abstract / Introduction：把 depth 当成主变量

VGG 论文提出的核心问题是：

```text
How important is ConvNet depth for large-scale image recognition?
```

VGG 主要做了：

```text
统一使用 3x3 convolution
统一使用 stride 1 和 padding 1
统一使用 2x2 max pooling 做降采样
然后逐步增加卷积层数量
```

所以其实算是一种方法论：

```text
减少架构花样
让结构尽量规整
系统性观察 depth 的影响
```

## VGG 的基本结构

VGG 的输入是 ImageNet 的 RGB 图像：

```text
224 x 224 x 3
```

卷积层采用：

```text
kernel size = 3x3
stride = 1
padding = 1
```

这个组合的选择有一个很重要的原因：卷积前后空间尺寸不变。

公式是：

```text
output = (input + 2 * padding - kernel_size) / stride + 1
```

代入 `224`：

```text
(224 + 2 * 1 - 3) / 1 + 1 = 224
```

也就是说在 VGG 里，`3x3, stride 1, padding 1` 的卷积通常只改变通道数，不改变宽高。

max pooling 实际降低空间尺寸：

```text
kernel size = 2x2
stride = 2
```

每次池化把宽高减半：

```text
224 -> 112 -> 56 -> 28 -> 14 -> 7
```

最后接三个全连接层：

```text
4096 -> 4096 -> 1000
```

其中 `1000` 对应 ImageNet 的 1000 个类别。

## VGG-16：最常见的 configuration D

常见的 VGG-16，即论文里的 configuration D。它的结构可以记成：

```text
64, 64, M
128, 128, M
256, 256, 256, M
512, 512, 512, M
512, 512, 512, M
FC 4096
FC 4096
FC 1000
```

其中 `M` 表示 max pooling。

完整 shape 路线如下：

| 层 | 输出 shape |
| --- | --- |
| input | 224 x 224 x 3 |
| conv1_1 | 224 x 224 x 64 |
| conv1_2 | 224 x 224 x 64 |
| pool1 | 112 x 112 x 64 |
| conv2_1 | 112 x 112 x 128 |
| conv2_2 | 112 x 112 x 128 |
| pool2 | 56 x 56 x 128 |
| conv3_1 | 56 x 56 x 256 |
| conv3_2 | 56 x 56 x 256 |
| conv3_3 | 56 x 56 x 256 |
| pool3 | 28 x 28 x 256 |
| conv4_1 | 28 x 28 x 512 |
| conv4_2 | 28 x 28 x 512 |
| conv4_3 | 28 x 28 x 512 |
| pool4 | 14 x 14 x 512 |
| conv5_1 | 14 x 14 x 512 |
| conv5_2 | 14 x 14 x 512 |
| conv5_3 | 14 x 14 x 512 |
| pool5 | 7 x 7 x 512 |
| flatten | 25088 |
| fc6 | 4096 |
| fc7 | 4096 |
| fc8 | 1000 |

经典的 CNN 模式：

```text
空间尺寸逐渐变小
通道数逐渐变多
```

也就是：

```text
224 -> 112 -> 56 -> 28 -> 14 -> 7
3 -> 64 -> 128 -> 256 -> 512 -> 512
```

前面保留更多空间细节，后面用更多通道表达更抽象的语义信息。

## 为什么是 3x3 小卷积核

VGG 中最重要的就是重复堆叠 `3x3` 卷积。

直觉上，大卷积核可以看到更大的局部区域，比如 `5x5`、`7x7`。但 VGG 提出的是：

```text
用多个 3x3 卷积堆起来，也可以获得类似的大感受野。
```

例如：

```text
两个 3x3 conv roughly cover 一个 5x5 receptive field
三个 3x3 conv roughly cover 一个 7x7 receptive field
```

还有就是，多个小卷积有两个好处。

第一，参数更少。假设输入输出通道数都是 `C`：

```text
一个 7x7 conv:
49C^2 parameters

三个 3x3 conv:
3 * 9C^2 = 27C^2 parameters
```

第二，非线性更多。三个 `3x3` 中间可以插入更多 ReLU：

```text
3x3 -> ReLU -> 3x3 -> ReLU -> 3x3 -> ReLU
```

所以相比一个大的 `7x7`，多个小的 `3x3` 不只是省参数，还让模型有更多层次的非线性变换。

这就是 VGG 的核心设计：

```text
用小卷积核堆深网络
用更规整的结构换取更强的表示能力
```

## A 到 E：把深度做成对照实验

论文里构筑了 configurations A 到 E 不是五个逐渐加深的网络：

```text
A: 11 weight layers
B: 13 weight layers
C: 16 weight layers
D: 16 weight layers，也就是常见的 VGG-16
E: 19 weight layers，也就是常见的 VGG-19
```

这里的 `weight layers` 指的是有参数的卷积层和全连接层，也就是说不包括 ReLU、pooling 和 softmax。

所以 VGG-16 ：

```text
13 conv layers + 3 fully connected layers
```

这个设置的意义是让 depth 成为主要变量，在基本规则不变的前提下观察网络加深后的效果。

## 参数量：强，重

VGG 的卷积部分很规整，但模型整体并不轻量。尤其是最后的全连接分类器。

`pool5` 之后的 feature map 是：

```text
7 x 7 x 512 = 25088
```

所以第一个全连接层参数量就是：

```text
25088 * 4096 + 4096 = 102,764,544
```

光这一层就超过一亿参数。这也是后来很多网络转向 `global average pooling -> fc` 的原因之一。

## 从 VGG 走向 ResNet

VGG 告诉我们：

```text
加深 CNN 可以提升视觉表示能力。
```

但它也留下了两个问题。

第一，VGG 很重。尤其是全连接分类器，参数量巨大。

第二，plain network 不能无限加深。继续堆卷积层时，训练会变得越来越困难。

这就自然引出 ResNet 的问题：

```text
如果 depth 很重要，为什么更深的 plain network 反而可能训练得更差？
```

因此，VGG 证明了 depth 的价值，而 ResNet 接着解决 depth 继续增加时的优化问题。

## 总结

VGG 将 CNN 结构推向一种非常清晰、规整、可比较的深层形式。

它重要的几个点在于：

```text
1. 用 repeated 3x3 convolution 替代大卷积核。
2. 通过堆叠小卷积增加有效感受野和非线性。
3. 用 A 到 E 的配置系统性研究 depth。
4. VGG-16 / VGG-19 成为常用视觉 backbone。
5. 模型强但参数很重，尤其是 FC classifier。
6. 它自然引出 ResNet 的 degradation problem。
```
