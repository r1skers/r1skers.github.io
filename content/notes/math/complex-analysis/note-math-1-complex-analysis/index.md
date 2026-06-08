---
date: '2026-02-06T22:00:00+09:00'
draft: false
title: '数学第1部分：复变函数'
summary: "从一个实积分问题出发，沿着‘复数几何 -> 解析函数 -> 围道积分 -> 留数’的链条建立复变函数直觉。"
tags: ["Complex Analysis", "Contour Integrals", "Residues", "Real Integrals"]
categories: ["Crucible"]
aliases:
  - /notes/note-math-1-complex-analysis/
---

# 复变函数的主线

这篇不再按“公式清单”推进，而是按一条计算链条推进：  

复数几何 -> 解析性（CR）-> 围道积分 -> CIT/CIF -> Laurent 与奇点 -> 留数定理 -> 回到实积分。  

---

## 0. 起点：为什么要学它？

考虑这个实积分：

$$
\int_{0}^{\infty} \frac{1}{1+x^6}\mathrm{d}x
$$

在实变量方法里可以算，但过程往往偏重技巧。  
在复平面中，我们把它变成

$$
f(z)=\frac{1}{1+z^6}
$$

然后选围道、找极点、算留数，流程会统一而稳定。  

---

## 1. 复数乘法的几何意义：为什么会有“旋转+缩放”

如果把复数写成极坐标

$$
z_1=r_1e^{i\theta_1}\quad z_2=r_2e^{i\theta_2}
$$

则乘法变为

$$
z_1z_2=(r_1r_2)e^{i(\theta_1+\theta_2)}
$$

你可以把它理解成：先改变长度，再改变方向。  
这一步很关键，因为后面“解析函数局部像乘以一个复数”的直觉就来自这里。  

### 小例子

$$
z=1+i=\sqrt{2}e^{i\pi/4}\quad z^2=2e^{i\pi/2}=2i
$$

即：缩放两次 $\sqrt{2}$（总共 2 倍），旋转两次 $45^\circ$（总共 $90^\circ$）。  

### 补充练习：坐标与极坐标互换

  将 $\dfrac{\sqrt{2}+i}{\sqrt{2}-i}$ 写成 $x+iy$。  

  $$
  \frac{\sqrt{2}+i}{\sqrt{2}-i}\cdot\frac{\sqrt{2}+i}{\sqrt{2}+i}
  =\frac{(\sqrt{2}+i)^2}{3}
  =\frac{1+2\sqrt{2}i}{3}
  $$

  所以 $x=\dfrac13,\ y=\dfrac{2\sqrt{2}}3$。  

  将 $\sqrt{3}+3i$ 写成极坐标。  

  $$
  r=2\sqrt{3}\quad \theta=\frac\pi3\quad
  \sqrt{3}+3i=2\sqrt{3}e^{i\pi/3}
  $$

---

## 2. 从几何过渡到函数：解析性与 CR 方程

现在从“单个复数运算”过渡到“复函数行为”。  

设

$$
f(z)=u(x,y)+iv(x,y)\quad z=x+iy
$$

复可导要求差商

$$
\lim_{z\to z_0}\frac{f(z)-f(z_0)}{z-z_0}
$$

从任意方向逼近都得到同一个值。  

这一条件强到足以导出 CR 方程：

$$
u_x=v_y\quad u_y=-v_x
$$

一句直觉：解析函数在局部必须像“乘以一个复数”，所以局部线性形状必须是旋转+缩放，而 CR 就是它的坐标表达。  

### 小例子：$f(z)=z^2$

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

---

## 3. 核心链条：围道定义 -> CIT -> CIF

这部分是整章最重要的“连续动作”。  

### 3.1 围道积分只是“沿路径累积”

参数化路径

$$
z(t)=x(t)+iy(t)\quad t\in[a,b]
$$

则

$$
\int_C f(z)\mathrm{d}z=\int_a^b f(z(t))z'(t)\mathrm{d}t
$$

