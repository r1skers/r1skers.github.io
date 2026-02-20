---
title: "[Artifact-2.5] Heat Kappa Inverse 参数反演验证 / Heat Kappa Inverse Parameter Inversion"
date: '2026-02-20T00:30:00+09:00'
draft: false
summary: "`heat_kappa_inverse` 的两阶段参数反演记录：先生成 `kappa -> features` 数据，再做 `features -> kappa` 回归，并给出 ID/OOD/噪声鲁棒性结果。 / Two-stage parameter-inversion record for `heat_kappa_inverse`: build `kappa -> features` data first, then regress `features -> kappa`, with ID/OOD/noise robustness results."
description: "Artifact-2.5 for heat_kappa_inverse: dataset generation, inverse regression, ID/OOD analysis, and sigma-k anomaly calibration."
tags:
  - "Artifact"
  - "ForgeFlow"
  - "Heat Equation"
  - "Parameter Inversion"
  - "ID/OOD"
  - "Robustness"
categories:
  - "Artifacts"
weight: 25
aliases:
  - /artifacts/forgeflow-heat-kappa-inverse/
---

## 1. 目标 / Goal

本页记录 `heat_kappa_inverse` 的参数反演验证：从观测特征反推扩散系数 `kappa`，并检查 ID/OOD 与噪声条件下的可用性。  
This page records `heat_kappa_inverse` parameter-inversion validation: infer diffusion coefficient `kappa` from observation features and evaluate usability under ID/OOD and noisy conditions.

核心映射是：  
Core mapping:

- 正演数据生成：`kappa -> features`  
- Forward data generation: `kappa -> features`
- 反演模型学习：`features -> kappa`  
- Inverse model learning: `features -> kappa`

## 2. 页面范围 / Scope

本页分两阶段：  
This page has two stages:

1. Stage-1 数据生成 / Stage-1 data generation
2. Stage-2 反演回归与鲁棒性评估 / Stage-2 inverse regression and robustness evaluation

对应目录：`ForgeFlowApps/heat_kappa_inverse/`。  
Mapped app directory: `ForgeFlowApps/heat_kappa_inverse/`.

## 3. Stage-1：数据生成（kappa 采样 -> 观测特征）
## 3. Stage-1: Data Generation (kappa Sampling -> Observation Features)

配置文件 / Config file: `ForgeFlowApps/heat_kappa_inverse/stage1_data_gen/config/generate.json`

关键设置 / Key setup:

- 网格：`nx=64`, `ny=64`
- 时间窗：`t1∈[0.03,0.08]`, `t2∈[0.16,0.30]`
- `kappa` 区间：`train=[0.01,0.12]`, `infer_id=[0.01,0.12]`, `infer_ood=[0.13,0.18]`
- 数据规模：`train=220`, `infer_id=60`, `infer_ood=60`
- 噪声级别：`0.01`, `0.03`

执行命令 / Run command:

```bash
python ForgeFlowApps/heat_kappa_inverse/stage1_data_gen/scripts/build_dataset.py
```

主要输出 / Main outputs:

- `ForgeFlowApps/heat_kappa_inverse/data/processed/train.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_id.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_ood.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_id_noise_0p01.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_id_noise_0p03.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_ood_noise_0p01.csv`
- `ForgeFlowApps/heat_kappa_inverse/data/processed/infer_ood_noise_0p03.csv`
- `ForgeFlowApps/heat_kappa_inverse/stage1_data_gen/output/manifest.csv`

## 4. Stage-2：反演回归（features -> kappa）
## 4. Stage-2: Inverse Regression (features -> kappa)

ID/OOD 基础配置 / Base configs:

- `ForgeFlowApps/heat_kappa_inverse/stage2_inverse/config/run_id.json`
- `ForgeFlowApps/heat_kappa_inverse/stage2_inverse/config/run_ood.json`

模型配置要点 / Model setup highlights:

- `adapter_ref = ...HeatKappaInverseAdapter`
- `model_ref = ...KappaLinearRegressor`
- `split = {train_ratio:0.8, shuffle:true, seed:42}`
- `eval_policy = {val_mae_max:0.003, val_rmse_max:0.004, val_maxae_max:0.01}`
- `anomaly.sigma_k = 3.0`（基线）

执行命令 / Run commands:

```bash
python main.py --config ForgeFlowApps/heat_kappa_inverse/stage2_inverse/config/run_id.json
python main.py --config ForgeFlowApps/heat_kappa_inverse/stage2_inverse/config/run_ood.json
python ForgeFlowApps/heat_kappa_inverse/stage2_inverse/scripts/summarize_infer_metrics.py --skip-missing
```

验证集结果（`eval_report_id.csv`, `eval_report_ood.csv`）/ Validation result:

