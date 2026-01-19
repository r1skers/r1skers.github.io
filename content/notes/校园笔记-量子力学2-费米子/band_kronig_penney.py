import numpy as np
import matplotlib.pyplot as plt

# Kronig-Penney model (1D, delta-barrier form)
# Dispersion: cos(k a) = cos(q a) + (P / (q a)) sin(q a)
# where q = sqrt(2mE)/hbar, and P controls barrier strength.

hbar = 1.0
m = 1.0

a = 1.0
P = 3.0  # barrier strength (dimensionless)

# Energy grid (avoid E=0 to prevent division by zero)
E = np.linspace(0.02, 12.0, 4000)
q = np.sqrt(2.0 * m * E) / hbar
qa = q * a

# Right-hand side of the dispersion relation
rhs = np.cos(qa) + (P / (qa)) * np.sin(qa)

# Allowed bands satisfy |rhs| <= 1
mask = np.abs(rhs) <= 1.0

# Compute k from arccos(rhs) for allowed energies
k = np.full_like(E, np.nan)
k[mask] = np.arccos(rhs[mask]) / a

# Plot: show allowed bands in (k, E)
plt.figure(figsize=(7, 4))
plt.plot(k, E, '.', markersize=1.5, color='#1f77b4')
plt.plot(-k, E, '.', markersize=1.5, color='#1f77b4')  # symmetric branch

plt.xlabel('k')
plt.ylabel('Energy E (arb. units)')
plt.title('Kronig-Penney Bands (delta-barrier model)')
plt.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()