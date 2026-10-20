---
date: '2026-10-20T12:00:00+09:00'
draft: false
title: '泊松方程阶段总结：从一次 Jacobi sweep 到 NumPy 与 CUDA'
summary: 'M1–M5 结束后，从一个 Jacobi 单轮更新重新出发，自己补全源项、残差停止、NumPy 向量化和 CUDA kernel，并用已知解、跨实现对照与同步计时检查整条计算链。'
description: '泊松方程主线后的自主重写总结：从 Python 循环版到 NumPy 和 CuPy RawKernel，记录数值验证、残差舍入下限、GPU 检查频率与异步计时带来的认识。'
tags: ["PDE", "Numerical Methods", "Iterative Methods", "GPU Computing"]
categories: ["Notes"]
series: ["Poisson Equation"]
note_kind: "research"
weight: 8
---

> 这篇文章记录[泊松方程学习主线](/notes/systems/poisson-equation/) M1–M5 结束后的一轮自主重写。[上一篇](/notes/systems/poisson-equation/validation-error-and-cost/)已经从误差分解和计算成本的角度检查了完整程序；这一次则从一个 Jacobi 单轮更新重新出发，逐步写到残差停止、NumPy 向量化和 CUDA。四个练习文件中的核心算法、两个 CUDA kernel 本体、停止循环和 `time_gpu` 由我编写；kernel 启动、双缓冲、`cp.max` 归约封装、自动比对、检查与计时框架由助手提供。本文记录到学习仓库的本地提交 `ed45c02` 为止。它不是新的 M 阶段，也没有单独标签。

# 重写的目的

M1–M5 已经走过一条完整路线：

$$
\text{变分与弱形式}
\longrightarrow
\text{差分与离散能量}
\longrightarrow
\text{Jacobi 的 CPU/CUDA 实现}
\longrightarrow
\text{误差与成本验证}.
$$

但“跟着推导做完”与“能从空白处重新搭起来”仍是两件不同的事。作为学习项目，重写一次有助于加深流程理解和印象。

这一轮的目的是检验：

1. 能否把离散公式重新落到索引、坐标和代码上；
2. 能否自己补出从固定轮数到残差停止的控制逻辑；
3. 能否把同一个算法依次改写成 Python 循环、NumPy 向量化和 CUDA kernel；
4. 能否用独立参考和正确计时判断“结果相同”与“运行更快”。

# 从一次 Jacobi sweep 重新开始

重写使用单位正方形上的问题

$$
-\Delta u
=2\pi^2\sin(\pi x)\sin(\pi y),
\qquad
u|_{\partial\Omega}=0,
$$

它的连续精确解为

$$
u(x,y)=\sin(\pi x)\sin(\pi y).
$$

令每个方向有 $N$ 个小区间，$h=1/N$。五点格式对应的 Jacobi 更新是

$$
U_{i,j}^{(k+1)}
=\frac14\left(
U_{i-1,j}^{(k)}+U_{i+1,j}^{(k)}
+U_{i,j-1}^{(k)}+U_{i,j+1}^{(k)}
+h^2f(x_i,y_j)
\right).
$$

这次重写的第一个关口看起来很小，却包含了几个容易混在一起的问题：

- 源项进入更新式时要乘 $h^2$；
- 数组下标 $i,j$ 要先变成坐标 $x_i=ih$、$y_j=jh$，再送入 $f(x,y)$；
- 一轮 Jacobi 必须只读取旧数组，把结果写入另一份数组，不能在同一轮中交错使用新旧值；
- 边界不更新，只遍历 $1\le i,j\le N-1$ 的内部节点。

对应的循环版 sweep 保留了公式与索引之间最直接的映射：

```python
def poisson_jacobi_sweep(A, f, h):
    row, col = A.shape
    A_new = A.copy()

    for i in range(1, row - 1):
        for j in range(1, col - 1):
            x = i * h
            y = j * h
            A_new[i, j] = 0.25 * (
                A[i - 1, j] + A[i + 1, j]
                + A[i, j - 1] + A[i, j + 1]
                + h**2 * f(x, y)
            )

    return A_new
```

从这一步出发，程序先扩展到固定 $K$ 轮，再加入相对连续精确解的最大节点误差。网格规模也不再写死，而是统一由 $N$ 决定。至此，一个单步公式才真正变成可以加密网格、比较误差的求解过程。

# 从固定轮数到残差停止

