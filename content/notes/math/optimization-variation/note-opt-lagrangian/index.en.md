---
date: '2026-06-22T10:00:00+09:00'
draft: false
title: 'Optimization and Calculus of Variations: The Lagrangian Function and the Lagrange Operator'
summary: "Starting from unconstrained stationarity, this note builds the geometry of 'gradients must align' under an equality constraint, introduces the Lagrangian L(x,λ), abstracts 'build L and solve for stationarity' into a Lagrange operator, and bridges to the Euler–Lagrange equation of the calculus of variations."
description: "An introductory optimization-and-variation note: the gradient-alignment geometry of constrained optimization, Lagrange multipliers, the Lagrangian L(x,λ), viewing the stationarity system as a Lagrange operator, and the bridge to infinite-dimensional variation."
tags: ["Mathematics", "Optimization", "Calculus of Variations"]
categories: ["Notes"]
series: ["Optimization and Variational Methods"]
note_kind: "foundation"
aliases:
  - /notes/optimization-lagrangian-function-and-operator/
---

# Optimization and Calculus of Variations: The Lagrangian Function and the Lagrange Operator

This is a standalone note in Optimization and Calculus of Variations; its subject is the method of Lagrange multipliers for constrained optimization. First, the through-line of this note:

$$
\text{unconstrained stationarity}
\longrightarrow \text{constraint geometry (gradient alignment)}
\longrightarrow \text{Lagrangian function}
\longrightarrow \text{Lagrange operator}
\longrightarrow \text{variation: Euler–Lagrange}
$$

Key points:

- the first-order condition for an unconstrained optimum is $\nabla f=0$;
- with an equality constraint, $\nabla f$ is no longer zero but must be perpendicular to the constraint surface;
- the Lagrangian function rewrites a "constrained problem" as an "unconstrained stationarity problem";
- viewing "build the Lagrangian + solve for stationarity" as a single **operator**, whose zeros are the candidate optima;
- on a function space this operator becomes the Euler–Lagrange operator of the calculus of variations.

---

## 1. Unconstrained Optimization: The Stationarity Condition

The simplest setting: minimizing a smooth function $f$ over all of $\mathbb{R}^n$,

$$
\min_{x\in\mathbb{R}^n} f(x).
$$

If $x^*$ is a local minimum, then the directional derivative along any direction $v$ cannot make $f$ decrease further, which is equivalent to the first-order condition

$$
\nabla f(x^*)=0.
$$

A point with $\nabla f(x)=0$ is called a **stationary point**. Second-order information refines this: if the Hessian

$$
\nabla^2 f(x^*)\succeq 0
$$

(positive semidefinite), then $x^*$ is a candidate local minimum; strictly positive definite means a strict local minimum.

Conclusion: **unconstrained optimum $\Longrightarrow$ gradient is zero**.

---

## 2. Equality Constraints: Why You Cannot Simply Set $\nabla f=0$

Now suppose there is an equality constraint:

$$
\min_{x} f(x)\quad\text{s.t.}\quad g(x)=0.
$$

The feasible set is the surface $\{x:g(x)=0\}$. We may only move on this surface, and cannot freely descend along $-\nabla f$.

The key observation:

**At an optimum on the constraint surface, $\nabla f$ need not be zero, but its component along the tangent directions of the surface must be zero.**

Otherwise, if $\nabla f$ has a nonzero component along some tangent direction $v$, we could take a small step along the surface in the $-v$ direction, neither violating the constraint nor stopping $f$ from decreasing — contradicting optimality.

> An example: think of $f$ as the height of a mountain and the constraint $g(x)=0$ as a fixed path drawn on the ground that you must stay on. Where the path **crosses** a contour line, following it still climbs to a higher contour; only where the path is **tangent** to a contour do you reach the highest point on the path. And "tangent" means the two normals point the same way — $\nabla f$ is parallel to $\nabla g$. The next section makes this precise.

---

## 3. Gradient Alignment and the Lagrange Multiplier

