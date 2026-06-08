---
date: '2026-02-06T22:00:00+09:00'
draft: false
title: 'Mathematics Part 1: Complex Analysis'
summary: "Starting from a real integral and building intuition through the chain: complex geometry -> analytic functions -> contour integrals -> residues."
tags: ["Complex Analysis", "Contour Integrals", "Residues", "Real Integrals"]
categories: ["Crucible"]
aliases:
---


This note no longer follows a formula checklist; it follows one computational chain:

Complex geometry -> analyticity (CR) -> contour integration -> CIT/CIF -> Laurent and singularities -> residue theorem -> back to real integrals.

---


Consider this real integral:

$$
\int_{0}^{\infty} \frac{1}{1+x^6}\mathrm{d}x
$$

On the real line it is doable, but often technique-heavy.  
In the complex plane, we turn it into

$$
f(z)=\frac{1}{1+z^6}
$$

then choose a contour, locate poles, and compute residues in a unified, stable workflow.

---


If we write complex numbers in polar form

$$
z_1=r_1e^{i\theta_1}\quad z_2=r_2e^{i\theta_2}
$$

then multiplication becomes

$$
z_1z_2=(r_1r_2)e^{i(\theta_1+\theta_2)}
$$

Interpret this as: first change magnitude, then change direction.  
This is key because later intuition (“analytic maps locally look like multiplication by one complex number”) comes from here.

Quick Example

$$
z=1+i=\sqrt{2}e^{i\pi/4}\quad z^2=2e^{i\pi/2}=2i
$$

That is: scale by $\sqrt{2}$ twice (total factor 2), rotate by $45^\circ$ twice (total $90^\circ$).

<details>
Extra Practice: Rectangular <-> Polar</summary>

  Express $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ in $x+iy$ form.

  $$
  \frac{\sqrt{2}+i}{\sqrt{2}-i}\cdot\frac{\sqrt{2}+i}{\sqrt{2}+i}
  =\frac{(\sqrt{2}+i)^2}{3}
  =\frac{1+2\sqrt{2}i}{3}
  $$

  So $x=\dfrac13,\ y=\dfrac{2\sqrt{2}}3$.

  Express $\sqrt{3}+3i$ in polar form.

  $$
  r=2\sqrt{3}\quad \theta=\frac\pi3\quad
  \sqrt{3}+3i=2\sqrt{3}e^{i\pi/3}
  $$
</details>

---


Now we move from single-number operations to behavior of complex functions.

Let

$$
f(z)=u(x,y)+iv(x,y)\quad z=x+iy
$$

Complex differentiability requires the quotient

$$
\lim_{z\to z_0}\frac{f(z)-f(z_0)}{z-z_0}
$$

to approach the same value from every direction.

This condition is strong enough to force the CR equations:

$$
u_x=v_y\quad u_y=-v_x
$$

Intuition in one line: an analytic function must locally look like multiplication by one complex number (rotation + scaling), and CR is that condition in coordinates.


$$
f(z)=(x+iy)^2=(x^2-y^2)+i(2xy)
$$

$$
u=x^2-y^2,\ v=2xy
$$

$$
u_x=2x\quad v_y=2x\quad u_y=-2y\quad -v_x=-2y
$$

CR holds, so it is analytic everywhere.

---


This is the most important continuous sequence in the chapter.


Parameterize a contour

$$
z(t)=x(t)+iy(t)\quad t\in[a,b]
$$

Then

$$
\int_C f(z)\mathrm{d}z=\int_a^b f(z(t))z'(t)\mathrm{d}t
$$

Essentially, it rewrites a complex integral as a real integral.


If $f$ is analytic on and inside a closed contour, then

$$
\oint_C f(z)\mathrm{d}z=0
$$

This tells us analytic functions obey strong path constraints.


If $z_0$ lies inside $C$, then

$$
f(z_0)=\frac{1}{2\pi i}\oint_C\frac{f(z)}{z-z_0}\mathrm{d}z
$$

This means interior values are fully determined by boundary values.

The derivative version is

$$
f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_C\frac{f(z)}{(z-z_0)^{n+1}}\mathrm{d}z
$$

Higher powers in the denominator extract higher derivatives.

<details>
Chain Example: CIF in One Step</summary>

  Compute
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  $$

  Let $f(z)=e^z,\ z_0=1$, use the $n=1$ derivative form of CIF:

  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  =2\pi if'(1)
  =2\pi i e
  $$
</details>

---


If a function is analytic at $z_0$, use Taylor:

$$
f(z)=\sum_{n=0}^{\infty}a_n(z-z_0)^n\quad a_n=\frac{f^{(n)}(z_0)}{n!}
$$

But once singularities are nearby, Taylor is not enough.

Laurent allows negative powers:

$$
f(z)=\sum_{n=-\infty}^{\infty}a_n(z-z_0)^n
$$

The key part is the principal part (negative powers), because it directly determines singularity type.


- Principal part is zero: removable singularity.
- Finite negative powers: pole.
- Infinite negative powers: essential singularity.

