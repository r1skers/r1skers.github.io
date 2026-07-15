---
date: '2026-06-22T10:00:00+09:00'
draft: false
title: '优化与变分：拉格朗日函数与拉格朗日算子'
summary: "从无约束驻点出发，理解等式约束下「梯度必须对齐」的几何，引出拉格朗日函数 L(x,λ)，再把「构造 L 并求驻点」这件事抽象成拉格朗日算子，最后搭一座通向变分法欧拉–拉格朗日方程的桥。"
description: "优化与变分入门笔记：约束优化的梯度对齐几何、拉格朗日乘子、拉格朗日函数 L(x,λ)，以及把驻点系统看成拉格朗日算子，并通向无穷维变分。"
tags: ["Optimization", "Calculus of Variations", "Lagrangian", "Lagrange Multiplier", "Euler-Lagrange", "KKT"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-优化-拉格朗日函数与拉格朗日算子/
  - /notes/note-opt-lagrangian/
---

# 优化与变分：拉格朗日函数与拉格朗日算子

> 本篇承接 [Part 3：Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)，把无约束驻点系统扩展到等式约束与变分；全系列依赖见 [Part 0 路线图](/notes/math/optimization-variation/note-opt-0-roadmap/)。

本篇主题是约束优化的拉格朗日乘子法。先把要走的主线拉出来：

$$
\text{无约束驻点}
\longrightarrow \text{约束几何（梯度对齐）}
\longrightarrow \text{拉格朗日函数}
\longrightarrow \text{拉格朗日算子}
\longrightarrow \text{变分：欧拉–拉格朗日}
$$

重点：

- 无约束最优的一阶条件是 $\nabla f=0$；
- 加上等式约束，$\nabla f$ 不再为零，而是必须垂直于约束曲面；
- 拉格朗日函数把「约束问题」改写成一个「无约束驻点问题」；
- 把「构造拉格朗日函数 + 求驻点」整体看成一个**算子**，它的零点就是候选最优解；
- 在函数空间中这个算子就是变分法里的欧拉–拉格朗日算子。

---

## 1. 无约束优化：驻点条件

最简单的背景：在整个 $\mathbb{R}^n$ 上极小化光滑函数 $f$，

$$
\min_{x\in\mathbb{R}^n} f(x).
$$

如果 $x^*$ 是一个局部极小点，那么沿任意方向 $v$ 的方向导数都不能让 $f$ 进一步下降，这等价于一阶条件

$$
\nabla f(x^*)=0.
$$

满足 $\nabla f(x)=0$ 的点称为**驻点**。二阶信息进一步判别：若 Hessian

$$
\nabla^2 f(x^*)\succeq 0
$$

（半正定），则 $x^*$ 是局部极小的候选；严格正定时是严格局部极小。

结论：**无约束最优 $\Longrightarrow$ 梯度为零**。

---

## 2. 等式约束：为什么不能直接令 $\nabla f=0$

现在如果有一个等式约束：

$$
\min_{x} f(x)\quad\text{s.t.}\quad g(x)=0.
$$

可行集是曲面 $\{x:g(x)=0\}$。我们只能在这张曲面上走动，而不能自由地往 $-\nabla f$ 方向下降。

这里的关键观察是：

**在约束曲面上的最优点，$\nabla f$ 不必为零，但它在曲面切方向上的分量必须为零。**

否则，如果 $\nabla f$ 在某个切方向 $v$ 上还有非零分量，我们就能沿着曲面朝 $-v$ 方向挪一小步，既不破坏约束、又让 $f$ 继续下降——与「最优」矛盾。

> 举个例子：把 $f$ 想成山的高度，约束 $g(x)=0$ 是地上画好的一条小路，你只能沿小路走。小路与某条等高线**相交**时，顺着它还能爬到更高的等高线；只有当小路与等高线**相切**时，才到了小路上的最高点。而「相切」正意味着两者法向同向——$\nabla f$ 与 $\nabla g$ 平行。下一节把这句话写精确。

---

## 3. 梯度对齐与拉格朗日乘子

先搞清楚一点：**我们对约束 $g$ 求梯度，不是因为在乎 $g$ 的数值**——在约束曲面上 $g$ 恒等于 $0$、根本不变——**而是需要「约束曲面的法线方向」**。任何函数的梯度都垂直于它自己的等高线（等值面）；而约束 $g=0$ 恰好就是 $g$ 的一条等值面，所以

$$
\nabla g\ \perp\ \{g=0\}.
$$

高度是 $f$ 的事，$\nabla g$ 只贡献**方向**、而不贡献高度。想象在山上沿一条固定小路 $g=0$ 找最高点：小路上 $g$ 一直是 $0$，所谓「$g$ 的最高点」并不存在；我们要的是 $f$ 沿小路的最高点，而 $\nabla g$ 的作用，是给出这条小路的法线。

把上面的例子转成几何语言。约束曲面 $g(x)=0$ 在点 $x^*$ 处的**切空间**是

$$
T_{x^*}=\{v:\nabla g(x^*)^\top v=0\},
$$

也就是与 $\nabla g(x^*)$ 正交的那张超平面。第 2 节的结论是：$\nabla f(x^*)$ 在 $T_{x^*}$ 上的投影为零，即 $\nabla f(x^*)\perp T_{x^*}$。

而与整张切空间正交的方向只有一条——就是法方向 $\nabla g(x^*)$。于是 $\nabla f(x^*)$ 必须与 $\nabla g(x^*)$ 平行：

$$
\nabla f(x^*)=-\lambda\,\nabla g(x^*).
$$

这里的标量 $\lambda$ 就是**拉格朗日乘子**，负号只是把它挪到等式同侧的习惯写法。

{{< details summary="证明：约束最优处梯度必平行" >}}

设 $x^*$ 是约束极小点，$v$ 是 $x^*$ 处任意一个切向量，即 $\nabla g(x^*)^\top v=0$。

取一条始终落在约束曲面上、且 $\gamma(0)=x^*,\ \gamma'(0)=v$ 的光滑曲线 $\gamma(t)$（约束非退化时这样的曲线存在）。沿这条曲线 $f(\gamma(t))$ 在 $t=0$ 取到局部极小，故

$$
\left.\frac{d}{dt}\right|_{t=0} f(\gamma(t))
=\nabla f(x^*)^\top v=0.
$$

由于 $v$ 是任意切向量，这说明 $\nabla f(x^*)$ 与整张切空间 $T_{x^*}$ 正交。

切空间 $T_{x^*}$ 是 $\nabla g(x^*)$ 的正交补，其正交补只能由 $\nabla g(x^*)$ 张成（设 $\nabla g(x^*)\neq 0$）。因此存在标量 $\lambda$，使得

$$
\nabla f(x^*)=-\lambda\,\nabla g(x^*).
$$

{{< /details >}}

注意条件 $\nabla g(x^*)\neq 0$：它保证约束曲面在该点是光滑的、法方向唯一。这类「约束非退化」的前提，后面会以**约束规范（constraint qualification）**的名字反复出现。

---

## 4. 拉格朗日函数

第 3 节给出的最优性其实是两条方程：

$$
\nabla f(x^*)+\lambda\,\nabla g(x^*)=0,
\qquad
g(x^*)=0.
$$

第一条是梯度对齐，第二条是可行性。能不能把它们**统一**成「某个函数的驻点」？可以。定义**拉格朗日函数**

$$
L(x,\lambda)=f(x)+\lambda\,g(x),
$$

把乘子 $\lambda$ 也当成一个自变量。对它求偏导：

$$
\frac{\partial L}{\partial x}=\nabla f(x)+\lambda\,\nabla g(x),
\qquad
\frac{\partial L}{\partial \lambda}=g(x).
$$

令这两组偏导同时为零：

$$
\nabla_x L=0 \ \Longleftrightarrow\ \nabla f+\lambda\nabla g=0\quad(\text{梯度对齐}),
$$
$$
\frac{\partial L}{\partial\lambda}=0 \ \Longleftrightarrow\ g(x)=0\quad(\text{可行性}).
$$

这正是第 3 节的两条方程。换句话说：

**约束优化的最优性条件 $=$ 拉格朗日函数 $L(x,\lambda)$ 的驻点条件。**

引入 $\lambda$ 作自变量、把约束「吸收」进目标，看似多了一个未知量，实则把「带约束的极值」变回了我们熟悉的「无约束驻点」。这就是拉格朗日乘子法的全部魔法。

---

## 5. 拉格朗日算子：把「构造 $L$ 并求驻点」看成一个算子

把第 4 节的动作再抽象一层。给定 $(f,g)$，我们做的事情是：先拼出 $L=f+\lambda g$，再对所有自变量取梯度。这整个映射可以打包成一个**算子**，作用在 $(x,\lambda)$ 上、输出一个向量值方程组：

$$
\mathcal{L}(x,\lambda)
:=\nabla_{(x,\lambda)}L
=\begin{pmatrix}
\nabla_x f(x)+\lambda\,\nabla_x g(x)\\[4pt]
g(x)
\end{pmatrix}.
$$

这个 $\mathcal{L}$ 就是**拉格朗日算子**。它的意义在于把最优化问题翻译成一个**求根问题**：

$$
\boxed{\ \mathcal{L}(x,\lambda)=0\ }
$$

的解集，恰好是所有满足一阶最优性条件的候选点 $(x^*,\lambda^*)$。于是「优化」被换成了「解算子的零点」。

这样看的好处：

- **统一**：等式约束、不等式约束、多约束，全都只是改变 $\mathcal{L}$ 的分量，求根的框架不变。
- **可计算**：$\mathcal{L}(x,\lambda)=0$ 是一个（一般非线性的）方程组，可以交给牛顿法等数值方法；牛顿迭代用到的正是 $\mathcal{L}$ 的雅可比，也就是带边 Hessian（bordered Hessian）。
- **可推广**：把 $x$ 从有限维向量换成函数，$\mathcal{L}$ 就变成微分算子——这正是第 8 节要走到的变分。

> 术语提醒：文献里「拉格朗日算子」有时也直接指乘子项 $\lambda$ 的引入操作，或在变分语境下指欧拉–拉格朗日算子。本篇统一采用「$L$ 的驻点算子 $\nabla_{(x,\lambda)}L$」这一理解，它能把有限维与无穷维两种情形接到同一根线上。

---

## 6. 多约束与不等式约束（KKT）

多个等式约束 $g_1=\cdots=g_m=0$ 时，每条约束配一个乘子，拉格朗日函数变成

$$
L(x,\lambda)=f(x)+\sum_{i=1}^m \lambda_i\,g_i(x)
=f(x)+\lambda^\top g(x),
$$

梯度对齐条件相应变成

$$
\nabla f(x^*)+\sum_{i=1}^m \lambda_i\,\nabla g_i(x^*)=0,
$$

即 $\nabla f$ 落在各约束法向量张成的子空间里。

若还有不等式约束 $h_j(x)\le 0$，最优性条件升级为 **KKT 条件**：在拉格朗日函数 $L=f+\lambda^\top g+\mu^\top h$ 的驻点之外，额外要求

$$
\mu_j\ge 0,\qquad \mu_j\,h_j(x^*)=0\ \ (\text{互补松弛}).
$$

互补松弛的直觉是：一条不等式约束要么「贴着边界」（$h_j=0$，此时可以有 $\mu_j>0$，表现得像等式约束），要么「松弛在内部」（$h_j\lt0$，此时 $\mu_j=0$，这条约束不起作用）。KKT 会在后面提到。

---

## 7. 一个完整例子

在单位圆上极大化线性函数：

$$
\max_{x,y}\ x+y
\quad\text{s.t.}\quad
x^2+y^2=1.
$$

<figure style="margin:1.2rem 0;text-align:center;">
<svg viewBox="0 0 680 500" role="img" style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto;font-family:inherit;" xmlns="http://www.w3.org/2000/svg">
<title>单位圆上极大化 x+y 的梯度对齐</title>
<desc>虚线是 f=x+y 的等高线，实线圆是约束 g=0。最优点处小路与等高线相切、∇f 与 ∇g 平行且都垂直于切线；底部非最优点 ∇f 沿小路切线仍有分量，还能继续升高。</desc>
<defs>
<marker id="ahB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker>
<marker id="ahA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d97706"/></marker>
<marker id="tk" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker>
</defs>
<line x1="165" y1="250" x2="560" y2="250" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
<line x1="340" y1="420" x2="340" y2="86" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
<path d="M560,250 L551,245 L551,255 Z" fill="currentColor" fill-opacity="0.55"/>
<path d="M340,82 L335,91 L345,91 Z" fill="currentColor" fill-opacity="0.55"/>
<line x1="490" y1="246" x2="490" y2="254" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2"/>
<line x1="336" y1="100" x2="344" y2="100" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.2"/>
<line x1="150" y1="180" x2="400" y2="430" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="160" y1="70" x2="520" y2="430" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="280" y1="70" x2="530" y2="320" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="5 4"/>
<line x1="372" y1="70" x2="530" y2="228" stroke="currentColor" stroke-opacity="0.65" stroke-width="1.8"/>
<circle cx="340" cy="250" r="150" fill="none" stroke="#0d9488" stroke-width="2.6"/>
<circle cx="340" cy="250" r="3" fill="currentColor" fill-opacity="0.55"/>
<line x1="296" y1="400" x2="384" y2="400" stroke="#94a3b8" stroke-width="2" marker-start="url(#tk)" marker-end="url(#tk)"/>
<line x1="340" y1="400" x2="382" y2="358" stroke="#2563eb" stroke-width="3" stroke-linecap="round" marker-end="url(#ahB)"/>
<circle cx="340" cy="400" r="4" fill="currentColor"/>
<circle cx="446" cy="144" r="4.5" fill="currentColor"/>
<line x1="446" y1="144" x2="494" y2="96" stroke="#2563eb" stroke-width="3" stroke-linecap="round" marker-end="url(#ahB)"/>
<line x1="455" y1="153" x2="503" y2="105" stroke="#d97706" stroke-width="3" stroke-linecap="round" marker-end="url(#ahA)"/>
<text x="60" y="92" fill="currentColor" font-size="12">f 的等高线（虚线，∇f ⊥ 它）</text>
<text x="60" y="436" fill="currentColor" font-size="12">约束 g = 0：小路（实线圆，g 恒为 0）</text>
<text x="500" y="90" fill="#2563eb" font-size="14">∇f</text>
<text x="510" y="124" fill="#d97706" font-size="14">∇g</text>
<text x="540" y="146" fill="currentColor" font-size="12">最优点 T</text>
<text x="540" y="166" fill="currentColor" font-size="12">(1/√2, 1/√2)</text>
<text x="540" y="186" fill="currentColor" font-size="12">∇f ∥ ∇g，⊥ 切线</text>
<text x="392" y="402" fill="currentColor" font-size="12">小路切线</text>
<text x="388" y="356" fill="#2563eb" font-size="14">∇f</text>
<text x="150" y="474" fill="currentColor" font-size="12">非最优点：∇f 在小路切线方向仍有分量，还能往上爬</text>
<text x="566" y="255" fill="currentColor" font-size="12" font-style="italic">x</text>
<text x="348" y="82" fill="currentColor" font-size="12" font-style="italic">y</text>
<text x="496" y="268" fill="currentColor" font-size="12">1</text>
<text x="350" y="110" fill="currentColor" font-size="12">1</text>
<text x="320" y="270" fill="currentColor" font-size="12">O</text>
<text x="420" y="166" fill="currentColor" font-size="12">T</text>
<text x="244" y="420" fill="currentColor" font-size="12">P (0, −1)</text>
</svg>
<figcaption style="font-size:0.9em;opacity:0.75;margin-top:0.4rem;">图：单位圆上 max(x+y) 的梯度对齐——相切点处 ∇f ∥ ∇g，非最优点 ∇f 沿小路仍有分量。</figcaption>
</figure>

{{< details summary="求解：写出拉格朗日函数并解驻点系统" >}}

取 $f=x+y$，$g=x^2+y^2-1$，拉格朗日函数

$$
L(x,y,\lambda)=x+y+\lambda\,(x^2+y^2-1).
$$

驻点条件 $\mathcal{L}=0$ 给出三条方程：

$$
\frac{\partial L}{\partial x}=1+2\lambda x=0,
\qquad
\frac{\partial L}{\partial y}=1+2\lambda y=0,
\qquad
\frac{\partial L}{\partial \lambda}=x^2+y^2-1=0.
$$

由前两条得

$$
x=y=-\frac{1}{2\lambda},
$$

代入约束：

$$
2x^2=1
\ \Longrightarrow\
x=\pm\frac{1}{\sqrt2}.
$$

于是两个候选点为

$$
\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right),
\qquad
\left(-\tfrac{1}{\sqrt2},-\tfrac{1}{\sqrt2}\right),
$$

