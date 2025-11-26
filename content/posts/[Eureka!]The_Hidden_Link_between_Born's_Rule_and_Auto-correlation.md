---
date: '2025-11-26T10:47:00+09:00'
draft: false
title: '[Eureka!]Probability is just Normalized Energy? The Hidden Link between Borns Rule and Auto-correlation[To be continued]'
tags: ["Advanced","Fourier and Laplace","Convolution and Sampling"]
categories: ["Eureka!"]
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

1.  First stop: Starting point — "Where exactly is it?"
Task: I want to describe the position probability of a quantum particle (such as an electron) at a certain moment. Dilemma: Classical physics states that a particle is like a ball with a definite position. However, experiments have found that microscopic particles can undergo interference (canceling each other out like water waves). Conclusion 1: A particle is not a point; it is essentially a kind of "wave."

2.  Second stop: Describing waves — "I need a function"
Task: I need a mathematical tool to describe the undulations of this wave. Tool: We define a function $\psi(x)$, calling it the wave function. Requirement: This wave must be able to describe "interference". That is, when a wave crest meets a wave trough, they should be able to become 0 (canceling each other out when added). Conclusion 2: $\psi(x)$ must have both positive and negative values, and it must even be a complex number (because the complex number $e^{i\theta}$ perfectly describes rotation and phase).

3.  Third stop: The Gap in Reality — "Complex Numbers Do Not Exist"
Task: I need to measure the probability of this particle appearing. Dilemma: <p>
My wave function $\psi$ is a complex number (for example, $1 + i$). However, "probability" must be a real number (there can't be a probability of 30% + 20i). Moreover, probability must be non-negative (there can't be a probability of -10%). Conclusion 3: $\psi$ itself cannot directly represent probability. We need to perform a **modification** on $\psi$ to turn it into a positive real number.

4.  Fourth Stop: The Inspiration from Classics — "Energy and Amplitude"
Task: Seeking inspiration for transformation. Review classical physics (signal processing):<p>
Light waves: Light is also a wave. The brightness (intensity) of light is not the electric field $E$, but the square of the electric field $E^2$.<p>
Sound waves: The loudness of sound is not the amplitude $A$, but the square of the amplitude $A^2$.<p>
Voltage: The energy of a signal is not $V$, but $V^2$.<p>
Physical intuition: In the classical world, "the intensity of a wave" is always proportional to "the square of its amplitude".<p>

5.  Fifth stop: The destination — "The Born Rule"
Reasoning: Since particles are waves, the "magnitude of possibility" (probability density) of a particle appearing somewhere should be equivalent to the **intensity** of the wave there.
Operation: <p>
Treat the complex wave function $\psi$ as the "amplitude". Following the example of classical physics, calculate its "intensity".<p>
Because it is a complex number, calculate the square of its modulus (multiply it by its conjugate): $|\psi|^2 = \psi \cdot \psi^*$.<p>
Final conclusion: Probability density = Intensity of the wave = Square of the modulus of the wave function $|\psi|^2$.