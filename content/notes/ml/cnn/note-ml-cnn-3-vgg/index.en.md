---
date: '2026-05-09T10:30:00+09:00'
draft: false
title: 'Machine Learning / CNN and Visual Representation: VGG, Depth and Small Convolution Filters'
summary: "A study note on why VGG uses repeated 3x3 convolutions, regular deep stacks, and controlled depth comparisons to push CNN visual representations beyond AlexNet and toward ResNet."
description: "A study note on VGG, repeated 3x3 convolutions, VGG-16 architecture, parameter count, and the bridge from AlexNet to ResNet."
tags: ["CNN", "Visual Representation", "VGG", "ImageNet", "Deep Learning", "Computer Vision"]
categories: ["Crucible"]
aliases:
---

# Machine Learning / CNN and Visual Representation: VGG, Depth and Small Convolution Filters

Paper: [Very Deep Convolutional Networks for Large-Scale Image Recognition](https://arxiv.org/abs/1409.1556)

## Before Starting

The main value of VGG is that it turns CNN architecture into a very regular deep form and systematically asks:

```text
How important is network depth for large-scale image recognition?
```

It standardizes the design language of CNNs. Regular small convolutions and increased depth prepare the ground for the later appearance of ResNet.

## Abstract / Introduction: Treating Depth as the Main Variable

The central question of the VGG paper is:

```text
How important is ConvNet depth for large-scale image recognition?
```

VGG mainly does the following:

```text
use 3x3 convolutions throughout
use stride 1 and padding 1 throughout
use 2x2 max pooling for downsampling
then gradually increase the number of convolution layers
```

So it is also a methodology:

```text
reduce architectural tricks
make the structure as regular as possible
systematically observe the effect of depth
```

## The Basic Structure of VGG

VGG takes an ImageNet RGB image as input:

```text
224 x 224 x 3
```

Its convolution layers use:

```text
kernel size = 3x3
stride = 1
padding = 1
```

This choice has an important effect: the spatial size is preserved before and after convolution.

The formula is:

```text
output = (input + 2 * padding - kernel_size) / stride + 1
```

Substituting `224`:

```text
(224 + 2 * 1 - 3) / 1 + 1 = 224
```

So in VGG, a `3x3, stride 1, padding 1` convolution usually changes the number of channels but not the width or height.

Max pooling is what actually reduces the spatial size:

```text
kernel size = 2x2
stride = 2
```

Each pooling layer halves the width and height:

```text
224 -> 112 -> 56 -> 28 -> 14 -> 7
```

The network ends with three fully connected layers:

```text
4096 -> 4096 -> 1000
```

The final `1000` corresponds to the 1000 ImageNet classes.

## VGG-16: The Common Configuration D

The common VGG-16 is configuration D in the paper. Its structure can be remembered as:

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

Here `M` means max pooling.

The full shape route is:

| Layer | Output shape |
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

This is the classic CNN pattern:

```text
spatial size gradually decreases
number of channels gradually increases
```

That is:

```text
224 -> 112 -> 56 -> 28 -> 14 -> 7
3 -> 64 -> 128 -> 256 -> 512 -> 512
```

Early layers preserve more spatial detail. Later layers use more channels to represent more abstract semantic information.

## Why 3x3 Small Convolution Filters

The most important VGG design choice is repeated `3x3` convolution.

Intuitively, larger filters can see larger local regions, such as `5x5` or `7x7`. VGG's idea is:

```text
multiple stacked 3x3 convolutions can also obtain a similar large receptive field.
```

For example:

```text
two 3x3 conv layers roughly cover a 5x5 receptive field
three 3x3 conv layers roughly cover a 7x7 receptive field
```

Multiple small convolutions have two advantages.

First, they use fewer parameters. If the input and output channel counts are both `C`:

```text
one 7x7 conv:
49C^2 parameters

three 3x3 conv layers:
3 * 9C^2 = 27C^2 parameters
```

Second, they add more nonlinearities. Three `3x3` layers can insert more ReLU operations:

```text
3x3 -> ReLU -> 3x3 -> ReLU -> 3x3 -> ReLU
```

So compared with one large `7x7` convolution, multiple small `3x3` convolutions not only reduce parameter count, but also give the model more layers of nonlinear transformation.

This is the core VGG design:

```text
use small convolution filters to build deeper networks
use a more regular structure to obtain stronger representation power
```

## A to E: Turning Depth into a Controlled Comparison

The configurations A to E in the paper are not five completely different models. They are a gradually deepened series:

```text
A: 11 weight layers
B: 13 weight layers
C: 16 weight layers
D: 16 weight layers, the common VGG-16
E: 19 weight layers, the common VGG-19
```

Here `weight layers` means convolution layers and fully connected layers with parameters. It does not include ReLU, pooling, or softmax.

So VGG-16 does not mean 16 convolution layers. It means:

```text
13 conv layers + 3 fully connected layers
```

The point of this setup is to make depth the main variable. The paper is not changing the design for every model. It observes the effect of depth while keeping the basic rules fixed.

## Parameter Count: Strong, but Heavy

The convolution part of VGG is regular, but the full model is not light. The fully connected classifier is especially heavy.

After `pool5`, the feature map is:

```text
7 x 7 x 512 = 25088
```

So the first fully connected layer has:

```text
25088 * 4096 + 4096 = 102,764,544
```

This single layer has more than 100 million parameters. This is one reason later networks often moved toward `global average pooling -> fc`.

## From VGG to ResNet

VGG tells us:

```text
making CNNs deeper can improve visual representation.
```

But it also leaves two problems.

First, VGG is heavy. The fully connected classifier has a huge number of parameters.

Second, a plain network cannot be deepened without limit. If we keep stacking convolution layers, training becomes harder and harder.

This naturally leads to the ResNet question:

```text
If depth is important, why can a deeper plain network train worse?
```

Therefore, VGG demonstrates the value of depth, while ResNet solves the optimization problem that appears when depth keeps increasing.

## Summary

VGG pushes CNN architecture toward a deep form that is clear, regular, and easy to compare.

Its important points are:

```text
1. It replaces large convolution filters with repeated 3x3 convolutions.
2. It increases effective receptive field and nonlinearity by stacking small convolutions.
3. It uses configurations A to E to systematically study depth.
4. VGG-16 and VGG-19 become common visual backbones.
5. The model is strong but parameter-heavy, especially in the FC classifier.
6. It naturally leads to ResNet's degradation problem.
```

