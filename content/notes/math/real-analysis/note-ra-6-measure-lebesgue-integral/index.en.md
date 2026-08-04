---
date: '2026-06-16T20:00:00+09:00'
draft: false
title: 'Real Analysis Part 6: Measures, Measurable Functions, and the Lebesgue Integral'
summary: "Starting from Riemann's failure case (Dirichlet's function), upgrade the 'slice the domain vs. slice the range' intuition into a rigorous σ-algebra + measure framework. With Lebesgue measure as 'mass distribution,' the counter-intuitive m(ℚ)=0 becomes a two-line blanket-covering calculation. Then build the Lebesgue integral piece by piece via measurable functions + simple functions + the staircase approximation theorem, and bake 'integration is immune to null sets' into the foundation through a.e. equivalence classes. Part 6 upgrades integration from 'interval sums' to 'mass weighting'; Part 7 will put it to work."
description: "An intermediate real-analysis note on Riemann vs. Lebesgue integration (slicing the domain vs. the range), σ-algebras, measures with countable additivity, the outer-measure / covering definition of Lebesgue measure, the blanket-covering proof that m(ℚ)=0, the Dirac measure and a Radon–Nikodym preview, measurable functions, simple and indicator functions, the staircase approximation theorem, the three-step construction of the Lebesgue integral (simple → nonnegative → general measurable), and almost-everywhere (a.e.) equivalence classes."
tags: ["Mathematics", "Real Analysis", "Measure Theory"]
categories: ["Notes"]
series: ["Real and Functional Analysis"]
note_kind: "foundation"
aliases:
  - /notes/real-analysis-6-measure-lebesgue-integral/
---

# Real Analysis Part 6: Measures, Measurable Functions, and the Lebesgue Integral

> Part 5 wrapped up the Banach fixed-point theorem + completeness story, finishing "iteration in abstract spaces." Part 6 turns back to fill in an object that Parts 3 and 4 have been using but never strictly defining — the **Lebesgue integral** and the $L^p$ spaces. This note **rebuilds integration from the ground up**; Part 7 will use it to do things (the three convergence theorems + $L^p$ completeness).

The chain:

