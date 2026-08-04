---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Error Analysis · Taylor 1: First Define R, O, o, and Error Bounds'
summary: "The first step is not applying a remainder theorem, but separating the exact remainder, absolute error, asymptotic order, and computable bound."
description: "A precise vocabulary for Taylor remainders, big-O, little-o, leading terms, and numerical error bounds."
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 1
---

Before asking whether a Taylor approximation is accurate, we need a more basic answer:

> What mathematical object do we mean by “the error”?

Define

\[
P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k.
\]

The Taylor remainder is

\[
\boxed{R_n(x)=f(x)-P_n(x).}
\]

This is an exact signed difference. The definition alone does not say that the remainder is small.

## 1. Four Distinct Objects

### 1.1 Actual Error

After \(f,a,n,x\) are fixed, \(R_n(x)\) is the actual signed error. If only distance matters, use

\[
|R_n(x)|.
\]

Thus \(R_n\) is not the absolute-error function. It preserves whether the approximation overestimates or underestimates; \(|R_n|\) is the absolute error.

### 1.2 Representation

Lagrange, integral, and Peano remainders are ways to represent or characterize \(R_n\). They are not its definition. A representation may contain an unknown point, an integral, or asymptotic notation.

### 1.3 Asymptotic Order

\[
R(h)=O(h^p)
\]

means that near the target limit there is a constant \(C\) such that

\[
|R(h)|\le C|h|^p.
\]

The ratio to \(h^p\) remains bounded. In contrast,

\[
R(h)=o(h^p)
\]

means

\[
\frac{R(h)}{h^p}\to0.
\]

It is not a bound in the opposite direction. It says that \(R\) becomes negligible relative to \(h^p\).

### 1.4 Numerical Bound

To certify a concrete computation, \(O(h^p)\) is usually not enough. We need a constant and a valid range, for example

\[
|R(h)|\le\frac{|h|^3}{6},
\qquad |h|\le0.1.
\]

Asymptotic order describes scaling. A numerical bound tells us how wrong this computation can be.

## 2. \(O\) Is Not an Upper Limit, and \(o\) Is Not a Lower Limit

The common interpretation

\[
O=\text{upper limit},\qquad o=\text{lower limit}
\]

is incorrect. Both symbols compare functions near a limit:

- \(O(g)\): \(R/g\) remains bounded;
- \(o(g)\): \(R/g\to0\).

One error can therefore belong to many \(O\)-classes. For

\[
R_2(x)=\sin x-x,
\]

we have

\[
R_2(x)=-\frac{x^3}{6}+o(x^3).
\]

Consequently,

\[
R_2=O(x^3),\qquad R_2=O(x^2),\qquad R_2=o(x^2),
\]

but \(R_2\ne o(x^3)\), because

\[
\frac{R_2(x)}{x^3}\to-\frac16.
\]

\(O(x^2)\) is valid but fails to expose the actual cubic decay. Correct information can still be too loose.

## 3. A Leading Term Preserves Structure

If

\[
R(h)=Ch^p+o(h^p),
\qquad C\ne0,
\]

then \(Ch^p\) is the leading term. Compared with \(O(h^p)\), it also preserves the sign, coefficient, first nonzero order, and scaling ratio:

\[
\frac{R(h/2)}{R(h)}\to2^{-p}.
\]

This repeated scale law later becomes the basis of observed order and Richardson extrapolation.

## 4. A Checklist for Every Error Formula

Ask:

1. What is the reference?
2. What is the approximation?
3. Does the error preserve its sign?
4. Is the statement an equality, an asymptotic relation, or an inequality?
5. Which variable approaches which limit?
6. Are the constant and valid neighborhood explicit?
7. Can the statement certify a concrete computation?

Once this vocabulary is fixed, we can compare how much information different remainder formulas preserve.

---

**Next:** [Taylor 2: Lagrange, Integral, and Peano Remainders](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-2-remainder-forms/)
