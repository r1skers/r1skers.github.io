---
date: '2025-11-03T10:17:00+09:00'
draft: false
title: 'Convolution and Sampling in Fourier and Laplace'
tags: ["basic", "markdown","Fourier and Laplace"]
categories: ["Promethean Fire", "Fireside Notes"]
---
<details>
    <summary style="font-size: 25px;">Interesting place</summary>
    <p>1. 1/2pai between FT and IFT<p>
    <p>2. Analysis Equation is a kind of correlation<p>

</details>


# Concepts Introdutions

## 1. Convolution
the process of "**mixing**" or "**modifying**" one signal with another.
## 2. Sampling()
## 3. Differences between FT(Fourier Transform) and LT(Laplace Transform)

$$F(\omega) = \int_{-\infty}^{\infty} f(t) \cdot \underbrace{e^{-j\omega t}}_{\text{Kernel A}} \, dt$$

$$F(s) = \int_{0}^{\infty} f(t) \cdot \underbrace{e^{-st}}_{\text{Kernel B}} \, dt$$
<details>
    <summary style="font-size:25px;">Difference in Kernal:</summary>

$$e^{-j\omega t} = \cos(\omega t) - j \sin(\omega t)$$

$$e^{-st} = e^{-(\sigma + j\omega)t} = \underbrace{e^{-\sigma t}}\_{\text{Decay/Growth}} \cdot \underbrace{e^{-j\omega t}}\_{\text{Oscillation}}$$

The definition of the Fourier Transform is to decompose your signal $f(t)$ into an infinite sum of these "never-decaying" pure sine/cosine waves.<br>
The definition of the Laplace Transform is to decompose your signal $f(t)$ into an infinite sum of these "oscillating waves that can decay or grow.
</details>

<details>
    <summary style="font-size:25px;">Difference in range:</summary>
    <strong>FT</strong>:由公式可以看出傅里叶变换的上下限是双无穷，这是一个双边变换，一般用来分析永恒信号，分析那些没有起点的的信号，例如广播。<br>
    <strong>LT</strong>:由公式可以看出拉普拉斯变换的上下限是0到正无穷，这是一个单边变换，完美模拟现实情况（时间不可能小于0）因此可以用来解决初始值问题.
</details>

# Key Formulas
## 1. Fourier


<details>
  <summary style="font-size: 25px;">Fourier series</summary>

$$f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \right)$$

$\frac{a_0}{2}$ here represents the average value (or DC component) of the signal $f(t)$. This value is calculated by finding the 'net area' under the $f(t)$ curve within one period and dividing by the period $T$.<br>
The coefficient $a_0$ itself is calculated as twice this average value:

$$a_0 = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \ dt$$

The coefficients for the AC components ($a_n$ and $b_n$) are calculated as follows:

$$a_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \cos(n\omega_0 t) \ dt$$
$$b_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t) \sin(n\omega_0 t) \ dt$$

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
</details>

<details>
  <summary style="font-size: 25px;">Fourier transform</summary>

<details>
  <summary style="font-size: 20px;">Analysis Equation</summary>
$$F(\omega) = \mathcal{F}\{f(t)\} = \int_{-\infty}^{\infty} f(t) e^{-j\omega t} \, dt$$

$e^{-j\omega t}$：This $e^{-j\omega t}$ is a 'factor'. The reason we use this 'factor' to multiply the signal is to seeing how much of the original signal satisfies the trigonometric function component。
</details>
<details>
  <summary style="font-size: 20px;">Synthesis Equation</summary>

$$f(t) = \mathcal{F}^{-1}\{F(\omega)\} = \frac{1}{2\pi} \int_{-\infty}^{\infty} F(\omega) e^{j\omega t} \, d\omega$$
</details>
<details>
  <summary style="font-size: 20px;">Properties of the Fourier Transform</summary>
<details>
  <summary>basics</summary>

##### Linearity Property<br>

$$a f_1(t) + b f_2(t) \longleftrightarrow a F_1(\omega) + b F_2(\omega)$$

***

##### **Scaling Property**<br>

$$f(at) \longleftrightarrow \frac{1}{|a|} F\left(\frac{\omega}{a}\right)$$

derivation:<br>

Let $\tau = at$ , Differentiate: $d\tau = a \cdot dt \implies dt = \frac{1}{a} d\tau$

$$f(at)= \int_{\tau=-\infty}^{\infty} f(\tau) e^{-j\omega (\frac{\tau}{a})} \left( \frac{1}{a} d\tau \right)$$

and then

