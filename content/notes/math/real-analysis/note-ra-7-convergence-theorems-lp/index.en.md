---
date: '2026-06-16T20:30:00+09:00'
draft: false
title: 'Real Analysis Part 7: MCT, Fatou, DCT, and L^p Spaces'
summary: "Use the Lebesgue integral built in Part 6 to actually do things. The three convergence theorems settle the 'when can we swap limit and integral' question: MCT escorts via monotonicity, Fatou gives a one-sided inequality, DCT uses a dominating function to block mass escape. With the moving-spike counterexample, the relationship between the three is one glance. Then build L^p spaces: Hölder (the p-generalization of Cauchy–Schwarz), Minkowski (the L^p triangle inequality), Riesz–Fischer (L^p complete ⇒ Banach), L^2 as the unique inner-product-admitting L^p (linking to Part 3 Hilbert), and (L^p)*=L^q (linking to Part 4 duality). Parts 3 through 7 now form one continuous arc."
description: "An advanced real-analysis note on the Lebesgue-integral form of the monotone convergence theorem (MCT), Fatou's lemma, the dominated convergence theorem (DCT), the implications among the three, the moving-spike counterexample and mass escape, the role of the ceiling/dominating function, L^p spaces, a.e. equivalence classes, Hölder's inequality (with Cauchy–Schwarz as the p=2 special case), Minkowski's inequality, the Riesz–Fischer completeness theorem, L^2 as the unique inner-product-admitting L^p, and (L^p)*=L^q duality pairing."
tags: ["Mathematics", "Real Analysis", "Measure Theory"]
categories: ["Notes"]
series: ["Real and Functional Analysis"]
note_kind: "foundation"
aliases:
  - /notes/real-analysis-7-convergence-theorems-lp/
---

# Real Analysis Part 7: MCT, Fatou, DCT, and L^p Spaces

> Part 6 built the Lebesgue integral. Part 7 puts it to work on two fronts: **first nail down the rules for swapping limits with integrals** (the three convergence theorems), **then build $L^p$ spaces**, finally connecting to Hilbert spaces in Part 3 and the dual pairing in Part 4 at the Riesz–Fischer station.

The chain:

$$
\text{MCT}\to\text{Fatou}\to\text{DCT}\to L^p\to\text{Hölder}\to\text{Minkowski}\to\text{Riesz–Fischer}\to (L^p)^*=L^q
$$

A few main threads:

- **Relations among the three convergence theorems**: MCT $\Rightarrow$ Fatou $\Rightarrow$ DCT. MCT is the source, Fatou is the relay, DCT is the everyday workhorse.
- **Mass escape is the counterexample machine**: the spike $f_n=n\mathbf{1}_{[0,1/n]}$ converges pointwise to 0 but its integral is $1$ for all $n$ — mass "shoots off into infinity." This is exactly why Fatou is one-sided and DCT needs a dominating function.
- **Two cornerstones of $L^p$**: Hölder gives an inequality bounding the integral of a product; Minkowski gives the triangle inequality for $L^p$ (so $\|\cdot\|_p$ really is a norm).
- **Riesz–Fischer is Part 3's "repaid ticket"**: the real proof of $L^p$ completeness is here. Part 3 §3 took "$L^2$ is a Hilbert space" as a given; this section is its root.
- **$L^2$ stands alone**: among all $L^p$, only $p=2$ admits an inner product (the parallelogram identity holds only at $p=2$). This is the root reason Hilbert-space methods are especially powerful on $L^2$.
- **$(L^p)^* = L^q$**: aligns with the dual pairing structure of Part 4 — the dual of $\ell^p$ is $\ell^q$, and so too for $L^p$ and $L^q$.

---

## 1. The Monotone Convergence Theorem (MCT)

### Statement

Let $(X,\Sigma,\mu)$ be a measure space, $f_n:X\to[0,\infty]$ **nonnegative measurable** functions, **monotonically increasing** $f_1\le f_2\le\cdots$, converging pointwise to $f$. Then

$$
\lim_{n\to\infty}\int f_n\,d\mu=\int f\,d\mu=\int\lim_n f_n\,d\mu.
$$

