---
date: '2026-02-06T22:00:00+09:00'
draft: false
title: 'Mathematics Part 1: Complex Analysis'
summary: "Why complex numbers solve real problems: a quick taste with a real integral, and the roadmap we will follow."
tags: ["Complex Analysis", "Contour Integrals", "Residues", "Real Integrals"]
categories: ["The Crucible"]
---

# Why Complex Analysis?

A common question is: *what does complex analysis actually buy us?*  
One of the cleanest answers is that it turns difficult real-variable integrals into short, structured computations.

Consider the real integral:

$$
\int_{0}^{\infty} \frac{1}{1+x^6}dx
$$

On the real line this can be done, but it is messy.  
In the complex plane, we study

$$
f(z) = \frac{1}{1+z^6}
$$

and integrate it over a semicircular contour. The poles are the sixth roots of $-1$, and the residue theorem reduces the entire computation to a small sum.

This single example is the spirit of the course: **complex analysis gives structure and speed**. We will build the tools step by step, starting from complex numbers and moving toward analytic functions, contour integrals, and residues.

---

## 1. Multiplication = Rotation + Scaling

We are not "turning a function into a circular-arc function."  
The real idea is:

- Extend a real-variable function to a complex-variable function.
- Choose a contour (integration path) that makes the integral easier.

A semicircle is just a common choice for real integrals on $(-\infty,\infty)$, but it is not the only one.

Write complex numbers in polar form:

$$
z_1 = r_1 e^{i\theta_1},\quad z_2 = r_2 e^{i\theta_2}
$$

Then the product is

$$
z_1 z_2 = (r_1 r_2)e^{i(\theta_1+\theta_2)}
$$

So:

- Magnitudes multiply.
- Angles add.

This is the geometric meaning of complex multiplication: **scale, then rotate**.

### Example

Let

$$
z = 1+i = \sqrt{2}e^{i\pi/4}
$$

Then

$$
z^2 = 2e^{i\pi/2} = 2i
$$

Interpretation: scale by $\sqrt{2}$ twice (so by $2$), and rotate by $45^\circ$ twice (so by $90^\circ$).

<details>
  <summary>Rectangular Form (x+iy)</summary>

  Express $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ in $x+iy$ form.

  Multiply by the conjugate:
  $$
  \frac{\sqrt{2}+i}{\sqrt{2}-i}\cdot\frac{\sqrt{2}+i}{\sqrt{2}+i}
  =\frac{(\sqrt{2}+i)^2}{2+1}
  =\frac{1+2\sqrt{2}\,i}{3}
  $$

  So $x=\dfrac{1}{3}$ and $y=\dfrac{2\sqrt{2}}{3}$.
</details>

<details>
  <summary>Polar Form</summary>

  Express $\sqrt{3}+3i$ in polar form.

  $$
  r=\sqrt{(\sqrt{3})^2+3^2}=\sqrt{12}=2\sqrt{3},\quad
  \theta=\arctan\frac{3}{\sqrt{3}}=\arctan(\sqrt{3})=\frac{\pi}{3}
  $$

  So
  $$
  \sqrt{3}+3i = 2\sqrt{3}\,e^{i\pi/3}.
  $$
</details>

---

## 2. Analyticity and the Cauchy-Riemann Equations

Let

$$
f(z) = u(x,y) + iv(x,y), \quad z = x + iy
$$

We say $f$ is complex differentiable at $z_0$ if the limit

$$
f'(z_0) = \lim_{z\to z_0}\frac{f(z)-f(z_0)}{z-z_0}
$$

exists and is the same from every direction in the plane. This is much stronger than real differentiability.

From this requirement we get the **Cauchy-Riemann equations**:

$$
u_x = v_y,\quad u_y = -v_x
$$

If $u$ and $v$ have continuous first partials in a region and satisfy Cauchy-Riemann there, then $f$ is analytic in that region.

### Why CR appears (short derivation)

Complex differentiability means the difference quotient must approach the **same** value from every direction in the plane.  
Compare approaching along the real axis (change $x$ only) and along the imaginary axis (change $y$ only).  
Requiring those two limits to agree forces

$$
u_x = v_y,\quad u_y = -v_x
$$

Intuition: locally, an analytic function must look like “multiply by one complex number,” i.e., a rotation + scaling. That special linear form is exactly what CR encodes.

### Example

Let $f(z)=z^2$. Then

$$
f(z) = (x+iy)^2 = (x^2 - y^2) + i(2xy)
$$

So $u=x^2-y^2$ and $v=2xy$. We get:

$$
u_x = 2x,\quad u_y = -2y,\quad v_x = 2y,\quad v_y = 2x
$$

Thus $u_x=v_y$ and $u_y=-v_x$, so $f$ is analytic everywhere.

