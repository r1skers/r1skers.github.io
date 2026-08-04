---
date: '2026-06-03T10:00:00+09:00'
draft: false
title: "Reading Ax=b through an Engineering Energy Lens"
summary: "Behind $Ax=b$ sits an implicit 'energy distribution map'. A's eigendecomposition reveals it; SVD and PCA branch off it (transfer vs. description), with rank, condition number, inversion, Ridge, and gradient descent hanging on as static and dynamic engineering consequences."
description: "Around the single equation Ax=b, this post reads SVD, rank, condition number, inversion, Ridge, gradient descent, and PCA as two branches on A's energy-distribution map: one treats A as an operator (SVD transfer + GD dynamics), the other treats A as data (PCA description)."
tags: ["Linear Algebra", "Numerical Stability", "Regularization", "Optimization"]
categories: ["Posts"]
series: ["Energy Perspective"]
---

# Setup

In linear-algebra textbooks, $Ax=b$ is usually framed as "solving an equation": given an $A$ and a $b$, recover $x$. But once I started putting matrices alongside signals, energy, and systems, $Ax=b$ took on a different flavor. It looks more like an **engineering system**: $A$ is a matrix, $x$ is the input, $b$ is the output.

And there is a quietly assumed **default** behind the equation: when we write $Ax=b$, we have already implied an "energy distribution map" — **$A$ does not treat input directions equally**. Some directions get amplified, some get compressed, some are almost swallowed.

This post pulls that implicit energy map into the open, then watches what SVD, rank, condition number, inversion, Ridge, gradient descent, PCA, and friends are actually doing on it. Structurally, all of these are **two branches growing from a common root**:

- **Common root**: $A$'s eigendecomposition gives a set of orthogonal directions $V$ and an energy distribution $\sigma_i^2$ (§1).
- **Transfer branch**: bring in $U$ and watch $b = Ax$ form by projection, scaling, and reassembly — SVD, rank, condition number, inversion, Ridge, gradient descent all live here, and §8 ties the four operations together with a small numerical example (§2-§8).
- **Description branch**: do not bring in $x$ at all and do not compute $b$. Treat $A$ as a data matrix and read $V$ and $\sigma_i^2$ directly through variance — this is PCA (§9).

# 1. Eigendecomposition: A's Own Energy Distribution

The most naive picture: feed an $x$ into $A$ and get $b = Ax$. Look a little closer, though, and **$A$ clearly does not treat different directions of $x$ equally**.

A thought experiment: let $x$ range over unit vectors pointing in many different directions and watch $\|Ax\|$. Some directions give a large $\|Ax\|$; some give nearly zero. In other words, **the same input energy $\|x\|^2$, after passing through $A$, gets compressed or amplified by an amount that depends entirely on direction**.

The precise capture of this asymmetry is **SVD** — it writes any $A$ as

$$ A = U\Sigma V^\top $$

or equivalently, the eigendecomposition of the symmetric matrix $A^TA$ (a general non-square $A$ has no eigendecomposition of its own, but $A^TA$ always does):

$$ A^TA = V\,\Sigma^2\,V^\top $$

Either way, what falls out is $A$'s own **energy map**:

- $V = [v_1, v_2, \dots]$ — the orthogonal directions $A$ naturally prefers.
- $\sigma_i^2$ — the energy along each of those directions, sorted from large to small: $\sigma_1^2 \ge \sigma_2^2 \ge \cdots \ge 0$.

Summing the whole map gives exactly $A$'s squared Frobenius norm:

$$ \|A\|_F^2 = \sum_i \sigma_i^2 $$

— the "total energy" of the machine. The reason "most energy concentrates in the top few singular directions" matters so much is precisely because it leads directly into low-rank approximation, PCA, and compression.

**An important note: $V$ and $\sigma_i^2$ are intrinsic to $A$ — they do not depend on any $x$.** This is the **common root** for both branches that follow. The remaining $U$ from SVD is the basis on the output side, and we only need it in the next section, when we start walking the transfer branch.

