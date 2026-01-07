import numpy as np
import matplotlib.pyplot as plt

# Combined plot: D(E), f(E), and n(E)=D(E)f(E) on one axis
# y-axis: Energy E, x-axis: values of D(E), f(E), and n(E)

EF = 1.0
kB = 1.0
T = 0.15

# Energy range (start from 0)
E = np.linspace(0.0, 2.5 * EF, 600)

# 3D DOS (shape only, normalized)
D = np.sqrt(E)
D = D / D.max()

# Fermi-Dirac occupation
f = 1.0 / (np.exp((E - EF) / (kB * T)) + 1.0)

# Occupied density
nE = D * f
nE = nE / nE.max()

# Plot
fig, ax = plt.subplots(figsize=(6, 6))

# Shade thermal window around EF
E1 = EF - 2.0 * kB * T
E2 = EF + 2.0 * kB * T
ax.axhspan(E1, E2, color='#ffdd88', alpha=0.4, label='Thermal window')

ax.plot(D, E, color='#1f77b4', linewidth=2, label='D(E) (DOS)')
ax.plot(f, E, color='#d62728', linewidth=2, label='f(E)')
ax.plot(nE, E, color='#2ca02c', linewidth=2, label='n(E)=D(E)f(E)')

ax.axhline(EF, color='black', linestyle='--', linewidth=1)
ax.text(0.02, EF + 0.03, r'$E_F$', color='black')

ax.set_xlabel('Normalized value')
ax.set_ylabel('Energy E')
ax.set_xlim(0, 1.05)
ax.set_ylim(0, 2.5 * EF)
ax.legend(loc='lower right')
ax.grid(True, alpha=0.2)
ax.set_title('DOS, Fermi-Dirac, and Occupied Density (T > 0 K)')

plt.tight_layout()
plt.show()