固定轮数回答的是“迭代了多少步”，却不直接回答“当前数组是否已经满足离散方程”。因此下一步加入离散残差（即 M3 的 $r^{(k)}=\mathbf F-L_hU^{(k)}$，这里省略轮数上标）

$$
r_{i,j}
=f_{i,j}
-\frac{
4U_{i,j}-U_{i-1,j}-U_{i+1,j}-U_{i,j-1}-U_{i,j+1}
}{h^2},
$$

并用

$$
\|r\|_\infty\lt\tau
$$

作为停止条件，代码中的容差参数是 `tol`。循环还必须有 `max_iter` 保护，以免条件写错或容差不可达时无限运行。

最终采用的语义是“先检查当前数组的残差，再决定是否执行下一轮 sweep”。因此返回的 $K$ 就是已经执行的更新次数；若初值已经满足容差，可以返回 $K=0$。这个顺序也让循环版、向量化版和 GPU 版能够使用同一套停止含义。

```python
def iterate_until(A, f, h, tol, max_iter):
    A = A.copy()
    K = 0

    while True:
        if max_residual(A, f, h) < tol:
            break

        if K >= max_iter:
            break

        A = poisson_jacobi_sweep(A, f, h)
        K += 1

    return A, K
```

这里先判断残差，再判断上限，最后才执行更新。把其中任何一步换位置，都可能改变 $K=0$、恰好在 `max_iter` 达标以及未收敛提示的含义。

对于零初值和当前的 $(1,1)$ 正弦模态，Jacobi 每轮把误差幅度乘以

$$
g_{1,1}=\cos\frac{\pi}{N}.
$$

初始最大残差为 $2\pi^2$（$N$ 为偶数时在中心节点取到），此后残差同样每轮乘以 $g_{1,1}$，所以达到容差所需的轮数可由

$$
K_{\mathrm{pred}}
=\left\lceil
\frac{\ln\bigl(\tau/(2\pi^2)\bigr)}
{\ln\cos(\pi/N)}
\right\rceil
$$

预测。取 $\tau=10^{-8}$，$N=4$ 到 $64$ 时程序与公式给出的停止轮数一致：

| $N$ | 实测 $K$ | 最大节点误差 | 相邻粗/细误差比 |
|---:|---:|---:|---:|
| 4 | 62 | $5.302929\times10^{-2}$ | — |
| 8 | 271 | $1.295075\times10^{-2}$ | $4.0947$ |
| 16 | 1104 | $3.218964\times10^{-3}$ | $4.0233$ |
| 32 | 4435 | $8.035772\times10^{-4}$ | $4.0058$ |
| 64 | 17759 | $2.008213\times10^{-4}$ | $4.0015$ |

停止轮数核对了迭代逻辑，误差比则重新出现了五点格式的二阶趋势。两类证据回答不同问题：前者说明程序按预期收敛到离散解附近，后者说明离散解随网格加密逼近连续解。

# 误差并不一定随迭代单调下降

重写过程中还观察到一个容易被“迭代越多越准”掩盖的现象：总误差可能先下降，再回升到稳定值。

在 $N=8$ 时，相对连续解的最大误差在 $K=55$ 附近降到约

$$
6.4\times10^{-5},
$$

继续迭代后却回升，并最终稳定在约

$$
1.295\times10^{-2}.
$$

这并不表示 Jacobi 开始发散。零初值下，迭代值从下方向离散解靠近；而五点离散解的幅度略高于连续解。迭代轨迹会先经过连续解附近，再继续走向真正的离散解。因此：

$$
\boxed{
\text{迭代误差持续减小}
\quad\not\Rightarrow\quad
\text{相对连续解的总误差持续减小}.
}
$$

这个小实验把 M5 的误差分解变成了可以直接看见的动态过程：迭代误差和离散误差方向相反时会发生抵消，抵消最强的位置不等于离散方程已经收敛。

# NumPy 向量化：表达方式变了，算法没有变

循环版确认正确后，下一步用 NumPy 同时更新所有内部节点。向量化 sweep 与残差共用同一组中心和邻点切片：

```python
def slice_grid(u):
    center = u[1:-1, 1:-1]
    up     = u[:-2,  1:-1]
    down   = u[2:,   1:-1]
    left   = u[1:-1, :-2]
    right  = u[1:-1, 2:]
    return center, up, down, left, right


def sweep_vec(A, F, h):
    A_new = A.copy()
    up    = A[:-2,  1:-1]
    down  = A[2:,   1:-1]
    left  = A[1:-1, :-2]
    right = A[1:-1, 2:]
    A_new[1:-1, 1:-1] = 0.25 * (
        up + down + left + right + h**2 * F[1:-1, 1:-1]
    )
    return A_new


def residual_vec(A, F, h):
    center, up, down, left, right = slice_grid(A)
    laplacian = (4 * center - up - down - left - right) / h**2
    res = F[1:-1, 1:-1] - laplacian
    return np.max(np.abs(res))
```

