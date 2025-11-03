---
date: '2025-11-03T10:17:00+09:00'
draft: false
title: 'Convolution and Sampling in Fourier and Laplace'
tags: ["basic", "markdown","math"]
categories: ["Promethean Fire", "Delphic Musings"]
---

# Concepts Introdutions

## 1. Convolution
the process of "**mixing**" or "**modifying**" one signal with another.
## 2. Sampling()
## 3. Fourier
### 3.1.Fourier series
A Fourier Series is a mathematical tool used to decompose any "well-behaved" periodic signal into a sum of simple, pure sinusoids (sines and cosines).
#### Significance: Why is it so important in Engineering?
Its significance lies in its ability to translate problems from the Time Domain to the Frequency Domain.<br>
Time Domain (Oscilloscope View): This is how we see a signal. We see its voltage (amplitude) changing over time. This view is very poor for understanding the signal's underlying structure.<br>
<br>
Frequency Domain (Spectrum Analyzer View): This is how we analyze a signal. The Fourier Series gives us this view. It shows us the signal's "spectrum"—a graph of which frequencies ($n\omega_0$) are present and how strong each one ($|c_n|$) is.

### 3.2 Fourier transform
We find that the Fourier Series cannot be directly applied to aperiodic signals. Therefore, to extend this concept, we treat the aperiodic signal as if it were a periodic signal, but with an infinitely large period ( $T \to \infty$ ).
## 4. Correlation Function


# Key Formulas
## 1. Fourier
### 1.1. Fourier series
$$f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \right)$$

$\frac{a_0}{2}$ here represents the average value (or DC component) of the signal $f(t)$. This value is calculated by finding the 'net area' under the $f(t)$ curve within one period and dividing by the period $T$.<br>
The coefficient $a_0$ itself is calculated as twice this average value:

$$a_0 = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \, dt$$

The coefficients for the AC components ($a_n$ and $b_n$) are calculated as follows:

$$a_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \cos(n\omega_0 t) \, dt$$
$$b_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \sin(n\omega_0 t) \, dt$$

Especially in electronics, we often use the Complex/Exponential Fourier Series, which is derived using Euler's Formula.<br>

The derivation starts with Euler's Formula.
$$e^{j\theta} = \cos(\theta) + j\sin(\theta) $$

Conversely, $\cos(\theta)$ and $\sin(\theta)$ can be expressed as

$$\cos(\theta) = \frac{e^{j\theta} + e^{-j\theta}}{2} \\ \sin(\theta) = \frac{e^{j\theta} - e^{-j\theta}}{2j} $$

By defining the complex coefficients $c_0$ = $\frac{a_0}{2}$ , $c_n$ = $\frac{a_n-jb_n}{2}$ , $c_{-n}$ = $\frac{a_n+jb_n}{2}$<br>

we can substitute these into the trigonometric series to get the final compact form:

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t}
$$

$$c_n = \frac{1}{T} \int_{T} f(t) e^{-jn\omega_0 t} \, dt$$

### 1.2. Fourier transform
#### 1.2.1. Analysis Equation

$$F(\omega) = \mathcal{F}\{f(t)\} = \int_{-\infty}^{\infty} f(t) e^{-j\omega t} \, dt$$

$e^{-j\omega t}$：This $e^{-j\omega t}$ is a 'factor'. The reason we use this 'factor' to multiply the signal is to seeing how much of the original signal satisfies the trigonometric function component。

#### 1.2.2. Synthesis Equation

$$f(t) = \mathcal{F}^{-1}\{F(\omega)\} = \frac{1}{2\pi} \int_{-\infty}^{\infty} F(\omega) e^{j\omega t} \, d\omega$$

#### 1.2.3. Properties of the Fourier Transform
Linearity Property<br>
***
**Scaling Property**<br>

$$f(at) \longleftrightarrow \frac{1}{|a|} F\left(\frac{\omega}{a}\right)$$

derivation:<br>

Let $\tau = at$ , Differentiate: $d\tau = a \cdot dt \implies dt = \frac{1}{a} d\tau$

$$f(at)= \int_{\tau=-\infty}^{\infty} f(\tau) e^{-j\omega (\frac{\tau}{a})} \left( \frac{1}{a} d\tau \right)$$

and then

$$G(\omega) = \frac{1}{a} \int_{-\infty}^{\infty} f(\tau) e^{-j\left(\frac{\omega}{a}\right)\tau} \, d\tau$$

$$G(\omega) = \frac{1}{a} F\left(\frac{\omega}{a}\right)$$

***
Time/Frequency-Shifting Property<br>
***
Time/Frequency Differentiation Property<br>
***
Duality Property<br>
***
Conjugation Property<br>
***
## 2.Laplace()


# Interesting place
## 1. 1/2pai between FT and IFT
## 2. Analysis Equation is a kind of correlation