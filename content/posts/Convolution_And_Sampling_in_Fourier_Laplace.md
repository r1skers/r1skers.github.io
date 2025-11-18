---
date: '2025-11-12T10:17:00+09:00'
draft: false
title: 'Convolution and Sampling in Fourier and Laplace'
tags: ["basic", "markdown","Fourier and Laplace"]
categories: ["Promethean Fire", "Fireside Notes"]
---
<details>
    <summary style="font-size: 25px;">Interesting place</summary>
    <p>1. 1/2pai between FT and IFT<p>
    <p>2. t-domain->s-domain<p>

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
    <strong>FT</strong>:As can be seen from the formula, the upper and lower limits of the Fourier Transform are both infinity, making it a bilateral transform. It is generally used to analyze eternal signals, i.e., signals with no starting point, such as radio broadcasts.<br>
    <strong>LT</strong>:As can be seen from the formula, the upper and lower limits of the Laplace Transform are from 0 to positive infinity, making it a unilateral transform. It perfectly simulates real-world situations (time cannot be less than 0) and thus can be used to solve initial value problems.
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

$$c_n = \frac{1}{T} \int_{T} f(t) e^{-jn\omega_0 t} \ dt$$
</details>

<details>
  <summary style="font-size: 25px;">Fourier transform</summary>

<details>
  <summary style="font-size: 20px;">Analysis Equation</summary>

$$F(\omega) = \mathcal{F}\[f(t)\] = \int_{-\infty}^{\infty} f(t) e^{-j\omega t} \ dt$$

</details>
<details>
  <summary style="font-size: 20px;">Synthesis Equation</summary>

$$f(t) = \mathcal{F}^{-1}\[{F(\omega)\} ]= \frac{1}{2\pi} \int_{-\infty}^{\infty} F(\omega) e^{j\omega t} \ d\omega$$
</details>
<details>
  <summary style="font-size: 20px;">Properties of the Fourier Transform</summary>
<details>
  <summary>Basics</summary>

### Linearity Property<br>

$$a f_1(t) + b f_2(t) = a F_1(\omega) + b F_2(\omega)$$

***

### **Scaling Property**<br>

$$\mathcal{F}[f(at)] = \frac{1}{|a|} F\left(\frac{\omega}{a}\right)$$

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/傅里叶变换的相似性证明.jpg" alt="Proof" width="100%" height="auto">

</details>

***

### Time/Frequency-Shifting Property<br>

$$f(t - t_0) = e^{-j\omega t_0} F(\omega)$$

$$e^{j\omega_0 t} f(t) = F(\omega - \omega_0)$$

***

### Time/Frequency Differentiation Property<br>

$$\frac{d^n}{dt^n} f(t) = (j\omega)^n F(\omega)$$

$$(-jt)^n f(t) = \frac{d^n}{d\omega^n} F(\omega)$$

***

### **Duality Property**<br>

$$\text{if } f(t) = F(\omega) \text{,   } F(t) = 2\pi f(-\omega)$$



***

</details>

<details>
  <summary>Special</summary>

### Dirac Delta Function

$$\mathcal{F}[\delta(t)] =1$$

***

### Shifted Dirac Delta

$$\mathcal{F}[\delta(t - t_0)] = e^{-j\omega t_0}$$

***

### Constant

$$\mathcal{F}[C ]= 2\pi C \cdot \delta(\omega)$$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/常数的傅里叶变换证明.jpg" alt="Proof" width="100%" height="auto">

</details>

***

### Complex Exponential

$$\mathcal{F}[e^{j\omega_0 t}] = 2\pi \delta(\omega - \omega_0)$$

***

### **Periodic Dirac Comb**

$$\sum_{n=-\infty}^{\infty} \delta(t - nT) = \frac{2\pi}{T} \sum_{n=-\infty}^{\infty} \delta(\omega - n\omega_0)$$

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

$$\sum_{n=-\infty}^{\infty} \delta(t - nT) = \frac{2\pi}{T} \sum_{n=-\infty}^{\infty} \delta(\omega - n\omega_0)$$

***

### Parseval's Theorem

$$\int_{-\infty}^{\infty} |f(t)|^2 \, dt = \frac{1}{2\pi} \int_{-\infty}^{\infty} |F(\omega)|^2 \, d\omega$$

***

</details>
</details>

</details>

## 2.Laplace()
<details>
  <summary style="font-size: 25px;">Analysis Equation</summary>
  $$F(s) =\mathcal{L}\{f(t)\} = \int_{0}^{\infty} e^{-st} f(t) \, dt$$
</details>
<details>
  <summary style="font-size: 25px;">Synthesis Equation</summary>
  $$f(t) = \mathcal{L}^{-1}\{F(s)\} = \frac{1}{2\pi j} \int_{\gamma - j\infty}^{\gamma + j\infty} e^{st} F(s) \, ds$$
</details>
<details>
  <summary style="font-size: 25px;">Properties of the Laplace Transform</summary>
  <details>
  <summary style="font-size: 20px;">Basic</summary>

###  Linearity Property
$$\mathcal{L}\[{a \cdot f(t) + b \cdot g(t)\}] = a \cdot F(s) + b \cdot G(s)$$

***

### Scaling Property
$$\mathcal{L}\[{f(a \cdot t)\}] = \frac{1}{|a|} \cdot F\left(\frac{s}{a}\right)$$
</details>
<details>
  <summary style="font-size: 20px;">Special</summary>

### Differentiation in the Time Domain(t)
$$\mathcal{L}\left[ f'(t) \right] = s\mathcal{L}[f(t)] - f(0)$$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  <br> <img src="/img/proof/t时域微分的拉普拉斯变换证明.jpg" alt="Proof" width="100%" height="auto">
</details>

***

### Integration in the Time Domain(t)
$$\mathcal{L}\left[ \int_{0}^{t} f(\tau) d\tau \right] = \frac{1}{s}\mathcal{L}[f(t)]$$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/t时域积分的拉普拉斯变换证明.jpg" alt="Proof" width="100%" height="auto">

</details>

***

### Differentiation in the Frequency Domain(s)
$$\frac{d}{ds} \mathcal{L}[f(t)] = \mathcal{L}\left[ -tf(t) \right] $$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/s时域微分的拉普拉斯变换证明.jpg" alt="Proof" width="100%" height="auto">

</details>

***

### Integration in the Frequency Domain(s)
$$\mathcal{L}\left[ \frac{1}{t}f(t) \right] = \int_{s}^{\infty} F(\sigma) d\sigma$$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/s时域积分的拉普拉斯变换证明.jpg" alt="Proof" width="100%" height="auto">

</details>

***

### Shifting in the Time Domain(t)

$$\mathcal{L}\left[ f(t-\lambda) u(t-\lambda) \right] = e^{-\lambda s} \mathcal{L}[f(t)]$$

### Shifting in the Frequency Domain(s)

$$\mathcal{L}\left[ e^{\sigma t} f(t) \right] = F(s-\sigma)$$
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Proof
  </summary>
  
  <br> <img src="/img/proof/位移后的拉普拉斯变换证明.jpg" alt="Proof" width="100%" height="auto">

</details>

</details>
</details>