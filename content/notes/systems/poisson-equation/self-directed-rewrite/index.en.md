---
date: '2026-10-20T12:00:00+09:00'
draft: false
title: 'Poisson Equation Stage Summary: From One Jacobi Sweep to NumPy and CUDA'
summary: 'After M1–M5, start again from one Jacobi update, rebuild the source term, residual stopping, NumPy vectorization, and CUDA kernels, then check the whole computational chain with a known solution, cross-implementation comparisons, and synchronized timing.'
description: 'A summary of the self-directed rewrite after the Poisson equation learning thread, from Python loops through NumPy to CuPy RawKernel, including numerical validation, the residual rounding floor, GPU check frequency, and asynchronous timing.'
tags: ["PDE", "Numerical Methods", "Iterative Methods", "GPU Computing"]
categories: ["Notes"]
series: ["Poisson Equation"]
note_kind: "research"
weight: 8
---

> This article records a self-directed rewrite after M1–M5 of the [Poisson equation learning thread](/en/notes/systems/poisson-equation/). The [previous article](/en/notes/systems/poisson-equation/validation-error-and-cost/) checked the complete program through error decomposition and computational cost. This time, I started again from a single Jacobi update and worked forward through residual stopping, NumPy vectorization, and CUDA. I wrote the core algorithms in the four exercise files, both CUDA kernel bodies, the stopping loops, and `time_gpu`. The assistant supplied kernel-launch glue, double buffering, the `cp.max` reduction wrapper, automated comparisons, checks, and the surrounding timing framework. This account ends at local commit `ed45c02` in the learning repository. It is not a new M stage and has no separate tag.

# Purpose of the rewrite

M1–M5 already followed a complete path:

$$
\text{variation and weak form}
\longrightarrow
\text{differences and discrete energy}
\longrightarrow
\text{Jacobi on CPU and CUDA}
\longrightarrow
\text{error and cost validation}.
$$

Following a derivation to completion and rebuilding the same process from a blank starting point are still different tasks. In a learning project, rewriting the program helps turn the sequence into something understood and remembered as a whole.

This round asks whether I can:

1. map the discrete formula back to indices, coordinates, and code;
2. reconstruct the control logic from a fixed iteration count to residual stopping;
3. express the same algorithm successively as Python loops, NumPy vectorization, and CUDA kernels;
4. use independent references and correct timing to distinguish “same result” from “faster execution.”

# Start again from one Jacobi sweep

The rewrite uses the unit-square problem

$$
-\Delta u
=2\pi^2\sin(\pi x)\sin(\pi y),
\qquad
u|_{\partial\Omega}=0,
$$

whose exact continuous solution is

$$
u(x,y)=\sin(\pi x)\sin(\pi y).
$$

Let each direction contain $N$ subintervals, with $h=1/N$. The five-point Jacobi update is

$$
U_{i,j}^{(k+1)}
=\frac14\left(
U_{i-1,j}^{(k)}+U_{i+1,j}^{(k)}
+U_{i,j-1}^{(k)}+U_{i,j+1}^{(k)}
+h^2f(x_i,y_j)
\right).
$$

The first step of the rewrite looks small, but it contains several details that are easy to mix together:

- the source term enters the update multiplied by $h^2$;
- array indices $i,j$ must become coordinates $x_i=ih$, $y_j=jh$ before they are passed to $f(x,y)$;
- one Jacobi sweep must read only the old array and write into a separate array, without mixing old and new values during the same sweep;
- boundary nodes stay fixed, so only interior nodes with $1\le i,j\le N-1$ are visited.

The loop version keeps the map between formula and indices explicit:

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

From this point, the program first grows to a fixed $K$ iterations and then adds the maximum nodal error against the exact continuous solution. The grid is parameterized by $N$ instead of being hard-coded. Only then does a one-step formula become a solver that can refine the grid and compare errors.

# From a fixed count to residual stopping

A fixed count answers “how many steps ran,” but it does not directly answer whether the current array satisfies the discrete equation. The next step therefore adds the discrete residual, which is M3's $r^{(k)}=\mathbf F-L_hU^{(k)}$ with the iteration superscript omitted here:

$$
r_{i,j}
=f_{i,j}
-\frac{
4U_{i,j}-U_{i-1,j}-U_{i+1,j}-U_{i,j-1}-U_{i,j+1}
}{h^2}.
$$

The stopping condition is

$$
\|r\|_\infty\lt\tau,
$$

with `tol` as the tolerance parameter in code. The loop also needs a `max_iter` guard, so an incorrect condition or unreachable tolerance cannot run forever.

