---
date: '2025-10-29T19:01:21+09:00'
draft: false
title: 'RLC Circuit Analysis: A Comparison of Differential Equation and Laplace'
tags: ["basic", "markdown","math"]
categories: ["Promethean Fire", "Delphic Musings"]
---


# RLC Circuit Analysis: A Comparison of Differential Equation and Laplace Transform Methods

## Problem Background

In class, I learned to analyze oscillatory circuits by solving second-order linear differential equations. The standard method involves finding a homogeneous solution (natural response) and a particular solution (forced response), then using initial conditions to find the unknown constants.

This process, especially finding the current $i(t) = \frac{dq}{dt}$, often involves **messy differentiation with exponential and trigonometric functions**, which is time-consuming and easy to make mistakes in. This led me to search for a more systematic approach.

## The Laplace Transform Insight

I recalled that the **Laplace Transform** is designed to convert differential equations into algebraic equations. This seems perfect for circuit analysis.

### Concise Derivation of the Derivative Property

The key property of the Laplace Transform comes from its definition, using integration by parts.

We start with the transform of $f'(t)$:
$$\mathcal{L}\{f'(t)\} = \int_0^\infty e^{-st} f'(t) dt$$

Apply integration by parts $\int u \, dv = uv - \int v \, du$ (Let $u=e^{-st}$ and $dv=f'(t)dt$):
$$ = \left[ e^{-st} f(t) \right]_0^\infty - \int_0^\infty f(t) (-s e^{-st}) dt$$

Evaluating the boundary terms (assuming the term at $t \to \infty$ is zero) and using the definition of $F(s)$:
$$= (0 - f(0)) + s \int_0^\infty f(t) e^{-st} dt$$
$$= sF(s) - f(0)$$

This gives us the **First Derivative Property**:
$$\mathcal{L}\{f'(t)\} = sF(s) - f(0)$$

Applying this rule **recursively** gives the second derivative:
$$\mathcal{L}\{f''(t)\} = s\mathcal{L}\{f'(t)\} - f'(0)$$
$$ = s\left[sF(s) - f(0)\right] - f'(0)$$
$$ = s^2 F(s) - s f(0) - f'(0)$$

This is the essential tool that converts differential equations into algebraic ones.

## Example: Forced Series RLC Circuit

Let's analyze a series RLC circuit with the following components and source, assuming the switch closes at $t=0$:
* **Voltage Source (E):** $1000 \text{ V}$
* **Resistor (R):** $100 \ \Omega$
* **Inductor (L):** $4 \text{ mH} = 0.004 \text{ H}$
* **Capacitor (C):** $0.1 \ \mu\text{F} = 10^{-7} \text{ F}$
* **Initial Conditions:** The circuit is initially at rest, so $q(0) = 0$ and $i(0) = q'(0) = 0$.

<div class="mermaid">
graph TD
    subgraph Series RLC Circuit Example
        E(E = 1000V) --> |closed at t=0| R[R = 100Ω]
        R --> L[L = 4mH]
        L --> C[C = 0.1μF]
        C --> E
    end
</div>

The KVL equation for the circuit (in terms of charge $q$) is:
$$L \frac{d^2q}{dt^2} + R \frac{dq}{dt} + \frac{1}{C} q = E(t)$$

Plugging in the values:
$$0.004 q'' + 100 q' + \frac{1}{10^{-7}} q = 1000$$
$$0.004 q'' + 100 q' + 10,000,000 q = 1000$$

To simplify, divide by $L = 0.004$:
$$q'' + 25000 q' + 2,500,000,000 q = 250,000$$

We want to find the current, $i(t)$.

---

### Method 1: Traditional Differential Equation (DE)

The total solution is $q(t) = q_p(t) + q_h(t)$, where $q_p$ is the particular (steady-state) solution and $q_h$ is the homogeneous (transient) solution.

**1. Particular Solution ($q_p$):**
As $t \to \infty$, the inductor acts as a short and the capacitor as an open circuit. Thus, $i(\infty) = 0$, and the capacitor voltage equals the source voltage.
$q_p = C \times E = (10^{-7} \text{ F}) \times (1000 \text{ V}) = 10^{-4} \text{ C}$.

**2. Homogeneous Solution ($q_h$):**
We solve the characteristic equation for $q_h'' + 25000 q_h' + 2.5 \times 10^9 q_h = 0$:
$$s^2 + 25000s + 2,500,000,000 = 0$$

This is of the form $s^2 + 2\alpha s + \omega_0^2 = 0$.
* Damping factor: $\alpha = \frac{R}{2L} = \frac{100}{2(0.004)} = 12500$
* Resonant frequency: $\omega_0 = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{0.004 \times 10^{-7}}} = \frac{1}{\sqrt{4 \times 10^{-10}}} = 50000$

Since $\alpha < \omega_0$, the system is **underdamped**. The roots are $s_{1,2} = -\alpha \pm j\omega_d$, where $\omega_d$ is the damped frequency:
$\omega_d = \sqrt{\omega_0^2 - \alpha^2} = \sqrt{50000^2 - 12500^2} = \sqrt{(4 \times 12500)^2 - 12500^2}$
$\omega_d = 12500 \sqrt{16 - 1} = 12500\sqrt{15} \text{ rad/s}$

The homogeneous solution is:
$$q_h(t) = e^{-\alpha t} \left( A \cos(\omega_d t) + B \sin(\omega_d t) \right)$$
$$q_h(t) = e^{-12500t} \left( A \cos(12500\sqrt{15} t) + B \sin(12500\sqrt{15} t) \right)$$

**3. Total Solution and Initial Conditions:**
$q(t) = q_p + q_h = 10^{-4} + e^{-12500t} \left( A \cos(\omega_d t) + B \sin(\omega_d t) \right)$

* Apply $q(0) = 0$:
    $q(0) = 10^{-4} + e^0 (A \cos(0) + B \sin(0)) = 0 \implies 10^{-4} + A = 0 \implies \mathbf{A = -10^{-4}}$

* Apply $i(0) = q'(0) = 0$:
    First, we must differentiate $q(t)$ (this is the messy part):
    $i(t) = q'(t) = e^{-12500t} \left( -A\omega_d \sin(\omega_d t) + B\omega_d \cos(\omega_d t) \right) - 12500 e^{-12500t} \left( A \cos(\omega_d t) + B \sin(\omega_d t) \right)$
    Now, set $t=0$:
    $i(0) = e^0(-0 + B\omega_d) - 12500 e^0(A + 0) = 0$
    $B\omega_d - 12500A = 0 \implies B = \frac{12500A}{\omega_d} = \frac{12500(-10^{-4})}{12500\sqrt{15}}$
    $\mathbf{B = -\frac{10^{-4}}{\sqrt{15}}}$

**4. Final Current $i(t)$:**
To get the final expression for $i(t)$, we must plug these complex values of A and B back into the already massive equation for $q'(t)$. This is extremely tedious and a major source of potential errors.

---

### Method 2: Laplace Transform (The Clean Way)

Let's solve for the **current $I(s)$** directly. The KVL equation in the time domain is:
$$L \frac{di}{dt} + Ri + \frac{1}{C} \int_0^t i(\tau) d\tau + v_c(0) = E(t)$$

Applying the Laplace Transform (with $i(0)=0$ and $v_c(0)=q(0)/C=0$):
$$L[sI(s) - i(0)] + RI(s) + \frac{1}{C} \frac{I(s)}{s} = \frac{E}{s}$$
$$L sI(s) + RI(s) + \frac{1}{Cs} I(s) = \frac{E}{s}$$

Multiply all terms by $s$ to clear the denominators:
$$L s^2 I(s) + R s I(s) + \frac{1}{C} I(s) = E$$
$$I(s) \left( Ls^2 + Rs + \frac{1}{C} \right) = E$$
$$I(s) = \frac{E}{Ls^2 + Rs + 1/C}$$

Notice this is much faster! Let's divide the numerator and denominator by $L$:
$$I(s) = \frac{E/L}{s^2 + (R/L)s + 1/LC}$$

Now, plug in the values:
* $E/L = 1000 / 0.004 = 250,000$
* $R/L = 100 / 0.004 = 25,000$
* $1/LC = 2,500,000,000$

$$I(s) = \frac{250,000}{s^2 + 25000s + 2,500,000,000}$$

This is just algebra! Now we complete the square on the denominator. We already know from Method 1 that the roots are complex, so we use the form $(s+\alpha)^2 + \omega_d^2$:
$$s^2 + 25000s + 2.5 \times 10^9 = (s + 12500)^2 + (12500\sqrt{15})^2$$

So, $I(s)$ becomes:
$$I(s) = \frac{250,000}{(s + 12500)^2 + (12500\sqrt{15})^2}$$

We need to match the inverse transform pair for a damped sine wave:
$$\mathcal{L}^{-1} \left\{ \frac{b}{(s+a)^2 + b^2} \right\} = e^{-at} \sin(bt)$$
Here, $a = 12500$ and $b = 12500\sqrt{15}$. We just need to adjust the numerator:

$$I(s) = \left( \frac{250,000}{12500\sqrt{15}} \right) \cdot \frac{12500\sqrt{15}}{(s + 12500)^2 + (12500\sqrt{15})^2}$$

The constant in front simplifies:
$$\frac{250,000}{12500\sqrt{15}} = \frac{20}{\sqrt{15}}$$

So, $I(s)$ is:
$$I(s) = \left( \frac{20}{\sqrt{15}} \right) \cdot \frac{12500\sqrt{15}}{(s + 12500)^2 + (12500\sqrt{15})^2}$$

Now, taking the inverse Laplace transform is trivial:
$$i(t) = \frac{20}{\sqrt{15}} e^{-12500t} \sin(12500\sqrt{15} t) \text{ (A)}$$

## Summary

* **Traditional DE Method:** Required finding a particular solution, a homogeneous solution, solving for two constants (A and B) using initial conditions, and then performing a very complex differentiation to find $i(t)$.
* **Laplace Transform Method:** Directly converted the KVL equation into an algebraic expression for $I(s)$. All initial conditions ($i(0)=0, v_c(0)=0$) were handled automatically. Solving for $i(t)$ was reduced to a simple algebraic rearrangement and looking up a standard inverse transform pair.

This confirms my initial suspicion: the Laplace Transform is a far superior and more efficient tool for solving complex linear circuits, especially those with initial conditions and driving sources.