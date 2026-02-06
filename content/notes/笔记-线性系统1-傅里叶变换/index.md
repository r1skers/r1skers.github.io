---
date: '2025-11-12T10:17:00+09:00'
draft: false
title: 'Linear Systems Part 1: Fourier Transform & Laplace Transform'
summary: "Unveiling the mathematical symmetry between Time and Frequency domains. A deep dive into why multiplication in one domain equals convolution in the other, and the mystery of spectrum replication."
tags: [ "Fourier Transform", "Laplace Transform", "Convolution", "Sampling", "Signal & Systems"]
categories: ["The Crucible"]
---

# From Orthogonality to the Fourier Transform

Order: why decomposition is possible → how to compute coefficients → continuous limit (Fourier transform).

---

## 1. Orthogonality: Non-Interfering Basis Functions

Orthogonality means basis functions do not mix under inner products.  
For periodic signals, $\sin$ and $\cos$ are orthogonal over one period unless frequency and phase match.

**Key point**:  
Orthogonality makes decomposition possible because different frequency components do not interfere.

### Derivation 

Use complex exponentials to check orthogonality of cosines:

$$
\int_{t_0}^{t_0+T}\cos(m\omega_0 t)\cos(n\omega_0 t)\,dt
$$

$$
= \frac{1}{4}\int_{t_0}^{t_0+T}
(e^{im\omega_0 t}+e^{-im\omega_0 t})(e^{in\omega_0 t}+e^{-in\omega_0 t})\,dt
$$

The integral becomes a sum of exponentials.  
All terms average to 0 over one period unless $m=n$, in which case the result is:

$$
\int_{t_0}^{t_0+T}\cos^2(n\omega_0 t)\,dt = \frac{T}{2}
$$

So different cosine modes are orthogonal.

**Results**

$$
\int_{t_0}^{t_0+T}\cos(m\omega_0 t)\cos(n\omega_0 t)\,dt =
\begin{cases}
0,& m\neq n\\[4pt]
\frac{T}{2},& m=n\neq 0
\end{cases}
$$

$$
\int_{t_0}^{t_0+T}\sin(m\omega_0 t)\sin(n\omega_0 t)\,dt =
\begin{cases}
0,& m\neq n\\[4pt]
\frac{T}{2},& m=n\neq 0
\end{cases}
$$

$$
\int_{t_0}^{t_0+T}\sin(m\omega_0 t)\cos(n\omega_0 t)\,dt = 0
$$

---

## 2. Filtering (Projection): Read One Frequency Only

Since the basis is orthogonal, we can filter by projection.  
If you want to know how much $\cos(n\omega_0 t)$ is inside the signal, correlate with it.

Intuitively:  
Multiply the signal by a basis function and integrate. All other frequencies average out to zero, leaving only the target component.

This is the bridge from orthogonality to coefficients.

### “Filter” view for complex coefficients

If

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t}
$$

then multiply by $e^{-jk\omega_0 t}$ and integrate over one period:

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}\,dt
= \sum_{n=-\infty}^{\infty} c_n \int_{t_0}^{t_0+T} e^{j(n-k)\omega_0 t}\,dt
$$

Only the $n=k$ term survives (orthogonality), so:

$$
\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}\,dt = T\,c_k
$$

Thus the coefficient is

$$
c_k = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jk\omega_0 t}\,dt
$$

---

## 3. Fourier Coefficients: Decomposition of a Periodic Signal

If a signal has period $T$, the fundamental frequency is $\omega_0 = \frac{2\pi}{T}$.  
Then it can be written as:

$$
f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n\omega_0 t) + b_n \sin(n\omega_0 t) \right)
$$

The coefficients are exactly those projections:

$$
a_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\cos(n\omega_0 t)\,dt,\quad
b_n = \frac{2}{T} \int_{t_0}^{t_0+T} f(t)\sin(n\omega_0 t)\,dt
$$

**Interpretation**:  
These coefficients are the coordinates of the signal along each frequency direction.

The complex exponential form is more compact:

$$
f(t) = \sum_{n=-\infty}^{\infty} c_n e^{jn\omega_0 t},\quad
c_n = \frac{1}{T}\int_{t_0}^{t_0+T} f(t)e^{-jn\omega_0 t}\,dt
$$

---

## 4. From Fourier Series to the Fourier Transform

Fourier series fits **periodic signals**, because the frequencies are discrete.  
What about non-periodic signals?

Intuitively:  
Let the period grow larger and larger, so the frequency spacing shrinks to zero and the spectrum becomes continuous.

So "discrete coefficients" become a "continuous spectrum":

$$
F(\omega) = \int_{-\infty}^{\infty} f(t)e^{-j\omega t}\,dt
$$

The inverse transform recombines all frequencies:

$$
f(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty} F(\omega)e^{j\omega t}\,d\omega
$$

**My own mnemonic**:  
Fourier transform = "decompose a signal into infinitely many pure frequency components."  
The frequency-domain plot is the "strength map" of those components.

---

## 5. Summary

- Orthogonality: decomposition works because components do not interfere.  
- Filtering/projection: multiply and integrate to read one frequency component.  
- Fourier coefficients: the "frequency coordinates" of a periodic signal.  
- Fourier transform: infinite period → continuous frequency axis.
