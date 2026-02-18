---
date: '2026-02-06T22:00:00+09:00'
draft: false
title: '数学第1部分：复变函数 / Mathematics Part 1: Complex Analysis'
summary: "从一个实积分问题出发，沿着‘复数几何 -> 解析函数 -> 围道积分 -> 留数’的链条建立复变函数直觉。 / Starting from a real integral and building intuition through the chain: complex geometry -> analytic functions -> contour integrals -> residues."
tags: ["Complex Analysis", "Contour Integrals", "Residues", "Real Integrals"]
categories: ["Crucible"]
---

# 复变函数的主线 <p> The Main Thread of Complex Analysis

这篇不再按“公式清单”推进，而是按一条计算链条推进：  
This note no longer follows a formula checklist; it follows one computational chain:

复数几何 -> 解析性（CR）-> 围道积分 -> CIT/CIF -> Laurent 与奇点 -> 留数定理 -> 回到实积分。  
Complex geometry -> analyticity (CR) -> contour integration -> CIT/CIF -> Laurent and singularities -> residue theorem -> back to real integrals.

---

## 0. 起点：为什么要学它？ <p>  Start: Why Learn It?

考虑这个实积分：
Consider this real integral:

$$
\int_{0}^{\infty} \frac{1}{1+x^6}\mathrm{d}x
$$

在实变量方法里可以算，但过程往往偏重技巧。  
On the real line it is doable, but often technique-heavy.  
在复平面中，我们把它变成
In the complex plane, we turn it into

$$
f(z)=\frac{1}{1+z^6}
$$

然后选围道、找极点、算留数，流程会统一而稳定。  
then choose a contour, locate poles, and compute residues in a unified, stable workflow.

---

## 1. 复数乘法的几何意义：为什么会有“旋转+缩放” <p>  Geometry of Complex Multiplication: Why Rotation + Scaling

如果把复数写成极坐标
If we write complex numbers in polar form

$$
z_1=r_1e^{i\theta_1}\quad z_2=r_2e^{i\theta_2}
$$

则乘法变为
then multiplication becomes

$$
z_1z_2=(r_1r_2)e^{i(\theta_1+\theta_2)}
$$

你可以把它理解成：先改变长度，再改变方向。  
Interpret this as: first change magnitude, then change direction.  
这一步很关键，因为后面“解析函数局部像乘以一个复数”的直觉就来自这里。  
This is key because later intuition (“analytic maps locally look like multiplication by one complex number”) comes from here.

### 小例子 / Quick Example

$$
z=1+i=\sqrt{2}e^{i\pi/4}\quad z^2=2e^{i\pi/2}=2i
$$

即：缩放两次 $\sqrt{2}$（总共 2 倍），旋转两次 $45^\circ$（总共 $90^\circ$）。  
That is: scale by $\sqrt{2}$ twice (total factor 2), rotate by $45^\circ$ twice (total $90^\circ$).

<details>
  <summary>补充练习：坐标与极坐标互换 / Extra Practice: Rectangular <-> Polar</summary>

  将 $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ 写成 $x+iy$。  
  Express $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ in $x+iy$ form.

  $$
  \frac{\sqrt{2}+i}{\sqrt{2}-i}\cdot\frac{\sqrt{2}+i}{\sqrt{2}+i}
  =\frac{(\sqrt{2}+i)^2}{3}
  =\frac{1+2\sqrt{2}i}{3}
  $$

  所以 $x=\dfrac13,\ y=\dfrac{2\sqrt{2}}3$。  
  So $x=\dfrac13,\ y=\dfrac{2\sqrt{2}}3$.

  将 $\sqrt{3}+3i$ 写成极坐标。  
  Express $\sqrt{3}+3i$ in polar form.

  $$
  r=2\sqrt{3}\quad \theta=\frac\pi3\quad
  \sqrt{3}+3i=2\sqrt{3}e^{i\pi/3}
  $$
</details>

---

## 2. 从几何过渡到函数：解析性与 CR 方程 <p>  From Geometry to Functions: Analyticity and CR

现在从“单个复数运算”过渡到“复函数行为”。  
Now we move from single-number operations to behavior of complex functions.

设
Let

$$
f(z)=u(x,y)+iv(x,y)\quad z=x+iy
$$

复可导要求差商
Complex differentiability requires the quotient

$$
\lim_{z\to z_0}\frac{f(z)-f(z_0)}{z-z_0}
$$

从任意方向逼近都得到同一个值。  
to approach the same value from every direction.

这一条件强到足以导出 CR 方程：
This condition is strong enough to force the CR equations:

$$
u_x=v_y\quad u_y=-v_x
$$

一句直觉：解析函数在局部必须像“乘以一个复数”，所以局部线性形状必须是旋转+缩放，而 CR 就是它的坐标表达。  
Intuition in one line: an analytic function must locally look like multiplication by one complex number (rotation + scaling), and CR is that condition in coordinates.

### 小例子：$f(z)=z^2$ <p> Quick Example: $f(z)=z^2$

$$
f(z)=(x+iy)^2=(x^2-y^2)+i(2xy)
$$

