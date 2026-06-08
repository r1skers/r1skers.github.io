---
date: '2026-03-29T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 7: From Finite-Difference Gradient Descent to L-BFGS and Log-Parameterization'
summary: "Part 5 already makes inversion run, but parameter constraints, step-size control, and convergence behavior are still rather crude. This part explains why we switch from optimizing κ directly to optimizing log κ, and why the solver is upgraded to L-BFGS-B."
description: "Part 7 on log-parameterization and L-BFGS-B for more stable blockwise kappa inversion."
tags: ["PDE", "Inverse Problem", "Optimization", "L-BFGS-B", "Log Parameterization", "Kappa", "Reliability"]
categories: ["Crucible"]
aliases:
---

# Computational Science & High-Reliability Systems Design Part 7: From Finite-Difference Gradient Descent to L-BFGS and Log-Parameterization

Part 5 already made inversion truly run:  
we wrote blockwise $\kappa$ as a parameter vector, estimated gradients with finite differences, and then used gradient descent to reduce the objective step by step.

But by Part 6 we had already seen that  
**being able to run does not yet mean that the solver is natural, stable, or trustworthy.**

So the question of Part 7 is:

**if the baseline inversion already works, why do we still need to upgrade both the parameterization and the optimizer?**

---

## 1. Why the Part 5 Method Is Not Enough

The finite-difference plus gradient-descent method in Part 5 is a very useful baseline.  
It builds the essential inversion loop:

- propose a candidate parameter set;
- rerun the forward model;
- compare prediction against observation;
- estimate the gradient;
- update the parameters.

That is already enough to make inversion move.  
But it still has several practical limits.

First, it is sensitive to the learning rate.  
If the step is too small, convergence is slow; if the step is too large, the iteration may oscillate, cross the feasible range, or even make the objective worse.

Second, the treatment of parameter bounds is rather mechanical.  
In this project, $\kappa$ has both lower and upper bounds, and physically it must also satisfy $\kappa>0$.  
If we optimize $\kappa$ directly, every update has to be followed by an extra legality check.

Finally, the search strategy is still quite primitive.  
Gradient descent only knows which local direction goes downhill.  
When parameters are coupled, or when different directions have very different scales, this kind of update quickly becomes clumsy.

So Part 7 is not a rejection of Part 5.  
It is the natural next step once the baseline is already working:

**how do we make the solver itself more reasonable?**

## 2. The First Upgrade Is Not the Objective, but the Parameter Representation

The first thing to improve is usually not the objective itself, but how the parameter is represented.

In the project, the actual physical parameter sent into the PDE is the diffusivity $\kappa$.  
Since it represents a local diffusion strength, it is normally required to satisfy

$$
\kappa > 0
$$

If we optimize $\kappa$ directly, then every update may push it into an unnatural region.  
For example, if one block already has a small value and the learning rate is large, an update of the form

$$
\kappa^{(k+1)}=\kappa^{(k)}-\eta \nabla J
$$

may easily move it into the negative range.  
We can clip it back afterward, but that is more like "free update first, repair later."

So instead of patching $\kappa$ after each step, a more natural idea is to replace the optimization variable itself.

## 3. Switching from Optimizing $\kappa$ to Optimizing $m=\log \kappa$

The key conceptual switch in this part is to replace $\kappa$ by

$$
m=\log \kappa
$$

so that the actual physical parameter entering the forward model becomes

$$
\kappa=e^m
$$

The most direct benefit is obvious:  
no matter what value $m$ takes, $e^m$ is always positive.

So the logic changes from

- directly optimize $\kappa$ and then separately maintain positivity,

to

- optimize $m$, while positivity is already built into the parameterization itself.

This matters for more than just preventing negative values.  
It makes the optimization space better aligned with the structure of the physical parameter.

If we update directly in $\kappa$-space, the same absolute increment does not mean the same thing at different scales.  
For instance:

- $0.2 \rightarrow 0.4$ is a doubling,
- $1.0 \rightarrow 1.2$ is only a mild increase.

