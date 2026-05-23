---
date: '2026-05-14T10:00:00+09:00'
draft: false
title: 'Real Analysis Part 3: Metric Spaces, Normed Spaces, Hilbert Spaces, and the Foundations of Fourier'
summary: "Starting from completeness of ℝ, this note lifts analysis to general spaces — adding metric, norm, and inner product layer by layer up to Hilbert space, and finally uses orthonormal bases and Parseval's identity to set Fourier series and the Fourier transform on rigorous footing."
description: "An intermediate real-analysis note on metric spaces, normed spaces, Banach spaces, inner-product spaces, Hilbert spaces, the Cauchy–Schwarz inequality, the orthogonal decomposition theorem, orthogonal projection, Bessel's inequality, Parseval's identity, the L² foundation of Fourier series, and the Fourier transform as an infinite-dimensional change of coordinates."
tags: ["Real Analysis", "Metric Space", "Normed Space", "Banach Space", "Hilbert Space", "Inner Product", "Cauchy-Schwarz", "Orthogonal Decomposition", "Fourier Series", "Fourier Transform", "Parseval", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/real-analysis-3-metric-normed-hilbert-fourier/
---

# Real Analysis Part 3: Metric Spaces, Normed Spaces, Hilbert Spaces, and the Foundations of Fourier

Part 2 ended on a single line:

**In the equivalence chain of completeness, only Cauchy completeness transfers beyond order structure.**

This note cashes that in: starting from $\mathbb{R}$, we abstract the entire language of analysis layer by layer, equipping it with more and more structure, and finally land in Hilbert space — the natural stage for Fourier.

The whole chain:

$$
\varepsilon\text{-}N \to \text{completeness} \to \text{metric space} \to \text{normed space} \to \text{inner-product space} \to \text{Hilbert space} \to \text{orthogonal decomposition} \to \text{Fourier}
$$

Each step adds exactly one kind of structure and cashes in one kind of geometric object:

- a metric gives "distance";
- a norm gives "length";
- an inner product gives "angle";
- completeness collects every Cauchy limit back into the space.

At the Hilbert level, every piece of $\mathbb{R}^n$ geometry (projection, orthogonality, coordinate decomposition) is reborn, with the only change being that dimension goes from finite to countably infinite. Fourier series is literally an instance of this.

A few things to keep in mind up front:
- metric, norm, and inner product are **stacked layers**, not parallel alternatives;
- every claim proved on $\mathbb{R}$ in Part 2 (uniqueness of limits, boundedness of convergent sequences, convergence ⇒ Cauchy) holds verbatim in any metric space — **prove once, use everywhere**;
- the Cauchy–Schwarz inequality is the lifeline of the inner-product-induced norm;
- the existence proof of the orthogonal decomposition theorem follows the classic "minimization + completeness + orthogonality verification" three-step pattern;
- Fourier series = coordinate decomposition in Hilbert space, Fourier transform = an infinite-dimensional change of coordinates.

---

## 1. Metric Spaces

### Motivation

Looking back at all analysis on $\mathbb{R}$, the only object that mattered is the distance $|a_n - a|$. Once we abstract "distance" itself as primitive structure, the entire $\varepsilon$-$N$ language, Cauchy sequences, and completeness all transfer unchanged.

### Definition

$(X, d)$ is a **metric space** if $d: X \times X \to \mathbb{R}$ satisfies:

1. **Non-negativity and definiteness**: $\forall x,y,\ d(x,y) \ge 0$, and $d(x,y) = 0 \iff x = y$;
2. **Symmetry**: $\forall x,y,\ d(x,y) = d(y,x)$;
3. **Triangle inequality**: $\forall x,y,z,\ d(x,z) \le d(x,y) + d(y,z)$.

### Examples

- $(\mathbb{R}, |x-y|)$: the entire content of Parts 1 and 2;
- $(\mathbb{R}^n, \|x-y\|_2)$: Euclidean distance;
- **Discrete metric** $d(x,y) = 0$ if $x = y$, else $1$. A counterexample factory: all points are equidistant, so no sequence converges to anything outside. Useful for stress-testing definitions, not for real analysis;
- $(C[0,1], \max_t |f(t) - g(t)|)$: the elements are **functions**, and the distance is the maximum pointwise deviation. This is the first signpost that analysis is entering the functional world — **the "points" of distance can themselves be functions**.

### Convergence and Cauchy in Metric Spaces

**Convergence**:

$$
x_n \to x\ \iff\ \forall \varepsilon \gt 0,\ \exists N,\ \forall n \ge N,\ d(x_n, x) \lt \varepsilon.
$$

**Cauchy sequence**:

$$
(x_n)\text{ Cauchy}\ \iff\ \forall \varepsilon \gt 0,\ \exists N,\ \forall m,n \ge N,\ d(x_m, x_n) \lt \varepsilon.
$$

**Complete metric space**: every Cauchy sequence converges to a point inside the space.

### An Incomplete Example

$(\mathbb{Q}, |\cdot|)$: the sequence

$$
1,\ 1.4,\ 1.41,\ 1.414,\ \ldots
$$

is Cauchy, but the point it is converging to, $\sqrt 2 \notin \mathbb{Q}$, **falls out of the space**. This is exactly the "completeness fills in Cauchy limits" point Part 2 hammered.

### Prove Once, Use Everywhere

Every "$|\cdot|$-style" claim proved on $\mathbb{R}$ in Parts 1 and 2 — uniqueness of limit, boundedness of convergent sequences, convergence ⇒ Cauchy — holds in **any** metric space with the proof unchanged; just replace $|\cdot|$ with $d(\cdot,\cdot)$. This is the first dividend of abstraction:

**Prove once, use everywhere.**

Only the converse, "Cauchy ⇒ convergent," does not come for free. Whether it holds defines "completeness."

---

## 2. Normed Spaces

### Definition

$(V, \|\cdot\|)$ is a **normed space** if $V$ is a real (or complex) vector space and $\|\cdot\|: V \to \mathbb{R}$ satisfies:

1. **Non-negativity and definiteness**: $\|x\| \ge 0$, and $\|x\| = 0 \iff x = 0$;
2. **Homogeneity**: $\|\alpha x\| = |\alpha|\,\|x\|$;
3. **Triangle inequality**: $\|x+y\| \le \|x\| + \|y\|$.

The two pieces a norm adds beyond a metric — **homogeneity** (a scale) and **compatibility with addition** — are the imprint of the underlying linear structure.

### A Norm Induces a Metric

$$
d(x,y) = \|x - y\|.
$$

This automatically satisfies the three metric axioms, so:

$$
\text{normed space} \subset \text{metric space}.
$$

### Banach Spaces

$$
\text{Banach space} = \text{complete normed space}.
$$

$\mathbb{R}^n$ is Banach; $C[0,1]$ with the sup norm is Banach.

### An Incomplete Normed Space

Take

$$
V = \bigl\{ (x_1, x_2, \ldots) : \text{only finitely many entries nonzero} \bigr\} \subset \mathbb{R}^{\mathbb{N}},
$$

with the $\ell^2$ norm $\|x\|_2 = \sqrt{\sum x_n^2}$. Consider

$$
x^{(N)} = \bigl(1, \tfrac{1}{2}, \tfrac{1}{3}, \ldots, \tfrac{1}{N}, 0, 0, \ldots\bigr) \in V.
$$

This is Cauchy (the tail $\sum_{n \gt N} \tfrac{1}{n^2} \to 0$), but the limit it is approaching,

$$
\bigl(1, \tfrac12, \tfrac13, \ldots\bigr),
$$

**has infinitely many nonzero entries and is not in $V$**. The Cauchy limit falls outside the space — so $V$ is not complete. Adding back all those "missing limits" gives $\ell^2$, which is complete.

> This is the first concrete feel for completion: **completion = invite all the absent Cauchy limits back home.**

---

## 3. Inner-Product Spaces and Hilbert Spaces

### Inner Product

$\langle\cdot,\cdot\rangle: V \times V \to \mathbb{R}$ is an **inner product** on $V$ if:

1. **Symmetry**: $\langle x,y \rangle = \langle y,x \rangle$;
2. **Linearity in the first argument**: $\langle \alpha x + y, z \rangle = \alpha\langle x, z \rangle + \langle y, z \rangle$;
3. **Positive definiteness**: $\langle x, x \rangle \ge 0$, and $\langle x, x \rangle = 0 \iff x = 0$.

> **Complex version**: replace symmetry with conjugate symmetry $\langle x,y\rangle = \overline{\langle y,x\rangle}$; linear in the first slot, conjugate-linear in the second. The Fourier section will switch to the complex version.

### Inner Product Induces a Norm

$$
\|x\| = \sqrt{\langle x, x \rangle}.
$$

It indeed satisfies the three norm axioms, but **the triangle inequality is not obvious** — it depends on Cauchy–Schwarz.

### Three-Layer Nesting

$$
\text{inner-product space} \subset \text{normed space} \subset \text{metric space}.
$$

Each new layer adds one more geometric object: a metric gives "near/far," a norm adds "length and scaling," an inner product adds "angle and orthogonality."

### Cauchy–Schwarz Inequality

$$
\forall x,y \in V,\ |\langle x, y \rangle| \le \|x\| \cdot \|y\|.
$$

{{< details summary="Proof: Cauchy–Schwarz (discriminant trick)" >}}

If $y = 0$, both sides are zero; trivial. Assume $y \ne 0$.

For any $t \in \mathbb{R}$, by positive definiteness

$$
0 \le \|x - ty\|^2 = \langle x - ty, x - ty \rangle = \|x\|^2 - 2t\langle x, y \rangle + t^2\|y\|^2.
$$

View the right side as a quadratic in $t$. Non-negativity for all $t$ $\iff$ discriminant $\le 0$:

$$
\bigl(2\langle x, y \rangle\bigr)^2 - 4\|x\|^2\|y\|^2 \le 0,
$$

i.e.

$$
\langle x, y \rangle^2 \le \|x\|^2\|y\|^2.
$$

Taking square roots gives $|\langle x, y \rangle| \le \|x\|\,\|y\|$.

{{< /details >}}

Three uses worth noting:

1. **It saves the triangle inequality**: $\|x+y\|^2 = \|x\|^2 + 2\langle x,y \rangle + \|y\|^2 \le \|x\|^2 + 2\|x\|\|y\| + \|y\|^2 = (\|x\|+\|y\|)^2$, so the "$\sqrt{\langle\cdot,\cdot\rangle}$" really is a legitimate norm;
2. **It defines an angle**: $\cos\theta = \dfrac{\langle x,y \rangle}{\|x\|\,\|y\|} \in [-1, 1]$;
3. **On $L^2$ it becomes a special case of Hölder's inequality**, appearing everywhere in PDEs, numerical analysis, and probability.

### Hilbert Spaces

$$
\text{Hilbert space} = \text{complete inner-product space}.
$$

Canonical examples:

- $\mathbb{R}^n$ (finite-dimensional spaces are always complete);
- $\ell^2 = \bigl\{ (x_n) : \sum x_n^2 \lt \infty \bigr\}$;
- $L^2[0,1] = \bigl\{ f : \int_0^1 |f|^2 \lt \infty \bigr\}$ (which §6 will reuse).

---

## 4. Orthogonality and Orthogonal Decomposition

This is where the **angle structure** comes to the front.

### Orthogonality

$x \perp y\ \iff\ \langle x, y \rangle = 0$.

**Pythagoras**:

$$
x \perp y\ \Rightarrow\ \|x + y\|^2 = \|x\|^2 + \|y\|^2.
$$

The proof is the expansion $\|x+y\|^2 = \langle x+y, x+y\rangle = \|x\|^2 + 2\langle x,y\rangle + \|y\|^2$, with the cross-term zero.

### Orthogonal Complement

Let $M \subseteq V$ be any subset:

$$
M^\perp = \{x \in V : \langle x, y \rangle = 0,\ \forall y \in M\}.
$$

It is easy to check that $M^\perp$ is always a **closed linear subspace** of $V$.

### The Orthogonal Decomposition Theorem

**Claim**: let $H$ be a Hilbert space and $M \subseteq H$ a closed subspace. Then

$$
\forall x \in H,\ \exists!\,(m, m^\perp) \in M \times M^\perp,\ x = m + m^\perp.
$$

**Uniqueness**:

{{< details summary="Proof: uniqueness" >}}

Suppose $x = m_1 + m_1^\perp = m_2 + m_2^\perp$. Then

$$
m_1 - m_2 = m_2^\perp - m_1^\perp.
$$

The left side lies in $M$, the right side in $M^\perp$, so both sides lie in $M \cap M^\perp$. But $z \in M \cap M^\perp$ means $\langle z, z \rangle = 0$, i.e. $z = 0$. Hence $m_1 = m_2$ and $m_1^\perp = m_2^\perp$.

{{< /details >}}

**Existence**: this is the most analysis-heavy step. The pattern is "minimization + completeness + orthogonality verification."

{{< details summary="Proof: existence (minimization → Cauchy → completeness → verify orthogonality)" >}}

**Step 1: build a minimizing sequence.**

Let $d = \inf_{y \in M} \|x - y\|$. By the characterization of infimum, there exist $y_n \in M$ with

$$
\|x - y_n\| \to d.
$$

**Step 2: $(y_n)$ is Cauchy.**

The key tool is the **parallelogram identity** (valid in any inner-product space):

$$
\|u + v\|^2 + \|u - v\|^2 = 2\|u\|^2 + 2\|v\|^2.
$$

Take $u = x - y_m,\ v = x - y_n$; then $u + v = 2x - (y_m + y_n)$ and $u - v = y_n - y_m$. Substituting:

$$
\|2x - (y_m + y_n)\|^2 + \|y_n - y_m\|^2 = 2\|x - y_m\|^2 + 2\|x - y_n\|^2.
$$

Rearranging:

$$
\|y_n - y_m\|^2 = 2\|x - y_m\|^2 + 2\|x - y_n\|^2 - 4\left\|x - \tfrac{y_m + y_n}{2}\right\|^2.
$$

Since $\tfrac{y_m + y_n}{2} \in M$ ($M$ is a subspace), $\|x - \tfrac{y_m + y_n}{2}\| \ge d$. So

$$
\|y_n - y_m\|^2 \le 2\|x - y_m\|^2 + 2\|x - y_n\|^2 - 4d^2 \to 2d^2 + 2d^2 - 4d^2 = 0.
$$

So $(y_n)$ is Cauchy.

**Step 3: completeness gives the landing point.**

$H$ complete ⇒ $y_n \to m \in H$.

$M$ closed ⇒ $m \in M$.

By continuity of distance, $\|x - m\| = d$.

**Step 4: verify $x - m \in M^\perp$.**

For any $v \in M$ and $t \in \mathbb{R}$, since $m + tv \in M$,

$$
\|x - m\|^2 \le \|x - m - tv\|^2 = \|x - m\|^2 - 2t\langle x - m, v \rangle + t^2\|v\|^2.
$$

So $0 \le -2t\langle x - m, v \rangle + t^2\|v\|^2$ for all $t$. Viewed as a quadratic in $t$, **minimized at $t = 0$** $\iff$ linear coefficient is zero:

$$
\langle x - m, v \rangle = 0,\quad \forall v \in M.
$$

So $x - m \in M^\perp$.

Take $m^\perp = x - m$ to obtain $x = m + m^\perp$.

{{< /details >}}

The skeleton of the proof is worth remembering:

> **Minimization problem → Cauchy sequence → completeness gives a landing point → variational argument verifies orthogonality.**

Completeness is what makes the construction work. In any incomplete space the final landing-point step would fail.

### Orthogonal Projection

Define $P_M x = m$, the $M$-component of the decomposition. It satisfies

$$
\|x - P_M x\| = \min_{y \in M} \|x - y\|.
$$

**$P_M x$ is the point of $M$ closest to $x$.** This **best-approximation property** is the shared core of:

- Galerkin methods (numerical solutions to PDEs);
- least squares (normal equations);
- finite element methods (projection in weak form);
- Fourier truncation (optimality of partial sums).

---

## 5. Orthonormal Bases and Fourier

### Orthonormal Set

$\{e_n\}_{n \in \mathbb{N}} \subseteq H$ is an **orthonormal set** if

$$
\langle e_i, e_j \rangle = \delta_{ij} = \begin{cases} 1, & i = j \\ 0, & i \ne j \end{cases}.
$$

### Fourier Coefficient

$$
\hat x_n = \langle x, e_n \rangle.
$$

Geometrically: the length of $x$'s projection onto $e_n$. This is exactly the $\mathbb{R}^n$ rule "the $i$-th coordinate of $x$ is the inner product $\langle x, e_i \rangle$," unchanged.

### Bessel's Inequality

$$
\sum_{n=1}^\infty |\hat x_n|^2 \le \|x\|^2.
$$

{{< details summary="Proof: Bessel's inequality" >}}

Let $S_N = \sum_{n=1}^N \hat x_n e_n$ be the partial projection of $x$ onto the first $N$ basis directions. By orthonormality,

$$
\|S_N\|^2 = \sum_{n=1}^N |\hat x_n|^2,\qquad \langle x, S_N \rangle = \sum_{n=1}^N |\hat x_n|^2.
$$

Expanding,

$$
0 \le \|x - S_N\|^2 = \|x\|^2 - 2\langle x, S_N \rangle + \|S_N\|^2 = \|x\|^2 - \sum_{n=1}^N |\hat x_n|^2.
$$

Rearranging:

$$
\sum_{n=1}^N |\hat x_n|^2 \le \|x\|^2.
$$

Taking the limit as $N \to \infty$ gives Bessel's inequality.

{{< /details >}}

Intuitively, Bessel says: **the total "component energy" of $x$ along all basis directions does not exceed its own energy.**

### Orthonormal Basis

$\{e_n\}$ is an **orthonormal basis** if it is orthonormal **and for every $x \in H$**

$$
x = \sum_{n=1}^\infty \hat x_n e_n
$$

converges in the norm of $H$. This convergence step **depends entirely on completeness** — the partial sums $S_N$ form a Cauchy sequence (provable via Bessel), and we need $H$ complete to find a limit.

In this case Bessel becomes an equality, called **Parseval's identity**:

$$
\|x\|^2 = \sum_{n=1}^\infty |\hat x_n|^2.
$$

### Parallel with $\mathbb{R}^n$

| | $\mathbb{R}^n$ | Hilbert space $H$ |
|---|---|---|
| Coordinate | $x_i = \langle x, e_i \rangle$ | $\hat x_n = \langle x, e_n \rangle$ |
| Reconstruction | $x = \sum_{i=1}^n x_i e_i$ | $x = \sum_{n=1}^\infty \hat x_n e_n$ |
| Norm | $\|x\|^2 = \sum_i x_i^2$ | $\|x\|^2 = \sum_n |\hat x_n|^2$ |

The structures are **completely parallel** — the only difference is that the sum goes from finite to countably infinite. **Completeness is the floor that makes the infinite series converge.**

---

## 6. The Hilbert-Space Foundation of Fourier Series

### Stage: $L^2[0,T]$

$$
L^2[0,T] = \left\{ f : [0,T] \to \mathbb{C}\ \Big|\ \int_0^T |f(t)|^2\,dt \lt \infty \right\},
$$

with the (complex) inner product

$$
\langle f, g \rangle = \frac{1}{T}\int_0^T f(t)\,\overline{g(t)}\,dt.
$$

$L^2[0,T]$ is a Hilbert space (completeness is the core conclusion of $L^2$ theory, ultimately resting on the Riesz–Fischer theorem and measure theory).

### Orthonormality of the Basis Functions

Take

$$
e_n(t) = e^{jn\omega_0 t},\qquad \omega_0 = \frac{2\pi}{T},\quad n \in \mathbb{Z}.
$$

Compute

$$
\langle e_m, e_n \rangle = \frac{1}{T}\int_0^T e^{jm\omega_0 t}\overline{e^{jn\omega_0 t}}\,dt = \frac{1}{T}\int_0^T e^{j(m-n)\omega_0 t}\,dt = \delta_{mn}.
$$

For $m \ne n$, the integrand is a nonzero-frequency complex exponential, which averages to zero over a full period; for $m = n$, the integrand is constant $1$, integrating to $T$, which the $1/T$ factor normalizes to $1$.

So $\{e_n\}_{n \in \mathbb{Z}}$ is an **orthonormal basis** of $L^2[0,T]$ (that it actually spans is a classical result of Fourier theory).

### Fourier Coefficient = Inner-Product Projection

$$
c_n = \langle f, e_n \rangle = \frac{1}{T}\int_0^T f(t)\,e^{-jn\omega_0 t}\,dt.
$$

This is exactly the standard Fourier coefficient formula from engineering textbooks. Its **meaning** is now completely clear:

**$c_n$ is the length of $f$'s projection onto the $n$-th basis direction (its coordinate).**

The mysterious "multiply by the target-frequency complex exponential and integrate" is just the §5 rule "coordinate = inner product with basis vector," made concrete. Orthogonality cancels all the cross-frequency terms, leaving only the target frequency.

### Reconstruction and Parseval

$$
f = \sum_{n=-\infty}^\infty c_n e_n\quad (\text{convergent in }L^2),
$$

$$
\frac{1}{T}\int_0^T |f(t)|^2\,dt = \sum_{n=-\infty}^\infty |c_n|^2.
$$

The left side is the time-domain (average) energy of $f$; the right side is its frequency-domain energy spectrum summed. **Time-domain energy = frequency-domain energy.**

This is just the general Parseval identity $\|x\|^2 = \sum |\hat x_n|^2$ of §5, written concretely on $L^2[0,T]$.

### $T \to \infty$: The Fourier Transform

Stretching the period $T$ to infinity, the discrete frequencies $\{n\omega_0\}_{n \in \mathbb{Z}}$ have spacing $\omega_0 = 2\pi/T \to 0$, and the discrete sum becomes a continuous integral:

$$
F(\omega) = \int_{-\infty}^\infty f(t)\,e^{-j\omega t}\,dt,\qquad f(t) = \frac{1}{2\pi}\int_{-\infty}^\infty F(\omega)\,e^{j\omega t}\,d\omega.
$$

The corresponding Parseval (Plancherel) identity:

$$
\int_{-\infty}^\infty |f(t)|^2\,dt = \frac{1}{2\pi}\int_{-\infty}^\infty |F(\omega)|^2\,d\omega.
$$

Extending the finite basis of §5 to a "continuous basis" $\{e^{j\omega t}\}_{\omega \in \mathbb{R}}$, the entire coordinate language lifts from countably infinite to uncountably continuous. **The Fourier transform is a change of coordinates in an infinite-dimensional space, structurally parallel to the standard-basis decomposition in $\mathbb{R}^n$.**

At this point the $\varepsilon$-$N$ of Part 1, the completeness of Part 2, and the geometric abstraction of the first five sections of this note all connect with the Fourier toolkit you have been using in signal processing, PDEs, and quantum mechanics.

---

## Summary: Three Threads Running Throughout

The path Hilbert space → Fourier works because three things interlock:

1. **Inner product defines angle**: with $\langle\cdot,\cdot\rangle$ comes "orthogonality," and with orthogonality comes "decomposition." This is the source of all later geometry.
2. **Orthogonality kills cross terms**: the Fourier-coefficient formula $c_n = \langle f, e_n \rangle$ is not magic — it is the standard coordinate readout in an orthonormal basis. "Multiply by the target frequency and integrate" kills the cross terms and leaves only the target component.
3. **Completeness gives landing points**: the convergence of $\sum c_n e_n$, the existence of limits of minimizing sequences, every Cauchy sequence in $L^2$ having an $L^2$ limit — all of these use completeness. **Completeness is the oxygen that lets analysis survive in infinite dimensions.**

**Connection to functional analysis**: the next stop is **bounded linear operators**. Hilbert space is their natural stage — adjoint, spectrum, compact operators, and self-adjointness all rest on inner product + completeness. The Fourier transform itself is an example of a unitary operator, to be unpacked later.