本质上就是把复积分改写成实积分。  

### 3.2 CIT：闭路积分为什么会是 0

若 $f$ 在闭合围道及内部解析，则

$$
\oint_C f(z)\mathrm{d}z=0
$$

这告诉我们：解析函数有强路径约束。  

### 3.3 CIF：从“等于 0”升级到“直接取值”

若 $z_0$ 在 $C$ 内，则

$$
f(z_0)=\frac{1}{2\pi i}\oint_C\frac{f(z)}{z-z_0}\mathrm{d}z
$$

这意味着区域内部的值由边界完全决定。  

导数版本为

$$
f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_C\frac{f(z)}{(z-z_0)^{n+1}}\mathrm{d}z
$$

即：分母幂次越高，提取的导数阶数越高。  

### 链条小例题：CIF 直接求围道积分

  计算
  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  $$

  取 $f(z)=e^z,\ z_0=1$，用 $n=1$ 的导数版 CIF：

  $$
  \oint_{|z|=2}\frac{e^z}{(z-1)^2}\mathrm{d}z
  =2\pi if'(1)
  =2\pi i e
  $$

---

## 4. 为什么需要 Laurent：因为 Taylor 到奇点会失效

如果函数在 $z_0$ 解析，可用 Taylor：

$$
f(z)=\sum_{n=0}^{\infty}a_n(z-z_0)^n\quad a_n=\frac{f^{(n)}(z_0)}{n!}
$$

但一旦附近有奇点，Taylor 不够用了。  

Laurent 允许负幂：

$$
f(z)=\sum_{n=-\infty}^{\infty}a_n(z-z_0)^n
$$

这里最关键是主部（负幂项），因为它直接决定奇点类型。  

### 奇点分类只看主部

- 主部为 0：可去奇点。
- 负幂有限：极点。
- 负幂无限：本性奇点。

### 补充练习：Laurent 与奇点分类

  以 $z_0=1$ 展开
  $$
  \frac{1}{(z-1)(z-2)}
  $$

  $$
  \frac{1}{(z-1)(z-2)}=\frac1{z-2}-\frac1{z-1}\quad
  \frac1{z-2}=-\sum_{n=0}^{\infty}(z-1)^n\ (|z-1|\lt 1)
  $$

  所以
  $$
  \frac{1}{(z-1)(z-2)}=-\sum_{n=0}^{\infty}(z-1)^n-\frac1{z-1}
  $$

  再看
  $$
  f(z)=\frac{z}{e^z-1}\ \text{at } z=0
  $$

  $$
  \frac{z}{e^z-1}=1-\frac z2+\cdots
  $$

  主部为 0，所以是可去奇点。  

---

## 5. 留数定理：把“结构”变成“算结果”

留数就是 Laurent 展开里 $(z-z_0)^{-1}$ 的系数：

$$
\operatorname{Res}(f,z_0)=a_{-1}
$$

若 $f$ 在围道内部只有有限个孤立奇点，则

$$
\oint_C f(z)\mathrm{d}z=2\pi i\sum_k \operatorname{Res}(f,z_k)
$$

这就是整条链条的计算出口。  

### 常用公式（只保留最常用三条）

- 一阶极点：
  $$
  \operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)
  $$

