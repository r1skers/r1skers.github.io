---
title: '应用数学第3部分：以 Ink Diffusion 串联 PDE 与误差控制 / Applied Mathematics Part 3: Integrating PDE and Error Control via Ink Diffusion'
date: '2026-02-19T23:20:01+09:00'
draft: false
summary: "用 ForgeFlow Artifact-2.3（ink_diffusion）把前两篇主线合并：从高斯初值、PDE 五点差分仿真到监督回归，并附上时间/空间收敛实测结果。 / Use ForgeFlow Artifact-2.3 (ink_diffusion) to connect Part 1 and Part 2: from Gaussian initialization and five-point PDE simulation to supervised regression, with measured temporal/spatial convergence results."
description: "Applied Math Part 3 bridge note with measured ink_diffusion convergence reports."
tags:
  - "PDE"
  - "Ink Diffusion"
  - "Five-Point Stencil"
  - "CFL"
  - "Convergence Order"
  - "Richardson Extrapolation"
categories:
  - "Crucible"
---

# 应用数学 Part 3：用 Ink Diffusion 把前两篇连成一条工程链
# Applied Math Part 3: Connecting the First Two Notes Through an Ink Diffusion Workflow

这篇不按公式块拆解，而是按真实研发顺序展开：问题定义 -> 初值构建 -> PDE 仿真 -> 监督回归 -> 误差验收。  
This note follows the actual engineering order instead of isolated formula blocks: problem framing -> initialization -> PDE simulation -> supervised regression -> error acceptance.

---

## 1. 问题定义
## 1. Problem Framing

本研究对象是**二维墨水扩散模型**（`ink_diffusion`）：在给定初值与边界条件下，研究场变量 \(h(x,y,t)\) 的时空演化，并验证该流程是否可稳定、可学习、可验收。  
The study target is the **2D ink diffusion model** (`ink_diffusion`): given an initial field and boundary conditions, we model the spatiotemporal evolution of \(h(x,y,t)\) and verify whether the pipeline is stable, learnable, and auditable.

具体研究问题分为四条：  
The concrete research questions are:

建模前提（本实例当前口径）：时间离散采用前向欧拉（一阶），空间离散采用五点差分（二阶）。  
Modeling assumption (current scope of this case): first-order temporal discretization (forward Euler) and second-order spatial discretization (five-point stencil).

1. 数值可行性：显式 PDE 求解是否满足 CFL 稳定性并保持质量守恒。 / Numerical feasibility: whether explicit PDE solving satisfies CFL stability and mass conservation.
2. 机理映射：五点差分更新是否能在工程实现中稳定复现扩散行为。 / Mechanism mapping: whether the five-point stencil update reproduces diffusion behavior robustly in implementation.
3. 学习可行性：局部邻域特征能否支持 surrogate 的一步预测。 / Learning feasibility: whether local neighborhood features support one-step surrogate prediction.
4. 误差可验收性：时间/空间收敛阶是否与理论预期一致。 / Error audibility: whether temporal/spatial convergence trends match theoretical expectations.

---

## 2. 链条总览（与笔记顺序一致）
## 2. Chain Overview (Aligned with Note Order)

1. Step-1：正态分布 CSV 基底（对应 Part 1 的高斯初值）。 / Gaussian CSV baseline (maps to Part 1 Gaussian initialization).
2. Step-2：PDE 仿真（对应 Part 1 的 PDE、五点差分和 CFL）。 / PDE simulation (maps to Part 1 PDE, five-point stencil, and CFL).
3. Step-3：监督回归（由轨迹构建样本并训练 surrogate）。 / Supervised regression (build samples from trajectory and train surrogate).
4. Step-4：误差检测（对应 Part 2，已完成实测）。 / Error validation (maps to Part 2, now backed by measured reports).

---

## 3. Step-1：构建正态分布基底（CSV）
## 3. Step-1: Build the Gaussian Baseline (CSV)

初值文件是 `ForgeFlowApps/ink_diffusion/data/processed/initial.csv`，字段为 `x,y,h`。  
The initialization file is `ForgeFlowApps/ink_diffusion/data/processed/initial.csv` with schema `x,y,h`.

当前网格规模是 `100x100`，总计 `10000` 行。  
Current grid size is `100x100`, i.e., `10000` rows.

常用高斯初值表达为：  
A common Gaussian initialization is:

