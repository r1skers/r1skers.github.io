---
date: '2026-04-13T18:10:00+09:00'
draft: false
title: 'Gradient Descent, Newton''s Method, and Gauss-Newton: A Comparison of Three Optimization Methods'
summary: "A comparison of gradient descent, Newton's method, and Gauss-Newton from the perspective of local approximation and update directions, explaining what information each method uses, why their convergence behavior differs, and what kinds of problems they fit best."
description: "An intuition-first comparison of three optimization methods, from first-order information to second-order curvature and least-squares structure."
tags: ["Optimization", "Gradient Descent", "Newton's Method", "Gauss-Newton", "Least Squares", "Numerical Methods"]
categories: ["Posts"]
---

# Introduction

When optimizing an objective function, we usually need to update parameters repeatedly. Since the behavior of the objective can be quite complicated, we rarely reach a good solution by simply “making the parameters larger or smaller.” That is why we use methods such as gradient descent, Newton's method, and their extensions to update parameters in a more systematic way. This article places these methods on the same line of thought and compares them directly.

# Core Idea

**At a fundamental level, all of them build a local approximation. The real difference is how crude, how expensive, and how clever that approximation is.**

# 1. The Optimization Problem

Objective:

$$
\min_x f(x)
$$

This naturally leads to the idea of a *local model*:

- In most practical problems, we do not have a closed-form solution, so we must update iteratively.
- An iterative method is ultimately answering one question: where should the next step go?


# 2. Gradient Descent: First-Order Information

Update rule:

$$
x_{k+1}=x_k-\eta \nabla f(x_k)
$$

Here, $\nabla f(x_k)$ is the gradient of the objective at the current point, which means the steepest local ascent direction. Once we put a minus sign in front of it, $-\nabla f(x_k)$ becomes the most direct descent direction. The learning rate $\eta$ then determines how far we move along that direction.

Intuitively, you can think of this as “walking downhill blindfolded.” We do not know the full shape of the mountain, but we can still feel which direction slopes downward the fastest under our feet. So we take one step in that direction, then re-evaluate the slope at the new point, and repeat until we get close to the bottom.

# 3. Newton's Method: Bringing in Local Curvature

Now consider the second-order Taylor expansion of the objective:

$$
f(x_k+\Delta x)\approx f(x_k)+\nabla f(x_k)^T\Delta x+\frac12 \Delta x^T H(x_k)\Delta x
$$

We can view the right-hand side as a local quadratic model:

$$
m_k(\Delta x)=f(x_k)+\nabla f(x_k)^T\Delta x+\frac12 \Delta x^T H(x_k)\Delta x
$$

Newton's method is much more aggressive than gradient descent. Instead of taking a small step downhill, it tries to jump directly to the minimum of this local quadratic model. In other words, it does not only use slope information; it also uses local curvature.

To minimize this local model, we set its derivative with respect to $\Delta x$ to zero:

$$
\nabla m_k(\Delta x)=\nabla f(x_k)+H(x_k)\Delta x=0
$$

This gives the Newton direction:

$$
H(x_k)\Delta x=-\nabla f(x_k)
$$

If the Hessian is invertible, this becomes

$$
\Delta x=-H(x_k)^{-1}\nabla f(x_k)
$$

The update is then

$$
x_{k+1}=x_k+\Delta x
$$

If we step back to the one-dimensional case, this reduces to the familiar form

$$
\Delta x=-\frac{f'(x_k)}{f''(x_k)}
$$


# 4. Gauss-Newton: A Structured Approximation for Least Squares

Gauss-Newton focuses on least-squares problems, where the goal is still to reduce the objective:

$$
\min_x \frac12 \|r(x)\|^2
$$

Here, $r(x)$ is the residual vector between observations and model predictions.

Start from a general first-order relation:

$$
\Delta f(x)=\nabla f(x)^T\Delta x
$$

For a least-squares problem, the first-order change of the residual satisfies $dr\approx J\,dx$, so the first-order change of the objective can also be written as

$$
\Delta f \approx r^T J \Delta x =(J^T r)^T \Delta x
$$

Comparing this with

$$
\Delta f(x)=\nabla f(x)^T\Delta x
$$

we obtain

$$
\nabla f(x)=J(x)^T r(x)
$$

This is an important structural fact: in least-squares problems, the gradient is the Jacobian transpose multiplied by the residual.

Now we move to the core derivation of Gauss-Newton. First, linearize the residual:

$$
r(x_k+\Delta x)\approx r_k + J_k \Delta x
$$

Then the objective becomes

$$
f(x_k+\Delta x)\approx \frac12 \|r_k + J_k \Delta x\|^2
$$

At this point we already have a local quadratic model. Just as in Newton's method, we differentiate it with respect to $\Delta x$ and set the first derivative to zero. This gives the **Gauss-Newton equation**:

$$
J_k^T J_k \Delta x = -J_k^T r_k = -\nabla f(x_k)
$$

$$
\Delta x = -(J_k^T J_k)^{-1} \nabla f(x_k)
$$

# 5. Where Do They Actually Differ?

The previous sections explained where the three methods come from. At this point, we can finally place them side by side. Their most visible differences really do fall into the same dimensions that kept appearing throughout the derivations: how much information they use, how much each step costs, how accurate the local model is, and what kinds of problems they are best suited for.

| Method | Information used | Cost per step | Local accuracy | Best suited for | Common issues |
| --- | --- | --- | --- | --- | --- |
| Gradient descent | First-order gradient $\nabla f$ | Lowest | Coarsest | General optimization, large-scale problems | Slow convergence, sensitive to step size |
| Newton's method | Gradient + Hessian | Highest | Most accurate | Low-to-medium dimensional problems where second-order information is available | Hessian is expensive, may not be positive definite |
| Gauss-Newton | Jacobian $J$, with $J^T J$ as a Hessian approximation | In between | More refined than gradient descent, but weaker than full Newton | Least-squares and residual-based problems | Relies on residual structure; may still be unstable with poor initialization |

Gradient descent has a very direct advantage: as long as we can compute a gradient, we can start. That makes it easy to implement, broadly applicable, and especially suitable for high-dimensional large-scale problems. The price is that it uses very little local information, so in narrow valleys or ill-conditioned problems it can feel like inching forward one step at a time.

Newton's method is the opposite. It also uses local second-order curvature, so in ideal situations it can approach an optimum much faster, especially near the solution. But that extra intelligence is not free: computing, storing, and inverting the Hessian is expensive, and the Hessian itself may fail to be positive definite, which means the computed direction is not always a descent direction.

Gauss-Newton sits in between. It does not only look at slope, like gradient descent, and it does not fully consume the Hessian, like Newton's method. Instead, it uses the least-squares structure to approximate local curvature through $J^T J$. That is why it can often move more intelligently than gradient descent in residual-based problems while still being cheaper than full Newton.
