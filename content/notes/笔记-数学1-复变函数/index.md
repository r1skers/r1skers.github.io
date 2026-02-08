---
date: '2026-02-06T22:00:00+09:00'
draft: false
title: '数学第1部分：复变函数 / Mathematics Part 1: Complex Analysis'
summary: "为什么复数能解实问题：从一个实积分例子出发，逐步走向解析函数、围道积分与留数方法。 / Why complex numbers solve real problems: starting from a real integral and building toward analytic functions, contour integrals, and residues."
tags: ["Complex Analysis", "Contour Integrals", "Residues", "Real Integrals"]
categories: ["The Crucible"]
---

# 为什么学复变函数？
# Why Complex Analysis?

一个常见问题是：*复变函数到底带来了什么？*  
A common question is: *what does complex analysis actually buy us?*  
最直接的答案之一是：它可以把实变量下很难算的积分，转化为结构清晰、步骤短的计算。  
One of the cleanest answers is that it turns difficult real-variable integrals into short, structured computations.

考虑下面这个实积分：
Consider the real integral:

$$
\int_{0}^{\infty} \frac{1}{1+x^6}\,dx
$$

在实数轴上它能做，但过程通常比较繁琐。  
On the real line this can be done, but it is messy.  
在复平面里，我们研究
In the complex plane, we study

$$
f(z) = \frac{1}{1+z^6}
$$

并沿半圆围道做积分。极点是 $-1$ 的六次根，而留数定理会把整段计算压缩成一个很小的求和。  
and integrate it over a semicircular contour. The poles are the sixth roots of $-1$, and the residue theorem reduces the entire computation to a small sum.

这一个例子就体现了本课程的核心精神：**复分析提供结构与速度**。我们会从复数本身出发，逐步走到解析函数、围道积分和留数。  
This single example is the spirit of the course: **complex analysis gives structure and speed**. We will build the tools step by step, starting from complex numbers and moving toward analytic functions, contour integrals, and residues.

---

## 1. 乘法 = 旋转 + 缩放
## 1. Multiplication = Rotation + Scaling

我们并不是“把函数强行变成圆弧函数”。  
We are not "turning a function into a circular-arc function."  
真正的思路是：
The real idea is:

- 把实变量函数延拓为复变量函数。
- Extend a real-variable function to a complex-variable function.
- 选择一个让积分更容易的围道（积分路径）。
- Choose a contour (integration path) that makes the integral easier.

半圆只是处理 $(-\infty,\infty)$ 上实积分时常见的选择，并不是唯一选择。  
A semicircle is just a common choice for real integrals on $(-\infty,\infty)$, but it is not the only one.

把复数写成极坐标形式：
Write complex numbers in polar form:

$$
z_1 = r_1 e^{i\theta_1},\quad z_2 = r_2 e^{i\theta_2}
$$

则它们的乘积为：
Then the product is

$$
z_1 z_2 = (r_1 r_2)e^{i(\theta_1+\theta_2)}
$$

因此：
So:

- 模长相乘。
- Magnitudes multiply.
- 幅角相加。
- Angles add.

这就是复数乘法的几何意义：**先缩放，再旋转**。  
This is the geometric meaning of complex multiplication: **scale, then rotate**.

### 例子
### Example

设
Let

$$
z = 1+i = \sqrt{2}e^{i\pi/4}
$$

则
Then

$$
z^2 = 2e^{i\pi/2} = 2i
$$

解释：缩放了两次 $\sqrt{2}$（总共缩放 $2$ 倍），旋转了两次 $45^\circ$（总共旋转 $90^\circ$）。  
Interpretation: scale by $\sqrt{2}$ twice (so by $2$), and rotate by $45^\circ$ twice (so by $90^\circ$).

<details>
  <summary>直角坐标形式 (x+iy) / Rectangular Form (x+iy)</summary>

  将 $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ 写成 $x+iy$ 形式。  
  Express $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ in $x+iy$ form.

  乘以共轭有理化：
  Multiply by the conjugate:
  $$
  \frac{\sqrt{2}+i}{\sqrt{2}-i}\cdot\frac{\sqrt{2}+i}{\sqrt{2}+i}
  =\frac{(\sqrt{2}+i)^2}{2+1}
  =\frac{1+2\sqrt{2}\,i}{3}
  $$

  所以 $x=\dfrac{1}{3}$，$y=\dfrac{2\sqrt{2}}{3}$。  
  So $x=\dfrac{1}{3}$ and $y=\dfrac{2\sqrt{2}}{3}$.
</details>

