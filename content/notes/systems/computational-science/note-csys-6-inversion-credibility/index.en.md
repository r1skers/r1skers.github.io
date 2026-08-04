---
date: '2026-03-01T00:10:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 6: Inversion Result Analysis and Parameter Credibility'
summary: "Part 5 gives us a parameter set that can explain the observations reasonably well, but that does not automatically make it the true parameter field. This part separates observation fit, validation ability, and truth-level comparison."
description: "Part 6 on inversion-result analysis, validation, and parameter credibility."
tags: ["Computational Science", "Inverse Problem", "Reliability"]
categories: ["Notes"]
series: ["Inverse Modeling and Reliable Computation"]
note_kind: "topic"
aliases:
---

> **Topic dossier:** [Inverse Modeling and Reliable Computation](/en/notes/topics/inverse-modeling/)

# Computational Science & High-Reliability Systems Design Part 6: Inversion Result Analysis and Parameter Credibility

Part 5 solved the problem of how inversion actually starts to iterate.  
By Part 6, the question is no longer just whether the objective can be reduced, but whether the parameter set that fits the observations is actually trustworthy.

---

## 1. Identifiability

The first thing to make clear is that the parameter set obtained in Part 5 is, strictly speaking, only **a solution that explains the observations relatively well**.  
What it tells us is that, under the current observations, the current objective, and the current parameterization, this parameter set can make the prediction-observation mismatch fairly small.

But that does not automatically mean it is the true parameter field.

The reason is simple: what we have is not the full truth, but only observations after time truncation, spatial truncation, and noise contamination.  
So from the very beginning, inversion is not facing the full information of the system, but only a partial projection of it.

Under such conditions, the following situation can occur:

- one parameter set fits the observations reasonably well;
- another, different parameter set may also produce similar predictions;
- in the observation layer, both parameter sets seem to "work."

This is what we mean here by an identifiability problem.

In other words, the real difficulty in inversion is not only whether the objective can be pushed down, but whether, once the objective is already low, we can still distinguish the parameters uniquely and stably from the available observations.

If not, then this parameter set can only be called a reasonable or feasible solution, rather than the uniquely correct true parameter field.

So the focus of Part 6 is no longer how to keep updating the parameters, but how to separate two questions:

- does this parameter set fit the observations?
- is this parameter set actually trustworthy?

## 2. Credibility Checks

Since fitting the observations well does not automatically mean that the parameters have been correctly recovered, the next step is to separate how we read the result.  
More precisely, we should distinguish at least three layers:

- whether the parameter set fits the observations that actually participated in inversion;
- whether it still explains data that were not used during inversion;
- in a simulation setting, how far it still is from the full truth.

So credibility checking is not about staring at a single loss value.  
It should be read separately from the observation, validation, and truth levels.

## 2.1 Training and Validation Sets (Not Yet Used in This Project)

A stricter approach would be to split the current observations into two parts:

- one part participates in inversion as the actual inversion set;
- the other part is kept out of inversion and only used later for validation.

The value of doing this is that it helps distinguish between two situations:

- the parameter set merely fits the current observations it was optimized against;
- the parameter set still has explanatory power on data that were not used during inversion.

If only the first is true, then the model is closer to "memorizing" the current observations.  
If the second also holds, then it is closer to having captured a more stable rule.

The current project implementation does not yet explicitly split the observations into train and validation subsets.  
In `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py`, the current objective still computes `obs_mse` and `obs_rmse` directly on the entire observation CSV.

So this section is not saying that the project has fully implemented this layer already.  
Rather, it points out that **if we want to further strengthen the credibility of the results later, this would be a very natural direction.**

## 2.2 Truth-Level Posterior Comparison in Simulation

Beyond observation-level error, simulation experiments give us one major advantage that is usually unavailable in the real world:  
we know the full truth, and we know the true $\kappa$.

That means that after inversion, we can perform a deeper posterior comparison:

- rerun a full rollout using the recovered $\kappa$;
- compare the rollout result with the truth trajectory;
- directly compare the recovered $\kappa$ with the true $\kappa$.

What we get from this is no longer just "can it fit the observations," but also:

- how far it still is from the truth at the full-trajectory level;
- how far it still is from the true parameter field at the parameter level.

In the project, this layer mainly corresponds to `01_inversion_kappa_field/scripts/evaluate_inversion_block.py`.  
It further outputs:

- rollout `rmse` / `mae`
- final-field residuals
- `kappa_block_mae`
- `kappa_block_rmse`

These metrics matter because they formally separate two questions:

- fitting the observations
- recovering the parameters

In other words, even if a parameter set already fits the observations very well, it may still happen that:

- the rollout result is still noticeably different from the full truth;
- the recovered $\kappa$ still does not fully match the true $\kappa$.

It is important to emphasize that this layer is **a simulation-specific posterior check**, not a universally available validation method in real-world inversion.  
In real applications we usually do not know the full truth, nor the true $\kappa$, so this cannot be assumed as a default validation layer.

That is exactly why the hold-out-observation idea in 2.1 is closer to realistic validation practice.  
The role of 2.2 is different: in simulation, it helps us judge how closely "fitting observations" aligns with "recovering the true parameters."

So by this point, what credibility checking really needs to examine is no longer just whether the objective went down, but:

- at the observation level, how well it fits;
- at the validation level, whether it explains data not used in inversion;
- at the truth level, in simulation, how far it still is from the full truth;
- at the parameter level, how much of the true parameter field has actually been recovered.
