---
date: '2026-06-09T10:00:00+09:00'
draft: false
title: 'Real Analysis Part 5: Weak Convergence, Hahn–Banach, and the Banach Fixed-Point Theorem'
summary: "Continuing Part 4's dual-space toolkit. First use the e_n ⇀ 0 counterexample in Hilbert space to pin down the true gap between strong and weak convergence; then use Banach–Alaoglu to half-recover BW in infinite dimensions. From Hahn–Banach pull out three corollaries — norm-preserving extension, dual characterization of the norm, separation of convex sets — the wrench by which functional analysis 'looks at' abstract spaces. Finally use the Banach fixed-point theorem to ground all of this in numerical methods: completeness is the lifeline of fixed-point existence, the geometric convergence rate hangs directly on the contraction constant k, which closes a loop with the condition number κ."
description: "An advanced functional-analysis note on strong vs. weak convergence, the inner-product form of weak convergence on Hilbert space, weak lower semicontinuity, Banach–Alaoglu and weak sequential compactness, the Hahn–Banach extension theorem and its three corollaries (norm-preserving extension, dual characterization of the norm, separation of convex sets), the Banach fixed-point theorem, contraction mappings, the role of completeness in the fixed-point proof, and the link between geometric convergence rate and the condition number."
tags: ["Functional Analysis", "Weak Convergence", "Strong Convergence", "Banach-Alaoglu", "Weak Compactness", "Hahn-Banach", "Banach Fixed Point", "Contraction Mapping", "Convergence Rate", "Condition Number", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/real-analysis-5-weak-convergence-hahn-banach-fixed-point/
  - /notes/functional-analysis-3-weak-convergence-hahn-banach-fixed-point/
---

# Real Analysis Part 5: Weak Convergence, Hahn–Banach, and the Banach Fixed-Point Theorem

> Real Analysis Part 5 = Functional Analysis Part 3. Part 4 set the stage (operators → dual → spectrum); this note puts the dual-space weapon to work — **weak convergence** half-restores Bolzano–Weierstrass in infinite dimensions, **Hahn–Banach** lets us "see" the original space from its dual, and the **Banach fixed-point theorem** brings the whole abstract toolkit back down onto the geometric convergence of numerical methods.

The chain:

$$
\text{strong convergence} \to \text{weak convergence} \to \text{weak lower semicontinuity} \to \text{Banach–Alaoglu / weak sequential compactness} \to \text{Hahn–Banach and three corollaries} \to \text{Banach fixed point} \to \text{convergence rate} \leftrightarrow \text{condition number}
$$

A few main threads:

- **Strong $\Rightarrow$ weak; not conversely**. The cleanest counterexample: $e_n \rightharpoonup 0$ in $\ell^2$ but $\|e_n\| = 1$, never strongly convergent.
- **The weak topology saves BW**: the closed ball of a reflexive space (Hilbert in particular) is **weakly sequentially compact** — Banach–Alaoglu. This is the engine of existence proofs in the calculus of variations.
- **Hahn–Banach** is the wrench that functional analysis uses to "see" a space clearly. It has three faces: norm-preserving extension, the dual characterization $\|x\| = \sup_{\|f\|\le 1}|f(x)|$, and geometric separation of convex sets.
- **Banach fixed point**: complete + contraction = unique fixed point + geometric convergence $d(x_n, x^\star) \le \tfrac{k^n}{1-k}\,d(x_0, x_1)$. **Completeness is the lifeline**.
- **Convergence rate $\leftrightarrow$ condition number**: the contraction constant $k$ is controlled by the spectral radius $\rho(I - M^{-1}A)$, and $\rho$ is in turn pinned by the condition number $\kappa(A)$. Tikhonov lifts $\sigma_{\min}$ → lowers $\kappa$ → tightens $k$ → speeds up iteration.

---

## 1. Strong vs. Weak Convergence

### Definition

Let $X$ be a normed space and $X^*$ its dual.

**Strong convergence**:

$$
x_n \to x\ \iff\ \|x_n - x\|_X \to 0.
$$

**Weak convergence**:

$$
x_n \rightharpoonup x\ \iff\ \forall f \in X^*,\ f(x_n) \to f(x).
$$

The symbol $\rightharpoonup$ distinguishes weak convergence from the strong arrow $\to$.

**Reading**: strong convergence asks that "$x_n$ approaches $x$ in overall length"; weak convergence only asks that "every continuous linear measurement of $x_n$ approaches that of $x$."

> Think of each $f$ as "a measuring instrument" — weak convergence says **every instrument's reading converges**, but the object itself may still be "wobbling" in some way no single instrument can capture.

### Strong $\Rightarrow$ Weak

**Claim**:

$$
x_n \to x\ \Rightarrow\ x_n \rightharpoonup x.
$$

{{< details summary="Proof: strong ⇒ weak (one line)" >}}

Take any $f \in X^*$. By boundedness (continuity) of $f$,

$$
|f(x_n) - f(x)| = |f(x_n - x)| \le \|f\|_{X^*}\,\|x_n - x\|_X \to 0.
$$

So $f(x_n) \to f(x)$.

{{< /details >}}

### Counterexample: the Standard Basis in $\ell^2$

**Counterexample**: $X = \ell^2$, $e_n = (0, \ldots, 0, 1, 0, \ldots)$ (the $1$ in position $n$).

**Claim**: $e_n \rightharpoonup 0$, but $\|e_n\| = 1$, so $(e_n)$ does not converge strongly.

{{< details summary="Proof: e_n ⇀ 0 but ‖e_n‖ = 1" >}}

By the Riesz representation theorem (Part 4 §4), every bounded linear functional on $\ell^2$ is of the form $f(x) = \langle x, y \rangle = \sum_k x_k \overline{y_k}$ for some $y \in \ell^2$.

So

$$
f(e_n) = \langle e_n, y \rangle = \overline{y_n}.
$$

Since $y \in \ell^2$, $\sum_k |y_k|^2 \lt \infty$, so $y_n \to 0$, hence $f(e_n) \to 0 = f(0)$.

This holds for every $f$, so $e_n \rightharpoonup 0$.

On the other hand $\|e_n\| = 1$ does not depend on $n$, so $\|e_n - 0\| = 1 \not\to 0$ — no strong convergence.

{{< /details >}}

This is the cleanest counterexample in infinite-dimensional analysis. It says **a sequence on the unit sphere can "rotate" infinitely many times, decaying to zero along every coordinate direction while its total energy stays at 1** — a kind of pure infinite-dimensional oscillation.

### Uniqueness of the Weak Limit

Weak limits are unique: if $x_n \rightharpoonup x$ and $x_n \rightharpoonup x'$, then $x = x'$.

{{< details summary="Proof: uniqueness of weak limits" >}}

$\forall f \in X^*$, $f(x) = \lim f(x_n) = f(x')$, so $f(x - x') = 0$.

By the Hahn–Banach corollary (§4 Corollary 1), if $x - x' \ne 0$, there is some $f$ with $f(x - x') = \|x - x'\| \ne 0$, a contradiction. Hence $x = x'$.

