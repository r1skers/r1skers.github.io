---
date: '2025-11-26T10:47:00+09:00'
draft: false
title: '[Euraka!]Probability is just Normalized Energy? The Hidden Link between Borns Rule and Auto-correlation[To be continued]'
tags: ["Advanced", "markdown","Fourier and Laplace","Convolution and Sampling"]
categories: ["Promethean Fire", "Fireside Notes" , "Delphic Musings"]
---

# Question found
When I checked my notes,I found that the formula of auto-correlation and Born's rule look same.Why? In this artical, we are going to check it.
# Formula
First, Let's have a look of this two formulas<p>

Auto-Correlation($\tau =0$):

$$E = R_{xx}(0) = \int_{-\infty}^{\infty} f(t) f^*(t) \ dt = \int_{-\infty}^{\infty} |f(t)|^2 \ dt$$

Born's Rule:

$$P = \langle \psi | \psi \rangle = \int_{-\infty}^{\infty} \psi(x) \psi^*(x) \ dx = 1$$

So what does the funtion multiple its conjugate describe?

# Explain

## 1."Collision" in Mathematical Form

**Signal Solution (Instantaneous power/energy density at time $t$)**

$$E(t) = f(t) f^*(t) = |f(t)|^2$$

**Quantum Mechanics (The probability density at position x)**

$$P(t) = \psi(x) \psi^*(x) = |\psi(x)|^2$$

**Why is it the same?**<p>
In mathematical functional analysis, they all belong to the concept of Inner Product in **Hilbert Space**.

$$\langle f, f \rangle = \int f \cdot f^*$$

This represents **the square of the length** of a vector (whether it is a signal or a wave function).

<a href="">Maybe someone found difficulty here.</a>

## 2.Physical essence: from "amplitude" to "intensity"

**Same place**<p>
Both are **Wave**. <p>
A signal is a wave of voltage/current.<p>
A quantum state is a wave of probability amplitude.<p>

**Same problem**<p>
**Complex numbers cannot be directly measured.** Waves usually contain phase information ($e^{j\theta}$), so they are essentially complex numbers.However, in the real world, electricity meter cannot read complex numbers, and particle detector cannot read complex numbers either.We can only measure **"Intensity"**.

**Solution**<p>
How to convert a complex number containing a phase into a real intensity? The answer is: **multiply it by its own conjugate.**

$$(A e^{j\theta}) \cdot (A e^{-j\theta}) = A^2$$

The phase is eliminated, leaving only the square of the amplitude (intensity).<p>
In signals: This is called power (the square of voltage)<p>
In quantum mechanics: This is called probability (the square of the wave amplitude)<p>

In fact,the Born probability density is essentially the "power spectral density" of the quantum wave function.

## 3.A Perspective in Hilbert Space
**Treat "wave function" as "vector"**<p>
A continuous function is essentially a "super long" vector with infinitely many components.<p>
The value $f(t)$ at each moment $t$ is the **"coordinate value"** of this vector in this dimension.<p>
<a href="">Maybe someone has found something interesting...（Tips:Samping）</a>

**Squaring: Take each "coordinate value" and square it ($|f(t)|^2$)**<p>
This is to calulate the modulus of the vector.<p>

**Summing**<p>
Add up all these infinitely many "squared values" . This gives the square of the total length (that is, the total energy).
## 4.From Gemini
Why is there such an astonishing coincidence? It's actually not a coincidence, but a historical inheritance.<p>
1. Schrödinger's inspiration: When Schrödinger wrote the wave equation back then, he regarded particles as a kind of **"classical wave"** (like sound waves or water waves).
2. Energy of classical waves: In classical physics, the energy of a wave is always proportional to the square of its amplitude.
3. Born's interpretation: Later, Max Born said, "Hey, this wave is not a physical material wave, but a probability wave." However, the mathematical rules for calculating "intensity" were retained.
Therefore, the "sameness" you see is because quantum mechanics directly borrowed the mathematical framework of classical wave theory (which is now the theory of signal processing), only replacing the term "energy" with "probability".

# More
We just talked about waht their formula look same, but it's still a little hard to understand why We can use the formula to describe energy. Here's the process about quantom mechanics

1.  第一站：出发点 —— “它到底在哪？”
任务： 我想描述一个量子粒子（比如电子）在某一刻的位置概率。 困境： 经典物理说粒子是个球，位置是确定的。但实验发现，微观粒子会发生干涉（像水波一样互相抵消）。 结论 1： 粒子不是一个点，它本质上是一种“波”。

2.  第二站：描述波 —— “我需要一个函数”
任务： 我需要一个数学工具来描述这个波的起伏。 工具： 我们定义一个函数 $\psi(x)$，叫它波函数。 要求： 这个波必须能描述“干涉”。也就是说，波峰遇到波谷要能变成 0（相加抵消）。 结论 2：$\psi(x)$ 必须有正有负，甚至必须是复数（因为复数 $e^{i\theta}$ 描述旋转和相位最完美）。

3.  第三站：现实的鸿沟 —— “复数不存在”
任务： 我要测量这个粒子出现的概率。 困境：<p>
我的波函数 $\psi$ 是复数（比如$1+i$）。但是“概率”必须是实数（不可能有 30%+ $20i$ 的概率）。而且概率必须是非负的（不可能有 -10% 的概率）。 结论 3： $\psi$ 本身不能直接代表概率。我们需要对 $\psi$ 进行一种**改造**，把它变成正实数。

4.  第四站：经典的启示 —— “能量与振幅”
任务： 寻找改造灵感。回顾经典物理（信号处理）：<p>
光波： 光也是波。光的亮度（强度）不是电场 $E$，而是电场的平方 $E^2$。<p>
声波： 声音的响度不是振幅 $A$，而是振幅的平方 $A^2$。<p>
电压： 信号的能量不是 $V$，而是 $V^2$。<p>
物理直觉： 在经典世界里，“波的强度（Intensity）”永远正比于“振幅的平方”。<p>

5.  第五站：终点 —— “波恩定则 (The Born Rule)”
推理： 既然粒子是波，那么粒子在某处出现的“可能性的大小”（概率密度），应该就等同于这个波在那里的**强度**。
操作：<p>
把复数波函数 $\psi$ 看作“振幅”。模仿经典物理，计算它的“强度”。<p>
因为是复数，计算模长的平方（自己乘共轭）：$|\psi|^2 = \psi \cdot \psi^*$。<p>
最终结论： 概率密度 = 波的强度 = 波函数的模方 $|\psi|^2$ 。