$$
u=x^2-y^2,\ v=2xy
$$

$$
u_x=2x\quad v_y=2x\quad u_y=-2y\quad -v_x=-2y
$$

CR 成立，所以它处处解析。  
CR holds, so it is analytic everywhere.

---

## 3. 核心链条：围道定义 -> CIT -> CIF <p>  Core Chain: Contour -> CIT -> CIF

这部分是整章最重要的“连续动作”。  
This is the most important continuous sequence in the chapter.

### 3.1 围道积分只是“沿路径累积” <p>  Contour Integral Is “Accumulation Along a Path”

参数化路径
Parameterize a contour

$$
z(t)=x(t)+iy(t)\quad t\in[a,b]
$$

则
Then

$$
\int_C f(z)\mathrm{d}z=\int_a^b f(z(t))z'(t)\mathrm{d}t
$$

本质上就是把复积分改写成实积分。  
Essentially, it rewrites a complex integral as a real integral.

### 3.2 CIT：闭路积分为什么会是 0 <p>  CIT: Why Closed Integrals Become Zero

若 $f$ 在闭合围道及内部解析，则
If $f$ is analytic on and inside a closed contour, then

$$
\oint_C f(z)\mathrm{d}z=0
$$

这告诉我们：解析函数有强路径约束。  
This tells us analytic functions obey strong path constraints.

### 3.3 CIF：从“等于 0”升级到“直接取值” <p>  CIF: From “Equals 0” to “Gives Values”

若 $z_0$ 在 $C$ 内，则
If $z_0$ lies inside $C$, then

$$
f(z_0)=\frac{1}{2\pi i}\oint_C\frac{f(z)}{z-z_0}\mathrm{d}z
$$

这意味着区域内部的值由边界完全决定。  
This means interior values are fully determined by boundary values.

导数版本为
The derivative version is

$$
f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_C\frac{f(z)}{(z-z_0)^{n+1}}\mathrm{d}z
$$

即：分母幂次越高，提取的导数阶数越高。  
Higher powers in the denominator extract higher derivatives.

<details>
  <summary>链条小例题：CIF 直接求围道积分 / Chain Example: CIF in One Step</summary>

  计算
  Compute
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  $$

  取 $f(z)=e^z,\ z_0=1$，用 $n=1$ 的导数版 CIF：  
  Let $f(z)=e^z,\ z_0=1$, use the $n=1$ derivative form of CIF:

  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  =2\pi if'(1)
  =2\pi i e
  $$
</details>

---

## 4. 为什么需要 Laurent：因为 Taylor 到奇点会失效 <p>  Why Laurent Is Needed: Taylor Fails Near Singularities

如果函数在 $z_0$ 解析，可用 Taylor：
If a function is analytic at $z_0$, use Taylor:

$$
f(z)=\sum_{n=0}^{\infty}a_n(z-z_0)^n\quad a_n=\frac{f^{(n)}(z_0)}{n!}
$$

但一旦附近有奇点，Taylor 不够用了。  
But once singularities are nearby, Taylor is not enough.

Laurent 允许负幂：
Laurent allows negative powers:

$$
f(z)=\sum_{n=-\infty}^{\infty}a_n(z-z_0)^n
$$

这里最关键是主部（负幂项），因为它直接决定奇点类型。  
The key part is the principal part (negative powers), because it directly determines singularity type.

### 奇点分类只看主部 <p> Singularity Classification Depends on Principal Part

- 主部为 0：可去奇点。
- Principal part is zero: removable singularity.
- 负幂有限：极点。
- Finite negative powers: pole.
- 负幂无限：本性奇点。
- Infinite negative powers: essential singularity.

<details>
  <summary>补充练习：Laurent 与奇点分类 / Extra Practice: Laurent + Singularity Type</summary>

  以 $z_0=1$ 展开
  Expand around $z_0=1$
  $$
  \frac{1}{(z-1)(z-2)}
  $$

  $$
  \frac{1}{(z-1)(z-2)}=\frac1{z-2}-\frac1{z-1}\quad
  \frac1{z-2}=-\sum_{n=0}^{\infty}(z-1)^n\ (|z-1|<1)
  $$

  所以
  So
  $$
  \frac{1}{(z-1)(z-2)}=-\sum_{n=0}^{\infty}(z-1)^n-\frac1{z-1}
  $$

  再看
  Also consider
  $$
  f(z)=\frac{z}{e^z-1}\ \text{at } z=0
  $$

  $$
  \frac{z}{e^z-1}=1-\frac z2+\cdots
  $$

  主部为 0，所以是可去奇点。  
  Principal part is zero, so the singularity is removable.
</details>

---

## 5. 留数定理：把“结构”变成“算结果” <p>  Residue Theorem: Turning Structure into Numbers

留数就是 Laurent 展开里 $(z-z_0)^{-1}$ 的系数：
A residue is the coefficient of $(z-z_0)^{-1}$ in a Laurent expansion:

$$
\operatorname{Res}(f,z_0)=a_{-1}
$$

若 $f$ 在围道内部只有有限个孤立奇点，则
If $f$ has only isolated singularities inside the contour, then