{{< /details >}}

Note that this **already uses Hahn–Banach** — in infinite dimensions, "there are enough functionals to separate points" is not free.

---

## 2. Weak Convergence on Hilbert Space

By Riesz, weak convergence on a Hilbert space has a completely clean inner-product form.

**Claim (weak convergence on $H$)**: let $H$ be a Hilbert space; then

$$
x_n \rightharpoonup x\ \iff\ \forall y \in H,\ \langle x_n, y \rangle \to \langle x, y \rangle.
$$

This rewrites "for every $f \in H^*$" as "for every $y \in H$," much easier to understand and verify.

### Weak Lower Semicontinuity of the Norm

**Claim (weak lower semicontinuity)**:

$$
x_n \rightharpoonup x\ \Rightarrow\ \|x\| \le \liminf_n \|x_n\|.
$$

The inequality is **one-sided** — the norm of the weak limit can be **strictly smaller** than the limit of the sequence norms. $e_n \rightharpoonup 0$ is the textbook example: $\|0\| = 0 \lt 1 = \liminf \|e_n\|$.

{{< details summary="Proof: weak lower semicontinuity" >}}

By Hahn–Banach (§4 Corollary 1), there exists $f \in X^*$ with $\|f\| = 1$ and $f(x) = \|x\|$.

By weak convergence, $f(x_n) \to f(x) = \|x\|$.

Also $|f(x_n)| \le \|f\|\|x_n\| = \|x_n\|$.

Taking $\liminf$:

$$
\|x\| = \lim_n f(x_n) = \liminf_n f(x_n) \le \liminf_n |f(x_n)| \le \liminf_n \|x_n\|.
$$

{{< /details >}}