The final semantics are “check the residual of the current array before deciding whether to perform another sweep.” The returned $K$ is therefore the number of updates actually executed. If the initial state already meets the tolerance, the function may return $K=0$. The loop, vectorized, and GPU versions all use this same meaning.

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

The residual is checked first, the limit second, and the update last. Moving any of these steps can change the meaning of $K=0$, convergence exactly at `max_iter`, and the nonconvergence warning.

For a zero initial state and the current $(1,1)$ sine mode, each Jacobi step multiplies the error amplitude by

$$
g_{1,1}=\cos\frac{\pi}{N}.
$$

For even $N$, the initial maximum residual $2\pi^2$ is attained at the center node. The residual then receives the same factor $g_{1,1}$ on each step, so the required iteration count is predicted by

$$
K_{\mathrm{pred}}
=\left\lceil
\frac{\ln\bigl(\tau/(2\pi^2)\bigr)}
{\ln\cos(\pi/N)}
\right\rceil.
$$

With $\tau=10^{-8}$, the program and formula give the same stopping counts from $N=4$ through $64$:

| $N$ | Measured $K$ | Maximum nodal error | Adjacent coarse/fine error ratio |
|---:|---:|---:|---:|
| 4 | 62 | $5.302929\times10^{-2}$ | — |
| 8 | 271 | $1.295075\times10^{-2}$ | $4.0947$ |
| 16 | 1104 | $3.218964\times10^{-3}$ | $4.0233$ |
| 32 | 4435 | $8.035772\times10^{-4}$ | $4.0058$ |
| 64 | 17759 | $2.008213\times10^{-4}$ | $4.0015$ |

The stopping counts check the iteration logic, while the error ratios recover the second-order trend of the five-point discretization. The two pieces of evidence answer different questions: the former shows that the program approaches the discrete solution as predicted, and the latter shows that grid refinement brings the discrete solution toward the continuous one.

# Error need not decrease monotonically with iteration

The rewrite exposed a fact that is easy to hide behind “more iterations means more accuracy”: total error can decrease first and then rise toward its limiting value.

For $N=8$, the maximum error against the continuous solution reaches a low point near $K=55$ at about

$$
6.4\times10^{-5},
$$

then rises and eventually stabilizes near

$$
1.295\times10^{-2}.
$$

This does not mean Jacobi has begun to diverge. From a zero initial state, the iterates approach the discrete solution from below, while the five-point discrete solution has a slightly larger amplitude than the continuous solution. The trajectory first passes close to the continuous solution, then continues toward the actual discrete solution. Thus

$$
\boxed{
\text{iteration error keeps decreasing}
\quad\not\Rightarrow\quad
\text{total error against the continuous solution keeps decreasing}.
}
$$

This small experiment makes the M5 error decomposition visible as a process. Iteration and discretization errors can cancel when they point in opposite directions, and the point of strongest cancellation is not the point at which the discrete equation has converged.

# NumPy vectorization: a new expression of the same algorithm

After checking the loop version, the next step updates all interior nodes with NumPy. The vectorized sweep and residual use the same center and neighbor slices:

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

The source grid is generated at once with `meshgrid(indexing="ij")`. The `indexing="ij"` choice matters: the first array dimension remains associated with $i$ and $x$, while the second remains associated with $j$ and $y$. Vectorization does not silently exchange the coordinate meanings.

Vectorization does not change the mathematical Jacobi rule. The right-hand side still reads entirely from the old array `A`, the result is written into the interior slice of `A_new`, and the residual uses the same center and four-neighbor geometry. The checks show that:

- the vectorized and loop sweeps are pointwise identical on the standard sine problem;
- their difference remains zero for random asymmetric arrays, random sources, and nonzero boundary values;
- the input array is unchanged and the boundary is preserved;
- both implementations produce the same residual stopping counts and final errors.

Random asymmetric input is an essential supplement. With only a symmetric sine solution, some coordinate swaps or reversed directions can be hidden by symmetry. Asymmetric data expose those errors.

On the local machine, the vectorized version is about 100 times faster than the loop version at $N=32$ in a single measurement. Fitting “time per sweep $=a+b\times$ number of points” gives $a\approx8\ \mu\mathrm{s}$ and $b\approx3\ \mathrm{ns}$/point, consistent with measurements through $N\le128$.

# CUDA: assign one node update to each thread

The GPU version uses CuPy `RawKernel`. Each thread handles one interior node, with the two-dimensional thread indices mapped as

$$
\begin{aligned}
j&=\texttt{blockIdx.x}\cdot\texttt{blockDim.x}
  +\texttt{threadIdx.x}+1,\\