$$
\oint_C f(z)\mathrm{d}z=2\pi i\sum_k \operatorname{Res}(f,z_k)
$$

这就是整条链条的计算出口。  
This is the computational output of the whole chain.

### 常用公式（只保留最常用三条） <p> Quick Formulas (Only the Three Most Used)

- 一阶极点：
- Simple pole:
  $$
  \operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)
  $$

- 商函数一阶零点形式：
- Quotient form with simple zero in denominator:
  $$
  f=\frac{g}{h},\ h(z_0)=0,\ h'(z_0)\ne0
  \Rightarrow
  \operatorname{Res}(f,z_0)=\frac{g(z_0)}{h'(z_0)}
  $$

- $m$ 阶极点：
- Pole of order $m$:
  $$
  \operatorname{Res}(f,z_0)=\frac1{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\Big[(z-z_0)^m f(z)\Big]
  $$

<details>
  <summary>例题 A：围道积分 / Example A: Contour Integral</summary>

  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\mathrm{d}z
  =\oint_{|z|=1}\left(\frac1z+\frac4{z^3}\right)dz
  $$

  $1/z$ 项系数是 1，所以留数为 1，结果
  Coefficient of $1/z$ is 1, so residue is 1, hence

  $$
  2\pi i
  $$
</details>

<details>
  <summary>例题 B：实积分 / Example B: Real Integral</summary>

  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x\quad(a>0)
  $$

  取
  Use
  $$
  f(z)=\frac1{(z^2+a^2)^2}=\frac1{(z-ia)^2(z+ia)^2}
  $$

  上半平面仅有 $z=ia$ 的二阶极点，算得
  In the upper half-plane there is only a second-order pole at $z=ia$, giving

  $$
  \operatorname{Res}(f,ia)=\left.\frac{d}{dz}\frac1{(z+ia)^2}\right|_{z=ia}=\frac1{4ia^3}
  $$

  所以
  Therefore
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x
  =2\pi i\cdot\frac1{4ia^3}
  =\frac\pi{2a^3}
  $$
</details>

---

## 6. 回扣开头那题：一条可复用流程 <p>  Back to the Opening Integral: A Reusable Workflow

回到
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

这一题的价值不在数字本身，而在它完整展示了“定义 -> 定理 -> 计算”的链条。  
The value of this example is not the number itself, but the full demonstration of the chain: definition -> theorem -> computation.

---

## 7. 实用技巧：三类定积分速查 <p>  Practical Shortcut: Three High-Frequency Integral Templates

考场上先做“类型识别”，再套模板，通常比从头推导快很多。  
In exam settings, first identify the type, then apply the template; this is usually much faster than deriving from scratch.

### 第一步：先看区间与奇偶性 <p> Step 1: Check Interval and Parity First

- 对称区间时，先判断被积函数奇偶性。  
- On symmetric intervals, always check parity first.
- 若为偶函数：$\int_{-\infty}^{\infty}f(x)\mathrm{d}x=2\int_0^\infty f(x)\mathrm{d}x$。  
- If even: $\int_{-\infty}^{\infty}f(x)\mathrm{d}x=2\int_0^\infty f(x)\mathrm{d}x$.
- 若为奇函数：对称区间积分为 0。  
- If odd: the integral over a symmetric interval is 0.

### 模板 A：分母 $1+x^k$ <p> Template A: Denominator $1+x^k$

$$
\int_0^\infty \frac{x^m}{1+x^k}\mathrm{d}x
=\frac{\pi}{k}\csc\left(\frac{(m+1)\pi}{k}\right)\quad -1<m<k-1
$$

用于识别形如 $\frac{x^m}{1+x^k}$ 的积分；若区间是 $(-\infty,\infty)$，先配合奇偶性处理。  
Use this for integrals of the form $\frac{x^m}{1+x^k}$; if the interval is $(-\infty,\infty)$, combine with parity first.

### 模板 B：分母 $(x^2+a^2)^n$ <p> Template B: Denominator $(x^2+a^2)^n$

$$
\int_0^\infty \frac{x^{2m}}{(x^2+a^2)^n}\mathrm{d}x
=\frac{a^{2m-2n+1}}{2}
B\left(m+\frac12, n-m-\frac12\right)\quad n>m+\frac12
$$

常用特例（最常考）：
Most-used special case (high-frequency):

$$
\int_0^\infty \frac{1}{(x^2+a^2)^n}\mathrm{d}x
=\frac{\sqrt\pi\Gamma\left(n-\frac12\right)}{2\Gamma(n)a^{2n-1}}
$$

若分母是多个二次因子的乘积，先做部分分式，再拆回模板 A/B。  
If the denominator is a product of quadratic factors, do partial fractions first, then reduce to Template A/B.

### 模板 C：圆周三角积分（$\theta$-型） <p> Template C: Circular Trigonometric Integrals ($\theta$-Type)

这类题常见于 $0\to2\pi$ 的周期积分，通常用 $z=e^{i\theta}$ 或直接套标准结果。  
These problems are common on $0\to2\pi$ periodic integrals, usually solved by $z=e^{i\theta}$ or by standard closed forms.

常用母公式：
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
