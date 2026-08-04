---
date: '2026-08-04T00:00:00+09:00'
draft: false
title: 'Error Analysis · Softmax 1: Why Error Has a Direction'
summary: "Equal-length input errors can produce completely different output errors; the operator norm, singular values, and Jacobian preserve different levels of information."
description: "Directional error, singular values, and local Jacobians developed from a two-dimensional linear map as the geometric language for Softmax sensitivity."
tags: ["Error Analysis", "Numerical Analysis", "Jacobian", "Singular Values"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 1
---

Scalar error analysis easily suggests a simple picture: perturb the input by $\epsilon$, and the output changes by some multiple of it. For a vector map, however, the size of the output change depends not only on the length of the perturbation but also on its direction.

Consider

\[
A=
\begin{pmatrix}
3&0\\
0&0.5
\end{pmatrix}.
\]

A unit perturbation along the first coordinate axis is amplified by $3$, while one along the second axis is scaled by only $1/2$. Two input errors of the same unit length can therefore produce output lengths that differ by a factor of six.

## 1. The Amplification Factor Is a Function of Direction

Let

\[
v(\theta)=(\cos\theta,\sin\theta)^T
\]

be a unit direction. Applying $A$ gives

\[
Av(\theta)
=(3\cos\theta,0.5\sin\theta)^T,
\]

so the length amplification is

\[
g(\theta)
=\|Av(\theta)\|_2
=\sqrt{9\cos^2\theta+0.25\sin^2\theta}.
\]

The maximum value $3$ occurs on the first coordinate axis, while the minimum $0.5$ occurs on the second. Geometrically, the map deforms the unit circle into an ellipse: its principal-axis directions tell us where the map is most sensitive, and the axis lengths tell us by how much.

## 2. The Operator Norm Answers Only the Worst-Case Question

The operator $2$-norm is

\[
\|A\|_2
=\max_{\|v\|_2=1}\|Av\|_2.
\]

For this matrix,

\[
\|A\|_2=3.
\]

This is a useful guarantee: no input error can be amplified by more than a factor of three. But retaining only $3$ discards the value $0.5$ on the other axis, together with both directions.

The fuller picture comes from

\[
A^TA=
\begin{pmatrix}
9&0\\
0&0.25
\end{pmatrix}.
\]

The eigenvalues of $A^TA$ are $9$ and $0.25$. Taking square roots gives the singular values

\[
\sigma_1=3,
\qquad
\sigma_2=0.5.
\]

The distinctions are:

- the operator norm is the largest singular value and retains only the worst amplification;
- the singular values are the amplification factors along orthogonal principal directions;
- the singular vectors identify the corresponding input and output directions.

PCA uses related spectral machinery, but it asks a different question. PCA extracts high-variance directions from a data covariance matrix; here the object of study is how a map itself stretches error. The appearance of eigenvectors in both settings does not make directional error analysis a PCA problem.

## 3. A Nonlinear Map Is Linear Only Locally

Consider

\[
f(x_1,x_2)=
\begin{pmatrix}
x_1^2\\
0.5x_2
\end{pmatrix}.
\]

Its Jacobian is

\[
J_f(x_1,x_2)=
\begin{pmatrix}
2x_1&0\\
0&0.5
\end{pmatrix}.
\]

At $x=(1.5,0)$,

\[
J_f(x)=
\begin{pmatrix}
3&0\\
0&0.5
\end{pmatrix}=A.
\]

The ellipse intuition therefore applies unchanged near this point. It remains a local statement. Let

\[
\Delta x=(h,k)^T.
\]

The exact output change is

\[
f(x+\Delta x)-f(x)=
\begin{pmatrix}
3h+h^2\\
0.5k
\end{pmatrix}.
\]

The linear part predicted by the Jacobian is

\[
J_f(x)\Delta x=
\begin{pmatrix}
3h\\
0.5k
\end{pmatrix},
\]

leaving the remainder

\[
r(\Delta x)=
\begin{pmatrix}
h^2\\
0
\end{pmatrix}.
\]

The right interpretation is:

> The Jacobian is the best first-order linear map from small input perturbations to small output changes near a specified input point.

It is neither a globally constant amplification matrix nor a mechanism that automatically removes the Taylor remainder for finite perturbations.

## 4. Entering Softmax

Softmax is another nonlinear vector map. The next questions are not merely “what is its derivative?” but:

1. Which logit directions leave the probabilities completely unchanged?
2. Which directions receive the largest amplification?
3. Does that local maximum have a bound uniform over all inputs?
4. Do the principal directions split when the probability distribution becomes nonuniform?

The null space, eigenvectors, and eigenvalues of the Softmax Jacobian answer these questions.

---

**Next:** [Softmax 2: Directions and Spectrum on the Probability Simplex](/en/notes/systems/error-analysis/softmax/note-error-softmax-2-geometry-spectrum/)
