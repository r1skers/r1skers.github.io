---
date: '2026-06-26T10:00:00+09:00'
draft: false
title: '问题集 · 实分析'
summary: "实分析笔记的配套练习——从 Part 1-2 的数列与完备性起步，每题单工具，参考解答顶部先给一句话骨架（该调用哪个动词），再展开细节。"
description: "实分析配套习题集：Cesàro 平均、快速 Cauchy、limsup 存在、子列极限唯一等，按 Part 分小节，附骨架式参考解答。"
tags: ["Problems", "Exercises", "Real Analysis"]
categories: ["Crucible"]
problemPage: true
---

# 问题集 · 实分析

配套 [实分析系列笔记](/notes/) 的练习。每题**单工具**；参考解答顶部先给一句话**骨架**（该调用哪个动词），再展开细节。**建议先自己动手几分钟，再展开对照。**

{{< problem-map kind="real-analysis" >}}

---

{{% problem-section title="Part 1–2：数列与完备性" %}}

配套 [实分析 Part 1](/notes/math/real-analysis/note-ra-1-convergence-cauchy/) 与 [Part 2](/notes/math/real-analysis/note-ra-2-supremum-completeness/)。

{{% problem-exercise title="Cesàro 平均：前 n 项平均收敛到同一极限" %}}

设 $a_n \to a$。证明

$$
\frac{a_1+a_2+\cdots+a_n}{n}\to a.
$$