$$G(\omega) = \frac{1}{a} \int_{-\infty}^{\infty} f(\tau) e^{-j\left(\frac{\omega}{a}\right)\tau} \, d\tau$$

$$G(\omega) = \frac{1}{a} F\left(\frac{\omega}{a}\right)$$

***

##### Time/Frequency-Shifting Property<br>

$$f(t - t_0) \longleftrightarrow e^{-j\omega t_0} F(\omega)$$

$$e^{j\omega_0 t} f(t) \longleftrightarrow F(\omega - \omega_0)$$

***

##### Time/Frequency Differentiation Property<br>

$$\frac{d^n}{dt^n} f(t) \longleftrightarrow (j\omega)^n F(\omega)$$

$$(-jt)^n f(t) \longleftrightarrow \frac{d^n}{d\omega^n} F(\omega)$$

***

##### **Duality Property**<br>

$$\text{if } f(t) \longleftrightarrow F(\omega) \text{,   } F(t) \longleftrightarrow 2\pi f(-\omega)$$

derivation:<br>

According to Synthesis Equation

$$f(t) = \frac{1}{2\pi} \int_{-\infty}^{\infty} F(\omega) e^{j\omega t} \, d\omega$$

We an get

$$2\pi f(t) = \int_{-\infty}^{\infty} F(\omega) e^{j\omega t} \, d\omega$$

Then Variable Substitution: $t$ -> $-\omega$

$$2\pi f(-\omega) = \int_{-\infty}^{\infty} F(\omega') e^{-j\omega \omega'} \, d\omega'$$

Because 

$$\mathcal{F}\{F(t)\} = \int_{-\infty}^{\infty} F(t') e^{-j\omega t'} \, dt'$$

Get

$$\mathcal{F}\{F(t)\} = 2\pi f(-\omega)$$

***

##### Conjugation Property<br>

$$f^{\ast}(t) \longleftrightarrow F^{\ast}(-\omega)$$

***

</details>

<details>
  <summary>Special</summary>

##### Dirac Delta Function

$$\delta(t) \longleftrightarrow 1$$

***

##### Shifted Dirac Delta

$$\delta(t - t_0) \longleftrightarrow e^{-j\omega t_0}$$

***

##### Constant

$$C \longleftrightarrow 2\pi C \cdot \delta(\omega)$$

***

##### Complex Exponential

$$e^{j\omega_0 t} \longleftrightarrow 2\pi \delta(\omega - \omega_0)$$

***

##### **Periodic Dirac Comb**

$$\sum_{n=-\infty}^{\infty} \delta(t - nT) \longleftrightarrow \frac{2\pi}{T} \sum_{n=-\infty}^{\infty} \delta(\omega - n\omega_0)$$

We can find that  $f(t) = \sum_{n=-\infty}^{\infty} \delta(t - nT)$ is a periodic signal which we can use Fourier Series here:

$$f(t) = \sum_{k=-\infty}^{\infty} c_k e^{jk\omega_0 t}$$

$$c_k = \frac{1}{T} \int_{T} f(t) e^{-jk\omega_0 t} \, dt$$

So we can get 

$$  c_k = \frac{1}{T} \int_{-T/2}^{T/2} \delta(t) e^{-jk\omega_0 t} \, dt$$

Because of $\delta$

$$c_k =  \frac{1}{T}$$

$$  \sum_{n=-\infty}^{\infty} \delta(t - nT) = \sum_{k=-\infty}^{\infty} \left(\frac{1}{T}\right) e^{jk\omega_0 t}$$

Now look at the right side

$$\mathcal{F}\{ \sum_{k=-\infty}^{\infty} \frac{1}{T} e^{jk\omega_0 t} \} = \frac{1}{T} \sum_{k=-\infty}^{\infty} \mathcal{F}\{ e^{jk\omega_0 t} \}$$

According to the [Complex Exponential](#complex-exponential)

$$  \mathcal{F}\{e^{j\omega_A t}\} = 2\pi \delta(\omega - \omega_A)$$

$$\sum_{n=-\infty}^{\infty} \delta(t - nT) \longleftrightarrow \frac{2\pi}{T} \sum_{n=-\infty}^{\infty} \delta(\omega - n\omega_0)$$

***

##### Parseval's Theorem

$$\int_{-\infty}^{\infty} |f(t)|^2 \, dt = \frac{1}{2\pi} \int_{-\infty}^{\infty} |F(\omega)|^2 \, d\omega$$

***

</details>
</details>

</details>

## 2.Laplace()


