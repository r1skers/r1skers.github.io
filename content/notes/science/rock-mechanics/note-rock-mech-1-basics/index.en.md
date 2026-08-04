---
date: '2026-03-01T18:25:00+09:00'
draft: false
title: 'Rock Mechanics Part 1: Mineral Composition, Structural Features, and Discontinuity Basics'
summary: "基于课堂速记，系统梳理岩石矿物组成、颗粒与胶结特征、风化指标、结构面特征量和岩体结构类型，作为后续强度与稳定性分析的基础底板。"
description: "Rock mechanics fundamentals: minerals, microstructure, weathering, discontinuity descriptors, and rock-mass structure types."
tags: ["Science", "Rock Mechanics"]
categories: ["Notes"]
series: ["Rock Mechanics"]
note_kind: "foundation"
aliases:
---

# Rock Mechanics Part 1: Mineral Composition, Structural Features, and Discontinuity Basics

This note is a foundational map: clarify material and structural logic first, then move to strength, deformation, and stability analysis.

The chain is: mineral composition -> particle/cementation features -> weathering effects -> discontinuity classification and quantification -> rock-mass structure types.

---

## 1. Major Minerals in Rocks

### 1.1 Silicates (common in igneous rocks)

Typical minerals: feldspar, pyroxene, amphibole, olivine.

Typical features: mainly granular/prismatic crystals with a stronger framework effect, usually showing higher strength and better deformation resistance.

### 1.2 Clay Minerals

Typical types: kaolinite, montmorillonite, illite.

Typical features: platy/flaky texture, generally lower stiffness and strength, and stronger deformation sensitivity under water-content changes.

### 1.3 Carbonates

Typical chemical components can be represented as $Ca^{2+}$, $Mg^{2+}$, and $CO_3^{2-}$.

Typical types: calcite, dolomite, aragonite.

Typical features: acid-reactive and locally dissolvable; can be strong when dense, but mechanical performance degrades rapidly after fracturing or weathering.

---

## 2. Structural Features: Particles and Cementation

### 2.1 Influence of Particle Morphology on Mechanics

From the interlocking perspective, a practical classroom ranking is: granular > platy > flaky.

The implication is straightforward: structures that form stronger spatial frameworks are generally better for load transfer and stability.

### 2.2 Engineering Intuition for Cementation

A practical entry-level heuristic is: siliceous cementation is usually strongest, followed by ferruginous, then calcareous, while argillaceous cementation is relatively weaker.

Use this as a quick estimate, then calibrate with laboratory data and lithologic evidence.

---

## 3. Weathering and Measurable Indicators

Weathering alters rock-mass integrity, discontinuity condition, and wave-propagation behavior.

Common rapid indicators include wave velocity and velocity ratio.

A common trend is: stronger weathering -> more discontinuities and weaker cementation -> lower wave velocity.

---

## 4. Basic Classification of Discontinuities

### 4.1 Primary Discontinuities

Directly related to rock-forming processes, commonly from sedimentary, magmatic, and metamorphic origins.

### 4.2 Secondary Discontinuities

Formed by later geological processes, such as tectonics, unloading, and weathering modification.

### 4.3 Compressional-Shear (Tectonic) Discontinuities

They strongly control shear strength and overall stability, so they are key targets in engineering analysis.

---

## 5. Quantitative Descriptors of Discontinuities

This section can be treated as a minimal descriptor set for field logging and parameterized modeling.

### 5.1 Orientation: Strike, Dip Direction, and Dip Angle

Orientation defines the spatial geometry of discontinuities and is a primary input for wedge identification and stability calculations.

![Discontinuity orientation schematic](discontinuity-orientation.svg)
Figure: orientation schematic (not to scale).*

### 5.2 Continuity Coefficient (Illustrative Form)


$$
k_1=\frac{\sum a}{\sum a+\sum b}
$$

Here, $a$ represents connected trace length and $b$ interrupted length; larger $k_1$ indicates stronger continuity.

![Continuity coefficient k1](continuity-k1.svg)
Figure: connected and interrupted segments along a scanline.*

### 5.3 Trace Length

Longer traces are more likely to control block boundaries and potential sliding paths.

### 5.4 Density and Spacing

Common records include line density (number of discontinuities per unit length) and average spacing.

Under the same measurement condition, higher density generally corresponds to smaller spacing and lower rock-mass integrity.

![Density and spacing schematic](density-spacing.svg)
Figure: density-spacing relation on the same scanline.*

### 5.5 Aperture, Roughness Coefficient, and Infilling


1. Aperture: mainly affects seepage pathways and normal stiffness.  
2. Roughness coefficient: controls interlocking and shear resistance.  
3. Infilling: infill type and thickness significantly alter discontinuity strength and deformation response.

---

## 6. Rock-Mass Structure Types (Classroom Quick Version)

A practical first-pass framework is to classify rock-mass structure into four typical types:


1. Massive-blocky: better integrity and relatively weaker discontinuity control.  
2. Layered: strong anisotropy, with bedding planes dominating deformation and slip.  
3. Fractured: dense discontinuities and small blocks; stability is more sensitive to support conditions.  
4. Disintegrated/granular: few intact blocks, poor integrity, and large deformation under disturbance.

![Rock-mass structure types](rock-mass-structure-types.svg)
Figure: rock-mass structural types (schematic).*

---

## 7. Summary

The core value of this note is building the cognition chain of "material composition-structural features-engineering behavior."

A practical sequence for follow-up study is:


1. Strength criteria: Mohr-Coulomb and Hoek-Brown.  
2. Discontinuity mechanics: normal closure, shear slip, and post-peak behavior.  
3. Engineering scenarios: stability evaluation for slopes, tunnels, and underground openings.
