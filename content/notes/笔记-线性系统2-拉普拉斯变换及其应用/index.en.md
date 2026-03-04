---
date: '2025-11-12T10:17:00+09:00'
draft: false
title: 'Linear Systems Part 2: Laplace Transform'
summary: "A compact reference of Laplace transform analysis, inverse transform, core properties, and common transform pairs for circuit and system solving."
tags: [ "Laplace Transform", "Convolution", "Sampling", "Signal & Systems"]
categories: ["Crucible"]
---

Laplace Transform

---


<a id="analysis-equation"></a>
Analysis Equation

$$F(s) =\mathcal{L}[f(t)] = \int_{0}^{\infty} e^{-st} f(t)dt$$

<a id="synthesis-equation"></a>
Synthesis Equation

$$f(t) = \mathcal{L}^{-1}[F(s)] = \frac{1}{2\pi j} \int_{\gamma - j\infty}^{\gamma + j\infty} e^{st} F(s)ds$$

<a id="properties-of-the-laplace-transform"></a>
Properties of the Laplace Transform

Basic

Linearity Property

$$\mathcal{L}[{a \cdot f(t) + b \cdot g(t)}] = a \cdot F(s) + b \cdot G(s)$$

***

Scaling Property

$$\mathcal{L}[{f(a \cdot t)}] = \frac{1}{|a|} \cdot F\left(\frac{s}{a}\right)$$

Special

Differentiation in the Time Domain (t)

$$\mathcal{L}\left[ f'(t) \right] = s\mathcal{L}[f(t)] - f(0)$$
<details>
</details>

***

Integration in the Time Domain (t)

$$\mathcal{L}\left[ \int_{0}^{t} f(\tau) d\tau \right] = \frac{1}{s}\mathcal{L}[f(t)]$$
<details>
</details>

***

Differentiation in the Frequency Domain (s)

$$\frac{d}{ds} \mathcal{L}[f(t)] = \mathcal{L}\left[ -tf(t) \right] $$
<details>
</details>

***

Integration in the Frequency Domain (s)

$$\mathcal{L}\left[ \frac{1}{t}f(t) \right] = \int_{s}^{\infty} F(\sigma) d\sigma$$
<details>
</details>

***

Shifting in the Time Domain (t)

$$\mathcal{L}\left[ f(t-\lambda) u(t-\lambda) \right] = e^{-\lambda s} \mathcal{L}[f(t)]$$

***

Shifting in the Frequency Domain (s)

$$\mathcal{L}\left[ e^{\sigma t} f(t) \right] = F(s-\sigma)$$

<a id="common-transform-pairs"></a>
Common Transform Pairs

| $f(t)$ | $F(s)$ |
|---|---|
| $1$ | $\dfrac{1}{s}$ |
| $t^n\ (n=0,1,2,\dots)$ | $\dfrac{n!}{s^{n+1}}$ |
| $e^{at}$ | $\dfrac{1}{s-a}$ |
| $\sin(bt)$ | $\dfrac{b}{s^2+b^2}$ |
| $\cos(bt)$ | $\dfrac{s}{s^2+b^2}$ |
| $\sinh(bt)$ | $\dfrac{b}{s^2-b^2}$ |
| $\cosh(bt)$ | $\dfrac{s}{s^2-b^2}$ |
| $e^{at}\sin(bt)$ | $\dfrac{b}{(s-a)^2+b^2}$ |
| $e^{at}\cos(bt)$ | $\dfrac{s-a}{(s-a)^2+b^2}$ |
| $u(t-a)$ | $\dfrac{e^{-as}}{s}$ |
| $(t-a)u(t-a)$ | $\dfrac{e^{-as}}{s^2}$ |
| $\delta(t)$ | $1$ |
| $\delta(t-a)$ | $e^{-as}$ |

<a id="exercise"></a>
Exercise

Laplace Transform Practice

