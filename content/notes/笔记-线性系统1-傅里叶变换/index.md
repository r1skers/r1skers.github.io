---
date: '2025-11-12T10:17:00+09:00'
draft: false
title: '线性系统第1部分：傅里叶变换'
summary: "从正交性出发，串起傅里叶级数与傅里叶变换的核心逻辑：为什么可分解、如何求系数、如何走向连续频谱。"
tags: [ "Fourier Transform", "Laplace Transform", "Convolution", "Sampling", "Signal & Systems"]
categories: ["Crucible"]
---

# 从正交性到傅里叶变换 <p> From Orthogonality to the Fourier Transform

顺序：为什么能分解 -> 如何求系数 -> 连续极限（傅里叶变换）。

---

## 1. 正交性：互不干扰的基函数 <p>  Orthogonality: Non-Interfering Basis Functions

正交性意味着在内积下，不同基函数不会互相混叠。  

对周期信号来说，在一个周期内，除非频率一致，$\sin$ 与 $\cos$ 的交叉项会积分为 0。  
For periodic signals, over one period, $\sin$ and $\cos$ cross terms integrate to zero unless frequencies match.

**关键点：**  
正交性让分解成为可能，因为不同频率分量不会互相干扰。  

### 推导 <p> Derivation

用复指数来检验余弦正交性：  

$$
\int_{t_0}^{t_0+T}\cos(m\omega_0 t)\cos(n\omega_0 t)dt
$$

$$
= \frac{1}{4}\int_{t_0}^{t_0+T}
(e^{im\omega_0 t}+e^{-im\omega_0 t})(e^{in\omega_0 t}+e^{-in\omega_0 t})dt
$$

积分会拆成多项指数函数。除 $m=n$ 外，其余项在一个周期上平均为 0。  
The integral becomes a sum of exponentials. All terms average to 0 over one period unless $m=n$.

当 $m=n$ 时，得到：  
When $m=n$, we get:

$$
\int_{t_0}^{t_0+T}\cos^2(n\omega_0 t)dt = \frac{T}{2}
$$

因此不同余弦模态彼此正交。  

**结果**  

$$
\int_{t_0}^{t_0+T}\cos(m\omega_0 t)\cos(n\omega_0 t)\mathrm{d}t =
\begin{cases}
0, & m\neq n\\\\
\frac{T}{2}, & m=n\neq 0
\end{cases}
$$

$$
\int_{t_0}^{t_0+T}\sin(m\omega_0 t)\sin(n\omega_0 t)\mathrm{d}t =
\begin{cases}
0, & m\neq n\\\\
\frac{T}{2}, & m=n\neq 0
\end{cases}
$$

$$
\int_{t_0}^{t_0+T}\sin(m\omega_0 t)\cos(n\omega_0 t)\mathrm{d}t = 0
$$

---

## 2. 投影（滤波）思想：只读出一个频率<p> Filtering (Projection): Read One Frequency Only

基函数正交后，就可以用投影读取指定频率分量。  

若你想知道信号里有多少 $\cos(n\omega_0 t)$，就把信号与它相乘并积分。  
If you want to know how much $\cos(n\omega_0 t)$ is in the signal, multiply by it and integrate.

直觉上：目标频率被保留，其他频率在积分后平均掉。  

### 复指数系数的“滤波视角” <p> “Filter” View for Complex Coefficients

若

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t}
$$

两边乘 $e^{-jk\omega_0 t}$ 并在一个周期内积分：  
multiply both sides by $e^{-jk\omega_0 t}$ and integrate over one period:

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt
= \sum_{n=-\infty}^{\infty} c_n \int_{t_0}^{t_0+T} e^{j(n-k)\omega_0 t}dt
$$

只有 $n=k$ 项不为零，因此  
Only the $n=k$ term survives, so

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt = Tc_k
$$

于是  

$$
c_k = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt
$$

---

## 3. 傅里叶系数：周期信号的频率坐标 <p> Fourier Coefficients: Frequency Coordinates of a Periodic Signal

若信号周期为 $T$，基频为 $\omega_0=\frac{2\pi}{T}$，可写成  
If a signal has period $T$, with fundamental frequency $\omega_0=\frac{2\pi}{T}$, it can be written as

$$
f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \right)
$$

系数就是投影结果：  

$$
a_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\cos(n\omega_0 t)dt,\quad
b_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\sin(n\omega_0 t)dt
$$

**解释：**  
这些系数就是信号在各频率方向上的坐标。  

复指数形式更紧凑：  

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t},\quad
c_n = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jn\omega_0 t}dt
$$

---

## 4. 从傅里叶级数到傅里叶变换 <p> From Fourier Series to the Fourier Transform

傅里叶级数适用于**周期信号**，因为频率是离散的。  

那非周期信号怎么办？  

直觉是让周期趋于无穷大，频率间隔趋于 0，于是频谱由离散变连续。  

于是“离散系数”变成“连续谱函数”：  

$$
F(\omega) = \int_{-\infty}^{\infty} f(t)e^{-j\omega t}dt
$$

逆变换把连续频率重新合成为时域信号：  

$$
f(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty} F(\omega)e^{j\omega t}d\omega
$$

**记忆方式（个人版）：**  
傅里叶变换就是把信号分解成无限多个纯频率分量，频域图是它们的“强度地图”。  

---

## 5. 小结 <p> Summary

- 正交性：保证分解可行，分量互不干扰。  
- 投影：通过乘积积分读取指定频率。  
- 傅里叶系数：周期信号在频率基上的坐标。  
- 傅里叶变换：由无限周期极限得到连续频谱。  