First, one thing to get straight: **we take the gradient of the constraint $g$ not because we care about the value of $g$** — on the constraint surface $g$ is identically $0$ and never changes — **but because we need the normal direction of the constraint surface**. The gradient of any function is perpendicular to its own level sets; and the constraint $g=0$ is exactly one level set of $g$, so

$$
\nabla g\ \perp\ \{g=0\}.
$$

Height is $f$'s business; $\nabla g$ contributes only a **direction**, not a height. Picture finding the highest point along a fixed path $g=0$ on a mountain: on the path $g$ is always $0$, so there is no such thing as "the highest point of $g$"; what we want is the highest point of $f$ along the path, and the role of $\nabla g$ is to give the normal of that path.

Now translate the example into geometry. The **tangent space** of the constraint surface $g(x)=0$ at a point $x^*$ is

$$
T_{x^*}=\{v:\nabla g(x^*)^\top v=0\},
$$

i.e. the hyperplane orthogonal to $\nabla g(x^*)$. The conclusion of Section 2 is: the projection of $\nabla f(x^*)$ onto $T_{x^*}$ is zero, i.e. $\nabla f(x^*)\perp T_{x^*}$.

And the only direction orthogonal to the entire tangent space is the normal direction $\nabla g(x^*)$. Hence $\nabla f(x^*)$ must be parallel to $\nabla g(x^*)$:

$$
\nabla f(x^*)=-\lambda\,\nabla g(x^*).
$$

The scalar $\lambda$ is the **Lagrange multiplier**; the minus sign is just the customary way of moving it to the same side of the equation.

{{< details summary="Proof: gradients must be parallel at a constrained optimum" >}}

Let $x^*$ be a constrained minimum and $v$ any tangent vector at $x^*$, i.e. $\nabla g(x^*)^\top v=0$.

Take a smooth curve $\gamma(t)$ lying entirely on the constraint surface with $\gamma(0)=x^*,\ \gamma'(0)=v$ (such a curve exists when the constraint is non-degenerate). Along this curve $f(\gamma(t))$ attains a local minimum at $t=0$, so

$$
\left.\frac{d}{dt}\right|_{t=0} f(\gamma(t))
=\nabla f(x^*)^\top v=0.
$$

Since $v$ is an arbitrary tangent vector, $\nabla f(x^*)$ is orthogonal to the whole tangent space $T_{x^*}$.

The tangent space $T_{x^*}$ is the orthogonal complement of $\nabla g(x^*)$, and that complement can only be spanned by $\nabla g(x^*)$ (assuming $\nabla g(x^*)\neq 0$). Hence there is a scalar $\lambda$ with

$$
\nabla f(x^*)=-\lambda\,\nabla g(x^*).
$$

{{< /details >}}

Note the condition $\nabla g(x^*)\neq 0$: it guarantees the constraint surface is smooth at that point with a unique normal direction. This kind of "non-degeneracy" assumption will recur under the name **constraint qualification**.

---

## 4. The Lagrangian Function

The optimality from Section 3 is really two equations:

$$
\nabla f(x^*)+\lambda\,\nabla g(x^*)=0,
\qquad
g(x^*)=0.
$$

The first is gradient alignment, the second is feasibility. Can we **unify** them as "the stationary point of a single function"? Yes. Define the **Lagrangian function**

$$
L(x,\lambda)=f(x)+\lambda\,g(x),
$$

treating the multiplier $\lambda$ as another variable. Its partial derivatives:

$$
\frac{\partial L}{\partial x}=\nabla f(x)+\lambda\,\nabla g(x),
\qquad
\frac{\partial L}{\partial \lambda}=g(x).
$$

Setting both groups of partials to zero:

$$
\nabla_x L=0 \ \Longleftrightarrow\ \nabla f+\lambda\nabla g=0\quad(\text{gradient alignment}),
$$
$$
\frac{\partial L}{\partial\lambda}=0 \ \Longleftrightarrow\ g(x)=0\quad(\text{feasibility}).
$$