对应 $f=\sqrt2$ 与 $f=-\sqrt2$。取较大者，最大值

$$
\max\ (x+y)=\sqrt2,\quad\text{在}\ \left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right)\ \text{处取到}.
$$

{{< /details >}}

几何上这毫不意外：$x+y$ 的梯度是常向量 $(1,1)$，它在圆上「最远」的那一点，正是圆周外法向与 $(1,1)$ 同向的地方，即 $\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right)$。梯度对齐 $\nabla f\parallel\nabla g$ 在这张图里一目了然。

{{< details summary="梯度对齐视角：在最优点与非最优点代入 ∇f、∇g" >}}

两个梯度的形状全程不变：

$$
\nabla f=(1,1),\qquad \nabla g=(2x,2y).
$$

**最优点 $T=\left(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2}\right)$（图中相切点）：**

$$
\nabla f=(1,1),\qquad
\nabla g=(\sqrt2,\sqrt2)=\sqrt2\,(1,1).
$$

两者平行，$\nabla f=\tfrac{1}{\sqrt2}\,\nabla g$。圆在该点的切向 $t=\tfrac{1}{\sqrt2}(1,-1)$ 满足

$$
\nabla f\cdot t=\tfrac{1}{\sqrt2}(1-1)=0,
$$

即沿小路 $f$ 一阶不变——正是驻点。