**In one sentence**: for nonnegative monotonically increasing sequences, limit and integral **can be swapped unconditionally**.

{{< details summary="Proof: MCT" >}}

**Step 1: $\int f_n\,d\mu$ is monotonically increasing.** From $f_n\le f_{n+1}\le f$ and monotonicity of the integral, $\int f_n\,d\mu\le\int f_{n+1}\,d\mu\le\int f\,d\mu$. So $\lim_n\int f_n\,d\mu$ exists (possibly $=\infty$) and is $\le\int f\,d\mu$.

**Step 2: the reverse inequality.** Take any simple $0\le\varphi\le f$ and $\alpha\in(0,1)$, and let

$$
A_n=\{x\in X: f_n(x)\ge\alpha\varphi(x)\}.
$$

Since $f_n\nearrow f\ge\varphi\gt\alpha\varphi$ and monotonicity, $A_n\nearrow X$.

$$
\int f_n\,d\mu\ge\int_{A_n}f_n\,d\mu\ge\alpha\int_{A_n}\varphi\,d\mu.
$$

By the lower continuity of measure ($A_n\nearrow X$ ⇒ $\mu(A_n)\nearrow\mu(X)$),

$$
\int_{A_n}\varphi\,d\mu\to\int\varphi\,d\mu.
$$

Taking $n\to\infty$ gives $\lim_n\int f_n\,d\mu\ge\alpha\int\varphi\,d\mu$. Then let $\alpha\nearrow 1$ and take the sup over $\varphi\le f$ to obtain $\lim_n\int f_n\,d\mu\ge\int f\,d\mu$.

Sandwiching gives $\lim_n\int f_n\,d\mu=\int f\,d\mu$.

{{< /details >}}

### Connection to Part 6 Staircase Approximation

The staircase theorem of Part 6 §4 gives: for any nonnegative measurable $f$, there are simple $\varphi_n\nearrow f$. MCT then guarantees

$$
\int f\,d\mu=\lim_n\int\varphi_n\,d\mu.
$$

That is, **the sup-definition of Part 6 §5 Step 2 (integral of a nonnegative measurable function)** is equivalent to **taking the limit of staircase functions**. The two definitions unify under MCT.

---

## 2. Fatou's Lemma

### Statement

Let $f_n:X\to[0,\infty]$ be a nonnegative measurable sequence (**no monotonicity, no convergence required**). Then

$$
\int\liminf_n f_n\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

**In one sentence**: take $\liminf$ first, then integrate $\le$ integrate first, then take $\liminf$. $\liminf$ is one-sided.

{{< details summary="Proof: Fatou's lemma (from MCT)" >}}

Let $g_n=\inf_{k\ge n}f_k$. Then $g_n\nearrow\liminf_n f_n$, monotonically increasing and nonnegative.

By MCT,

$$
\int\liminf_n f_n\,d\mu=\lim_n\int g_n\,d\mu.
$$

Furthermore $g_n\le f_k$ for all $k\ge n$, so

$$
\int g_n\,d\mu\le \inf_{k\ge n}\int f_k\,d\mu.
$$

Letting $n\to\infty$:

$$
\lim_n\int g_n\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

Combining gives Fatou.

{{< /details >}}

### Why It Is One-Sided: the Moving-Spike Counterexample

**Moving spike**: on $[0,1]$,

$$
f_n(x)=n\cdot\mathbf{1}_{[0,1/n]}(x).
$$

For every $x\gt 0$, when $n$ is large $x\notin[0,1/n]$, so $f_n(x)=0$. Hence $f_n\to 0$ almost everywhere ($\{0\}$ is a null set).

But

$$
\int f_n\,dm=n\cdot\frac{1}{n}=1\quad\forall n.
$$

So $\int\lim_n f_n=\int 0=0\ne 1=\lim_n\int f_n$.

> **Mass escape**: every $f_n$ has "mass" $=1$, but the limit function does not capture this mass — it "shoots off into the infinitely tall thin spike" and vanishes. Fatou gives $0\le 1$ (true but strict); MCT does not apply ($f_n$ is not monotone); DCT does not apply either (no nontrivial dominating function exists).