**How this property is used**: in a variational problem one takes a minimizing sequence $\|x_n\| \to \inf$; if $x_n \rightharpoonup x^\star$, then $\|x^\star\| \le \liminf \|x_n\| = \inf$, so **the weak limit automatically attains the infimum**. This is one of the engines of existence proofs in the calculus of variations.

---

## 3. Banach–Alaoglu and Weak Sequential Compactness

Part 2 gave Bolzano–Weierstrass on $\mathbb{R}^n$: "closed + bounded $\Rightarrow$ sequentially compact." Part 3 pointed out that in $\ell^2$ this **fails** in the strong sense — the closed unit ball is not sequentially compact. Part 5 now **partially recovers** it in the weak sense.

### The Banach–Alaoglu Theorem

**Claim (Banach–Alaoglu)**: let $X$ be a normed space; then the closed unit ball

$$
B_{X^*} = \{f \in X^* : \|f\| \le 1\}
$$

is **compact** in the **weak-* topology**.

The proof uses Tychonoff (compactness of infinite products) and is technically involved; we skip the details.

**Intuition**: view each $f \in B_{X^*}$ as a function $X \ni x \mapsto f(x) \in [-\|x\|, \|x\|]$. At each $x$, $f(x)$ is trapped in a compact interval — so $B_{X^*}$ sits inside the product space $\prod_x [-\|x\|, \|x\|]$, which Tychonoff says is compact; hence $B_{X^*}$ is compact too.

### Weak Sequential Compactness on Reflexive Spaces

**Corollary**: if $X$ is reflexive ($X \cong X^{**}$ via the canonical embedding), then bounded sets in $X$ are **weakly sequentially compact**:

$$
(x_n) \text{ bounded}\ \Rightarrow\ \exists \text{ subsequence } (x_{n_k}),\ x \in X,\ x_{n_k} \rightharpoonup x.
$$

In particular, **every Hilbert space** (reflexive) has bounded sequences with weakly convergent subsequences.

### Contrast with BW

| Space | Convergence | "Closed + bounded ⇒ seq. compact" |
|------|----------|------|
| $\mathbb{R}^n$ | strong | ✅ (BW) |
| Infinite-dim Hilbert | strong | ❌ ($e_n$ counterexample) |
| Infinite-dim reflexive Banach | **weak** | ✅ (Banach–Alaoglu) |

**This is the key trade-off of infinite-dimensional analysis**: weaken the strength of "convergence" (strong → weak) to win back compactness. Every existence proof in the calculus of variations, weak solutions of PDEs, and optimal control is, at heart, this trade-off in action.

### Weak Convergence + Weak l.s.c. = Existence Engine

A typical use (minimization problem):

1. Take a minimizing sequence $\|x_n\| \to d = \inf$;
2. $(x_n)$ is bounded;
3. Banach–Alaoglu $\Rightarrow$ there is a weakly convergent subsequence $x_{n_k} \rightharpoonup x^\star$;
4. Weak l.s.c. $\Rightarrow \|x^\star\| \le \liminf \|x_{n_k}\| = d$;
5. Also $\|x^\star\| \ge d$ ($d$ is the infimum), so $\|x^\star\| = d$ and **the minimum is attained**.

The whole argument only uses "boundedness + weak topology," with **no strong convergence**. This is the lightweight cousin of Part 4 §4's existence proof for orthogonal decomposition.

---

## 4. Hahn–Banach and Three Corollaries

Part 4 mentioned Hahn–Banach in passing; here is what it actually does.

### Analytic Form (Norm-Preserving Extension)

**Hahn–Banach (analytic form)**: let $X$ be a normed space, $M \subseteq X$ a subspace, $f_0: M \to \mathbb{K}$ a bounded linear functional on $M$. Then **there exists** $f \in X^*$ with:

1. $f|_M = f_0$ (extension);
2. $\|f\|_{X^*} = \|f_0\|_{M^*}$ (norm-preserving).

The proof uses Zorn's lemma (infinite-dimensional case needs the axiom of choice); we skip the details.

**The core**: a "local" functional on a subspace can be extended to a "global" functional on the whole space **without increasing its norm**.

### Corollary 1: Enough Functionals to Separate Points

**Claim**: $\forall x_0 \in X,\ x_0 \ne 0$, $\exists f \in X^*$ with

$$
f(x_0) = \|x_0\|,\quad \|f\|_{X^*} = 1.
$$

