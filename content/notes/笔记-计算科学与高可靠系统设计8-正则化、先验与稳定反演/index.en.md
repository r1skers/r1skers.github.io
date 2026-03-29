---
date: '2026-03-29T00:30:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 8: Regularization, Priors, and Stable Inversion'
summary: "With log-parameterization and L-BFGS-B, we can already obtain a more natural 16-dimensional blockwise inversion result. But a better solver does not automatically remove ill-posedness, so the next step is to explain why regularization and priors are still needed to stabilize the solution."
description: "Part 8 on regularization, priors, and stable inversion for blockwise kappa recovery."
tags: ["PDE", "Inverse Problem", "Regularization", "Prior", "Stability", "Kappa", "Reliability"]
categories: ["Crucible"]
---

# Computational Science & High-Reliability Systems Design Part 8: Regularization, Priors, and Stable Inversion

After Part 7, we already have a blockwise inversion result obtained through $\log(\kappa)$ parameterization and `L-BFGS-B`.  
In other words, we can now recover a 16-dimensional parameter solution more naturally and make it explain the observations reasonably well.

But the story does not end there.  
Because "obtaining a solution more reasonably" and "having a solution that is already stable enough in an ill-posed problem" are not the same thing.

So the question of Part 8 is:

**if the solver has already been upgraded, why do we still need regularization and priors?**

---

## 1. Redefining the Problem

If we walk from Part 5 to Part 7, the progress is already very clear:

- Part 5 made inversion actually run;
- Part 6 showed that the result cannot be judged by loss alone;
- Part 7 made both the parameterization and the optimizer more reasonable.

So by this point, we really do have a better blockwise inversion result.  
It is no longer just the product of a basic gradient-descent loop, but a parameter solution obtained through a more natural variable space and a stronger solver.

But "better" here mainly means:

- it handles positivity and parameter bounds more naturally;
- it searches for descending directions more systematically;
- it reduces the objective more stably.

It does not automatically mean:

- the solution is now unique;
- the solution is now closest to the true parameter field;
- the solution is already insensitive enough to noise and sparse observations.

So Part 7 solved the problem of **how to search for a solution more reasonably**,  
while Part 8 now asks: **how do we make that solution itself more stable in an ill-posed setting?**

## 2. Why a Better Parameterization and Optimizer Still Cannot Remove Ill-Posedness

In the current project, inversion is not facing the full truth.  
It is facing observations after time truncation, spatial truncation, and noise contamination.  
That means that even after switching to $\log(\kappa)$ and `L-BFGS-B`, the following structural issues may still remain:

- observations are still limited;
- noise still contaminates the data;
- parameters may still be coupled;
- multiple parameter sets may still produce similar predictions.

So the ill-posedness of the problem itself has not changed.  
Upgrading the solver only gives us a better ability to find a parameter solution that descends further under the current objective,  
but it does not automatically guarantee that all weak directions have already been constrained away by that objective.

## 3. Regularization: Adding Extra Constraints to an Overly Free Solution

If we start from the most basic inversion goal, what we care about is simply:

**can the mismatch between prediction and observation be made as small as possible?**

But that requirement alone is weak.  
It only says that the solution is acceptable at the data level.  
It does not say whether the solution is smooth enough, natural enough, or stable enough.

So a natural question appears:

if many different parameter combinations can fit the observations almost equally well,  
which kind of solution do we actually prefer?

That is exactly where regularization and priors enter.

Their role is not to replace the data,  
but to add extra requirements on the shape of the solution outside the data term.  
For example:

- parameters should not jump violently between neighboring blocks;
- parameters should not drift too far away from a reasonable reference value;
- parameters should not become extreme merely to chase a few noisy observations.

So regularization does not directly make the model "better at fitting."  
Instead, it prevents the solution from moving too freely along directions that the data do not constrain strongly enough.

## 4. From the Objective-Function View: Inversion No Longer Contains Only a Data-Misfit Term

At this point, the objective can no longer be written as a single observation-error term.  
In the project, the more complete structure is already close to:

$$
\text{objective} = \text{obs\_mse} + \text{reg\_smooth} + \text{reg\_prior}
$$

These three parts correspond to three different roles:

- `obs_mse`: make the prediction as close to the observations as possible;
- `reg_smooth`: prevent the parameter field from jumping too violently between neighboring blocks;
- `reg_prior`: prevent the parameters from drifting too far from a reference value.

So by Part 8, inversion is no longer just:

"how do we find a parameter that minimizes the data misfit?"

It becomes:

**how do we fit the data while also constraining the smoothness, plausibility, and stability of the solution?**

This is an important conceptual shift.  
From here on, inversion is no longer a pure approximation problem,  
but a trade-off problem between the data and extra structural constraints.

## 5. What the Smoothness Term and Prior Term Are Doing in the Project

This becomes clearer when we map it back to the implementation.

In the project, the smoothness term corresponds to a difference penalty between neighboring block parameters.  
That is, if adjacent blocks differ too much, the objective pays an extra cost.  
At the implementation level, this term is essentially summing:

- squared differences between horizontal neighbors;
- squared differences between vertical neighbors.

So `reg_smooth` does not mean "the solution must be perfectly flat."  
It means: **if a blockwise $\kappa$ field changes too sharply, then there should be stronger data evidence for that sharp change.**

`reg_prior`, on the other hand, constrains something different.  
It does not focus on whether neighboring blocks are smooth,  
but on whether the whole parameter set drifts too far from a reference value.

In the project configuration, this layer is usually controlled by:

- `lambda_prior`
- `kappa_prior`

Its meaning can be read like this:

**if the data themselves do not strongly prove that the parameters should move far away, then the solution should not drift lightly from a reasonable default center.**

So in summary:

- the smoothness term mainly constrains whether neighboring regions jump too much;
- the prior term mainly constrains whether the whole solution drifts too far from the reference value.

## 6. Conceptual Change: Inversion Has Become a Trade-Off Problem

By this point, the most important conceptual change is:

inversion is no longer simply:

- fit the observations as well as possible;

but has started to become:

- fit the observations as well as possible;
- avoid letting parameters run freely along weakly constrained directions;
- keep the recovered parameter field reasonably smooth and plausible.

So from this point on, there is no longer only one criterion for a "good" inversion result.  
It now contains at least three simultaneous requirements:

- data level: explain the observations;
- structural level: keep the parameters from jumping around;
- prior level: keep the parameters from drifting without justification.

So adding regularization is not "breaking inversion."  
It is simply acknowledging a reality:

**limited, sparse, and noisy observations are often not enough to pin the solution down stably by themselves.**

## 7. Benefits and Costs of Regularization

There is one more step to go.  
Although regularization can make the problem more stable, it is not free of cost.

Its benefits are straightforward:

- the solution is usually more stable;
- it is less sensitive to noise;
- the blockwise parameter field becomes more natural and interpretable.

But its costs are also real:

- it introduces bias;
- it may flatten sharp structures that are actually real;
- it may pull the parameters toward the prior center instead of letting the data decide alone.

So regularization is not "the stronger, the better."  
If it is too weak, ill-posed directions remain uncontrolled.  
If it is too strong, the solution becomes overcorrected.

This leads to a more realistic question:

**how do we find an appropriate balance between fitting the data and stabilizing the solution?**