<details>
  <summary>极坐标形式 / Polar Form</summary>

  将 $\sqrt{3}+3i$ 写成极坐标形式。  
  Express $\sqrt{3}+3i$ in polar form.

  $$
  r=\sqrt{(\sqrt{3})^2+3^2}=\sqrt{12}=2\sqrt{3},\quad
  \theta=\arctan\frac{3}{\sqrt{3}}=\arctan(\sqrt{3})=\frac{\pi}{3}
  $$

  因此
  So
  $$
  \sqrt{3}+3i = 2\sqrt{3}\,e^{i\pi/3}.
  $$
</details>

---

## 2. 解析性与柯西-黎曼方程
## 2. Analyticity and the Cauchy-Riemann Equations

设
Let

$$
f(z) = u(x,y) + iv(x,y), \quad z = x + iy
$$

若极限
We say $f$ is complex differentiable at $z_0$ if the limit

$$
f'(z_0) = \lim_{z\to z_0}\frac{f(z)-f(z_0)}{z-z_0}
$$

存在且与平面中逼近方向无关，则称 $f$ 在 $z_0$ 复可导。这比实可导强得多。  
exists and is the same from every direction in the plane. This is much stronger than real differentiability.

由这一要求可推出 **柯西-黎曼方程**：
From this requirement we get the **Cauchy-Riemann equations**:

$$
u_x = v_y,\quad u_y = -v_x
$$

若在某区域内 $u,v$ 一阶偏导连续且满足柯西-黎曼方程，则 $f$ 在该区域解析。  
If $u$ and $v$ have continuous first partials in a region and satisfy Cauchy-Riemann there, then $f$ is analytic in that region.

### 为什么会出现 CR 方程（简要推导）
### Why CR appears (short derivation)

复可导意味着差商必须从平面任意方向趋于同一个值。  
Complex differentiability means the difference quotient must approach the **same** value from every direction in the plane.  
比较沿实轴逼近（只改变 $x$）与沿虚轴逼近（只改变 $y$），两者极限相等会强制得到
Compare approaching along the real axis (change $x$ only) and along the imaginary axis (change $y$ only). Requiring those two limits to agree forces

$$
u_x = v_y,\quad u_y = -v_x
$$

直觉上看：解析函数在局部必须像“乘以一个复数”，也就是旋转加缩放。CR 正是这种特殊线性结构的坐标表达。  
Intuition: locally, an analytic function must look like “multiply by one complex number,” i.e., a rotation + scaling. That special linear form is exactly what CR encodes.

### 例子
### Example

设 $f(z)=z^2$，则
Let $f(z)=z^2$. Then

$$
f(z) = (x+iy)^2 = (x^2 - y^2) + i(2xy)
$$

故 $u=x^2-y^2$，$v=2xy$，有
So $u=x^2-y^2$ and $v=2xy$. We get:

$$
u_x = 2x,\quad u_y = -2y,\quad v_x = 2y,\quad v_y = 2x
$$

于是 $u_x=v_y$ 且 $u_y=-v_x$，因此 $f$ 在全平面解析。  
Thus $u_x=v_y$ and $u_y=-v_x$, so $f$ is analytic everywhere.

<details>
  <summary>拆成 u(x,y) + i v(x,y) / u(x,y) + i v(x,y) Form</summary>

  将 $f(z)=\dfrac{1}{z-1}$ 在 $z=x+iy$ 下写成 $u(x,y)+iv(x,y)$。  
  Express $f(z)=\dfrac{1}{z-1}$ as $u(x,y)+iv(x,y)$ with $z=x+iy$.

  $$
  f(z)=\frac{1}{(x-1)+iy}\cdot\frac{(x-1)-iy}{(x-1)-iy}
  =\frac{(x-1)-iy}{(x-1)^2+y^2}
  $$

  所以
  So
  $$
  u(x,y)=\frac{x-1}{(x-1)^2+y^2},\quad
  v(x,y)=-\frac{y}{(x-1)^2+y^2}.
  $$
</details>

<details>
  <summary>CR 检查 + 求导 / CR Check + Derivative</summary>

  设 $f(z)=e^{2z}$，令 $z=x+iy$，则  
  Let $f(z)=e^{2z}$. With $z=x+iy$,
  $$
  f(z)=e^{2x}(\cos 2y + i\sin 2y)
  $$
  所以
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

  因此 CR 成立，且
  Hence CR holds, and
  $$
  f'(z)=2e^{2z}.
  $$
</details>

