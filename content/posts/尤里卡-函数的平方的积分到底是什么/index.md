---
date: '2025-11-26T10:47:00+09:00'
draft: false
title: "[Crucible] Is Probability Just Normalized Energy? The Hidden Link between Born's Rule and Auto-correlation"
summary: "Bridging the gap between Signal Processing and Quantum Mechanics. A mathematical exploration of how Hilbert Space inner products unify the concepts of Energy and Existence."
tags: ["Born's Rule", "Auto-correlation", "Signal Processing", "Quantum Mechanics", "Hilbert Space" , "Eureka" , "Interdisciplinary"]
categories: ["Sparks"]
---

# The Question
When I checked my notes, I found that the formulas for auto-correlation and Born's rule look identical. Why? In this article, we are going to explore this connection.

# Formula
First, let's have a look at these two formulas:

**Auto-Correlation ($\tau =0$):**

$$ E = R_{xx}(0) = \int_{-\infty}^{\infty} f(t) f^*(t) dt = \int_{-\infty}^{\infty} |f(t)|^2dt $$

**Born's Rule:**

$$P=\langle \psi | \psi \rangle = \int_{-\infty}^{\infty} \psi^*(x) \psi(x) \ dx = 1$$

So, what does a function multiplied by its conjugate actually describe?

# Explanation

## 1. "Collision" in Mathematical Form

**Signal Processing (Instantaneous power/energy density at time $t$):**

$$E(t) = f(t) f^*(t) = |f(t)|^2$$

**Quantum Mechanics (The probability density at position $x$):**

$$P(x) = \psi(x) \psi^*(x) = |\psi(x)|^2$$

**Why is it the same?**
In mathematical functional analysis, they both belong to the concept of the **Inner Product** in a **Hilbert Space**.

$$\langle f, f \rangle = \int f \cdot f^*$$

This represents **the square of the length** (norm) of a vector (whether it is a signal or a wave function).

[Some readers might find this concept difficult.](https://r1skers.github.io/posts/eurekadft_and_fftdive_into_fourier_transform/)

## 2. Physical Essence: From "Amplitude" to "Intensity"

**Common Ground**
Both are **Waves**.
* A signal is a wave of voltage/current.
* A quantum state is a wave of probability amplitude.

**The Common Problem**
**Complex numbers cannot be directly measured.** Waves usually contain phase information ($e^{j\theta}$), so they are essentially complex numbers. However, in the real world, electricity meters cannot read complex numbers, and particle detectors cannot read complex numbers either. We can only measure **"Intensity"** (Real numbers).

**The Solution**
How do we convert a complex number containing a phase into a real intensity? The answer is: **multiply it by its own conjugate.**

$$(A e^{j\theta}) \cdot (A e^{-j\theta}) = A^2$$

The phase is eliminated, leaving only the square of the amplitude (intensity).
* In signals: This is called power (the square of voltage).
* In quantum mechanics: This is called probability (the square of the wave amplitude).

In fact, the Born probability density is essentially the "power density" (or intensity) of the quantum wave function.

## 3. A Perspective in Hilbert Space
**Treat "wave function" as a "vector"**
A continuous function is essentially a "super long" vector with infinitely many components.
The value $f(t)$ at each moment $t$ is the **"coordinate value"** of this vector in this dimension.<p>
[Maybe someone has found something interesting... (Hint: Sampling)](https://r1skers.github.io/posts/convolution_and_sampling_in_fourier_laplace/#sampling)

**Squaring: Take each "coordinate value" and square it ($|f(t)|^2$)**
This is to calculate the squared modulus of the component.

**Summing**
Add up (integrate) all these infinitely many "squared values". This gives the square of the total length (that is, the total energy).

## 4. Insight from Gemini
Why is there such an astonishing coincidence? It's actually not a coincidence, but a historical legacy.

1.  **Schrödinger's inspiration:** When Schrödinger wrote the wave equation, he regarded particles as a kind of **"classical wave"** (like sound waves or water waves).
2.  **Energy of classical waves:** In classical physics, the energy of a wave is always proportional to the square of its amplitude.
3.  **Born's interpretation:** Later, Max Born said, "Hey, this wave is not a physical material wave, but a probability wave." However, the mathematical rules for calculating "intensity" were retained.

Therefore, the "sameness" you see exists because quantum mechanics directly borrowed the mathematical framework of classical wave theory (which is now the foundation of signal processing), only replacing the term "energy" with "probability".

# Deep Dive
We just discussed *why* their formulas look the same, but it might still be hard to understand *how* we can use this formula to describe energy/probability. Here is the thought process regarding quantum mechanics:

1.  **First Stop: Starting Point — "Where exactly is it?"**
    * **Task:** I want to describe the position probability of a quantum particle (such as an electron) at a certain moment.
    * **Dilemma:** Classical physics states that a particle is like a ball with a definite position. However, experiments have found that microscopic particles can undergo interference (canceling each other out like water waves).
    * **Conclusion 1:** A particle is not a point; it is essentially a kind of "wave."

2.  **Second Stop: Describing Waves — "I need a function"**
    * **Task:** I need a mathematical tool to describe the undulations of this wave.
    * **Tool:** We define a function $\psi(x)$, calling it the wave function.
    * **Requirement:** This wave must be able to describe "interference". That is, when a wave crest meets a wave trough, they should be able to become 0 (canceling each other out).
    * **Conclusion 2:** $\psi(x)$ must have both positive and negative values, and it implies using complex numbers (because the complex number $e^{i\theta}$ perfectly describes rotation and phase).

3.  **Third Stop: The Gap in Reality — "Complex Numbers Do Not Exist"**
    * **Task:** I need to measure the probability of this particle appearing.
    * **Dilemma:** My wave function $\psi$ is a complex number (e.g., $1 + i$). However, "probability" must be a real number (there can't be a probability of $30\% + 20i$). Moreover, probability must be non-negative.
    * **Conclusion 3:** $\psi$ itself cannot directly represent probability. We need to perform a **modification** on $\psi$ to turn it into a positive real number.

4.  **Fourth Stop: Inspiration from Classics — "Energy and Amplitude"**
    * **Task:** Seeking inspiration for transformation. Review classical physics (signal processing):
        * **Light waves:** Brightness (intensity) is not field $E$, but $E^2$.
        * **Sound waves:** Loudness is not amplitude $A$, but $A^2$.
        * **Voltage:** Signal energy is not $V$, but proportional to $V^2$.
    * **Physical intuition:** In the classical world, "the intensity of a wave" is always proportional to "the square of its amplitude".

5.  **Fifth Stop: The Destination — "The Born Rule"**
    * **Reasoning:** Since particles are waves, the "likelihood" (probability density) of a particle appearing somewhere should be equivalent to the **intensity** of the wave there.
    * **Operation:** Treat the complex wave function $\psi$ as the "amplitude". Following the example of classical physics, calculate its "intensity". Because it is a complex number, calculate the square of its modulus (multiply it by its conjugate): $|\psi|^2 = \psi \cdot \psi^*$.
    * **Final Conclusion:** Probability density = Intensity of the wave = Square of the modulus of the wave function $|\psi|^2$.