This is why, among the three theorems, Fatou is only one-sided — **mass can escape, the limit of the integrals can be strictly larger than the integral of the limit**.

---

## 3. The Dominated Convergence Theorem (DCT)

### Statement

Let $f_n:X\to\mathbb{R}$ be measurable, $f_n\to f$ a.e., and suppose **there is a dominating function** $g\ge 0$ measurable and integrable with

$$
|f_n|\le g\ \text{a.e.}\quad\forall n.
$$

Then $f$ is integrable, and

$$
\lim_n\int f_n\,d\mu=\int f\,d\mu.
$$

**In one sentence**: a sequence with an integrable "ceiling" admits the limit-integral swap.

{{< details summary="Proof: DCT (double Fatou sandwich)" >}}

$g+f_n\ge 0$ a.e., so Fatou gives

$$
\int\liminf_n(g+f_n)\,d\mu\le\liminf_n\int(g+f_n)\,d\mu.
$$

Since $f_n\to f$, the LHS $=\int(g+f)\,d\mu$; the RHS $=\int g\,d\mu+\liminf_n\int f_n\,d\mu$. Cancelling $\int g$:

$$
\int f\,d\mu\le\liminf_n\int f_n\,d\mu.
$$

Similarly applying Fatou to $g-f_n\ge 0$ gives $\int f\,d\mu\ge\limsup_n\int f_n\,d\mu$.

Sandwiching yields $\liminf=\limsup=\int f\,d\mu$, i.e. $\lim_n\int f_n\,d\mu=\int f\,d\mu$.

{{< /details >}}

### The Ceiling Blocks Mass Escape

Back to the moving spike: $f_n=n\mathbf{1}_{[0,1/n]}$. A dominating $g\ge f_n$ a.e. must satisfy $g\ge n$ on $[0,1/n]$. Making this work for all $n$: $g(x)\ge\sup_{1/n\le x}n=\lfloor 1/x\rfloor$, so $g(x)\ge 1/x$. But $\int_0^1 1/x\,dx=\infty$ — **no integrable dominating $g$ exists**.

> **The essence of DCT**: an integrable "ceiling" $g$ traps all $f_n$ in a finite-mass container so mass cannot escape — therefore limit and integral can be swapped. "Mass escape" is geometrically forbidden in the presence of the DCT hypothesis.

### Relations Among the Three

```
            MCT (nonnegative monotone)
              ↓ (take g_n = inf_{k≥n} f_k)
            Fatou (one-sided)
              ↓ (apply to g±f_n on both sides)
            DCT (with domination)
```

**Strength decreasing, applicability increasing**:

- **MCT** has the strongest hypothesis (nonnegative + monotone), the cleanest conclusion (direct swap);
- **Fatou** has the weakest hypothesis (just nonnegative), the weakest conclusion (one-sided);
- **DCT** sits in the middle (no monotonicity required, but a dominating function is), with a direct conclusion (swap).

In practice the most-used is **DCT** — as soon as you find a "clearly integrable" dominating function (e.g. $f_n$ uniformly bounded, or majorized by $|f|+1$), you can swap.

### Worked Example: the Walking Tall Bump Meets All Three Theorems

§2 and §3 each touched the same spike $f_n = n\,\mathbf{1}_{(0,\,1/n)}$ from a single angle — Fatou's section used it to illustrate the one-sided inequality, and DCT's section used it to illustrate "no dominator exists." Part 6 §4 also previewed it as a "not a staircase approximation" counterexample. Here we **put it in front of all three theorems at once** and watch how each reacts to the same pathology — the capstone of §3 before we close.

**Replay of the case (one line per step)**

**Pointwise limit**: $\forall x\gt 0$, once $n$ is large the bump has slid past $x$, so $f_n(x) = 0$; at $x = 0$ the point is always outside the bump. Hence $\lim_n f_n(x) = 0$ **everywhere**.

**Per-term integral**: each $f_n$ is a rectangle of height $n$ and width $\tfrac{1}{n}$,