<details>
  <summary>整函数判断 / Entire Function Check</summary>

  设
  Let
  $$
  f(z)=\cosh x \cos y + i\sinh x \sin y,\quad z=x+iy.
  $$

  回忆
  Recall
  $$
  \cosh(x+iy)=\cosh x\cos y + i\sinh x\sin y.
  $$

  因此 $f(z)=\cosh z$，在整个 $\mathbb{C}$ 上解析。  
  So $f(z)=\cosh z$, which is analytic on all of $\mathbb{C}$.
</details>

<details>
  <summary>解析区域 / Analytic Region</summary>

  对于
  For
  $$
  f(z)=\frac{1}{1-z},
  $$
  唯一奇点是 $z=1$，所以解析区域为 $\mathbb{C}\setminus\{1\}$。  
  the only singularity is at $z=1$, so $f$ is analytic on $\mathbb{C}\setminus\{1\}$.
</details>

---

## 3. 围道与复积分（先给定义）
## 3. Contours and Complex Integrals (Definition Only)

围道是复平面中的一条光滑路径。  
A contour is a smooth path in the complex plane.  
可参数化写作：
Write it as a parameterized curve:

$$
z(t) = x(t) + i y(t),\quad t\in[a,b]
$$

复线积分定义为
The complex line integral is defined by

$$
\int_C f(z)dz = \int_a^b f(z(t))z'(t)dt
$$

这会把复积分转化为代换后的实积分。  
This reduces the complex integral to an ordinary real integral after substitution.

### 含义（为什么它重要）
### Meaning (why we care)

可以把它理解成“沿一条路径累积复函数的贡献”，与向量分析中的线积分非常类似。  
Think of it as “accumulating” the complex function along a path, just like a line integral in vector calculus.  
一般情况下积分值与路径有关，但对**解析函数**会出现强约束：闭路积分往往为零，从而引出柯西积分定理和积分公式。  
In general the value depends on the path, but for **analytic** functions something special happens: closed-path integrals become tightly controlled (often zero), which leads to powerful results like the Cauchy integral theorem and formula.  
这正是快速计算实积分和级数的入口。  
That is the gateway to computing real integrals and series quickly.

---

## 4. 柯西积分定理（CIT）
## 4. Cauchy Integral Theorem (CIT)

若 $f$ 在闭合围道 $C$ 及其内部解析，则
If $f$ is analytic on and inside a closed contour $C$, then

$$
\oint_C f(z)dz = 0
$$

**含义**：对解析函数，闭路积分为零。  
**Meaning**: for analytic functions, closed-path integrals vanish.  
这是复分析“高效”的关键结构来源。  
This is the key structural reason complex analysis is so powerful.

---

## 5. 柯西积分公式（CIF）
## 5. Cauchy Integral Formula (CIF)

若 $f$ 在 $C$ 及其内部解析，且 $z_0$ 在 $C$ 内，则
If $f$ is analytic on and inside $C$, and $z_0$ is inside $C$, then

$$
f(z_0) = \frac{1}{2\pi i}\oint_C \frac{f(z)}{z-z_0}dz
$$

**含义**：区域内部函数值完全由边界函数值决定。  
**Meaning**: values inside a region are determined completely by values on the boundary.  
这一步把“积分等于 0”推进到“积分可直接给值”。  
This is the bridge from “integral equals 0” to “integral gives a value.”

### 幂次版本（求导）
### Power version (derivatives)

对任意整数 $n\ge 0$，
For any integer $n\ge 0$,

$$
f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_C \frac{f(z)}{(z-z_0)^{n+1}}dz
$$

因此，分母里提高 $(z-z_0)$ 的幂次，就能“抽取”更高阶导数。  
So dividing by higher powers of $(z-z_0)$ makes the integral “pick out” higher derivatives at $z_0$.

<details>
  <summary>CIF（导数）例题 / CIF (Derivative) Example</summary>

  计算
  Compute
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}dz.
  $$

  取 $f(z)=e^z$、$z_0=1$，使用 $n=1$ 情况：  
  Let $f(z)=e^z$ and $z_0=1$. By the $n=1$ case,
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}dz = 2\pi i\,f'(1)=2\pi ie.
  $$
</details>

### 推导思路（挖孔法）
### Sketch of derivation (hole argument)

令 $g(z)=\dfrac{f(z)}{z-z_0}$。  
Let $g(z)=\dfrac{f(z)}{z-z_0}$.  
$g$ 在 $C$ 内除 $z_0$ 外解析。  
$g$ is analytic everywhere inside $C$ **except** at $z_0$.  
在 $z_0$ 附近挖去一个小圆 $C_\varepsilon$，则在环域上 $g$ 解析，因此
Remove a tiny circle $C_\varepsilon$ around $z_0$; on the annulus, $g$ is analytic, so