$$
h_0(x,y)=\exp\!\left(-\frac{(x-x_c)^2+(y-y_c)^2}{2\sigma^2}\right)
$$

这里对应 Part 1 里的高斯初值语义：  
This directly corresponds to the Gaussian initialization concept in Part 1:

[应用数学 Part 1：偏微分方程（高斯初值） / Applied Mathematics Part 1: PDE (Gaussian Initial Condition)](/notes/笔记-应用数学1-偏微分方程/)

---

## 4. Step-2：PDE 仿真主线
## 4. Step-2: PDE Simulation Mainline 

运行主仿真命令：  
Run simulation mainline with:

```bash
python main.py --config ForgeFlowApps/ink_diffusion/config/run.json
```

理论背景对应 Part 1 的 PDE 主线：  
The theory link is the Part 1 PDE pipeline:

[应用数学 Part 1：PDE 主线（扩散方程、五点差分、CFL） / Applied Mathematics Part 1: PDE Pipeline](/notes/笔记-应用数学1-偏微分方程/)

连续模型：
Continuous model:

$$
\frac{\partial h}{\partial t}=\kappa\nabla^2 h
$$

`run.json` 关键参数：  
Key `run.json` parameters:

| 参数 | 值 |
|---|---|
| `steps` | `200` |
| `dt` | `0.04` |
| `dx`, `dy` | `0.1`, `0.1` |
| `kappa` | `0.05` |
| `boundary` | `periodic` |
| `strict_cfl` | `true` |

该步每个时间步执行的核心更新式（五点差分 + 前向欧拉）为：  
The per-step core update (five-point stencil + forward Euler) is:

$$
h_{i,j}^{n+1}
=h_{i,j}^{n}
+\frac{\kappa\Delta t}{\Delta x^2}
\left(h_{i+1,j}^{n}+h_{i-1,j}^{n}+h_{i,j+1}^{n}+h_{i,j-1}^{n}-4h_{i,j}^{n}\right)
$$

本环节输出：
Outputs of this stage:

1. `ForgeFlowApps/ink_diffusion/output/trajectory.csv`
2. `ForgeFlowApps/ink_diffusion/output/eval_report.csv`

---

## 5. Step-3：监督回归支线（用了什么，生成了什么）
## 5. Step-3: Supervised Regression Branch (What Is Used and What Is Produced)

先把轨迹转成监督样本：  
First convert trajectory to supervised samples:

```bash
python ForgeFlowApps/ink_diffusion/scripts/build_supervised_samples.py
```

该步骤把相邻时刻配成 `h_t -> h_t1`。  
This step pairs adjacent states as `h_t -> h_t1`.

再构建 surrogate 训练/推理数据：  
Then build surrogate train/infer datasets:

```bash
python ForgeFlowApps/ink_diffusion/scripts/build_surrogate_datasets.py
```

这里的输入特征是五点邻域：`h_t, h_up, h_down, h_left, h_right`，目标是 `h_t1`。  
The feature set is the five-point neighborhood `h_t, h_up, h_down, h_left, h_right`, and the target is `h_t1`.

运行 surrogate 流程（当前模型为 `LinearDynamicsRegressor`）：  
Run surrogate pipeline (current model: `LinearDynamicsRegressor`):

```bash
python main.py --config ForgeFlowApps/ink_diffusion/config/surrogate_run.json
```

本环节输出：
Outputs of this stage:

1. `ForgeFlowApps/ink_diffusion/data/processed/supervised_samples.csv`
2. `ForgeFlowApps/ink_diffusion/data/processed/surrogate_train.csv`
3. `ForgeFlowApps/ink_diffusion/data/processed/surrogate_infer.csv`
4. `ForgeFlowApps/ink_diffusion/output/surrogate_predictions.csv`
5. `ForgeFlowApps/ink_diffusion/output/surrogate_eval_report.csv`

可选生成可视化报告：  
Optional visualization report:

```bash
python ForgeFlowApps/ink_diffusion/scripts/plot_report.py
```

---

## 6. Step-4：误差检测（实测结果）
## 6. Step-4: Error Validation (Measured Results)

本节基于 `ForgeFlowApps/ink_diffusion/output/` 下的两份报告：  
This section is based on two reports under `ForgeFlowApps/ink_diffusion/output/`:

1. `convergence_report.csv`（时间步加密） / `convergence_report.csv` (time-step refinement).
2. `spatial_convergence_report.csv`（空间网格加密） / `spatial_convergence_report.csv` (spatial refinement).

