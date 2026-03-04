---
date: '2026-02-26T00:30:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 4: One-Step and Multi-Step Error Analysis (Reliability Acceptance)'
summary: "Focus on error acceptance for Part 3 models: one-step prediction error, multi-step rollout accumulation, cross-step generalization error, and executable gates."
description: "Part 4 note on one-step/multi-step error analysis and reliability acceptance."
tags: ["PDE", "Trajectory Learning", "One-Step Error", "Rollout Error", "Cross-Step Validation", "Reliability", "Numerical Methods"]
categories: ["Crucible"]
---

# Computational Science & High-Reliability Systems Design Part 4: One-Step and Multi-Step Error Analysis

Part 3 already turns CFL-compliant trajectories into learnable samples. Part 4 focuses on one question: is the model accurate, stable, and acceptable.

---

## 1. Evaluation Target and Notation

Let the true propagator be $\Phi_{\Delta t}$ and the learned model be $f_\theta$:

$$
u^{n+1}=\Phi_{\Delta t}(u^n),\qquad
\hat{u}^{n+1}=f_\theta(u^n,\Delta t)
$$

Define one-step error as:

$$
e_1^n=\hat{u}^{n+1}-u^{n+1}
$$

Define multi-step rollout error (roll forward $m$ steps from same initial state):

$$
\hat{u}^{n+m}=f_\theta^{(m)}(u^n,\Delta t),\qquad
e_m^n=\hat{u}^{n+m}-u^{n+m}
$$

---

## 2. One-Step Error: Check Local Fit First

For one-step evaluation, record at least three metrics:


Corresponding formulas:

$$
\mathrm{MAE}_1=\frac{1}{N}\sum_{k=1}^{N}|e_{1,k}|,\qquad
\mathrm{RMSE}_1=\sqrt{\frac{1}{N}\sum_{k=1}^{N}e_{1,k}^2},\qquad
\mathrm{Linf}_1=\max_k|e_{1,k}|
$$

If one-step metrics fail the gate, reliable multi-step rollout is unlikely.

---

## 3. Multi-Step Error: Check Accumulation and Stability

Multi-step error usually grows with rollout length. The key is not whether it grows, but whether growth is controllable.

Fix physical horizon $T$ and inspect error curves along rollout:

$$
\mathrm{MAE}_m,\ \mathrm{RMSE}_m,\ \mathrm{Linf}_m,\quad m=1,\dots,M
$$

Add two practical stability checks:


---

## 4. Cross-Step Generalization: Test Whether Part 2 Method Is Learned

This is the key step for your current storyline:

1. `train(dt) -> test(dt/2)`  
2. `train(dt/2) -> test(dt/4)`  
3. `train(dt)+train(dt/2) -> test(dt/4)`

If performance is good only on the trained step size but collapses across steps, the model memorizes sampling distribution rather than learning propagation law.

---

## 5. Error-Order Diagnosis (Not a Hard Gate)

Error order checks whether error decays as expected under refinement; it is diagnostic and does not directly replace PASS/FAIL gates.

Observed order is commonly computed by:

$$
p_{\mathrm{obs}}\approx \log_2\!\left(\frac{E(h)}{E(h/2)}\right)
$$

Here $E$ can be a one-step or rollout metric (e.g., $\mathrm{RMSE}_M$ at fixed horizon $T$).

Temporal-step example (should be near first order):

$$
E(\Delta t=0.04)=1.60\times10^{-3},\quad
E(\Delta t=0.02)=8.20\times10^{-4}
$$

$$
p_t\approx \log_2\!\left(\frac{1.60\times10^{-3}}{8.20\times10^{-4}}\right)\approx 0.96
$$

Spatial-step example (five-point stencil is typically near second order):

$$
E(\Delta x=0.20)=3.80\times10^{-4},\quad
E(\Delta x=0.10)=9.60\times10^{-5}
$$

$$
p_x\approx \log_2\!\left(\frac{3.80\times10^{-4}}{9.60\times10^{-5}}\right)\approx 1.98
$$

If observed order strongly deviates from expectation (e.g., persistently below $0.5$ or highly unstable), re-check data construction, boundary handling, or training distribution.

---

## 6. Acceptance Flow and Gates (Compact)

Use one compact flow with conjunctive gates:

$$
\text{PASS} \Longleftrightarrow
(\mathrm{MAE}_1\le \tau_{\mathrm{mae1}})
\land
(\mathrm{RMSE}_M\le \tau_{\mathrm{roll}})
\land
(\mathrm{CrossStepRMSE}\le \tau_{\mathrm{cross}})
\land
(\text{NoDivergence})
$$


This avoids false acceptance where one-step looks good but rollout is unstable.

---

## 7. Relation to Previous Parts

Part 1 provides spatial discretization operator.
Part 2 provides CFL and step-size design.
Part 3 provides the step-size trajectory learning model.
Part 4 provides reliability acceptance across one-step, rollout, and cross-step tests.

---

## 8. Summary

- Part 4 is not about building a new model; it defines executable error-acceptance standards.
- One-step metrics tell local learning quality; rollout metrics tell long-horizon usability.
- Error order diagnoses convergence behavior, while gates decide final acceptance; they serve different roles.
- Cross-step validation is the key test of whether the Part 2 method is truly learned.
