---
date: '2026-05-03T10:00:00+09:00'
draft: false
title: '实分析 Part 1：收敛、唯一性、有界性与柯西列'
summary: "从数列极限的 ε-N 定义开始，整理实分析证明的基本语言与常见套路，并一路走到极限唯一性、收敛列有界性和柯西列。"
description: "实分析入门笔记：从 ε-N 证明出发，理解数列收敛、极限唯一性、收敛列有界性，以及柯西列的定义与直觉。"
tags: ["Real Analysis", "Epsilon-N", "Sequence", "Convergence", "Cauchy Sequence", "Proof"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-实分析1-epsilon-n与柯西列/
---

# 实分析 Part 1：收敛、唯一性、有界性与柯西列

这一篇开始进入实分析的学习，首先是分析证明最基础的一条链条：

$$
\text{数列极限} \longrightarrow \text{唯一性} \longrightarrow \text{有界性} \longrightarrow \text{柯西列}
$$

还有重要的是：
- $\varepsilon$-$N$ 证明语言；
- 误差 $N$ 的设计；
- 熟悉三角不等式；
- 收敛控制尾部，有限项单独兜住；
- 收敛和柯西列之间的关系。

---

## 1. 数列极限的严格定义

一个数列 $(a_n)$ 收敛到 $a$，记作

$$
a_n \to a
$$

严格的定义是：

$$
\forall \varepsilon>0,\ \exists N,\ \forall n\ge N,\ |a_n-a|<\varepsilon.
$$

即：

**任意误差范围 $\varepsilon$，总能存在一个位置 $N$，使得从 $N$ 以后，所有 $a_n$ 都落在 $a$ 的 $\varepsilon$ 邻域里。**


---

## 2. 第一个例子：$\frac{1}{n}\to 0$

{{< details summary="证明：从目标误差倒推 N" >}}

$$
\frac{1}{n}\to 0.
$$

按照定义，需要证明：

$$
\forall \varepsilon>0,\ \exists N,\ \forall n\ge N,\ \left|\frac{1}{n}-0\right|<\varepsilon.
$$

也就是要让

$$
\frac{1}{n}<\varepsilon.
$$

从目标不等式倒推：

$$
n>\frac{1}{\varepsilon}.
$$

所以只要取自然数 $N$，使得

$$
N>\frac{1}{\varepsilon},
$$

那么当 $n\ge N$ 时，

$$
n\ge N>\frac{1}{\varepsilon},
$$

因此

$$
\frac{1}{n}<\varepsilon.
$$

于是

$$
\left|\frac{1}{n}-0\right|<\varepsilon.
$$

所以

$$
\frac{1}{n}\to 0.
$$

{{< /details >}}

这个例子体现了 $\varepsilon$-$N$ 证明的基本方法：

**先看目标误差需要什么条件，再倒推出 $N$ 应该怎么选。**

---

## 3. 常数倍极限

命题：

若

$$
a_n\to a,
$$

则

$$
2a_n\to 2a.
$$

{{< details summary="证明：常数倍极限" >}}

任取 $\varepsilon>0$。

因为 $a_n\to a$，所以对于正数 $\varepsilon/2>0$，存在自然数 $N$，使得当 $n\ge N$ 时，

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

于是当 $n\ge N$ 时，

$$
|2a_n-2a|
=2|a_n-a|
<2\cdot\frac{\varepsilon}{2}
=\varepsilon.
$$

因此

$$
2a_n\to 2a.
$$

{{< /details >}}

---

## 4. 和的极限（三角不等式）

命题：

若

$$
a_n\to a,\qquad b_n\to b,
$$

则

$$
a_n+b_n\to a+b.
$$

{{< details summary="证明：和的极限" >}}

任取 $\varepsilon>0$。

因为 $a_n\to a$，所以存在 $N_1$，使得当 $n\ge N_1$ 时，

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

因为 $b_n\to b$，所以存在 $N_2$，使得当 $n\ge N_2$ 时，

$$
|b_n-b|<\frac{\varepsilon}{2}.
$$

取

$$
N=\max(N_1,N_2).
$$

则当 $n\ge N$ 时，必然同时有 $n\ge N_1$ 和 $n\ge N_2$，因此两个误差控制同时成立。

于是

$$
\begin{aligned}
|(a_n+b_n)-(a+b)|
&=|(a_n-a)+(b_n-b)|\\
&\le |a_n-a|+|b_n-b|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

所以

$$
a_n+b_n\to a+b.
$$

{{< /details >}}

---

## 5. 绝对值的极限

命题：

若

$$
a_n\to a,
$$

则

$$
|a_n|\to |a|.
$$

使用反三角不等式：

$$
\big||x|-|y|\big|\le |x-y|.
$$

{{< details summary="证明：反三角不等式与绝对值极限" >}}

先证明这个不等式。

由三角不等式，

$$
|x|=|(x-y)+y|\le |x-y|+|y|,
$$

所以

$$
|x|-|y|\le |x-y|.
$$

交换 $x,y$，同理可得

$$
|y|-|x|\le |y-x|=|x-y|.
$$

于是 $|x|-|y|$ 的正负两边都被 $|x-y|$ 控制，因此

$$
\big||x|-|y|\big|\le |x-y|.
$$

现在证明原命题。

任取 $\varepsilon>0$。因为 $a_n\to a$，存在 $N$，使得当 $n\ge N$ 时，

$$
|a_n-a|<\varepsilon.
$$

于是当 $n\ge N$ 时，

$$
\big||a_n|-|a|\big|
\le |a_n-a|
<\varepsilon.
$$

所以

$$
|a_n|\to |a|.
$$

{{< /details >}}

---

## 6. 收敛数列一定有界

命题：

若

$$
a_n\to a,
$$

则数列 $(a_n)$ 有界。

也就是说，存在常数 $M>0$，使得对所有 $n$，

$$
|a_n|\le M.
$$

{{< details summary="证明：收敛列有界" >}}

因为 $a_n\to a$，取误差要求 $\varepsilon=1$，存在 $N$，使得当 $n\ge N$ 时，

$$
|a_n-a|<1.
$$

于是当 $n\ge N$ 时，

$$
|a_n|
=|(a_n-a)+a|
\le |a_n-a|+|a|
<1+|a|.
$$

这说明从第 $N$ 项以后，尾部有界。

而前面有限项

$$
a_1,a_2,\ldots,a_{N-1}
$$

也可以通过一个最大值兜住。令

$$
M=\max\{|a_1|,\ldots,|a_{N-1}|,1+|a|\}.
$$

则：

- 若 $n<N$，由 $M$ 的定义，$|a_n|\le M$；
- 若 $n\ge N$，有 $|a_n|<1+|a|\le M$。

所以对所有 $n$，都有

$$
|a_n|\le M.
$$

因此 $(a_n)$ 有界。

{{< /details >}}

这个证明的套路很重要：

**收敛性直接控制尾巴，前面有限多个项再用最大值单独兜住。**

在赋范空间中也有完全类似的版本：如果 $x_n\to x$，则 $(x_n)$ 有界。证明只需要把绝对值换成范数。

---

## 7. 极限唯一性

命题：

若

$$
a_n\to a
$$

且

$$
a_n\to b,
$$

则

$$
a=b.
$$

{{< details summary="证明：极限唯一性" >}}

任取 $\varepsilon>0$。

因为 $a_n\to a$，存在 $N_1$，使得当 $n\ge N_1$ 时，

$$
|a_n-a|<\frac{\varepsilon}{2}.
$$

因为 $a_n\to b$，存在 $N_2$，使得当 $n\ge N_2$ 时，

$$
|a_n-b|<\frac{\varepsilon}{2}.
$$

取

$$
N=\max(N_1,N_2).
$$

当 $n\ge N$ 时，两者同时成立。于是

$$
\begin{aligned}
|a-b|
&=|a-a_n+a_n-b|\\
&\le |a-a_n|+|a_n-b|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

所以对任意 $\varepsilon>0$，都有

$$
|a-b|<\varepsilon.
$$

由于 $|a-b|\ge 0$，这只能说明

$$
|a-b|=0.
$$

因此

$$
a=b.
$$

{{< /details >}}

---

## 8. 柯西列

普通收敛需要先知道极限是谁：

$$
a_n\to a.
$$

柯西列不先指定极限，而是提问：

**数列尾巴内部的项是否彼此越来越接近。**

定义：

数列 $(a_n)$ 是柯西列，若

$$
\forall \varepsilon>0,\ \exists N,\ \forall m,n\ge N,\ |a_n-a_m|<\varepsilon.
$$

注意这里比较的是尾巴里的任意两项：

$$
|a_n-a_m|.
$$

而不是某一项和某个已知极限之间的距离。

---

## 9. 收敛列一定是柯西列

命题：

若

$$
a_n\to a,
$$

则 $(a_n)$ 是柯西列。

{{< details summary="证明：收敛列一定是柯西列" >}}

任取 $\varepsilon>0$。

因为 $a_n\to a$，所以对 $\varepsilon/2>0$，存在 $N$，使得当 $k\ge N$ 时，

$$
|a_k-a|<\frac{\varepsilon}{2}.
$$

于是当 $m,n\ge N$ 时，

$$
|a_n-a|<\frac{\varepsilon}{2},
\qquad
|a_m-a|<\frac{\varepsilon}{2}.
$$

用 $a$ 做桥：

$$
\begin{aligned}
|a_n-a_m|
&=|a_n-a+a-a_m|\\
&\le |a_n-a|+|a_m-a|\\
&<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}\\
&=\varepsilon.
\end{aligned}
$$

