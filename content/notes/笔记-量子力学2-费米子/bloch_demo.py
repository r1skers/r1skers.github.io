import numpy as np
import matplotlib.pyplot as plt

# 1D periodic potential and a Bloch-like wave
# psi_k(x) = u_k(x) * exp(i k x), where u_k(x) is periodic

# Lattice parameters
A = 1.0          # lattice period (arbitrary units)
N = 6            # number of periods to show
X_MIN = 0.0
X_MAX = N * A

# Wave parameters
K = 2.0 * np.pi / (3.0 * A)  # crystal momentum
MOD_AMP = 0.35               # amplitude of periodic modulation

# Spatial grid
x = np.linspace(X_MIN, X_MAX, 2000)

# Periodic potential (toy model)
V0 = 1.0
V = V0 * np.cos(2.0 * np.pi * x / A)

# Periodic part of Bloch function (u_k)
# Keep it simple: 1 + small cosine modulation with lattice period
u_k = 1.0 + MOD_AMP * np.cos(2.0 * np.pi * x / A)

# Bloch wave (real part only for visualization)
psi = u_k * np.cos(K * x)

# Plot
fig, ax1 = plt.subplots(figsize=(9, 4))
ax1.plot(x, V, color='#444444', linewidth=1.2, label='Periodic potential V(x)')
ax1.set_ylabel('Potential', color='#444444')
ax1.tick_params(axis='y', labelcolor='#444444')
ax1.set_xlabel('x (lattice units)')
ax1.set_title('Bloch Theorem Demo: Periodic u_k(x) and Plane-Wave Factor')

ax2 = ax1.twinx()
ax2.plot(x, psi, color='#1f77b4', linewidth=1.5, label='Re[psi_k(x)]')
ax2.plot(x, u_k, color='#d62728', linewidth=1.0, linestyle='--', label='u_k(x)')
ax2.set_ylabel('Wave amplitude')

# Combine legends
lines = ax1.get_lines() + ax2.get_lines()
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper right')

ax1.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()