$$
\oint_C g(z)dz=\oint_{C_\varepsilon} g(z)dz
$$

在小圆上有 $f(z)\approx f(z_0)$，故
On the small circle, $f(z)\approx f(z_0)$, so

$$
\oint_{C_\varepsilon}\frac{f(z)}{z-z_0}dz \to f(z_0)\oint_{C_\varepsilon}\frac{1}{z-z_0}dz = 2\pi if(z_0)
$$

整理即可得到 CIF。  
Rearranging gives the formula.

---

## 6. Taylor 级数（及其局限）
## 6. Taylor Series (and Its Limitation)

### 为什么级数展开重要
### Why series expansions matter

级数可以把复杂函数拆成简单幂函数之和。  
Series turn a complicated function into a sum of simple powers.  
这使我们能够：
That lets us:

- 分类奇点，
- classify singularities,
- 计算留数，
- compute residues,
- 快速做围道积分。
- and evaluate contour integrals quickly.

若 $f$ 在 $z_0$ 解析，则它可展开为
If $f$ is analytic at $z_0$, then it has a power series expansion

$$
f(z)=\sum_{n=0}^{\infty} a_n (z-z_0)^n,\quad a_n=\frac{f^{(n)}(z_0)}{n!}
$$

这就是复 Taylor 级数；它在以 $z_0$ 为中心、到最近奇点之前的圆盘内收敛。  
This is the complex Taylor series. It converges inside a disk centered at $z_0$ until the nearest singularity.

**局限**：  
**Limitation**:  
若圆盘内存在奇点（或 $z_0$ 本身就是奇点），Taylor 级数会失效。  
If there is a singularity inside the disk (or at $z_0$ itself), the Taylor series fails.  
要描述奇点附近行为，就需要允许负幂项的展开。  
To describe behavior near singularities, we need a series that allows negative powers.

---

## 7. Laurent 级数
## 7. Laurent Series

在点 $z_0$ 附近，函数可写作
Around a point $z_0$, a function can be expanded as

$$
f(z)=\sum_{n=-\infty}^{\infty} a_n (z-z_0)^n
$$

这就是 **Laurent 级数**，它可分为：
This is the **Laurent series**. It splits into:

- **正则部分**（非负幂）：$\sum_{n=0}^{\infty} a_n (z-z_0)^n$
- **Regular part** (non-negative powers): $\sum_{n=0}^{\infty} a_n (z-z_0)^n$
- **主部**（负幂）：$\sum_{n=1}^{\infty} a_{-n} (z-z_0)^{-n}$
- **Principal part** (negative powers): $\sum_{n=1}^{\infty} a_{-n} (z-z_0)^{-n}$

它在环域 $r<|z-z_0|<R$ 上收敛，边界由最近奇点决定。  
It converges on an annulus: $r<|z-z_0|<R$, bounded by the nearest singularities.

主部恰好编码了奇点类型。  
The principal part is exactly what encodes the type of singularity.

<details>
  <summary>Laurent 展开 / Laurent Expansion</summary>

  以 $z_0=1$ 为中心展开（$0<|z-1|<1$）：  
  Expand around $z_0=1$ (with $0<|z-1|<1$):
  $$
  \frac{1}{(z-1)(z-2)}.
  $$

  先做部分分式：
  Partial fractions:
  $$
  \frac{1}{(z-1)(z-2)}=\frac{1}{z-2}-\frac{1}{z-1}.
  $$

  当 $|z-1|<1$ 时，可写为
  For $|z-1|<1$, write
  $$
  \frac{1}{z-2}=\frac{1}{(z-1)-1}=-\frac{1}{1-(z-1)}
  =-\sum_{n=0}^{\infty}(z-1)^n.
  $$

  因此 Laurent 级数为
  So the Laurent series is
  $$
  -\sum_{n=0}^{\infty}(z-1)^n-\frac{1}{z-1}.
  $$
</details>

---

## 8. 孤立奇点（分类）
## 8. Isolated Singularities (Classification)

设 $f$ 在 $z_0$ 附近有 Laurent 展开。  
Assume $f$ has a Laurent series around $z_0$.

- **可去奇点**：主部为零（没有负幂项）。可通过重新定义使其在 $z_0$ 解析。
- **Removable**: principal part is zero (no negative powers). Then $f$ can be redefined to become analytic at $z_0$.

