---
date: '2026-04-27T7:00:00+09:00'
draft: false
title: 'Machine Learning / Generative Models: The Basic Idea of VAE and the ELBO'
summary: "A study note around the core problem in the VAE paper: the intuition of Variational Autoencoder, the model structure, where ELBO comes from, and why the reparameterization trick is necessary."
description: "A study note on the basic idea of Variational Autoencoder and the intuition behind ELBO."
tags: ["Generative Models", "VAE", "ELBO", "Latent Variable Model", "Reparameterization"]
categories: ["Crucible"]
aliases:
  - /notes/笔记-生成模型1-1-VariationalAutoencoder的基本思想与ELBO推导/
  - /notes/笔记-生成模型1-vae基本思想与elbo推导/
---

# Machine Learning / Generative Models: The Basic Idea of VAE and the ELBO

**VAE study note**

Paper: [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114)

This is the first note in the VAE study series. It focuses on the paper intuition and the ELBO derivation. The next note turns these formulas into a minimal PyTorch reproduction: [Generative Models Part 1-2: A Minimal Variational Autoencoder Reproduction](/en/notes/笔记-生成模型1-2-variationalautoencoder的最小复现/).

# Abstract

- Main question: how can we perform efficient inference and learning in directed probabilistic models with continuous latent variables, intractable posterior distributions, and large datasets?

- Proposed ideas:
  1. **Reparameterization Trick**: by reparameterizing the variational lower bound, the authors obtain a lower-bound estimator that can be optimized with standard stochastic gradient methods.
  2. **Encoder / Recognition Model**: for i.i.d. datasets where each datapoint has its own continuous latent variable, the authors train an approximate inference model, also called a recognition model, to efficiently approximate the true posterior.

# Introduction

## Problem

**How can we efficiently perform inference and learning in directed probabilistic models with continuous latent variables, intractable posterior distributions, and large datasets?**

- **Inference**: given an observed sample $x$, infer the latent variable $z$ behind it. For example, if $x$ is a handwritten digit image, $z$ may represent style, stroke width, tilt, and other hidden factors.

$$p_{\theta}(z \mid x)$$

- **Learning**: learn model parameters $\theta$ so that the model becomes better at generating data:

$$p_{\theta}(x \mid z)$$

## Limitation: Intractable Posterior and Marginal Likelihood

In a latent variable model, the posterior distribution we want is:

$$\begin{aligned} p_{\theta}(z \mid x) = \frac{p_{\theta}(x \mid z)p_{\theta}(z)}{p_{\theta}(x)} \end{aligned}$$

The denominator is the marginal likelihood:

$$\begin{aligned} p_{\theta}(x) = \int p_{\theta}(x \mid z)p_{\theta}(z)\,dz \end{aligned}$$

In complex models this integral is usually intractable. As a result, the true posterior is hard to compute, and directly maximizing $\log p_{\theta}(x)$ is also difficult.

This is the core tension VAE tries to solve: we want to learn a generative model $p_{\theta}(x \mid z)$, but the true posterior $p_{\theta}(z \mid x)$ required by that learning problem is not directly tractable.

# Method

The Method section turns the earlier intuition into a formal setup. The goal is to construct a variational lower-bound estimator for directed graphical models with continuous latent variables, so that it can be optimized with stochastic gradients.

The paper focuses on a common setting: **the dataset is i.i.d., and each observed datapoint $x^{(i)}$ has a corresponding continuous latent variable $z^{(i)}$.** We want to learn the global generative parameters $\theta$ while performing approximate variational inference over the per-datapoint latent variables.

Figure 1 shows the basic structure:

$$z \rightarrow x$$

The solid lines represent the generative process:

$$p_{\theta}(z)p_{\theta}(x \mid z)$$

That is, first sample a latent variable $z$ from the prior, then generate the observed data $x$ from the conditional distribution $p_{\theta}(x \mid z)$.

The dashed line represents the approximate inference process:

$$q_{\phi}(z \mid x)$$

Since the true posterior $p_{\theta}(z \mid x)$ is usually intractable, the paper introduces a recognition model parameterized by $\phi$ to approximate it. In short, $\theta$ describes the generative relation $z \rightarrow x$, while $\phi$ describes the approximate inference relation $x \rightarrow z$.

## Problem Scenario

Classical variational Bayes also approximates the true posterior with a simpler distribution, but in complex models this approximation may require tedious analytic derivations or expensive iterative optimization for each datapoint. VAE introduces a parameterized recognition model:

$$q_{\phi}(z \mid x)$$

It directly learns a mapping from observed data $x$ to a posterior distribution over latent variables, using a shared encoder to approximate the intractable true posterior $p_{\theta}(z \mid x)$.

The data generation process can be viewed as two steps:

$$z^{(i)} \sim p_{\theta^{*}}(z)$$