$$
\text{Riemann's bind}\to\text{σ-algebra}\to\text{measure}\to\text{Lebesgue measure}\to\text{measurable function}\to\text{staircase approximation}\to\text{Lebesgue integral}\to\text{a.e.}
$$

A few main threads:

- **Slice the range vs. slice the domain**: Riemann cuts the horizontal axis into small segments ("pile by position"); Lebesgue cuts the vertical axis into horizontal strips ("pile by face value"). The latter naturally handles highly discontinuous functions.
- **A measure is "weighing"**: abstract "length/area/volume/probability" into a single additive function $\mu:\Sigma\to[0,\infty]$.
- **σ-algebra + countable additivity is the key**: countable (not finite) additivity is the lifeline of every "infinite process" argument and is the root weapon by which Lebesgue beats Riemann.
- **m(ℚ) = 0 is not a paradox**: a two-line proof via countable blanket covering. This directly motivates "a.e. equivalence classes" — the Lebesgue integral is born immune to null sets.
- **Staircase from below**: every nonnegative measurable function can be approximated by simple functions monotonically increasing from below. The definition of the Lebesgue integral relies on this.
- **a.e. = outside a null set**: pointwise equal → almost-everywhere equal → equivalence class. Lebesgue tosses "values at individual points" into a "doesn't care" bin.

---

## 1. From Riemann's Bind to Lebesgue's View

### Riemann's Limitations

Riemann integration is built by **slicing the domain**: partition $[a,b]$ into $n$ subintervals, approximate the height on each (upper / lower sums), and take a limit as the subinterval length $\to 0$.

The chronic illness shows in two situations:

**Example 1 (Dirichlet's function)**:

$$
\chi_\mathbb{Q}(x)=\begin{cases}1, & x\in\mathbb{Q}\\ 0, & x\notin\mathbb{Q}\end{cases}
$$

on $[0,1]$. In any small subinterval, $\sup\chi_\mathbb{Q}=1$ and $\inf\chi_\mathbb{Q}=0$, so Riemann's upper sum $=1$ and lower sum $=0$ **never converge**. Not Riemann-integrable.

But intuitively $\chi_\mathbb{Q}$ "is almost everywhere 0" — $\mathbb{Q}$ is countable, "density" should be $0$. Lebesgue will assign it integral $0$.

**Example 2 (pointwise convergence vs. integral swap)**: build $f_n:[0,1]\to\mathbb{R}$ as a partial approximation to $\chi_\mathbb{Q}$, each $f_n$ Riemann-integrable (take a finite subset of $\mathbb{Q}$), $f_n\to\chi_\mathbb{Q}$ pointwise — **but the limit function isn't integrable**. Riemann integration is unfriendly to "pointwise convergence + limits."

### Slicing the Range: the Counting-Money Metaphor

Lebesgue reverses direction — **slice the range** instead of the domain.

> **Counting-money metaphor**: a pile of coins on a table, count the total.
>
> - **Riemann method**: count them one by one in the position they sit in (by position);
> - **Lebesgue method**: first sort by denomination (a one-dollar pile, five-dollar pile, ten-dollar pile…), count each pile and multiply by face value, then sum (by face value).
>
> When the coins are scattered chaotically (highly discontinuous function), **piling by face value** is obviously more efficient.

Formally: for a function $f$, partition the range $[0, M]$ into horizontal strips $[k\Delta y, (k+1)\Delta y]$. For each strip measure "the $x$-set where $f$ lands in this strip," multiply by the strip height, and sum:

$$
\int f\,d\mu \approx \sum_k k\Delta y\cdot\mu(\{x: f(x)\in[k\Delta y,(k+1)\Delta y]\}).
$$

**Key**: to make this work, we need "the set $\{x: f(x)\in[\cdot,\cdot]\}$ can be 'weighed'" — that is, an object that assigns values to sets: a **measure**.

---

## 2. σ-Algebras and Measures

### σ-Algebra

Let $X$ be a set. $\Sigma\subseteq 2^X$ is a **σ-algebra** on $X$ if:

1. $X\in\Sigma$;
2. $A\in\Sigma\Rightarrow X\setminus A\in\Sigma$ (closed under complement);
3. $A_1,A_2,\ldots\in\Sigma\Rightarrow\bigcup_{n=1}^\infty A_n\in\Sigma$ (closed under **countable** unions).

From 1, 2, 3 it follows that $\emptyset\in\Sigma$ and countable intersections are also closed.

> **Reading**: a σ-algebra is "the family of sets we have decided we can weigh." **The 'σ-' emphasizes *countable* (not just finite)** — this is the foundation for all later "limit-taking" arguments.

Elements of $\Sigma$ are called **measurable sets**. $(X,\Sigma)$ is a **measurable space**.

### Measure

$\mu:\Sigma\to[0,\infty]$ is a **measure** on $(X,\Sigma)$ if:

1. $\mu(\emptyset)=0$;
2. **Countable additivity**: if $\{A_n\}\subseteq\Sigma$ are pairwise disjoint, then

$$
\mu\left(\bigsqcup_{n=1}^\infty A_n\right)=\sum_{n=1}^\infty\mu(A_n).
$$

$(X,\Sigma,\mu)$ is a **measure space**.

### Intuition: Mass Distribution

Think of $X$ as "space" and $\mu$ as "a mass distribution placed on this space." $\mu(A)$ is "how much mass is in region $A$."

- Length / area / volume: uniform mass distributions;
- Probability: a mass distribution normalized so total mass $=1$;
- A point mass: the **Dirac measure** $\delta_p$, defined by $\delta_p(A)=\mathbf{1}_A(p)$ ($A$ contains $p$ → 1, else 0).

Countable additivity in mass language: **countably many disjoint regions add up their masses directly**.

### Dirac Measure and Density

The Dirac measure $\delta_p$ concentrates all the mass at a single point. On $\mathbb{R}$:

$$
\int f\,d\delta_p=f(p).
$$

It is not the "density" of any function $f(x)$ — no Lebesgue-density function describes $\delta_p$.

> **Radon–Nikodym preview**: when a measure $\mu$ is "gentle enough" relative to another measure $\nu$ (written $\mu\ll\nu$, "$\mu$ is absolutely continuous with respect to $\nu$"), there exists a density function $\rho$ such that $\mu(A)=\int_A \rho\,d\nu$ for all measurable $A$.
>
> The Dirac measure is **not** absolutely continuous with respect to Lebesgue measure (it is concentrated on a null set), so it **has no Lebesgue density** — which is precisely why the physicists' "$\delta(x)$ function" is, strictly speaking, not a function but a measure (or, more generally, a distribution).

---

## 3. Lebesgue Measure

### Outer Measure (the Covering Definition)

On $\mathbb{R}$, define the **outer measure**:

$$
m^*(A)=\inf\left\{\sum_{n=1}^\infty\ell(I_n)\ :\ A\subseteq\bigcup_{n=1}^\infty I_n,\ I_n \text{ open intervals}\right\}.
$$

where $\ell(I_n)$ is the length of the interval.

**Intuition**: cover $A$ with a **countable blanket of open intervals**; each covering gives a total length as a candidate; take the infimum over all candidates.

### Lebesgue Measurable Sets

$A\subseteq\mathbb{R}$ is **Lebesgue measurable** if for every $E\subseteq\mathbb{R}$,

$$
m^*(E)=m^*(E\cap A)+m^*(E\setminus A).
$$

(Carathéodory's criterion — "$A$ cleanly splits any $E$ in two pieces whose outer measures add.")

The collection of measurable sets is denoted $\mathcal{L}(\mathbb{R})$ — it is a σ-algebra on $\mathbb{R}$; $m^*|_\mathcal{L}$ is the **Lebesgue measure**, written $m$.

> Not every subset of $\mathbb{R}$ is measurable — the classic counterexample is the **Vitali set** (covered separately in §3.4), constructed using the axiom of choice. But **all open / closed / Borel / countable unions-intersections** met in practice are measurable, so this rarely matters in daily use.

### The Blanket-Cover Proof that m(ℚ) = 0

**Claim**: $m(\mathbb{Q})=0$.

{{< details summary="Proof: a countable dense set has measure zero" >}}

**$\mathbb{Q}$ is countable** — for $\mathbb{Q}\cap[0,1]$, arrange all $p/q$ ($0\le p\le q$) in a 2D grid:

| denom ↓ ／ num → | 0   | 1   | 2   | 3   | 4   | …   |
|------------------|-----|-----|-----|-----|-----|-----|
| 1                | 0/1 | 1/1 |     |     |     |     |
| 2                |     | 1/2 |     |     |     |     |
| 3                |     | 1/3 | 2/3 |     |     |     |
| 4                |     | 1/4 | 2/4 | 3/4 |     |     |
| 5                |     | 1/5 | 2/5 | 3/5 | 4/5 |     |
| …                |     |     |     |     |     |     |

Zig-zag along the anti-diagonals $0/1\to 1/1\to 1/2\to 1/3\to 2/3\to 1/4\to 2/4\to\cdots$ to flatten the whole table into a single sequence. The same method works for all of $\mathbb{Q}$ (do $\mathbb{Q}_{\ge 0}$ first, then mirror to negatives). So $\mathbb{Q}$ is enumerable:

$$
\mathbb{Q}=\{q_1, q_2, q_3, \ldots\}.
$$

Take any $\varepsilon\gt 0$. For each $q_n$, cover with an open interval of length $\varepsilon/2^n$:

$$
I_n=\left(q_n-\frac{\varepsilon}{2^{n+1}},\ q_n+\frac{\varepsilon}{2^{n+1}}\right),\qquad \ell(I_n)=\frac{\varepsilon}{2^n}.
$$

Then $\mathbb{Q}\subseteq\bigcup_n I_n$, with total length

$$
\sum_{n=1}^\infty\ell(I_n)=\sum_{n=1}^\infty\frac{\varepsilon}{2^n}=\varepsilon.
$$

So $m^*(\mathbb{Q})\le\varepsilon$. Since $\varepsilon$ is arbitrary, $m^*(\mathbb{Q})=0$ and thus $m(\mathbb{Q})=0$.

{{< /details >}}

**The essence**: countably many intervals, each half the length of the previous — the geometric series has finite sum. This is the **power of countable (not finite) additivity**. Riemann's finite partitions cannot do this.

Direct corollary: **any countable set has Lebesgue measure 0** — so $\chi_\mathbb{Q}$ is "almost everywhere 0" in the Lebesgue sense, and $\int_0^1\chi_\mathbb{Q}\,dm=0$. Riemann's deadlock, Lebesgue cuts through with one stroke.

### The Vitali Set: Non-Measurable Subsets Exist

Here we look at the pathological Vitali set — **not every subset of ℝ can be assigned a weight**. One-sentence conclusion: **the Lebesgue σ-algebra $\mathcal{L}(\mathbb{R})$ is a strict subset of $2^\mathbb{R}$**; there exist subsets $V\subseteq[0,1]$ for which no self-consistent "weight" can be assigned. Expand below for the full "cake-and-knife" argument.

{{< details summary="The cake-and-knife metaphor: good knives vs. bad knives, and why we need a σ-algebra" >}}

**A set as a "knife" cutting the cake**

Think of $[0,1]$ as a cake. A set $A\subseteq[0,1]$ is a knife:

- Every point in $A$ → left plate;
- Every point outside $A$ → right plate;
- Weigh the two plates and check whether their sum equals the whole cake's $1$.

**Sums up = $A$ is a good knife (measurable); doesn't sum up = $A$ is a bad knife (non-measurable).**

This is precisely the visual form of §3.2's Carathéodory criterion $m^*(E)=m^*(E\cap A)+m^*(E\setminus A)$ — "$A$ cleanly splits any test cake $E$ in two, and the outer measures add."

**A good knife: the irrationals**

Take $A = I =$ the irrationals in $[0,1]$. Cut the whole cake:

- **Left plate** (points in $I$): all irrational points, weight $m(I) = 1$ ($[0,1]$ minus countable-null $\mathbb{Q}$, by §3.3);
- **Right plate** (points outside $I$): all rational points, weight $m(\mathbb{Q}\cap[0,1]) = 0$.

Weights add:

$$
1 + 0 = 1\ \checkmark
$$

Exactly the whole. Any test cake (say $[0, 0.3]$) gives matching accounts too. **The irrationals are a good knife, measurable.**

**A bad knife: the Vitali set**

Now construct a knife whose accounting fundamentally fails.

**First, color the cake**. For each point $x\in[0,1]$, assign a color by the rule

$$
x, y \text{ have the same color}\ \iff\ x - y \in \mathbb{Q}.
$$

This partitions the cake into uncountably many colors — same color = differ by a rational; each color is **countably dense** across the entire cake.

**The Vitali cut**: pick **one representative point** from each color, gather them into

$$
V \subseteq [0,1].
$$

This step picks from **uncountably many colors at once** — **only possible with the Axiom of Choice**. $V$ is a strange set: it spans the whole cake, but each color contributes exactly one point.

**Weighing fails: the trap of countably many equal pieces**

Don't weigh $V$ directly — look at how its **translates** tile the cake. Translate $V$ along a rational $q$ to get

$$
V_q = (V + q)\bmod 1.
$$

The family $\{V_q : q\in\mathbb{Q}\cap[0,1]\}$ satisfies three things:

1. **Pairwise disjoint**: if two translates shared a point, the original representatives would be the same color — but $V$ has only one representative per color. Contradiction.
2. **Together they cover the whole cake $[0,1)$**: every point belongs to some color and can be written as (that color's representative) + (some $q$).
3. **Each translate has the same weight** (call it $c$): they are all translates of $V$, and **translation does not change weight**.

Now weigh: countably many copies of weight $c$ tile the cake disjointly, so

$$
1 = \underbrace{c + c + c + \cdots}_{\text{countably many}}.
$$

**The fatal problem**: no choice of $c$ works —

- If $c = 0$: $0 + 0 + 0 + \cdots = 0 \ne 1$;
- If $c \gt 0$ (even $0.0001$): countably many positives sum to $\infty \ne 1$.

**Never equals 1.** So $V$ has no self-consistent weight — it is a **bad knife**, non-measurable.

**Why not $\tfrac{1}{n}$? Why doesn't a convergent series save it?**

Intuitively you might say "just give each piece $\tfrac{1}{n}$" —

- "**$\tfrac{1}{n}$ works**" requires a **finite count of $n$ pieces**. $5\times\tfrac15 = 1$ works because there are 5 pieces. Here the count is **countably infinite**, with no finite $n$ you can write down.
- "But geometric series $\sum 1/2^n = 1$ sums infinitely many terms to 1, doesn't it?" — yes, but each term is **of different size**, with the series converging because the tail shrinks. Vitali's curse is **forcing each piece to be the same size** (translation invariance demands it), with no "shrinking tail" escape.

"**Equal + countably infinite**" is a dead end: positive $\times \infty = \infty$, zero $\times \infty = 0$, with no value in between that can stop at 1.

**Contrast with m(ℚ) = 0**

This is exactly the watershed between §3.3 and §3.4, and the real punchline of the Vitali section — **both sides use "countable additivity + translation invariance," but in opposite directions**:

| | Copy structure | Weight of each piece | Sum over infinitely many | Conclusion |
|---|---|---|---|---|
| **m(ℚ)=0** (§3.3) | Cover $\mathbb{Q}$ with blankets, **overlaps allowed** | Can **decrease** as $\varepsilon/2^n$ | Converges, **shrinkable to anything** | $m(\mathbb{Q})=0$ |
| **Vitali** (§3.4) | Translates $V_q$, **forced disjoint** | Translation invariance forces **all equal** $c$ | **Only 0 or ∞**, always skipping 1 | $V$ non-measurable |

Blanket covering works because "the pieces can be made smaller and smaller" (decreasing series converge); Vitali fails because "the pieces must all be equal" (geometric series are forbidden).

**The roots are the same toolset; the directions are opposite.**

**This answers "why we need a σ-algebra"**

If we insisted on assigning weights to every subset of $2^\mathbb{R}$, sets like Vitali — whose accounts don't balance — would sneak in, breaking the whole weight system into self-contradiction (forced to admit $1 = 0$ or $1 = \infty$).

The strategy of measure theory: **only license the "good knives"** — define the measure on sets that cut consistently (those in the σ-algebra), and refuse bad knives like Vitali outright.

$$
\boxed{\,\text{σ-algebra} = \text{the registry of all good knives}\,}
$$

This is the deeper meaning of the parenthetical in §3.2:

$$
\text{open / closed / Borel / their countable closures and complements} \subsetneq \mathcal{L}(\mathbb{R}) \subsetneq 2^\mathbb{R}.
$$

Every set you can "naturally write down" in practice lives in $\mathcal{L}(\mathbb{R})$. The Vitali set **requires** the axiom of choice to construct, and **no concrete element $v\in V$ can be written down** — it is more of a "theoretical entity in the ZFC axiom system" than a set that would actually appear in analysis.

> **What it means**: the Vitali set is a mirror. It shows the power of Lebesgue measure has a ceiling — it cannot be extended to all of $2^\mathbb{R}$ while preserving **translation invariance + countable additivity + being defined on every subset**. **Any two of the three are compatible; all three together collapse.** Lebesgue's choice is to sacrifice the third (restrict to $\mathcal{L}$), keeping the first two — this trade-off is the foundational stance of measure theory.

{{< /details >}}

{{< details summary="Proof: the Vitali set is not Lebesgue measurable (formal version)" >}}

**Step 1: equivalence relation and choice of representatives.**

On $[0,1]$, define $x\sim y\iff x-y\in\mathbb{Q}$. This is an equivalence relation, partitioning $[0,1]$ into uncountably many equivalence classes, each countable and dense.

By the **axiom of choice**, pick one representative from each class to form $V\subseteq[0,1]$.

**Step 2: translation construction.**

Enumerate $\mathbb{Q}\cap[0,1]=\{q_1, q_2, \ldots\}$. Define

$$
V_n=(V+q_n)\bmod 1\subseteq[0,1].
$$

**Claim A (disjointness)**: $V_n\cap V_m = \emptyset$ when $n\ne m$.

Proof: if $x\in V_n\cap V_m$, then $\exists v_1, v_2\in V$ with $v_1+q_n\equiv v_2+q_m\pmod 1$, i.e. $v_1-v_2\in\mathbb{Q}$, so $v_1\sim v_2$. But $V$ has only one representative per class, so $v_1=v_2 \Rightarrow q_n=q_m$, contradiction.

**Claim B (covering)**: $[0,1]\subseteq\bigcup_n V_n$.

Proof: $\forall x\in[0,1]$, the representative of $x$'s class is some $v\in V$, so $x-v\in\mathbb{Q}\cap[-1,1]$. Take $q_n = x-v\bmod 1\in\mathbb{Q}\cap[0,1]$; then $x\in V+q_n\pmod 1 = V_n$.

**Step 3: derive a contradiction.**

Suppose $V$ is Lebesgue measurable. By **translation invariance** of Lebesgue measure (and the isometric mod-1 operation), $m(V_n) = m(V)$ for all $n$.

By disjointness and countable additivity,

$$
m([0,1]) = m\!\left(\bigsqcup_n V_n\right) = \sum_{n=1}^\infty m(V_n) = \sum_{n=1}^\infty m(V).
$$

The LHS $= 1$. The RHS:

- $m(V) = 0$ $\Rightarrow$ sum $= 0$;
- $m(V) \gt 0$ $\Rightarrow$ sum $= \infty$.

Both cases contradict LHS $=1$. So $V$ is not Lebesgue measurable. $\square$

{{< /details >}}

---

## 4. Measurable Functions and Simple Functions

### Measurable Function

Let $(X,\Sigma)$ be a measurable space. A function $f:X\to\mathbb{R}$ is a **measurable function** if

$$
\forall a\in\mathbb{R},\ f^{-1}\big((a,\infty)\big)=\{x\in X: f(x)\gt a\}\in\Sigma.
$$

> **Reading**: a measurable function = "the set obtained by slicing horizontal strips can be weighed" — exactly the property we needed at the end of §1 when slicing the range.

Replacing $(a,\infty)$ with $(-\infty,a)$, $[a,b]$, or any Borel set gives equivalent definitions.

### Indicator and Simple Functions

**Indicator function**:

$$
\mathbf{1}_A(x)=\begin{cases}1, & x\in A\\ 0, & x\notin A\end{cases}.
$$

$\mathbf{1}_A$ is measurable $\iff A\in\Sigma$.

**Simple function**: a measurable function $\varphi$ whose **image takes only finitely many values**. Equivalently,

$$
\varphi=\sum_{k=1}^n c_k\,\mathbf{1}_{A_k},\qquad c_k\in\mathbb{R},\ A_k\in\Sigma \text{ pairwise disjoint}.
$$

The integral of a simple function has an obvious definition ("each horizontal step = height × measure," summed up):

$$
\int\varphi\,d\mu=\sum_{k=1}^n c_k\,\mu(A_k).
$$

This is the starting point for the entire Lebesgue-integral construction in §5.

### The Staircase Approximation Theorem

**Theorem (staircase approximation from below)**: let $f:X\to[0,\infty]$ be nonnegative and measurable. Then **there exist** simple functions $\varphi_n$ such that:

1. $0\le\varphi_1\le\varphi_2\le\cdots\le f$ (**monotonically increasing**);
2. $\varphi_n(x)\to f(x)$ **pointwise** for every $x\in X$;
3. If $f$ is bounded, convergence is **uniform**.

{{< details summary="Proof: the staircase approximation theorem (slice the range + flatten from below)" >}}

**Core construction**: at step $n$, partition the range $[0, 2^n]$ into $2^{2n}$ equal slices of width $2^{-n}$; clip everything above $2^n$ down to $2^n$. Concretely,

$$
\varphi_n(x)=\begin{cases}\dfrac{k-1}{2^n}, & x\in f^{-1}\!\left(\left[\tfrac{k-1}{2^n},\tfrac{k}{2^n}\right)\right),\ k=1,\ldots,n\cdot 2^n\\[4pt] n, & f(x)\ge n\end{cases}.
$$

**Condition 1 (monotonically increasing)**: passing from $\varphi_n$ to $\varphi_{n+1}$, the range resolution doubles — each horizontal strip is split in two; the lower half keeps the same $\varphi$ value, the upper half **strictly increases** by $1/2^{n+1}$. Hence $\varphi_{n+1}\ge\varphi_n$.

**Condition 2 (pointwise convergence)**:

- If $f(x)\lt\infty$: for $n$ large enough that $f(x)\lt n$, $\varphi_n(x)$ lies in the same strip as $f(x)$, with error $\lt 2^{-n}\to 0$.
- If $f(x)=\infty$: $\varphi_n(x)=n\to\infty=f(x)$.

**Condition 3 (uniform when bounded)**: if $f\le M$, then for $n\gt M$, $\varphi_n$ is never clipped at the top and the error $\le 2^{-n}\to 0$ **uniformly** in $x$.

{{< /details >}}

This theorem is the **bridge** of Lebesgue integration: first define the integral on simple functions (trivial), then extend to all nonnegative measurable functions via staircase approximation. **"From below" and "monotonically increasing"** are both essential — they ensure the supremum in §5 behaves well, and they will be the natural setup for MCT in Part 7.

### Counterexample Preview: the Walking Tall Bump

So what if we **drop the monotonicity constraint**? Consider this simple-function sequence:

$$
f_n(x) = n\,\mathbf{1}_{(0,\,1/n)}(x).
$$

Each $f_n$ is a simple function (a single step of height $n$ and width $\tfrac{1}{n}$). The pointwise limit:

- $x = 0$: always outside the bump, so $f_n(0) = 0$;
- $x \gt 0$: once $n$ is large enough that $\tfrac{1}{n}\lt x$, the bump has slid past $x$ and $f_n(x) = 0$.

So $f_n\to 0$ **everywhere**. $\{f_n\}$ looks superficially like a simple-function approximation of $f = 0$ — **but it is not a staircase approximation**.

**Why not**: a staircase approximation requires $\varphi_n\le f$ (from below) and $\varphi_n\le\varphi_{n+1}$ (monotone). Here $f = 0$, while each $f_n$ is **far above $0$** on its bump; and the bump's position and shape keep changing ($f_1$'s bump on $(0,1)$, $f_2$'s on $(0,\tfrac12)$, …), neither "from below" nor "monotone."

**The consequence shows up in the integrals**:

$$
\int_0^1 f_n\,dm = n\cdot\tfrac{1}{n} = 1\quad\forall n.
$$

Following the "staircase + MCT" logic, the integrals should converge to $\int 0\,dm = 0$. Instead they are **constantly 1** — a full unit of mass is missing. That 1 unit "escaped into the infinitely tall and infinitely thin bump."

> **Preview of Part 7 §3.4**: This same walking-bump will be put in front of all three convergence theorems (MCT, Fatou, DCT) at once, so each theorem's reaction to the same pathology can be inspected — the downstream payoff of staircase approximation's "from below, monotone" requirement.

The "from below + monotone" of staircase approximation and the "nonnegative + monotonically increasing" of MCT are **two ends of the same vein**: without them, simple-function sequences can behave entirely uncontrollably.

---

## 5. The Lebesgue Integral (Three-Step Construction)

### Step 1: Nonnegative Simple Functions

$$
\varphi=\sum_{k=1}^n c_k\,\mathbf{1}_{A_k},\ c_k\ge 0\ \Longrightarrow\ \int\varphi\,d\mu=\sum_{k=1}^n c_k\,\mu(A_k).
$$

With the convention $0\cdot\infty=0$ (for cases where $c_k=0$ but $\mu(A_k)=\infty$).

### Step 2: Nonnegative Measurable Functions

$$
\int f\,d\mu=\sup\left\{\int\varphi\,d\mu\ :\ \varphi\text{ simple and nonnegative},\ 0\le\varphi\le f\right\}.
$$

By the staircase approximation (§4), this sup **is always attained** (the limit of a monotonically increasing staircase sequence equals this sup). This is the "geometric meaning" of the integral — "the area between $f$ and the $x$-axis, filled from below."

### Step 3: General Measurable Functions

Decompose $f$ into positive and negative parts $f=f^+-f^-$, where

$$
f^+(x)=\max(f(x),0),\qquad f^-(x)=\max(-f(x),0).
$$

Both are nonnegative and measurable. **$f$ is $\mu$-integrable** if

$$
\int f^+\,d\mu\lt\infty\ \text{ and }\ \int f^-\,d\mu\lt\infty.
$$

Then

$$
\int f\,d\mu=\int f^+\,d\mu-\int f^-\,d\mu.
$$

Note that "integrable" requires both the positive and negative parts to be finite. $\int |f|\,d\mu\lt\infty$ is an equivalent condition.

### Riemann-Integrable ⇒ Lebesgue-Integrable

**Fact**: a Riemann-integrable function on $[a,b]$ is also Lebesgue-integrable, and the two integrals agree. **Not conversely**: $\chi_\mathbb{Q}$ is Lebesgue-integrable but not Riemann-integrable.

> So Lebesgue integration is a **strict extension** of Riemann: all traditional computations still go through unchanged, and the new tools only kick in for objects Riemann cannot handle.

### Almost Everywhere (a.e.)

**Key concept**: a property $P$ holds **almost everywhere (a.e.)** on $X$ if

$$
\mu\big(\{x\in X: P(x)\text{ fails}\}\big)=0.
$$

Examples:

- $f=g$ a.e.: $\{x: f(x)\ne g(x)\}$ is a null set;
- $f_n\to f$ a.e.: outside a null set, $f_n(x)\to f(x)$.

**Integration is immune to a.e.**:

$$
f=g\ \text{a.e.}\ \Longrightarrow\ \int f\,d\mu=\int g\,d\mu.
$$

The two only differ on a null set, contributing $0$ to the integral.

**This drives one fundamental convention**:

> **Take "a.e. equal" as an equivalence relation. The true domain of the Lebesgue integral is the set of equivalence classes, not the set of functions.**

In Part 7 §4 we will see that the elements of $L^p$ are a.e. equivalence classes from the very beginning — this is the root reason it can be a complete normed space (every Cauchy sequence converges to a **unique** element). Without quotienting out a.e., "different functions" might correspond to "the same integral object," $\|f\|_p=0$ would not imply $f=0$, and positivity (definiteness) would collapse.

---

## Summary: Three Main Threads

This note did one thing — **upgrade integration from "interval sums" to "mass weighting"**. Three threads run through it:

1. **Slicing the range vs. slicing the domain**. Lebesgue's fundamental viewpoint reversal: the horizontal axis can be unsliceable (Dirichlet's function), but the vertical axis cuts cleanly; "piling by face value" is more robust to disordered data than "piling by position." The cost behind it: build the "weighing" (measure) machinery first.
2. **σ-algebra + countable additivity**. The "σ-" is not decoration — it is the lifeline. **Countable** (not finite) additivity makes arguments like "infinitely many tiny intervals sum to a finite ε" work. This is the root weapon by which Lebesgue beats Riemann, and the foundation under MCT/Fatou/DCT in Part 7.
3. **Staircase approximation + a.e. equivalence classes**. "Monotonic increase from below" gives the Lebesgue integral a clean inductive definition (simple → nonnegative → general), and is also the embryo of MCT. "a.e." tosses "values at individual points" into the "doesn't care" bin, allowing the $L^p$ norm to be a real norm (positive definite).

---

## Next Stop: Part 7

Part 7 uses these tools to do **three things**:

- **The three convergence theorems**: MCT, Fatou, DCT. Settle "swap limit and integral" once and for all — when can you swap, what is "mass escape," what is the role of the dominating function;
- **$L^p$ spaces**: definition of $L^p$, Hölder's inequality (Cauchy–Schwarz is the $p=2$ special case), Minkowski (the triangle inequality for $L^p$);
- **Completeness and duality**: Riesz–Fischer guarantees $L^p$ is complete (Banach), $L^2$ is the **only** $L^p$ that admits an inner product (linking to Hilbert spaces in Part 3), and $(L^p)^*=L^q$ (linking to the dual pairing in Part 4).

Part 6 is "building the integral"; Part 7 is "using the integral." Once joined, the "$L^2[0,T]$ is a Hilbert space" that Part 3 §3 / §6 has been quietly using becomes truly grounded.
