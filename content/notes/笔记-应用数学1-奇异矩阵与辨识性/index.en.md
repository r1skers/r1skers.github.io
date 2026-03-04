---
date: '2026-03-04T21:00:00+09:00'
draft: false
title: 'Applied Mathematics Part 1: Singular Matrices and Identifiability'
summary: "Starting from singular matrices, this note connects identifiability with Hessian/FIM geometry, profile likelihood, and sensitivity analysis."
description: "A practical note linking singular matrices, information loss, identifiability, FIM, profile likelihood, and sensitivity analysis."
tags: ["Applied Mathematics", "Singular Matrix", "Identifiability", "FIM", "Profile Likelihood", "Sensitivity Analysis", "Inverse Problem"]
categories: ["Crucible"]
---

# Applied Mathematics Part 1: Singular Matrices and Identifiability

This note follows one chain: a singular matrix is not only "non-invertible"; in parameter estimation, it means information gaps and eventually unidentifiability.

---

## 1. Singular Matrix: Definition and Intuition

For a square matrix $A\in\mathbb{R}^{n\times n}$, the following are equivalent:

1. $\det(A)=0$.  
2. $\mathrm{rank}(A)\lt n$.  
3. There exists nonzero $v$ such that $Av=0$ (nontrivial null space).  
4. $A^{-1}$ does not exist.

A concrete $3\times3$ example:

$$
A=
\begin{bmatrix}
1 & 2 & 3\\
2 & 4 & 6\\
1 & 1 & 1
\end{bmatrix}
$$

Row 2 is twice row 1, so rows are linearly dependent; hence $\mathrm{rank}(A)=2\lt 3$ and $\det(A)=0$, so $A$ is singular.

Geometrically, at least one direction is flattened, so information dimension is lost.

---

## 2. Hessian Matrix: Essence, Definition, and Directional Curvature

Essence: the Hessian is the second-order coefficient matrix controlling local curvature geometry.

It appears in the second-order Taylor expansion:

$$
f(\theta)\approx f(\theta_0)+\nabla f(\theta_0)^\top(\theta-\theta_0)+\frac12(\theta-\theta_0)^\top H(\theta_0)(\theta-\theta_0)
$$

So, for a scalar function $f(\theta)$, the Hessian is defined as the matrix of second partial derivatives:

$$
H(\theta)=\nabla_\theta^2 f(\theta),\qquad
H_{ij}=\frac{\partial^2 f}{\partial\theta_i\partial\theta_j}
$$

In 2D, it is written as:

$$
H=
\begin{bmatrix}
\frac{\partial^2 f}{\partial x^2} & \frac{\partial^2 f}{\partial x\partial y}\\
\frac{\partial^2 f}{\partial y\partial x} & \frac{\partial^2 f}{\partial y^2}
\end{bmatrix}
$$

Directional curvature along vector $v$ is commonly written as:

$$
\kappa_v=v^\top H v
$$

With unit vectors, it directly measures second-order curvature along that direction.

Eigenvalues can be interpreted as principal curvatures (along eigenvector directions):

1. Large eigenvalue: large curvature and steeper local geometry.  
2. Small eigenvalue: weak curvature and flatter local geometry.  
3. Zero (or near-zero) eigenvalue: flat direction exists, implying singular (or near-singular) Hessian and weak identifiability.

## 3. Unidentifiability: Structural vs Practical

1. Structural unidentifiability: impossible even with perfect data (model structure issue).  
2. Practical unidentifiability: theoretically identifiable, but unstable under realistic data/noise/experiment limits.

---

## 4. FIM: Local Information Geometry

$$
F(\theta)=J(\theta)^\top \Sigma^{-1}J(\theta)
$$

where $\Sigma$ is the noise covariance matrix.

$$
H(\theta)\approx J(\theta)^\top \Sigma^{-1}J(\theta)=F(\theta)
$$

In least-squares settings, the Hessian is often approximated by Gauss-Newton, so FIM can be viewed as the information-form Hessian; both describe local curvature and identifiable directions.

1. If $F$ is singular or ill-conditioned (large condition number), weakly identifiable directions exist.  
2. $F^{-1}$ (if it exists) approximates parameter covariance; large diagonal values imply high uncertainty.  
3. Small eigenvalues indicate low-information directions.

---

## 5. Profile Likelihood: Parameter-Level Diagnosis

$$
\mathrm{PL}(\theta_i)=\min_{\theta_{-i}}\ \mathcal{L}(\theta_i,\theta_{-i})
$$

If the profile is flat over a wide interval, that parameter is weakly identifiable or unidentifiable.

FIM gives local quadratic approximation near optimum; profile likelihood shows nonlinear/global behavior around that parameter.

---

## 6. Sensitivity Analysis: Who Drives the Output

### 6.1 Local Sensitivity

$$
S_{ij}=\frac{\partial y_i}{\partial\theta_j}\cdot\frac{\theta_j}{y_i}
$$

Small $|S_{ij}|$ means weak output response to that parameter, often implying harder identification.

### 6.2 Global Sensitivity

Morris/Sobol-type methods assess parameter contribution across global uncertainty space.

If a parameter has persistently low global contribution, high-cost precise estimation is usually unnecessary.

---

## 7. Practical Workflow (Suggested)

1. Start with sensitivity: remove nearly inactive parameters.  
2. Then inspect FIM: detect rank deficiency, ill-conditioning, and correlated directions.  
3. Use profile likelihood on key parameters: confirm identifiable ranges and uncertainty.  
4. If still unidentifiable: redesign experiment, enrich excitation, add observables, or reparameterize.

---

## 8. Summary

The true meaning of singularity in identification is information-dimension collapse.

FIM gives local geometric diagnosis, profile likelihood gives parameter-level nonlinear evidence, and sensitivity analysis sets experiment/modeling priorities.

Only by combining all three can we clearly separate "estimable" from "worth estimating precisely."
