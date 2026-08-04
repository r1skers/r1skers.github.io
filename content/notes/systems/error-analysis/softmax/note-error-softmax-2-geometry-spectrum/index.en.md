---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Error Analysis · Softmax 2: Directions and Spectrum on the Probability Simplex'
summary: "The Softmax Jacobian is more than a matrix of partial derivatives: it subtracts a probability-weighted mean and confines changes to the tangent space that conserves total probability."
description: "The action of the Softmax Jacobian, three-class local spectra, the global two-norm bound, and connections to covariance, Fisher information, and entropy regularization."
tags: ["Error Analysis", "Softmax", "Jacobian", "Information Geometry"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 2
---

For logits $z\in\mathbb R^K$, Softmax is

\[
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}.
\]

Direct differentiation gives

\[
\frac{\partial p_i}{\partial z_j}
=p_i(\delta_{ij}-p_j),
\]

and therefore

\[
\boxed{
J_s(z)=\operatorname{diag}(p)-pp^T.
}
\]

Use this form to see what actually happens when the Jacobian multiplies a perturbation vector.

## 1. Each Row Is a Local Linear Functional

Let the logits receive a small perturbation $\delta z$. Then

\[
\delta p_i
=\sum_j\frac{\partial p_i}{\partial z_j}\delta z_j
=p_i\left(
\delta z_i-\sum_jp_j\delta z_j
\right).
\]

Define the probability-weighted mean

\[
\mu_p(\delta z)=\sum_jp_j\delta z_j.
\]

The action of the Softmax Jacobian can then be summarized as:

1. compute the probability-weighted mean of the logit perturbation;
2. subtract that common component from every coordinate;
3. scale each remaining coordinate by its probability $p_i$.

In matrix form,

\[
J_s\delta z
=D_p(I-\mathbf1p^T)\delta z.
\]

This is closer to what the matrix action means than “row $i$ dotted with column $j$”: Softmax ignores a common shift and responds only to contrast between classes.

## 2. Shift Invariance Is the Jacobian Null Space

Softmax satisfies

\[
s(z+c\mathbf1)=s(z).
\]

Its differential form is

\[
J_s\mathbf1=0.
\]

The input perturbation $c\mathbf1$ is generally not the zero vector. It lies in the Jacobian null space, so its output perturbation is zero.

Every exact Softmax output also satisfies

\[
\mathbf1^Tp=1.
\]

Any infinitesimal probability change must therefore obey

\[
\mathbf1^T\delta p=0.
\]

Geometrically, probability vectors lie on a simplex, and Jacobian outputs can move only through its tangent space $\mathbf1^\perp$. Probability mass entering one class must leave the others by the same total amount.

## 3. The Uniform Three-Class Point: Every Contrast Direction Is Equivalent

At

\[
p=\left(\frac13,\frac13,\frac13\right),
\]

the Jacobian is

\[
J_s
=\frac13\left(I-\frac13\mathbf1\mathbf1^T\right).
\]

The matrix in parentheses is the orthogonal projection onto $\mathbf1^\perp$. Hence:

- the common-shift direction $\mathbf1$ has eigenvalue $0$;
- every contrast direction has eigenvalue $1/3$.

One orthonormal basis is

\[
v_1=\frac{1}{\sqrt2}(1,-1,0)^T,
\qquad
v_2=\frac{1}{\sqrt6}(1,1,-2)^T.
\]

These vectors are not eigenvectors merely because they are orthogonal. We first establish that the entire contrast plane is an invariant subspace; only then may we choose any orthonormal basis inside it.

## 4. A Nonuniform Point: Different Gains in the Same Plane

Now take

\[
p=\left(\frac12,\frac14,\frac14\right).
\]

The last two classes remain symmetric, which exposes two contrast modes:

\[
J_s(2,-1,-1)^T
=\frac38(2,-1,-1)^T,
\]

\[
J_s(0,1,-1)^T
=\frac14(0,1,-1)^T.
\]

The first mode makes class 1 oppose classes 2 and 3 together. The second moves probability only between classes 2 and 3. The same two-dimensional tangent plane is no longer isotropic, and its largest local gain becomes $3/8$.

The familiar quantity $p_i(1-p_i)$ describes only the diagonal derivative

\[
\frac{\partial p_i}{\partial z_i}=p_i(1-p_i),
\]

the self-response of one coordinate. It explains why a component saturates as its probability approaches $0$ or $1$, but it cannot replace the spectrum of the full Jacobian. Multiclass directions couple several probabilities at once.

## 5. Local $3/8$ Versus Global $1/2$

Because $J_s$ is symmetric positive semidefinite, its operator norm is its largest eigenvalue. For any unit vector $v$,

\[
v^TJ_sv
=\sum_i p_iv_i^2-\left(\sum_i p_iv_i\right)^2
=\operatorname{Var}_{i\sim p}(v_i).
\]

Equivalently,

\[
v^TJ_sv
=\frac12\sum_{i,j}p_ip_j(v_i-v_j)^2.
\]

For fixed $v$, this variance is not maximized by uniform $p$. It is maximized by placing half of the probability mass at the minimum coordinate of $v$ and half at the maximum. From

\[
\operatorname{Var}_p(v_i)
\le\frac{(v_{\max}-v_{\min})^2}{4}
\]

and the fact that a unit vector has range at most $\sqrt2$, we obtain

\[
\boxed{\|J_s(z)\|_2\le\frac12.}
\]

Thus:

- $3/8$ is the worst local gain at the fixed point $p=(1/2,1/4,1/4)$;
- $1/2$ is the tight global supremum across all probability distributions;
- the balanced binary case attains $1/2$, while the multiclass case approaches it as probability mass concentrates equally on two classes.

The common-shift direction always has zero gain. Even after restricting to contrast directions, saturation can make the local gain approach zero. Softmax therefore has no positive global lower bound.

## 6. A Fixed Jacobian Controls Only Local Change

For a perturbation that is no longer small, the Jacobian at the starting point cannot be used along the entire path. The exact difference is

\[
s(z+\Delta z)-s(z)
=\int_0^1J_s(z+t\Delta z)\Delta z\,dt.
\]

The probabilities change along the path, so the Jacobian changes as well. The global bound still gives

\[
\|s(z+\Delta z)-s(z)\|_2
\le\frac12\|\Delta z\|_2.
\]

These are two different statements. The local spectrum at a fixed point identifies the currently most sensitive direction; the global Lipschitz bound gives a uniform but looser guarantee for finite input perturbations.

## 7. Why Entropy and Fisher Information Appear Here

Define

\[
A(z)=\log\sum_i e^{z_i}.
\]

Then

\[
\nabla A(z)=p,
\qquad
\nabla^2A(z)=J_s(z).
\]

If $Y\sim p$ is a random category and $e_Y$ is its one-hot vector, then

\[
J_s=\operatorname{Cov}(e_Y).
\]

The same matrix is the Fisher information of the categorical model with respect to the logits. Log-sum-exp also has the variational representation

\[
\log\sum_i e^{z_i}
=\max_{p\in\Delta}
\left(p^Tz+H(p)\right),
\]

whose optimizer is Softmax. The spectrum, categorical variance, Fisher information, and maximum entropy are therefore not four accidental connections; they are different aspects of the same convex function, its gradient, Hessian, and dual structure.

---

**Next:** [Softmax 3: Why Mathematical Equivalence Does Not Imply Numerical Stability](/en/notes/systems/error-analysis/softmax/note-error-softmax-3-stable-evaluation/)