{{< details summary="Proof: Corollary 1 (existence of a norm-attaining functional)" >}}

On the one-dimensional subspace $M = \text{span}\{x_0\}$, define

$$
f_0(\alpha x_0) = \alpha\|x_0\|.
$$

It is linear, with $\|f_0\|_{M^*} = 1$ (attained at $\alpha = 1/\|x_0\|$).

By Hahn–Banach, there exists $f \in X^*$ extending $f_0$ with $\|f\|_{X^*} = 1$. In particular $f(x_0) = f_0(x_0) = \|x_0\|$.

{{< /details >}}

**Key point**: $X^*$ is always "big enough" — for any nonzero vector there is a functional that "measures" it. This is the missing piece in §1's proof of uniqueness of weak limits.

### Corollary 2: Dual Characterization of the Norm

**Claim**:

$$
\forall x \in X,\quad \|x\| = \sup_{\substack{f \in X^* \\ \|f\| \le 1}} |f(x)|.
$$

{{< details summary="Proof: Corollary 2 (dual characterization of the norm)" >}}

**$\le$ direction**: $\forall \|f\| \le 1$, $|f(x)| \le \|f\|\|x\| \le \|x\|$, so the sup is $\le \|x\|$.

**$\ge$ direction**: by Corollary 1, there is $f$ with $\|f\| = 1, f(x) = \|x\|$, so the sup is $\ge \|x\|$.

{{< /details >}}

**This translates the norm into a dual pairing**. In many situations (weak l.s.c. proofs, comparing dual norms, variational inequalities) it is more useful than computing the norm directly.

### Corollary 3: Separation of Convex Sets (Geometric Form)

**Claim (geometric Hahn–Banach)**: let $X$ be a normed space, $C \subseteq X$ a closed convex set, $a \in X \setminus C$. Then **there exist** $f \in X^*$ and $\gamma \in \mathbb{R}$ with

$$
f(a) \gt \gamma\quad\text{and}\quad \forall c \in C,\ f(c) \le \gamma.
$$

In other words, **a closed convex set and an exterior point can be separated by a closed hyperplane**.

This is the geometric foundation of convex analysis, optimization (KKT, dual problems), and game theory. It surfaces again and again in variational inequalities and monotone operator theory.

### Three Corollaries at a Glance

| Corollary | Form | Use |
|------|------|------|
| 1. Norm-preserving extension | $\exists f,\ \Vert f\Vert=1,\ f(x_0)=\Vert x_0\Vert$ | Enough functionals to separate points |
| 2. Dual characterization | $\Vert x\Vert = \sup_{\Vert f\Vert\le 1}\vert f(x)\vert$ | Norm rewritten as a dual pairing |
| 3. Convex separation | Closed convex set vs. outside point by a hyperplane | Geometric foundation of convex analysis / optimization |

Together, Hahn–Banach is **the wrench for "viewing the original space from its dual"** in functional analysis. The geometry of infinite-dimensional spaces often becomes visible only through the "probes" supplied by $X^*$.

---

## 5. The Banach Fixed-Point Theorem

Now we land the abstract tools on numerical methods.

### Contraction Mapping

Let $(X, d)$ be a metric space and $T: X \to X$.

**$T$ is a contraction mapping** if $\exists k \in [0, 1)$ with

$$
\forall x, y \in X,\ d(Tx, Ty) \le k\,d(x, y).
$$

$k$ is the **contraction constant**.

**Critical**: $k \lt 1$. The "$k = 1$" case (non-expansive) may fail to have a unique fixed point — or any fixed point at all.

### Banach Fixed-Point Theorem

**Claim (Banach Fixed-Point Theorem)**: let $(X, d)$ be a **complete** metric space and $T: X \to X$ a contraction. Then

1. **Unique fixed point**: $\exists!\, x^\star \in X,\ Tx^\star = x^\star$;
2. **Iterates converge**: $\forall x_0 \in X$, the sequence $x_n = Tx_{n-1}$ satisfies $x_n \to x^\star$ (strongly);
3. **Geometric rate estimate**:

$$
d(x_n, x^\star) \le \frac{k^n}{1 - k}\,d(x_0, x_1).
$$

{{< details summary="Proof: Banach fixed-point theorem" >}}

**Step 1: $(x_n)$ is a Cauchy sequence.**

By contraction,