源项网格则用 `meshgrid(indexing="ij")` 一次生成。这里的 `indexing="ij"` 很重要：第一个数组维度继续对应 $i$ 和 $x$，第二个维度对应 $j$ 和 $y$，不会在向量化时悄悄交换坐标含义。

向量化没有改变 Jacobi 的数学规则。右侧仍全部读取旧数组 `A`，结果写入 `A_new` 的内部切片；残差也使用相同的中心与四邻点切片。验证结果是：

- 标准正弦问题中，向量化 sweep 与循环 sweep 逐元素完全相同；
- 随机非对称数组、随机源项和非零边界下，两者差值仍为零；
- 输入数组没有被修改，边界保持不变；
- 两种实现的残差停止轮数与最终误差一致。

随机非对称输入是必要补充。只用对称正弦解时，某些坐标交换或方向写反的错误可能被对称性掩盖；不对称数据会让这类错误暴露出来。

速度上，本机的向量化版在 $N=32$ 时约比循环版快 100 倍（单次测量）。按“每轮用时 $=a+b\times$ 点数”拟合，得到 $a\approx8\ \mu\mathrm{s}$、$b\approx3\ \mathrm{ns}$/点，$N\le128$ 时与实测一致。

# CUDA：把同一个节点更新交给不同线程

GPU 版本使用 CuPy `RawKernel`。每个线程负责一个内部节点，二维线程索引映射为

$$
\begin{aligned}
j&=\texttt{blockIdx.x}\cdot\texttt{blockDim.x}
  +\texttt{threadIdx.x}+1,\\
i&=\texttt{blockIdx.y}\cdot\texttt{blockDim.y}
  +\texttt{threadIdx.y}+1.
\end{aligned}
$$

加一是因为线程从第一个内部节点开始工作；若 $i\ge N$ 或 $j\ge N$，线程直接返回。节点 $(i,j)$ 在线性内存中的位置是

$$
\mathrm{idx}=i(N+1)+j.
$$

这里沿用 NumPy 版的约定：第一维（行）对应 $x$，内存中连续存放的 $j$ 方向是 $y$，所以相邻线程读写相邻地址。M3、M4 的 C++/CUDA 实现正好相反，行对应 $y$，连续存放的是 $x$ 方向（`index_of(i, j) = j * (N + 1) + i`）。两种约定都成立，前提是源项网格、循环和 kernel 用同一种。

这次自己完成了两个 CUDA kernel：

1. `jacobi_sweep`：读取旧缓冲区的四邻点和源项，向新缓冲区写一个节点；
2. `residual_abs`：每个线程把自己节点的残差绝对值写入独立位置。

第一个 kernel 把循环版的一个内部节点直接交给一个线程：

```c
extern "C" __global__
void jacobi_sweep(const double* A, double* A_new,
                  const double* F, int N, double h2)
{
    int i, j;
    j = blockIdx.x * blockDim.x + threadIdx.x + 1;
    i = blockIdx.y * blockDim.y + threadIdx.y + 1;
    if (i >= N || j >= N) return;

    int idx = i * (N + 1) + j;
    double up    = A[(i - 1) * (N + 1) + j];
    double down  = A[(i + 1) * (N + 1) + j];
    double left  = A[i * (N + 1) + (j - 1)];
    double right = A[i * (N + 1) + (j + 1)];

    A_new[idx] = 0.25 * (
        up + down + left + right + h2 * F[idx]
    );
}
```

残差 kernel 使用相同的映射，但每个线程只写自己的 `R[idx]`：

```c
extern "C" __global__
void residual_abs(const double* A, const double* F,
                  double* R, int N, double h2)
{
    int i, j;
    j = blockIdx.x * blockDim.x + threadIdx.x + 1;
    i = blockIdx.y * blockDim.y + threadIdx.y + 1;
    if (i >= N || j >= N) return;

    int idx = i * (N + 1) + j;
    double center = A[idx];
    double up     = A[(i - 1) * (N + 1) + j];
    double down   = A[(i + 1) * (N + 1) + j];
    double left   = A[i * (N + 1) + (j - 1)];
    double right  = A[i * (N + 1) + (j + 1)];

    R[idx] = fabs(
        F[idx] - (4 * center - up - down - left - right) / h2
    );
}
```

