---
date: '2026-06-04T12:00:00+09:00'
draft: false
title: "Convolution under an Energy Lens: The Wiener Filter Is Ridge in the Fourier Basis"
summary: "Putting convolution on the natural extension of Ax=b's energy map: a convolution operator's energy basis is always the Fourier basis, $\\sigma_k$ is the magnitude of the frequency response, and the Wiener filter is literally Ridge in the Fourier basis."
description: "Starting from translation invariance, this post shows why a convolution operator's energy basis is fixed to the Fourier basis, then maps the previous Ax=b energy view directly onto filtering, deconvolution, Wiener filtering, and Landweber iteration."
tags: ["Linear Algebra", "Convolution", "Fourier Transform", "Signal Processing", "Wiener Filter", "Deconvolution", "Energy", "Engineering Perspective"]
categories: ["Posts"]
---

# Setup

In [the Ax=b post](../ax-b-energy-perspective/), the energy view threaded together SVD, rank, condition number, inversion, Ridge, gradient descent, and PCA — the toolkit of general matrices. The energy basis $V$ there was an object **specific to each $A$, requiring its own SVD** — every matrix had its own "energy coordinate system."

This post asks: **if $A$ isn't an arbitrary matrix but a circular convolution matrix $H$, what does that energy map look like?**

The answer contains a genuinely surprising fact:

> **A convolution operator's energy basis doesn't depend on $h$ — it's the same fixed basis for every circular convolution matrix: the Fourier basis.**

This collapses the Ax=b post's abstract energy map down to the ground — $\sigma$ stops being an abstract singular value and becomes the **magnitude of the frequency response** $\lvert\hat{h}(\omega)\rvert$; $\sigma^2$ stops being an abstract energy weight and becomes the **power spectrum** of the filter. The full Ax=b toolkit (inversion, Ridge, GD) likewise stops being abstract SVD algebra and turns into things everyone can hear, see, and use — **filtering, deconvolution, Wiener filtering, iterative convergence**.

The most satisfying alignment along this thread: **the Ridge filter factor $\dfrac{\sigma_i}{\sigma_i^2 + \lambda}$ from Ax=b §6 becomes, word for word, the Wiener filter $\dfrac{\hat{h}^*}{\lvert\hat{h}\rvert^2+\lambda}$ in the Fourier basis**. The Wiener filter isn't a separately invented thing — it's Ridge specialized to the convolution setting.

The whole post moves along this thread:

- §1-§2: **What convolution actually is + why complex exponentials are the universal eigenfunctions** — two equivalent but physically distinct intuitions, plus the eigenvector status of complex exponentials
- §3: **The Fourier basis is the convolution operator's energy coordinates** — formally connecting to Ax=b's energy-basis language
- §4-§7: **Filtering / deconvolution / Wiener / Landweber** — the same power-spectrum energy map handled four different ways
- §8: **FFT compresses all of this to $O(N\log N)$** — the engineering reason convolution became the backbone operator of signal processing / image processing / CNNs