- 商函数一阶零点形式：
  $$
  f=\frac{g}{h},\ h(z_0)=0,\ h'(z_0)\ne0
  \Rightarrow
  \operatorname{Res}(f,z_0)=\frac{g(z_0)}{h'(z_0)}
  $$

- $m$ 阶极点：
  $$
  \operatorname{Res}(f,z_0)=\frac1{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\Big[(z-z_0)^m f(z)\Big]
  $$

### 例题 A：围道积分

  $$
  \oint_{|z|=1}\frac{z^2+4}{z^3}\mathrm{d}z
  =\oint_{|z|=1}\left(\frac1z+\frac4{z^3}\right)dz
  $$

  $1/z$ 项系数是 1，所以留数为 1，结果

  $$
  2\pi i
  $$

### 例题 B：实积分

  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x\quad(a\gt 0)
  $$

  取
  $$
  f(z)=\frac1{(z^2+a^2)^2}=\frac1{(z-ia)^2(z+ia)^2}
  $$

  上半平面仅有 $z=ia$ 的二阶极点，算得

  $$
  \operatorname{Res}(f,ia)=\left.\frac{d}{dz}\frac1{(z+ia)^2}\right|_{z=ia}=\frac1{4ia^3}
  $$

  所以
  $$
  \int_{-\infty}^{\infty}\frac{1}{(x^2+a^2)^2}\mathrm{d}x
  =2\pi i\cdot\frac1{4ia^3}
  =\frac\pi{2a^3}
  $$

---

## 6. 回扣开头那题：一条可复用流程

回到

$$
\int_{0}^{\infty}\frac1{1+x^6}\mathrm{d}x
$$



1. 把被积函数扩展成 $f(z)=\dfrac1{1+z^6}$，并选择上半平面围道。

2. 找出围道内部的极点，也就是方程 $z^6=-1$ 在上半平面的根。

  
3. 对 $(-\infty,\infty)$ 的积分应用留数定理，再利用偶函数对称性折回到 $(0,\infty)$。



$$
\int_{0}^{\infty}\frac1{1+x^6}\mathrm{d}x=\frac\pi3
$$

这一题的价值不在数字本身，而在它完整展示了“定义 -> 定理 -> 计算”的链条。  

---

## 7. 实用技巧：三类定积分速查

考场上先做“类型识别”，再套模板，通常比从头推导快很多。  

### 第一步：先看区间与奇偶性

- 对称区间时，先判断被积函数奇偶性。  
- 若为偶函数：$\int_{-\infty}^{\infty}f(x)\mathrm{d}x=2\int_0^\infty f(x)\mathrm{d}x$。  
- 若为奇函数：对称区间积分为 0。  

### 模板 A：分母 $1+x^k$

$$
\int_0^\infty \frac{x^m}{1+x^k}\mathrm{d}x
=\frac{\pi}{k}\csc\!\left(\frac{(m+1)\pi}{k}\right),
\qquad -1\lt m\lt k-1
$$

用于识别形如 $\dfrac{x^m}{1+x^k}$ 的积分；若区间是 $(-\infty,\infty)$，先配合奇偶性处理。  

### 模板 B：分母 $(x^2+a^2)^n$

$$
\int_0^\infty \frac{x^{2m}}{(x^2+a^2)^n}\mathrm{d}x
=\frac{a^{2m-2n+1}}{2}
\operatorname{B}\!\left(m+\frac12,\; n-m-\frac12\right),
\qquad n\gt m+\frac12
$$

常用特例（最常考）：

$$
\int_0^\infty \frac{1}{(x^2+a^2)^n}\mathrm{d}x
=\frac{\sqrt\pi\,\Gamma\!\left(n-\frac12\right)}{2\,\Gamma(n)\,a^{2n-1}}
$$

若分母是多个二次因子的乘积，先做部分分式，再拆回模板 A/B。  

### 模板 C：圆周三角积分（$\theta$-型）

这类题常见于 $0\to2\pi$ 的周期积分，通常用 $z=e^{i\theta}$ 或直接套标准结果。  

常用母公式：

$$
\int_0^{2\pi}\frac{d\theta}{A+B\cos\theta+C\sin\theta}
=\frac{2\pi}{\sqrt{A^2-B^2-C^2}}\quad A\gt\sqrt{B^2+C^2}
$$

$$
\int_0^{2\pi}\frac{d\theta}{(A+B\cos\theta)^2}
=\frac{2\pi A}{(A^2-B^2)^{3/2}}\quad A\gt|B|
$$

$$
\int_0^{2\pi}\frac{d\theta}{a+b\sin^2\theta}
=\frac{2\pi}{\sqrt{a(a+b)}}\quad a\gt 0\ \text{and}\ a+b\gt 0
$$