| Item | Value |
|---|---:|
| train_samples | 176 |
| val_samples | 44 |
| val_mae | 0.000005 |
| val_rmse | 0.000006 |
| val_maxae | 0.000013 |
| status | PASS |

## 5. ID/OOD 与噪声鲁棒性
## 5. ID/OOD and Noise Robustness

汇总来源：`ForgeFlowApps/heat_kappa_inverse/output/infer_metrics_report.csv`。  
Summary source: `ForgeFlowApps/heat_kappa_inverse/output/infer_metrics_report.csv`.

| split | noise_std | mae | rmse | maxae | anomaly_ratio |
|---|---:|---:|---:|---:|---:|
| infer_id | 0.000000 | 0.000004 | 0.000005 | 0.000012 | 0.000000 |
| infer_id_noise_0p01 | 0.010000 | 0.000474 | 0.000640 | 0.001555 | 0.966667 |
| infer_id_noise_0p03 | 0.030000 | 0.001902 | 0.002459 | 0.006736 | 0.983333 |
| infer_ood | 0.000000 | 0.000043 | 0.000046 | 0.000074 | 1.000000 |
| infer_ood_noise_0p01 | 0.010000 | 0.001262 | 0.001553 | 0.004616 | 0.983333 |
| infer_ood_noise_0p03 | 0.030000 | 0.003819 | 0.004891 | 0.014047 | 1.000000 |

结论 / Quick read:

- Clean ID 精度很高（MAE 约 `4e-6`）。  
- OOD 与噪声会显著抬升误差，符合预期。  
- 当前 anomaly 规则较敏感，噪声样本容易被大量标记。

## 6. Sigma-K 校准
## 6. Sigma-K Calibration

来源：`sigma_k_sweep_report.csv`, `sigma_k_recommendation.md`。  
Source: `sigma_k_sweep_report.csv`, `sigma_k_recommendation.md`.

推荐值：`sigma_k = 4.0`。  
Recommended value: `sigma_k = 4.0`.

| sigma_k | id_noisy_anomaly_mean | ood_anomaly_mean |
|---:|---:|---:|
| 3.00 | 0.975000 | 0.994444 |
| 4.00 | 0.966666 | 0.966667 |
| 5.00 | 0.950000 | 0.922222 |

该选择在保持 OOD 告警能力（>=0.95）前提下，兼顾降低 noisy-ID 误报。  
This choice keeps OOD alerting high (>=0.95) while reducing noisy-ID false positives.

## 7. 可视化 / Visualization

[![Heat Kappa Inverse Scatter Report](kappa_scatter_report.png)](kappa_scatter_report.png)

_Predicted vs true kappa scatter across ID/OOD/noise slices._

## 8. 验收逻辑（门禁顺序） / Acceptance Logic (Gate Order)

1. 数据门 / Data gate  
   - Stage-1 数据文件完整且区间采样正确。  
   - Stage-1 files are complete with valid range sampling.
2. 回归质量门 / Regression quality gate  
   - 验证指标低于 `eval_policy` 阈值。  
   - Validation metrics stay below `eval_policy` thresholds.
3. ID/OOD 对比门 / ID-OOD contrast gate  
   - 记录 clean OOD 相对 ID 的误差放大。  
   - Record clean OOD error inflation relative to ID.
4. 噪声鲁棒门 / Noise robustness gate  
   - 在 1%/3% 噪声下输出误差与异常率曲线。  
   - Produce error/anomaly responses under 1%/3% noise.
5. 阈值校准门 / Threshold calibration gate  
   - 给出 `sigma_k` 推荐值与选择依据。  
   - Provide `sigma_k` recommendation with selection rationale.
6. 产物完整门 / Artifact completeness gate  
   - 报告 CSV/图表/总结文件齐全可读。  
   - CSV/plots/summary artifacts are complete and readable.

## 9. 当前边界 / Current Limits

- 当前反演是单参数 `kappa`，尚未扩展到空间变系数或多参数联合反演。  
- Current inversion targets single parameter `kappa`, not spatially varying or multi-parameter inversion yet.
- 当前特征是紧凑统计量（衰减率与幅值摘要），尚未引入更高维时空特征。  
- Current features are compact summaries (decay/amplitude), not higher-dimensional spatiotemporal encodings.
- OOD 检测目前基于残差 sigma 规则，后续可加入特征空间 OOD 检测。  
- OOD detection currently relies on residual sigma-rule; feature-space OOD detection can be added later.

## 10. 关联页面 / Linked Pages

- 框架本体 / Framework core: [Artifact-2.0](/artifacts/02-forgeflow/2-0-framework-core/)
- 上一项 / Previous: [Artifact-2.4](/artifacts/02-forgeflow/2-4-heat-periodic-benchmark/)
- 父索引 / Parent: [Artifact-2](/artifacts/02-forgeflow/)
