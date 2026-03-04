---
date: '2026-02-18T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 1: Continuous-to-Discrete Modeling (Discrete Laplacian and Matrix Form)'
summary: "Focus on turning a continuous diffusion model into computable form: gridding, five-point discretization, and matrix assembly."
description: "Part 1 note on spatial discretization and discrete Laplacian matrix form."
tags: ["PDE", "Spatial Discretization", "Discrete Laplacian", "Matrix Form", "Numerical Methods", "Physics Modeling"]
categories: ["Crucible"]
---

# Part 1: From Continuous Model to Discrete Operator

This note does one thing: rewrite the spatial term in a continuous diffusion equation into a machine-computable discrete operator.

The chain is: continuous PDE -> spatial gridding -> five-point discrete Laplacian -> matrix form.

To avoid overlap, the following are out of scope here:

- explicit time stepping and CFL stability (Part 2);
- convergence order and Richardson extrapolation (moved to later reliability/error chapters).

Start from the diffusion-type PDE:

$$
\frac{\partial h}{\partial t}=\kappa\nabla^2 h
$$

Here $h$ is the field variable and $\kappa$ the diffusion coefficient. Part 1 focuses on discretizing the spatial operator $\nabla^2$.

---

## 1. Continuous View vs. Computational View

In continuous math, $\nabla^2 h$ represents local curvature; larger curvature means stronger diffusion drive.

But on a computer, there is no infinitesimal neighborhood, only grid nodes and finite neighbors.

The computable intuition is:

- if a node is above neighbor average, it diffuses outward;
- if a node is below neighbor average, it is pulled upward by neighbors.

This is the mapping from continuous curvature to discrete local deviation.

![Rough slope in reality vs smooth slope in coarse grid](continuous-vs-grid.svg)
![Continuous curvature vs piecewise local approximation](curvature-vs-piecewise-flat.svg)

---

## 2. From 1D Second Difference to 2D Five-Point Laplacian

Start with 1D central difference of the second derivative:

$$
\frac{\partial^2 h}{\partial x^2}
\approx
\frac{h(x+\Delta x)-2h(x)+h(x-\Delta x)}{\Delta x^2}
$$

In 2D, allowing $\Delta x\neq\Delta y$, the discrete Laplacian is:

$$
\nabla_h^2 h_{i,j}=\frac{h_{i+1,j}-2h_{i,j}+h_{i-1,j}}{\Delta x^2}+\frac{h_{i,j+1}-2h_{i,j}+h_{i,j-1}}{\Delta y^2}
$$

When $\Delta x=\Delta y$, this reduces to the classic five-point stencil:

$$
\nabla_h^2 h_{i,j}
\approx
\frac{h_{i+1,j}+h_{i-1,j}+h_{i,j+1}+h_{i,j-1}-4h_{i,j}}{\Delta x^2}
$$

Its structure is “neighbor sum minus weighted center,” i.e., local discrete curvature.

---

## 3. Matrix Form of the Discrete Laplacian

Flatten the 2D grid into a vector $u\in\mathbb{R}^{N_xN_y}$, then:

$$
\frac{d u}{d t}=\kappa L_h u
$$

where $L_h$ is the discrete Laplacian matrix. On a regular grid it is a Kronecker sum:

$$
L_h = I_{y}\otimes T_x + T_y\otimes I_x
$$

$$
T_x=\frac{1}{\Delta x^2}\operatorname{tridiag}(1,-2,1),\qquad
T_y=\frac{1}{\Delta y^2}\operatorname{tridiag}(1,-2,1)
$$

### 3.1 A Concrete Example You Can Use Directly (3x3)

For 1D with 3 interior nodes (Dirichlet boundary), the discrete Laplacian is a $3\times3$ tridiagonal matrix:

$$
L_{1D}=\frac{1}{h^2}
\begin{bmatrix}
-2 & 1 & 0\\
1 & -2 & 1\\
0 & 1 & -2
\end{bmatrix}
$$

For a 2D $3\times3$ interior grid (9 unknowns), flatten with x-fast ordering:

$$
u=\big[u_{1,1},u_{2,1},u_{3,1},u_{1,2},u_{2,2},u_{3,2},u_{1,3},u_{2,3},u_{3,3}\big]^\top
$$

The index map can be written as $k=i+(j-1)N_x$ (here $N_x=3$).

With $\Delta x=\Delta y=h$, the matrix is:

$$
L_{2D}=\frac{1}{h^2}
\begin{bmatrix}
-4 & 1 & 0 & 1 & 0 & 0 & 0 & 0 & 0\\
1 & -4 & 1 & 0 & 1 & 0 & 0 & 0 & 0\\
0 & 1 & -4 & 0 & 0 & 1 & 0 & 0 & 0\\
1 & 0 & 0 & -4 & 1 & 0 & 1 & 0 & 0\\
0 & 1 & 0 & 1 & -4 & 1 & 0 & 1 & 0\\
0 & 0 & 1 & 0 & 1 & -4 & 0 & 0 & 1\\
0 & 0 & 0 & 1 & 0 & 0 & -4 & 1 & 0\\
0 & 0 & 0 & 0 & 1 & 0 & 1 & -4 & 1\\
0 & 0 & 0 & 0 & 0 & 1 & 0 & 1 & -4
\end{bmatrix}
$$

One reading rule is enough: diagonal entries are center weights, and nonzero ones indicate up/down/left/right adjacency.

Boundary conditions modify coefficient rows at matrix edges (or boundary blocks).

### 3.2 Practical Meaning: Three Boundary Types in a Sand Model

Treat $h(x,y,t)$ as sand-layer thickness. A sand-transport setup helps distinguish three common boundary types:

- Dirichlet (fixed-value boundary): e.g., a feeder keeps fixed sand height at the left boundary.

$$
h|_{\Gamma_{\text{in}}}=h_{\text{feed}}(t)
$$

- Neumann (fixed-flux boundary): e.g., prescribed outflow rate on the right, or zero flux on walls.

$$
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{out}}}=q_{\text{out}}(t),\qquad
\frac{\partial h}{\partial n}\Big|_{\Gamma_{\text{wall}}}=0
$$

- Periodic boundary: e.g., connect left/right edges into a ring, so outflow re-enters from the opposite side.

$$
h(0,y,t)=h(L_x,y,t),\qquad
\frac{\partial h}{\partial x}(0,y,t)=\frac{\partial h}{\partial x}(L_x,y,t)
$$

In essence, boundary conditions are mathematical forms of exchange rules between the system and its surroundings.

---

## 4. Summary

- Part 1 focuses on spatial discretization: continuous curvature -> five-point Laplacian -> matrix operator.
- This note stops at matrix form for now; eigenvalue/mode analysis will be added later.
- In engineering terms, boundary conditions are exchange rules with the environment: Dirichlet (fixed value), Neumann (fixed flux), and Periodic (periodic stitching).
- This note does not cover CFL or convergence order: the former goes to Part 2, and the latter to later reliability/error chapters.
