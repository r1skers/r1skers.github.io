---
date: '2026-03-01T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 5: Parameter Inversion I (Finite-Difference Gradient and Gradient Descent)'
summary: "This note focuses on finite-difference gradients and gradient descent, using 1D heat-equation inversion of κ as the main example."
description: "Part 5 note focused on finite-difference gradient derivation and gradient descent for PDE parameter inversion."
tags: ["PDE", "Inverse Problem", "Finite Difference", "Gradient Descent", "Parameter Inversion", "Reliability"]
categories: ["Crucible"]
---

# Computational Science & High-Reliability Systems Design Part 5: Parameter Inversion I (Finite-Difference Gradient and Gradient Descent)

This note focuses on one thing: approximate gradients with finite differences, then invert the PDE parameter $\kappa$ via gradient descent.

The chain is: PDE forward setup -> mismatch objective -> finite-difference gradient -> gradient-descent update -> parameter constraints and stopping criteria.

---

## 1. PDE Problem Setup (1D Heat Equation)

Consider the 1D heat equation:

$$
\frac{\partial u}{\partial t}=\kappa\frac{\partial^2 u}{\partial x^2},
\quad x\in[0,1],\ t\in[0,T]
$$

Here $\kappa$ is the unknown diffusivity. Given initial/boundary conditions and observed snapshots $u^{\text{obs}}$, the goal is to infer $\kappa$.

Use an explicit finite-difference discretization (connecting Part 1 and Part 2):

$$
u_i^{n+1}=u_i^n+r(\kappa)\left(u_{i+1}^n-2u_i^n+u_{i-1}^n\right),
\quad r(\kappa)=\frac{\kappa\Delta t}{\Delta x^2}
$$

Stability requirement for the 1D explicit heat scheme:

$$
0 \lt r(\kappa)\le \frac{1}{2}
$$

At terminal time $t=T$, use a mismatch-plus-regularization objective:

$$
J(\kappa)=
\underbrace{\frac12\sum_i\left(u_i^{N}(\kappa)-u_{i,\text{obs}}^{N}\right)^2}_{\text{Mismatch}}
\;+\;
\lambda\underbrace{R(\kappa)}_{\text{Regularization}}
$$

Here $\lambda\ge 0$ is the regularization weight; for a baseline setup, you can start with $\lambda=0$.

Parameter inversion is:

$$
\kappa^\star=\arg\min_\kappa J(\kappa)
$$

---

## 2. Finite-Difference Gradient Derivation (Core)

If the analytic gradient $\frac{dJ}{d\kappa}$ is unavailable, use central differences:

$$
\frac{dJ}{d\kappa}\approx
\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}
$$

This comes from Taylor expansion:

$$
J(\kappa+\delta)=J(\kappa)+\delta J'(\kappa)+\frac{\delta^2}{2}J''(\kappa)+\frac{\delta^3}{6}J'''(\kappa)+\cdots
$$

$$
J(\kappa-\delta)=J(\kappa)-\delta J'(\kappa)+\frac{\delta^2}{2}J''(\kappa)-\frac{\delta^3}{6}J'''(\kappa)+\cdots
$$

Subtracting the two expansions gives:

$$
J'(\kappa)=\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}+O(\delta^2)
$$

So central differences are second-order accurate, with error $O(\delta^2)$.

---

## 3. Gradient Descent Update and Meaning

At iteration $m$, update by:

$$
\kappa^{m+1}=\kappa^m-\eta g^m,
\quad
g^m\approx\frac{J(\kappa^m+\delta)-J(\kappa^m-\delta)}{2\delta}
$$

Where:


English:
1. $\delta$: finite-difference perturbation size, balancing approximation accuracy and numerical-noise sensitivity.  
2. $\eta$: learning rate, controlling update magnitude each step.  
3. The sign of $g^m$ sets the direction; its magnitude sets the strength.

If $\kappa$ has a physical range, apply projection:

$$
\kappa^{m+1}=\Pi_{[\kappa_{\min},\kappa_{\max}]}\left(\kappa^m-\eta g^m\right)
$$

---

## 4. PDE Example: Inverting Diffusivity $\kappa$

Setup:


English:
1. Spatial step $\Delta x=0.1$, time step $\Delta t=0.002$.  
2. Current parameter $\kappa^m=0.80$, perturbation $\delta=0.02$.  
3. Run two full forward solves at $\kappa^m+\delta=0.82$ and $\kappa^m-\delta=0.78$, then evaluate losses.

$$
J(0.82)=1.20\times10^{-3},\qquad
J(0.78)=1.68\times10^{-3}
$$

Gradient estimate:

$$
g^m\approx\frac{1.20\times10^{-3}-1.68\times10^{-3}}{2\times0.02}
=-1.2\times10^{-2}
$$

If $\eta=0.5$, then:

$$
\kappa^{m+1}=0.80-0.5(-1.2\times10^{-2})=0.806
$$

Interpretation: a negative gradient means increasing $\kappa$ reduces mismatch, so the updated $\kappa$ becomes larger.

---

## 5. Practical Choices for $\delta$ and $\eta$


English:
1. If $\delta$ is too large, bias dominates; if too small, round-off/noise dominates.  
2. A practical scaled perturbation is $\delta=\max(10^{-4},10^{-2}|\kappa|)$.  
3. Too large $\eta$ may oscillate; too small $\eta$ converges slowly. Start small and tune up carefully.  
4. Track $J_m, |g_m|, \kappa_m$ to diagnose stability.  
5. Common stopping rules: $|g_m|<\varepsilon_g$ or $|J_{m+1}-J_m|/J_m<\varepsilon_J$.

## 6. Summary

Core three-step loop in Part 5:

$$
J(\kappa)\rightarrow
g(\kappa)\approx\frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}
\rightarrow
\kappa\leftarrow\kappa-\eta g
$$

Start from an initial guess $\kappa^0$, estimate the local slope via finite differences, and update $\kappa$ along the descent direction.

The optimizer minimizes the mismatch objective $J(\kappa)$, not $|\kappa-\kappa_{\text{true}}|$ directly; the latter is only an evaluation metric when ground truth is available.

This is the most direct and interpretable starting point for PDE parameter inversion; you can then upgrade to L-BFGS-B for better efficiency and robustness.
