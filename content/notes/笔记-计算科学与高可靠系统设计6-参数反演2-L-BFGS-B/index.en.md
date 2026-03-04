---
date: '2026-03-01T00:10:00+09:00'
draft: true
title: 'Computational Science & High-Reliability Systems Design Part 6: Parameter Inversion II (Finite-Difference Gradient and Quasi-Newton L-BFGS-B)'
summary: "Build on Part 5 baseline using L-BFGS-B for faster and more stable inversion with finite-difference gradients and bound constraints."
description: "Part 6 on finite-difference gradient inversion with L-BFGS-B."
tags: ["PDE", "Inverse Problem", "Finite Difference", "L-BFGS-B", "Quasi-Newton", "Parameter Inversion", "Reliability"]
categories: ["Crucible"]
---

# 计算科学与高可靠系统设计 Part 6：参数反演2（有限差分梯度与 L-BFGS-B）
# Computational Science & High-Reliability Systems Design Part 6: Parameter Inversion II (Finite-Difference Gradient and L-BFGS-B)

Part 5 解决“能跑通”。Part 6 解决“更快收敛、更稳优化”。  
Part 5 solves “it works.” Part 6 solves “it converges faster and more robustly.”

---

## 1. 和 Part 5 的关系
## 1. Relation to Part 5

不变的部分：  
Unchanged:

1. 同一个目标函数 $J(\kappa)$  
2. 同一套有限差分梯度估计口径  
3. 同样的参数边界约束

变化的部分：  
Changed:

1. 更新器由梯度下降改为 L-BFGS-B  
2. 利用历史梯度信息近似二阶曲率

---

## 2. L-BFGS-B 的核心更新思想
## 2. Core Update Idea of L-BFGS-B

目标仍是：
Same objective:

$$
\min_{\kappa\in[\kappa_{\min},\kappa_{\max}]} J(\kappa)
$$

L-BFGS-B 使用有限内存近似 Hessian 逆矩阵，更新方向更接近牛顿方向：  
L-BFGS-B uses a limited-memory inverse-Hessian approximation, making search direction closer to Newton direction.

$$
\kappa_{k+1}=\kappa_k+\alpha_k p_k,\qquad p_k\approx -B_k^{-1}g_k
$$

并通过 box constraints 直接处理参数上下界。  
It also directly enforces box constraints on parameters.

---

## 3. 有限差分梯度与 L-BFGS-B 的配合
## 3. Combining Finite Differences with L-BFGS-B

若当前没有解析梯度，可继续用有限差分梯度喂给优化器：  
If analytic gradients are unavailable, keep finite-difference gradients:

$$
g(\kappa)\approx \frac{J(\kappa+\delta)-J(\kappa-\delta)}{2\delta}
$$

实务建议：  
Practical tips:

1. 固定一套稳定的 $\delta$（或按量纲缩放）。  
2. 给 L-BFGS-B 合理的 `maxiter` 和 `ftol/gtol`。  
3. 保留每步日志（$J_k, |g_k|, \kappa_k$）。

---

## 4. 与梯度下降的对比验收
## 4. Comparative Acceptance vs Gradient Descent

最小对比维度：
Minimum comparison dimensions:

1. 达到同等误差阈值所需迭代数  
2. 最终目标函数值  
3. 对初值扰动的敏感性  
4. 计算成本（函数评估次数）

常见现象：L-BFGS-B 在同等条件下迭代数更少、对步长调参依赖更低。  
Typical behavior: L-BFGS-B needs fewer iterations and is less sensitive to manual step-size tuning.

---

## 5. 什么时候优先用哪种方法
## 5. When to Prefer Which Method

1. 先学与调试阶段：优先梯度下降（透明、好诊断）  
2. 正式反演与批量实验：优先 L-BFGS-B（效率和稳定性更好）  
3. 若后续拿到解析梯度：L-BFGS-B 的优势会更明显

---

## 6. 小结
## 6. Summary

- Part 6 不是换问题，而是升级优化器。  
- 有限差分梯度仍可沿用，核心变化是更新策略从一阶到准二阶。  
- 与 Part 5 配套后，你就有“可解释基线 + 高效版本”两套反演方案。  