所以 $(a_n)$ 是柯西列。

{{< /details >}}

这个命题说明：

$$
\text{收敛} \Longrightarrow \text{柯西}.
$$

也就是说，只要数列真的收敛到某个极限，那么尾巴内部必然会越来越稳定。

---

## 10. 完备性作为下一站

到这里为止，我们已经得到一条方向明确的链：

$$
\text{收敛} \Longrightarrow \text{柯西}.
$$

这个方向在很一般的空间里都成立，不需要额外假设。

但反过来：

$$
\text{柯西} \Longrightarrow \text{收敛}
$$

就不总是成立了。

这就是完备性要解决的问题。

粗略地说：

- 在 $\mathbb{R}$ 中，每个柯西列都收敛；
- 在 $\mathbb{Q}$ 中，柯西列不一定收敛到有理数；
- Banach 空间就是完备的赋范空间；
- Hilbert 空间就是完备的内积空间。

因此，完备性可以理解为：

**只要一个逼近过程内部已经足够稳定，它就会落到空间中的某个对象上。**

这也是后面进入 Banach 空间、Hilbert 空间时最重要的理解之一。

---

## 总结

这一篇整理了实分析证明的基础链条：

1. $\varepsilon$-$N$ 定义把“越来越接近”变成了可验证的语句；
2. 常数倍极限和和的极限训练了误差分配；
3. 绝对值极限依赖反三角不等式；
4. 收敛列有界依赖“尾巴控制 + 有限项兜底”；
5. 极限唯一性依赖用同一个 $a_n$ 做桥；
6. 收敛列一定是柯西列，说明收敛会带来尾巴内部稳定；
7. 柯西列能否反过来推出收敛，正是完备性要回答的问题。