$$
\int_0^1 f_n\,dm = n\cdot\tfrac{1}{n} = 1\quad\forall n.
$$

**The contradiction surfaces**:

$$
\lim_n \int_0^1 f_n\,dm = 1 \ne 0 = \int_0^1 \lim_n f_n\,dm.
$$

Each $f_n$ is perfectly well-behaved, yet integration **lost exactly 1 unit of mass**.

**Where did the mass go**: it did not disappear. It **escaped into the infinitely tall, infinitely thin bump** — the bump grows narrower and taller, pressing toward $x=0$. At the moment of the limit, the bump becomes "infinitely tall, zero-width," and area 1 is stuffed into a **vertical line of measure zero**; the integral cannot see anything on null sets, so 1 unit "evaporates."

**The three theorems react one by one**

**① MCT: not applicable — correctly steps aside**

MCT requires $f_n$ monotonically increasing. But this sequence of spikes shifts and reshapes ($f_1$'s bump on $(0,1)$, $f_2$'s on $(0,\tfrac12)$, …); there is no $f_n\le f_{n+1}$ relation at all.

MCT checks its hypothesis → **finds non-monotonicity** → **refuses to apply**. It says nothing wrong — it simply **does not guarantee anything for this case**. $\checkmark$

**② Fatou: applicable, gives a strict inequality**

Fatou only needs nonnegativity; it must hold. Plugging in:

$$
\int\liminf_n f_n\,dm \le \liminf_n \int f_n\,dm\ \Longrightarrow\ 0 \le 1.\quad\checkmark
$$

Fatou honestly gives $\le$, and here it is **strict** — it tells you precisely: **"Mass may leak; the LHS can be smaller than the RHS."** It is not lying; this single direction is all it ever promised.

**③ DCT: not applicable — no ceiling exists**

DCT requires an integrable $g$ with $|f_n|\le g$. On $x\in(\tfrac{1}{n+1}, \tfrac{1}{n})$, the tallest bump is $f_n$ of height $n\approx \tfrac{1}{x}$. So $g(x)$ must be on the order of $\tfrac{1}{x}$. But

$$
\int_0^1 \tfrac{1}{x}\,dx = +\infty.
$$

The ceiling is **non-integrable** → DCT **refuses to apply**. $\checkmark$

**The three theorems' verdicts on the same case**

| Theorem | Checks hypothesis | Verdict | Correct? |
|---|---|---|---|
| MCT | Monotone? | No → not applicable | $\checkmark$ no false guarantee |
| Fatou | Nonnegative? | Yes → gives $0\le 1$ | $\checkmark$ correct direction |
| DCT | Integrable dominator? | No → not applicable | $\checkmark$ no false guarantee |

**Key insight**: this case is "pathological" precisely because it **simultaneously evades MCT's monotonicity and DCT's ceiling** — which is exactly why those two theorems set those two hypotheses. **Conditions are not red tape; each one is precisely blocking one mode of mass escape.**

Fatou is the only theorem applicable without conditions, at the cost of giving a one-sided inequality — and that strict $0\le 1$ is the **forensic fingerprint** of "1 unit of mass having escaped."

**One-sentence wrap-up**

Pathological cases do not break theorems — they only make theorems whose **hypotheses fail stay silent**. All the wisdom of the three convergence theorems lives in their hypotheses:

- The stronger the conditions you provide (monotonicity / dominator), the stronger the conclusion you get back (equality);
- Give nothing, and Fatou still guarantees you a one-sided inequality.

This is how measure theory "works" — **not by blindly plugging into formulas, but by checking hypotheses first and then deciding what to claim back**.

---

## 4. $L^p$ Spaces

### Definition

Let $(X,\Sigma,\mu)$ be a measure space and $1\le p\lt\infty$.

$$
\mathcal{L}^p(X,\mu)=\left\{f:X\to\mathbb{R}\ \text{measurable}\ :\ \int_X|f|^p\,d\mu\lt\infty\right\}.
$$

with

$$
\|f\|_p=\left(\int_X|f|^p\,d\mu\right)^{1/p}.
$$