$$x^{(i)} \sim p_{\theta^{*}}(x \mid z)$$

In other words, the latent variable is generated first, and the observation is generated from that latent variable.

During training, however, we can only observe $x^{(i)}$. The true parameters $\theta^{*}$ and the latent variable $z^{(i)}$ behind each sample are unknown.

In this scenario, the paper wants to solve three related problems:

1. Efficiently learn the generative parameters $\theta$, so that the model can generate samples similar to the real data.
2. Given an observation $x$, efficiently approximate the posterior of the latent variable $z$.
3. Efficiently handle marginal inference tasks over $x$, such as image denoising, inpainting, and super-resolution.

From a coding perspective, $z$ can be understood as a latent code. Therefore $q_{\phi}(z \mid x)$ is called a probabilistic encoder: it takes $x$ as input and outputs a distribution over $z$. Similarly, $p_{\theta}(x \mid z)$ is called a probabilistic decoder: it takes $z$ as input and outputs a distribution over $x$.

## The Variational Bound

Since the samples are i.i.d., the marginal likelihood of the whole dataset decomposes into the product of the marginal likelihoods of individual datapoints.

The **marginal likelihood** $p_{\theta}(x)$ can be understood as the total probability, under the current model parameters $\theta$, that all possible latent variables $z$ generate the observed data $x$. Maximizing the marginal likelihood means making the model more likely to generate the real data.

$$\begin{aligned} p_{\theta}(x^{(1)}, \ldots, x^{(N)}) = \prod_{i=1}^{N} p_{\theta}(x^{(i)}) \end{aligned}$$

Taking logs turns the product into a sum:

$$\begin{aligned} \log p_{\theta}(x^{(1)}, \ldots, x^{(N)}) = \sum_{i=1}^{N} \log p_{\theta}(x^{(i)}) \end{aligned}$$

So it is enough to understand how to handle the single-datapoint term $\log p_{\theta}(x^{(i)})$, and then extend it to the full dataset.

The paper decomposes the marginal log-likelihood of one datapoint into two parts:

$$\begin{aligned} \log p_{\theta}(x^{(i)}) = D_{\mathrm{KL}} \left( q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)}) \right) + \mathcal{L}(\theta, \phi; x^{(i)}) \end{aligned}$$

- $D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)})\right)$: the KL error between the approximate posterior $q_{\phi}(z \mid x)$ and the true posterior $p_{\theta}(z \mid x)$.

- $\mathcal{L}(\theta, \phi; x^{(i)})$: the ELBO, or evidence lower bound, which is a variational lower bound on the marginal log-likelihood.

Since KL divergence is non-negative:

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z \mid x^{(i)})\right) \ge 0 \end{aligned}$$

we have:

$$\begin{aligned} \log p_{\theta}(x^{(i)}) \ge \mathcal{L}(\theta, \phi; x^{(i)}) \end{aligned}$$

This is why the ELBO is called a lower bound: it lies below the true objective $\log p_{\theta}(x^{(i)})$, but is easier to estimate and optimize.

{{< details summary="Derivation: why the true objective decomposes into KL error + ELBO" >}}

Start by expanding the KL divergence between the approximate posterior and the true posterior:

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log q_{\phi}(z \mid x) - \log p_{\theta}(z \mid x) \right] \end{aligned}$$

By Bayes' rule:

$$\begin{aligned} p_{\theta}(z \mid x) = \frac{p_{\theta}(x,z)}{p_{\theta}(x)} \end{aligned}$$

Therefore:

$$\begin{aligned} \log p_{\theta}(z \mid x) = \log p_{\theta}(x,z) - \log p_{\theta}(x) \end{aligned}$$

Substituting this into the KL divergence and rearranging gives:

$$\begin{aligned} D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log q_{\phi}(z \mid x) - \log p_{\theta}(x,z) \right] + \log p_{\theta}(x) \end{aligned}$$

Moving terms around:

$$\begin{aligned} \log p_{\theta}(x) = D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z \mid x)\right) + \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log p_{\theta}(x,z) - \log q_{\phi}(z \mid x) \right] \end{aligned}$$

The expectation term is defined as the ELBO:

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)} \left[ \log p_{\theta}(x,z) - \log q_{\phi}(z \mid x) \right] \end{aligned}$$

{{< /details >}}

The ELBO can first be written as:

$$\begin{aligned} \mathcal{L}(\theta, \phi; x^{(i)}) = \mathbb{E}_{q_{\phi}(z \mid x^{(i)})} \left[ \log p_{\theta}(x^{(i)}, z) - \log q_{\phi}(z \mid x^{(i)}) \right] \end{aligned}$$

This means: take the expectation, under the approximate posterior $q_{\phi}(z \mid x^{(i)})$, of the joint log-probability minus the approximate posterior log-probability. The expectation is not accidental: KL divergence itself is an expectation under $q_{\phi}(z \mid x)$.