**非最优点 $P=(0,-1)$（图中圆的底部）：**

$$
\nabla f=(1,1),\qquad \nabla g=(0,-2).
$$

二者不成比例，不平行。底部切向 $t=(1,0)$，

$$
\nabla f\cdot t=(1,1)\cdot(1,0)=1\neq 0,
$$

即往 $+x$ 走 $f$ 还在涨——没到顶。

**参数化交叉验证（把「沿小路走」写成一元函数）：** 令 $x=\cos\theta,\ y=\sin\theta$，

$$
f(\theta)=\cos\theta+\sin\theta=\sqrt2\,\sin\!\left(\theta+\tfrac{\pi}{4}\right),
\qquad
\frac{df}{d\theta}=\sqrt2\,\cos\!\left(\theta+\tfrac{\pi}{4}\right).
$$

$\dfrac{df}{d\theta}=0$ 当且仅当 $\theta=\tfrac{\pi}{4}$（$T$，极大）或 $\theta=\tfrac{5\pi}{4}$（极小）；底部 $\theta=-\tfrac{\pi}{2}$ 处 $\dfrac{df}{d\theta}=1\neq0$，与上面 $\nabla f\cdot t=1$ 对上。这个 $\dfrac{df}{d\theta}$ 其实就是 $\nabla f\cdot(\text{切向})$，两种算法是同一回事。