These are exactly the two equations of Section 3. In other words:

**The optimality conditions of constrained optimization $=$ the stationarity conditions of the Lagrangian $L(x,\lambda)$.**

Introducing $\lambda$ as a variable and "absorbing" the constraint into the objective looks like adding an unknown, but it actually turns "a constrained extremum" back into the familiar "unconstrained stationary point." That is the whole magic of the method of Lagrange multipliers.

---

## 5. The Lagrange Operator: Viewing "Build $L$ and Solve for Stationarity" as One Operator

Abstract the move of Section 4 one level further. Given $(f,g)$, what we do is: assemble $L=f+\lambda g$, then take the gradient with respect to all variables. This entire map can be packaged as an **operator** acting on $(x,\lambda)$ and outputting a vector-valued system:

$$
\mathcal{L}(x,\lambda)
:=\nabla_{(x,\lambda)}L
=\begin{pmatrix}
\nabla_x f(x)+\lambda\,\nabla_x g(x)\\[4pt]
g(x)
\end{pmatrix}.
$$

This $\mathcal{L}$ is the **Lagrange operator**. Its significance is that it translates an optimization problem into a **root-finding problem**:

$$
\boxed{\ \mathcal{L}(x,\lambda)=0\ }
$$

whose solution set is exactly all candidate points $(x^*,\lambda^*)$ satisfying the first-order optimality conditions. So "optimization" is replaced by "finding the zeros of an operator."

Advantages of this view:

- **Uniform**: equality constraints, inequality constraints, multiple constraints — all just change the components of $\mathcal{L}$; the root-finding framework stays the same.
- **Computable**: $\mathcal{L}(x,\lambda)=0$ is a (generally nonlinear) system that can be handed to Newton's method and the like; Newton's iteration uses exactly the Jacobian of $\mathcal{L}$, i.e. the bordered Hessian.
- **Generalizable**: replace $x$ from a finite-dimensional vector with a function and $\mathcal{L}$ becomes a differential operator — exactly the variation reached in Section 8.

> Terminology note: in the literature "the Lagrange operator" sometimes refers directly to the operation of introducing the multiplier term $\lambda$, or, in a variational context, to the Euler–Lagrange operator. This note consistently adopts the reading "the stationarity operator of $L$, $\nabla_{(x,\lambda)}L$," which connects the finite- and infinite-dimensional cases on one thread.

---

## 6. Multiple Constraints and Inequality Constraints (KKT)

With multiple equality constraints $g_1=\cdots=g_m=0$, each constraint gets its own multiplier and the Lagrangian becomes

$$
L(x,\lambda)=f(x)+\sum_{i=1}^m \lambda_i\,g_i(x)
=f(x)+\lambda^\top g(x),
$$

and the gradient-alignment condition becomes

$$
\nabla f(x^*)+\sum_{i=1}^m \lambda_i\,\nabla g_i(x^*)=0,
$$

i.e. $\nabla f$ lies in the subspace spanned by the constraint normals.

If there are also inequality constraints $h_j(x)\le 0$, the optimality conditions upgrade to the **KKT conditions**: beyond the stationarity of the Lagrangian $L=f+\lambda^\top g+\mu^\top h$, one additionally requires

$$
\mu_j\ge 0,\qquad \mu_j\,h_j(x^*)=0\ \ (\text{complementary slackness}).
$$

The intuition for complementary slackness: an inequality constraint is either "against the boundary" ($h_j=0$, where $\mu_j>0$ is allowed and it behaves like an equality constraint) or "slack in the interior" ($h_j\lt0$, where $\mu_j=0$ and the constraint is inactive). KKT will be covered later.

---

## 7. A Worked Example

Maximize a linear function on the unit circle:

$$
\max_{x,y}\ x+y
\quad\text{s.t.}\quad
x^2+y^2=1.
$$

