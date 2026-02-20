# Heat Kappa Inverse Summary

## Scope
- Goal: estimate `kappa` from compact observation features.
- Evaluation slices: ID, OOD, and noisy-ID/OOD.
- Source: `infer_metrics_report.csv`.

## Method (Sigma Rule)
- Residual: `r = y_true - y_pred` (here `y` is `kappa`).
- Validation baseline: `mu = mean(r_val)`, `sigma = std(r_val)`.
- Anomaly threshold: `T = sigma_k * sigma`.
- Flag condition: `abs(r - mu) > T`.
- Notes: this rule uses residual statistics, not raw PDE state variables directly.

## Key Results
- Clean ID MAE: `0.000004`; clean OOD MAE: `0.000043` (OOD/ID ratio: `10.750000`x).
- ID noise degradation (max tested): `infer_id_noise_0p03` MAE=`0.001902`.
- OOD noise degradation (max tested): `infer_ood_noise_0p03` MAE=`0.003819`.

## Infer Metrics Table
| split | noise_std | mae | rmse | maxae | anomaly_ratio |
|---|---:|---:|---:|---:|---:|
| infer_id | 0.000000 | 0.000004 | 0.000005 | 0.000012 | 0.000000 |
| infer_id_noise_0p01 | 0.010000 | 0.000474 | 0.000640 | 0.001555 | 0.966667 |
| infer_id_noise_0p03 | 0.030000 | 0.001902 | 0.002459 | 0.006736 | 0.983333 |
| infer_ood | 0.000000 | 0.000043 | 0.000046 | 0.000074 | 1.000000 |
| infer_ood_noise_0p01 | 0.010000 | 0.001262 | 0.001553 | 0.004616 | 0.983333 |
| infer_ood_noise_0p03 | 0.030000 | 0.003819 | 0.004891 | 0.014047 | 1.000000 |

## Interpretation
- The inverse regressor is accurate on clean ID data.
- Error rises under distribution shift and observation noise, as expected.
- Current sigma-rule anomaly flagging is sensitive and may over-flag noisy ID samples.

## Next Actions
- Calibrate anomaly threshold (`sigma_k`) to reduce noisy-ID false positives.
- Keep OOD alerting high while improving ID robustness.
- For real unlabeled deployment, add feature-space OOD detection.