The $p=\infty$ special case:

$$
\mathcal{L}^\infty(X,\mu)=\{f\text{ measurable}: f\text{ essentially bounded}\},\qquad\|f\|_\infty=\operatorname*{ess\,sup}_x|f(x)|.
$$

Here the **essential supremum** ignores spikes on null sets: $\operatorname*{ess\,sup}f=\inf\{M: |f|\le M\ \text{a.e.}\}$.

### a.e. Equivalence Classes

**$\|\cdot\|_p$ is not a norm on $\mathcal{L}^p$** — there exist nonzero $f$ (e.g. $\mathbf{1}_\mathbb{Q}$) with $\|f\|_p=0$, violating positive definiteness.

**Fix**: quotient by the a.e. equivalence relation:

$$
L^p(X,\mu)=\mathcal{L}^p(X,\mu)/\sim,\qquad f\sim g\iff f=g\ \text{a.e.}
$$

Elements of $L^p$ are "a.e. equivalence classes." On $L^p$, $\|\cdot\|_p$ truly is a norm.

> This cashes in the "a.e. equivalence classes as a fundamental convention" point at the end of Part 6 §5. **$L^p$ is a quotient space from the start**, not a function space. Day to day, "$f\in L^p$" means "the equivalence class $[f]\in L^p$," with the brackets usually suppressed.

---

## 5. Hölder and Minkowski

To prove $\|\cdot\|_p$ is a norm, the key piece is the triangle inequality (Minkowski), which in turn rests on Hölder.

### Hölder's Inequality

Let $1\le p,q\le\infty$ with $\tfrac1p+\tfrac1q=1$ (called **conjugate exponents**). For measurable $f, g$,

$$
\int|fg|\,d\mu\le\|f\|_p\cdot\|g\|_q.
$$

**Special case**: $p=q=2$ is the **Cauchy–Schwarz inequality** (already used in Part 3 §3).

{{< details summary="Proof: Hölder (via Young's inequality)" >}}

If $\|f\|_p=0$ or $\|g\|_q=0$, both sides are zero; trivial. Assume both are positive. Normalize $F=f/\|f\|_p$, $G=g/\|g\|_q$, so we reduce to $\|F\|_p=\|G\|_q=1$ and need to show $\int|FG|\,d\mu\le 1$.

**Young's inequality**: for $a,b\ge 0$ and $1/p+1/q=1$,

$$
ab\le\frac{a^p}{p}+\frac{b^q}{q}.
$$

Proof: $\ln$ is concave $\Rightarrow\ln(\tfrac1p a^p+\tfrac1q b^q)\ge\tfrac1p\ln a^p+\tfrac1q\ln b^q=\ln(ab)$. Take $\exp$.

Setting $a=|F|, b=|G|$:

$$
|FG|\le\frac{|F|^p}{p}+\frac{|G|^q}{q}.
$$

Integrating:

$$
\int|FG|\,d\mu\le\frac{1}{p}\int|F|^p\,d\mu+\frac{1}{q}\int|G|^q\,d\mu=\frac{1}{p}+\frac{1}{q}=1.
$$

Substituting back $f,g$ gives Hölder.

{{< /details >}}

### Minkowski's Inequality (the $L^p$ Triangle Inequality)

Let $1\le p\le\infty$. For measurable $f, g$,

$$
\|f+g\|_p\le\|f\|_p+\|g\|_p.
$$

{{< details summary="Proof: Minkowski (via Hölder)" >}}

For $p=1$ it is a direct consequence of monotonicity of the integral; for $p=\infty$ it is the triangle inequality of the $\sup$. Assume $1\lt p\lt\infty$.

$$
|f+g|^p=|f+g|\cdot|f+g|^{p-1}\le(|f|+|g|)|f+g|^{p-1}.
$$

Integrating:

$$
\int|f+g|^p\,d\mu\le\int|f||f+g|^{p-1}\,d\mu+\int|g||f+g|^{p-1}\,d\mu.
$$

Apply Hölder to each piece (with conjugate exponent $q=p/(p-1)$):