Together with [the Born's rule post](../born-rule-autocorrelation-energy/) and [the Ax=b post](../ax-b-energy-perspective/), this is the third piece of the "**energy lens**" series — the same Hilbert space showing up under different operator structures.

# 1. What Convolution Is: Two Equivalent Intuitions

To place convolution under an energy lens, we first need to be clear about what convolution actually does. It has **two equivalent but physically distinct** readings — one engineering view, one physics view.

## 1.1 Sliding Stamp / Template Matching (Engineering View)

The most naive definition:

$$ y(t) = \sum_\tau h(\tau)\, x(t - \tau) $$

Picture it like this: treat $h$ as a **stamp / template** — a short string of numbers. Drag it across the input signal $x$ one step at a time; at each position, multiply the template against the signal segment it now covers and sum — that gives the output at that position.

A few classic small examples:

- $h = [\tfrac{1}{3}, \tfrac{1}{3}, \tfrac{1}{3}]$: three-point **moving average** — each output is the average of the current point and its two neighbors. Effect: **smoothing**, washing out small-scale jitter.
- $h = [-1, 0, 1]$: **edge detection** — each output is "right neighbor minus left neighbor". Output is near zero on smooth stretches and spikes at jumps.
- $h = [1, -2, 1]$: second difference — approximates the second derivative, locates concavity changes.

Same action, read another way: drag template + multiply-and-sum = **an inner product at each position**. So convolution can also be read as "**template matching at every position**" — asking "how aligned is the input with the template at this location?" In communications this is called a **matched filter**; in a CNN, this is exactly what a convolution kernel does to detect features across its receptive field.

The fact that "do an inner product at each position" is itself **the entry point of the energy view** — [the Ax=b post](../ax-b-energy-perspective/) §9 already established that inner product = squared norm = projected energy. So convolution's output at each position is, in essence, **the local signal's energy projected onto the template's direction**.

But this is only the **first layer** of "convolution energy" — the **local, point-by-point** meaning, answering "how well does this stretch of input match the template?" §3 will bring out the **second, global** layer: placing the entire convolution operator under the SVD lens, what is its energy basis? That is this post's main course.

## 1.2 Impulse Response / Green's Function (Physics View)

Now switch the picture entirely: first decompose $x(t)$ into countless independent **impulses** — at each instant $\tau$, a sharp needle $\delta(t - \tau)$ of height $x(\tau)$:

$$ x(t) = \sum_\tau x(\tau)\,\delta(t - \tau) $$

Now send each needle through the system one at a time. The system's response to a unit impulse is called its **impulse response $h(t)$** — the system's "self-introduction." A needle of height $x(\tau)$ at position $\tau$ excites a response of $x(\tau)\cdot h(t - \tau)$: a full copy of $h$, scaled by $x(\tau)$, shifted to time $\tau$.

Sum all the responses:

$$ y(t) = \sum_\tau x(\tau)\,h(t - \tau) $$

— **identical to §1.1's formula** (because convolution is commutative, $x * h = h * x$), but the physical picture is reversed: it's no longer "drag a template over the signal" but "**every input point excites the system's intrinsic response once; superpose all those responses**."

What's truly striking is this: **as long as the system is linear and translation-invariant, the input-output relationship must be a convolution with some $h$** — where $h$ is the system's "fingerprint." Look at examples across disciplines, all the same structure:

| Physical setting | What $h$ is called | Physical intuition |
|---|---|---|
| Signal system | **Impulse response** $h(t)$ | Send a $\delta$ in; observe how the system "rings out" |
| Optical imaging | **Point spread function (PSF)** | When photographing an ideal point light, the blurry blob the lens actually records |
| Heat conduction | **Heat kernel** $\frac{1}{\sqrt{4\pi t}}e^{-x^2/4t}$ | A blob of initial temperature concentrated at one point, diffusing into a Gaussian over time |
| Electrostatic potential | **Green's function** $\frac{1}{4\pi r}$ | The potential a point charge creates in space |

These seemingly unrelated phenomena share **the same mathematical structure**: the observed whole = each source point × the system's intrinsic response, summed up. This intrinsic response has a universal name: the **Green's function**.

## What the Two Equivalent Readings Mean

They point downstream to completely different places:

- **Sliding stamp view**: naturally leads to "template matching / filter design / CNN feature detection" — concerned with **what template to use**
- **Impulse response view**: naturally leads to "linear systems theory / Green's function / inverse problems" — concerned with **what the system's intrinsic response looks like**

And the next section will reveal that the impulse response view shows us something striking: **systems of this kind share a common set of "eigenmodes" that don't depend on $h$ — the complex exponentials**. That's the entry point for the Fourier basis.

# 2. Complex Exponentials: Convolution's Only "Undistorted Note"

§1 saw that convolution has two equivalent readings. Now ask a seemingly unrelated but structurally pivotal question:

> **Is there any shape of input signal that, after convolution, gets only rescaled and never distorted?**

That is, find an $x(t)$ such that the convolution output $y = h * x$ has the same shape as $x$, just multiplied by a number overall. Such a signal is mathematically called the convolution operator's **"eigenvector."**

Translated into [the Ax=b post](../ax-b-energy-perspective/)'s §1 language: **we're really looking for the convolution operator's "energy basis"** — a set of orthogonal directions along which the operator becomes diagonal, with each direction independently rescaled and non-interfering. In Ax=b §1, the basis $V$ was specific to each $A$ and had to be computed separately; below we'll see that **for a convolution operator, this energy basis has a universal answer** — it doesn't depend on the specific $h$ at all.

## The Answer: Complex Exponential $e^{i\omega t}$

Try it directly: substitute $x(t) = e^{i\omega t}$ (a complex exponential at frequency $\omega$) into the convolution formula:

$$
(h * x)(t) = \sum_\tau h(\tau)\, e^{i\omega(t - \tau)} = e^{i\omega t} \cdot \underbrace{\sum_\tau h(\tau)\, e^{-i\omega \tau}}_{=\ \hat{h}(\omega)} = \hat{h}(\omega)\cdot e^{i\omega t}
$$

— **input $e^{i\omega t}$, output $\hat{h}(\omega)\cdot e^{i\omega t}$**: the same complex exponential, just multiplied by a number $\hat{h}(\omega)$, with its shape not moving a hair.

That $\hat{h}(\omega)$ is the **frequency response** of $h$ at frequency $\omega$ — namely the value of $h$'s Fourier transform at $\omega$.

## Intuition: A Pure Tone Is the LTI System's "Musical Note"

Send a **pure tone** (a fixed-frequency sinusoid / complex exponential) through any linear, translation-invariant system — a speaker, room reverberation, a vibrating string, a circuit, a camera lens — and what comes out is **the same frequency**, just louder or quieter. **Frequencies never mix.**

This holds for **any $h$**, no matter whether $h$ is a smoothing kernel, an edge-detection kernel, a reverberation kernel, or a blur kernel. It's not a property of $h$ at all — it's a property of **convolution itself (= linearity + translation invariance)**.

For comparison:

| Input signal | After convolution |
|---|---|
| A $\delta$ impulse | The whole $h$ gets "scattered out" (the §1.2 picture) |
| Any waveform | A more complex output, generally with the shape changed |
| **A complex exponential $e^{i\omega t}$** | **The same complex exponential, just multiplied by $\hat{h}(\omega)$** — shape unchanged |

Complex exponentials are the **only** inputs of this kind of system that preserve shape.

## Why This Is the Pivot for Everything Below

Any signal $x(t)$ can be decomposed into a sum of complex exponentials (that's exactly what the Fourier transform does):

$$
x(t) = \sum_\omega \hat{x}(\omega)\, e^{i\omega t}
$$

Because convolution is linear, once each $e^{i\omega t}$ is merely rescaled (not distorted), the whole convolution is **just an independent rescaling at each frequency**:

$$
(h * x)(t) = \sum_\omega \hat{x}(\omega)\, \hat{h}(\omega)\, e^{i\omega t}
$$

That is: **in the Fourier basis, convolution is diagonal — independent multiplication per frequency**.

This is the celebrated **convolution theorem** — convolution in time = multiplication in frequency. Its root is this section's observation: **complex exponentials are convolution's only undistorted notes**. The next section, §3, formally hooks this onto Ax=b's energy-basis language: the Fourier basis built from complex exponentials is the convolution operator's energy coordinates.

# 3. The Fourier Basis: A Convolution Operator's Energy Coordinates

§2 ended with a hook: $e^{i\omega t}$ is a convolution operator's eigenvector. Collect all the complex exponentials at different frequencies into a basis, and you get the **Fourier basis** — the concrete form of §2's "universal energy basis."

## Diagonalizing the Convolution Operator

For a circulant matrix $H$ of length $N$, write its diagonalization in the Fourier basis:

$$
H = F^*\cdot \mathrm{diag}(\hat{h})\cdot F
$$

where $F$ is the DFT matrix (each column a normalized complex exponential). This can be lined up letter-for-letter against [the Ax=b post](../ax-b-energy-perspective/) §1's $A = U\Sigma V^\top$:

| Ax=b's general SVD | Convolution operator's diagonalization |
|---|---|
| Right singular basis $V$ (depends on $A$) | $V = F$ — **the Fourier basis is the same for every $h$** |
| Left singular basis $U$ (depends on $A$) | $U = F$ — also the Fourier basis |
| Singular value $\sigma_i$ | $\sigma_k = \lvert\hat{h}(\omega_k)\rvert$ — **the magnitude of the frequency response** |
| Energy weight $\sigma_i^2$ | $\sigma_k^2 = \lvert\hat{h}(\omega_k)\rvert^2$ — **the filter's power spectrum** |

— the Fourier basis is independent of $h$; every circulant convolution operator shares the same energy coordinates. **What changes is only the specific value of $\hat{h}_k$** (how energy gets distributed across frequencies). This was foreshadowed in §2; now, in Ax=b's energy-basis language, it's a special fact: **convolution turns the energy basis from "proprietary" into "universal."**

> A precise note: in the diagonalization, $\hat{h}_k$ is a complex number. If you insist on writing this as a pure-real-singular-value SVD, then $\sigma_k = \lvert\hat{h}_k\rvert$ and the phase of $\hat{h}_k$ is absorbed into the phase factor between the left and right bases. The energy intuition is unchanged.

## Parseval: Energy Conservation between Time and Frequency

The Fourier transform is **unitary** ($F^* F = I$), so a signal's total energy is **exactly equal** in time and frequency:

$$
\sum_t |x(t)|^2 \;=\; \sum_k |\hat{x}(\omega_k)|^2
$$

This is **Parseval's theorem**. What it says is: **the Fourier basis is an orthonormal basis** — expanding a signal in it neither loses energy nor magically gains any. It's the same fact as Ax=b §1's "$V$ is orthonormal," only now this orthonormal basis has a concrete name (Fourier) and a concrete physical meaning (frequency).

## The Wrap-up: A Convolution Operator's Energy Map Is Its Power Spectrum

Combining the above two facts, the abstract "energy map" from Ax=b suddenly becomes **concretely visible** in the convolution setting:

> **A convolution operator's energy map $\sigma_k^2 = \lvert\hat{h}(\omega_k)\rvert^2$ is just the filter's power spectrum.**

The heights of $\sigma_k$ across frequencies describe what this $h$ "is sensitive to and what it's dull about":

- $\hat{h}$ large at low frequency, small at high → **low-pass filter** (keeps the slowly varying, suppresses jitter)
- $\hat{h}$ large at high frequency, small at low → **high-pass filter** (keeps abrupt changes, suppresses steady backgrounds)
- $\hat{h}$ concentrated in a band → **band-pass / notch filter**

And the "decompose $x$ → scale by $\sigma$ → assemble $b$" three-step pipeline from Ax=b §2 becomes, in the convolution setting, three very concrete things:

$$
\underbrace{x \xrightarrow{\text{FFT}} \hat{x}}_{\text{Decompose: Fourier expand}}
\;\to\;
\underbrace{\hat{y}_k = \hat{h}_k \cdot \hat{x}_k}_{\text{Scale: independent multiply by }\hat{h}_k}
\;\to\;
\underbrace{\hat{y} \xrightarrow{\text{IFFT}} y}_{\text{Assemble: return to time}}
$$

This is what the **convolution theorem $y = h * x \;\Leftrightarrow\; \hat{y} = \hat{h}\cdot\hat{x}$** really means under the energy lens: not just an algorithmic shortcut saying "time convolution = frequency multiplication," but the assertion that **convolution is fundamentally diagonal scaling in its energy basis (the Fourier basis) — redistributing energy across frequency bands, one band at a time**.

§4 through §7 all sit on this **power-spectrum energy map**: filtering picks which $\sigma_k$ to keep, deconvolution takes reciprocals, Wiener lays an energy floor, Landweber does gradient descent on this spectrum.

# 4. Filtering = Choosing Which σ to Keep along the Frequency Axis

§3 grounded Ax=b's abstract energy map into the concrete power spectrum $\sigma_k^2 = \lvert\hat{h}(\omega_k)\rvert^2$. **"Filtering" is just drawing this spectrum into some desired shape — making some $\sigma_k$ large, others small, others outright zero.**

## All Filters Are the Same Action in Different Flavors

| Filter | Shape of $\sigma_k$ | Intuition |
|---|---|---|
| **Low-pass** | $\sigma_k \approx 1$ at low frequency, $\sigma_k \approx 0$ at high | Keep slowly-varying macro structure, erase jitter / noise. Examples: image blurring, denoising, data smoothing |
| **High-pass** | $\sigma_k \approx 0$ at low frequency, $\sigma_k \approx 1$ at high | Erase steady background, keep sharp changes / edges. Examples: Sobel / Laplacian edge detection |
| **Band-pass** | $\sigma_k$ concentrated in a band | Pass only a specific frequency range. Examples: extracting the voice band in audio, single-frequency signal detection |
| **Band-stop / notch** | $\sigma_k$ dips to 0 in a band | Suppress only a specific band. Examples: removing 50 / 60 Hz mains interference, removing a known single-frequency noise |

— **all filters are the same thing**: drawing a curve of $\sigma_k$ along the frequency axis, deciding which frequencies pass and which don't. The only difference is the shape of the curve.

## A Common Misconception: Small σ ≠ "High Frequencies Get Suppressed"

It's tempting to think "small σ means high frequencies are suppressed," but this only holds for **low-pass filters**. In general, **"where small σ shows up on $\omega$" depends entirely on $h$'s design**:

- Low-pass: small σ at **high** frequencies → highs erased
- High-pass: small σ at **low** frequencies → lows erased
- Notch: small σ concentrated in **a particular band** → that band erased

In other words: **$\sigma_k \approx 0$ determines that the energy at some $\omega_k$ is erased — but which $\omega_k$ depends on the shape of $\hat{h}$**. The difference between low-pass / high-pass / band-pass / notch is hidden in $\hat{h}$'s shape.

## Filter Design = Energy-Spectrum Shape Design

Under the energy lens, **designing a filter = designing the shape of this energy spectrum**. The engineering history of this idea has gone through an interesting migration:

- **Traditional signal processing**: engineers hand-compute $\hat{h}$ based on prior knowledge, making $\sigma_k = 1$ in the desired band and 0 elsewhere. Butterworth, Chebyshev, Kaiser, and other "classical filters" all draw different shapes for the $\sigma_k$ curve.
- **Modern CNN**: give up hand-computation. Treat the convolution kernel $h$ as a trainable parameter, and let the network **learn its own $\hat{h}$** by gradient descent — i.e., learn a suitable $\sigma_k$ shape for the task. The "GD descends along energy gradients" story from [the Ax=b post](../ax-b-energy-perspective/) §7 connects here.

What each CNN convolution layer learns is, in essence, **a set of frequency response curves meaningful for the current task** — which bands to keep, which to suppress, all encoded in the shape of $\hat{h}$.

# 5. Deconvolution: Weak Frequencies Blow Up in Reverse

So far §3-§4 went **forward**: given $x$ and $h$, compute $y = h * x$. **Deconvolution** asks the reverse: given an observed $y$ and a known $h$, recover the original $x$.

Using the convolution theorem $\hat{y} = \hat{h}\cdot\hat{x}$, the inverse becomes **formally extremely simple** in the frequency domain:

$$
\hat{x}(\omega) = \frac{\hat{y}(\omega)}{\hat{h}(\omega)}
$$

— divide frequency by frequency, then IFFT back to time. The problem isn't computational difficulty; it's **what $\hat{h}$ looks like**.

## The Source of Disaster: Where $\hat{h}$ Goes near Zero

Back to §4's power-spectrum view: each $\sigma_k = \lvert\hat{h}(\omega_k)\rvert$ is this filter's **forward throughput** at frequency $\omega_k$. If $\hat{h}$ is near 0 at certain frequencies (a low-pass filter's high band, a blur kernel's high band), then when going backward —

$$
\frac{1}{\hat{h}(\omega_k)} \to \infty
$$

— **the reverse gain at those frequencies becomes astronomical**. The tiniest bit of noise in $y$ at that frequency gets amplified during the reverse computation into wild oscillations in $x$.

## This Is the Frequency-Domain Version of Ax=b's Inversion Blow-up

Compare to [the Ax=b post](../ax-b-energy-perspective/) §5 — **same phenomenon, different basis**:

| Ax=b §5 (general SVD basis) | Convolution deconvolution (Fourier basis) |
|---|---|
| $(A^TA)^{-1}$'s reverse energy gain along $v_i$ is $1/\sigma_i^2$ | $1/\hat{h}$'s reverse amplitude gain at $\omega_k$ is $1/\hat{h}_k$ (energy gain $= 1/\lvert\hat{h}_k\rvert^2$) |
| Weak directions with $\sigma_i \approx 0$ → noise black holes in reverse | Weak frequencies with $\hat{h}(\omega) \approx 0$ → noise black holes in reverse |
| Numerical instability / ill conditioning | The classic "noise amplification" symptom of deconvolution |
| Cure: Ridge ($+\lambda I$) | Cure: Wiener filter (next section) |

**The two are the same thing under the energy lens**: weak directions get inverted into noise-amplifying black holes — only in Ax=b the "weak direction" is some $v_i$ with small $\sigma_i$, while in deconvolution the "weak frequency" is some $\omega$ where $\hat{h}(\omega)$ is small.

## The Most Visceral Example: Deblurring

A motion-blurred photo can be modeled as a clean image $x$ convolved with a blur kernel $h$: $y = h * x$. The blur kernel $h$ is a low-pass filter — its $\hat{h}$ at high frequencies (details, sharp edges, fine textures) is nearly 0.

In theory, deconvolution $\hat{x} = \hat{y} / \hat{h}$ should **completely restore** the original photo. In practice, as long as $y$ has any observation noise (even just the slight thermal noise of the camera sensor), the high-frequency bands where $\hat{h} \approx 0$ **amplify that noise into wild speckles covering the whole image** — what comes out isn't the original but a sheet of oscillating garbage.

This is the most classic difficulty in deconvolution / deblurring: **naively dividing by $\hat{h}$ almost never works**.

## The Cure Comes in the Next Section

Just like the Ax=b §5 → §6 arc: weak-frequency blow-up needs a safety net. The next section's **Wiener filter** is the precise counterpart, in the Fourier basis, of Ax=b §6's Ridge — laying a $\lambda$ energy floor across all frequencies, so that frequencies with $\hat{h} \approx 0$ have their reverse-amplification power softly sealed.

# 6. The Wiener Filter: Ridge in the Fourier Basis

§5 backed deconvolution into a corner: at frequencies where $\hat{h} \approx 0$, $1/\hat{h}$ blows up and noise gets amplified by astronomical factors. **The Wiener filter is the rescue — and the way it rescues is word-for-word identical to [Ax=b §6](../ax-b-energy-perspective/)'s Ridge.**

## The Formula: Lay an Energy Floor at Every Frequency

The Wiener filter replaces the naive deconvolution $\hat{x} = \hat{y}/\hat{h}$ with:

$$
\hat{x}_{\text{Wiener}}(\omega) \;=\; \frac{\hat{h}^*(\omega)}{\lvert\hat{h}(\omega)\rvert^2 + \lambda}\,\hat{y}(\omega)
$$

Notice the extra $\lambda$ in the denominator — that's "laying an energy floor at every frequency." Where the reverse gain at $\hat{h}(\omega) \approx 0$ used to be an astronomical number, it's now held down by the $\lambda$ in the denominator and goes from $1/\hat{h}$ to a finite number on the order of $1/\lambda$.

## Word-for-Word Alignment with Ax=b §6's Ridge

Open up Ridge's filter factor from [Ax=b §6](../ax-b-energy-perspective/):

$$
\hat{x}_{\text{Ridge}} \;=\; V \cdot \mathrm{diag}\!\left(\frac{\sigma_i}{\sigma_i^2 + \lambda}\right) U^\top b
$$

The extra factor in each singular direction is $\dfrac{\sigma_i}{\sigma_i^2 + \lambda}$.

Translate the Wiener formula via §3's correspondence: $\sigma_k = \lvert\hat{h}(\omega_k)\rvert$, $V = U = F$, and "multiplication in a singular direction" becomes "multiplication at a frequency." Lay the two formulas side by side:

| | Filter factor | In which basis |
|---|---|---|
| **Ridge** (Ax=b §6) | $\dfrac{\sigma_i}{\sigma_i^2 + \lambda}$ | General SVD basis $V$ (depends on $A$) |
| **Wiener** (this section) | $\dfrac{\hat{h}^*(\omega)}{\lvert\hat{h}(\omega)\rvert^2 + \lambda}$ | Fourier basis $F$ (the same for every $h$) |

> One-line summary: **the Wiener filter is the precise instance of Ridge in the Fourier basis**. The two formulas look identical because they're doing exactly the same thing — Ridge expressed in the general SVD basis, Wiener expressed in the Fourier basis.
>
> About the conjugate $\hat{h}^*$ in the Wiener numerator: in Ridge, $\sigma_i$ is real ($\sigma_i^* = \sigma_i$), so the numerator is just $\sigma_i$; in Wiener, $\hat{h}$ is complex, so that $\sigma$ in the numerator naturally becomes $\hat{h}^*$ — just the phase normalization required in the complex setting. The energy intuition is unchanged.

## Intuition: Gentle Cutoff vs. Brute Inversion

Feel out the Wiener filter factor at two extremes:

- $\lvert\hat{h}(\omega)\rvert \gg \sqrt{\lambda}$ (**strong frequency**, signal is clear):
  $$\frac{\hat{h}^*}{|\hat{h}|^2 + \lambda} \approx \frac{\hat{h}^*}{|\hat{h}|^2} = \frac{1}{\hat{h}}$$
  Same as naive deconvolution — nearly perfect restoration.

- $\lvert\hat{h}(\omega)\rvert \ll \sqrt{\lambda}$ (**weak frequency**, the one that would blow up):
  $$\frac{\hat{h}^*}{|\hat{h}|^2 + \lambda} \approx \frac{\hat{h}^*}{\lambda}$$
  The denominator is held down by $\lambda$, and **the reverse gain goes from $1/\hat{h} \to \infty$ to a softly bounded $\hat{h}^*/\lambda$** — noise amplification is completely sealed.

So Wiener is a **gentle cutoff filter**: it inverts honestly at strong frequencies and softly suppresses at weak ones rather than dividing brute-force — exactly the same behavior as Ax=b §6's "low-pass filter."

## The Physical Meaning of $\lambda$: A Noise-Power Floor

$\lambda$ isn't pulled out of thin air — it corresponds to the **assumed noise power level** of the signal (more rigorously, the ratio of noise power spectral density to signal power spectral density). The intuition:

> I consider any frequency component below the $\lvert\hat{h}\rvert$ level $\sqrt{\lambda}$ untrustworthy — trying to restore it would just amplify noise.

This is the same sentence as Ax=b §6's "$\lambda$ is a noise energy floor," just with "singular-value level" swapped for "frequency-response level."

## Back to Deblurring: What Wiener Concretely Does

Back to that motion-blurred photo from §5. Naive deconvolution amplifies high-frequency noise into a sheet of speckles; once you switch to Wiener:

- **Low-frequency band** ($\hat{h}$ large): invert as usual — large outlines and overall shapes are restored
- **High-frequency band** ($\hat{h}$ near 0, where things would have exploded): Wiener automatically **gives up trying to recover** — fine details aren't restored well (after all, the original information really was eaten by the blur kernel), but at least the noise isn't blown up into a flood of speckles

That's the **single difference** between Wiener and naive deconvolution: **trading some "lost detail" to avoid "being ruined by noise."** Larger $\lambda$ is more conservative (preserving more large-scale structure, abandoning more detail); smaller $\lambda$ is more aggressive (trying to recover more detail, but more easily bitten by noise). This "$\lambda$ controls the aggressive-vs-conservative dial" is the same curve as Ax=b §6's Ridge.

---

The next section, §7, pushes this thread one more step: instead of using this closed-form formula directly, what if we solve the least-squares problem iteratively with gradient descent? That's **Landweber iteration** — [Ax=b §7](../ax-b-energy-perspective/)'s gradient descent specialized to the convolution setting.

# 7. Landweber Iteration: Convolution's Version of Gradient Descent

§5-§6 used **closed-form** approaches to deconvolution — naive division (which explodes) or Wiener (with an energy floor). But what if we don't use the closed form? What if, as in [Ax=b §7](../ax-b-energy-perspective/), we **solve the least-squares problem $\min_x \tfrac{1}{2}\|y - h * x\|^2$ with gradient descent**? That's **Landweber iteration** — the direct instance of Ax=b §7's gradient descent in the convolution setting.

## Landweber's Update Rule

Take the gradient of the least-squares loss with respect to $x$, and the GD update rule pops out:

$$
x_{t+1} \;=\; x_t \;+\; \eta\,\cdot\, h^*\!*\!(y - h * x_t)
$$

where $h^*$ is the "reverse convolution kernel" of $h$ (in time, $h^*(t) = \overline{h(-t)}$; in frequency, the conjugate $\hat{h}^*$). Each step does three things: compute the current residual $y - h*x_t$, convolve it back into the input space, and take a step of size $\eta$.

## In the Fourier Basis: Each Frequency Converges Independently

Project this iteration into the Fourier basis. Let the error $e_t = x_t - x^*$ ($x^*$ the true solution); at each frequency $\omega_k$ the recursion becomes:

$$
\hat{e}_{t+1}(\omega_k) \;=\; \bigl(1 - \eta\,\lvert\hat{h}(\omega_k)\rvert^2\bigr)\cdot \hat{e}_t(\omega_k)
$$

— **each frequency converges independently**, with contraction factor $1 - \eta\,\lvert\hat{h}(\omega_k)\rvert^2$, controlled directly by that frequency's $\sigma_k^2 = \lvert\hat{h}\rvert^2$.

At this moment, [Ax=b §7](../ax-b-energy-perspective/)'s story replays word-for-word in the Fourier basis:

| Ax=b §7 (general SVD basis) | Landweber (Fourier basis) |
|---|---|
| Contraction factor $1 - \eta\sigma_i^2$ at each $v_i$ | Contraction factor $1 - \eta\,\lvert\hat{h}_k\rvert^2$ at each $\omega_k$ |
| Large $\sigma_i$ → converges fast | Large $\lvert\hat{h}\rvert$ → converges fast |
| Small $\sigma_i$ → converges very slowly | Small $\lvert\hat{h}\rvert$ → converges very slowly |
| Overall convergence dragged by $\kappa = \sigma_1/\sigma_n$ | Overall convergence dragged by $\kappa_{\text{conv}} = \dfrac{\max\lvert\hat{h}\rvert}{\min\lvert\hat{h}\rvert}$ |

— **same phenomenon, different basis**: in the general SVD basis it's called "the poor direction can't move"; in the Fourier basis it's called "the poor frequency can't move."

## Three Things Are Three Faces of the Same Energy Map

At this point, the post's deepest duality can be wrapped up. On the same power spectrum $\lvert\hat{h}(\omega)\rvert^2$:

| Operation | What happens at weak frequencies ($\lvert\hat{h}\rvert \approx 0$) |
|---|---|
| **Deconvolution** (§5) | Reverse division → noise amplified by astronomical factors |
| **Landweber** (this section) | Forward iteration → these frequencies barely update; overall convergence stalls |
| **Wiener** (§6) | Lay a $\lambda$ energy floor at every frequency → **rescues both at once**: weak frequencies no longer explode in reverse, and forward iteration can take more steps at weak frequencies |

This is exactly Ax=b §7's "**inversion blow-up (static) and slow GD convergence (dynamic) are two sides of the same energy map**" in the precise convolution instance — Ridge doesn't just save reverse solving, it also saves gradient descent; Wiener doesn't just save deconvolution, it also saves Landweber. The two threads (convolution / general matrix) align perfectly in their respective energy bases.

# 8. FFT: Compressing All of This to $O(N \log N)$

Putting all §3-§7 together, a convolution operator has a remarkably **fortunate** engineering property:

> **Its energy basis is the Fourier basis — and we happen to have a fast algorithm for switching between time and Fourier domains: the FFT (Fast Fourier Transform).**

For a signal of length $N$, naive DFT takes $O(N^2)$ complex multiplications; FFT compresses this to $O(N\log N)$. This is what turns all the static / dynamic operations above from "theoretically correct" into "engineering-feasible."

## Sorting Out the Complexity Math First

A few different complexity scales show up below — quick reminder where each comes from:

| Operation | Cost | How it's counted |
|---|---|---|
| **Naive DFT** | $O(N^2)$ | Compute $N$ frequency components, each a weighted sum of $N$ time-domain samples → $N \times N$ complex multiplies |
| **FFT** | $O(N\log N)$ | Cooley–Tukey divide-and-conquer: split an $N$-point DFT into two $N/2$-point DFTs; recurse $\log_2 N$ levels, $O(N)$ per level |
| **Matrix-vector multiply** $Mx$ | $O(N^2)$ | $N$ outputs, each a length-$N$ dot product |
| **Matrix inversion / SVD** | $O(N^3)$ | $N$ elimination steps (or iterations), each $O(N^2)$ work |
| **Pointwise frequency multiply** | $O(N)$ | Multiply $N$ frequency components one by one — no crossings |

The FFT's key saving is in that divide-and-conquer — what was $N$ outputs each at $N$ multiplications (a "matrix-vector multiply") gets compressed into $\log N$ layers, each $O(N)$. This is an old but stunningly elegant algorithm (Cooley–Tukey 1965).

## All Operations Become an "FFT Three-Step"

Reuse the "decompose / scale / assemble" pipeline from §3's end — all the operations above are the same three-step, just with the middle "scale" step swapped for a different filter factor. Each one's total cost is "**FFT on both ends + pointwise middle**":

| Operation | Middle step in frequency | Total cost (FFT + middle + IFFT) |
|---|---|---|
| **Forward filtering** (§4) | $\hat{y}_k = \hat{h}_k\hat{x}_k$ | $O(N\log N) + O(N) + O(N\log N) = O(N\log N)$ |
| **Naive deconvolution** (§5) | $\hat{x}_k = \hat{y}_k / \hat{h}_k$ (weak frequencies blow up) | $O(N\log N)$ |
| **Wiener** (§6) | $\hat{x}_k = \dfrac{\hat{h}^*_k}{\lvert\hat{h}_k\rvert^2 + \lambda}\,\hat{y}_k$ | $O(N\log N)$ |
| **Landweber step** (§7) | $\hat{x}^{(t+1)}_k = \hat{x}^{(t)}_k + \eta\,\hat{h}^*_k(\hat{y}_k - \hat{h}_k\hat{x}^{(t)}_k)$ | $O(N\log N)$ |

Each is "two $O(N\log N)$ FFTs sandwiching one $O(N)$ frequency-domain operation" — total cost is dominated by the FFT and still ends up at $O(N\log N)$. **The whole convolution toolkit is flattened by the FFT to the same complexity tier.**

## Convolution's "Star Student" Status

Back to [the Ax=b post](../ax-b-energy-perspective/) for comparison:

| Operation | General matrix | Convolution (with FFT) |
|---|---|---|
| Operator decomposition (find energy basis) | $O(N^3)$ SVD | **Don't need to compute** — the energy basis is the Fourier basis, universal |
| One forward $Hx$ | $O(N^2)$ | $O(N\log N)$ |
| One reverse $H^{-1}b$ / Ridge | $O(N^3)$ | $O(N\log N)$ |
| One GD step | $O(N^2)$ | $O(N\log N)$ |

A concrete scale to feel the gap — take $N = 10^6$ (a million-point signal, e.g., a few dozen seconds of audio or a roughly $1000\times 1000$ image):

- $N\log N \approx 2\times 10^7$ operations — **on the order of half a second on modern CPUs**
- $N^2 \approx 10^{12}$ operations — hours
- $N^3 \approx 10^{18}$ operations — impossible (age-of-the-Earth territory)

**The reason convolution became the backbone operator of signal processing / image / communications / neural networks is, directly, the FFT**: the general-matrix energy view is a mathematical luxury ($O(N^3)$ doesn't actually run at scale); the convolution-matrix energy view, in contrast, both exists naturally (Fourier basis) and is essentially free to apply.

## In One Sentence

> **Convolution is the "star student" in the $Ax = b$ family of operators — its energy basis doesn't depend on $h$ and is always the Fourier basis. The engineering consequence: the whole suite of energy-view operations (filtering, deconvolution, Wiener, Landweber) is flattened by the FFT to $O(N\log N)$.**

So every "convolve with some kernel" operation you see in images, audio, communications, or CNNs is, underneath, the same power-spectrum energy map plus the FFT's compute discount.

# Closing

Threading the whole post into one paragraph:

> Any **linear + translation-invariant** system can be written as a convolution with some $h$ — that's what §1's two views told us, whether you start from "sliding stamp" or "impulse-response superposition." Systems of this kind share a striking common property (§2): **complex exponentials $e^{i\omega t}$ are their only undistorted notes** — pure tones come out only rescaled, never deformed.
>
> That fact directly hands us the convolution operator's **energy basis** (§3): collect all the complex exponentials into a basis and you get the **Fourier basis** — the same one for every $h$, the deepest difference between convolution and a general matrix's SVD. $\sigma_k = \lvert\hat{h}_k\rvert$ is the magnitude of the frequency response; $\sigma_k^2$ is the filter's **power spectrum**. Ax=b's abstract energy map becomes, in the convolution setting, the visibly concrete curve of $\lvert\hat{h}(\omega)\rvert^2$.
>
> Standing on this spectrum: **filtering** picks which $\sigma_k$ to keep (§4); **deconvolution** takes reciprocals and weak frequencies explode (§5); **Wiener filtering** lays a $\lambda$ energy floor at every frequency (§6 — word-for-word the instance of Ridge in the Fourier basis); **Landweber iteration** does gradient descent on this spectrum (§7 — the precise convolution mirror of Ax=b §7). The **FFT** (§8) flattens this whole suite of operations to $O(N\log N)$, making convolution the backbone operator of signal processing / image / communications / neural networks.
>
> Placing this post next to [the Ax=b post](../ax-b-energy-perspective/), **two stances of the energy lens** emerge:
>
> - **Ax=b is a matrix's self-examination** — SVD lets an isolated matrix look in the mirror and find its intrinsic energy basis and power distribution. It changes nothing, just measures and describes
> - **Convolution is an operator's active judgment** — it comes with a preset energy rule (frequency response $\hat{h}$) and acts on the input signal, redistributing energy across frequency bands
>
> Same energy language, **one inward, one outward**.
>
> Add [the Born's rule post](../born-rule-autocorrelation-energy/)'s "inner product = energy" as foundation, and the three posts together are the same **Hilbert space** showing up under different identities — **probability density, the squares of a matrix's singular values, a filter's power spectrum — all of them are the same $L^2$ squared norm appearing in different contexts**.