*参考：[实分析 Part 1 · 收敛列有界](/notes/math/real-analysis/note-ra-1-convergence-cauchy/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**骨架**：尾部控制 + 有限项兜底（Part 1 §6 那个套路的搬运）。

化简：令 $b_n=a_n-a$，则 $b_n\to 0$，只需证 $\frac1n\sum_{k=1}^n b_k\to 0$。

任取 $\varepsilon>0$。由 $b_n\to 0$，存在 $N$ 使 $n>N$ 时 $|b_n|<\varepsilon/2$。把和拆成**前 $N$ 项**与**其后**：

$$
\left|\frac1n\sum_{k=1}^n b_k\right|
\le \underbrace{\frac1n\sum_{k=1}^N |b_k|}_{\text{有限项兜底}}
+\underbrace{\frac1n\sum_{k=N+1}^n |b_k|}_{\text{尾部控制}}.
$$

**尾部**：共 $n-N$ 项、每项 $<\varepsilon/2$，故 $<\frac{n-N}{n}\cdot\frac\varepsilon2<\frac\varepsilon2$。

**头部**：$C:=\sum_{k=1}^N|b_k|$ 是**固定常数**（$N$ 已定），故 $\frac Cn\to 0$；取 $n>2C/\varepsilon$ 即 $<\varepsilon/2$。

于是 $n>\max(N,\,2C/\varepsilon)$ 时两段合计 $<\varepsilon$。$\blacksquare$

**关键**：头部是"固定的有限和 $\div\ n\to\infty$"，自然归零；尾部靠收敛压住。这正是 Part 1「收敛控制尾巴、有限项单独兜住」的同一根血脉——**换个题面，同一个动词**。

{{< /details >}}

{{% problem-exercise title="快速 Cauchy：相邻差被几何级数控制" %}}

设数列 $(a_n)$ 满足 $|a_{n+1}-a_n|\le \dfrac{1}{2^n}$ 对所有 $n$。证明 $(a_n)$ 收敛。

*参考：[实分析 Part 1 · 柯西列](/notes/math/real-analysis/note-ra-1-convergence-cauchy/) · [Part 2 · Cauchy 完备性](/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**骨架**：不知道极限是谁 → 别证收敛，证 **Cauchy 列** → 完备性兜底。

对 $m>n$，用三角不等式把大跨度差拆成一串相邻差：

$$
|a_m-a_n|\le\sum_{k=n}^{m-1}|a_{k+1}-a_k|\le\sum_{k=n}^{m-1}\frac1{2^k}
<\sum_{k=n}^{\infty}\frac1{2^k}=\frac{1}{2^{n-1}}.
$$

任取 $\varepsilon>0$，取 $N$ 使 $2^{1-N}<\varepsilon$；则 $m>n\ge N$ 时 $|a_m-a_n|<2^{1-n}\le 2^{1-N}<\varepsilon$。故 $(a_n)$ 是 Cauchy 列。

由 $\mathbb R$ 的**完备性**（Part 2 §8），Cauchy $\Rightarrow$ 收敛。$\blacksquare$

**关键**：「不知极限是谁却要证收敛」是 Cauchy 判据的招牌触发条件。相邻差可求和（几何级数）$\Rightarrow$ 跨度差可控 $\Rightarrow$ Cauchy。把 $1/2^n$ 换成任何满足 $\sum c_n<\infty$ 的 $c_n$ 都成立。

{{< /details >}}

{{% problem-exercise title="limsup 存在：上确界列必收敛" %}}

设 $(a_n)$ 有界，定义 $b_n=\sup\{a_n,a_{n+1},a_{n+2},\dots\}=\sup_{k\ge n}a_k$。证明 $(b_n)$ 收敛。（其极限即 $\limsup_n a_n$。）

*参考：[实分析 Part 2 · 单调收敛定理](/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**骨架**：凑齐「单调 + 有界」→ MCT。

**有界**：$(a_n)$ 有界，设 $|a_k|\le M$。每个 $b_n$ 是有界集的 sup，故 $b_n\in\mathbb R$ 且 $|b_n|\le M$——$(b_n)$ 有界。

**单调**：$b_{n+1}=\sup_{k\ge n+1}a_k$ 是在**更小的集合**上取 sup（比 $b_n$ 少了 $a_n$ 这一项）。子集的 sup $\le$ 母集的 sup，故

$$
b_{n+1}\le b_n\quad\forall n,
$$

即 $(b_n)$ **单调递减**。

递减 + 有下界 $\Rightarrow$ 由 MCT（对称版本，Part 2 §3）收敛。这个极限就是 $\limsup_n a_n$。$\blacksquare$

**关键**：sup 列的单调性不靠 $a_n$ 本身单调，而靠「取 sup 的集合逐个缩小」。这是 $\limsup/\liminf$ 存在性的根——任意有界数列都有 $\limsup$，哪怕它自己乱跳。

{{< /details >}}

{{% problem-exercise title="子列极限唯一 ⇒ 整列收敛" %}}

设 $(a_n)$ 有界，且它的**每个收敛子列都收敛到同一极限 $L$**。证明 $a_n\to L$。

*参考：[实分析 Part 2 · Bolzano–Weierstrass](/notes/math/real-analysis/note-ra-2-supremum-completeness/)*

{{% /problem-exercise %}}

{{< details summary="参考解答" >}}

**骨架**：反证 + 对「赖着不走」的子列用 B–W 榨出矛盾。

反证：设 $a_n\not\to L$。则存在 $\varepsilon_0>0$，使得无论 $N$ 多大都有 $n>N$ 满足 $|a_n-L|\ge\varepsilon_0$。逐个取出这些下标，得子列 $(a_{n_j})$ 满足

$$
|a_{n_j}-L|\ge\varepsilon_0\quad\forall j.
$$

$(a_{n_j})$ 是有界列（原列有界），由 **B–W**（Part 2 §7）存在收敛子-子列 $a_{n_{j_i}}\to L'$。

它同时是**原列的收敛子列**，由题设 $L'=L$。但取极限于 $|a_{n_{j_i}}-L|\ge\varepsilon_0$ 得 $|L'-L|\ge\varepsilon_0>0$，即 $L'\ne L$。矛盾。

故 $a_n\to L$。$\blacksquare$

**关键**：「否定收敛」= 抓出一条离 $L$ 至少 $\varepsilon_0$ 的子列。有界给了 B–W 的入场券，B–W 逼出的收敛子列撞上题设，矛盾。**有界不可省**——无界时（如 $a_n=n$）没有收敛子列，题设空成立而结论假。

{{< /details >}}

{{% /problem-section %}}
