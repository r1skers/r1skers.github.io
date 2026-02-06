import numpy as np
import matplotlib.pyplot as plt

# Simple semiconductor band diagram: Ec, Ev, and band gap vs position
x = np.linspace(0, 1, 200)

# Flat bands (no field), schematic values
Ec = 1.0 + 0.0 * x
Ev = 0.0 + 0.0 * x

plt.figure(figsize=(7, 4))
plt.plot(x, Ec, color='#1f77b4', linewidth=2, label='Ec (Conduction band)')
plt.plot(x, Ev, color='#d62728', linewidth=2, label='Ev (Valence band)')

# Fill forbidden gap
plt.fill_between(x, Ev, Ec, color='#dddddd', alpha=0.5, label='Band gap (Eg)')

# Labels
plt.text(0.02, Ec[0] + 0.03, r'$E_c$', color='#1f77b4')
plt.text(0.02, Ev[0] - 0.08, r'$E_v$', color='#d62728')
plt.text(0.5, 0.5, r'$E_g$', color='#555555', fontsize=12, ha='center', va='center')

plt.xlabel('Position x')
plt.ylabel('Energy E')
plt.title('Semiconductor Band Diagram (schematic)')
plt.ylim(-0.2, 1.2)
plt.grid(True, alpha=0.2)
plt.legend(loc='upper right')
plt.tight_layout()
plt.show()