$$
\int|f||f+g|^{p-1}\,d\mu\le\|f\|_p\cdot\|(|f+g|^{p-1})\|_q=\|f\|_p\cdot\|f+g\|_p^{p-1}.
$$

Similarly for the $g$ piece. Combining:

$$
\|f+g\|_p^p\le(\|f\|_p+\|g\|_p)\cdot\|f+g\|_p^{p-1}.
$$

Dividing both sides by $\|f+g\|_p^{p-1}$ gives Minkowski.

{{< /details >}}

The three norm axioms for $\|\cdot\|_p$ are now in place — $(L^p, \|\cdot\|_p)$ is a normed space.

---

## 6. The Riesz–Fischer Theorem: $L^p$ Is Complete

For "$L^p$ is a Banach space" we still need one last step — completeness.

**Theorem (Riesz–Fischer)**: for $1\le p\le\infty$, $L^p(X,\mu)$ is a complete normed space, i.e. a **Banach space**.

{{< details summary="Proof: Riesz–Fischer (via DCT + fast Cauchy subsequence)" >}}

Let $(f_n)\subseteq L^p$ be Cauchy.

**Step 1: extract a "fast Cauchy" subsequence**. Choose $n_1\lt n_2\lt\cdots$ such that

$$
\|f_{n_{k+1}}-f_{n_k}\|_p\lt 2^{-k}.
$$

**Step 2: construct the limit**. Let

$$
g_K(x)=\sum_{k=1}^K|f_{n_{k+1}}(x)-f_{n_k}(x)|,\qquad g(x)=\sum_{k=1}^\infty|f_{n_{k+1}}(x)-f_{n_k}(x)|.
$$

By Minkowski (applied $K$ times), $\|g_K\|_p\lt\sum_{k=1}^K 2^{-k}\lt 1$. By MCT ($g_K\nearrow g$), $\|g\|_p\le 1\lt\infty$, so $g$ is finite a.e.

Therefore **the series $\sum_k(f_{n_{k+1}}-f_{n_k})$ converges absolutely a.e.**, the partial sums $f_{n_K}-f_{n_1}\to F\in L^p$ a.e.; let $f=F+f_{n_1}$.

**Step 3: the subsequence $f_{n_k}\to f$ in $L^p$**. $|f_{n_k}-f|\le 2g\in L^p$ (dominated), and by DCT $\|f_{n_k}-f\|_p\to 0$.

**Step 4: the original sequence also converges to $f$**. The original is Cauchy + the subsequence converges $\Rightarrow$ the whole sequence converges (the Part 2 classic: "Cauchy + a convergent subsequence ⇒ convergent").

{{< /details >}}

**Key tools recap**: MCT (controls the norm of $g$) + DCT (lifts subsequence convergence to $L^p$ convergence) + Part 2 §8's "Cauchy + a convergent subsequence ⇒ convergent" — three pieces working together. **All the investment in Part 6 and the first five sections here pays off in one place**.

> Part 3 §3 took "$L^2[0,1]$ is a Hilbert space" as a given; Riesz–Fischer is its root.

---

## 7. $L^2$ Stands Alone, and $(L^p)^*=L^q$

### $L^2$ Is the **Only** $L^p$ That Admits an Inner Product

Define

$$
\langle f, g\rangle=\int f\,\overline{g}\,d\mu,
$$

on $L^2$ this is immediately an inner product (linearity, conjugate symmetry, positive definiteness are all properties of the integral), and the induced norm is exactly $\|f\|_2=\sqrt{\langle f,f\rangle}$.

**Why only $p=2$**: a normed space is an inner-product space $\iff$ the norm satisfies the **parallelogram identity**:

$$
\|f+g\|^2+\|f-g\|^2=2\|f\|^2+2\|g\|^2.
$$

One can check that the $L^p$ norm violates this for $p\ne 2$ (a simple choice $\mathbf{1}_A, \mathbf{1}_B$ suffices).

**So**:

$$
L^2 = \text{complete + inner product} = \text{Hilbert space}.
$$