第二个 kernel 没有让多个线程竞争同一个最大值。各线程先写自己的格子（`R` 预先置零，边界位置不写入，不影响最大值），再由胶水层调用 `cp.max` 在 GPU 上归约。这种分工避免了多个线程对同一地址执行“读—改—写”造成的更新丢失。

GPU 停止循环同样由两份解缓冲区和一份残差缓冲区组成。每轮先检查残差，未达标时启动 sweep kernel，然后交换两份解缓冲区。它与 CPU 版共享同一套 $K$ 的定义和 `max_iter` 语义。

# 三个版本怎样证明是在做同一件事？

验证没有只看一张光滑结果图，而是逐层改变输入：

- 小网格单轮更新，与 NumPy 参考逐元素比较；
- $N$ 不是 block 尺寸整数倍的网格，检查越界守卫；
- 非方形 block，防止两个方向误用同一个 `blockDim`；
- 随机非对称数据与非零边界，检查索引、方向和边界保持；
- 多轮迭代，核对已知的停止轮数与连续解误差；
- 平滑输入和随机输入上的残差，与 NumPy 残差比较；
- 无法收敛时，核对 `max_iter` 和提示行为。

我在 Colab 的 Tesla T4、CuPy 14.0.1 环境中运行并取回了前 16 项检查输出，全部通过。GPU sweep 与 NumPy 的最大差不超过

$$
8.7\times10^{-19},
$$

残差值、停止轮数和误差表也一致。这个差值只出现在 $N=13$：$N=8$ 时 $h^2=1/64$ 是 2 的幂，$h^2F$ 这一步乘法没有舍入，乘加是否合并成 FMA 结果都相同；$N=13$ 时这一步有舍入，合并与否才可能差一个末位。这只是候选解释，尚未验证（见文末边界）。本机没有 CUDA，助手另用 `g++` 模拟同一份 CUDA C 核心，检查了控制流程和索引逻辑。

最后加入“每 $m$ 轮才查一次残差”后，扩展检查在本机模拟中通过；真实 T4 上取回了对应计时输出和正确的停止轮数，但新增后的完整 23 项检查输出尚未取回。因此这里保留两层不同的证据强度，不把模拟检查写成真实 GPU 复现。

# 残差也有浮点下限

离散残差包含除以 $h^2$ 的运算。解接近稳定后，节点值上的双精度舍入会被大约 $1/h^2$ 放大，因此残差不可能无限下降。

实测下限为：

| $N$ | 残差下限 |
|---:|---:|
| 8 | $4.6\times10^{-14}$ |
| 16 | $2.1\times10^{-13}$ |
| 32 | $8.1\times10^{-13}$ |
| 64 | $3.4\times10^{-12}$ |

把这些数乘回 $h^2$ 后都约为 $8\times10^{-16}$，与双精度舍入量级一致。这说明停止容差不能只按“想要多少位小数”随意设定：网格越细，同样的浮点扰动在残差中会被放得越大。若容差低于当前网格和精度允许的下限，`max_iter` 保护就不再只是防御性写法，而会真正决定程序能否退出。

即使容差还在下限之上，舍入也会影响停止轮数，$N=128$ 就是一例。按前面的公式，它应在第 71054 轮达标，程序实际停在第 71062 轮，CPU 与 GPU 相同（见下一节计时表）。把达标前后的残差拆开看：

- 精确算术迭代的残差 $2\pi^2g_{1,1}^K$ 在第 71054 轮已经低于 $10^{-8}$；
- 浮点迭代值累积的舍入让残差多出约 $1$–$2\times10^{-11}$，精确计算这个浮点数组的残差，要到第 71061 轮才达标；
- 程序计算残差时的舍入再带来几个 $10^{-12}$ 的波动，最终在第 71062 轮达标。

这点偏差只占容差的 0.2%，但接近达标时残差每轮的相对下降率只有 $1-\cos(\pi/128)\approx3.0\times10^{-4}$，于是越过容差推迟了 8 轮。$N=64$ 时偏差不超过约 $4\times10^{-12}$，每轮相对下降率约为 $1.2\times10^{-3}$，取整后的轮数没有变化。

# 为什么每轮检查残差会让 GPU 变慢？

第一次 GPU 实现每轮都检查残差。一次检查包含残差 kernel、`cp.max` 归约，以及把单个最大值取回主机。最后一步要求 CPU 等待 GPU，于是每轮迭代都多了一次同步点。