**符号小注：** 比值 $\mu=\tfrac{1}{\sqrt2}>0$ 是裸的对齐比例；按本篇 $L=f+\lambda g$ 的约定，则 $\lambda=-\mu=-\tfrac{1}{\sqrt2}$，正是上面驻点系统解出的那个 $\lambda$。几何一致，正负号只是约定差别。

{{< /details >}}

---

## 8. 通向变分：欧拉–拉格朗日算子

到这里，有限维的故事讲完了。最后把它推到无穷维——这正是「优化与变分」里的**变分**。

把自变量从向量 $x\in\mathbb{R}^n$ 换成一整条函数 $y(\cdot)$，把目标从函数 $f$ 换成**泛函**

$$
J[y]=\int_a^b L\big(x,\,y(x),\,y'(x)\big)\,dx,
$$

这里的 $L$ 仍叫拉格朗日函数（这个名字的复用不是巧合）。我们要找的，是让 $J$ 取驻值的那条函数 $y$。

仿照有限维「梯度为零」，对泛函取**第一变分** $\delta J=0$，经过分部积分后得到的驻点条件是

$$
\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}=0.
$$

左边这个作用在 $L$ 上、输出一个关于 $y$ 的微分方程的对象，就是**欧拉–拉格朗日算子**。把它和第 5 节的拉格朗日算子并排看：

