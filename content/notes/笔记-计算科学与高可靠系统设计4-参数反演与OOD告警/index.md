---
date: '2026-02-20T22:10:00+09:00'
draft: false
title: '计算科学与高可靠系统设计第4部分：参数反演、OOD告警与可靠性门禁 / Computational Science & High-Reliability Systems Design Part 4: Parameter Inversion, OOD Alerting, and Reliability Gates'
summary: "按“kappa变化 -> 特征提取 -> 反演估计 -> ID可信度 -> OOD告警 -> 噪声鲁棒性”主线，整理参数反演问题在工程中的最小闭环。 / This note organizes a minimal engineering loop for parameter inversion: kappa variation -> feature extraction -> inverse estimation -> ID reliability -> OOD alerting -> noise robustness."
description: "Part 4 note on inverse parameter estimation, OOD alerting, and reliability gates."
tags: ["PDE", "Inverse Problem", "Parameter Estimation", "ID/OOD", "Robustness", "Numerical Methods", "Reliability", "UQ"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-应用数学4-参数反演与OOD告警/
---

# 参数反演：从正问题到可靠告警
# Parameter Inversion: From Forward Process to Reliable Alerts

这篇对应你手稿里的主线，目标是回答一句话：  
This note follows the exact chain in your draft and answers one question:

已知扩散过程的观测特征，能不能稳定反推参数，并且知道“什么时候该信、什么时候该报警”？  
Given observed features of a diffusion process, can we reliably invert parameters and know when to trust vs. when to raise alerts?

---

## 1. 问题定义（正问题与反问题） / Problem Setup (Forward vs Inverse)

以二维扩散模型为例：  
Take a 2D diffusion model:

$$
\frac{\partial h}{\partial t}=\kappa \nabla^2 h
$$

正问题（Forward）是：给定 $\kappa$，求场变量演化 $h(x,y,t)$。  
The forward problem is: given $\kappa$, solve field evolution $h(x,y,t)$.

反问题（Inverse）是：给定观测特征 $z$，估计 $\kappa$。  
The inverse problem is: given observed features $z$, estimate $\kappa$.

可写成两步映射：  
It can be written as a two-step mapping:

$$
\kappa \xrightarrow{\text{simulate}} h(x,y,t) \xrightarrow{\Phi} z
$$

$$
\hat{\kappa}=f_\theta(z)
$$

这里 $\Phi$ 是特征提取算子，$f_\theta$ 是反演模型。  
Here, $\Phi$ is feature extraction, and $f_\theta$ is the inverse regressor.

---

## 2. 特征构建：把场演化压缩成可学习变量 / Feature Construction

在 `heat_kappa_inverse` 里，当前采用紧凑特征：  
In `heat_kappa_inverse`, current compact features are:

- `decay_rate_l2 = -log(l2_t2 / l2_t1) / (t2 - t1)`
- `mean_abs_t1`
- `mean_abs_t2`

目标标签是 `kappa`。  
The target label is `kappa`.

这一步对应你手稿中的“变更 $k$ -> 不同组特征值”。  
This is the exact step in your draft: “change $k$ -> different feature groups”.

参考实现：  
Reference implementation:

- `ForgeFlowApps/heat_kappa_inverse/stage1_data_gen/config/generate.json`
- `ForgeFlowApps/heat_kappa_inverse/stage1_data_gen/scripts/build_dataset.py`

---

## 3. ID 可信度：在定义区间内做可解释验收 / ID Reliability in Defined Range

ID（in-distribution）指参数位于训练定义域，例如当前配置中：  
ID means parameter values stay in training range; in current config:

$$
\kappa \in [0.01,\,0.12]
$$

工程上先在 ID 区间采样，计算误差统计量：  
Engineering practice samples within ID and evaluates error statistics:

$$
\mathrm{MAE}=\frac{1}{N}\sum_{i=1}^N |\kappa_i-\hat{\kappa}_i|
$$

$$
\mathrm{RMSE}=\sqrt{\frac{1}{N}\sum_{i=1}^N(\kappa_i-\hat{\kappa}_i)^2}
$$

可以把这一步理解为“Monte-Carlo 式抽样检验”：  
This can be viewed as a Monte-Carlo style sampling check:

- 区间内随机抽样参数，并批量跑正问题提取特征 / sample in-range parameters and batch-run forward solves for feature extraction.
- 检查反演误差是否在门限内 / verify inversion error stays within acceptance gates.

### 3.1 ID 主门禁如何检查 / How the ID Main Gate Is Checked

在当前工程实现中，ID 主门禁不是看一条曲线，而是看验证集三指标是否同时过阈值：  
In the current implementation, the ID main gate is not a single-curve check; it requires all three validation metrics to pass thresholds.

$$
\text{PASS} \Longleftrightarrow
\left(\mathrm{MAE}_{val}\le \tau_{\mathrm{mae}}\right)\land
\left(\mathrm{RMSE}_{val}\le \tau_{\mathrm{rmse}}\right)\land
\left(\mathrm{MaxAE}_{val}\le \tau_{\mathrm{maxae}}\right)
$$

其中阈值来自 `run_id.json` 的 `eval_policy`：  
Thresholds come from `eval_policy` in `run_id.json`:

- $\tau_{\mathrm{mae}}=0.003$
- $\tau_{\mathrm{rmse}}=0.004$
- $\tau_{\mathrm{maxae}}=0.01$

当前这次 ID 报告（`eval_report_id.csv`）是：  
Current ID report (`eval_report_id.csv`) gives:

- $\mathrm{MAE}_{val}=0.000005$
- $\mathrm{RMSE}_{val}=0.000006$
- $\mathrm{MaxAE}_{val}=0.000013$

因此三项均过线，状态是 `PASS`。  
All three are below thresholds, so status is `PASS`.

## 4. 检测方法独立拆解 / Method-First Detection Toolkit

这一节先不绑定具体实例，只讲“方法定义 + 适用目标 + 优缺点”。  
This section is case-agnostic and focuses on method definition, usage target, and trade-offs.

### 4.1 方法A：误差门禁（Error Gate）

适用目标：有标签场景下的主验收。  
Use case: primary acceptance in labeled settings.

判定逻辑：  
Decision rule:

$$
\text{PASS} \Longleftrightarrow
\left(\mathrm{MAE}\le \tau_{\mathrm{mae}}\right)\land
\left(\mathrm{RMSE}\le \tau_{\mathrm{rmse}}\right)\land
\left(\mathrm{MaxAE}\le \tau_{\mathrm{maxae}}\right)
$$

优点：简单、可审计。缺点：依赖真值标签。  
Pros: simple and auditable. Limitation: requires labels.

### 4.2 方法B：残差 Sigma 法则（Residual Sigma Rule）

适用目标：异常率监控（ID/OOD/噪声切片对比）。  
Use case: anomaly-rate monitoring across ID/OOD/noise slices.

定义残差：  
Residual definition:

$$
r_i=\kappa_i-\hat{\kappa}_i
$$

在验证集估计：  
Validation baseline:

$$
\mu_{\mathrm{val}}=\frac{1}{N}\sum_{i=1}^N r_i,\qquad
\sigma_{\mathrm{val}}=\sqrt{\frac{1}{N-1}\sum_{i=1}^N(r_i-\mu_{\mathrm{val}})^2}
$$

告警规则：  
Alert rule:

$$
T=\sigma_k\,\sigma_{\mathrm{val}},\qquad
\text{flag if } |r_i-\mu_{\mathrm{val}}|>T
$$

`sigma_k=3` 是常见默认值。若残差近似正态，有  
`sigma_k=3` is a common default. Under normal-like residuals:

$$
\mathbb{P}(|X-\mu|\le 3\sigma)\approx 99.73\%
$$

但工程中可按“误报 vs 漏报”目标调参。  
In practice, tune `sigma_k` for false-alarm vs miss trade-off.

### 4.3 方法C：特征空间 OOD 检测（Feature-Space OOD）

适用目标：无标签/弱标签条件下先判断“输入像不像训练分布”。  
Use case: unlabeled/weakly-labeled settings to check whether inputs resemble training distribution.

典型形式（示意）可写成分布距离阈值：  
A typical formulation is distance-thresholding in feature space:

$$
d^2(z)=(z-\mu_z)^\top\Sigma_z^{-1}(z-\mu_z),\quad
\text{flag if } d^2(z)>\tau_d
$$

它与误差门禁互补，不是替代关系。  
This complements, not replaces, the error-gate method.

### 4.4 回归到本实例：heat_kappa_inverse 用了哪些方法

当前 `heat_kappa_inverse` 的方法映射是：  
Current method mapping in `heat_kappa_inverse`:

- 使用方法A做 ID 主验收（`eval_policy` 三阈值）。  
- Method A is used for ID primary acceptance (three `eval_policy` thresholds).
- 使用方法B做 ID/OOD/噪声切片异常率监控。  
- Method B is used for anomaly-rate monitoring on ID/OOD/noise slices.
- 暂未接入方法C（特征空间 OOD）。  
- Method C (feature-space OOD) is not integrated yet.

当前实例的 OOD 参数区间是：  
Current OOD parameter range in this case:

$$
\kappa \in [0.13,\,0.18]
$$

按扫值结果（3/4/5）看，`sigma_k=4` 在保持 `OOD anomaly mean >= 0.95` 的同时，比 `sigma_k=3` 具有更低 noisy-ID 误报。  
From sigma sweep (3/4/5), `sigma_k=4` keeps `OOD anomaly mean >= 0.95` while reducing noisy-ID false alarms versus `sigma_k=3`.

---

## 5. 高斯白噪声注入：鲁棒性压力测试 / Gaussian White-Noise Robustness

你手稿里提到“高斯白噪声注入”，在这里可写成：  
Your draft includes Gaussian white-noise injection, formalized as:

$$
\tilde{z}=z+\epsilon,\qquad \epsilon\sim \mathcal{N}(0,\sigma_n^2 I)
$$

意义是：  
Purpose:

- 不改变底层 PDE 机理，只扰动观测 / keep PDE mechanism unchanged and perturb observations only.
- 测试反演器对测量误差的容忍度 / measure estimator tolerance to observation noise.
- 与 OOD 告警联动观察误报和漏报 / jointly inspect false alarms and misses with OOD alerts.

当前工程里已经有 `1%`、`3%` 两档噪声切片用于对比。  
Current pipeline already includes `1%` and `3%` noise slices for comparison.

---

## 6. 工程闭环：一条可复现链路 / Reproducible Engineering Loop

从流程角度，这条链可以压成 6 步：  
From workflow perspective, the loop is six steps:

- `Step-1` 采样 $\kappa$ 并生成正问题数据 / sample $\kappa$ and generate forward data.
- `Step-2` 提取特征并形成 `train / infer_id / infer_ood` / extract features and form `train / infer_id / infer_ood`.
- `Step-3` 训练 `features -> kappa` 反演回归器 / train inverse regressor `features -> kappa`.
- `Step-4` 做 ID 验收（MAE/RMSE/MaxAE） / run ID acceptance checks.
- `Step-5` 做 OOD + 噪声压力测试 / run OOD + noise stress tests.
- `Step-6` 用 sigma 规则输出告警结论与阈值建议 / output alert decisions and threshold recommendation via sigma-rule.

对应实例入口：  
Mapped case entry:

- [Artifact-2.5：Heat Kappa Inverse 参数反演验证](/artifacts/02-forgeflow/2-5-heat-kappa-inverse/)

---

## 7. 与前几篇的关系 / Relation to Previous Notes

- Part 1 提供 PDE、五点差分和 CFL 的正问题底座 / Part 1 provides the forward PDE foundation (five-point stencil + CFL).
- Part 2 提供误差分析与阈值思维 / Part 2 provides error-analysis logic and reliability criteria.
- Part 3 展示完整扩散流程实例（ink_diffusion） / Part 3 demonstrates an end-to-end diffusion workflow (ink_diffusion).
- Part 4 把焦点转到参数反演与 ID/OOD 决策 / Part 4 shifts focus to parameter inversion and ID/OOD decisions.

---

## 8. 小结 / Summary

这篇的核心不是“把反演做出来”，而是“把反演做成可验收系统”：  
The core here is not only “making inversion work”, but “making it auditable”:

- 有定义域内精度； / in-range accuracy;
- 有区间外告警； / out-of-range alerting;
- 有噪声下鲁棒性画像。 / noise robustness profile.

下一步可以自然接到“参数反演 Part 2：不确定性定量（区间估计/贝叶斯口径）”。  
A natural next step is “Parameter Inversion Part 2: quantified uncertainty (interval/Bayesian views)”.