在同一 Colab 会话中（Tesla T4、CuPy 14.0.1、NumPy 2.1.3，系统暴露 2 个 CPU 线程），每项预热一次、正式运行三次取中位数，得到：

| $N$ | $K$ | NumPy 残差停止 | GPU 每轮检查 | GPU 固定 $K$、不查残差 |
|---:|---:|---:|---:|---:|
| 16 | 1104 | $0.041\ \mathrm{s}$ | $0.080\ \mathrm{s}$ | $0.009\ \mathrm{s}$ |
| 32 | 4435 | $0.257\ \mathrm{s}$ | $0.307\ \mathrm{s}$ | $0.031\ \mathrm{s}$ |
| 64 | 17759 | $1.883\ \mathrm{s}$ | $1.486\ \mathrm{s}$ | $0.129\ \mathrm{s}$ |
| 128 | 71062 | $18.255\ \mathrm{s}$ | $5.365\ \mathrm{s}$ | $0.521\ \mathrm{s}$ |

在这组实现和机器上，NumPy 与“每轮检查残差”的 GPU 交点位于 $N=32$ 与 $64$ 之间。GPU 固定轮数版本每轮约 $7$–$8.5\ \mu\mathrm{s}$，而每轮查残差后约为 $69$–$84\ \mu\mathrm{s}$。也就是说，小网格下占主导的不是五点更新本身，而是 kernel 发射、归约与同步造成的固定成本。

因此又把停止规则改为每 $m$ 轮检查一次残差。若真正的首次达标轮数为 $K_*$，返回轮数会向上取整到检查点：

$$
K=m\left\lceil\frac{K_*}{m}\right\rceil,
$$

除非 `max_iter` 更早截断。循环中只在 $K$ 是 $m$ 的倍数时调用 GPU 残差归约：

```python
K = 0
while True:
    if K % m == 0:
        res = residual_gpu(A_d, F_d, R_d, N, h, block)
        if res < tol:
            break

    if K >= max_iter:
        break

    launch_sweep(A_d, A_new_d, F_d, N, h, block)
    A_d, A_new_d = A_new_d, A_d
    K += 1

if K == max_iter:
    res = residual_gpu(A_d, F_d, R_d, N, h, block)
    if res >= tol:
        print("未收敛")
```

循环结束后重新检查 `max_iter` 对应数组的残差，是为了避免用上一个检查点留下的旧 `res` 判断是否收敛。T4 上的结果如下，来自同一会话中的另一次运行，同样预热一次、取三次中位数：

| $N$ | $m$ | 返回 $K$ | 总用时 | 每轮用时 |
|---:|---:|---:|---:|---:|
| 64 | 1 | 17759 | $1.545\ \mathrm{s}$ | $87.0\ \mu\mathrm{s}$ |
| 64 | 10 | 17760 | $0.282\ \mathrm{s}$ | $15.9\ \mu\mathrm{s}$ |
| 64 | 100 | 17800 | $0.160\ \mathrm{s}$ | $9.0\ \mu\mathrm{s}$ |
| 64 | 1000 | 18000 | $0.154\ \mathrm{s}$ | $8.5\ \mu\mathrm{s}$ |
| 128 | 1 | 71062 | $6.039\ \mathrm{s}$ | $85.0\ \mu\mathrm{s}$ |
| 128 | 10 | 71070 | $1.088\ \mathrm{s}$ | $15.3\ \mu\mathrm{s}$ |
| 128 | 100 | 71100 | $0.603\ \mathrm{s}$ | $8.5\ \mu\mathrm{s}$ |
| 128 | 1000 | 72000 | $0.569\ \mathrm{s}$ | $7.9\ \mu\mathrm{s}$ |

其中 $m=1$ 与上一张表的“GPU 每轮检查”是同一配置，两次运行的用时相差约 4%（$N=64$）和 13%（$N=128$），可以当作单次会话内计时波动的参考。

$m$ 越大，同步检查越少，但可能在已经达标后继续多跑若干轮。这里的 $m=100$ 已把每轮成本压到接近固定 $K$ 的水平，同时只多执行少量迭代。这个数不是通用最优值；选择 $m$ 时，需要同时考虑检查成本和 $m$ 相对 $K_*$ 的大小。

# GPU 计时为什么前后都要同步？

CUDA kernel 发射是异步的。Python 调用返回时，GPU 可能仍在执行队列中的工作。如果直接用