### 6.1 时间收敛（固定空间网格）
### 6.1 Temporal Convergence (Fixed Spatial Grid)

口径：固定 `nx=ny=100`，总物理时长 `T=8.0`，比较 `dt=0.04/0.02/0.01`，以 `dt=0.01` 为参考解。  
Setup: fix `nx=ny=100`, total physical time `T=8.0`, compare `dt=0.04/0.02/0.01`, and use `dt=0.01` as reference.

| case | dt | steps | error_l2_vs_ref | error_linf_vs_ref | observed_order_l2 | observed_order_linf | status |
|---|---:|---:|---:|---:|---:|---:|---|
| dt_0.04 | 0.04 | 200 | 5.7761e-05 | 5.1954e-04 | - | - | PASS |
| dt_0.02 | 0.02 | 400 | 1.9245e-05 | 1.7328e-04 | 1.5856 | 1.5842 | PASS |
| dt_0.01 | 0.01 | 800 | 0 | 0 | - | - | PASS |

结论：时间收敛阶约为 `p≈1.58`，与前向欧拉“一阶时间精度”预期一致（在当前时空耦合设置下略高于 1）。  
Conclusion: observed temporal order is `p≈1.58`, consistent with first-order-in-time forward Euler behavior (slightly above 1 under the current coupled setup).

### 6.2 空间收敛（嵌套网格）
### 6.2 Spatial Convergence (Nested Grids)

口径：基于 `100x100` 初值做 stride 下采样，比较 `stride=4/2/1`（即 `25x25/50x50/100x100`），总时长仍为 `T=8.0`，最细网格 `stride=1` 为参考解。  
Setup: downsample from the `100x100` initial field with `stride=4/2/1` (`25x25/50x50/100x100`), keep `T=8.0`, and use finest grid `stride=1` as reference.

| case | stride | grid | dx | dt | steps | error_l2_vs_ref | error_linf_vs_ref | observed_order_l2 | observed_order_linf | status |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---|
| stride_4 | 4 | 25x25 | 0.4 | 0.61538462 | 13 | 4.2889e-04 | 3.0847e-03 | - | - | PASS |
| stride_2 | 2 | 50x50 | 0.2 | 0.16 | 50 | 9.3460e-05 | 7.7795e-04 | 2.1982 | 1.9874 | PASS |
| stride_1 | 1 | 100x100 | 0.1 | 0.04 | 200 | 0 | 0 | - | - | PASS |

结论：空间收敛阶接近二阶（`L2≈2.20`，`L∞≈1.99`），与五点差分空间二阶精度预期一致。  
Conclusion: spatial order is near second-order (`L2≈2.20`, `L∞≈1.99`), matching the expected second-order accuracy of the five-point stencil.

### 6.3 验收判断
### 6.3 Acceptance Verdict

1. 稳定性：全部 case `stable_cfl=True`。 / Stability: all cases have `stable_cfl=True`.
2. 守恒性：`mass_delta_abs=0`（在报告精度下）且 `status=PASS`。 / Conservation: `mass_delta_abs=0` (at report precision) and `status=PASS`.
3. 收敛性：时间阶与空间阶趋势均与理论一致，可作为后续 Richardson/多步 rollout 的可信基线。 / Convergence: temporal and spatial order trends are consistent with theory, giving a reliable baseline for Richardson and long-horizon rollout.

### 6.4 复现实验命令
### 6.4 Repro Commands

```bash
python ForgeFlowApps/ink_diffusion/scripts/run_convergence_study.py
python ForgeFlowApps/ink_diffusion/scripts/run_spatial_convergence_study.py
```

Part 2 参考入口：  
Part 2 reference:

[应用数学 Part 2：误差分析与理查德森外推 / Applied Mathematics Part 2: Error Analysis and Richardson Extrapolation](/notes/笔记-应用数学2-误差分析与理查德森外推/)

---

## 7. 链条总结
## 7. Chain Summary

`高斯 CSV 基底 -> PDE 五点差分仿真 -> 监督回归 -> 误差验收`。  
`Gaussian CSV baseline -> PDE five-point simulation -> supervised regression -> error acceptance`.

这就是应用数学 Part 1 与 Part 2 在 `ink_diffusion` 实例中的工程化落地顺序。  
This is the engineering execution order that unifies Applied Mathematics Part 1 and Part 2 in the `ink_diffusion` case.