This is why all PDE weak-solution theory, quantum mechanical state spaces, and signal-processing Parseval identities favor $L^2$ — it is the **unique** $L^p$ that preserves all of $\mathbb{R}^n$ geometry.

### Dual Pairing $(L^p)^* = L^q$

**Dual pairing**: for $1\le p\lt\infty$ and conjugate exponent $q$,

$$
\Phi:L^q\to(L^p)^*,\qquad \Phi(g)(f)=\int fg\,d\mu
$$

is an **isometric isomorphism**, i.e.

$$
(L^p)^*\cong L^q.
$$

> Hölder gives "$\Phi(g)$ is bounded with $\|\Phi(g)\|\le\|g\|_q$"; the reverse direction (every bounded linear functional on $L^p$ has this integral form) requires the Radon–Nikodym theorem; we skip the details.

### Connection to Part 4 §3

Looking back at the "classical dual pairings" table in Part 4 §3, the pairings of $\ell^p$ with $\ell^q$ and of $L^p$ with $L^q$ were **directly quoted** at the time. Riesz–Fischer + Hölder + Radon–Nikodym now lay out the roots.

**Note the $p=\infty$ exception**: $(L^\infty)^*\supsetneq L^1$, strictly larger. This also matches "$\ell^\infty\ne(\ell^1)^*$ in reverse" mentioned in Part 4 §3 — $p=\infty$ is consistently exceptional in duality / reflexivity / weak topology.

---

## Summary: The Full Picture of Integration Theory

Parts 6 + 7 together close the "build the integral + use the integral" loop. In the overall map of Parts 1–5 it sits at the **foundational infrastructure** level:

```
Part 1-2 (ε-N on ℝ, completeness)
   ↓
Part 3 (metric/normed/Hilbert/Fourier) ←─── Part 7 §6-7
   ↓                                       ↑ (Riesz–Fischer fills L² completeness)
Part 4 (operators/dual/spectrum/compact) ←─── Part 7 §7
   ↓                                       ↑ ((L^p)*=L^q fills duality)
Part 5 (weak convergence/Hahn-Banach/fixed point)
   ↓
Part 6-7 (measure/integral/L^p)
   ↑
   The objects Part 3 §6 (L² Fourier) and Part 4 §3 ($\ell^p, L^p$ duality)
   have been using all along but never defined — these two notes settle the bill.
```

**Three things only clear in hindsight**:

1. **The Lebesgue integral is not "another integral"** but a **strict extension of Riemann + a version friendlier to convergence theorems**. All traditional computations still apply; the new tools only kick in for objects Riemann cannot handle (high discontinuity, pointwise-convergent limits, $L^p$ completion).
2. **Countable additivity + staircase approximation + a.e. equivalence classes** are three weapons baked into Lebesgue that give it its elegance. Countable additivity reduces "$m(\mathbb{Q})=0$" to two lines; staircase approximation gives the integral an inductive definition; a.e. lets $L^p$ become a real normed space.
3. **Three convergence theorems + Riesz–Fischer = the actual proof of $L^p$ completeness**. The thing Part 3 §3 took as a given now has its roots: MCT makes the staircase-limit definition self-consistent, DCT lifts "pointwise convergence + domination" to $L^p$ convergence, and Riesz–Fischer assembles a Cauchy subsequence into a complete limit. Together, "$L^p$ is a Banach space" finally stands up.

---

## Candidate Next Stops

At this point Parts 1–7 have walked through the **trunk** of real analysis. Possible next directions, depending on interest:

- **Sobolev spaces**: combine $L^p$ + weak derivatives for PDE weak solutions (Part 5's weak convergence + Parts 6–7's integration theory team up);
- **Spectral measures and the spectral theorem (continuous-spectrum version)**: generalize Part 4's compact-operator spectral theorem to general bounded self-adjoint operators using operator-valued Borel measures;
- **Rigorous foundations of probability**: measure theory + Radon–Nikodym ground random variables, conditional expectation, and martingale theory;
- **Topological vector spaces / locally convex spaces**: systematize Part 5's weak topology, entering "modern" functional analysis.

Whichever direction you take, the toolkit of Parts 1–7 is complete.