```python
t0 = time.perf_counter()
fn()
t1 = time.perf_counter()
```

测量，得到的可能主要是“把任务送入队列”的时间。

这次计时函数在计时前和计时后都执行设备同步：

```python
def time_gpu(fn):
    cp.cuda.Device().synchronize()
    t0 = time.perf_counter()
    fn()
    cp.cuda.Device().synchronize()
    return time.perf_counter() - t0
```

前一次同步清空预热或上一项测试遗留的工作，后一次同步等待本次工作真正结束。异步演示连续发射 $200$ 次 $N=2048$ 的 kernel：

- 不等待 GPU 时只测得 $1.46\ \mathrm{ms}$；
- 等待全部工作完成后为 $87.98\ \mathrm{ms}$。

两者相差约 60 倍。前一个数字不是 GPU 完成计算的时间，而是 CPU 提交任务的时间；平均到每次发射约 $7.3\ \mu\mathrm{s}$，与前面固定 $K$ 版本每轮约 $7$–$8.5\ \mu\mathrm{s}$ 相当。也就是说，小网格时每轮成本大体就是提交一次 kernel 的开销。这个差别也解释了为什么 GPU 性能实验必须先写清计时边界，而不能只在函数两侧随手放两个时钟。

# 总结

四个文件串起了一条逐步扩展的路线：

| 层次 | 自己完成的核心 | 用来确认它的证据 |
|---|---|---|
| Python 循环 | 含源项的 sweep、固定轮数、误差、残差与停止循环 | 已知正弦解、预测停止轮数、网格加密误差比 |
| NumPy | 邻点切片、源项网格、向量化 sweep 与残差停止 | 与循环版逐元素比较，随机非对称输入与边界检查 |
| CUDA | sweep kernel、残差 kernel、GPU 停止循环与每 $m$ 轮检查 | T4 输出、NumPy 参考、本机 CUDA C 模拟 |
| 计时 | 前后同步的 `time_gpu` | 异步/同步对照、同进程预热后中位数 |

这次重写并不是“完全没有提示地独立完成”。源项量纲、索引到坐标、线程映射的偏移、迭代计数和残差更新位置等问题，都经过了小题、反馈和更正。更准确的总结是：助手搭建检查边界和胶水，我完成核心算法，再让每一层接受独立参考的检验。

相较于主线阶段，变化在于实现的控制权已经转移：不是阅读一份完成的求解器，而是从单轮更新开始，自己决定下一个缺失部件是什么，写出它，再根据失败的检查修正。

# 当前边界

这轮结果仍有清楚的适用范围：

- 新增“每 $m$ 轮检查”后的完整 23 项检查尚未在真实 GPU 上取回输出；
- $N=13$ 时约 $8.7\times10^{-19}$ 的 CPU/GPU 差异可能与 FMA 有关，但没有用 `--fmad=false` 验证；
- NumPy 在 $N\ge256$ 时每点成本上升，超出前面线性模型的范围，缓存只是候选解释，没有测量硬件计数器；
- 所有 GPU 时间来自一次 Colab T4 会话，每项只有三次正式样本；
- 当前残差归约使用 `cp.max`，没有手写归约 kernel，也没有用 CUDA Graph 或单次 kernel 内多轮迭代降低发射成本；
- 这轮没有重写 C++ CPU 版，也不把 Fortran 列入当前学习计划。

因此可以确认的是：这套 Python、NumPy 和 CUDA 实现在已测试条件下数值一致；停止轮数在 $N\le64$ 时与理论预测逐轮一致，$N=128$ 晚 8 轮可以由残差中的舍入解释；性能数据揭示了残差检查和异步计时的实际影响。它还不是一份经过系统优化或跨平台验证的通用 Poisson 求解器。

# 收束

M1–M5 建立了从连续方程到计算验证的完整知识链；这轮重写则从相反方向检查这条链是否已经能够被重新构造：

$$
\boxed{
\begin{aligned}
&\text{一次正确的节点更新}
\longrightarrow
\text{多轮迭代与残差停止}\\
&\longrightarrow
\text{NumPy 整体表达}
\longrightarrow
\text{CUDA 线程与双缓冲}\\
&\longrightarrow
\text{跨实现数值对照}
\longrightarrow
\text{带同步边界的性能测量}.
\end{aligned}
}
$$

最后留下的认识不是“GPU 一定更快”，而是更具体的三件事：正确性要靠参考对象逐层确认；停止条件本身有浮点下限和检查成本；GPU 时间只有在同步边界明确以后才有可比意义。
