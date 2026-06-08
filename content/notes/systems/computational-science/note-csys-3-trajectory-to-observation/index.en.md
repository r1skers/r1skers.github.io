---
title: 'Computational Science & High-Reliability Systems Design Part 3: From Full Trajectories to Observations'
date: '2026-02-26T00:00:00+09:00'
draft: false
summary: "Using orogeny-inversion-validation-lab as the running example, this note explains why a full truth trajectory cannot be used directly and how it is turned into sparse, noisy observations through time, space, and noise cuts."
description: "Part 3 on converting full truth trajectories into sparse, noisy observations."
tags:
  - "PDE"
  - "Observation"
  - "Truth Trajectory"
  - "Sampling"
  - "Noise"
  - "Numerical Methods"
categories:
  - "Crucible"
aliases:
---

# Computational Science & High-Reliability Systems Design Part 3: From Full Trajectories to Observations

By the end of Part 2, we already have a full truth trajectory.  
This part is no longer about marching that trajectory forward, but about turning it into the observation data that later analysis and inversion will actually use.

## 1. Why This Step Is Necessary

A full simulator output cannot be used directly.  
It is an *omniscient view*, whereas real-world sampling is always limited by incomplete coverage and measurement noise.

If we skip this reduction step, we are only testing:

- whether inversion works under an omniscient view

rather than:

- whether inversion works under limited observations

So this step is not arbitrary data deletion. It is an intentional reduction of simulation truth to the same observational level that real problems operate on.

## 2. Cutting the Trajectory

The project applies three cuts to the trajectory.  
In other words, we do not feed the full truth directly into inversion; we first process it into observations.

### 2.1 First Cut: Time

The first cut is time.

Although Part 2 produces a full truth trajectory, observation does not keep every step.  
Only a subset of time steps is selected.  
In the project, this corresponds to `step_stride` in  
`01_inversion_kappa_field/scripts/build_observations_variable_kappa.py`.

So the temporal cut means:
**we no longer keep the full continuous timeline, but only snapshots taken every few steps.**

### 2.2 Second Cut: Space

The second cut is space.

Even when a time step is selected, we still do not keep the full 2D field.  
Only values at selected positions are retained.  
In the project, this corresponds to `_select_points(...)` in `build_observations_variable_kappa.py`.

It supports two modes:

- `stride`: sample points on a regular sparse pattern
- `random`: sample a random subset of points

So the spatial cut turns a full field into a sparse set of observation points.

### 2.3 Third Cut: Noise

The third cut is noise.

After the first two cuts, we still only have sampled truth values.  
Real observations are not that clean, so the project adds noise as well.  
This corresponds to `noise_sigma` in `build_observations_variable_kappa.py`, producing:

$$
h_{obs} = h_{true} + noise
$$

From that point on, the data has formally changed from truth to observation.  
What inversion sees is no longer the simulator's internal truth, but a noisy measurement.

## 3. What Changes After the Cut

The main question here is: once the cuts are applied, what has changed compared with the original simulated data, and why does that matter for later analysis and inversion?

First, the data shape changes.  
In Part 2, we have a full state field at every time step and every grid point.  
In Part 3, this becomes a discrete record of “one time step, one position, one observed value.”

Second, information is reduced.  
Originally we had full time, full space, and noise-free truth.  
Now we only keep partial time, partial space, and noisy observations.  
So the transition from truth to observation is not just a formatting change. It is a loss of information.

## 4. A Change in Perspective: Simulation vs. Reality

By the end of Part 3, the role of the data has completely changed.  
It is no longer an internal system truth, but the noisy “measurement value” that later inversion will actually face.

This is where further questions begin:

- is the information sufficient?
- does noise destabilize inversion?
- does sparse sampling hide important structures?

These are not special issues of simulation. They are precisely what real-world sampling looks like.  
In reality, we start with limited observations rather than full truth.

The reason simulation still performs this reduction step is that we begin with full truth and must deliberately reduce it to the same level as real observations in order to study inversion fairly.  
And because reality has no visible truth, later validation can no longer rely on direct truth comparison; it has to depend more on predictive ability, physical consistency, and held-out observations.
