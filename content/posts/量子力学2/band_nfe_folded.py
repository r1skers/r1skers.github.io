import numpy as np
import matplotlib.pyplot as plt

# Nearly-free electron model (1D): fold free-electron parabola into 1st BZ
# and open a small gap at the zone boundary.

hbar = 1.0
m = 1.0

a = 1.0                      # lattice spacing
G = 2.0 * np.pi / a           # reciprocal lattice vector

# k range covering several zones
k = np.linspace(-2.5 * G, 2.5 * G, 2000)
E_free = (hbar * k) ** 2 / (2.0 * m)

# Fold to first Brillouin zone: k_reduced in [-G/2, G/2]
k_red = ((k + 0.5 * G) % G) - 0.5 * G

# Simple gap opening at zone boundary |k| = G/2
# Model: split energies near boundary by +/- Delta/2
Delta = 0.4
E_fold = (hbar * k_red) ** 2 / (2.0 * m)

# Two bands (lower/upper) with a gap at boundary
# Use a smooth gap centered at |k| = G/2 for visualization
boundary = 0.5 * G
x = np.abs(k_red)
# Smooth factor that peaks near boundary
w = np.exp(-((boundary - x) / (0.08 * G)) ** 2)
E_lower = E_fold - 0.5 * Delta * w
E_upper = E_fold + 0.5 * Delta * w

plt.figure(figsize=(7, 4))
plt.plot(k_red, E_lower, color='#1f77b4', linewidth=2, label='Lower band')
plt.plot(k_red, E_upper, color='#d62728', linewidth=2, label='Upper band')
plt.axvline(-boundary, color='gray', linestyle='--', linewidth=1)
plt.axvline(boundary, color='gray', linestyle='--', linewidth=1)
plt.xlabel('k (reduced, 1st BZ)')
plt.ylabel('Energy (arb. units)')
plt.title('Nearly-Free Electron: Folded Bands with a Gap')
plt.legend(loc='upper left')
plt.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()