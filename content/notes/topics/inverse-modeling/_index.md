---
title: "主题档案：反问题与可靠计算"
description: "把 forward model、观测生成、参数反演、正则化与工程验证组织成一条完整链。"
summary: "从 PDE 演化到稳定反演、可信度分析和 Orogeny/ForgeFlow 证据的主题档案。"
categories: ["Notes"]
tags: ["Computational Science", "Inverse Problem", "Regularization"]
series: ["Inverse Modeling and Reliable Computation"]
note_kind: "topic-index"
---

这个档案围绕一条完整计算链组织现有材料：

\[
\text{空间场}
\rightarrow
\text{forward evolution}
\rightarrow
\text{observation}
\rightarrow
\text{parameter inversion}
\rightarrow
\text{regularization}
\rightarrow
\text{credibility}.
\]

## 1. Forward world

- [Part 1：问题背景与空间场构造](/notes/systems/computational-science/note-csys-1-problem-spatial-field/)
- [Part 2：从地形到时间演化](/notes/systems/computational-science/note-csys-2-terrain-to-time/)
- [Part 3：从完整轨迹到观测数据](/notes/systems/computational-science/note-csys-3-trajectory-to-observation/)

## 2. Inverse problem

- [Part 4：从观测数据到参数反演](/notes/systems/computational-science/note-csys-4-observation-to-inversion/)
- [Part 5：有限差分梯度与梯度下降](/notes/systems/computational-science/note-csys-5-finite-diff-gradient-descent/)
- [Part 6：反演结果分析与参数可信度](/notes/systems/computational-science/note-csys-6-inversion-credibility/)
- [Part 7：L-BFGS 与对数参数化](/notes/systems/computational-science/note-csys-7-lbfgs-log-parameterization/)

## 3. Regularization and reliability

- [Part 8：正则化、先验与稳定反演](/notes/systems/computational-science/note-csys-8-regularization-prior/)
- [Part 9：平滑项、先验项与正则化强度](/notes/systems/computational-science/note-csys-9-smoothness-prior-strength/)
- [Part 10：完整链条总结](/notes/systems/computational-science/note-csys-10-summary/)

理论接口包括 [有界算子、谱与紧算子](/notes/math/real-analysis/note-ra-4-operators-dual-spectrum-compact/)、[条件数、稳定性与正则化](/notes/math/linear-algebra/note-la-8-conditioning-stability-regularization/) 和 [误差分析主线](/notes/systems/error-analysis/)。

## 4. Project evidence

- [Artifact 2：ForgeFlow](/artifacts/02-forgeflow/) 保存框架、PDE benchmark、surrogate 与反演验证记录。
- [Artifact 3：Orogeny Sandbox](/artifacts/03-orogeny-sandbox/) 保存从地形生成到 OOD 门控的全链实验。
- [Artifact 4：DEM 地貌稳定性](/artifacts/04-dem-landform-stability-lab/) 把稳定性问题落到真实地形数据。

当前十篇旧文章保持 URL 不变；主题上将它们收束为 forward、inverse、regularization 三章和一篇总结。