In the original space they may both look like "adding 0.2," but physically they are not comparable in the same way.

In log-space, the optimizer behaves more like it is handling relative changes rather than absolute ones.  
That usually makes the search more balanced and more suitable for a strictly positive coefficient such as diffusivity.

So the real conceptual change is:

**instead of forcing updates directly in physical-parameter space, we first optimize in a space that is more natural for optimization, and only then map back to the physical space.**

## 4. Why the Solver Then Switches from Gradient Descent to L-BFGS-B

Once the parameter space has been written in a more natural way, the next question becomes:

**should we still continue with the most basic gradient-descent solver in that new space?**

The gradient descent from Part 5 knows the current local slope.  
It tells us:

- which direction increases the objective,
- which direction decreases it.

But it still depends heavily on manually chosen learning rates, decay factors, and line-search behavior.  
In other words, it is roughly saying:

"I know which way is downhill, but how far I should step and how the valley is shaped still has to be figured out manually."

L-BFGS-B tries to do more than that.  
It does not only look at the current gradient.  
It also uses the history of how the parameters and gradients changed in recent iterations in order to approximate the local curvature of the objective.

So the difference can be summarized roughly as:

- gradient descent mainly knows "which way is lower right now";
- L-BFGS-B also tries to infer the local shape of the valley from recent history.

That usually makes it better at choosing both directions and step sizes.  
And the `B` in its name indicates that it also handles box bounds explicitly.

So the two upgrades divide naturally:

- `log(\kappa)` makes the variable space more appropriate,
- `L-BFGS-B` searches that space more systematically.

## 5. How This Change Is Implemented in the Project

In the project, this upgrade mainly corresponds to

`01_inversion_kappa_field/scripts/invert_kappa_block_lbfgs_log.py`

Compared with the earlier finite-difference version, the script does not turn inversion into a completely different problem.  
Much of the structure remains the same:

- observations still come from the same truth trajectory after truncation;
- the forward model is still the same variable-$\kappa$ PDE;
- the objective is still observation mismatch plus optional regularization terms;
- gradients are still required.

What really changes is how the parameter is represented and how the gradient is used to update it.

The script first maps

$$
\kappa_{\min},\ \kappa_{\max}
$$

to

$$
\log \kappa_{\min},\ \log \kappa_{\max}
$$

and performs the optimization in $m$-space.  
So the bounds are no longer applied directly to $\kappa$, but to $\log \kappa$.

Then the script passes the objective, the gradient, and these bounds together into  
`scipy.optimize.minimize(..., method="L-BFGS-B")`.  
So this is not handing the problem to a mysterious black box,  
but handing a clearly defined optimization problem to a standard solver that carries out the iterations systematically.

So Part 7 is not about replacing thought with a library call.  
It is about **starting to use a standard optimization algorithm as a reusable solver framework**.

## 6. What This Upgrade Really Changes

By this point, the meaning of the switch can be compressed into three layers.

First, positivity and box constraints are handled in a more natural way.  
Before, we updated $\kappa$ directly and then repaired invalid values afterward.  
Now we optimize in $m$-space and recover a legal $\kappa$ by construction.

Second, the search strategy is upgraded from a plain downhill move to a downhill move that also exploits local geometric information.  
That does not mean the objective suddenly becomes easy, but the solver now has a better understanding of the local terrain.

Third, it forces us to distinguish two different questions:

- what the inverse problem is,
- and how that inverse problem should be parameterized and solved.

So even when the inverse problem itself stays the same, changing the parameterization and the optimizer can alter the stability, efficiency, and boundary behavior of the computation.

But Part 6 still remains the warning we must keep:

**upgrading the solver does not automatically make the identifiability problem disappear.**

Even with a more natural parameterization and a stronger optimizer, sparse observations, parameter coupling, noise, and ill-conditioned directions are still there.  
This upgrade helps us **find a solution more reasonably**; it does not guarantee that the recovered solution is unique and true.