- **$m$ 阶极点**：主部只有有限个负幂，最高到 $(z-z_0)^{-m}$。在 $z_0$ 附近 $|f(z)|\to\infty$。
- **Pole of order $m$**: principal part has finitely many negative powers, highest is $(z-z_0)^{-m}$. Near $z_0$, $|f(z)|\to\infty$.

- **本性奇点**：有无限多个负幂，附近行为非常“混乱”，函数值在 $\mathbb{C}$ 中稠密。
- **Essential**: infinitely many negative powers. Behavior is wild; values near $z_0$ are dense in $\mathbb{C}$.

这三类完全由 Laurent 主部决定。  
This classification is purely determined by the principal part of the Laurent series.

<details>
  <summary>奇点类型判断 / Singularity Type</summary>

  判断
  Classify the singularity of
  $$
  f(z)=\frac{z}{e^z-1}\quad \text{at } z=0.
  $$

  由 $e^z-1=z+\frac{z^2}{2}+\cdots$ 得
  Using $e^z-1=z+\frac{z^2}{2}+\cdots$, we get
  $$
  \frac{z}{e^z-1}=\frac{1}{1+\frac{z}{2}+\cdots}=1-\frac{z}{2}+\cdots
  $$

  主部为零，所以 $z=0$ 是**可去奇点**。  
  So the principal part is zero. The singularity at $z=0$ is **removable**.
</details>

---

## 9. 留数与留数定理
## 9. Residues and Residue Theorem

$f$ 在 $z_0$ 处的**留数**，就是 Laurent 展开中 $(z-z_0)^{-1}$ 的系数：  
The **residue** of $f$ at $z_0$ is the coefficient of $(z-z_0)^{-1}$ in the Laurent series:

$$
f(z)=\cdots + \frac{a_{-1}}{z-z_0} + a_0 + a_1(z-z_0)+\cdots
$$

因此
So

$$
\operatorname{Res}(f,z_0)=a_{-1}
$$

### 留数定理
### Residue Theorem

若 $f$ 在 $C$ 及其内部除有限个孤立奇点 $z_1,\dots,z_n$ 外解析，则
If $f$ is analytic on and inside $C$ except for isolated singularities $z_1,\dots,z_n$ inside $C$, then

$$
\oint_C f(z)\,dz = 2\pi i \sum_{k=1}^n \operatorname{Res}(f,z_k)
$$

这是围道积分最核心的计算引擎。  
This is the main computational engine for contour integrals.

### 常用留数公式
### Quick residue formulas

- 一阶极点：
- Simple pole:
  $$
  \operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)
  $$

- 若 $f(z)=\dfrac{g(z)}{h(z)}$，且 $h(z_0)=0,\ h'(z_0)\neq 0$：
- If $f(z)=\dfrac{g(z)}{h(z)}$, $h(z_0)=0$, $h'(z_0)\neq 0$:
  $$
  \operatorname{Res}(f,z_0)=\frac{g(z_0)}{h'(z_0)}
  $$

- $m$ 阶极点：
- Pole of order $m$:
  $$
  \operatorname{Res}(f,z_0)=\frac{1}{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\big[(z-z_0)^m f(z)\big]
  $$

<details>
  <summary>围道积分（留数）/ Contour Integral (Residue)</summary>

  计算
  Compute
  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\,dz.
  $$

  展开为
  Expand:
  $$
  \frac{z^2+4}{z^3}=\frac{1}{z}+\frac{4}{z^3}.
  $$

  $z=0$ 处留数是 $1/z$ 项系数，所以 $\operatorname{Res}(f,0)=1$。  
  The residue at $z=0$ is the coefficient of $1/z$, so $\operatorname{Res}(f,0)=1$.  
  因此
  Hence
  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\,dz = 2\pi i.
  $$
</details>

<details>
  <summary>实积分（留数）/ Real Integral (Residue)</summary>

  计算（$a>0$）：
  Evaluate (with $a>0$):
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\,dx.
  $$

  在上半平面取围道，考虑
  Use the upper half-plane contour for
  $$
  f(z)=\frac{1}{(z^2+a^2)^2}=\frac{1}{(z-ia)^2(z+ia)^2}.
  $$

  $z=ia$ 处是二阶极点，其留数为
  There is a double pole at $z=ia$. The residue is
  $$
  \operatorname{Res}(f,ia)
  =\left.\frac{d}{dz}\frac{1}{(z+ia)^2}\right|_{z=ia}
  =\frac{1}{4 i a^3}.
  $$

  因此
  Therefore
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\,dx
  =2\pi i\cdot \frac{1}{4 i a^3}
  =\frac{\pi}{2a^3}.
  $$
</details>
