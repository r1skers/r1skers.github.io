import numpy as np
import matplotlib.pyplot as plt

# Fermi-Dirac distribution at T = 0 K
EF = 0.0
E = np.linspace(-2.0, 2.0, 500)
f = np.where(E < EF, 1.0, 0.0)

plt.figure(figsize=(6, 4))
plt.plot(E, f, color='black', linewidth=2)
plt.axvline(EF, color='red', linestyle='--', linewidth=1)
plt.text(EF + 0.05, 0.5, r'$E_F$', color='red')
plt.ylim(-0.1, 1.1)
plt.xlabel('Energy E')
plt.ylabel('f(E)')
plt.title('Fermi-Dirac Distribution at T = 0 K')
plt.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()