i&=\texttt{blockIdx.y}\cdot\texttt{blockDim.y}
  +\texttt{threadIdx.y}+1.
\end{aligned}
$$

The offset of one starts work at the first interior node. Threads return immediately when $i\ge N$ or $j\ge N$. Node $(i,j)$ is stored at the linear index

$$
\mathrm{idx}=i(N+1)+j.
$$

This rewrite follows the NumPy convention: the first array dimension, or row, represents $x$, while the contiguous $j$ direction represents $y$. Adjacent threads therefore access adjacent addresses. The M3/M4 C++ and CUDA implementation used the opposite convention: a row represented $y$, the contiguous direction was $x$, and `index_of(i, j) = j * (N + 1) + i`. Both conventions are valid as long as the source grid, loops, and kernels use the same one.

I completed two CUDA kernels:

1. `jacobi_sweep` reads the four neighbors and source from the old buffer and writes one node in the new buffer;
2. `residual_abs` writes the absolute residual of one node into its own location.

The first kernel assigns one interior node from the loop version directly to one thread:

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

The residual kernel uses the same mapping, but each thread writes only its own `R[idx]`:

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

The residual kernel does not make multiple threads compete over one maximum. Each thread first writes its own slot. `R` is initialized to zero, so untouched boundary slots do not affect the maximum. The glue layer then calls `cp.max` to reduce the array on the GPU. This design avoids lost updates from multiple threads performing read-modify-write operations on the same address.

The GPU stopping loop likewise uses two solution buffers and one residual buffer. Each iteration checks the residual first; if it has not passed, the loop launches the sweep kernel and swaps the two solution buffers. It shares the same definition of $K$ and the same `max_iter` semantics as the CPU version.

# How do three implementations prove that they do the same thing?

The checks do more than inspect one smooth output plot. They vary the input layer by layer:

- one sweep on a small grid, compared pointwise with the NumPy reference;
- a grid whose $N$ is not a multiple of the block dimensions, to test the bounds guard;
- a nonsquare block, to catch accidental reuse of one `blockDim` in both directions;
- random asymmetric data and nonzero boundary values, to test indices, directions, and boundary preservation;
- many iterations, checked against known stopping counts and continuous-solution errors;
- residuals on smooth and random inputs, compared with the NumPy residual;
- `max_iter` and warning behavior when convergence is impossible within the limit.

I ran the first 16 checks in Colab on a Tesla T4 with CuPy 14.0.1 and retrieved the output. All passed. The largest difference between a GPU sweep and NumPy was at most

$$
8.7\times10^{-19},
$$

and the residual values, stopping counts, and error table also agreed. This difference appeared only at $N=13$. At $N=8$, $h^2=1/64$ is a power of two, so multiplying the represented source by $h^2$ introduces no rounding; this is why fused and unfused multiply-add paths could agree for these data. At $N=13$, the product rounds, making a last-bit difference possible. This remains a candidate explanation and has not been tested, as noted below. The local machine has no CUDA, so the assistant separately used `g++` to simulate the same CUDA C core and check its control flow and index logic.

After adding residual checks every $m$ iterations, the expanded checks passed in the local simulation. On the real T4, I retrieved the corresponding timing output and correct stopping counts, but not the complete output from all 23 checks after the extension. The two evidence levels therefore remain separate: a simulated check is not reported as a real GPU reproduction.

# The residual also has a floating-point floor

The discrete residual divides by $h^2$. Once the solution is near its limiting value, roundoff in the nodal values is amplified by roughly $1/h^2$, so the residual cannot decrease without limit.

The measured floors are:

| $N$ | Residual floor |
|---:|---:|
| 8 | $4.6\times10^{-14}$ |
| 16 | $2.1\times10^{-13}$ |
| 32 | $8.1\times10^{-13}$ |
| 64 | $3.4\times10^{-12}$ |

Multiplying these values back by $h^2$ gives approximately $8\times10^{-16}$ in every case, consistent with the scale of double-precision rounding. A stopping tolerance cannot therefore be chosen solely from a desired number of decimal places. Refining the grid amplifies the same floating-point disturbance in the residual. If the tolerance falls below the floor allowed by the grid and precision, the `max_iter` guard becomes an active part of termination rather than merely defensive code.

Rounding can change the stopping count even while the tolerance remains above that floor. $N=128$ is one example. The formula predicts passage at iteration 71054, while both the CPU and GPU programs stop at 71062. Breaking down the residual near the threshold gives:

- the exact-arithmetic modal residual $2\pi^2g_{1,1}^K$ falls below $10^{-8}$ at iteration 71054;
- accumulated rounding in the floating-point iterate raises its residual by about $1$–$2\times10^{-11}$, so the exact residual of that floating-point array first passes at iteration 71061;
- rounding in the program's residual calculation adds fluctuations of a few $10^{-12}$, delaying the reported pass to iteration 71062.

The offset is only 0.2% of the tolerance. Near the threshold, however, the residual's relative decrease per iteration is only $1-\cos(\pi/128)\approx3.0\times10^{-4}$, so crossing the tolerance is delayed by eight steps. At $N=64$, the offset stays below about $4\times10^{-12}$ and the relative decrease per iteration is about $1.2\times10^{-3}$, leaving the rounded stopping count unchanged.

# Why does checking the residual every iteration slow down the GPU?

The first GPU version checks the residual on every iteration. One check consists of the residual kernel, a `cp.max` reduction, and retrieval of the scalar maximum by the host. The last step makes the CPU wait for the GPU, adding a synchronization point to every iteration.

In one Colab session with a Tesla T4, CuPy 14.0.1, NumPy 2.1.3, and two CPU threads exposed by the system, every item was warmed up once and then measured three times; the table reports the median:

| $N$ | $K$ | NumPy residual stop | GPU check every step | GPU fixed $K$, no residual checks |
|---:|---:|---:|---:|---:|
| 16 | 1104 | $0.041\ \mathrm{s}$ | $0.080\ \mathrm{s}$ | $0.009\ \mathrm{s}$ |
| 32 | 4435 | $0.257\ \mathrm{s}$ | $0.307\ \mathrm{s}$ | $0.031\ \mathrm{s}$ |
| 64 | 17759 | $1.883\ \mathrm{s}$ | $1.486\ \mathrm{s}$ | $0.129\ \mathrm{s}$ |
| 128 | 71062 | $18.255\ \mathrm{s}$ | $5.365\ \mathrm{s}$ | $0.521\ \mathrm{s}$ |

For these implementations and this machine, the crossover between NumPy and the GPU with a residual check on every iteration lies between $N=32$ and $64$. The fixed-count GPU version costs about $7$–$8.5\ \mu\mathrm{s}$ per iteration; adding a residual check every time raises that to about $69$–$84\ \mu\mathrm{s}$. On small grids, the dominant cost is therefore not the five-point update itself, but the fixed costs of kernel launch, reduction, and synchronization.

The stopping rule was then changed to check the residual once every $m$ iterations. If the first passing iteration is $K_*$, the returned count is rounded up to a check point:

$$
K=m\left\lceil\frac{K_*}{m}\right\rceil,
$$

unless `max_iter` cuts the loop off first. The loop calls the GPU residual reduction only when $K$ is a multiple of $m$:

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

Recomputing the residual of the array returned at `max_iter` avoids deciding convergence from a stale `res` left by the previous check point. The T4 results below come from another run in the same session, again with one warm-up and the median of three measured calls:

| $N$ | $m$ | Returned $K$ | Total time | Time per iteration |
|---:|---:|---:|---:|---:|
| 64 | 1 | 17759 | $1.545\ \mathrm{s}$ | $87.0\ \mu\mathrm{s}$ |
| 64 | 10 | 17760 | $0.282\ \mathrm{s}$ | $15.9\ \mu\mathrm{s}$ |
| 64 | 100 | 17800 | $0.160\ \mathrm{s}$ | $9.0\ \mu\mathrm{s}$ |
| 64 | 1000 | 18000 | $0.154\ \mathrm{s}$ | $8.5\ \mu\mathrm{s}$ |
| 128 | 1 | 71062 | $6.039\ \mathrm{s}$ | $85.0\ \mu\mathrm{s}$ |
| 128 | 10 | 71070 | $1.088\ \mathrm{s}$ | $15.3\ \mu\mathrm{s}$ |
| 128 | 100 | 71100 | $0.603\ \mathrm{s}$ | $8.5\ \mu\mathrm{s}$ |
| 128 | 1000 | 72000 | $0.569\ \mathrm{s}$ | $7.9\ \mu\mathrm{s}$ |

Here, $m=1$ uses the same configuration as “GPU check every step” in the previous table. The two runs differ by about 4% at $N=64$ and 13% at $N=128$, providing a reference for timing variation within this one session.

Increasing $m$ reduces synchronization checks, at the cost of possibly running extra iterations after the tolerance has already been met. Here, $m=100$ brings the per-iteration time close to the fixed-$K$ result while adding only a small number of iterations. It is not a universal optimum: choosing $m$ requires considering both the check cost and the size of $m$ relative to $K_*$.

