---
date: '2026-09-18T12:00:00+09:00'
draft: false
title: 'The One-Dimensional Poisson Equation: From an Energy Functional to a Unique Minimizer'
summary: 'Starting from admissible perturbations, follow the first variation, weak form, and energy difference to understand why the solution of the one-dimensional Poisson equation uniquely minimizes an energy functional.'
description: 'A study reproduction of the one-dimensional Poisson equation with homogeneous Dirichlet data: derive the first variation through a grounded parallel-plate electrostatic model, recover the differential equation under smoothness assumptions, and use the energy difference to establish global minimality and uniqueness.'
tags: ["PDE", "Calculus of Variations", "Optimization"]
categories: ["Notes"]
series: ["Poisson Equation"]
note_kind: "research"
weight: 1
---

> This article is based on the study record from Stage 1 (M1, one-dimensional variation) of the [Poisson equation learning thread](/en/notes/systems/poisson-equation/). The key steps were completed with hints and corrections. It contains no numerical experiment: the example can be solved by direct integration, while existence in the general setting has not yet been proved here by variational methods.

# Introducing the problem

Consider two large, parallel conducting plates separated by $L=1\,\mathrm{mm}$ and held at ground potential. The gap is filled with a homogeneous linear dielectric whose permittivity is

$$
\varepsilon_d=1.0\times10^{-10}\,\mathrm{F/m}
$$

(a relative permittivity of about 11, close to silicon). A prescribed and fixed free volume charge density $\rho=8\,\mathrm{mC/m^3}$ is distributed uniformly through the dielectric. The plates are large enough for edge effects to be neglected, so every quantity varies only in the direction normal to the plates. The question is: **what is the electric potential at every point between the plates?**

[![Two grounded parallel plates with uniform space charge between them, together with the potential profile: the midpoint reaches 10 V and each plate carries an induced surface charge of −4 μC/m²](parallel-plate-space-charge.svg)](parallel-plate-space-charge.svg)

Let $x\in[0,L]$ denote position, $\varphi(x)$ the electric potential, and $E(x)$ the $x$ component of the electric field. The field is the negative gradient of the potential:

$$
E=-\frac{d\varphi}{dx}.
$$

Gauss's law states that the electric flux through a closed surface equals the enclosed free charge. Take a thin slab $[x,x+\Delta x]$ with unit plate area. The flux difference across its two faces equals the charge inside:

$$
\varepsilon_dE(x+\Delta x)-\varepsilon_dE(x)=\rho\,\Delta x
\qquad\Longrightarrow\qquad
\varepsilon_d\frac{dE}{dx}=\rho.
$$

Substituting $E=-\varphi'$ gives the equation to solve:

$$
-\varepsilon_d\varphi''=\rho,
\qquad\varphi(0)=\varphi(L)=0.
$$

The unknown is the entire potential curve $\varphi(x)$. The charge density $\rho$ is prescribed, the differential equation constrains the interior of the dielectric, and the two boundary conditions come from grounding the plates.

To scale the interval to $[0,1]$, set

$$
\xi=\frac{x}{L},
\qquad u(\xi)=\varphi(L\xi).
$$

$\xi$ is a dimensionless relative coordinate ($\xi=0.5$ is the midpoint), while $u$ remains a potential measured in volts. No shift in the reference level is needed because the grounded boundaries are already zero. The problem becomes

$$
-u''(\xi)=f(\xi),\qquad 0\lt\xi\lt1,
\qquad u(0)=u(1)=0,
$$

where

$$
f(\xi)=\frac{L^2\rho}{\varepsilon_d}=80\,\mathrm V.
$$

The charge is uniform here, so $f$ is constant. If it varies with position, $\rho=\rho(x)$, the same scaling gives $f(\xi)=L^2\rho(L\xi)/\varepsilon_d$; the derivation below applies to a general $f(\xi)$. In a region without volume charge, $f=0$ and the equation reduces to Laplace's equation.

This is the one-dimensional Poisson equation studied here. The simple example can be integrated twice to obtain

$$
u(\xi)=\frac f2\,\xi(1-\xi).
$$

