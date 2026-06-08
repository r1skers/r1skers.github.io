---
date: '2026-01-03T10:17:00+09:00'
draft: false
title: 'Quantum Mechanics Part 2: How Electrons Are Distributed'
summary: "An intuitive exploration of how electrons occupy quantum states. From probability densities and Fermi-Dirac statistics to electron distributions in crystalline systems, this article reframes electrons as probabilistic entities rather than localized particles."
tags: ["Quantum Mechanics", "Physics", "Electron Distribution", "Probability", "Condensed Matter"]
categories: ["Crucible"]
aliases:
  - /notes/note-qm-2-fermions/
---


# Electrons Are Not "Located Somewhere"; They Are Distributed Across States

> **Core premise**  
> Electrons are not distributed in *space* as localized particles.  
> They are distributed in *probability* through quantum states.

In classical mechanics, asking "where is a particle?" assumes a definite position $x(t)$ at every moment. For electrons, this assumption fails fundamentally.

In quantum mechanics, an electron is not described by a trajectory, but by a wave function $\psi(\mathbf r)$.

$$
\rho(\mathbf r)=|\psi(\mathbf r)|^2
$$

The quantity $\rho(\mathbf r)$ is the **probability density** of finding the electron near $\mathbf r$ on measurement. Larger $\rho$ means higher probability, not a stronger local presence.

This distinction is crucial.

The electron is neither hidden at an unknown position nor spread out like a classical cloud. Before measurement, position is not a predefined property.

Quantum mechanics provides not a map of trajectories, but a probabilistic structure governing measurement outcomes.


## From Probability Density to Quantum States