$$
d(x_{n+1}, x_n) = d(T x_n, T x_{n-1}) \le k\,d(x_n, x_{n-1}) \le \cdots \le k^n\,d(x_1, x_0).
$$

For $m \gt n$, telescoping via the triangle inequality:

$$
d(x_m, x_n) \le \sum_{j=n}^{m-1} d(x_{j+1}, x_j) \le \sum_{j=n}^{m-1} k^j\,d(x_1, x_0) \le \frac{k^n}{1-k}\,d(x_1, x_0).
$$

The right side $\to 0$ (since $k\lt 1$), so $(x_n)$ is Cauchy.

**Step 2: completeness provides the limit.**

$X$ complete $\Rightarrow x_n \to x^\star \in X$.

**Step 3: $x^\star$ is a fixed point.**

A contraction is Lipschitz, hence continuous. Taking $n \to \infty$ in $x_{n+1} = T x_n$:

$$
x^\star = \lim x_{n+1} = \lim T x_n = T(\lim x_n) = T x^\star.
$$

**Step 4: uniqueness.**

Suppose $x^\star, y^\star$ are both fixed points; then

$$
d(x^\star, y^\star) = d(T x^\star, T y^\star) \le k\,d(x^\star, y^\star).
$$

Since $k \lt 1$, the only possibility is $d(x^\star, y^\star) = 0$, i.e. $x^\star = y^\star$.

**Step 5: rate estimate.**

From the Step 1 derivation, for any $m \gt n$:

$$
d(x_m, x_n) \le \frac{k^n}{1-k}\,d(x_0, x_1).
$$

Letting $m \to \infty$ gives $d(x_n, x^\star) \le \tfrac{k^n}{1-k}\,d(x_0, x_1)$.

{{< /details >}}

### The Role of Completeness

**Completeness appears in Step 2** — having built a Cauchy sequence, we need it to converge inside $X$. **Without completeness, the fixed point may fail to exist.**

**Classical counterexample**: take $X = \mathbb{Q}$ and $T(x) = \cos(x)$ (or any contraction on $\mathbb{R}$ whose fixed point is irrational). $T$ is a contraction on $\mathbb{Q}$, but the fixed point $x^\star \approx 0.7391\ldots$ is irrational, so **$x^\star \notin \mathbb{Q}$** — the Banach iteration on $\mathbb{Q}$ converges to a point that has fallen out of the space.

> This concretely cashes in Part 2's mantra: **"completeness = invite all the absent Cauchy limits back home." Without it, the Banach iteration iterates right out of the house.**

### Geometric Convergence Rate

$$
d(x_n, x^\star) \le C\,k^n.
$$

**Geometric convergence** — each step shrinks the error by a factor of $(1-k)$. The smaller $k$, the faster. As $k \to 1^-$, convergence drags to a halt.

This is the unified language of "iterative-method convergence rate" in numerical methods: Jacobi, Gauss–Seidel, SOR, fixed-point iterations, Picard iteration — all are instances of Banach fixed point, with $k$ corresponding to the **spectral radius of the iteration matrix**.

---

## 6. Convergence Rate $\leftrightarrow$ Condition Number

The "condition number $\kappa$ controls convergence rate" mantra in numerical linear algebra and iterative methods reads off directly from Banach fixed point.

### From Linear Equation to Fixed Point

To solve $Ax = b$, where $A$ is a bounded operator (a matrix in finite dimensions). Picard / Richardson / first-order iteration:

$$
x_{n+1} = x_n - \alpha\,(A x_n - b) = (I - \alpha A) x_n + \alpha b.
$$

Write $x_{n+1} = T(x_n)$ with

$$
T(x) = M x + \alpha b,\qquad M = I - \alpha A.
$$

This is an affine map, **a contraction $\iff \|M\| \lt 1$**.

### Contraction Constant = Spectral Radius

For self-adjoint positive definite $A$ (eigenvalues $0 \lt \lambda_{\min} \le \cdots \le \lambda_{\max}$):