Using the joint factorization:

$$\begin{aligned} p_{\theta}(x^{(i)}, z) = p_{\theta}(z)p_{\theta}(x^{(i)} \mid z) \end{aligned}$$

we can rewrite the ELBO in the most common VAE form:

$$\begin{aligned} \mathcal{L}(\theta, \phi; x^{(i)}) = - D_{\mathrm{KL}} \left( q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z) \right) + \mathbb{E}_{q_{\phi}(z \mid x^{(i)})} \left[ \log p_{\theta}(x^{(i)} \mid z) \right] \end{aligned}$$

This form directly matches the training intuition of VAE:

- $\mathbb{E}_{q_{\phi}(z \mid x^{(i)})}\left[\log p_{\theta}(x^{(i)} \mid z)\right]$ is the reconstruction term. It measures whether the latent variable $z$ inferred by the encoder can help the decoder explain or reconstruct $x^{(i)}$.

- $D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z)\right)$ is the regularization term. It prevents the approximate posterior from drifting too far away from the prior $p_{\theta}(z)$.

Thus maximizing the ELBO means doing two things at once: making $z$ useful for explaining $x$, while keeping the distribution of $z$ close to the prior. If the prior is the standard normal distribution $p(z)=\mathcal{N}(0,I)$, this encourages a more regular latent space, which makes sampling and generation easier.

{{< details summary="Derivation: from joint form to reconstruction term - KL term" >}}

Start from the joint form of the ELBO:

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x,z) - \log q_{\phi}(z \mid x)\right] \end{aligned}$$

Since:

$$\begin{aligned} \log p_{\theta}(x,z) = \log p_{\theta}(z) + \log p_{\theta}(x \mid z) \end{aligned}$$

we get:

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x \mid z)\right] + \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(z) - \log q_{\phi}(z \mid x)\right] \end{aligned}$$

The second term is the negative KL divergence:

$$\begin{aligned} \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(z) - \log q_{\phi}(z \mid x)\right] = -D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$

Therefore:

$$\begin{aligned} \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}\left[\log p_{\theta}(x \mid z)\right] - D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$

{{< /details >}}

At this point, one problem remains. We want to optimize both the generative parameters $\theta$ and the approximate posterior parameters $\phi$. The parameter $\theta$ appears in $p_{\theta}(x \mid z)$ and is relatively straightforward to handle with backpropagation. The difficult part is $\phi$, because it appears in the sampling distribution itself:

$$\begin{aligned} z \sim q_{\phi}(z \mid x^{(i)}) \end{aligned}$$

In other words, the expectation in the ELBO depends on a parameterized sampling process. A naive Monte Carlo gradient estimator can be written as:

$$\begin{aligned} \nabla_{\phi}\mathbb{E}_{q_{\phi}(z)}[f(z)] = \mathbb{E}_{q_{\phi}(z)}\left[f(z)\nabla_{\phi}\log q_{\phi}(z)\right] \end{aligned}$$

But this estimator usually has high variance and is not suitable for efficient training. This motivates the **reparameterization trick**: separate the randomness from the parameterized distribution, so that the sampling path becomes differentiable.

In summary, Section 2.2 turns the true objective into an optimizable objective:

$$\begin{aligned} \log p_{\theta}(x) \quad \longrightarrow \quad \mathcal{L}(\theta,\phi;x) = \mathbb{E}_{q_{\phi}(z \mid x)}[\log p_{\theta}(x \mid z)] - D_{\mathrm{KL}}\left(q_{\phi}(z \mid x) \middle\| p_{\theta}(z)\right) \end{aligned}$$

## The SGVB Estimator and AEVB Algorithm

The core intuition of VAE is that it learns two probabilistic mappings.

The first mapping goes from observed data to an approximate posterior over latent variables:

$$\begin{aligned} x \longrightarrow q_{\phi}(z \mid x) \end{aligned}$$

The second mapping goes from latent variables to a distribution over observed data:

$$\begin{aligned} z \longrightarrow p_{\theta}(x \mid z) \end{aligned}$$

So VAE learns:

$$\begin{aligned} x \longrightarrow q_{\phi}(z \mid x) \longrightarrow z \longrightarrow p_{\theta}(x \mid z) \end{aligned}$$

The encoder does not directly output a deterministic latent code. Instead, it outputs the parameters of a latent distribution. For example, with a Gaussian approximate posterior:

$$\begin{aligned} q_{\phi}(z \mid x) = \mathcal{N}\left(\mu_{\phi}(x), \sigma_{\phi}^{2}(x)\right) \end{aligned}$$

The encoder receives $x$ and outputs $\mu_{\phi}(x)$ and $\sigma_{\phi}(x)$. These parameters define the approximate posterior over $z$. We then sample $z$ from this distribution and pass it to the decoder to explain or generate $x$.

