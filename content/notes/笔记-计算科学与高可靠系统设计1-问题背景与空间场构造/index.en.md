---
date: '2026-02-18T00:00:00+09:00'
draft: false
title: 'Computational Science & High-Reliability Systems Design Part 1: Problem Setup and Spatial Field Construction'
summary: "Using orogeny-inversion-validation-lab as the example, this part introduces the problem setup, initial terrain construction, and the geometric intuition of irregular grids and control volumes."
description: "Part 1 on problem setup, initial terrain construction, and irregular-grid geometry."
tags: ["PDE", "Spatial Discretization", "Irregular Grid", "Control Volume", "Numerical Methods", "Physics Modeling"]
categories: ["Crucible"]
---

# Part 1: Problem Setup and Spatial Field Construction

This note series uses `orogeny-inversion-validation-lab` as its main example and follows the actual project pipeline:

**initial field construction -> grid geometry -> forward solve -> observation generation -> parameter inversion -> validation**

through the full computational chain.

## 1. Problem Setup

Instead of jumping directly into discrete formulas, this part first fixes the object of the problem.  
The goal is to build a 2D terrain field and let it evolve in time, as a simplified terrain-diffusion process.

## 2. Field Construction

The first step is to construct the most basic spatial objects.

### 2.1 The Most Basic 2D Terrain

The most natural starting point is a regular grid, similar to a Cartesian coordinate system.  
Each location can be written as $(x,y)$, and once a height value $h$ is attached to it, the result becomes $(x,y,h)$.  

Intuitively, this means: a spatial location together with the terrain height at that location.  
In the project, `build_base_terrain.py` does exactly this by generating an initial terrain field on a regular grid.

### 2.2 More Complex Geometry: Irregular Coordinates

If we stay on a regular grid, then the distance between neighboring points is always implicitly uniform.  
Real terrain geometry is usually not that neat, so the project adds another step:  
it keeps the same field $h$, but rebuilds the coordinates as a nonuniform coordinate system.  

In other words, what changes is not the terrain value itself, but where those values sit in space.  
This can be understood as taking the same $h$ and remapping it from a regular coordinate system to a nonuniform physical coordinate system.  

Once this happens, neighboring distances are no longer uniform, and geometry starts to directly affect later gradients and fluxes.

![Square-base pyramid stretched into a rectangular-base pyramid](pyramid-grid-stretch.svg)

### 2.3 Conceptual Shift: Once Time Enters, Static Values Become Evolving Quantities

If $(x,y,h)$ is treated only as a static terrain map, then the question is simply “how high is this point?”  
But once the goal becomes “how does the terrain evolve in time?”, the viewpoint changes.  

A discrete point can no longer be treated as an isolated value.  
It has to be understood as a local region exchanging quantities with its neighbors.  
That is why, once the forward solver enters the picture, the following objects become unavoidable:

- gradients: because changing distances changes the slope associated with the same height difference;
- fluxes: because neighboring regions exchange quantity through their interfaces;
- control volumes: because those exchanges must be assigned to a concrete local region;
- boundary conditions: because whether the system exchanges with the outside also affects the evolution.

So by the end of Part 1, one thing has been established clearly:  
the spatial objects and geometric intuition required by the rest of the computation are now in place.  