<figure style="margin:1.2rem 0;text-align:center;">
<svg viewBox="0 0 680 500" role="img" style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto;font-family:inherit;" xmlns="http://www.w3.org/2000/svg">
<title>Gradient alignment for maximizing x+y on the unit circle</title>
<desc>Dashed lines are level sets of f = x+y; the solid circle is the constraint g = 0. At the optimum the path is tangent to a level set and the gradients are parallel and perpendicular to the tangent; at the bottom non-optimal point the gradient of f still has a component along the path, so one can keep climbing.</desc>
<defs>
<marker id="ahB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker>
<marker id="ahA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d97706"/></marker>
<marker id="tk" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker>
</defs>
<line x1="165" y1="250" x2="560" y2="250" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
<line x1="340" y1="420" x2="340" y2="86" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
<path d="M560,250 L551,245 L551,255 Z" fill="currentColor" fill-opacity="0.55"/>
<path d="M340,82 L335,91 L345,91 Z" fill="currentColor" fill-opacity="0.55"/>
<line x1="490" y1="246" x2="490" y2="254" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2"/>
<line x1="336" y1="100" x2="344" y2="100" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2"/>
<line x1="150" y1="180" x2="400" y2="430" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="160" y1="70" x2="520" y2="430" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="280" y1="70" x2="530" y2="320" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="372" y1="70" x2="530" y2="228" stroke="currentColor" stroke-opacity="0.65" stroke-width="1.8"/>
<circle cx="340" cy="250" r="150" fill="none" stroke="#0d9488" stroke-width="2.6"/>
<circle cx="340" cy="250" r="3" fill="currentColor" fill-opacity="0.55"/>
<line x1="296" y1="400" x2="384" y2="400" stroke="#94a3b8" stroke-width="2" marker-start="url(#tk)" marker-end="url(#tk)"/>
<line x1="340" y1="400" x2="382" y2="358" stroke="#2563eb" stroke-width="3" stroke-linecap="round" marker-end="url(#ahB)"/>
<circle cx="340" cy="400" r="4" fill="currentColor"/>
<circle cx="446" cy="144" r="4.5" fill="currentColor"/>
<line x1="446" y1="144" x2="494" y2="96" stroke="#2563eb" stroke-width="3" stroke-linecap="round" marker-end="url(#ahB)"/>
<line x1="455" y1="153" x2="503" y2="105" stroke="#d97706" stroke-width="3" stroke-linecap="round" marker-end="url(#ahA)"/>
<text x="60" y="92" fill="currentColor" font-size="12">level sets of f (dashed; ∇f ⊥ them)</text>
<text x="60" y="436" fill="currentColor" font-size="12">constraint g = 0 (the path, g ≡ 0)</text>
<text x="500" y="90" fill="#2563eb" font-size="14">∇f</text>
<text x="510" y="124" fill="#d97706" font-size="14">∇g</text>
<text x="540" y="146" fill="currentColor" font-size="12">optimum T</text>
<text x="540" y="166" fill="currentColor" font-size="12">(1/√2, 1/√2)</text>
<text x="540" y="186" fill="currentColor" font-size="12">∇f ∥ ∇g, ⊥ tangent</text>
<text x="392" y="402" fill="currentColor" font-size="12">path tangent</text>
<text x="388" y="356" fill="#2563eb" font-size="14">∇f</text>
<text x="150" y="474" fill="currentColor" font-size="12">non-optimal: ∇f has a component along the path → still climbing</text>
<text x="566" y="255" fill="currentColor" font-size="12" font-style="italic">x</text>
<text x="348" y="82" fill="currentColor" font-size="12" font-style="italic">y</text>
<text x="496" y="268" fill="currentColor" font-size="12">1</text>
<text x="350" y="110" fill="currentColor" font-size="12">1</text>
<text x="320" y="270" fill="currentColor" font-size="12">O</text>
<text x="420" y="166" fill="currentColor" font-size="12">T</text>
<text x="244" y="420" fill="currentColor" font-size="12">P (0, −1)</text>
</svg>
<figcaption style="font-size:0.9em;opacity:0.75;margin-top:0.4rem;">Figure: gradient alignment for max(x + y) on the unit circle — at the tangent point ∇f ∥ ∇g; at the non-optimal point ∇f still has a component along the path.</figcaption>
</figure>