The issue is that writing:

$$\begin{aligned} z \sim q_{\phi}(z \mid x) \end{aligned}$$

makes the sampling process depend on $\phi$, and gradients cannot easily pass through random sampling. The reparameterization trick turns this untraceable sampling step into a differentiable path. In the Gaussian case:

$$\begin{aligned} \epsilon \sim \mathcal{N}(0,I), \qquad z = \mu_{\phi}(x) + \sigma_{\phi}(x)\odot\epsilon \end{aligned}$$

The randomness now comes from the fixed noise $\epsilon$, while $\mu_{\phi}(x)$ and $\sigma_{\phi}(x)$ are still produced by the encoder. Thus $z$ still depends on $\phi$, but the dependence becomes a deterministic differentiable function:

$$\begin{aligned} z = g_{\phi}(\epsilon,x) \end{aligned}$$

The paper then applies this form to Monte Carlo estimation of the ELBO. For any function $f(z)$, an expectation with respect to $q_{\phi}(z \mid x)$ can be rewritten as:

$$\begin{aligned} \mathbb{E}_{q_{\phi}(z \mid x^{(i)})}[f(z)] = \mathbb{E}_{p(\epsilon)}\left[f(g_{\phi}(\epsilon,x^{(i)}))\right] \end{aligned}$$

Then it can be approximated by samples:

$$\begin{aligned} \mathbb{E}_{p(\epsilon)}\left[f(g_{\phi}(\epsilon,x^{(i)}))\right] \simeq \frac{1}{L}\sum_{l=1}^{L} f(g_{\phi}(\epsilon^{(l)},x^{(i)})), \qquad \epsilon^{(l)} \sim p(\epsilon) \end{aligned}$$

Substituting this trick into the ELBO gives the generic SGVB estimator:

$$\begin{aligned} \tilde{\mathcal{L}}^{A}(\theta,\phi;x^{(i)}) = \frac{1}{L}\sum_{l=1}^{L}\left[\log p_{\theta}(x^{(i)},z^{(i,l)}) - \log q_{\phi}(z^{(i,l)} \mid x^{(i)})\right] \end{aligned}$$

where:

$$\begin{aligned} z^{(i,l)} = g_{\phi}(\epsilon^{(i,l)},x^{(i)}), \qquad \epsilon^{(i,l)} \sim p(\epsilon) \end{aligned}$$

If the KL term can be computed analytically, the paper gives a more common estimator, usually with lower variance:

$$\begin{aligned} \tilde{\mathcal{L}}^{B}(\theta,\phi;x^{(i)}) = -D_{\mathrm{KL}}\left(q_{\phi}(z \mid x^{(i)}) \middle\| p_{\theta}(z)\right) + \frac{1}{L}\sum_{l=1}^{L}\log p_{\theta}(x^{(i)} \mid z^{(i,l)}) \end{aligned}$$

This matches the training intuition of VAE: the first term is the KL regularizer, and the second is the sampled reconstruction term.

For the full dataset, training uses minibatches rather than the entire dataset each time:

$$\begin{aligned} \mathcal{L}(\theta,\phi;X) \simeq \tilde{\mathcal{L}}^{M}(\theta,\phi;X^{M}) = \frac{N}{M}\sum_{i=1}^{M}\tilde{\mathcal{L}}(\theta,\phi;x^{(i)}) \end{aligned}$$

where $X^{M}$ is a minibatch of $M$ samples drawn from the full dataset $X$.

Algorithm 1 can be understood as the following training loop:

1. Initialize encoder parameters $\phi$ and decoder parameters $\theta$.
2. Draw a minibatch $X^{M}$ from the dataset.
3. Sample noise $\epsilon$ from the fixed distribution $p(\epsilon)$.
4. Use $z=g_{\phi}(\epsilon,x)$ to obtain latent samples.
5. Estimate the ELBO and its gradients using the SGVB estimator.
6. Update $\theta,\phi$ using SGD, Adagrad, Adam, or another optimizer.
7. Repeat until convergence.

After training, we obtain:

- encoder: $q_{\phi}(z \mid x)$, used to infer latent distributions from data;
- decoder: $p_{\theta}(x \mid z)$, used to generate or reconstruct data from latent variables.

## The Reparameterization Trick

Section 2.4 further discusses the scope of the reparameterization trick. Gaussian distributions are only the most common example. Similar transformations can be constructed for distributions with tractable inverse CDFs, location-scale families, and distributions that can be composed from other random variables. Therefore, the core of the reparameterization trick is not that the latent variable must be Gaussian, but whether the sampling process can be rewritten as fixed noise passed through a differentiable transformation.

Next note: [Generative Models Part 1-2: A Minimal Variational Autoencoder Reproduction](/en/notes/笔记-生成模型1-2-variationalautoencoder的最小复现/).
