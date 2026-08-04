---
date: '2026-07-30T00:00:00+09:00'
draft: false
title: 'Error Analysis · Taylor 2: Lagrange, Integral, and Peano Remainders'
summary: "The three forms use different assumptions and preserve different information: an unknown point, interval-wide contributions, and local asymptotic decay are not interchangeable."
description: "A comparison of the assumptions, conclusions, and information loss in Lagrange, integral, and Peano remainders."
tags: ["Error Analysis", "Numerical Analysis", "Taylor Expansion"]
categories: ["Notes"]
series: ["Error Analysis"]
note_kind: "research"
weight: 2
---

The remainder is already defined by

\[
R_n(x)=f(x)-P_n(x).
\]

The next question is how to describe this exact difference. Each remainder form chooses a different balance among assumption strength, retained information, and computability.

## 1. Lagrange Remainder: Exact, but With a Hidden Point

If \(f\in C^{n+1}(I)\), where \(I\) contains \(a\) and \(x\), then some \(\xi\) between them satisfies

\[
\boxed{
R_n(x)=
\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1}.
}
\]

This is an exact equality, but \(\xi\) is generally unknown. Rolle's theorem guarantees its existence, and it may change with \(x\).

If

\[
|f^{(n+1)}(t)|\le M
\]

throughout the interval, then

\[
|R_n(x)|
\le
\frac{M}{(n+1)!}|x-a|^{n+1}.
\]

The unknown point disappears, at the cost of replacing its actual derivative value by the worst value on the entire interval.

For \(\sin\theta\approx\theta\),

\[
\sin\theta-\theta
=-\frac{\cos\xi}{6}\theta^3,
\]

so

\[
|\sin\theta-\theta|\le\frac{|\theta|^3}{6}.
\]

As \(\theta\to0\), the trapped point \(\xi\to0\), giving

\[
\sin\theta-\theta
=-\frac{\theta^3}{6}+o(\theta^3).
\]

## 2. Integral Remainder: Preserve Contributions Across the Interval

\[
\boxed{
R_n(x)=
\frac1{n!}
\int_a^x f^{(n+1)}(t)(x-t)^n\,dt.
}
\]

Instead of hiding the interval in one point, this form shows how each location contributes through the kernel

\[
\frac{(x-t)^n}{n!}.
\]

It can reveal:

- the sign of the remainder;
- which part of the interval contributes most;
- whether a large derivative occurs where the kernel has significant weight;
- why a supremum bound is loose.

For a first-order approximation,

\[
R_1(x)=\int_a^x f''(t)(x-t)\,dt.
\]

If \(x\gt a\) and \(f''\ge0\), then \(R_1\ge0\): a convex function lies above its tangent.

Taking absolute values and applying the interval bound \(M\) recovers

\[
|R_n(x)|
\le
\frac{M}{(n+1)!}|x-a|^{n+1}.
\]

The computable Lagrange bound can therefore be viewed as a compression of the full interval structure.

## 3. Peano Remainder: Weaker Assumptions, Local Asymptotics Only

Differentiability itself is equivalent to

\[
f(a+h)=f(a)+f'(a)h+o(h).
\]

At order \(n\),

\[
\boxed{
f(a+h)=
\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}h^k
+o(h^n).
}
\]

Peano form usually gives no sign, explicit constant, intermediate point, or \(O(h^{n+1})\) guarantee. Its advantage is that it uses weaker and more local differentiability information.

For

\[
f(x)=|x|^{3/2},\qquad a=0,
\]

we have \(f(0)=f'(0)=0\), so

\[
R_1(x)=|x|^{3/2}=o(|x|).
\]

Yet

\[
\frac{|x|^{3/2}}{x^2}\to\infty,
\]

so \(R_1\ne O(x^2)\). A Peano conclusion can hold even when a second-order Lagrange-style bound does not.

## 4. Choosing a Form

| Form | Main assumption | Information retained | Main use |
| --- | --- | --- | --- |
| Lagrange | higher smoothness on an interval | derivative at an unknown point | quick order and explicit bounds |
| Integral | enough regularity for integration | sign, position, and weight over the interval | structural analysis and bound diagnosis |
| Peano | local \(n\)-times differentiability | local relative decay | asymptotics under weaker assumptions |

The information flow is

\[
\text{full interval structure}
\rightarrow
\text{unknown intermediate point}
\rightarrow
\text{interval worst case}.
\]

Information decreases while computability increases. The next note shows how the final compression can remain legal while making the bound practically useless.

---

**Next:** [Taylor 3: Why a Correct Bound Can Still Be Unconvincing](/en/notes/systems/error-analysis/taylor-expansion/note-error-taylor-3-bound-quality/)