$$
\underbrace{\nabla_{(x,\lambda)}L=0}_{\text{有限维：代数方程组}}
\qquad\Longleftrightarrow\qquad
\underbrace{\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}=0}_{\text{无穷维：微分方程}}.
$$

它们是**同一件事在不同维度上的样子**：都是「对拉格朗日函数求驻点」。区别只在于，有限维里「求导」是普通梯度、零点是代数方程组；无穷维里「求导」是变分、零点是一条微分方程。变分法的所有后续内容（测地线、最速降线、带约束变分与等周问题），都建立在这个算子之上。

> **旁注：为什么物理里也有个「拉格朗日函数」。** 物理里最有名的拉格朗日函数就是 $L=T-V$（动能减势能）。最小作用量原理说，真实轨迹让作用量 $S=\int L\,dt$ 取驻值；对 $S$ 做变分、套上面的欧拉–拉格朗日算子，直接得出运动方程——这正是分析力学不必逐个分解受力的来由（能量是标量，不分方向）。两处 $L$ 的地位并不完全对称：优化里是 $L$ **本身**取驻点，变分/物理里是积分 $\int L$ 取驻值、$L$ 只是被积函数。共同点仅在于——都叫拉格朗日函数，都是「让某个标量取驻值」这台机器的核心对象。这篇不展开物理，单独的最小作用量/分析力学留作另一篇。

