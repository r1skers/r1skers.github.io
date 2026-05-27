---
date: '2026-05-09T12:30:00+09:00'
draft: false
title: '机器学习 / CNN 与视觉表征：ResNet，残差学习与退化问题'
summary: "从 ResNet 论文和 CIFAR-10 轻量复现实验出发，理解 residual connection 如何缓解深层 plain network 的 degradation problem。"
description: "A study note on ResNet, residual learning, degradation problem, CIFAR-10 reproduction, and visual backbone transfer."
tags: ["CNN", "Visual Representation", "ResNet", "Residual Learning", "CIFAR-10", "PyTorch", "Deep Learning"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-CNN与视觉表征4-ResNet残差学习与退化问题/
  - /notes/笔记-机器学习-cnn与视觉表征4-resnet残差学习与退化问题/
---

# 机器学习 / CNN 与视觉表征：ResNet，残差学习与退化问题

论文链接：[Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)

代码与实验记录：`paper-reforge/ResNet`

## 写在前面

VGG 证明了一个重要方向：

```text
更深、更规整的 CNN 可以带来更强的视觉表征。
```

但是有个问题：

```text
如果继续把 plain CNN 加深，训练真的会越来越好吗？
```

ResNet 的回答是：不一定。

更深的 plain network 可能不只是测试集表现变差，而是训练集都学不好。这不是普通意义上的过拟合，而是论文里说的 degradation problem。

## ResNet 的解决目标

首先要区分的是：

过拟合通常是：

```text
train accuracy 高
test accuracy 低
```

也就是模型把训练集记住了，但泛化不好。

ResNet 论文关注的 degradation problem 则是：

```text
网络变深后
train error 反而变高
test error 也变高
```

也就是说，模型甚至连训练集都没学好。

这件事很反直觉。因为一个更深的网络理论上至少可以模拟浅网络：

```text
前面的层正常工作
后面多出来的层学成 identity mapping
```

这样它至少不应该比浅网络差。

但 plain network 的问题是：让一堆卷积、BN、ReLU 自己学出 `H(x)=x` 并不容易。层数越深，已有特征越容易被后面的变换扰乱，梯度也要穿过更长的路径。

## Residual Learning：让网络学修正量

论文中提到的方法就是 Residual Learning。

普通 block 直接学习映射：

```text
x -> H(x)
```

ResNet 把它改成：

```text
H(x) = F(x) + x
```

也就是让卷积分支学习：

```text
F(x) = H(x) - x
```

这里的 `x` 是某一层中间的 feature map (输入)。`F(x)` 是 residual branch 输出的修正量。

如果某个 block 真的需要改变特征，那么 `F(x)` 可以学到有用的非零变化。

如果某个 block 暂时不需要改变特征，那么它只需要让：

```text
F(x) ≈ 0
```

于是：

```text
H(x) ≈ x
```

这比让 plain block 直接学完整的 identity mapping 更容易。

在代码里，核心就是：

```python
out = self.residual(x)
out = out + self.shortcut(x)
return self.relu(out)
```

## CIFAR-style ResNet 结构

论文在 CIFAR-10 上使用的是一个简单结构。输入是：

```text
32 x 32 x 3
```

第一层是：

```text
3x3 conv, 16 channels
```

后面有三个 stage：

```text
stage1: 32 x 32, 16 channels
stage2: 16 x 16, 32 channels
stage3: 8 x 8, 64 channels
```

每进入新的 stage：

```text
空间尺寸减半
通道数翻倍
```

最后：

```text
global average pooling
10-way fully connected layer
```

CIFAR ResNet 的深度公式是：

```text
6n + 2
```

因为：

```text
stem conv: 1
3 个 stage，每个 stage 有 n 个 block
每个 block 有 2 个 conv
final fc: 1
```

所以：

```text
1 + 3 * n * 2 + 1 = 6n + 2
```

对应到我们复现的模型：

```text
ResNet-20: n = 3，每个 stage 3 个 block
ResNet-56: n = 9，每个 stage 9 个 block
```

## 复现实验

完整复现 ImageNet 上的 ResNet-50/101/152 成本很高，所以这次做的是 CIFAR-10 轻量复现，复现论文里最关键的现象：

```text
plain network 加深后出现训练退化
residual network 加深后仍然可以训练
```

这次复现尽量保持结构主体、数据集和训练设置一致，只比较有没有 shortcut，以及深度从 20 到 56 后发生什么。

比较的四个模型是：

```text
plain-20
plain-56
resnet-20
resnet-56
```

训练设置：

```text
dataset = CIFAR-10
epochs = 10
batch size = 128
optimizer = SGD
learning rate = 0.1
momentum = 0.9
weight decay = 1e-4
augmentation = random crop + horizontal flip
```

10 epoch 没有充分进入长学习率衰减阶段，所以不能把它当成最终 CIFAR-10 精度。但足够观察 plain network 和 residual network 的差异。

## 实验结果

10 epoch 后的最好结果如下：

| 模型 | best train acc | best test acc |
| --- | ---: | ---: |
| plain-20 | 79.18% | 75.13% |
| plain-56 | 44.12% | 43.20% |
| resnet-20 | 82.37% | 80.52% |
| resnet-56 | 83.53% | 81.57% |

对比曲线如下：

![CIFAR-10 plain vs residual networks](comparison_curves.png)

这里最明显的是 `plain-56`。它不只是测试集差，训练集也没学好：

```text
plain-56 best train acc = 44.12%
plain-56 best test acc  = 43.20%
```

这说明问题不是过拟合，而是更深的 plain network 本身变得难以优化。

相比之下，`resnet-56` 没有出现这种塌陷：

```text
resnet-56 best train acc = 83.53%
resnet-56 best test acc  = 81.57%
```

## 为什么残差连接有用

直觉上，plain network 像一条很长的加工流水线：

```text
x -> layer1 -> layer2 -> ... -> layer56 -> output
```

每一层都必须重新加工前一层给出的特征。如果后面多出来的层学不好，它们不只是“没有贡献”，还可能破坏已经有用的表示。

ResNet 的 shortcut 像是在每个 block 旁边开了一条保底通道：

```text
已有特征 x 先保留
卷积分支只学习修正量 F(x)
输出 = x + F(x)
```

如果修正有用，模型会改进表示。  
如果修正暂时没用，模型也更容易接近 identity，不至于强迫每个 block 重写全部特征。

从反向传播看，shortcut 也给梯度提供了一条更直接的路径。粗略地说：

```text
y = F(x) + x
dy/dx = dF/dx + 1
```

这个 `+1` 让梯度不完全依赖卷积分支的导数，更容易跨过很多层传回前面。

## 并非“越深越好”

论文中做了一个很夸张的实验：

```text
ResNet-1202
```

CIFAR ResNet 的公式是：

```text
6n + 2
```

所以：

```text
1202 = 6 * 200 + 2
```

也就是每个 stage 有 200 个 BasicBlock。

这个模型能训练，说明 residual connection 确实把“极深网络能不能优化”的墙推远了。但它的测试结果不如 ResNet-110。

这说明 ResNet 并不是越深越好。

而是说：

```text
residual learning 让更深的网络变得可训练
```

泛化效果仍然受数据集大小、参数量、正则化、训练 schedule 等因素影响。

## ResNet 作为视觉 backbone

论文最后还展示了 ResNet 在 object detection 上的迁移效果。

作者把 Faster R-CNN 的 backbone 从 VGG-16 换成 ResNet-101，其他 detection 实现保持一致。结果 PASCAL VOC 和 COCO 上都有明显提升。

这说明 ResNet 的意义不只是 ImageNet 分类：

```text
strong classification backbone
-> stronger detection backbone
-> stronger visual representation
```

这也是为什么 ResNet 后来成为很多视觉任务的基础 backbone。

## 总结

ResNet 的核心不是简单地“堆更多层”，而是让“堆更多层”这件事变得可优化。

这篇论文真正解决的问题是：

```text
plain network 变深后训练退化
```

它的核心方法是：

```text
H(x) = F(x) + x
```

也就是让每个 block 学习残差修正，而不是直接学习完整映射。

复现中也观察到了同样的现象：

```text
plain-56 明显退化
resnet-56 稳定训练
```

一句话总结：

```text
VGG 证明 depth 有价值，ResNet 让 depth 真正变得可训练。
```