# Why must GPU timing synchronize both before and after?

CUDA kernel launches are asynchronous. When a Python call returns, the GPU may still be processing queued work. Timing code such as

```python
t0 = time.perf_counter()
fn()
t1 = time.perf_counter()
```

may therefore measure mainly the time required to submit work to the queue.

The timing function in this rewrite synchronizes both before and after the measured call:

```python
def time_gpu(fn):
    cp.cuda.Device().synchronize()
    t0 = time.perf_counter()
    fn()
    cp.cuda.Device().synchronize()
    return time.perf_counter() - t0
```

The first synchronization drains work left by warm-up or a previous measurement. The second waits for the measured work to finish. In an asynchronous demonstration that launches an $N=2048$ kernel 200 times:

- timing without waiting reports only $1.46\ \mathrm{ms}$;
- waiting for all work to complete reports $87.98\ \mathrm{ms}$.

The values differ by a factor of about 60. The first is the CPU's task-submission time, rather than the time required for the GPU to complete the computation. Averaged over the launches, it is about $7.3\ \mu\mathrm{s}$ per submission, close to the $7$–$8.5\ \mu\mathrm{s}$ per step in the fixed-$K$ results above. For small grids, one iteration costs roughly one kernel submission. This difference is why a GPU performance experiment must define its synchronization boundaries before its clock readings can be compared.

# Summary

Four files form a progression from one update to a measured GPU implementation:

| Layer | Core work I completed | Evidence used to check it |
|---|---|---|
| Python loops | Sweep with source, fixed count, error, residual, and stopping loop | Known sine solution, predicted stopping counts, grid-refinement error ratios |
| NumPy | Neighbor slices, source grid, vectorized sweep, and residual stopping | Pointwise comparison with loops, random asymmetric input, and boundary checks |
| CUDA | Sweep kernel, residual kernel, GPU stopping loop, and checks every $m$ iterations | T4 output, NumPy reference, and local CUDA C simulation |
| Timing | `time_gpu` with synchronization before and after | Asynchronous/synchronous comparison and medians after warm-up in one process |

This rewrite was not completed without hints. Questions about source-term scaling, conversion from indices to coordinates, thread-index offsets, iteration counting, and the position of residual updates all went through exercises, feedback, and correction. A more precise account is that the assistant established the checking boundary and glue, I completed the core algorithms, and each layer was then tested against an independent reference.

Compared with the main thread, control over the implementation shifted. Instead of reading a finished solver, I began with one update, chose the next missing component, wrote it, and corrected it in response to failed checks.

# Current boundaries

The results still have clear limits:

- the complete output of all 23 checks after adding checks every $m$ iterations has not been retrieved from a real GPU;
- the approximately $8.7\times10^{-19}$ CPU/GPU difference at $N=13$ may be related to FMA behavior, but it has not been tested with `--fmad=false`;
- NumPy's per-point cost rises at $N\ge256$, beyond the range of the earlier linear model; cache effects are only a candidate explanation, and no hardware counters were measured;
- all GPU timings come from one Colab T4 session, with only three measured samples per item;
- residual reduction currently uses `cp.max`; no custom reduction kernel, CUDA Graph, or multi-iteration kernel was used to reduce launch overhead;
- this round did not rewrite the C++ CPU version, and Fortran is not part of the current learning plan.

What can be established is narrower and concrete: the Python, NumPy, and CUDA implementations agree numerically under the tested conditions; the stopping count matches the theoretical prediction step for step through $N\le64$, while the eight-step delay at $N=128$ is explained by rounding in the residual; and the timing data reveal the practical cost of residual checks and asynchronous execution. This is not yet a generally optimized or cross-platform Poisson solver.

# Closure

M1–M5 built a complete knowledge chain from the continuous equation to computational validation. This rewrite tests whether that chain can be reconstructed in the opposite direction:

$$
\boxed{
\begin{aligned}
&\text{one correct nodal update}
\longrightarrow
\text{multiple iterations and residual stopping}\\
&\longrightarrow
\text{whole-array NumPy expressions}
\longrightarrow
\text{CUDA threads and double buffering}\\
&\longrightarrow
\text{cross-implementation numerical comparison}
\longrightarrow
\text{performance measurement with explicit synchronization boundaries}.
\end{aligned}
}
$$

The final lesson is not that a GPU is always faster. It is a more specific set of three conclusions: correctness must be checked layer by layer against defined references; a stopping rule has both a floating-point floor and a checking cost; and GPU time becomes comparable only after its synchronization boundaries are explicit.
