---
date: '2025-10-29T19:01:21+09:00'
draft: false
title: 'Linear Systems Part 3: RLC Circuit Analysis (Differential Equations vs. Laplace Transform)'
summary: "Compare two solution paths for second-order linear circuits: the traditional differential-equation method and the Laplace-transform method, highlighting Laplace advantages for initial-value problems."
tags: ["RLC Circuit", "Differential Equations", "Laplace Transform", "Python", "Schemdraw","Eureka"]
categories: ["Crucible"]
aliases:
  - /notes/note-linsys-3-laplace-pde/
---

RLC Circuit Analysis: Differential Equation vs. Laplace Method

Problem Background

In class, oscillatory circuits are often solved through second-order linear differential equations.

The standard workflow is to find a homogeneous solution (natural response) and a particular solution (forced response), then use initial conditions to determine constants.

In practice, especially when finding current $i(t)=\frac{dq}{dt}$, differentiation across exponentials and trigonometric terms becomes tedious and error-prone.

That is why I compared the Laplace method: whether it is more systematic and engineering-friendly.

Example: Forced Series RLC Circuit

Consider the following series RLC circuit, with the switch closing at $t=0$:

<details>
    <summary>Code (python)</summary>

```python
import schemdraw
import schemdraw.elements as elm
with schemdraw.Drawing(file='RLC示例图1') as d:
    d += (V1 := elm.SourceSin().up().label('$V_{in}$\n$1000V$'))
    d += elm.Resistor().right().label('$R$\n$100\Omega$')
    d += elm.Inductor().right().label('$L$\n$4mH$')
    d += elm.Capacitor().down().label('$C_1$\n$0.1\mu F$')
    d += elm.Line().left().to(V1.start)
    d += elm.Label().label("RLC Series Circuit 1").at((3, -2))

print("图片已生成！")
```

</details>

***

The KVL equation (in charge $q$ form) is:
$$L \frac{d^2q}{dt^2} + R \frac{dq}{dt} + \frac{1}{C} q = E(t)$$

Substitute values:
$$0.004 q'' + 100 q' + \frac{1}{10^{-7}} q = 1000$$
$$0.004 q'' + 100 q' + 10,000,000 q = 1000$$

Divide by $L=0.004$:
$$q'' + 25000 q' + 2,500,000,000 q = 250,000$$

Our goal is to find the current $i(t)$.

---

Method 1: Traditional Differential Equation (DE)

The total solution is $q(t)=q_p(t)+q_h(t)$, where $q_p$ is particular and $q_h$ is homogeneous.

**1) Particular solution $q_p$:**

As $t\to\infty$, the inductor behaves like a short and the capacitor like an open, so $i(\infty)=0$ and capacitor voltage equals source voltage.

$$q_p = C \times E = (10^{-7} \text{ F}) \times (1000 \text{ V}) = 10^{-4} \text{ C}.$$

**2) Homogeneous solution $q_h$:**

Solve the characteristic equation
$$q_h'' + 25000 q_h' + 2.5 \times 10^9 q_h = 0$$
$$s^2 + 25000s + 2,500,000,000 = 0$$

In standard form $s^2+2\alpha s+\omega_0^2=0$, we have:
- Damping factor $\alpha=\frac{R}{2L}=\frac{100}{2(0.004)}=12500$
- Resonant frequency $\omega_0=\frac{1}{\sqrt{LC}}=\frac{1}{\sqrt{0.004\times10^{-7}}}=50000$

Since $\alpha<\omega_0$, the system is underdamped and roots are $s_{1,2}=-\alpha\pm j\omega_d$.

$$\omega_d=\sqrt{\omega_0^2-\alpha^2}=\sqrt{50000^2-12500^2}=12500\sqrt{15}\ \text{rad/s}$$

So
$$q_h(t)=e^{-12500t}\left(A\cos(12500\sqrt{15}\,t)+B\sin(12500\sqrt{15}\,t)\right)$$

**3) Build total solution and apply initial conditions:**

$$q(t)=10^{-4}+e^{-12500t}\left(A\cos(\omega_d t)+B\sin(\omega_d t)\right)$$

Apply $q(0)=0$:
$$A=-10^{-4}$$

Differentiate the total solution to get current:
$$
i(t)=q'(t)=e^{-12500t}\left(-A\omega_d\sin(\omega_d t)+B\omega_d\cos(\omega_d t)\right)-12500e^{-12500t}\left(A\cos(\omega_d t)+B\sin(\omega_d t)\right)
$$

Apply $i(0)=q'(0)=0$:
$$B\omega_d-12500A=0$$
$$B=-\frac{10^{-4}}{\sqrt{15}}$$

**4) Current expression:**

To get final $i(t)$, we still need to substitute $A,B$ back into a long derivative expression, which is tedious and error-prone.

---

Method 2: Laplace Transform (Cleaner Path)

We solve for current directly. Time-domain KVL:
$$L \frac{di}{dt} + Ri + \frac{1}{C} \int_0^t i(\tau) d\tau + v_c(0) = E(t)$$

Apply Laplace transform (with $i(0)=0,\ v_c(0)=q(0)/C=0$):
$$L[sI(s) - i(0)] + RI(s) + \frac{1}{C} \frac{I(s)}{s} = \frac{E}{s}$$
$$L sI(s) + RI(s) + \frac{1}{Cs} I(s) = \frac{E}{s}$$

Multiply by $s$:
$$L s^2 I(s) + R s I(s) + \frac{1}{C} I(s) = E$$
$$I(s) \left( Ls^2 + Rs + \frac{1}{C} \right) = E$$
$$I(s) = \frac{E}{Ls^2 + Rs + 1/C}$$

Divide numerator and denominator by $L$:
$$I(s) = \frac{E/L}{s^2 + (R/L)s + 1/LC}$$

Substitute values:
$$I(s) = \frac{250,000}{s^2 + 25000s + 2,500,000,000}$$

Complete the square:
$$s^2 + 25000s + 2.5 \times 10^9 = (s + 12500)^2 + (12500\sqrt{15})^2$$

Hence
$$I(s) = \frac{250,000}{(s + 12500)^2 + (12500\sqrt{15})^2}$$

Match inverse-transform pair
$$\mathcal{L}^{-1} \left\{ \frac{b}{(s+a)^2 + b^2} \right\} = e^{-at} \sin(bt)$$

Scale numerator:
$$I(s)=\left(\frac{250,000}{12500\sqrt{15}}\right)\cdot\frac{12500\sqrt{15}}{(s+12500)^2+(12500\sqrt{15})^2}$$
$$\frac{250,000}{12500\sqrt{15}}=\frac{20}{\sqrt{15}}$$

So
$$i(t)=\frac{20}{\sqrt{15}}e^{-12500t}\sin(12500\sqrt{15}\,t)\ \text{(A)}$$

Summary

- **Traditional DE method:** complete but computation-heavy, especially derivative and substitution steps.
- **Laplace method:** initial values are incorporated automatically; workflow is more direct and reusable.
- **Engineering takeaway:** for linear circuits with initial conditions and driving sources, Laplace is often the better default path.