<details>
  <summary>u(x,y) + i v(x,y) Form</summary>

  Express $f(z)=\dfrac{1}{z-1}$ as $u(x,y)+iv(x,y)$ with $z=x+iy$.

  $$
  f(z)=\frac{1}{(x-1)+iy}\cdot\frac{(x-1)-iy}{(x-1)-iy}
  =\frac{(x-1)-iy}{(x-1)^2+y^2}
  $$

  So
  $$
  u(x,y)=\frac{x-1}{(x-1)^2+y^2},\quad
  v(x,y)=-\frac{y}{(x-1)^2+y^2}.
  $$
</details>

<details>
  <summary>CR Check + Derivative</summary>

  Let $f(z)=e^{2z}$. With $z=x+iy$,
  $$
  f(z)=e^{2x}(\cos 2y + i\sin 2y)
  $$
  so
  $$
  u=e^{2x}\cos 2y,\quad v=e^{2x}\sin 2y.
  $$

  $$
  u_x=2e^{2x}\cos 2y,\quad v_y=2e^{2x}\cos 2y
  $$
  $$
  u_y=-2e^{2x}\sin 2y,\quad v_x=2e^{2x}\sin 2y
  $$

  Hence CR holds, and
  $$
  f'(z)=2e^{2z}.
  $$
</details>

<details>
  <summary>Entire Function Check</summary>

  Let
  $$
  f(z)=\cosh x \cos y + i\sinh x \sin y,\quad z=x+iy.
  $$

  Recall
  $$
  \cosh(x+iy)=\cosh x\cos y + i\sinh x\sin y.
  $$

  So $f(z)=\cosh z$, which is analytic on all of $\mathbb{C}$.
</details>

<details>
  <summary>Analytic Region</summary>

  For
  $$
  f(z)=\frac{1}{1-z},
  $$
  the only singularity is at $z=1$, so $f$ is analytic on $\mathbb{C}\setminus\{1\}$.
</details>

---

## 3. Contours and Complex Integrals (Definition Only)

A contour is a smooth path in the complex plane.  
Write it as a parameterized curve:

$$
z(t) = x(t) + i y(t),\quad t\in[a,b]
$$

The complex line integral is defined by

$$
\int_C f(z)dz = \int_a^b f(z(t))z'(t)dt
$$

This reduces the complex integral to an ordinary real integral after substitution.

### Meaning (why we care)

Think of it as “accumulating” the complex function along a path, just like a line integral in vector calculus.  
In general the value depends on the path, but for **analytic** functions something special happens:  
closed-path integrals become tightly controlled (often zero), which leads to powerful results like the Cauchy integral theorem and formula.  
That is the gateway to computing real integrals and series quickly.

---

## 4. Cauchy Integral Theorem (CIT)

If $f$ is analytic on and inside a closed contour $C$, then

$$
\oint_C f(z)dz = 0
$$

**Meaning**: for analytic functions, closed-path integrals vanish.  
This is the key structural reason complex analysis is so powerful.

---

## 5. Cauchy Integral Formula (CIF)

If $f$ is analytic on and inside $C$, and $z_0$ is inside $C$, then

$$
f(z_0) = \frac{1}{2\pi i}\oint_C \frac{f(z)}{z-z_0}dz
$$

**Meaning**: values inside a region are determined completely by values on the boundary.  
This is the bridge from “integral equals 0” to “integral gives a value.”

### Power version (derivatives)

For any integer $n\ge 0$,

$$
f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_C \frac{f(z)}{(z-z_0)^{n+1}}dz
$$

So dividing by higher powers of $(z-z_0)$ makes the integral “pick out” higher derivatives at $z_0$.

<details>
  <summary>CIF (Derivative) Example</summary>

  Compute
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}dz.
  $$

  Let $f(z)=e^z$ and $z_0=1$. By the $n=1$ case,
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}dz = 2\pi i\,f'(1)=2\pi ie.
  $$
</details>

### Sketch of derivation (hole argument)

Let $g(z)=\dfrac{f(z)}{z-z_0}$.  
$g$ is analytic everywhere inside $C$ **except** at $z_0$.  
Remove a tiny circle $C_\varepsilon$ around $z_0$; on the annulus, $g$ is analytic, so

$$
\oint_C g(z)dz=\oint_{C_\varepsilon} g(z)dz
$$

On the small circle, $f(z)\approx f(z_0)$, so

$$
\oint_{C_\varepsilon}\frac{f(z)}{z-z_0}dz \to f(z_0)\oint_{C_\varepsilon}\frac{1}{z-z_0}dz = 2\pi if(z_0)
$$

Rearranging gives the formula.

---

## 6. Taylor Series (and Its Limitation)

### Why series expansions matter

Series turn a complicated function into a sum of simple powers.  
That lets us:

- classify singularities,
- compute residues,
- and evaluate contour integrals quickly.

If $f$ is analytic at $z_0$, then it has a power series expansion

$$
f(z)=\sum_{n=0}^{\infty} a_n (z-z_0)^n,\quad a_n=\frac{f^{(n)}(z_0)}{n!}
$$

This is the complex Taylor series. It converges inside a disk centered at $z_0$ until the nearest singularity.

