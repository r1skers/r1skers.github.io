import numpy as np
import matplotlib.pyplot as plt

# Schematic: 2s / 2p atomic levels broaden into bands as atoms approach.
# x-axis: atomic spacing R (large -> isolated atoms, small -> solid)

R = np.linspace(0.6, 2.4, 500)

# Atomic levels at large spacing
E_2s = -2.0
E_2p = -0.8

# Broadening grows as spacing decreases (asymmetric for 2s vs 2p)
width_s = 0.7 / R + 0.05 * np.exp(-R)
width_p = 1.1 / R + 0.10 * np.exp(-0.5 * R)

# Bands derived from 2s and 2p (asymmetric widening)
s_upper = E_2s + 0.55 * width_s
s_lower = E_2s - 0.45 * width_s
p_upper = E_2p + 0.60 * width_p
p_lower = E_2p - 0.40 * width_p

plt.figure(figsize=(7, 4))
ax = plt.gca()

# Plot 2s-derived band
plt.plot(R, s_lower, color='#1f77b4', linewidth=2, label='2s-derived band')
plt.plot(R, s_upper, color='#1f77b4', linewidth=2)
plt.fill_between(R, s_lower, s_upper, color='#1f77b4', alpha=0.15)

# Plot 2p-derived band
plt.plot(R, p_lower, color='#d62728', linewidth=2, label='2p-derived band')
plt.plot(R, p_upper, color='#d62728', linewidth=2)
plt.fill_between(R, p_lower, p_upper, color='#d62728', alpha=0.15)

# Highlight forbidden gap between bands (let gap vary with spacing)
gap_top = p_lower - 0.05 * np.cos(2 * np.pi * (R - R.min()) / (R.max() - R.min()))
plt.fill_between(R, s_upper, gap_top, color='#dddddd', alpha=0.5, label='Forbidden gap')

# Mark atomic levels on the large-spacing side
plt.hlines(E_2s, R.max() - 0.2, R.max(), colors='#1f77b4', linestyles='--')
plt.hlines(E_2p, R.max() - 0.2, R.max(), colors='#d62728', linestyles='--')
plt.text(R.max() - 0.18, E_2s + 0.03, '2s', color='#1f77b4')
plt.text(R.max() - 0.18, E_2p + 0.03, '2p', color='#d62728')

# Double-headed arrows for allowed band and forbidden gap
R_mid = 1.4
s_low_mid = np.interp(R_mid, R, s_lower)
s_up_mid = np.interp(R_mid, R, s_upper)
p_low_mid = np.interp(R_mid, R, p_lower)

ax.annotate('', xy=(R_mid, s_low_mid), xytext=(R_mid, s_up_mid),
            arrowprops=dict(arrowstyle='<->', color='#1f77b4', linewidth=1.5))
ax.text(R_mid + 0.03, 0.5 * (s_low_mid + s_up_mid), 'Allowed band', color='#1f77b4')

ax.annotate('', xy=(R_mid, s_up_mid), xytext=(R_mid, p_low_mid),
            arrowprops=dict(arrowstyle='<->', color='#444444', linewidth=1.5))
ax.text(R_mid + 0.03, 0.5 * (s_up_mid + p_low_mid), 'Forbidden gap', color='#444444')

plt.xlabel('Atomic spacing (R)')
plt.ylabel('Energy E')
plt.title('Band Formation from 2s / 2p Levels (schematic)')
plt.grid(True, alpha=0.2)
plt.legend(loc='upper right')
plt.tight_layout()
plt.show()