{{< details summary="Solution: write the Lagrangian and solve the stationarity system" >}}

Take $f=x+y$, $g=x^2+y^2-1$; the Lagrangian is

$$
L(x,y,\lambda)=x+y+\lambda\,(x^2+y^2-1).
$$

The stationarity condition $\mathcal{L}=0$ gives three equations:

$$
\frac{\partial L}{\partial x}=1+2\lambda x=0,
\qquad
\frac{\partial L}{\partial y}=1+2\lambda y=0,
\qquad
\frac{\partial L}{\partial \lambda}=x^2+y^2-1=0.
$$

The first two give

$$
x=y=-\frac{1}{2\lambda},
$$

and substituting into the constraint:

$$
2x^2=1
\ \Longrightarrow\
x=\pm\frac{1}{\sqrt2}.
$$

So the two candidate points are

$$
\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right),
\qquad
\left(-\tfrac{1}{\sqrt2},-\tfrac{1}{\sqrt2}\right),
$$

with $f=\sqrt2$ and $f=-\sqrt2$ respectively. Taking the larger, the maximum is

$$
\max\ (x+y)=\sqrt2,\quad\text{attained at}\ \left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right).
$$

{{< /details >}}

Geometrically this is no surprise: the gradient of $x+y$ is the constant vector $(1,1)$, and its "farthest" point on the circle is where the outward normal of the circle points the same way as $(1,1)$, namely $\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right)$. The gradient alignment $\nabla f\parallel\nabla g$ is obvious in the figure.

{{< details summary="Gradient-alignment view: plug ∇f, ∇g in at the optimal and non-optimal points" >}}

The two gradients keep their shape throughout:

$$
\nabla f=(1,1),\qquad \nabla g=(2x,2y).
$$

**Optimum $T=\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right)$ (the tangent point in the figure):**

$$
\nabla f=(1,1),\qquad
\nabla g=(\sqrt2,\sqrt2)=\sqrt2\,(1,1).
$$

They are parallel, $\nabla f=\tfrac{1}{\sqrt2}\,\nabla g$. The circle's tangent direction there, $t=\tfrac{1}{\sqrt2}(1,-1)$, satisfies

$$
\nabla f\cdot t=\tfrac{1}{\sqrt2}(1-1)=0,
$$

i.e. along the path $f$ is stationary to first order — exactly a stationary point.

**Non-optimal point $P=(0,-1)$ (the bottom of the circle in the figure):**

$$
\nabla f=(1,1),\qquad \nabla g=(0,-2).
$$

These are not proportional, so not parallel. The tangent at the bottom is $t=(1,0)$, and

$$
\nabla f\cdot t=(1,1)\cdot(1,0)=1\neq 0,
$$

i.e. moving in $+x$ still increases $f$ — not yet at the top.

**Parametric cross-check (writing "moving along the path" as a function of one variable):** let $x=\cos\theta,\ y=\sin\theta$, then

$$
f(\theta)=\cos\theta+\sin\theta=\sqrt2\,\sin\!\left(\theta+\tfrac{\pi}{4}\right),
\qquad
\frac{df}{d\theta}=\sqrt2\,\cos\!\left(\theta+\tfrac{\pi}{4}\right).
$$

$\dfrac{df}{d\theta}=0$ iff $\theta=\tfrac{\pi}{4}$ ($T$, the maximum) or $\theta=\tfrac{5\pi}{4}$ (the minimum); at the bottom $\theta=-\tfrac{\pi}{2}$ we get $\dfrac{df}{d\theta}=1\neq0$, matching $\nabla f\cdot t=1$ above. This $\dfrac{df}{d\theta}$ is exactly $\nabla f\cdot(\text{tangent})$ — the two computations are the same thing.

