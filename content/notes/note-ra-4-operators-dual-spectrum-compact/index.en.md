---
date: '2026-05-14T18:00:00+09:00'
draft: false
title: 'Real Analysis Part 4: Bounded Linear Operators, Dual Space, Spectral Theory, and Compact Operators'
summary: "From Hilbert space to operators. First pin down the bounded ⟺ continuous equivalence, build 𝓑(X,Y) and the dual space X*, identify a Hilbert space with its dual via the Riesz representation theorem; then climb spectral theory and self-adjoint operators, and finally reach the spectral theorem for compact operators — translating the inverse-problem fact that 'small singular values amplify noise' into spectral language, which naturally leads to the filter interpretation of Tikhonov regularization."
description: "An intermediate functional-analysis note on bounded linear operators, operator norm, the equivalence of bounded and continuous, the operator space 𝓑(X,Y), the dual space, the Riesz representation theorem, spectrum and resolvent set, adjoint and self-adjoint operators, compact operators, the spectral theorem for compact self-adjoint operators, ill-posedness of inverse problems, and the spectral interpretation of Tikhonov regularization and truncated SVD."
tags: ["Functional Analysis", "Bounded Operator", "Operator Norm", "Dual Space", "Riesz Representation", "Spectrum", "Self-Adjoint", "Compact Operator", "Spectral Theorem", "Inverse Problem", "Tikhonov Regularization", "SVD", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/real-analysis-4-operators-dual-spectrum-compact/
  - /notes/笔记-实分析4-有界算子对偶谱与紧算子/
  - /notes/functional-analysis-2-operators-dual-spectrum/
---

# Real Analysis Part 4: Bounded Linear Operators, Dual Space, Spectral Theory, and Compact Operators

> Real Analysis Part 4 = Functional Analysis Part 2. Part 3 set the stage (metric → norm → inner product → Hilbert); this note brings on the actors (**operators**), and translates "why inverse problems are ill-posed and why regularization is needed," long treated as engineering folk wisdom, into spectral language.

The chain:

$$
\text{bounded linear operators}\to\mathcal{B}(X,Y)\to\text{dual }X^*\to\text{Riesz representation}\to\text{spectrum}\to\text{self-adjoint}\to\text{spectral theorem for compact ops}\to\text{inverse problems and regularization}
$$

Every step is doing the same thing: **carry over the familiar objects from finite-dimensional linear algebra (matrices, transposes, eigenvalues, diagonalization, pseudoinverses) into infinite-dimensional Hilbert space, item by item, and pinpoint which transfer for free, which need completeness, and which need compactness to survive.**

A few things to keep in mind up front:

- For linear maps, **bounded ⟺ continuous** — this is the gateway to all the "analysis flavor" of functional analysis;
- $\mathcal{B}(X,Y)$ is automatically Banach when $Y$ is, so $X^* = \mathcal{B}(X, \mathbb{K})$ is **always** Banach;
- the Riesz representation theorem makes a Hilbert space and its dual **isometrically isomorphic**, legitimizing the rule "take coordinates = inner product with basis vector" in infinite-dimensional inner-product spaces;
- in infinite dimensions, the spectrum is not just eigenvalues — there is continuous spectrum and residual spectrum too; but **the nonzero spectrum of a compact operator is just a sequence of eigenvalues decaying to $0$**, which makes compact self-adjoint operators "diagonalizable" like finite-dimensional symmetric matrices;
- **inverse-problem ill-posedness = $0$ is an accumulation point of the operator's spectrum**; Tikhonov regularization simply adds a filter $\sigma^2/(\sigma^2 + \alpha)$ to the spectrum, suppressing noise amplification along small-singular-value directions.

---

## 1. Bounded Linear Operators

### Linear + Bounded

Let $X, Y$ be normed spaces and $T: X \to Y$.

**Linear**:

$$
\forall x,y \in X,\ \alpha,\beta \in \mathbb{K},\ T(\alpha x + \beta y) = \alpha Tx + \beta Ty.
$$

**Bounded**: $\exists M \ge 0$ such that

$$
\forall x \in X,\ \|Tx\|_Y \le M\|x\|_X.
$$

### Operator Norm

$$
\|T\|_{\text{op}} = \sup_{x \ne 0} \frac{\|Tx\|_Y}{\|x\|_X} = \sup_{\|x\|_X = 1} \|Tx\|_Y = \sup_{\|x\|_X \le 1} \|Tx\|_Y.
$$

The three forms are equivalent (linearity stretches the unit-sphere supremum to the whole-space supremum). $\|T\|_{\text{op}}$ is the **smallest** $M$ for which

$$
\|Tx\|_Y \le \|T\|_{\text{op}}\|x\|_X
$$

holds.

### Bounded ⟺ Continuous

**Claim**: for any **linear** operator $T: X \to Y$,

$$
T\text{ bounded}\ \iff\ T\text{ continuous}\ \iff\ T\text{ continuous at }0.
$$

{{< details summary="Proof: bounded ⟺ continuous (linear-only equivalence)" >}}

**Bounded ⇒ continuous**:

$$
\|T(x_n) - T(x)\| = \|T(x_n - x)\| \le \|T\|_{\text{op}}\|x_n - x\| \to 0.
$$

So $T$ is continuous everywhere.

**Continuous ⇒ continuous at $0$**: trivial.

**Continuous at $0$ ⇒ bounded**:

By continuity at $0$, taking $\varepsilon = 1$ gives $\exists \delta \gt 0$ with

$$
\|x\| \le \delta\ \Rightarrow\ \|Tx\| \le 1.
$$

For any $x \ne 0$, let $y = \dfrac{\delta x}{\|x\|}$; then $\|y\| = \delta$, so $\|Ty\| \le 1$, i.e.

$$
\frac{\delta}{\|x\|}\|Tx\| \le 1\ \Rightarrow\ \|Tx\| \le \frac{1}{\delta}\|x\|.
$$

So $T$ is bounded, and $\|T\|_{\text{op}} \le 1/\delta$.

{{< /details >}}

**This equivalence is exclusive to linear maps.** For a general nonlinear map, "bounded" and "continuous" are two completely independent properties. Linearity collapses them into one — which is why in functional analysis "operator" defaults to "linear + continuous" as a single package.

### Examples

| Operator | Action | $\|T\|_{\text{op}}$ |
|----------|--------|---------------------|
| Identity $I: X \to X$ | $Ix = x$ | $1$ |
| Multiplication $M_\varphi: L^2 \to L^2$ | $(M_\varphi f)(t) = \varphi(t) f(t)$ | $\|\varphi\|_\infty$ |
| Left shift $S: \ell^2 \to \ell^2$ | $(Sx)_n = x_{n+1}$ | $1$ |
| Integral operator $T_K: L^2[0,1] \to L^2[0,1]$ | $(T_K f)(x) = \int_0^1 K(x,y) f(y)\,dy$ | $\le \|K\|_{L^2}$ |

The last row is the most important operator class for PDEs and inverse problems — Hilbert–Schmidt operators. They are automatically compact (§6).

---

## 2. The Operator Space $\mathcal{B}(X, Y)$

Write

$$
\mathcal{B}(X, Y) = \{T: X \to Y \mid T\text{ linear and bounded}\}.
$$

### It Is a Normed Space

Vector space structure: $(\alpha S + \beta T)x = \alpha Sx + \beta Tx$.

Norm: the operator norm $\|\cdot\|_{\text{op}}$. All three axioms are easy to verify.

### $Y$ Complete ⇒ $\mathcal{B}(X, Y)$ Complete

**Claim**: if $Y$ is a Banach space, so is $\mathcal{B}(X, Y)$.

{{< details summary="Proof: completeness of $\mathcal{B}(X,Y)$ (pointwise limit + uniformity)" >}}

Let $(T_n) \subseteq \mathcal{B}(X, Y)$ be Cauchy.

**Step 1: the image at each point is Cauchy.**

For any $x \in X$,

$$
\|T_n x - T_m x\| \le \|T_n - T_m\|_{\text{op}}\|x\| \to 0.
$$

So $(T_n x)$ is Cauchy in $Y$. By completeness of $Y$, $\exists Tx \in Y$ with $T_n x \to Tx$.

**Step 2: $T$ is linear.**

By limit arithmetic,

$$
T(\alpha x + \beta y) = \lim_n T_n(\alpha x + \beta y) = \alpha \lim_n T_n x + \beta \lim_n T_n y = \alpha Tx + \beta Ty.
$$

**Step 3: $T$ is bounded, and $T_n \to T$ in operator norm.**

$(T_n)$ Cauchy ⇒ bounded: $\exists M$, $\|T_n\|_{\text{op}} \le M$. Taking limits gives $\|Tx\| \le M\|x\|$, so $T$ is bounded.

Take any $\varepsilon \gt 0$; $\exists N$ such that $\forall m, n \ge N$, $\|T_n - T_m\|_{\text{op}} \lt \varepsilon$. Fix $n \ge N$; for $\|x\| \le 1$,

$$
\|T_n x - Tx\| = \lim_m \|T_n x - T_m x\| \le \lim_m \|T_n - T_m\|_{\text{op}} \le \varepsilon.
$$

This holds uniformly over $\|x\| \le 1$, so $\|T_n - T\|_{\text{op}} \le \varepsilon$. Thus $T_n \to T$.

{{< /details >}}

A direct corollary sets up the next section: **the dual space $X^* = \mathcal{B}(X, \mathbb{K})$ is always complete** (because $\mathbb{R}$ and $\mathbb{C}$ are).

### Composition and Operator Algebras

**Norm control under composition**:

$$
\|ST\|_{\text{op}} \le \|S\|_{\text{op}}\|T\|_{\text{op}}.
$$

Proof: $\|STx\| \le \|S\|\|Tx\| \le \|S\|\|T\|\|x\|$.

When $X = Y$, $\mathcal{B}(X) = \mathcal{B}(X, X)$ is both a Banach space and has a multiplication (composition) and a unit ($I$), making it a **Banach algebra**. This is the stage for spectral theory.

---

## 3. The Dual Space $X^*$

### Definition

$$
X^* = \mathcal{B}(X, \mathbb{K}) = \{f: X \to \mathbb{K} \mid f\text{ linear and bounded}\}.
$$

An element $f \in X^*$ is called a **bounded linear functional** on $X$.

By the §2 conclusion, $X^*$ is **always** a Banach space, regardless of whether $X$ is.

Norm:

$$
\|f\|_{X^*} = \sup_{\|x\| \le 1} |f(x)|.
$$

### Classical Dual Pairings

| $X$ | $X^*$ | Pairing |
|-----|-------|---------|
| $\mathbb{R}^n$ | $\mathbb{R}^n$ | $f(x) = \sum f_i x_i$ |
| $\ell^p,\ 1 \le p \lt \infty$ | $\ell^q,\ \tfrac{1}{p} + \tfrac{1}{q} = 1$ | $f(x) = \sum f_n x_n$ |
| $L^p[a,b],\ 1 \le p \lt \infty$ | $L^q[a,b]$ | $f(g) = \int fg$ |
| $c_0$ (null sequences) | $\ell^1$ | $f(x) = \sum f_n x_n$ |

Note that the converse $\ell^\infty \ne (\ell^1)^*$ direction fails — $(\ell^\infty)^*$ is strictly larger than $\ell^1$. This is one symptom of the $p = \infty$ exception.

### The Hahn–Banach Theorem

> **Hahn–Banach**: a bounded linear functional $f_0$ defined on a subspace $M \subseteq X$ can be extended to a bounded linear functional $f$ on $X$ with $\|f\|_{X^*} = \|f_0\|_{M^*}$.

The direct corollary is that $X^*$ is "large enough" — for any $x \ne 0$, $\exists f \in X^*$ with $f(x) \ne 0$. This guarantees the natural embedding $X \hookrightarrow X^{**}$ and makes the weak topology a meaningful notion.

**Reflexive**: $X$ is reflexive if the canonical map $X \hookrightarrow X^{**}$ is surjective.

- $\ell^p\ (1 \lt p \lt \infty)$, $L^p\ (1 \lt p \lt \infty)$, all Hilbert spaces — reflexive;
- $\ell^1$, $\ell^\infty$, $L^1$, $L^\infty$ — not reflexive.

Reflexivity is what underwrites the next-chapter slogan "bounded ⇒ weakly precompact" (Banach–Alaoglu + reflexivity ⇒ weakly sequentially precompact).

---

## 4. The Riesz Representation Theorem

At the Hilbert-space level, **$H$ and $H^*$ are not just isomorphic — they are isometrically isomorphic**.

**Claim (Riesz representation)**: let $H$ be a Hilbert space; then

$$
\forall f \in H^*,\ \exists!\,y_f \in H,\ \forall x \in H,\ f(x) = \langle x, y_f \rangle.
$$

Furthermore $\|f\|_{H^*} = \|y_f\|_H$.

That is, every bounded linear functional on a Hilbert space is "the inner product with some fixed vector," and **there is no other form**.

{{< details summary="Proof: Riesz representation (via orthogonal decomposition)" >}}

If $f = 0$, take $y_f = 0$.

Otherwise let $N = \ker f = \{x : f(x) = 0\}$. $f$ continuous ⇒ $N$ is a closed subspace of $H$. Also $f \ne 0$ ⇒ $N \subsetneq H$.

By the orthogonal decomposition theorem (Part 3 §4), $N^\perp \ne \{0\}$. Pick $z \in N^\perp$ with $\|z\| = 1$.

**Key construction**: for any $x \in H$, let

$$
u = f(x)z - f(z)x.
$$

Compute $f(u) = f(x)f(z) - f(z)f(x) = 0$, so $u \in N$. Also $z \in N^\perp$, so

$$
\langle u, z \rangle = 0\ \Rightarrow\ \langle f(x)z - f(z)x, z \rangle = 0\ \Rightarrow\ f(x)\langle z, z \rangle = f(z)\langle x, z \rangle.
$$

Since $\|z\| = 1$,

$$
f(x) = f(z)\langle x, z \rangle = \langle x, \overline{f(z)} z \rangle.
$$

(The complex case requires conjugating the scalar when moving it into the second argument of the inner product; in the real case $\overline{f(z)} = f(z)$.)

Take $y_f = \overline{f(z)} z$ to obtain $f(x) = \langle x, y_f \rangle$.

**Uniqueness**: if another $y'_f$ also works, $\langle x, y_f - y'_f \rangle = 0$ for all $x$; taking $x = y_f - y'_f$ gives $\|y_f - y'_f\| = 0$.

**Isometry**:

$$
\|f\| = \sup_{\|x\| \le 1} |\langle x, y_f \rangle| \le \|y_f\|\quad (\text{Cauchy–Schwarz}),
$$

and the upper bound is attained by $x = y_f / \|y_f\|$, so $\|f\| = \|y_f\|$.

{{< /details >}}

Direct corollaries:

1. **$H$ is reflexive**: $H \cong H^* \cong H^{**}$ are all isometrically isomorphic;
2. **Weak convergence has a clean form on $H$**:

$$
x_n \rightharpoonup x\ \iff\ \forall y \in H,\ \langle x_n, y \rangle \to \langle x, y \rangle.
$$

3. **Every linear equation on a Hilbert space can be read as an inner-product equation** — the basis for defining the adjoint operator in §5.

---

## 5. Spectrum, Adjoint, and Self-Adjoint Operators

Below $H$ is a Hilbert space and $T \in \mathcal{B}(H)$.

### The Adjoint $T^*$

By Riesz, for any fixed $y \in H$, the map $x \mapsto \langle Tx, y \rangle$ is a bounded linear functional on $H$, so $\exists!\,T^* y \in H$ with

$$
\langle Tx, y \rangle = \langle x, T^* y \rangle,\quad \forall x, y \in H.
$$

It is easy to verify $T^* \in \mathcal{B}(H)$ and $\|T^*\|_{\text{op}} = \|T\|_{\text{op}}$.

**Self-adjoint**: $T = T^*$. This is the operator analogue of a "symmetric matrix" in finite dimensions.

### Spectrum and Resolvent Set

**Spectrum**:

$$
\sigma(T) = \{\lambda \in \mathbb{C} : T - \lambda I\text{ is not invertible in }\mathcal{B}(H)\}.
$$

**Resolvent set**: $\rho(T) = \mathbb{C} \setminus \sigma(T)$; for $\lambda \in \rho(T)$, $R(\lambda; T) = (T - \lambda I)^{-1}$ is the **resolvent**.

The spectrum splits into three pieces:

| Class | Name | Description |
|-------|------|-------------|
| $\sigma_p(T)$ | Point spectrum | $\lambda$ is an eigenvalue: $\exists x \ne 0,\ Tx = \lambda x$ |
| $\sigma_c(T)$ | Continuous spectrum | $T - \lambda I$ is injective with dense range but not surjective |
| $\sigma_r(T)$ | Residual spectrum | $T - \lambda I$ is injective but range is not dense |

For finite-dimensional $T$, $\sigma(T) = \sigma_p(T)$ is exactly the set of eigenvalues; in infinite dimensions, the trichotomy must be respected.

### Basic Structure of the Spectrum

- **Spectrum is nonempty and compact** (over complex Banach space): $\sigma(T)$ is a nonempty compact subset of $\mathbb{C}$;
- **Spectral radius**: $r(T) = \sup\{|\lambda| : \lambda \in \sigma(T)\} = \lim_n \|T^n\|^{1/n} \le \|T\|_{\text{op}}$.

### Key Properties of Self-Adjoint Operators

**Property A: eigenvalues are real.**

{{< details summary="Proof: eigenvalues of a self-adjoint operator are real" >}}

Let $Tx = \lambda x$ with $x \ne 0$. By self-adjointness,

$$
\lambda \|x\|^2 = \langle Tx, x \rangle = \langle x, Tx \rangle = \overline{\langle Tx, x \rangle} = \overline{\lambda}\|x\|^2.
$$

So $\lambda = \overline{\lambda}$, i.e. $\lambda \in \mathbb{R}$.

{{< /details >}}

**Property B: eigenvectors of distinct eigenvalues are orthogonal.**

{{< details summary="Proof: distinct eigenvalues ⇒ orthogonal eigenvectors" >}}

Suppose $Tx_1 = \lambda_1 x_1$, $Tx_2 = \lambda_2 x_2$, $\lambda_1 \ne \lambda_2$, both real.

$$
\lambda_1 \langle x_1, x_2 \rangle = \langle Tx_1, x_2 \rangle = \langle x_1, Tx_2 \rangle = \lambda_2 \langle x_1, x_2 \rangle.
$$

So $(\lambda_1 - \lambda_2)\langle x_1, x_2 \rangle = 0$. Since $\lambda_1 \ne \lambda_2$, $\langle x_1, x_2 \rangle = 0$.

{{< /details >}}

**Property C**: $\sigma(T) \subseteq \mathbb{R}$, and $\|T\|_{\text{op}} = \sup_{\|x\| = 1} |\langle Tx, x \rangle|$.

These transfer "spectra of symmetric matrices lie on the real line; spectral radius is the numerical range" from finite to infinite dimensions verbatim.

---

## 6. Compact Operators and the Spectral Theorem

The spectrum of a self-adjoint operator can be complex (continuous spectrum etc.); to get "diagonalization" we need one more structural condition — **compactness**.

### Compact Operators

$K: X \to Y$ is a **compact operator** if $K$ maps bounded sets of $X$ to relatively compact sets of $Y$. Equivalently:

$$
\forall \text{ bounded }(x_n) \subseteq X,\ (Kx_n)\text{ has a convergent subsequence}.
$$

> This is the gap left over from Part 2's Bolzano–Weierstrass: the $\ell^2$ unit ball is closed and bounded but not sequentially compact — but **once mapped through a compact operator, it becomes sequentially precompact again**.

### Properties of Compact Operators

- **Finite-rank operators** (with finite-dimensional image) are compact;
- Compact operators are closed under operator-norm limits: $\mathcal{K}(X, Y)$ is a closed subspace of $\mathcal{B}(X, Y)$;
- Compact ∘ bounded = compact, bounded ∘ compact = compact — compact operators form a **two-sided ideal** of $\mathcal{B}(H)$;
- On an infinite-dimensional space, the identity $I$ is **not** compact (otherwise the unit ball is sequentially precompact, a contradiction).

### Spectral Structure of Compact Operators

**Riesz–Schauder theorem**: let $K \in \mathcal{B}(X)$ be compact; then

1. $\sigma(K) \setminus \{0\}$ consists **only of eigenvalues**;
2. Each nonzero eigenvalue has a **finite-dimensional** eigenspace $\ker(K - \lambda I)$;
3. $\sigma(K)$ is at most countable, and **$0$ is the only possible accumulation point**.

Formally,

$$
\sigma(K) = \{0\} \cup \{\lambda_n\}_{n \ge 1},\qquad |\lambda_1| \ge |\lambda_2| \ge \cdots,\quad \lambda_n \to 0\ (\text{or only finitely many}).
$$

In infinite dimensions, $0 \in \sigma(K)$ always (otherwise $K$ is invertible, so $I = K K^{-1}$ would be compact — contradiction).

### Spectral Theorem (Compact Self-Adjoint Case)

Combining "compact" and "self-adjoint" yields diagonalization in infinite-dimensional Hilbert space.

**Spectral theorem**: let $K \in \mathcal{B}(H)$ be compact and self-adjoint. Then there exists an orthonormal basis $\{e_n\}$ of $H$ consisting of eigenvectors of $K$ with eigenvalues $\lambda_n \in \mathbb{R}$, $\lambda_n \to 0$, such that

$$
Kx = \sum_n \lambda_n \langle x, e_n \rangle e_n,\quad \forall x \in H.
$$

Equivalently,

$$
K = \sum_n \lambda_n P_n,
$$

where $P_n$ is the orthogonal projection onto $\ker(K - \lambda_n I)$.

This is the complete infinite-dimensional analogue of the finite-dimensional "symmetric matrices are orthogonally diagonalizable, $A = U \Lambda U^\top$." **Completeness + compactness** team up to diagonalize a countably infinite spectrum, with the series converging in the $H$-norm.

### SVD Corollary (General Compact Operators)

Applying the spectral theorem to $K^* K$ (which is self-adjoint, positive semi-definite, compact) yields the **singular value decomposition** of $K$ itself:

$$
K = \sum_n \sigma_n \langle \cdot, v_n \rangle u_n,\qquad \sigma_1 \ge \sigma_2 \ge \cdots \ge 0,\ \sigma_n \to 0.
$$

$\{v_n\}, \{u_n\}$ are the eigenbases of $K^* K$ and $K K^*$ respectively. This is the infinite-dimensional prototype of finite-dimensional SVD.

---

## 7. Ill-Posedness of Inverse Problems and the Spectral View of Regularization

With all the tools in hand, we put them in front of inverse problems and **"ill-posedness" and "regularization" turn into pure algebraic facts** — this is the moment Parts 2 and 3 have been quietly setting up.

### Inverse Problems and Compact Operators

A typical inverse problem: given $y$, solve

$$
Kx = y,
$$

where $K: H_1 \to H_2$ is a compact operator (the forward map of geophysical inversion, the Radon transform in CT, the solution operator of elliptic PDEs — all compact).

**The essence of ill-posedness**:

- $K$ compact and infinite-dimensional ⇒ $K^{-1}$ (if it exists) is **unbounded**;
- That is, an arbitrarily small perturbation of $y$ can make $x$ arbitrarily large;
- Noise in the data is directly amplified into a blow-up of the solution.

### SVD View

Write the SVD of $K$:

$$
K = \sum_n \sigma_n \langle \cdot, v_n \rangle u_n.
$$

The formal "pseudoinverse" solution (Moore–Penrose) is

$$
x^\dagger = K^\dagger y = \sum_n \frac{1}{\sigma_n} \langle y, u_n \rangle v_n.
$$

**Key observation**: $\sigma_n \to 0$, so $1/\sigma_n \to \infty$. If $y$ has a tiny noise $\eta_n$ in the $u_n$ direction, this propagates to $x^\dagger$ as $\eta_n / \sigma_n$ — **noise in small-singular-value directions is amplified to an explosion**.

> In the language of §6: **ill-posed inverse problem ⟺ $\sigma_n \to 0$ ⟺ $0 \in \sigma(K)$ is an accumulation point ⟺ $K^{-1}$ is unbounded.** This is the pure spectral description of "ill-posed."

### Truncated SVD (TSVD)

**The most direct regularization**: keep only directions whose $\sigma_n$ exceeds a threshold $\tau$:

$$
x_\tau = \sum_{\sigma_n \gt \tau} \frac{1}{\sigma_n} \langle y, u_n \rangle v_n.
$$

Small-singular-value directions are **simply discarded**, preventing noise amplification. The cost is losing signal along $\sigma_n \le \tau$ directions.

### Tikhonov Regularization

A smoother choice: replace $1/\sigma_n$ in $K^\dagger$ with a **filter** $\sigma_n / (\sigma_n^2 + \alpha)$:

$$
x_\alpha = \sum_n \frac{\sigma_n}{\sigma_n^2 + \alpha} \langle y, u_n \rangle v_n.
$$

Equivalently in operator form:

$$
x_\alpha = (K^* K + \alpha I)^{-1} K^* y.
$$

**Filter analysis**:

| Direction | $\sigma_n$ large (signal direction) | $\sigma_n$ small (noise direction) |
|-----------|-------------------------------------|------------------------------------|
| Behavior of $\dfrac{\sigma_n}{\sigma_n^2 + \alpha}$ | $\approx 1/\sigma_n$ (preserved) | $\approx \sigma_n/\alpha \to 0$ (suppressed) |

So Tikhonov's role on the spectrum is: **transparent at large $\sigma_n$ (preserve signal), softly cut off at small $\sigma_n$ (suppress noise amplification)**.

Visually:

$$
\text{Tikhonov is the "soft" version of TSVD}.
$$

TSVD is a hard cutoff (indicator function); Tikhonov is a soft cutoff (smooth filter). As $\alpha \to 0$ it degenerates to the pseudoinverse; as $\alpha \to \infty$ to the zero solution. Pick something in between to balance "signal preservation + noise suppression."

### Connection to Earlier Work

Placing this section alongside earlier notes:

- [Linear Algebra Parts 0–2](https://r1skers.github.io/en/notes/笔记-线性代数2-正则化与稳定反演/) — the full "singular matrix → SVD → regularization" arc;
- [Computational Science Parts 8–10](https://r1skers.github.io/en/notes/笔记-计算科学与高可靠系统设计8-正则化、先验与稳定反演/) — Tikhonov + priors + smoothness numerics.

**Those are all special cases of the spectral theorem + filter analysis here.** The linear algebra version uses finite-dimensional matrix SVD; §6–§7 here is its parent in infinite-dimensional Hilbert space. The translation from engineering intuition ("small singular values amplify noise; we should push back") to a pure spectral fact ("$0$ is an accumulation point of a compact operator's spectrum, and the filter $\sigma / (\sigma^2 + \alpha)$ drives down to zero near it") is what this note completes.

---

## Summary: Three Main Threads

This note turned around three things:

1. **Operators are the central object of functional analysis**: $\mathcal{B}(X, Y)$, the dual $X^*$, the adjoint $T^*$, the spectrum $\sigma(T)$ — treating "the mapping itself" as an object of study, with completeness + norm + inner product making "operators are elements of a space too" stand up.
2. **Riesz + self-adjoint + compactness = infinite-dimensional diagonalization**: no single condition suffices; only all three together yield the spectral theorem. Riesz makes $T^*$ well-defined, self-adjointness makes the spectrum real, compactness reduces the spectrum to a sequence of eigenvalues — step by step pulling infinite dimensions back to a state that "looks finite-dimensional."
3. **Ill-posedness of inverse problems = a fact about the spectrum**: that $0$ is an accumulation point of $\sigma(K)$ is the essence of ill-posedness; Tikhonov is a spectral filter; every engineering variant of regularization is just a different filter function $\varphi(\sigma)$ replacing $1/\sigma$.

**Connection to the next stop**: the natural next door in functional analysis is **weak convergence and Banach–Alaoglu**. It resolves a tension left in this note — the $\ell^2$ unit ball is closed and bounded but not sequentially compact — by relaxing "convergence" to "convergence in the dual pairing," recovering compactness. This is the language base for the existence proofs in Sobolev spaces and the calculus of variations.
