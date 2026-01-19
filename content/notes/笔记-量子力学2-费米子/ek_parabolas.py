import numpy as np
import matplotlib.pyplot as plt

# E-k diagram: direct-gap semiconductor (Ec and Ev at same k)

k = np.linspace(-2.0, 2.0, 600)

Eg = 1.0
Ec = Eg / 2.0
Ev = -Eg / 2.0

# Parabolic bands near k=0
alpha_c = 0.6
alpha_v = 0.6

E_c = Ec + alpha_c * k**2
E_v = Ev - alpha_v * k**2

plt.figure(figsize=(6, 4))
plt.plot(k, E_c, color='#1f77b4', linewidth=2, label='Conduction band')
plt.plot(k, E_v, color='#d62728', linewidth=2, label='Valence band')

# Mark band edges and gap at k=0
plt.axhline(Ec, color='#1f77b4', linestyle='--', linewidth=1)
plt.axhline(Ev, color='#d62728', linestyle='--', linewidth=1)
plt.axvline(0.0, color='gray', linestyle='--', linewidth=1)
plt.text(0.05, Ec + 0.02, 'Ec', color='#1f77b4')
plt.text(0.05, Ev - 0.08, 'Ev', color='#d62728')
plt.text(0.1, 0.0, 'Eg (direct)', color='#555555', va='center')

plt.xlabel('k')
plt.ylabel('Energy E')
plt.title('Direct-Gap Semiconductor (E–k)')
plt.grid(True, alpha=0.2)
plt.legend(loc='upper left')
plt.tight_layout()
plt.show()