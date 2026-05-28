---
date: '2026-02-26T00:30:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 4: From Observations to Parameter Inversion'
summary: "With observations known and the kappa field unknown, this part defines the inverse problem and explains why it naturally becomes a forward-model-based parameter optimization task."
description: "Part 4 on defining the inversion problem from observations."
tags: ["PDE", "Observation", "Inverse Problem", "Parameter Inversion", "Forward Model", "Kappa"]
categories: ["Crucible"]
---

# Computational Science & High-Reliability Systems Design Part 4: From Observations to Parameter Inversion

By the end of Part 3, what we have is no longer the full truth trajectory, but a finite, sparse, and noisy set of observations.  
So the question in Part 4 becomes: how do we start from these observations and infer the parameters that control the system's evolution?

---

## 1. Why Invert at All

As Part 3 already made clear, what we get in practice is not the internal truth of the system, but observations after sampling, truncation, and noise contamination.  
What we care about, however, is not only "what was measured," but also the more stable and more general structure behind those measurements.

In this project, that more general structure is not just an abstract idea. It is the parameter field that controls terrain evolution.  
In other words, we want to use the available observations to infer what kind of parameter structure could have produced the evolution we see.

So the inversion goal can be stated simply:

- the observations are known;
- the parameters controlling the evolution are unknown;
- we want to recover those unknown parameters from the observations.

## 2. Definition

### 2.1 What Is Already Known

An inverse problem is not a situation where everything is unknown.  
Before entering Part 4, we already know quite a bit:

- the initial terrain `h0`
- the grid geometry `x_coords` and `y_coords`
- the observation data produced in Part 3
- the forward model established in the previous parts

That means we already know the starting state, the spatial geometry, and how the system would evolve if the parameters were given.

### 2.2 What Is Unknown

What is truly unknown now is not the trajectory itself, but the parameter field $\kappa$ that controls how the trajectory evolves.  
In the forward problem, $\kappa$ is an input; in the inverse problem, $\kappa$ becomes the quantity we want to recover.

More specifically, in this project we usually do not invert the full-resolution field $\kappa(x,y)$ directly.  
Instead, we first reduce it to a lower-dimensional blockwise parameterization.

This matters because it turns the problem from "an overly flexible unknown field" into "a parameter vector that can actually be manipulated and optimized."

In the implementation, this corresponds to how blockwise parameters are expanded in:

- `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py`
- `01_inversion_kappa_field/scripts/invert_kappa_block_lbfgs_log.py`

### 2.3 How Do We Judge Whether a Candidate $\kappa$ Is Good

This is the step where the inverse problem really becomes concrete.

Once the observations are available, we can start with a candidate $\kappa$, feed it back into the forward model, and generate a predicted trajectory, or more precisely, a predicted set of observations.

Then we compare these predicted values with the actual observations:

- if the discrepancy is large, the candidate $\kappa$ is not reasonable;
- if the discrepancy is small, the candidate $\kappa$ is more likely to be close to the true parameter field.

So inversion is not about directly "reading off" parameters from observations. It is about:

**repeatedly trying different values of $\kappa$ so that the forward model produces results that are as close as possible to the observations.**

From this point on, the inverse problem naturally becomes an optimization problem.  
Later we will turn this idea of "comparing errors" into an explicit objective function and move into the actual solution process.

In the project, this loop of "propose a candidate $\kappa$, rerun the forward model, and compare against observations" is mainly implemented through `_objective_for_params(...)`.

### 2.4 Objective Function

Once the idea of "comparing prediction and observation" is made explicit, the objective function appears naturally.  
The simplest interpretation is: we want to find a parameter choice that makes the predicted observations from the forward model as close as possible to the actual observations.

In its most basic form, we can write:

$$
J(\kappa) = \frac{1}{2}\sum \left(h_{\text{pred}} - h_{\text{obs}}\right)^2
$$

In other words, inversion is not about finding a closed-form answer directly.  
It is about finding a $\kappa$ that minimizes the discrepancy.

In the project, this step is already implemented in code.  
The relevant scripts are:

- `01_inversion_kappa_field/scripts/invert_kappa_block_fd.py`
- `01_inversion_kappa_field/scripts/invert_kappa_block_lbfgs_log.py`

Both of them contain `_objective_for_params(...)`.

The project objective is not just the observation mismatch itself. It also adds a smoothness term and a prior term.  
So its structure is closer to:

$$
\text{objective} = \text{obs\_mse} + \text{reg\_smooth} + \text{reg\_prior}
$$

This also shows that in a practical inversion implementation, we do not only compare prediction and observation.  
We also use regularization terms to constrain the shape and range of the inferred parameters.