**A note on signs:** the ratio $\mu=\tfrac{1}{\sqrt2}>0$ is the bare alignment ratio; under this note's convention $L=f+\lambda g$ we get $\lambda=-\mu=-\tfrac{1}{\sqrt2}$, exactly the $\lambda$ solved for in the stationarity system above. The geometry is the same; the sign is just a convention.

{{< /details >}}

---

## 8. Toward Variation: The Euler–Lagrange Operator

At this point the finite-dimensional story is complete. Finally, push it to infinite dimensions — this is the **variation** in Optimization and Calculus of Variations.

Replace the variable, from a vector $x\in\mathbb{R}^n$ to an entire function $y(\cdot)$, and the objective, from a function $f$ to a **functional**

$$
J[y]=\int_a^b L\big(x,\,y(x),\,y'(x)\big)\,dx,
$$

where $L$ is still called the Lagrangian (the reuse of the name is no coincidence). What we seek is the function $y$ that makes $J$ stationary.

Mirroring "gradient is zero" in finite dimensions, taking the **first variation** $\delta J=0$ of the functional and integrating by parts gives the stationarity condition

$$
\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}=0.
$$

The object on the left — acting on $L$ and outputting a differential equation in $y$ — is the **Euler–Lagrange operator**. Placing it side by side with the Lagrange operator of Section 5:

$$
\underbrace{\nabla_{(x,\lambda)}L=0}_{\text{finite-dim: algebraic system}}
\qquad\Longleftrightarrow\qquad
\underbrace{\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}=0}_{\text{infinite-dim: differential equation}}.
$$

They are **the same thing seen in different dimensions**: both are "finding the stationary point of the Lagrangian." The only difference is that in finite dimensions "differentiation" is the ordinary gradient and the zeros form an algebraic system; in infinite dimensions "differentiation" is variation and the zero is a differential equation. Everything that follows in the calculus of variations (geodesics, the brachistochrone, constrained variation and isoperimetric problems) is built on this operator.

> **Aside: why physics also has a "Lagrangian."** The most famous Lagrangian in physics is $L=T-V$ (kinetic minus potential energy). The principle of least action says the true trajectory makes the action $S=\int L\,dt$ stationary; taking the variation of $S$ and applying the Euler–Lagrange operator above directly yields the equations of motion — this is why analytical mechanics need not resolve forces one by one (energy is a scalar, with no direction to decompose). The status of the two $L$'s is not fully symmetric: in optimization it is $L$ **itself** that is made stationary, while in variation/physics it is the integral $\int L$ that is made stationary and $L$ is merely the integrand. The only commonality is that both are called the Lagrangian and both are the central object of a "make some scalar stationary" machine. This note does not develop the physics; a separate piece on least action / analytical mechanics is left for later.

---

## Summary

This note serves as the opening of Optimization and Calculus of Variations:

1. unconstrained optimum $\Longrightarrow \nabla f=0$; a constraint breaks this and forces a new tool;
2. under an equality constraint, at the optimum $\nabla f$ must be perpendicular to the constraint surface, i.e. parallel to $\nabla g$;
3. the parallelism introduces the Lagrange multiplier $\lambda$, written $\nabla f=-\lambda\nabla g$;
4. the Lagrangian $L=f+\lambda g$ absorbs the constraint into the objective, and the optimality conditions $=$ the stationarity conditions of $L$;
5. packaging "build $L$ and solve for stationarity" into the Lagrange operator $\mathcal{L}=\nabla_{(x,\lambda)}L$, optimization becomes finding the roots of $\mathcal{L}=0$;
6. multiple constraints become $\lambda^\top g$, and inequality constraints upgrade to KKT (complementary slackness);
7. replace the vector with a function and $f$ with the functional $J$, and the same operator becomes the Euler–Lagrange operator — the door to the calculus of variations.
