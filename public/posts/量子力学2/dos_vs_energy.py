import numpy as np
import matplotlib.pyplot as plt

# DOS vs Energy (schematic)
E = np.linspace(-1.5, 1.5, 800)
Eg = 1.0
Ec = Eg / 2.0
Ev = -Eg / 2.0

# 3D-like DOS shapes (sqrt behavior) above Ec and below Ev
D = np.zeros_like(E)

# Conduction band DOS (E > Ec)
mask_c = E > Ec
D[mask_c] = np.sqrt(E[mask_c] - Ec)

# Valence band DOS (E < Ev) - mirrored
mask_v = E < Ev
D[mask_v] = np.sqrt(Ev - E[mask_v])

# Normalize for display
if D.max() > 0:
    D = D / D.max()

plt.figure(figsize=(6, 4))
plt.plot(D, E, color='#1f77b4', linewidth=2)

# Mark band edges and gap
plt.axhline(Ec, color='#1f77b4', linestyle='--', linewidth=1)
plt.axhline(Ev, color='#d62728', linestyle='--', linewidth=1)
plt.text(0.9, Ec, 'Ec', color='#1f77b4', va='center')
plt.text(0.9, Ev, 'Ev', color='#d62728', va='center')
plt.text(0.1, 0.0, 'Eg', color='#555555', va='center')

plt.xlabel('DOS D(E) (normalized)')
plt.ylabel('Energy E')
plt.title('DOS vs Energy (schematic)')
plt.grid(True, alpha=0.2)
plt.tight_layout()
plt.show()