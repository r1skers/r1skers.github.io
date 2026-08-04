---
title: "Topic Dossier: Variational Autoencoders"
description: "A single loop connecting probabilistic modeling, the ELBO derivation, minimal reproduction, and convolutional extensions."
summary: "A reading path from latent-variable models and variational bounds to MLP-VAE and CNN-VAE."
categories: ["Notes"]
tags: ["Machine Learning", "Generative Models", "VAE"]
series: ["Variational Autoencoders"]
note_kind: "topic-index"
---

The three existing VAE notes are not parallel topics. They are successive stages of the same problem: define the objective, turn it into code, and then change the image-modeling architecture.

## 1. Principle

[The basic idea of VAE and the ELBO derivation](/en/notes/ml/generative-models/note-ml-gen-1-vae-elbo/) begins with an intractable marginal likelihood and introduces the approximate posterior, ELBO, and reparameterization trick.

The probability-side interface is [Likelihood, MLE, MAP, Intervals, Tests, and EM](/notes/math/probability/note-prob-5-statistical-inference-em/), which connects latent-variable models, the ELBO identity, and EM.

## 2. Minimal closed loop

[A minimal VAE reproduction](/en/notes/ml/generative-models/note-ml-gen-2-vae-minimal/) maps the encoder, reparameterization, decoder, and negative ELBO to PyTorch and checks the model through latent-dimension and two-dimensional latent-space experiments.

## 3. Architectural extension

[CNN-VAE: From MLP to convolution](/en/notes/ml/generative-models/note-ml-gen-3-cnn-vae/) keeps the probabilistic objective fixed while changing the inductive bias of the encoder and decoder.

A later editorial pass can merge the principle and minimal reproduction into one complete chapter while retaining CNN-VAE as an extension. This dossier provides that unified reading path without changing existing URLs.
