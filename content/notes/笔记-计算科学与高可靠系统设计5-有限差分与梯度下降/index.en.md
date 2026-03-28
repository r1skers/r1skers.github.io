---
date: '2026-03-01T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 5:  Finite-Difference Gradients and Gradient Descent'
summary: "Starting from observations, this part turns blockwise κ into a parameter vector, estimates gradients with finite differences, and uses gradient descent to reduce the objective step by step."
description: "Part 5 on finite-difference gradients and gradient descent for blockwise parameter inversion."
tags: ["PDE", "Inverse Problem", "Finite Difference", "Gradient Descent", "Parameter Inversion", "Reliability"]
categories: ["Crucible"]
---

# Computational Science & High-Reliability Systems Design Part 5: Parameter Inversion I: Finite-Difference Gradients and Gradient Descent

This is where inversion really starts to move.  
We first use finite differences to approximate the gradient of the objective with respect to the parameters, and then use gradient descent to update $\kappa$ step by step.

The main line is:

observation is given -> define the objective -> estimate gradients with finite differences -> update parameters with gradient descent.

---

## 1. Restating the Problem

By this point, what we have is no longer the full truth trajectory, but a finite, sparse, and noisy set of observations.  
So the actual question in this part is: how do we start from these observations and infer the parameter $\kappa$ that controls terrain evolution?

Because the parameter field is too complex to invert directly, we do not work with the full-resolution field $\kappa(x,y)$ right away.  
Instead, we divide the domain into a $4\times4$ block structure.

This turns the original parameter field into a 16-dimensional parameter vector:

$$
p=(p_1,p_2,\dots,p_{16})
$$

Each $p_i$ corresponds to the $\kappa$ value of one block.  
This does not magically make the problem easy. It simply turns an overly flexible unknown field into a parameter vector that can actually be optimized.

Since questions of reliability, error, and identifiability still remain after parameter recovery, this part only focuses on the first step:  
**how to use finite differences and gradient descent to obtain a parameter combination that makes the objective as small as possible.**

## 2. Why We Need the Gradient Here

The gradient discussed here is no longer the spatial gradient of the terrain field from Part 2.  
What matters now is the gradient of the objective with respect to the parameters.

In other words, we are no longer asking "where is the terrain steeper?" but:

**if the parameters change slightly, in which direction does the objective move?**

If we write the objective as

$$
J(p)
$$

then it represents the total mismatch between prediction and observation when the parameters take the current value $p$.  
We want this mismatch to be as small as possible, because that means the forward model is producing results closer to the observations.

So inversion is not about directly "reading off" the parameters.  
It is about continuously adjusting the parameters so that the objective goes down.

From this perspective, the gradient tells us:

- which parameter directions are more sensitive;
- whether increasing one parameter makes the objective larger or smaller;
- which direction around the current parameter point is more likely to reduce the mismatch.

So in this part, the gradient is essentially a local slope in parameter space.  
And what we really want to do is update these 16 parameters step by step in a direction that makes $J(p)$ smaller.

## 3. Parameter Adjustment

Once the optimization object has become a 16-dimensional parameter vector, "adjusting the parameters" simply means figuring out which direction each blockwise $\kappa$ should move.

The most direct idea is to perturb one dimension at a time while keeping the others fixed.  
For example, if we only look at the first parameter $p_1$, then we keep

$$
p=(p_1,p_2,\dots,p_{16})
$$

with the other 15 parameters unchanged, and only perturb $p_1$ slightly:

$$
p_1 \rightarrow p_1 + \varepsilon
$$

Then we rerun the forward model and evaluate the objective again.  
If the new objective becomes larger, increasing this parameter is not helpful; if it becomes smaller, increasing this parameter is favorable.

So for the $i$-th parameter, we can approximate the corresponding partial derivative by finite differences:

$$
\frac{\partial J}{\partial p_i}
\approx
\frac{J(p+\varepsilon e_i)-J(p)}{\varepsilon}
$$

Here $e_i$ is the unit vector in the $i$-th direction, meaning that only the $i$-th parameter is changed while all others stay fixed.

If we do this for all 16 parameters, we obtain 16 partial derivatives.  
Putting them together gives the gradient vector around the current parameter point:

$$
\nabla J(p)=
\left(
\frac{\partial J}{\partial p_1},
\frac{\partial J}{\partial p_2},
\dots,
\frac{\partial J}{\partial p_{16}}
\right)
$$

This is not the final answer. It is a local navigation map.  
It tells us:

- which block parameters are more sensitive;
- whether increasing one parameter makes the objective larger or smaller;
- which overall direction near the current parameter point is more likely to reduce the mismatch.

In the project implementation, this step mainly corresponds to the finite-difference gradient estimation in `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py`.

## 4. Gradient Descent

Once we have the gradient, the question is no longer "which direction is sensitive?" but "how do we actually update the parameters?"

The most basic update is gradient descent:

$$
p^{(k+1)} = p^{(k)} - \eta \nabla J\bigl(p^{(k)}\bigr)
$$

This can be read directly as:

- $p^{(k)}$ is the current parameter vector;
- $\nabla J\bigl(p^{(k)}\bigr)$ is the gradient at the current parameter point;
- $\eta$ is the learning rate;
- $p^{(k+1)}$ is the updated parameter vector for the next iteration.

The key idea is that the gradient points toward the direction of steepest increase of the objective, while we want the objective to decrease, so we move along the negative gradient direction.  
The learning rate $\eta$ controls how large that step is.

If the learning rate is too small, every update is very conservative, so the objective may decrease but only very slowly.  
If it is too large, the parameters may jump too far and overshoot the locally good region, which can cause oscillation or even make the objective worse.

So the meaning of gradient descent here is quite simple:  
**first use finite differences to measure the local slope around the current parameter point, then take a small step in the negative-gradient direction.**

By repeating the loop

objective evaluation -> gradient estimation -> parameter update

we obtain the most basic inversion iteration process:

$$
p^{(0)} \rightarrow p^{(1)} \rightarrow p^{(2)} \rightarrow \cdots
$$

What we hope to get in the end is a parameter combination that makes the objective as small as possible.  
That means, under the current observations and the current objective definition, this parameter set explains the data best.

One point is worth keeping in mind already:

**a smaller objective does not automatically mean that the true parameters have been fully recovered.**

When observations are sparse, parameters are coupled, or the problem is ill-conditioned, many different parameter combinations may yield very similar objective values.  
So this part deliberately stops at how inversion begins to iterate, while the deeper questions of reliability, identifiability, and stability can be discussed later.
