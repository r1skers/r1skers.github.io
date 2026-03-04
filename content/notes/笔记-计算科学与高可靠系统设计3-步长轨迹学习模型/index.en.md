---
title: 'Computational Science & High-Reliability Systems Design Part 3: Step-Size Trajectory Learning Model (dt-Level Sampling from Part 2)'
date: '2026-02-26T00:00:00+09:00'
draft: false
summary: "Convert Part 2 stable step-size design into learnable data: build samples from dt, dt/2, dt/4 trajectories, train one-step predictors, and evaluate generalization via cross-step validation."
description: "Part 3 note on trajectory-learning model built from CFL-compliant multi-step simulations."
tags:
  - "PDE"
  - "CFL"
  - "Trajectory Learning"
  - "Surrogate Model"
  - "Step Size"
  - "Numerical Methods"
  - "Reliability"
categories:
  - "Crucible"
---

# Computational Science & High-Reliability Systems Design Part 3: Step-Size Trajectory Learning Model

Part 1 gives spatial discretization, Part 2 gives stable step-size rules. Part 3 turns these computable trajectories into learnable samples.

---

## 1. Goal: Learn the Step-Size Trajectory Method from Part 2

Generate stable trajectories under Part 2 CFL constraints.
Build supervised samples from multi-step trajectories ($\Delta t,\Delta t/2,\Delta t/4$).
Train one-step predictors and test cross-step generalization.

---

## 2. Data Source: Three Step-Size Trajectories

Following Part 2, fix spatial mesh and physical horizon $T$, then use:

$$
\Delta t,\quad \frac{\Delta t}{2},\quad \frac{\Delta t}{4}
$$

All levels must satisfy the CFL stability gate.

This gives a trajectory family of the same physical process under different temporal resolutions.

---

## 3. Sample Construction: From Trajectory to Supervised Learning

For each grid node and time step, map neighborhood state to next-step state:

$$
\mathbf{x}_{i,j}^{n}=[h_{i,j}^{n},h_{i+1,j}^{n},h_{i-1,j}^{n},h_{i,j+1}^{n},h_{i,j-1}^{n},\Delta t],\qquad
y_{i,j}^{n}=h_{i,j}^{n+1}
$$

Include $\Delta t$ explicitly as a feature so the model knows which time-step regime each sample belongs to.

Optional enhancements (for stronger robustness):


---

## 4. Training Strategy: In-Step First, Cross-Step Next

Use a two-stage train/validation protocol:

`In-step`: split train/val within the same step level to confirm basic dynamics fit.
`Cross-step`: train on one step level and test on another to check step-size transfer.

Minimal cross-step validation set:

1. `train(dt) -> test(dt/2)`  
2. `train(dt/2) -> test(dt/4)`  
3. `train(dt) + train(dt/2) -> test(dt/4)`

---

## 5. Acceptance Metrics: Not Only Error, Also Stability

Record at least four metric groups:

Linf`。  

If one-step error is low but rollout diverges, the model is not usable.

---

## 6. Direct Bridge Sentence to Part 2 (Reusable)

You can directly use this bridge sentence in your notes:

"Part 2 generates CFL-compliant multi-step trajectories; Part 3 converts them into learnable samples and validates cross-step generalization."

---

## 7. Summary

- Part 3 models the step-size trajectory method itself, not one isolated case.
- The three-level step set ($\Delta t,\Delta t/2,\Delta t/4$) is a minimal usable learning-data skeleton.
- Acceptance must include both error and stability; otherwise the model is not engineering-reliable.
