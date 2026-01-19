import numpy as np
import matplotlib.pyplot as plt

# Fermi-Dirac distribution at T > 0 K
EF = 0.0
kB = 1.0  # set k_B = 1 for a dimensionless demo
T = 0.1

# Show a wider energy range so the smearing is only near EF
E = np.linspace(-1.0, 1.0, 600)
f = 1.0 / (np.exp((E - EF) / (kB * T)) + 1.0)

plt.figure(figsize=(6, 4))
plt.plot(E, f, color='black', linewidth=2)
plt.axvline(EF, color='red', linestyle='--', linewidth=1)
plt.text(EF + 0.03, 0.5, r'$E_F$', color='red')
plt.ylim(-0.05, 1.05)
plt.xlabel('Energy E')
plt.ylabel('f(E)')
plt.title('Fermi-Dirac Distribution at T > 0 K')
plt.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()