In [Part 1 (the time-independent Schrodinger equation)](../笔记-量子力学1-薛定谔公式/#time-independent-schrodinger-equation), we obtained

$$\hat H\psi=E\psi$$
This is where states come from: for a given potential $V(x)$ and boundary conditions, only specific solutions $\psi_n(x)$ are allowed, each corresponding to an energy eigenstate.

So a state is not an abstract label but a physically selected mathematical solution:
- A potential well gives discrete $\psi_n$ and $E_n$.
- A free particle allows continuous plane-wave solutions.

So "electron distribution" means which eigenstates are occupied. $\rho(\mathbf r)=|\psi(\mathbf r)|^2$ is the position-space projection of those states.


### Pauli Exclusion Sketch

![Pauli occupancy sketch: each horizontal line is an allowed level, and arrows show spin occupancy](/notes/笔记-量子力学2-费米子/pauli-occupancy.svg)

Each horizontal line is an allowed energy eigenstate. One arrow means single occupancy; opposite arrows mean full occupancy. Pauli exclusion forbids two electrons with the same spin in the same state.

At this point we know which states can be occupied and the occupancy limit per state. The next natural question is: what do allowed states look like in a periodic crystal?


## Bloch's Theorem

In crystals, the potential is periodic, so allowed states are not free-space plane waves. Bloch's theorem gives
$$
\psi_{\mathbf k}(\mathbf r)=u_{\mathbf k}(\mathbf r)e^{i\mathbf k\cdot\mathbf r}
$$
where $u_{\mathbf k}(\mathbf r+\mathbf R)=u_{\mathbf k}(\mathbf r)$. This bridges real space and $k$-space and underlies band-state counting.

Bloch theorem sketch (periodic potential + Bloch-like wave)

![Bloch theorem sketch: gray is the periodic potential, red dashed is the periodic envelope, and blue is the real part of the wave function](/notes/笔记-量子力学2-费米子/Bloch_theory.svg)


### Phase Change Under Lattice Translation

Start from the Bloch form
$$
\psi_k(x)=u_k(x)e^{ikx},\quad u_k(x+a)=u_k(x)
$$
Translate by one lattice constant $a$:
$$
\psi_k(x+a)=u_k(x+a)e^{ik(x+a)}=u_k(x)e^{ika}e^{ikx}
$$
So
$$
\psi(x+a)=e^{ika}\psi(x)
$$
Lattice translation changes only phase, not probability density. That is why $k$ is a good quantum label in crystals.

Since $k$ can robustly label crystal states, the next step is to ask how these states reorganize into bands as atoms come together into a lattice.


## Band Formation Mechanism

Isolated atoms have discrete orbitals and energy levels. In a periodic lattice, overlap and coupling split each atomic level into many nearby levels, forming nearly continuous bands separated by gaps.

At Brillouin-zone boundaries, the periodic potential mixes states differing by a reciprocal lattice vector, opening band gaps and linking single-particle wave mechanics to material properties.

Direct-gap semiconductor: E-k diagram

![Direct-gap E-k diagram: the conduction-band minimum and valence-band maximum occur at the same k point](/notes/笔记-量子力学2-费米子/直接带隙半导体色散关系.svg)

Band formation from 2s/2p levels (schematic)

![Band formation schematic: as atomic spacing decreases, discrete levels broaden into bands, and the shaded region marks the forbidden gap](/notes/笔记-量子力学2-费米子/不同轨道间的电子分布范围.svg)


## Semiconductor (Band Diagram)

Semiconductor band diagram (Ec, Ev, Eg)

![Semiconductor band diagram](/notes/笔记-量子力学2-费米子/半导体能带示意图.svg)

Once we have the band picture, the next step is not just to inspect shapes but to quantify carrier dynamics near band edges, which leads to effective mass.


## Effective Mass

Near a band edge, the dispersion is approximately parabolic:
$$
E(k)\approx E_0+\frac{\hbar^2k^2}{2m^\ast}.
$$
Effective mass is defined by curvature:
$$
\frac{1}{m^\ast}=\frac{1}{\hbar^2}\frac{d^2E}{dk^2}.
$$
Smaller curvature means larger $m^\ast$ and slower response. Valence-band curvature can be negative, so holes are treated as positive carriers.


### Effective Mass in DOS

Near the band edge, replace free-electron mass by effective mass:
$$
g(E)=\frac{1}{2\pi^2}\left(\frac{2m^\ast}{\hbar^2}\right)^{3/2}\sqrt{E}.
$$


### Dispersion Relation (Near a Band Edge)

The dispersion relation is the energy-momentum relation $E(k)$. It is near-parabolic at the band edge and deviates farther away, making effective mass energy-dependent.


### Mobility (Semiconductors)

Mobility
$$
\mu=\frac{q\tau}{m^\ast}
$$
So smaller $m^\ast$ generally implies higher mobility.

Knowing how heavy or fast one carrier is still not enough; we also need the number of available states near each energy, i.e., the density of states (DOS).


## Density of States (DOS)

To derive DOS, consider a finite crystal of size $L$ with periodic boundary conditions:
$$
\psi(x+L)=\psi(x)
$$
Using the Bloch phase condition:
$$
e^{ikL}=1\Rightarrow k=\frac{2\pi}{L}n,\quad n\in\mathbb Z.
$$
Allowed $k$ points form a grid with spacing $\Delta k=2\pi/L$, each state occupying
$$
\Delta k^3=\left(\frac{2\pi}{L}\right)^3.
$$
The number of states in a 3D shell $[k,k+dk]$ (including spin factor 2) is
$$
dN=2\cdot\frac{4\pi k^2 \mathrm{d}k}{(2\pi/L)^3}=\frac{V}{\pi^2}k^2 \mathrm{d}k
$$
where $V=L^3$. Combining this with [free-electron dispersion](../笔记-量子力学1-薛定谔公式/#free-electron-dispersion)
$$
E=\frac{\hbar^2k^2}{2m},
$$
we obtain
$$
g(E)=\frac{V}{2\pi^2}\left(\frac{2m}{\hbar^2}\right)^{3/2}\sqrt{E}.
$$
Hence 3D DOS grows as $\sqrt{E}$.

Equivalent form:
$$
g(E)=\frac{m}{\pi^2\hbar^3}\sqrt{2mE}.
$$
In 2D (per unit area), DOS is constant:
$$
g_{2D}(E)=\frac{m}{\pi\hbar^2}.
$$

DOS vs Energy (schematic)

![DOS-energy schematic: Ec is the conduction-band edge, Ev is the valence-band edge, Eg is the band gap, and DOS is zero in the gap](/notes/笔记-量子力学2-费米子/D-E图.svg)

So far we have counted available states ("how many seats"), but not occupancy ("who sits where"). Occupancy is provided by the Fermi-Dirac distribution.


## Fermi-Dirac Distribution

### T = 0 K (Step Function)

At absolute zero, states below $E_F$ are fully occupied and states above are empty:
$$
f(E)=
\begin{cases}
1,&E<E_F\\
0,&E>E_F
\end{cases}
$$
This is the ideal step defining the Fermi surface.

f(E) at T = 0 K (step)

![Fermi-Dirac distribution at T=0K: f=1 below EF and f=0 above EF](/notes/笔记-量子力学2-费米子/0K下的费米狄拉克分布.svg)


### T > 0 K (Thermal Smearing)

At finite temperature, the step is thermally smeared:
$$
f(E)=\frac{1}{\exp\left(\frac{E-E_F}{k_BT}\right)+1}
$$
For $E\gg E_F$, $f\to0$; for $E\ll E_F$, $f\to1$; and $f(E_F)=1/2$.

f(E) at T > 0 K (thermal smearing)

![Fermi-Dirac distribution at T>0K: the transition is smeared over a few kBT around EF](/notes/笔记-量子力学2-费米子/T大于0K下的费米狄拉克分布.svg)

Now we have both keys: $g(E)$ for state availability and $f(E)$ for occupation probability. The natural next step is to multiply and integrate them to obtain total electron density.


## Electron Density

Electron density is obtained by DOS-weighted occupation:
$$
n=\int_0^{\infty} g(E)f(E)\mathrm{d}E
$$


### T = 0 K (Absolute Zero)

Only states below $E_F$ contribute:
$$
n=\int_0^{E_F} g(E)\mathrm{d}E
$$
For a 3D free-electron gas:
$$
n=\frac{1}{3\pi^2}\left(\frac{2m}{\hbar^2}\right)^{3/2}E_F^{3/2},
$$
so
$$
E_F=\frac{\hbar^2}{2m}(3\pi^2n)^{2/3}.
$$


### T > 0 K (Finite Temperature)

At finite temperature, the chemical potential becomes $\mu(T)$:
$$
n(T)=\int_0^{\infty} g(E)f(E,\mu,T)\mathrm{d}E,
\qquad
f(E,\mu,T)=\frac{1}{\exp\left(\frac{E-\mu(T)}{k_BT}\right)+1}.
$$

For a degenerate gas ($T\ll T_F$, $T_F=E_F/k_B$), Sommerfeld expansion gives
$$
n(T)\approx\int_0^{\mu(T)} g(E)\mathrm{d}E+\frac{\pi^2}{6}(k_BT)^2g'(\mu(T)).
$$
At fixed density, the chemical potential shifts only slightly:
$$
\mu(T)\approx E_F\left[1-\frac{\pi^2}{12}\left(\frac{k_BT}{E_F}\right)^2\right].
$$

For non-degenerate semiconductors:
$$
n\approx N_c\exp\left(-\frac{E_c-\mu}{k_BT}\right),
\qquad
N_c=2\left(\frac{2\pi m_e^\ast k_BT}{h^2}\right)^{3/2}.
$$
This explicitly shows the strong temperature dependence of carrier density.

D(E), f(E), and n(E)=D(E)f(E)

![Electron density at T>0K](/notes/笔记-量子力学2-费米子/T大于0K下的电子密度.svg)


### Doping and Charge Neutrality (Semiconductors)

In doped semiconductors, donors and acceptors turn state occupancy into a controllable carrier density.

Charge neutrality is written as
$$
n+N_A^-=p+N_D^+.
$$
Here $N_D^+$ is the ionized donor concentration and $N_A^-$ is the ionized acceptor concentration.

At room temperature with shallow-level dopants, full ionization is often used: $N_D^+\approx N_D,\ N_A^-\approx N_A$. Combined with the mass-action law $np=n_i^2$, this gives
$$
n\approx N_D-N_A,\qquad p\approx\frac{n_i^2}{n}\quad (n\text{-type}),
$$
$$
p\approx N_A-N_D,\qquad n\approx\frac{n_i^2}{p}\quad (p\text{-type}).
$$
So for donor-only n-type Si with $N_D\gg n_i$, we often use $n\approx N_D$ directly.


### From Doping Concentration to Atomic Substitution Fraction

If the lattice constant is $a$ and each unit cell contains $N_{\mathrm{uc}}$ atoms, the atomic density is
$$
N_{\mathrm{atom}}=\frac{N_{\mathrm{uc}}}{a^3}.
$$
For Si (diamond structure), $N_{\mathrm{uc}}=8$, so
$$
N_{\mathrm{Si}}=\frac{8}{a^3}.
$$

The substitution fraction for a target donor concentration $N_D$ is
$$
x_D=\frac{N_D}{N_{\mathrm{Si}}},
\qquad
\text{about one P atom per } \frac{1}{x_D} \text{ Si atoms}.
$$

For example, with $a=0.543\,\mathrm{nm}$ and $N_D=5\times 10^{18}\,\mathrm{cm^{-3}}$
$$
N_{\mathrm{Si}}\approx 5.0\times 10^{22}\,\mathrm{cm^{-3}},\qquad
x_D\approx 1.0\times 10^{-4}=0.01\%\approx 100\,\mathrm{ppm}.
$$
That is roughly one P atom per $10^4$ Si atoms.

Now we know how many carriers there are ($n,p$), how states are occupied ($f$), and how doping quantitatively sets carrier density. The natural next step is to move from this equilibrium picture to nonequilibrium transport under an electric field.


## From Equilibrium Occupation to Nonequilibrium Transport (Including Holes)

At thermal equilibrium, the distribution $f_0(E)$ is isotropic in momentum space, so velocity contributions cancel and net current is zero.

Under an external field, the distribution is slightly shifted, written as $f=f_0+\delta f$. Scattering limits this shift, and “how long the shift survives” is exactly the relaxation time $\tau$ introduced next.

Carriers then gain an average directed velocity (drift velocity), producing current. In metals, transport mainly comes from electrons near the Fermi surface; in semiconductors, both conduction-band electrons and valence-band holes can contribute.

A hole can be viewed as an effective positive carrier created by a missing valence-band electron, with charge $+e$. In an electric field, electrons drift opposite to $E$, while holes drift along $E$.

Hole Formation Sketch

![Hole formation sketch: before excitation the valence band is filled; after excitation an electron enters the conduction band and leaves a hole](/notes/笔记-量子力学2-费米子/hole-formation.svg)

The explicit steady-state drift-current expression (including both electrons and holes) is presented in the next section.

With this bridge — equilibrium occupation -> field-induced shift -> drift current — the quantities $\rho,\sigma,\tau,\mu,v_d$ are no longer isolated definitions but linked parameters on one transport chain.


## Electron Motion in the Steady State

Under the Drude approximation, electrons are accelerated by the electric field and relaxed by scattering, giving the average equation of motion

$$
m^\ast\frac{d\mathbf v}{dt}=-e\mathbf E-\frac{m^\ast}{\tau}\mathbf v.
$$

In steady state ($d\mathbf v/dt=0$), the drift velocity is
$$
\mathbf v_d=-\frac{e\tau}{m^\ast}\mathbf E,\qquad
|v_d|=\frac{e\tau}{m^\ast}E.
$$

So mobility is directly tied to relaxation time
$$
\mu\equiv\frac{|v_d|}{E}=\frac{e\tau}{m^\ast}.
$$

The electron current density can be written as
$$
\mathbf J_n=-ne\mathbf v_d=\frac{ne^2\tau}{m^\ast}\mathbf E=ne\mu_n\mathbf E.
$$

Therefore conductivity and resistivity satisfy
$$
\sigma=\frac{ne^2\tau}{m^\ast}=ne\mu,\qquad
\rho=\frac{1}{\sigma}.
$$

Common units: $\rho[\Omega\cdot\mathrm{m}]$, $\sigma[\mathrm{S/m}]$, and $\mu[\mathrm{m^2/(V\cdot s)}]$ (engineering often uses $\mathrm{cm^2/(V\cdot s)}$).

For semiconductors, both electrons and holes contribute to drift current
$$
\mathbf J=e\left(n\mu_n+p\mu_p\right)\mathbf E.
$$

If a sample has length $L$ and applied voltage $V$, use $E\approx V/L$, then
$$
|v_d|=\mu\frac{V}{L}.
$$

This unifies $\tau,\mu,v_d,\sigma,\rho$ as one steady-transport chain governed by field driving plus scattering balance.


## Conductivity Picture Summary

> **Key idea:** conduction is not electrons "moving in place" but electrons transitioning into available states. Metals conduct easily because empty states already exist near $E_F$; semiconductors and insulators need thermal or optical excitation to create carriers.

Since thermal excitation and electric fields can modify occupation, the natural final step is optical fields: photons can excite electrons across the band gap (absorption), carry away recombination energy (emission), and under stimulated conditions produce optical gain.


## From Transport to Optical Transitions

### Stimulated Emission and Basic Laser Conditions

Stimulated emission means an incident photon induces an excited carrier to emit another photon with the same frequency, phase, and propagation direction, which is the microscopic origin of laser amplification.

A laser typically requires three conditions:

1. Population inversion: more particles occupy the higher-energy state than the lower-energy state.
2. Positive net gain: material gain exceeds total loss.
3. Optical feedback: a resonator lets light make repeated amplification passes.

This is often summarized as
$$
g_{\mathrm{net}}=g-\alpha_{\mathrm{loss}}>0.
$$


### Band Gap and Emission Wavelength

For near-band-edge radiative recombination, photon energy is approximately the band gap:
$$
E_\gamma\approx E_g,\qquad
\lambda=\frac{hc}{E_\gamma}\approx\frac{1240}{E_g}\ \text{nm}\quad (E_g\ \text{in eV}).
$$

When $E_g=5.0\ \mathrm{eV}$
$$
\lambda\approx\frac{1240}{5.0}\approx 248\ \mathrm{nm},
$$
which lies in the ultraviolet range.


### Absorption Coefficient and Optical Intensity Decay

If interface reflection and scattering are neglected and only bulk absorption is considered, the Lambert-Beer law is
$$
\frac{dI}{dz}=-\alpha I.
$$

After integration, we get
$$
I(z)=I_0 e^{-\alpha z},\qquad
I(d)=I_0 e^{-\alpha d}.
$$

So the transmittance and absorbed fraction are
$$
T\equiv\frac{I(d)}{I_0}=e^{-\alpha d},\qquad
A\equiv1-T=1-e^{-\alpha d}.
$$

Note that the absorption coefficient is usually wavelength-dependent, i.e. $\alpha=\alpha(\lambda)$.

If $\alpha=1.0\times10^5\ \mathrm{cm^{-1}}$ and thickness is $d=100\ \mathrm{nm}=1.0\times10^{-5}\ \mathrm{cm}$, then
$$
T=e^{-\alpha d}=e^{-1}\approx 0.368,\qquad
A\approx 0.632.
$$
So the transmitted intensity is about 36.8%, corresponding to about 63.2% absorption.

This links transport quantities $\tau,\mu,\sigma$ and optical quantities $E_g,\lambda,\alpha$ into one continuous storyline: all are jointly determined by band structure, occupation, and transition/scattering processes.