With $f=80\,\mathrm V$, the midpoint potential is $f/8=10\,\mathrm V$, matching the curve in the figure. This is a value from the analytic model, not a measurement or a numerical experiment.

**Why can the physical potential also be obtained from a minimization problem?** How does that connection lead toward discrete matrices and numerical computation?

First place the candidate potential curves in a set. For the hand calculation, use real-valued functions that are sufficiently smooth and vanish at both endpoints:

$$
\mathcal V=\{\,v\in C^1([0,1])\mid v(0)=v(1)=0\,\}.
$$

For any candidate $v\in\mathcal V$, define

$$
J[v]=\int_0^1\left[\frac12(v')^2-fv\right]d\xi.
$$

$J$ takes an entire curve and returns a number. Its first term measures spatial variation in that curve; its second describes the interaction between the prescribed charge and the candidate potential. For the electrostatic model above, it comes from

$$
\mathcal E[\varphi]
=\int_0^L\left[\frac{\varepsilon_d}{2}E^2-\rho\varphi\right]dx,
\qquad E=-\varphi',
$$

after scaling the coordinate and multiplying by a positive constant. Substituting $\varphi(x)=u(x/L)$ gives

$$
\mathcal E[\varphi]=\frac{\varepsilon_d}{L}\,J[u].
$$

The functionals differ only by a positive factor, so they have the same minimizing potential curve. Other physical models require their own coefficients and variational structures to be checked.

The word “energy” needs some care here. $\mathcal E$ has units of $\mathrm{J/m^2}$ per unit plate area, and its first term, $\frac{\varepsilon_d}{2}E^2$, is indeed the electrostatic field-energy density. Yet $\mathcal E$ is not the energy stored in the system. At the minimizer, integration by parts gives

$$
\int_0^L\frac{\varepsilon_d}{2}E^2dx
=\frac12\int_0^L\rho\varphi\,dx,
$$

and therefore $\mathcal E=-\frac12\int_0^L\rho\varphi\,dx$, the negative of the field energy. In what follows, $\mathcal E$ is used only as the variational functional that produces Poisson's equation; its value is not interpreted directly as the electrostatic energy stored in the system.

# Admissible changes to a candidate function

Keep the charge distribution fixed and both plates grounded. Given a candidate potential $v\in\mathcal V$, choose a perturbation direction $\eta$ and write

$$
v_\alpha=v+\alpha\eta.
$$

$\alpha$ is a real scalar controlling the magnitude and sign of the change. It is used instead of $\varepsilon$ to avoid confusion with permittivity. The fixed function $\eta$ describes how the whole curve is changed. It is not a left-or-right direction between the plates, and $\alpha$ is not time. Because both plates remain grounded, candidate potentials must continue to vanish at the endpoints, so $\eta(0)=\eta(1)=0$, or $\eta\in\mathcal V$. Thus $v_\alpha$ remains admissible for either sign of $\alpha$.

The zero-endpoint condition is closed under addition and scalar multiplication, so $\mathcal V$ is a linear space and the candidates and perturbation directions may come from the same set. This relies on grounding both plates. If the two plates were held at different voltages, the candidate set would no longer be closed under addition: adding two candidates would double their endpoint voltages. One would first subtract a known function satisfying the boundary data to reduce the problem to homogeneous boundary conditions.

For example, take $\eta(\xi)=4\xi(1-\xi)$. It vanishes at both endpoints and equals one at the midpoint. Setting $\alpha=0.1$ raises the candidate midpoint potential by $0.1\,\mathrm V$ while keeping both plates grounded. These are different candidate curves for the same charge distribution. They need not satisfy Poisson's equation in advance; the minimization problem selects the physical curve from among them.

Substituting $v+\alpha\eta$ into the functional and expanding the square gives the exact identity

$$
\begin{aligned}
J[v+\alpha\eta]-J[v]
&=\alpha\int_0^1(v'\eta'-f\eta)\,d\xi\\
&\quad+\frac{\alpha^2}{2}\int_0^1(\eta')^2\,d\xi.
\end{aligned}
$$

Differentiate with respect to $\alpha$ and then set $\alpha=0$. The first variation in the direction $\eta$ is

$$
\delta J[v;\eta]
=\left.\frac{d}{d\alpha}J[v+\alpha\eta]\right|_{\alpha=0}
=\int_0^1(v'\eta'-f\eta)\,d\xi.
$$

# From a minimizer to the weak form

Suppose now that $u$ is a minimizer. For every $\eta\in\mathcal V$, the one-variable function $g(\alpha)=J[u+\alpha\eta]$ has a local minimum at $\alpha=0$. Because $\alpha$ can vary on both sides of zero, a necessary condition is $g'(0)=0$. Hence

$$
\int_0^1u'\eta'\,d\xi=\int_0^1f\eta\,d\xi
\qquad\text{for every }\eta\in\mathcal V.
$$

This is the weak form of the problem. It involves only the first derivative of $u$. The implication established so far is: **if a minimizer exists, it satisfies the weak form**. Existence has not been proved, and a vanishing first variation alone has not yet been shown to guarantee a minimum.

Here both $u$ and $\eta$ lie in $\mathcal V$. If only $f\in L^2(0,1)$ is assumed, the natural weak formulation belongs in $H_0^1(0,1)$. Without additional regularity, $-u''=f$ should not be treated as a classical pointwise equation.

If we additionally assume $u\in C^2([0,1])$ and $f\in C([0,1])$, classical integration by parts gives

$$
\int_0^1u'\eta'\,d\xi
=[u'\eta]_0^1-\int_0^1u''\eta\,d\xi.
$$

The boundary term vanishes because $\eta(0)=\eta(1)=0$; the endpoint values of $u'$ need not vanish. Returning to the two plates makes that distinction concrete. The endpoint slopes are in fact nonzero:

$$
u'(0)=f/2=40\,\mathrm V,
\qquad u'(1)=-40\,\mathrm V.
$$

In physical units, the fields at the plates are $E(0)=-40\,\mathrm{kV/m}$ and $E(L)=40\,\mathrm{kV/m}$, both directed toward the plates. Each plate acquires an induced surface charge of $-\rho L/2=-4\,\mu\mathrm{C/m^2}$; together they cancel the total space charge in the dielectric and give the field lines somewhere to terminate. A zero endpoint slope would instead prescribe a zero normal field, a different boundary condition.

The weak form therefore becomes

$$
\int_0^1(-u''-f)\eta\,d\xi=0
\qquad\text{for every }\eta\in\mathcal V.
$$

The phrase “for every” is decisive. If the continuous residual $r=-u''-f$ were positive at an interior point, it would remain positive on some small interval $[a,b]\subset(0,1)$. Choose a nonnegative, nonzero perturbation supported only on that interval, for example

$$
\eta(\xi)=
\begin{cases}
(\xi-a)^2(b-\xi)^2, & a\le\xi\le b,\\
0, & \text{elsewhere}.
\end{cases}
$$

This function is $C^1$, vanishes at the endpoints, and belongs to $\mathcal V$. It would give $\int_0^1r\eta\,d\xi>0$, contradicting the weak form. The negative case is analogous. Under the added smoothness assumptions, $r=0$, so $-u''=f$ holds pointwise on $(0,1)$.

# Why does the weak form give a unique minimizer?

Conversely, suppose $u$ satisfies the weak form. For any other candidate $v\in\mathcal V$, set $w=v-u$. Because $\mathcal V$ is a linear space, $w\in\mathcal V$ is an admissible perturbation and need not be small. Compare the two functional values directly:

$$
\begin{aligned}
J[v]-J[u]
&=J[u+w]-J[u]\\
&=\underbrace{\int_0^1(u'w'-fw)\,d\xi}_{=0\text{ by the weak form with }\eta=w}
+\frac12\int_0^1(w')^2\,d\xi\\
&\geq 0.
\end{aligned}
$$

Thus, whenever such a weak solution exists, it is a **global** minimizer. In physical variables, this difference is exactly the field energy of the electric-field error:

$$
\mathcal E[\varphi_v]-\mathcal E[\varphi_u]
=\frac{\varepsilon_d}{2}\int_0^L(E_v-E_u)^2dx.
$$

The excess functional value of a candidate equals the squared discrepancy in its electric field.

When does equality hold? In the present smooth setting, $\int_0^1(w')^2\,d\xi=0$ implies $w'=0$, so $w$ is constant. Since $w(0)=0$, it follows that $w\equiv0$ and $v=u$. The homogeneous boundary condition removes arbitrary constant shifts, making the minimizer unique. The weak solution is also unique: if $u_1$ and $u_2$ both satisfy the weak form, subtract the two identities and choose $\eta=u_1-u_2$ to obtain $u_1=u_2$ by the same argument.

One final direction completes the answer to the opening question. The physical potential in the example is a classical solution: $u\in C^2([0,1])$ and $-u''=f$. Read the integration-by-parts calculation in reverse: multiply the equation by any $\eta\in\mathcal V$ and integrate. The boundary term again vanishes because $\eta(0)=\eta(1)=0$, yielding the weak form. The classical solution therefore satisfies the weak form and, by the energy-difference identity, is the unique global minimizer of $J$.

The two-plate example can be checked directly. Take $u=\frac f2\xi(1-\xi)$ and the earlier $\eta=4\xi(1-\xi)$. Then

$$
\int_0^1u'\eta'\,d\xi=\frac{2f}{3}=\int_0^1f\eta\,d\xi,
\qquad
\int_0^1(\eta')^2\,d\xi=\frac{16}{3}.
$$

The first-order term vanishes exactly, leaving

$$
J[u+\alpha\eta]-J[u]=\frac83\,\alpha^2.
$$

Whenever $\alpha\ne0$, raising or lowering the midpoint potential strictly increases $J$.

# Summary

In this first stage, $\mathcal V$ connects three descriptions: the pointwise differential equation, the weak form, and the minimization problem.

| Direction | Additional assumptions | Reason |
|---|---|---|
| Minimizer $\Rightarrow$ weak form | None beyond the setup | $\alpha$ varies on both sides of zero, so $g'(0)=0$ |
| Weak form $\Rightarrow$ unique global minimizer | None beyond the setup | Exact energy difference, $\int_0^1(w')^2\,d\xi\ge0$, and homogeneous boundary data exclude constants |
| Weak form $\Rightarrow$ pointwise $-u''=f$ | $u\in C^2$ and continuous $f$ | Integration by parts and arbitrary local perturbations |
| $-u''=f$ $\Rightarrow$ weak form | $u\in C^2$ | The same integration-by-parts identity read in reverse |

The next question is suggested by the uniqueness proof itself: it uses the fact that $\int_0^1(w')^2\,d\xi=0$ together with $w(0)=0$ forces $w\equiv0$. When $v$ becomes a vector of grid values, what replaces this argument? How does the squared-gradient integral become a discrete energy, and how does that energy connect to the finite-difference matrix?

---

The electrostatic model follows §4.1–4.2 of the MIT open-course textbook [Haus & Melcher, *Electromagnetic Fields and Energy*, Chapter 4](https://ocw.mit.edu/courses/res-6-001-electromagnetic-fields-and-energy-spring-2008/90d4d00780d8c4582a291ad3c691031f_04.pdf). The text writes $\nabla^2\Phi=-\rho/\varepsilon_0$ using vacuum permittivity; the homogeneous dielectric, one-dimensional geometry, and numerical parameters used here are specializations for this article.

The equivalence between the weak and minimization formulations follows §1.1 of Sergey E. Mikhailov's [*Variational and Computational Methods for PDEs*](https://www.ltcc.ac.uk/media/london-taught-course-centre/documents/Variational-and-Computational-Methods-for-PDEs-%28APPLIED%29.pdf), specialized here from two dimensions to one. The continuous fundamental lemma used to pass from an integral identity for every admissible perturbation to a pointwise equation follows §4, Theorem 1 of José Figueroa-O’Farrill's [*Brief Notes on the Calculus of Variations*](https://webhomes.maths.ed.ac.uk/~jmf/Teaching/Lectures/CoV.pdf#page=4); the compactly supported local perturbation above is the corresponding construction in the present function class.