**Limitation**:  
If there is a singularity inside the disk (or at $z_0$ itself), the Taylor series fails.  
To describe behavior near singularities, we need a series that allows negative powers.

---

## 7. Laurent Series

Around a point $z_0$, a function can be expanded as

$$
f(z)=\sum_{n=-\infty}^{\infty} a_n (z-z_0)^n
$$

This is the **Laurent series**. It splits into:

- **Regular part** (non‑negative powers): $\sum_{n=0}^{\infty} a_n (z-z_0)^n$
- **Principal part** (negative powers): $\sum_{n=1}^{\infty} a_{-n} (z-z_0)^{-n}$

It converges on an annulus: $r<|z-z_0|<R$, bounded by the nearest singularities.

The principal part is exactly what encodes the type of singularity.

<details>
  <summary>Laurent Expansion</summary>

  Expand around $z_0=1$ (with $0<|z-1|<1$):
  $$
  \frac{1}{(z-1)(z-2)}.
  $$

  Partial fractions:
  $$
  \frac{1}{(z-1)(z-2)}=\frac{1}{z-2}-\frac{1}{z-1}.
  $$

  For $|z-1|<1$, write
  $$
  \frac{1}{z-2}=\frac{1}{(z-1)-1}=-\frac{1}{1-(z-1)}
  =-\sum_{n=0}^{\infty}(z-1)^n.
  $$

  So the Laurent series is
  $$
  -\sum_{n=0}^{\infty}(z-1)^n-\frac{1}{z-1}.
  $$
</details>

---

## 8. Isolated Singularities (Classification)

Assume $f$ has a Laurent series around $z_0$.

- **Removable**: principal part is zero (no negative powers).  
  Then $f$ can be redefined to become analytic at $z_0$.

- **Pole of order $m$**: principal part has finitely many negative powers, highest is $(z-z_0)^{-m}$.  
  Near $z_0$, $|f(z)|\to\infty$.

- **Essential**: infinitely many negative powers.  
  Behavior is wild; values near $z_0$ are dense in $\mathbb{C}$.

This classification is purely determined by the principal part of the Laurent series.

<details>
  <summary>Singularity Type</summary>

  Classify the singularity of
  $$
  f(z)=\frac{z}{e^z-1}\quad \text{at } z=0.
  $$

  Using $e^z-1=z+\frac{z^2}{2}+\cdots$, we get
  $$
  \frac{z}{e^z-1}=\frac{1}{1+\frac{z}{2}+\cdots}=1-\frac{z}{2}+\cdots
  $$

  So the principal part is zero. The singularity at $z=0$ is **removable**.
</details>

---

## 9. Residues and Residue Theorem

The **residue** of $f$ at $z_0$ is the coefficient of $(z-z_0)^{-1}$ in the Laurent series:

$$
f(z)=\cdots + \frac{a_{-1}}{z-z_0} + a_0 + a_1(z-z_0)+\cdots
$$

So

$$
\operatorname{Res}(f,z_0)=a_{-1}
$$

### Residue Theorem

If $f$ is analytic on and inside $C$ except for isolated singularities $z_1,\dots,z_n$ inside $C$, then

$$
\oint_C f(z)\,dz = 2\pi i \sum_{k=1}^n \operatorname{Res}(f,z_k)
$$

This is the main computational engine for contour integrals.

### Quick residue formulas

- Simple pole:
  $$
  \operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)
  $$

- If $f(z)=\dfrac{g(z)}{h(z)}$, $h(z_0)=0$, $h'(z_0)\neq 0$:
  $$
  \operatorname{Res}(f,z_0)=\frac{g(z_0)}{h'(z_0)}
  $$

- Pole of order $m$:
  $$
  \operatorname{Res}(f,z_0)=\frac{1}{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\big[(z-z_0)^m f(z)\big]
  $$

<details>
  <summary>Contour Integral (Residue)</summary>

  Compute
  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\,dz.
  $$

  Expand:
  $$
  \frac{z^2+4}{z^3}=\frac{1}{z}+\frac{4}{z^3}.
  $$

  The residue at $z=0$ is the coefficient of $1/z$, so $\operatorname{Res}(f,0)=1$.  
  Hence
  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\,dz = 2\pi i.
  $$
</details>

<details>
  <summary>Real Integral (Residue)</summary>

  Evaluate (with $a>0$):
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\,dx.
  $$

  Use the upper half-plane contour for
  $$
  f(z)=\frac{1}{(z^2+a^2)^2}=\frac{1}{(z-ia)^2(z+ia)^2}.
  $$

  There is a double pole at $z=ia$. The residue is
  $$
  \operatorname{Res}(f,ia)
  =\left.\frac{d}{dz}\frac{1}{(z+ia)^2}\right|_{z=ia}
  =\frac{1}{4 i a^3}.
  $$

  Therefore
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\dx
  =2\pi i\cdot \frac{1}{4 i a^3}
  =\frac{\pi}{2a^3}.
  $$
</details>

