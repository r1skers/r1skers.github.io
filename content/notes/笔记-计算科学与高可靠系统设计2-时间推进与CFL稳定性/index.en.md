---
date: '2026-02-19T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 2: Time Marching and CFL Stability (Step-Size Design and Multi-Step Trajectories)'
summary: "Starting from Part 1 spatial discretization, this note builds the time-marching framework and provides CFL-ratio constraints with practical step-size design (fixed dt / fixed dx / fixed ratio)."
description: "Part 2 note on explicit time stepping, CFL constraints, and trajectory sampling strategy."
tags: ["PDE", "Time Marching", "CFL", "Explicit Euler", "Numerical Stability", "Step Size", "Numerical Methods"]
categories: ["Crucible"]
---

# Part 2: Time Marching and CFL Stability

Part 1 gave the spatial discrete operator $L_h$. Part 2 asks: on top of this operator, how should we choose time step and sample trajectories so results stay stable and usable.

The chain is: semi-discrete system -> time-marching scheme -> CFL constraint -> step-size design -> multi-step trajectories.

---

## 1. From Part 1 to Time Marching

Part 1 can be written as a semi-discrete system:

$$
\frac{d u}{d t}=\kappa L_h u
$$

Here $L_h$ is the spatial discrete operator. It is the generator of temporal evolution, not the one-step propagator itself.

Only after temporal discretization do we get a one-step propagation map. With Forward Euler:

$$
u^{n+1}=u^n+\Delta t\,\kappa L_h u^n=(I+\Delta t\,\kappa L_h)u^n
$$

---

## 2. CFL Ratio and Stability Gate

For explicit 2D diffusion (five-point spatial stencil), define:

$$
r_x=\frac{\kappa\Delta t}{\Delta x^2},\qquad
r_y=\frac{\kappa\Delta t}{\Delta y^2}
$$

### 2.0 CFL Derivation (Consistent with Part 1)

Below is the same derivation style used in Part 1: rearrange explicit-update coefficients to get the stability gate.

Use explicit update for 2D diffusion (allowing different $\Delta x,\Delta y$):

$$
h_{i,j}^{n+1}=h_{i,j}^{n}+\kappa\Delta t\left(\frac{h_{i+1,j}^{n}-2h_{i,j}^{n}+h_{i-1,j}^{n}}{\Delta x^2}+\frac{h_{i,j+1}^{n}-2h_{i,j}^{n}+h_{i,j-1}^{n}}{\Delta y^2}\right)
$$

Using $r_x=\kappa\Delta t/\Delta x^2,\ r_y=\kappa\Delta t/\Delta y^2$:

$$
h_{i,j}^{n+1}=(1-2r_x-2r_y)h_{i,j}^{n}+r_x(h_{i+1,j}^{n}+h_{i-1,j}^{n})+r_y(h_{i,j+1}^{n}+h_{i,j-1}^{n})
$$

Using the same “nonnegative center coefficient” criterion in this note:

$$
1-2r_x-2r_y\ge 0
$$

This gives the CFL constraint:

$$
r_x+r_y\le \frac{1}{2}
$$

So in the following engineering design, we use $r_x+r_y\le \frac{1}{2}$ as the stability gate.

If $\Delta x=\Delta y$, this becomes the familiar form:

$$
r=\frac{\kappa\Delta t}{\Delta x^2}\le \frac{1}{4}
$$

In engineering practice, use an extra safety factor $s\in(0,1)$ (e.g., $s=0.8$) instead of running at the boundary.

### 2.1 Why Step-Size Design Is Needed

Section 3 introduces three step-size modes not as a rephrasing, but as responses to three practical engineering constraints:

- you may fix mesh resolution first (fixed $\Delta x,\Delta y$);
- you may fix sampling period first (fixed $\Delta t$);
- or you may fix CFL ratio first for cross-mesh comparability (fixed $r$).

The common objective is to generate comparable multi-step trajectory samples (e.g., $\Delta t,\Delta t/2,\Delta t/4$) under CFL stability constraints. These samples become the shared data baseline for downstream learning, comparison, and validation.

---

## 3. Three Step-Size Design Modes

### 3.1 Fix $\Delta x,\Delta y$, Solve for $\Delta t$

This is the most common mode: choose spatial resolution first, then compute stable $\Delta t$.

$$
\Delta t
\le
s\cdot\frac{1}{2\kappa\left(\frac{1}{\Delta x^2}+\frac{1}{\Delta y^2}\right)}
$$

For equal spacing:

$$
\Delta t\le s\cdot\frac{\Delta x^2}{4\kappa}
$$

### 3.2 Fix $\Delta t$, Solve for Grid Scale

Useful when sample period is predetermined by control/data-acquisition pipelines.

For equal spacing, stability implies:

$$
\Delta x\ge \sqrt{\frac{4\kappa\Delta t}{s}}
$$

### 3.3 Fix CFL Ratio (Recommended)

Choose a target ratio (e.g., $r=0.2$), then scale $\Delta t$ automatically with mesh:

$$
\Delta t=\frac{r\Delta x^2}{\kappa},\qquad r\le \frac{1}{4}
$$

This mode gives the best comparability across different meshes.

---

## 4. Multi-Step Trajectory Sampling (for Learning and Validation)

On the same spatial mesh, choose three time-step levels:

$$
\Delta t,\quad \frac{\Delta t}{2},\quad \frac{\Delta t}{4}
$$

All levels must satisfy CFL. Typical uses:

Observe how numerical dissipation/smoothing changes with step size.
Build coarse-to-fine trajectory datasets in temporal resolution.
Provide a unified sample baseline for downstream learning, error evaluation, and reliability checks.

For fair comparison, keep the same physical horizon $T$ and only change step count $N_t=T/\Delta t$.

---

## 5. Boundary and Step Size in a Sand Model

Continue the sand-thickness model $h(x,y,t)$ from Part 1:


- Left feeder can use Dirichlet (fixed height).
- Right outflow/walls can use Neumann (fixed flux or zero flux).
- Periodic can represent a closed-loop transport belt.

Boundary conditions define exchange with the environment; CFL limits how far one step can travel. Both are required for usable simulation.

---

## 6. Summary

- Part 1 provides spatial operator $L_h$; Part 2 builds time marching on top of it.
- The core gate for explicit schemes is CFL ratio, not arbitrary step tuning.
- In engineering practice, fixing ratio is usually best for cross-grid and cross-run comparability.
- Multi-step trajectories ($\Delta t,\Delta t/2,\Delta t/4$) are the base data layer for later reliability evaluation.
