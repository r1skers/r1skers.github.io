---
date: '2026-04-16T15:10:00+09:00'
draft: false
title: 'A Small Nonlinear Least-Squares Experiment: Comparing the Trajectories of Three Optimization Methods'
summary: "Using a simple curve-fitting experiment to compare gradient descent, Newton's method, and Gauss-Newton on the same plot, focusing on how they move, how they converge, and where they finally stop."
description: "A nonlinear least-squares fitting experiment around y=a exp(bt), showing the objective function, update directions, convergence trajectories, and final results of gradient descent, Newton's method, and Gauss-Newton."
tags: ["Optimization", "Numerical Methods", "Least Squares", "Numerical Stability"]
categories: ["Posts"]
series: ["Optimization Methods"]
---

# Introduction

This article uses Python to run gradient descent, Newton's method, and Gauss-Newton on the same nonlinear least-squares problem, just to see how they actually move.

For the conceptual discussion, see the previous article:

- [Gradient Descent, Newton's Method, and Gauss-Newton: A Comparison of Three Optimization Methods](/en/posts/gradient-newton-gauss-newton/)

# The Problem Setup

The example here is a simple exponential curve-fitting problem:

$$
y = a e^{bt}
$$

The true parameters are set to

$$
\theta_{\text{true}} = [2.0,\,-1.3]
$$

Then observations are generated on a set of discrete time points with a small amount of noise added.  
The final goal is to recover the parameters

$$
\theta = [a,b]
$$

from the observed data so that the model prediction matches the observations as closely as possible.

# The Objective Function

This experiment is written as a standard nonlinear least-squares problem.  
The residual vector is defined as

$$
r(\theta)=a e^{bt}-y_{\text{obs}}
$$

and the corresponding objective function is

$$
f(\theta)=\frac12 \|r(\theta)\|^2
$$

This is also the most natural stage for Gauss-Newton.

In code, the core functions are collected in one shared module:

- `residual(theta)`: computes the residual vector
- `jacobian(theta)`: computes the Jacobian
- `objective(theta)`: computes $\frac12\|r(\theta)\|^2$
- `gradient(theta)`: computes the gradient $J^T r$
- `full_hessian(theta)`: computes the full Hessian
- `gauss_newton_matrix(theta)`: computes $J^T J$

So structurally, the experiment is actually very simple:  
all three methods share the same objective function, and only differ in what information they use to decide the next step.

# What the Three Methods Do in Code

## Gradient Descent

Gradient descent is the most direct one.  
It takes the gradient at the current point as the descent direction, then uses a simple backtracking line search to decide the step size.

The core idea is still the same one from the previous article:

$$
\Delta x = -\eta \nabla f(x)
$$

In this experiment, its main advantage is simplicity: it barely needs any additional structure. Its weakness is also obvious: when the objective valley is narrow and elongated, it tends to inch forward step by step.

## Newton's Method

Newton's method goes one step further by using full second-order information.  
That means it does not only look at the gradient; it explicitly computes the Hessian:

$$
\Delta x = -H(x)^{-1}\nabla f(x)
$$

If the Hessian is invertible and the local model is reliable enough, it can approach the minimizer very quickly.  
In this code, two simple safeguards are also added:

- If the Hessian is singular, fall back to the negative gradient direction
- If the computed direction is not a descent direction, also fall back to the negative gradient direction

So the Newton method here is not a completely bare version, but a small experimental version with basic protection.

## Gauss-Newton

Gauss-Newton takes advantage of the least-squares structure.  
Instead of using the full Hessian, it uses

$$
J^T J
$$

to approximate the local curvature, so the update becomes

$$
\Delta x = -(J^T J)^{-1}J^T r
$$

From the code point of view, it actually looks very similar to Newton's method:  
both solve a linear system first and then update with line search. The main difference is the matrix being solved.

So the most important contrast here is not that the implementations look different, but that:

- gradient descent uses only first-order information
- Newton's method uses full second-order information
- Gauss-Newton uses the most important second-order structure inside least-squares problems

## Code Snippets

<details>
<summary>Core code snippets</summary>

```python
def residual(theta: np.ndarray) -> np.ndarray:
    a, b = theta
    return a * np.exp(b * t_data) - y_obs


def jacobian(theta: np.ndarray) -> np.ndarray:
    a, b = theta
    exp_term = np.exp(b * t_data)
    return np.column_stack((exp_term, a * t_data * exp_term))


def objective(theta: np.ndarray) -> float:
    r = residual(theta)
    return 0.5 * float(r @ r)


def gradient(theta: np.ndarray) -> np.ndarray:
    j = jacobian(theta)
    r = residual(theta)
    return j.T @ r
```

This part defines the shared least-squares structure of the whole experiment: residual, Jacobian, objective function, and gradient.

```python
def gradient_descent(x0: np.ndarray, max_iter: int = 30, tol: float = 1e-8):
    x = x0.astype(float).copy()

    for _ in range(max_iter):
        grad = gradient(x)
        obj = objective(x)

        if float(np.linalg.norm(grad)) < tol:
            break

        step_size = 1.0
        while step_size > 1e-8:
            trial = x - step_size * grad
            if objective(trial) <= obj - 1e-4 * step_size * float(grad @ grad):
                break
            step_size *= 0.5

        x = x - step_size * grad

    return x
```

Gradient descent is the most direct: use the negative gradient as the direction, then control the step size with backtracking line search.

```python
def newton_method(x0: np.ndarray, max_iter: int = 30, tol: float = 1e-8):
    x = x0.astype(float).copy()

    for _ in range(max_iter):
        grad = gradient(x)
        obj = objective(x)

        if float(np.linalg.norm(grad)) < tol:
            break

        hessian = full_hessian(x)
        try:
            direction = np.linalg.solve(hessian, -grad)
        except np.linalg.LinAlgError:
            direction = -grad

        if float(grad @ direction) >= 0.0:
            direction = -grad

        step_size = 1.0
        while step_size > 1e-8:
            trial = x + step_size * direction
            if objective(trial) <= obj + 1e-4 * step_size * float(grad @ direction):
                break
            step_size *= 0.5

        x = x + step_size * direction

    return x
```

The core of Newton's method is still solving a linear system defined by the full Hessian, but this experiment version also adds fallback and line search so that the demo behaves more robustly.

```python
def gauss_newton(x0: np.ndarray, max_iter: int = 30, tol: float = 1e-8):
    x = x0.astype(float).copy()

    for _ in range(max_iter):
        grad = gradient(x)
        obj = objective(x)

        if float(np.linalg.norm(grad)) < tol:
            break

        normal_matrix = gauss_newton_matrix(x)
        try:
            direction = np.linalg.solve(normal_matrix, -grad)
        except np.linalg.LinAlgError:
            direction = -grad

        if float(grad @ direction) >= 0.0:
            direction = -grad

        step_size = 1.0
        while step_size > 1e-8:
            trial = x + step_size * direction
            if objective(trial) <= obj + 1e-4 * step_size * float(grad @ direction):
                break
            step_size *= 0.5

        x = x + step_size * direction

    return x
```

Gauss-Newton looks very similar to Newton's method, except that it replaces the full Hessian with the approximation $J^T J$; in this implementation, it also uses the same fallback and line-search logic.
</details>

# Final Result Figure

The figure below is the summary plot produced by the script:

![Comparison of the three optimization methods](nonlinear_least_squares_method_comparison_summary.png)

It contains four parts:

1. Top-left: the final fitted curves from the three methods, compared with the observed data and the true curve
2. Top-right: how the objective decreases with iteration
3. Bottom-left: the trajectory in parameter space
4. Bottom-right: a compact numerical summary

# Numerical Results

The script prints the following summary:

- true theta = `[2.0, -1.3]`
- initial guess = `[0.9, -0.2]`
- noise sigma = `0.05`

The final results are:

| Method | Iterations | Final objective | Parameter error | Final parameters |
| --- | ---: | ---: | ---: | --- |
| Gradient Descent | 30 | $2.04401933\times 10^{-2}$ | $1.66158098\times 10^{-2}$ | $[1.9852,\,-1.2925]$ |
| Newton | 4 | $2.04401933\times 10^{-2}$ | $1.66158150\times 10^{-2}$ | $[1.9852,\,-1.2925]$ |
| Gauss-Newton | 4 | $2.04401933\times 10^{-2}$ | $1.66158167\times 10^{-2}$ | $[1.9852,\,-1.2925]$ |

So in this example, all three methods end up converging to almost the same place.  
The real difference is not whether they get there, but how long it takes and how they move along the way.

# Reading the Figure

## 1. The final fits are very similar

Start with the top-left data-fit panel.  
The final fitted curves from all three methods nearly overlap, and all of them are very close to the true curve.  
That means under this experiment setup, all three methods can recover the parameters reasonably well.

## 2. The objective decreases at very different speeds

The top-right objective-decrease panel makes the difference much clearer.

- Gradient descent decreases the objective the slowest
- Newton and Gauss-Newton reach essentially the same level in only a few steps

This matches the intuition from the conceptual article:

- gradient descent only knows the steepest local descent direction
- Newton and Gauss-Newton both see some form of local curvature

So they are not just moving faster; they are moving more intelligently.

## 3. The parameter trajectory is the most visual part

The bottom-left parameter-trajectory panel is probably the most intuitive one.

- Gradient descent follows a more curved and slower path, with that familiar “creeping along” feeling
- Newton takes larger and more direct steps
- Gauss-Newton follows a path very close to Newton, but its structure comes from $J^T J$

So this figure turns the difference between methods from an abstract formula into an actual path.

## 4. Gauss-Newton is almost as fast as Newton here

This is actually worth noticing.  
It shows that in this simple residual-based problem, Gauss-Newton already captures the most important local structure. So even without explicitly computing the full Hessian, it can behave very similarly to Newton's method.

That is exactly why Gauss-Newton is so common in nonlinear least-squares problems.  
It is not the most general method, but in its home territory it is very effective.

# Limits of This Demo

The goal of this demo is not to prove that one method is always the best.  
It only uses a very small example to make the typical differences between the three methods visible.

So it also has clear limits:

- the problem dimension is very low, with only two parameters
- the initial guess is not especially bad
- the residual structure is fairly clean
- the noise is also small

Under those conditions, it is not surprising that both Gauss-Newton and Newton perform well.  
If the problem were more ill-conditioned, the initialization worse, the noise larger, or the Hessian less stable, the outcome could look very different.

# Conclusion

This whole set of figures is really trying to say just one thing:

**All three methods solve the same optimization problem, but they use local information differently, and that is why they trace out very different paths.**

In this small experiment:

- gradient descent is the simplest, but also the slowest
- Newton's method is the most complete, but also the heaviest
- Gauss-Newton uses the least-squares structure and, in this setting, achieves almost the same speed as Newton
