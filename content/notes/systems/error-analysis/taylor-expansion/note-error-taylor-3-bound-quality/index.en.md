---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Error Analysis · Taylor 3: Why a Correct Bound Can Still Be Unconvincing'
summary: "Covering the actual error is only the minimum requirement; a coarse supremum bound can completely miss that an approximation is converging."
description: "An analysis of validity, tightness, singularities, and interval information loss using the Taylor remainder of 1/(1-x)."
tags: ["Error Analysis", "Taylor Expansion", "Error Bounds", "Numerical Analysis"]
categories: ["Notes"]
weight: 3
---

Error analysis cannot stop at “the bound is correct.” If a bound is much larger than the actual error, or grows relatively looser with order, it cannot guide an algorithmic decision.

Consider

\[
f(x)=\frac1{1-x},\qquad a=0,\qquad 0\le x\lt1.
\]

## 1. Use the Function's Structure First

The degree-\(n\) Taylor polynomial is a finite geometric sum:

\[
P_n(x)=1+x+\cdots+x^n
=\frac{1-x^{n+1}}{1-x}.
\]

Therefore the exact remainder is

\[
\boxed{
R_n(x)=f(x)-P_n(x)
=\frac{x^{n+1}}{1-x}.
}
\]

No estimate has been used.

## 2. Apply the Generic Lagrange Bound

\[
f^{(n+1)}(t)
=\frac{(n+1)!}{(1-t)^{n+2}}.
\]

On \(0\le t\le x\), the maximum occurs at the right endpoint:

\[
M=\frac{(n+1)!}{(1-x)^{n+2}}.
\]

The standard bound becomes

\[
|R_n(x)|
\le
\frac{x^{n+1}}{(1-x)^{n+2}}.
\]

Its ratio to the actual error is

\[
\frac{B_n(x)}{|R_n(x)|}
=\frac1{(1-x)^{n+1}}.
\]

For every fixed \(x\in(0,1)\), the relative slack grows exponentially with \(n\).

## 3. At \(x=1/2\), the Error Decays but the Bound Does Not

\[
R_n(1/2)=2^{-n},
\]

while

\[
B_n(1/2)=2.
\]

The approximation converges exponentially, but the bound never certifies any improvement. Taylor's theorem has not failed. The lost information comes from replacing the true intermediate point by the right-endpoint worst case.

## 4. The True \(\xi_n\) Moves Left

Lagrange form requires

\[
R_n(x)=
\frac{f^{(n+1)}(\xi_n)}{(n+1)!}x^{n+1}.
\]

Comparison with the exact remainder gives

\[
\xi_n=1-(1-x)^{1/(n+2)}.
\]

For fixed \(0\lt x\lt1\),

\[
\xi_n\to0
\qquad(n\to\infty).
\]

The intermediate point moves toward the expansion point, not toward the right endpoint. Replacing it with \(x\) changes

\[
(1-\xi_n)^{-(n+2)}
\]

into the larger factor

\[
(1-x)^{-(n+2)}.
\]

The exaggeration compounds with order.

## 5. The Integral Picture Exposes What Was Lost

\[
R_n(x)=
\frac1{n!}\int_0^x
\frac{(n+1)!}{(1-t)^{n+2}}
(x-t)^n\,dt.
\]

Two trends oppose each other:

- the derivative is largest near \(t=x\);
- the kernel \((x-t)^n\) is zero at \(t=x\).

The supremum bound multiplies the derivative maximum by the entire kernel mass, as if both worst cases occurred at the same locations. In the actual integral, their locations are misaligned.

The singularity at \(x=1\) amplifies the loss: high derivatives grow rapidly near the right endpoint. Laurent expansion is not required here. The finite geometric sum already gives the exact remainder; the important question is how the singularity magnifies the cost of compression.

## 6. A Quality Checklist for Bounds

Check at least:

1. **Validity**: does the bound always cover the actual error?
2. **Tightness**: is \(B/E\) acceptably small?
3. **Asymptotic quality**: does the bound reveal convergence as scale or order changes?
4. **Information loss**: where were a supremum, triangle inequality, or independent worst cases introduced?
5. **Decision value**: can the bound guide order, step size, or precision?

\[
\boxed{\text{Correctness is only the minimum standard for an error bound.}}
\]

The next step places the error inside a longer computation and asks how it is propagated and amplified.

---

**Next:** [Taylor 4: How Errors Propagate](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-4-propagation-stability/)

