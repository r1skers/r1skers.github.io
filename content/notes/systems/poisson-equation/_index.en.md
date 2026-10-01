---
date: '2026-09-18T12:00:00+09:00'
draft: false
title: 'Poisson Equation: From Variational Structure to CUDA'
summary: 'From a one-dimensional energy functional to discrete equations, iterative solvers, CPU/CUDA implementations, and checks against the original equation.'
description: 'A Poisson equation learning thread spanning variational structure, discrete energy, finite differences, CPU/CUDA implementations, and error and performance validation.'
tags: ["Optimization", "Numerical Methods"]
categories: ["Notes"]
series: ["Poisson Equation"]
note_kind: "research"
weight: 1
---

This project follows one Poisson equation problem from its continuous formulation to a checkable computational result. It begins with the variational structure in one dimension, then moves to discrete matrices, a two-dimensional grid, and CPU/CUDA implementations. The final stage separates discretization, iteration, and floating-point effects.

$$
\text{energy and weak form}
\longrightarrow
\text{discrete energy and differences}
\longrightarrow
\text{iteration and CPU/CUDA}
\longrightarrow
\text{error and performance checks}.
$$

## Current progress

- **M1 · One-dimensional variation:** The key smooth-case derivation was completed with hints and corrections, followed by a bilingual stage article: [The One-Dimensional Poisson Equation: From an Energy Functional to a Unique Minimizer](/en/notes/systems/poisson-equation/variation-unique-minimum/).
- **M2 · One-dimensional discrete structure:** The guided derivation covers centered differences, boundary assembly, positive definiteness, and discrete energy, followed by a bilingual stage article: [The One-Dimensional Poisson Equation: From Centered Differences to Discrete Energy](/en/notes/systems/poisson-equation/centered-difference-discrete-energy/).
- **Experimental checkpoint · Sine mode:** The second-order amplitude bias of a fixed mode was derived from the continuous and discrete eigenvalues and checked on three grids. The [Chinese article](/notes/systems/poisson-equation/sine-mode-convergence/) is published.
- **Appendix A1 · Rigorous foundations:** A Chinese draft is under review. It revisits function spaces, density of test functions, interface conditions, the current boundary of the existence argument, and the conditional relationship between finite differences and finite elements.
- **M3 · Two dimensions and CPU:** The five-point stencil, guided Jacobi convergence analysis, CPU double buffering, and checks against independent discrete reference solutions are complete, followed by a bilingual stage article: [The Two-Dimensional Poisson Equation: From the Five-Point Stencil to a Verifiable Jacobi CPU Solve](/en/notes/systems/poisson-equation/two-dimensional-jacobi-cpu/).
- **M4–M5 · CUDA and final validation:** Not started.

This is a learning and reproduction thread. Each stage reports only what has actually been derived or checked. Error analysis remains part of the final validation stage.

The earlier [Error Analysis: From Approximation to Reliable Computation](/en/notes/systems/error-analysis/) thread and its Taylor and Softmax material remain available.