- $M = I - \alpha A$ has eigenvalues $1 - \alpha \lambda_i$;
- The optimal $\alpha = \dfrac{2}{\lambda_{\min} + \lambda_{\max}}$;
- At this $\alpha$, $\|M\|_{\text{op}} = \rho(M) = \dfrac{\lambda_{\max} - \lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \dfrac{\kappa(A) - 1}{\kappa(A) + 1}$;
- where $\kappa(A) = \dfrac{\lambda_{\max}}{\lambda_{\min}}$ is the condition number.

Plugging back into Banach's rate:

$$
\|x_n - x^\star\| \le \left(\frac{\kappa - 1}{\kappa + 1}\right)^n \cdot \|x_0 - x^\star\|.
$$

### Condition Number → Convergence Rate

| $\kappa(A)$ | $k = \tfrac{\kappa - 1}{\kappa + 1}$ | Error reduction per step |
|----|----|----|
| $1$ (ideal) | $0$ | One-step convergence |
| $10$ | $\approx 0.82$ | 18% per step |
| $100$ | $\approx 0.98$ | 2% per step |
| $10^6$ (ill-conditioned) | $\approx 1 - 2\times 10^{-6}$ | Essentially frozen |

**Large $\kappa$ $\Rightarrow k$ close to $1$ $\Rightarrow$ Banach iteration drags to a stop.** This is the textbook "ill-conditioned $\Rightarrow$ iteration does not converge."

### Closing the Loop with Part 4's Inverse Problem

Recall the Tikhonov regularization from Part 4 §7:

$$
A_\alpha = A^*A + \alpha I.
$$

Its spectral action: it lifts $A^*A$'s smallest singular value $\sigma_{\min}^2$ up to $\sigma_{\min}^2 + \alpha$. So

$$
\kappa(A_\alpha) = \frac{\sigma_{\max}^2 + \alpha}{\sigma_{\min}^2 + \alpha} \ll \kappa(A^*A) = \frac{\sigma_{\max}^2}{\sigma_{\min}^2}.
$$

**Larger $\alpha$ → smaller $\kappa$ → smaller $k$ → faster geometric convergence.**

```
Tikhonov regularization
  ↓  on the spectrum: σ_min² → σ_min² + α
condition number κ shrinks
  ↓  contraction constant k = (κ-1)/(κ+1) shrinks
Banach iteration speeds up
```

**Part 4's "spectral interpretation of inverse problems" and Part 5's "Banach geometric convergence" close in this section through the condition number.** The same engineering phenomenon ("regularization makes iteration converge faster") has one complete description on two abstract levels.

### Connecting to Applied Work

| Earlier work | Part 5's interpretation |
|---|---|
| [Computational Science Part 5](/en/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent) — gradient-descent step-size tuning | Tuning $\alpha$ to $\dfrac{2}{\lambda_{\min}+\lambda_{\max}}$ is the §6 optimal choice |
| [Computational Science Part 7](/en/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization) — L-BFGS / log-parameterization | Log-parameterization = reshape $A$ in new coordinates to shrink $\kappa$ |
| [Computational Science Part 8](/en/notes/systems/computational-science/note-csys-8-regularization-prior) — Tikhonov + priors | $\alpha$ both stabilizes the solution (Part 4) and accelerates iteration (Part 5) — a double benefit |

---

## Summary: Three Threads

1. **Strong vs. weak: relax convergence to win back compactness**. Strong convergence is the intuitive "length convergence," but in infinite dimensions it is too strict — even the closed unit ball is not sequentially compact. Weak convergence asks only "every dual pairing converges," weakening the characterization to recover the compactness of Banach–Alaoglu, which makes existence proofs in the calculus of variations work.
2. **Hahn–Banach: viewing the original space from its dual**. The three corollaries (norm-preserving extension, dual characterization of the norm, separation of convex sets) are the wrench by which functional analysis "sees" an abstract space clearly. The geometry of infinite-dimensional spaces often becomes visible only through the probes provided by $X^*$.
3. **Banach fixed point: complete + contraction = geometric convergence**. This is the mother theorem of numerical methods. Completeness ensures the Cauchy limit is brought home; the contraction constant $k$ controls the geometric rate; and $k$ in turn closes a loop with Part 4's spectral viewpoint via the condition number $\kappa$ — Tikhonov both stabilizes and accelerates, with both benefits visible on the same spectrum.

**Connection to the next stops**:

- **Sobolev spaces / calculus of variations**: plug the weak sequential compactness of §3 and the weak l.s.c. of §2 into existence proofs for weak solutions of PDEs;
- **Operator semigroups and fixed-point applications**: extend §5 into nonlinear, stochastic, and PDE-flavored fixed-point theory;
- **Geometric analysis / convex analysis**: develop §4 Corollary 3's convex separation into KKT conditions, dual problems, and monotone operator theory.

Whichever direction you take, the three threads of Part 5 are the necessary foundation.