<details>
Extra Practice: Laurent + Singularity Type</summary>

  Expand around $z_0=1$
  $$
  \frac{1}{(z-1)(z-2)}
  $$

  $$
  \frac{1}{(z-1)(z-2)}=\frac1{z-2}-\frac1{z-1}\quad
  \frac1{z-2}=-\sum_{n=0}^{\infty}(z-1)^n\ (|z-1|<1)
  $$

  So
  $$
  \frac{1}{(z-1)(z-2)}=-\sum_{n=0}^{\infty}(z-1)^n-\frac1{z-1}
  $$

  Also consider
  $$
  f(z)=\frac{z}{e^z-1}\ \text{at } z=0
  $$

  $$
  \frac{z}{e^z-1}=1-\frac z2+\cdots
  $$

  Principal part is zero, so the singularity is removable.
</details>

---


A residue is the coefficient of $(z-z_0)^{-1}$ in a Laurent expansion:

$$
\operatorname{Res}(f,z_0)=a_{-1}
$$

If $f$ has only isolated singularities inside the contour, then

$$
\oint_C f(z)\mathrm{d}z=2\pi i\sum_k \operatorname{Res}(f,z_k)
$$

This is the computational output of the whole chain.


- Simple pole:
  $$
  \operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)
  $$

- Quotient form with simple zero in denominator:
  $$
  f=\frac{g}{h},\ h(z_0)=0,\ h'(z_0)\ne0
  \Rightarrow
  \operatorname{Res}(f,z_0)=\frac{g(z_0)}{h'(z_0)}
  $$

- Pole of order $m$:
  $$
  \operatorname{Res}(f,z_0)=\frac1{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\Big[(z-z_0)^m f(z)\Big]
  $$

<details>
Example A: Contour Integral</summary>

  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\mathrm{d}z
  =\oint_{|z|=1}\left(\frac1z+\frac4{z^3}\right)dz
  $$

  Coefficient of $1/z$ is 1, so residue is 1, hence

  $$
  2\pi i
  $$
</details>

<details>
Example B: Real Integral</summary>

  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x\quad(a>0)
  $$

  Use
  $$
  f(z)=\frac1{(z^2+a^2)^2}=\frac1{(z-ia)^2(z+ia)^2}
  $$

  In the upper half-plane there is only a second-order pole at $z=ia$, giving

  $$
  \operatorname{Res}(f,ia)=\left.\frac{d}{dz}\frac1{(z+ia)^2}\right|_{z=ia}=\frac1{4ia^3}
  $$

  Therefore
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x
  =2\pi i\cdot\frac1{4ia^3}
  =\frac\pi{2a^3}
  $$
</details>

---


Back to

$$
\int_{0}^{\infty}\frac1{1+x^6}\mathrm{d}x
$$

The standard workflow is:


1. Extend to $f(z)=\frac1{1+z^6}$ and choose an upper-half-plane contour.

2. Identify poles inside the contour (upper-half-plane roots of $z^6=-1$).

3. Compute and sum those residues.
  
4. Use residue theorem for $(-\infty,\infty)$ and halve via even symmetry to get $(0,\infty)$.


Final value:

$$
\int_{0}^{\infty}\frac1{1+x^6}\mathrm{d}x=\frac\pi3
$$

The value of this example is not the number itself, but the full demonstration of the chain: definition -> theorem -> computation.

---


In exam settings, first identify the type, then apply the template; this is usually much faster than deriving from scratch.


- On symmetric intervals, always check parity first.
- If even: $\int_{-\infty}^{\infty}f(x)\mathrm{d}x=2\int_0^\infty f(x)\mathrm{d}x$.
- If odd: the integral over a symmetric interval is 0.


$$
\int_0^\infty \frac{x^m}{1+x^k}\mathrm{d}x
=\frac{\pi}{k}\csc\!\left(\frac{(m+1)\pi}{k}\right),
\qquad -1\lt m\lt k-1
$$

Use this for integrals of the form $\frac{x^m}{1+x^k}$; if the interval is $(-\infty,\infty)$, combine with parity first.


$$
\int_0^\infty \frac{x^{2m}}{(x^2+a^2)^n}\mathrm{d}x
=\frac{a^{2m-2n+1}}{2}
B\left(m+\frac12, n-m-\frac12\right)\quad n>m+\frac12
$$

Most-used special case (high-frequency):

$$
\int_0^\infty \frac{1}{(x^2+a^2)^n}\mathrm{d}x
=\frac{\sqrt\pi\Gamma\left(n-\frac12\right)}{2\Gamma(n)a^{2n-1}}
$$

If the denominator is a product of quadratic factors, do partial fractions first, then reduce to Template A/B.


These problems are common on $0\to2\pi$ periodic integrals, usually solved by $z=e^{i\theta}$ or by standard closed forms.

Core formulas:

$$
\int_0^{2\pi}\frac{d\theta}{A+B\cos\theta+C\sin\theta}
=\frac{2\pi}{\sqrt{A^2-B^2-C^2}}\quad A>\sqrt{B^2+C^2}
$$

$$
\int_0^{2\pi}\frac{d\theta}{(A+B\cos\theta)^2}
=\frac{2\pi A}{(A^2-B^2)^{3/2}}\quad A>|B|
$$

$$
\int_0^{2\pi}\frac{d\theta}{a+b\sin^2\theta}
=\frac{2\pi}{\sqrt{a(a+b)}}\quad a>0\ \text{and}\ a+b>0
$$
