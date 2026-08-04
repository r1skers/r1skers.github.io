---
date: '2025-11-12T10:17:00+09:00'
draft: false
title: 'Linear Systems Part 1: Fourier Transform'
summary: "Starting from orthogonality to connect Fourier series and Fourier transform: why decomposition works, how coefficients are computed, and how discrete spectra become continuous."
tags: ["Mathematics", "Signal & Systems", "Fourier Transform"]
categories: ["Notes"]
series: ["Signal and Systems"]
note_kind: "foundation"
aliases:
---


Order: why decomposition is possible -> how to compute coefficients -> continuous limit (Fourier transform).

---


Orthogonality means basis functions do not mix under inner products.

For periodic signals, over one period, $\sin$ and $\cos$ cross terms integrate to zero unless frequencies match.

**Key point:**  
Orthogonality makes decomposition possible because different frequency components do not interfere.


Use complex exponentials to check orthogonality of cosines:

$$
\int_{t_0}^{t_0+T}\cos(m\omega_0 t)\cos(n\omega_0 t)dt
$$

$$
= \frac{1}{4}\int_{t_0}^{t_0+T}
(e^{im\omega_0 t}+e^{-im\omega_0 t})(e^{in\omega_0 t}+e^{-in\omega_0 t})dt
$$

The integral becomes a sum of exponentials. All terms average to 0 over one period unless $m=n$.

When $m=n$, we get:

$$
\int_{t_0}^{t_0+T}\cos^2(n\omega_0 t)dt = \frac{T}{2}
$$

So different cosine modes are orthogonal.

**Results**

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


Since the basis is orthogonal, we can use projection to read one specific frequency component.

If you want to know how much $\cos(n\omega_0 t)$ is in the signal, multiply by it and integrate.

Intuitively: the target frequency remains, while other frequencies average out.


If

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t}
$$

multiply both sides by $e^{-jk\omega_0 t}$ and integrate over one period:

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt
= \sum_{n=-\infty}^{\infty} c_n \int_{t_0}^{t_0+T} e^{j(n-k)\omega_0 t}dt
$$

Only the $n=k$ term survives, so

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt = Tc_k
$$

Thus

$$
c_k = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}dt
$$

---


If a signal has period $T$, with fundamental frequency $\omega_0=\frac{2\pi}{T}$, it can be written as

$$
f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \right)
$$

The coefficients are exactly projection results:

$$
a_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\cos(n\omega_0 t)dt,\quad
b_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\sin(n\omega_0 t)dt
$$

**Interpretation:**  
These coefficients are the signal's coordinates along each frequency direction.

The complex form is more compact:

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t},\quad
c_n = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jn\omega_0 t}dt
$$

---


Fourier series fits **periodic signals** because frequencies are discrete.

What about non-periodic signals?

The intuition is to let the period grow to infinity so frequency spacing shrinks to zero, turning a discrete spectrum into a continuous one.

So "discrete coefficients" become a "continuous spectrum":

$$
F(\omega) = \int_{-\infty}^{\infty} f(t)e^{-j\omega t}dt
$$

The inverse transform recombines all frequencies:

$$
f(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty} F(\omega)e^{j\omega t}d\omega
$$

**My own mnemonic:**  
Fourier transform decomposes a signal into infinitely many pure frequency components; the frequency-domain plot is their "strength map."

---


- Orthogonality: guarantees decomposition, with non-interfering components.
- Projection: read a target frequency by multiply-and-integrate.
- Fourier coefficients: frequency-basis coordinates of periodic signals.
- Fourier transform: continuous spectrum from the infinite-period limit.
