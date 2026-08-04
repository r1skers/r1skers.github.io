---
date: '2026-03-29T01:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 9: Smoothness Terms, Prior Terms, and Regularization Strength'
summary: "Part 8 explained why regularization is necessary. This part continues by showing how smoothness terms and prior terms are written into the objective, and how regularization strength changes the shape of the final blockwise inversion result."
description: "Part 9 on smoothness terms, prior terms, and regularization strength in blockwise inversion."
tags: ["Computational Science", "Inverse Problem", "Reliability", "Regularization"]
categories: ["Notes"]
series: ["Inverse Modeling and Reliable Computation"]
note_kind: "topic"
aliases:
---

> **Topic dossier:** [Inverse Modeling and Reliable Computation](/en/notes/topics/inverse-modeling/)

# Computational Science & High-Reliability Systems Design Part 9: Smoothness Terms, Prior Terms, and Regularization Strength

Part 8 already explained why regularization is necessary.  
That means we already know that observation mismatch alone is often not enough to pin the inversion result down stably,  
so extra structural constraints are still needed to limit those directions that are weak and easy to drift along.

So the next question is no longer:

"should we add regularization?"

but rather:

**how exactly are these regularization terms written into the objective, and what does each of them actually constrain?**

---

## 1. From "Why Add It" to "How to Write It In"

If we push Part 8 one step further, we naturally move from necessity to construction.  
In other words, we are no longer stopping at the statement that regularization is useful.  
We now need to enter more specific questions:

- how exactly is the smoothness term written;
- how exactly is the prior term written;
- what are these coefficients actually controlling.

This step matters because only when regularization is truly written into the objective  
does it stop being an abstract idea and become part of the inversion design itself.

## 2. The Objective Has Become a Multi-Term Structure

At this stage, the inversion objective is no longer just a single observation-error term.  
A more complete expression is already close to:

$$
\text{objective} = \text{obs\_mse} + \text{reg\_smooth} + \text{reg\_prior}
$$

These three parts are added together in the end, but they do not play the same role.

- `obs_mse` fits the observations;
- `reg_smooth` constrains spatial jumps in the solution;
- `reg_prior` constrains the overall solution from drifting too far from a reference center.

So the objective is no longer a single-task object.  
It now writes both "fit the data" and "limit the freedom of the solution" into the same optimization target.

One point is especially important here:  
the regularization terms do not replace the data term.  
They add another layer outside the data term and specify **what kind of solution is more acceptable.**

## 3. How the Smoothness Term Is Added

For this blockwise inversion problem, the most natural smoothness constraint is to penalize overly large differences between neighboring block parameters.

If we think of blockwise $\kappa$ as a small $4\times4$ parameter field,  
then "smoothness" does not mean every block has to be identical.  
It means that if neighboring regions suddenly jump too sharply, that jump should pay a higher cost.

So in implementation, the smoothness term is usually written as the sum of squared neighbor differences.  
That is, we separately accumulate:

- squared differences between horizontal neighbors;
- squared differences between vertical neighbors.

This is exactly what the project's `smoothness_penalty_block(...)` corresponds to.  
Its structure is essentially:

$$
\sum (p_{i,j+1}-p_{i,j})^2 + \sum (p_{i+1,j}-p_{i,j})^2
$$

and once we multiply it by a coefficient `lambda_smooth`, it becomes `reg_smooth`.

So the smoothness term does not mean "the parameter field must be perfectly flat."  
It means:

**if the solution wants to create sharp jumps between neighboring blocks, then there must be stronger data evidence to justify those jumps.**

## 4. How the Prior Term Is Added

Unlike the smoothness term, the prior term does not constrain local neighbor relations.  
Instead, it constrains how far the whole parameter solution drifts from a reference value.

In the project, this layer is usually expressed through:

- `kappa_prior`
- `lambda_prior`

Conceptually, it answers the following question:

if the observations themselves do not strongly show that the parameters should move far away,  
do we really want to let them drift without restraint from a reasonable default center?

