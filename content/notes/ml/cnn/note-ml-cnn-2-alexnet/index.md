---
date: '2026-05-07T09:45:00+09:00'
draft: false
title: '机器学习 / CNN 与视觉表征：AlexNet，深度视觉时代的起点'
summary: "从论文和轻量复现出发，理解 AlexNet 如何用大规模 CNN、ReLU、GPU、dropout 和数据增强推动 ImageNet 分类突破。"
description: "A study note on AlexNet, its architecture, ImageNet classification setup, and lightweight PyTorch reproduction."
tags: ["CNN", "Visual Representation", "AlexNet", "Image Classification", "ImageNet", "PyTorch", "Deep Learning"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-生成模型3-cnn的下一步alexnet/
  - /notes/笔记-机器学习-cnn与视觉表征2-alexnet深度视觉时代的起点/
  - /notes/笔记-CNN与视觉表征2-AlexNet深度视觉时代的起点/
  - /notes/note-ml-cnn-2-alexnet/
---

# 机器学习 / CNN 与视觉表征：AlexNet，深度视觉时代的起点

论文链接：[ImageNet Classification with Deep Convolutional Neural Networks](https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)

代码仓库：`paper-reforge/AlexNet`

## 写在前面

首先要明确的是，AlexNet 本质上仍然是 CNN。是把 CNN 从“能在干净小数据集上工作”推进到“能在大规模真实图像分类任务上压过传统视觉方法”的转折点。

如果说 LeNet-5 证明了 CNN 可以做图像识别，那么 AlexNet 证明了 CNN 可以在 ImageNet 这种真实复杂的任务上成为主流方案。

这篇笔记主要按论文顺序走，比较：

```text
LeNet / 小规模 CNN
vs
AlexNet / ImageNet 大规模 CNN
```
需要思考的是：

```text
AlexNet 到底比早期 CNN 多做了什么？
为什么它能成为深度学习视觉时代的起点？
```

本质上来说：

```text
AlexNet 把一张图片编码成卷积特征，再映射到 ImageNet 1000 个固定类别的概率分布。
```

可以看成是一个封闭集分类任务：

```text
给定一张图片，在 ImageNet 预定义的 1000 个类别里分别打分。
```

## Abstract / Introduction：问题变大了

AlexNet 的论文题目是 *ImageNet Classification with Deep Convolutional Neural Networks*。光看题目就能看到关键点：

```text
ImageNet
Deep CNN
Classification
```

这和 LeNet-5 面对的 MNIST 已经不是一个量级的问题。

MNIST 像是一个干净的入门任务：

```text
灰度图
手写数字
10 类
背景简单
物体基本居中
```

而 ImageNet 是自然图像分类：

```text
彩色图像
复杂背景
1000 类
物体尺度和姿态变化很大
训练图像约 120 万张
```

这意味着模型不再能只靠一个小 CNN 解决问题。AlexNet 需要更大的模型、更强的算力、更认真地处理过拟合，也需要更高效的训练技巧。

论文摘要里最重要的结果是：

```text
ILSVRC-2010:
top-1 error = 37.5%
top-5 error = 17.0%

ILSVRC-2012:
AlexNet top-5 error = 15.3%
第二名 top-5 error = 26.2%
```

AlexNet 让我们明白：

```text
大数据 + 大 CNN + GPU + ReLU + dropout / data augmentation
```

这套组合可以在真实视觉任务上远远超过手工特征方法。

## Dataset：从 MNIST 到 ImageNet

LeNet-5 处理的是手写数字识别。AlexNet 处理的是 ImageNet 1000 类自然图像分类。这个变化会影响整个网络设计。

在 MNIST 上，输入图像很规整，类别也少。模型主要学的是数字形状。

在 ImageNet 上，同一个类别可能出现在各种场景里：

```text
不同角度
不同光照
不同背景
不同尺度
不同遮挡
```

所以 AlexNet 需要学到更复杂的视觉表示。

这也是为什么 AlexNet 的输出不是数字类别，而是：

```text
1000 个 ImageNet 类别的 logits
```

模型最后会输出一个长度为 1000 的向量：

```text
[
  class_0_score,
  class_1_score,
  ...,
  class_999_score
]
```

这些分数再经过 softmax，变成 1000 个类别上的概率分布。

这里的“1000 个选项”并不是模型临时生成的，而是 ImageNet 数据集预定义好的标签空间。也就是说，AlexNet 做的是封闭集分类，也就是：

```text
答案必须从这 1000 类里面选。
```

这也解释了为什么我在用预训练 AlexNet 跑游戏角色图时，它输出 `gasmask`、`wig` 或 `stage` 之类的结果。因为 ImageNet 里没有这个角色选项，模型只能在已有类别里找最像的。

## Architecture：AlexNet 的结构

AlexNet 的主体结构是：

```text
5 个卷积层
+ 3 个全连接层
```

展开来看：

```text
Input
-> Conv1 -> ReLU -> LRN -> Pool
-> Conv2 -> ReLU -> LRN -> Pool
-> Conv3 -> ReLU
-> Conv4 -> ReLU
-> Conv5 -> ReLU -> Pool
-> Flatten
-> FC6 -> ReLU -> Dropout
-> FC7 -> ReLU -> Dropout
-> FC8
-> Softmax
```

典型的 CNN 思路：

```text
卷积层负责提取视觉特征
全连接层负责整合特征并分类
```

但相比 LeNet，AlexNet 更深、更宽、输入更复杂、分类空间也更大。

### 3.1 ReLU：让大 CNN 训练成为可能

早期神经网络常用 `sigmoid` 或 `tanh`。它们的问题是容易饱和：

```text
输入很大或很小时，梯度接近 0
```

深层网络里，如果梯度越来越小，前面的层就很难学。

AlexNet 使用 ReLU：

```text
f(x) = max(0, x)
```

ReLU 在正半轴不饱和，所以训练速度快很多。论文里提到，在 CIFAR-10 的小实验中，ReLU 网络达到同样训练误差大约比 tanh 快 6 倍。对 AlexNet 这种大规模 CNN 来说，ReLU 是让训练真正跑起来的关键条件之一。

### 3.2 Multiple GPUs：硬件约束塑造了模型

AlexNet 使用两块 GTX 580 GPU 训练。每块显存只有 3GB，所以完整模型不能像今天这样轻松塞进单卡。

它采用的是一种模型并行思路：

```text
一部分卷积核 / 通道放在 GPU 1
另一部分放在 GPU 2
部分层跨 GPU 通信
部分层只连接本 GPU 上的 feature maps
```

这和今天常见的数据并行不一样。

数据并行更像：

```text
不同 GPU 处理不同 batch
然后同步梯度
```

AlexNet 当时更像：

```text
模型本身被拆到两张 GPU 上
```

论文里说两 GPU 版本相比卷积核数量减半的单 GPU 网络更好。但这个结果不能理解成“多 GPU 本身神奇提高精度”。更合理的理解是：

```text
两 GPU 让作者能训练更大的网络。
更大的网络容量更强。
所以效果更好。
```

这也体现了 AlexNet 的一个重要特征：它不是纯算法故事，而是算法、数据、硬件和工程共同作用的结果。

### 3.3 LRN：早期的通道竞争式归一化

LRN 是 Local Response Normalization，局部响应归一化。

它的直觉是：

```text
在同一个空间位置上，相邻通道的激活值互相竞争。
响应强的通道更突出，附近响应被压一点。
```

AlexNet 在 Conv1 和 Conv2 的 ReLU 后用了 LRN：

```text
Conv1 -> ReLU -> LRN -> Pool
Conv2 -> ReLU -> LRN -> Pool
```

LRN 的灵感来自生物视觉里的 lateral inhibition，也就是侧抑制。

今天看，LRN 已经不常用了。后来 BatchNorm、LayerNorm 等方法更稳定、更通用。

### 3.4 Overlapping Pooling：更平滑地下采样

传统 pooling 常见形式是：

```text
2x2 pooling, stride 2
```

窗口之间不重叠。

AlexNet 使用：

```text
3x3 max pooling, stride 2
```

因为窗口大小大于步长，所以相邻 pooling 区域会重叠，有助于减轻硬分块带来的信息损失。

### 3.5 Overall Architecture：尺寸链

经典 AlexNet 尺寸推导通常用 `227x227x3` 输入，因为这样和论文里的 Conv1 参数能整除。

空间尺寸大概是：

```text
227
-> Conv11/s4: 55
-> Pool3/s2: 27
-> Conv5/p2: 27
-> Pool3/s2: 13
-> Conv3/p1: 13
-> Conv3/p1: 13
-> Conv3/p1: 13
-> Pool3/s2: 6
```

完整 shape 链：

```text
1x3x227x227
-> 1x96x55x55
-> 1x96x27x27
-> 1x256x27x27
-> 1x256x13x13
-> 1x384x13x13
-> 1x384x13x13
-> 1x256x13x13
-> 1x256x6x6
-> 1x9216
-> 1x4096
-> 1x4096
-> 1x1000
```

这里有一个点：输出激活数量不等于参数量。

比如 Conv1 输出是：

```text
96 x 55 x 55
```

这是输出激活数量，也可以理解成这一层产生了多少个响应值。

但 Conv1 的参数量是：

```text
96 x 11 x 11 x 3 + 96 = 34,944
```

因为卷积核在整张图上滑动复用，同一个卷积核会产生一张 `55x55` 的 feature map，但这 `55x55` 个位置共用同一组权重。

全连接层就不同了。FC6 是：

```text
9216 -> 4096
```

参数量是：

```text
9216 x 4096 + 4096 = 37,752,832
```

所以 AlexNet 的参数大头其实在全连接层，而不是卷积层。

## Reducing Overfitting：大模型的代价

AlexNet 大约有 6000 万参数。ImageNet 虽然很大，但面对这么大的模型，过拟合仍然是重要问题。

论文主要用了两类方法：

```text
data augmentation
dropout
```

### Data Augmentation

训练时，作者从 `256x256` 图像里随机裁剪 `224x224` patch，并进行水平翻转。

这相当于告诉模型：

```text
物体稍微平移，类别不变。
物体水平翻转，类别通常不变。
```

测试时则使用 10-crop：

```text
四个角 + 中心 = 5 个 crop
原图 + 水平翻转 = 10 个 crop
```

然后平均预测结果。

作者还使用 PCA 颜色扰动，让模型对光照和颜色变化更鲁棒。

所以 data augmentation 的本质是：

```text
用不改变标签的变换扩展训练分布。
```

### Dropout

Dropout 用在 FC6 和 FC7。

训练时，dropout 会随机把一部分隐藏神经元输出置零。论文中使用的概率是 0.5。

直觉上：

```text
每次训练都临时关闭一部分神经元。
模型不能依赖固定神经元组合死记训练集。
```

这对 AlexNet 特别重要，因为 FC6 和 FC7 参数量巨大：

```text
FC6: 37.7M
FC7: 16.8M
```

如果不用 dropout，这些全连接层很容易记住训练集细节。

## Details of Learning：训练配方

AlexNet 使用的是 SGD with momentum。

主要训练配置：

```text
batch size = 128
momentum = 0.9
weight decay = 0.0005
initial learning rate = 0.01
```

学习率采用手动下降：当验证集错误率不再下降时，把学习率除以 10。

训练时间也很有时代感：

```text
两块 GTX 580 3GB GPU
训练约 5-6 天
90 epochs
```

今天看起来不算夸张，但在 2012 年，这说明 AlexNet 的成功离不开工程实现和硬件条件。

## Results / Discussion：为什么它是转折点

AlexNet 最著名的结果是 ILSVRC-2012：

```text
AlexNet top-5 test error = 15.3%
第二名 top-5 test error = 26.2%
```

这个差距非常大，几乎直接改变了计算机视觉的研究方向。

Discussion 里还有一个重要观察：作者发现去掉任意一个卷积层，性能都会变差。

这说明 AlexNet 的效果不只是来自“大参数量”，深度结构本身也重要。多层卷积可以逐步组合特征：

```text
边缘 / 颜色
-> 纹理 / 局部形状
-> 物体部件
-> 类别相关表示
```

AlexNet 打开了后续路线：

```text
VGG
GoogLeNet
ResNet
ViT
CLIP
```

后面的模型会继续沿着更深、更规范、更易训练、更强表示能力的方向发展。

## 轻量复现

完整从零训练 ImageNet 版 AlexNet 成本很高，所以这次做的是轻量复现：

```text
1. paper-style AlexNet 结构
2. 用 dummy input 检查每层 shape
3. 统计参数量
4. 用 torchvision 预训练 AlexNet 跑真实图片推理
```

对应代码在：

```text
paper-reforge/AlexNet
```

其中：

```text
src/models.py              手写 AlexNetPaper
src/inspect_shapes.py      检查每层输出 shape
src/predict_pretrained.py  使用 torchvision 预训练 AlexNet 推理
outputs/layer_shapes.csv   shape 表
```

这次复现最主要的收获是：

```text
能解释 AlexNet 的结构如何从图像走到 1000 类 logits。
能区分模型结构、权重、logits、softmax 概率。
能解释为什么 AlexNet 是封闭集分类，而不是开放式图像理解。
```

## 小结

AlexNet 可以被压缩成这条链：

```text
图片
-> CNN 特征提取器
-> flatten
-> 全连接分类器
-> 1000 类 logits
-> softmax 概率
```

它相比早期 CNN 的关键推进是：

```text
更大的数据：ImageNet
更大的模型：约 6000 万参数
更快的激活：ReLU
更强的工程：GPU 并行
更严肃的正则化：data augmentation + dropout
```

所以 AlexNet 作为一个里程碑，是现代视觉深度学习真正起飞的起点。