> The distinction between $\sigma_i$ and $\sigma_i^2$ is one of the load-bearing ideas of this post. $\sigma_i$ is the **amplitude gain** (the linear stretch factor); $\sigma_i^2$ is the **energy weight** (the ruler in squared units). Whenever we talk about "energy" downstream, the units are $\sigma_i^2$.

# 2. SVD: Projecting x onto A's Orthogonal Basis

The energy map from §1 is static. Now bring in $x$ and put it to use — this is the SVD transfer branch.

Given an $x$, how is $Ax$ computed? A three-step pipeline:

1. **Decompose $x$**: project $x$ onto the orthogonal basis $V$, yielding non-interacting components $\langle v_i, x\rangle$.
2. **Scale**: multiply each component by $\sigma_i$ (the amplitude gain in that direction).
3. **Assemble $b$**: have $U=[u_1, u_2, \dots]$ reassemble the scaled components into the output space, giving $b$.

The whole pipeline in one line:

$$ Ax = \sum_i \sigma_i \,\langle v_i, x\rangle\, u_i $$

That is, the expansion coefficients of $b$ in the $U$ basis are exactly $\sigma_i \langle v_i, x\rangle$. This answers the opening puzzle about $A$ being unequal across directions — **$A$'s preferred directions are $V$, and the strength of the preference in each direction is $\sigma_i$**.

Once $x$ enters the picture, the $\sigma$ vs. $\sigma^2$ distinction comes into focus:

$$ \|Ax\|^2 = \sum_i \sigma_i^2 \,|\langle v_i, x\rangle|^2 $$

The system's energy response to $x$ is distributed across the energy directions according to $\sigma_i^2$ — exactly matching the intrinsic energy map of $A$ from §1.

Below, §3 through §6 walk further along this transfer branch, watching what engineering consequences this energy map produces.

# 3. Rank: Live and Dead Energy Directions

SVD says $A$ has a set of energy directions, but it does not say **all of them carry energy**. That is the question rank answers:

> $\text{rank}(A) = r$ is the **number of non-zero energy directions of $A$** — $r$ of the $\sigma_i$ are strictly positive and carry signal; the remaining $\sigma_i = 0$ are **zero-energy directions**.

In other words:

| Concept | Energy translation |
|---|---|
| **Column full rank** ($m \ge n$) | No zero-energy direction on the input side: any $x \ne 0$ produces a non-zero output; $\text{null}(A) = \{0\}$. |
| **Row full rank** ($m \le n$) | No zero-energy direction on the output side: every $b$ can be assembled from the existing energy directions; $\text{col}(A) = \mathbb{R}^m$. |
| **Square full rank** | No zero-energy direction on either side — $A$ is genuinely invertible. |
| **Rank-deficient** | There exist zero-energy directions — some $x$ directions "vanish on entry" (input-side zero-energy directions, corresponding to a non-trivial $\text{null}(A)$): the energy along those directions is swallowed by the $\sigma=0$ basis and never reaches $b$; alternatively, some $b$ values "never get reached" (output-side coverage gap). |

Looking back at the §1 phenomenon of "$\|Ax\|$ nearly zero in certain directions", we now have precise vocabulary: **those directions are heading toward zero-energy bases with $\sigma=0$**.

## The Four Fundamental Subspaces: Four Corners of the Energy Map

The table above has already quietly used $\text{null}(A)$ and $\text{col}(A)$. Let's now name all four: **under the energy lens, the four fundamental subspaces are simply $V$ and $U$ each cut in two along "$\sigma$ non-zero vs. $\sigma=0$"**.

Let $A = U\Sigma V^\top$ with $r = \text{rank}(A)$. Split $V$ into $V = [\,V_r\ \mid\ V_0\,]$ (the first $r$ columns correspond to $\sigma > 0$, the last $n-r$ correspond to $\sigma = 0$), and split $U$ similarly into $U = [\,U_r\ \mid\ U_0\,]$. Then:

| Subspace | SVD basis | Energy identity |
|---|---|---|
| **Row space** $\text{col}(A^\top)$ | $V_r$ | The **active directions** on the input side — energy can enter. |
| **Null space** $\text{null}(A)$ | $V_0$ | The **zero-energy directions** on the input side — energy disappears on entry. |
| **Column space** $\text{col}(A)$ | $U_r$ | The **active directions** on the output side — energy can reach here. |
| **Left null space** $\text{null}(A^\top)$ | $U_0$ | The **zero-energy directions** on the output side — energy never reaches here. |

The tidy orthogonal decomposition pops out in one line:

$$ \mathbb{R}^n = \underbrace{\text{col}(A^\top)}_{V_r} \oplus \underbrace{\text{null}(A)}_{V_0}, \qquad \mathbb{R}^m = \underbrace{\text{col}(A)}_{U_r} \oplus \underbrace{\text{null}(A^\top)}_{U_0} $$

So **both the input space and the output space get cut along "energy / zero-energy" by SVD**.

### The Null-Space Component Contributes Nothing to the Output

Any $x \in \mathbb{R}^n$ can be split as $x = x_{\text{row}} + x_{\text{null}}$, where $x_{\text{row}} \in \text{col}(A^\top)$ and $x_{\text{null}} \in \text{null}(A)$. Plug in:

$$ Ax = A\,x_{\text{row}} + \underbrace{A\,x_{\text{null}}}_{=\ 0} = A\,x_{\text{row}} $$

— **whatever portion of the input signal lands in the zero-energy basis is swallowed by $A$ and never participates in producing $b$**. This is the precise mathematical statement of the table's "some $x$ directions vanish on entry".

Symmetrically, the output $b$ can only land in $\text{col}(A)$; the $\text{null}(A^\top)$ portion of the output space is unreachable by $A$ — which is exactly why $Ax=b$ has no exact solution when $b \notin \text{col}(A)$ and forces us into least squares.

# 4. Condition Number: Energy Dynamic Range across Directions

Putting SVD and rank together, $A$'s "health" is really a **continuous spectrum**:

$$ \underbrace{\sigma = 0}_{\text{zero-energy direction (rank-deficient)}}\ \longrightarrow\ \underbrace{\sigma \approx 0}_{\text{near-dead (ill-conditioned)}}\ \longrightarrow\ \underbrace{\sigma \text{ moderate / large}}_{\text{healthy directions}} $$

The most common quantitative indicator on this spectrum is the **condition number**:

$$ \kappa(A) = \frac{\sigma_1}{\sigma_n} $$

It is **"strongest energy direction's gain / weakest energy direction's gain"** — strictly speaking, $\kappa$ is the **amplitude dynamic range**, and the corresponding **energy dynamic range** is $\kappa^2 = \sigma_1^2 / \sigma_n^2$. The two differ only by a square; below we use "energy dynamic range" as the intuition, with this in mind.

- $\kappa$ small: all directions are comparable, $A$ is "well-behaved".
- $\kappa$ large: the rich-vs-poor gap across directions is severe, $A$ is "ill-conditioned".
- $\kappa \to \infty$: at least one direction's $\sigma_i$ has hit zero, $A$ is rank-deficient.

So **rank deficiency is just the limiting case of ill-conditioning** — the same phenomenon at different intensities. This spectrum also foreshadows the next section: weak directions look harmless in forward transfer but bite hard on inversion.

# 5. Inversion $(A^TA)^{-1}$: Inverting the Energy

Now reverse direction: we observe $b$ and want to recover $x$. The classic least-squares solution (when $A$ is column full rank, i.e., the input side has no zero-energy direction) is

$$ x = (A^TA)^{-1}A^T b $$

Focus on $(A^TA)^{-1}$. Note $A^TA = V\Sigma^2 V^T$ — it is the symmetric version of the energy map from §1, an **energy meter that measures the energy $\sigma_i^2$ along each orthogonal direction**. Inverting it means:

> The inverse gain along direction $v_i$ is exactly $\dfrac{1}{\sigma_i^2}$.

**This is the whole story**: the small-$\sigma$ direction that was nearly silent in the forward pass becomes, after taking the reciprocal, a "noise-amplifying black hole". Suppose $\sigma_k = 10^{-5}$; the inverse gain becomes $\dfrac{1}{(10^{-5})^2} = 10^{10}$. The tiniest noise in that direction of $b$ gets multiplied by ten billion on its way into $x$.

Numerical instability, overfitting, ill conditioning — under the energy lens these are all the same thing: **inverting the energy makes weak directions explode**. (If $A$ is already rank-deficient with $\sigma_k = 0$, the inverse gain is straight-up infinity — that's the other end of the §4 spectrum.)

> A precise note: $1/\sigma_i^2$ is the **energy gain** at the $(A^TA)^{-1}$ step in direction $v_i$ — it amplifies the **variance** of noise (so the $10^{10}$ in the example is the energy factor). The full pseudo-inverse $A^+ = V\Sigma^+ U^\top$ from $b$ to $x$ has **amplitude gain** $1/\sigma_i$ in direction $v_i$ (i.e., $10^5$ in the same example) — the leading $A^\top$ contributes an extra $\sigma_i$ that "square-roots" the energy reciprocal into an amplitude reciprocal. The two differ only by a square, mirroring the $\sigma$ vs. $\sigma^2$ distinction this post keeps emphasizing.

# 6. Ridge: An Energy Floor across All Directions

L2 regularization (ridge regression / Tikhonov) is the cure for the explosion above. The fix is almost embarrassingly simple:

$$ x = (A^TA + \lambda I)^{-1}A^T b $$

Why does this rescue the situation? Because $\lambda I$ is a remarkably gentle perturbation — the identity matrix is diagonal in any orthogonal basis, so after adding $\lambda I$:

1. **Directions do not move an inch**: the original orthogonal energy directions $V$ stay put.
2. **Energy gets a floor**: in each direction, energy goes from $\sigma_i^2$ up to $\sigma_i^2 + \lambda$.

So the inverse gain $\dfrac{1}{\sigma_i^2}$ becomes

$$ \frac{1}{\sigma_i^2 + \lambda} $$

Watch how it tailors its response per direction:

- **Dominant direction** ($\sigma_i^2 = 1000$, $\lambda = 0.1$): gain $\dfrac{1}{1000.1} \approx \dfrac{1}{1000}$ — virtually unaffected.
- **Dangerous direction** ($\sigma_k^2 = 10^{-10}$, $\lambda = 0.1$): gain $\dfrac{1}{10^{-10}+0.1} \approx 10$ — from ten billion down to ten, brutally clamped.

## The Essence of Ridge: A Low-Pass Filter on the Singular Spectrum

Casting the ridge solution back into the SVD frame yields a particularly clean form:

$$ \hat{x}_{\text{ridge}} = V \cdot \mathrm{diag}\!\left(\frac{\sigma_i}{\sigma_i^2+\lambda}\right) U^T b $$

Compared to the plain least-squares pseudo-inverse $\hat{x}_{\text{LS}} = V \cdot \mathrm{diag}(1/\sigma_i) \cdot U^T b$, ridge equals an extra **filter factor** in each singular direction:

$$ f_i = \frac{\sigma_i^2}{\sigma_i^2 + \lambda} $$

Its behavior is textbook low-pass:

- $\sigma_i \gg \sqrt{\lambda}$: $f_i \to 1$ — components along strong energy directions pass essentially untouched.
- $\sigma_i \ll \sqrt{\lambda}$: $f_i \to 0$ — components along weak energy directions are softly suppressed (note: softly, not hard-thresholded).

In one line: **ridge is fundamentally a low-pass filter on the singular spectrum** — it keeps the high-energy, trustworthy directions and damps the low-energy, noise-dominated ones. It also incidentally rescues rank deficiency: even if $\sigma_i = 0$, the denominator still has $\lambda$ to hold things up, and nothing actually blows up.

## The Dimension of λ: A Noise Energy Floor

$\lambda$ is added directly to $\sigma_i^2$, so its dimension is **energy**. That means tuning $\lambda$ is not adjusting some abstract "penalty strength" — it is setting a **noise energy floor**:

> I consider any direction below the singular-value level $\sqrt{\lambda}$ untrustworthy, and treat it as noise.

This is why the choice of $\lambda$ in ridge naturally links to the noise level of the data and the condition number of the matrix — it has a physical meaning to begin with.

# 7. Gradient Descent: Dynamics on the Energy Map

§5-§6 solve $Ax=b$ **statically**. Switch the lens to dynamics — to **gradient descent**, the day-to-day workhorse for approximating the least-squares solution — and you see the same energy map running a different story.

## The Loss Is the Potential Energy

The least-squares loss $f(x) = \tfrac{1}{2}\|Ax - b\|^2$ is literally the $L^2$ energy this post has been talking about all along. Read it as a **height field** over the parameter space and it maps perfectly onto the **potential energy $U(x)$** of classical mechanics.

The GD update rule

$$ x_{t+1} = x_t - \eta\,\nabla f(x_t) $$

is exactly the conservative-force law $F = -\nabla U$ — **$-\nabla f$ is the push along the steepest downhill direction of the landscape**.

## Energy Dissipation along Trajectories

Write GD as a continuous-time gradient flow $\dot{x} = -\nabla f$, and the dissipation identity falls out immediately:

$$ \frac{d}{dt}f(x(t)) = \nabla f \cdot \dot{x} = -\|\nabla f\|^2 \le 0 $$

— **$f$ decreases monotonically along trajectories, at a dissipation rate equal to the squared gradient energy**. Energy dissipation in the Lyapunov sense; "water flows downhill" in parameter space.

## A One-line Duality: Inversion Blow-up vs. GD's Slow Convergence

Cast GD back into the SVD basis: each direction converges independently, at a rate proportional to $\sigma_i^2$ — **small-$\sigma$ directions move slowly**, and overall convergence is bottlenecked by the condition number $\kappa$.

Compare with §5: inversion takes the reciprocal of $\sigma_i^2$, and **small-$\sigma$ directions get amplified backward into noise black holes**.

> **Inversion blow-up (static) and slow GD convergence (dynamic) are two sides of the same energy map** — weak directions blast noise on the reverse path, and stall progress on the forward path. Ridge raises the smallest $\sigma^2$ and rescues both at once.

## Momentum = Adding Mass to the Ball

The vanilla GD so far is the **overdamped limit** in physics — a ball submerged in **extremely viscous honey**, with no inertia, taking one step and stopping. The learning rate $\eta$ corresponds to the reciprocal of the viscosity coefficient (thinner honey, longer single step).

**Momentum** gives the ball a **mass**: as it goes downhill, potential energy converts into **kinetic energy** that accumulates, letting inertia carry it across flat regions. In energy language: a back-and-forth exchange of **potential ↔ kinetic**. (**Adam** further introduces direction-wise scale adaptation — the RMSProp branch — so it is not "just adding mass"; here we only take its "add inertia" half.)

## Hook: Add Thermal Motion

If, on top of Momentum, the ball is given random kicks (**Brownian motion**), it becomes **Langevin dynamics** — corresponding in machine learning to the implicit noise of SGD, Langevin sampling, simulated annealing, and that whole family. But this line drifts away from "linear-algebra energy view" into statistical physics / Bayesian sampling, and is best saved for another post.

# 8. A Small Numerical Example: All Four in the Energy Basis

§5-§7 walked through inversion, Ridge, and gradient descent separately. This section places them side by side on **the same pair of $\sigma$**, in a minimal two-dimensional example, so you can see at a glance how the same energy map gets processed in four different ways.

Let $A$ have two singular values $\sigma_1 = 10$ and $\sigma_2 = 0.01$ (so condition number $\kappa = 1000$, energy dynamic range $\kappa^2 = 10^6$). Place the coordinate axes **directly on $A$'s two energy directions $v_1, v_2$** — at this moment, $A$ becomes diagonal:

$$ A = \begin{bmatrix} 10 & 0 \\ 0 & 0.01 \end{bmatrix} $$

The energy map sits clearly on the two axes: along $v_1$, energy $\sigma_1^2 = 100$; along $v_2$, energy $\sigma_2^2 = 10^{-4}$. Here is what each operation does on these two axes:

![Forward, inverse, Ridge, and gradient descent on the same energy spectrum](energy-spectrum-operations.svg)

*Same pair of $\sigma$ under four operations: forward squashes the weak direction, inverse amplifies it, Ridge clamps the amplification, GD gets stalled by it.*

**Forward $Ax$**: $(x_1, x_2) \mapsto (10\,x_1,\ 0.01\,x_2)$. The $v_2$ direction is nearly silent.

**Inverse $A^+ b$ (column full rank pseudo-inverse)**: $(b_1, b_2) \mapsto (b_1/10,\ 100\,b_2)$. The amplitude in $v_2$ is amplified 100×: a noise of 0.01 in $b$ along that direction becomes 1 in $x$.

**Ridge with $\lambda = 0.1$**: on each axis, $\hat{x}_i = \dfrac{\sigma_i}{\sigma_i^2 + \lambda} b_i$. Plug in:

$$ \hat{x}_1 = \frac{10}{100.1}\,b_1 \approx 0.0999\,b_1, \qquad \hat{x}_2 = \frac{0.01}{0.1001}\,b_2 \approx 0.0999\,b_2 $$

— the originally-100× amplification along $v_2$ is brutally clamped down to $\approx 0.1$, **just as gentle as the strong direction**.

**GD with step $\eta$**: contraction factor along each axis is $1 - \eta\sigma_i^2$:

- $v_1$: $1 - 100\,\eta$
- $v_2$: $1 - 10^{-4}\,\eta$

For the $v_1$ direction not to diverge, we need $\eta \lt 0.02$. Then the contraction factor along $v_2$ is at least $> 0.999998$ — **each step shrinks the $v_2$ error by at most two parts per million**. Reducing the $v_2$ error to $1/10$ of its original value takes about $10^6$ iterations, an astronomical number compared to the $v_1$ direction.

---

**One-glance summary**: with the same pair of $\sigma$, forward squashes $v_2$ to silence, inverse blows it into a 100× noise amplifier, Ridge defuses that bomb, and GD then stalls on it almost completely. **All four are simply different processings of the same energy map**.

# 9. PCA: Back to the Root, Reading A through Variance

§2 through §8 walked the **transfer branch** end to end: take the energy map from §1, bring in $U$, push $x$ through to get $b$ (or use GD to approximate $x$). **PCA takes the other path — it goes straight back to the energy map of §1, brings in no $x$ and computes no $b$, and treats $V$ and $\sigma_i^2$ themselves as the answer.**

At this moment the context quietly shifts: $A$ is no longer "the transfer matrix of a system" but a **data matrix** — each row is an observation $x^{(i)} \in \mathbb{R}^d$ and each column is a feature.

## Same $A^TA$, Two Identities

Mathematically, PCA uses exactly the same $A^TA = V\Sigma^2 V^T$ from §1. After centering the data, it is proportional to the **covariance matrix**:

$$ C = \frac{1}{n}A^TA = V \cdot \frac{\Sigma^2}{n} \cdot V^T $$

The eigendecomposition has exactly the same structure as the "energy meter" of §5 — only the physical identity of $\sigma_i^2$ has changed:

> Same $\sigma_i^2$, with its physical identity shifting from **"the gain energy of $A$ in direction $v_i$"** to **"the variance of the data along direction $v_i$"**.

A different story in the same language.

## What PCA Is Doing

PCA finds the few directions of largest variance — i.e., the few largest singular directions $v_1, v_2, \dots$ of $A$. The "spread" of the data along $v_i$ is proportional to $\sigma_i^2$. The direction of largest $\sigma_1^2$ is where the data **speaks the loudest**.

## Why "Variance" Deserves the Word "Energy": The Inner-Product / Norm View

Unpack "variance" and it is just an $L^2$ norm (modulo a factor of $n$). With data already centered and $v$ a unit direction,

$$ \text{Var}_v = \frac{1}{n}\|Av\|^2 = \frac{1}{n}\sum_{i=1}^n \langle x^{(i)}, v\rangle^2 $$

Reading this:

- $\langle x^{(i)}, v\rangle$ is the **inner product of the $i$-th sample with direction $v$** — the length of the sample's projection onto $v$.
- Summing the **squared inner products** of all samples = $\|Av\|^2$, which is exactly the squared $\ell^2$ norm of the sequence $\{\langle x^{(i)}, v\rangle\}_i$.

So **"large variance along $v$" = "samples broadly have large inner product with $v$" = "the $\ell^2$ energy of the data under the functional $\langle \cdot, v\rangle$ is large"**.

The equivalence chain **variance ↔ inner product ↔ energy** is the fundamental reason PCA earns the word "energy" from the start — it is, after all, a squared norm in a Hilbert space.

Look further at the covariance matrix itself:

$$ C_{jk} = \frac{1}{n}\langle A_{:,j}, A_{:,k}\rangle $$

each entry is an inner product between two feature column vectors — **the covariance matrix is just the Gram matrix of the data**. Finding PCA's top eigendirection is equivalent to solving

$$ \max_{\|v\|=1}\|Av\|^2 = \sigma_1^2 $$

a thoroughly natural optimization problem on an inner-product space — pushing the data's $L^2$ norm to its maximum along some direction.

This "inner product = energy" language was actually paved earlier in the [Born's rule post](../born-rule-autocorrelation-energy/) — the same Hilbert space showing up across different domains.

## Energy Retention in Dimensionality Reduction: Eckart–Young's Exact Payoff

PCA provides an **exact** energy interpretation for "dimensionality reduction". Project the data $A$ onto its top $k$ principal directions to get the best rank-$k$ approximation $A_k$ — how much do you lose? Eckart–Young gives a fully precise answer:

$$ \|A - A_k\|_F^2 = \sum_{i>k}\sigma_i^2 $$

— **the lost energy is exactly the sum of the discarded $\sigma_i^2$**, no more, no less. So we have a literal **energy retention ratio**:

$$ \eta(k) = \frac{\sum_{i\le k}\sigma_i^2}{\sum_i\sigma_i^2} $$

The engineering rule-of-thumb "keep 95% of the variance" is really choosing a $k$ such that $\eta(k) \ge 0.95$. This is the most direct, most satisfying payoff of the entire energy view: **you choose precisely how much energy to drop and how much to keep**.

## A Small Application: Separable Convolution Is Also Energy Retention

The retention ratio $\eta(k) = \sum_{i\le k}\sigma_i^2 / \sum_i \sigma_i^2$ above might look like it only lives in the "data dimensionality reduction" context. But the underlying math applies to any matrix. Here is an application that has nothing to do with data: **convolution kernels**.

A $3\times 3$ or $5\times 5$ convolution kernel $K$ is itself a small matrix, so it has its own SVD:

$$ K = \sum_i \sigma_i\, u_i v_i^\top $$

Each $u_i v_i^\top$ is a **rank-1 sub-kernel** (a column vector times a row vector). The energy retention ratio tells us: approximating $K$ with the top $k$ rank-1 sub-kernels loses exactly $\sum_{i>k}\sigma_i^2$ of the kernel's energy.

**The cleanest example**: the Gaussian kernel $G(x, y) = G(x) \cdot G(y)$ is naturally a tensor product — so it has **exactly one non-zero singular value**, rank 1. The retention ratio $\eta(1) = 100\%$, no energy loss. A Gaussian kernel can therefore be split exactly into two 1D convolutions.

The engineering payoff is called **separable convolution**: a $3\times 3$ convolution normally costs 9 multiplications per output point; split into "first vertical 1D, then horizontal 1D", it costs only $3+3=6$. A $k\times k$ kernel's cost drops from $O(k^2)$ to $O(k)$. This is the deepest mathematical source of depthwise separable convolution in MobileNet and its kin.

For non-strictly-rank-1 kernels (e.g., trained CNN weights), the top 1-2 singular values give an **approximately separable** version — keep 95% of the kernel's energy and gain several times the speed-up. The literal engineering form of "$\eta(k) \ge 0.95$".

> One disclaimer: the "kernel SVD" here treats the convolution kernel as a small matrix on its own — the energy basis $u_i, v_i$ depends on the specific $K$. This is different from the SVD of the **convolution operator** (whose energy basis is always the Fourier basis), the subject of a future convolution post.

# Closing

Threading the whole story:

> Behind $Ax=b$ sits an implicit "energy distribution map" — $A$ does not treat different input directions equally. **Eigendecomposition** draws this map explicitly: an orthogonal basis $V$ plus an energy distribution $\sigma_i^2$, sorted from large to small. This is the **common root** for everything that follows.
>
> Starting from this root, the post splits into two paths.
>
> The **transfer branch** brings in $U$ and projects $x$ onto $V$, scales by $\sigma_i$, and reassembles via $U$ — this is **SVD**. Walk a few more steps down this branch: live-vs-dead among energy directions is **rank**; the rich-vs-poor gap among the live ones is the **condition number**, and rank deficiency is just the limiting case of condition number going to infinity. **Inversion** $(A^TA)^{-1}$ takes the reciprocal of each direction's energy — weak directions thereby become noise-amplifying black holes; **Ridge** lays down an energy floor of thickness $\lambda$ across all directions, softly muzzling the weak ones' reverse-amplification power.
>
> Switch this path to the dynamics lens and it becomes **gradient descent**: the loss $\|Ax-b\|^2$ is literally the potential, the negative gradient is the push, and GD is Lyapunov-style energy dissipation. Each SVD direction converges independently, with a contraction factor $1 - \eta\sigma_i^2$ controlled by the energy directly — so **inversion blow-up (static) and slow GD convergence (dynamic) are two sides of the same energy map**; Ridge rescues both at once.
>
> The **description branch**, by contrast, brings in no $x$ and computes no $b$. It treats $A$ as a data matrix and reads the energy map through variance — this is **PCA**. The same $\sigma_i^2$ has its physical identity shifted from "gain energy" to "variance energy"; and since variance = inner product = squared $L^2$ norm, "keep 95% of the variance" is a literal energy retention ratio.
>
> Underneath the matrix toolbox's seemingly scattered operations, all of them are really doing one thing on the energy ruler — **identifying, preserving, and suppressing energy along different directions**.

# Extension: When $A$ Is a Convolution Matrix

Pushing this line one step further: if $A$ is not an arbitrary matrix but a **circular convolution matrix**, its energy coordinates become fixed to the **Fourier basis** — the singular values are the magnitudes of the frequency response $|\hat{h}_k|$, with the phase absorbed into the phase factor between the left and right bases.

At this point, Ridge's filter factor immediately becomes

$$ \frac{\hat{h}_k^*}{|\hat{h}_k|^2 + \lambda} $$

— word for word, the **Wiener filter**. In other words, **the Wiener filter is just Ridge in the Fourier basis**. The same duality, transplanted into the convolution setting, also brings along deconvolution blow-up, slow Landweber convergence, frequency-domain truncation filters, and the rest of that whole family. This line deserves its own post, saved as the main axis of the next blog.
