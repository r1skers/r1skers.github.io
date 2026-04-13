---
date: '2025-11-26T10:47:00+09:00'
draft: false
title: "[Crucible] Is Probability Just Normalized Energy? The Hidden Link between Born's Rule and Auto-correlation"
summary: "Bridging signal processing and quantum mechanics through a Hilbert-space view of energy, probability, and inner products."
description: "Starting from the formal similarity between auto-correlation and Born's rule, this post explores the shared structure behind energy, probability, and inner products."
tags: ["Born's Rule", "Auto-correlation", "Signal Processing", "Quantum Mechanics", "Hilbert Space" , "Eureka" , "Interdisciplinary"]
categories: ["Sparks"]
---

# The Question

When I checked my notes, I found that the formulas for auto-correlation and Born's rule look almost identical. Why? This post is an attempt to unpack that connection.

# Formula

Let us place the two formulas side by side first:

**Auto-Correlation ($\tau =0$):**

$$ E = R_{xx}(0) = \int_{-\infty}^{\infty} f(t) f^*(t) dt = \int_{-\infty}^{\infty} |f(t)|^2dt $$

**Born's Rule:**

$$P=\langle \psi | \psi \rangle = \int_{-\infty}^{\infty} \psi^*(x) \psi(x) \ dx = 1$$

So what does it really mean when a function is multiplied by its own conjugate?

# Explanation

## 1. A Mathematical “Self-Collision”

**Signal Processing (instantaneous power or energy density at time $t$):**

$$E(t) = f(t) f^*(t) = |f(t)|^2$$

**Quantum Mechanics (probability density at position $x$):**

$$P(x) = \psi(x) \psi^*(x) = |\psi(x)|^2$$

Why do they look the same? Because in functional analysis, both belong to the same structure: the **inner product in a Hilbert space**.

$$\langle f, f \rangle = \int f \cdot f^*$$

This is the squared length of a vector, whether that vector is a signal or a wave function.

[If that still feels abstract, this earlier post may help.](/posts/eurekadft_and_fftdive_into_fourier_transform/)

## 2. Physical Meaning: From Amplitude to Intensity

Their common ground is simple: they are both waves.

- A signal is a wave in voltage or current.
- A quantum state is a wave in probability amplitude.

But the common problem is also clear: complex numbers are not directly measurable.

Waves usually carry phase information, such as $e^{j\theta}$. Real instruments do not directly read out a complex number. A meter does not return a voltage with an imaginary part, and a particle detector does not return a probability with an imaginary part either.

What we can measure is **intensity**, meaning a real-valued quantity.

So how do we convert a complex amplitude with phase into a measurable real intensity? The answer is: **multiply it by its own conjugate.**

$$(A e^{j\theta}) \cdot (A e^{-j\theta}) = A^2$$

The phase cancels, leaving only the squared amplitude.

- In signal processing, that becomes power.
- In quantum mechanics, that becomes probability.

So in formal terms, Born probability density really does behave like a kind of “power density” of the wave function.

## 3. A Hilbert-Space Perspective

Once we treat the wave function as a vector, many things become more natural.

A continuous function can be understood as an infinitely long vector. Its value at each time or position behaves like the coordinate of that vector along one dimension.

[If you are already thinking about sampling here, that is a good sign.](/posts/convolution_and_sampling_in_fourier_laplace/#sampling)

Then there are only two steps:

1. Take the squared magnitude of each coordinate, namely $|f(t)|^2$.
2. Add them all up. For a continuous function, this becomes an integral.

The result is the square of the total vector length.

In signal processing it appears as total energy; in quantum mechanics it appears as total normalized probability.

## 4. A Historical View from Gemini

Why does this resemblance feel almost uncanny?

Because it is not really an accident. It is a historical inheritance.

1. **Schrodinger's original intuition:** when he wrote the wave equation, he was still thinking of particles as something like classical waves.
2. **The energy law of classical waves:** in classical physics, wave energy is usually proportional to amplitude squared.
3. **Born's interpretation:** later Born said this wave is not a material wave, but a probability wave. Yet the mathematical rule for intensity was kept.

So the sameness is not coincidental. Quantum mechanics directly inherited the mathematical framework of classical wave theory and replaced “energy” with “probability.”

# A Deeper Walkthrough

The explanation above tells us why the formulas look the same. But if we keep asking why this particular formula describes probability, we can walk through the idea step by step.

1. **First stop: where is the particle?**
   - Goal: describe the probability that a quantum particle appears at some position.
   - Dilemma: in classical physics, a particle is like a tiny ball with a definite position. But experiments show microscopic objects interfere like waves.
   - Conclusion: the particle cannot be treated as just a point; it must carry wave-like behavior.

2. **Second stop: then we need a function**
   - Tool: define a wave function $\psi(x)$.
   - Requirement: the function must support constructive and destructive interference, so a simple real-valued form is not enough.
   - Conclusion: $\psi(x)$ naturally moves toward a complex form with phase.

3. **Third stop: reality does not measure complex numbers**
   - Goal: connect the wave function to observable probability.
   - Dilemma: probability must be a nonnegative real number, while $\psi$ may be complex.
   - Conclusion: $\psi$ itself cannot directly be the probability. It must be transformed.

4. **Fourth stop: borrow intuition from classical waves**
   - The brightness of light depends on amplitude squared.
   - The loudness of sound depends on amplitude squared.
   - The energy of electrical signals also scales with amplitude squared.
   - That suggests a natural rule: observable wave intensity tends to come from amplitude squared.

5. **Fifth stop: Born's rule**
   - If the particle is described by a wave, then the probability density at a point should correspond to the wave intensity there.
   - For a complex wave function, the natural intensity is the modulus squared:

$$|\psi|^2 = \psi \cdot \psi^*$$

So we arrive at:

**probability density = wave intensity = modulus squared of the wave function.**
