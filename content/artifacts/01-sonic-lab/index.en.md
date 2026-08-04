---
date: '2026-01-08T00:00:00+09:00'
draft: false
title: "[Artifact-1] Sonic Lab Development Log"
summary: "A long-running development log for Sonic Lab, focused on the embedded data path, PC-side analysis loop, and iterative validation checkpoints."
description: "Artifact-1 summary page for Sonic Lab: end-to-end acoustic anomaly detection experiments, checkpoints, and implementation records."
tags: ["Systems", "STM32", "Signal & Systems"]
categories: ["Artifacts"]
series: ["Embedded Systems"]
weight: 10
---

## Scope

This page serves as the long-running engineering log for Sonic Lab.  
It records the path from MCU-side framing and transport, to PC-side decoding, buffering, state estimation, plotting, and later experiment refinement.

## What This Artifact Tracks

- Embedded-side framing and scenario synthesis
- PC-side RX, ring buffer, and state machine loop
- Sliding-window analysis and mismatch inspection
- Repeated validation against noisy and overlapping acoustic events

## Main Development Thread

The current mainline is the end-to-end pipeline:

`serial RX -> framing -> decode -> ring buffer -> state machine -> plotting`

On the MCU side, the project keeps a synthetic acoustic scenario generator plus an OLED state display.  
On the PC side, the pipeline keeps receiving, decoding, buffering, classifying, and optionally visualizing the stream.

## Recent Checkpoints

- **01.08**: restarted the clean log and stabilized the full RX-to-state pipeline.
- **01.09**: refined the PC-only loop, aligned analysis windows to event timing, and improved mismatch export.
- **01.10**: moved mini-sweep from fixed event windows to sliding-window scanning.
- **01.11**: finished a PC-only sweep milestone and recorded the clean-vs-low-SNR behavior of RMS plus whistle-ratio features.

## Current Reading

At the moment, the project is best understood as a reliability-oriented acoustic pipeline rather than a finished product.  
Its value here is not a polished final detector, but a clear record of how transport, framing, features, and validation were gradually connected.

## Linked Pages

- Parent: [Artifacts](/en/artifacts/)