If the answer is no, then it becomes natural to add a term that says "deviating from the reference value should cost something."  
A common form is:

$$
\text{reg\_prior} \sim \lambda_{\text{prior}} \cdot \text{mean}\bigl((p-\kappa_{\text{prior}})^2\bigr)
$$

So the prior term can be compressed into one sentence:

**when the data do not strongly demand otherwise, the solution should not move lightly away from a reasonable default center.**

This also makes its difference from `reg_smooth` clearer:

- `reg_smooth` controls whether neighboring regions jump too aggressively;
- `reg_prior` controls whether the overall solution moves too far away from the default reference.

## 5. Why These Terms Are Usually Written as Squares

There is another natural question here:  
why are both the smoothness term and the prior term usually written as squared penalties rather than something else?

The most direct reason is that squared terms are always nonnegative.  
That makes them very suitable as penalty terms in the objective, because they do not get mixed up with "rewards."

The second reason is that squared terms express "the larger the deviation, the heavier the penalty" in a very natural way.  
Small deviations cost only mildly,  
but once the deviation becomes large, the penalty rises quickly.

The third reason is that squared terms are continuous and smooth in form.  
That makes the whole objective easier to handle with gradient-based optimization methods.  
Whether we look at the gradient descent in Part 5 or the `L-BFGS-B` solver in Part 7,  
both prefer this kind of continuous and optimization-friendly penalty structure.

Finally, squared terms stay consistent with the least-squares logic of the whole pipeline.  
If observation mismatch itself is commonly written as squared error,  
then writing the smoothness term and prior term as squared penalties keeps the overall structure stylistically coherent.

## 6. What Regularization Strength Is Actually Controlling

Once the regularization terms are written down, the next natural question is:

**what exactly are these coefficients controlling?**

The two most important quantities here are:

- $\lambda_{\text{smooth}}$
- $\lambda_{\text{prior}}$

They do not change the type of regularization term,  
but they do change how loudly each regularization term "speaks" inside the total objective.

If $\lambda$ is small, then even if the regularization term exists formally,  
it hardly has much influence during optimization.  
In that case, the result stays closer to a solution that is mainly driven by the data term.

If $\lambda$ is large, then the regularization term begins to significantly shape the final solution.  
The solution becomes smoother and closer to the prior,  
but it may also move farther away from a purely data-driven result.

So in essence, regularization strength controls one thing:

**in inversion, how much do we trust the observations, and how much do we trust these extra structural constraints?**

## 7. What State These Terms Are Currently In Inside the Project

If we put this discussion back into the project, we immediately see something practical.

At the code level, the project already supports both `reg_smooth` and `reg_prior`.  
In other words, the script design has already reserved:

- a smoothness-term interface;
- a prior-term interface;
- the corresponding weight coefficients.

But if we look further into the actual configurations, another important fact appears:

- the finite-difference baseline has already enabled a small `lambda_smooth`;
- in the current $\log(\kappa)$ + `L-BFGS-B` mainline configuration, `lambda_smooth` and `lambda_prior` are still basically 0.

That means the project already has the structural ability to write regularization into the inversion,  
but in the current mainline experiments, these constraints have not yet been fully turned on.

So Part 9 sits at a very natural position:  
it is both explaining what these terms already mean in the existing code,  
and preparing the conceptual ground for turning them on more systematically later.

## 8. Conceptual Change: Inversion Has Moved from a Single Objective to a Multi-Objective Trade-Off

By this point, the shape of the inversion problem has changed further.

It is no longer just a problem of:

- "fit the observations as well as possible,"

but has started to become a problem of:

- fitting the observations;
- maintaining spatial smoothness;
- maintaining prior plausibility;

all at once.

That means regularization strength is no longer just a secondary tuning parameter.  
It has become part of the inversion design itself.

Because once these weights change,  
the final solution may shift from "more data-driven" to "more smooth" or "closer to the prior."

So tuning regularization strength is really deciding:

**what kind of solution we are willing to accept.**

As for how these strengths should be chosen systematically, that still needs to be developed together with later project experiments.