---

## 总结

这一篇作为「优化与变分」的开篇：

1. 无约束最优 $\Longrightarrow \nabla f=0$；约束把这句话打破，逼出新工具；
2. 等式约束下，最优点处 $\nabla f$ 必须垂直于约束曲面，即与 $\nabla g$ 平行；
3. 平行关系引入拉格朗日乘子 $\lambda$，写成 $\nabla f=-\lambda\nabla g$；
4. 拉格朗日函数 $L=f+\lambda g$ 把约束吸收进目标，最优性条件 $=$ $L$ 的驻点条件；
5. 把「构造 $L$ 并求驻点」打包成拉格朗日算子 $\mathcal{L}=\nabla_{(x,\lambda)}L$，优化变成求 $\mathcal{L}=0$ 的根；
6. 多约束改成 $\lambda^\top g$，不等式约束升级为 KKT（互补松弛）；
7. 把向量换成函数、把 $f$ 换成泛函 $J$，同一个算子就成了欧拉–拉格朗日算子——这是通往变分法的门。

[上一篇：优化与变分 Part 3——Newton、阻尼与拟 Newton](/notes/math/optimization-variation/note-opt-3-newton-quasi-newton/)

[返回：优化与变分 Part 0——从局部几何到约束与变分](/notes/math/optimization-variation/note-opt-0-roadmap/)
