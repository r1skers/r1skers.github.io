---
date: '2025-12-19T14:17:00+09:00'
draft: false
title: '[Tempering] Self-Debugging My Place in the Embedded Stack'
summary: "A self-debugging record: I used engineering stress tests to resolve my confusion about where I fit in the embedded stack. I confirmed that instead of obsessing over bottom-layer registers, I’m strongest in the middle layer—where data flow, validation, and embedded algorithms live."
tags: ["Learning Notes", "Embedded Systems", "System Integration",  "STM32"]
categories: ["Sparks"]
---

# Why I Wrote This

I used to study by *controlling* things: if I learned a concept, I wanted to own it end-to-end—the definition, the math, the mechanism, and the edge cases. That approach works in exams.

Embedded systems broke it.

Even something as small as `HAL_GPIO_ReadPin()` can lead to a rabbit hole of registers, bus addresses, and bit masking. The moment I tried to fully “dominate” every layer of code I touched, I realized the stack is too wide. If I insisted on full control, I would never finish any real system.

This post is my attempt to debug *that*—not my firmware, but my mindset.

# The Question: Where Do I Actually Fit?

I enjoy the moment when a system becomes *connected*: Python scripts talking to STM32, data flowing out of the physical world into a plot on my laptop. That feeling is very different from memorizing register maps.

So I asked a practical question:
**Am I avoiding hard problems, or am I simply better suited to a different layer of the stack?**

# The Method: An External Stress Test

I asked **Gemini** to act as an *external architecture reviewer*, not a code generator. The goal was to turn vague anxiety into **testable scenarios**.

I placed myself in three hypothetical engineering crises. My natural reactions defined my niche.

### The Simulation Results: 3 Critical Choices

| Scenario | The "Hard" Path (Bottom-layer focus) | My Instinct (Middle Layer: Data Flow & Algorithms) |
| :--- | :--- | :--- |
| **1. The Jittery Motor** | Hook up an oscilloscope to check nanosecond timing and interrupts. | **Isolate variables first, then check the PID logic & software filters.** |
| **2. Low RAM Crisis** | Hand-optimize assembly and use bit-fields to save bytes. | **Focus on UI logic & data visualization (making data human-readable).** |
| **3. Algorithm Validation** | Build a complex hardware-in-the-loop test rig with signal generators. | **Build a Python pipeline to inject audio and "see" the internal data flow.** |



# Results: The Pattern in My Moves

Across all scenarios, a clear pattern emerged. My instincts consistently point to the **middle layer**:

- I prefer **system-level isolation** over electrical diagnosis.
- I enjoy transforming raw signals into **meaning** (features, plots, decisions).
- I like building “God-view” pipelines (PC tools that inspect internal states).

This does *not* mean I dislike hardware. It means my leverage comes from the layer where hardware becomes data.

# My Current Model: The “Sandwich” Theory

Thinking of embedded systems as a sandwich helped me stop blaming myself.

- **Bottom Bun (BSP/Drivers):** Registers, timing, buses. Necessary, but easy to drown in.
- **Top Bun (Cloud/App):** Pure software, far from the physical world.
- **Meat (My Niche):** **Embedded Algorithms & Application Logic.**

This is where raw physical data is cleaned, interpreted, and turned into behavior.
My goal isn’t “master every bit shift.”
My goal is “master the data flow.”

# What the Stress Test Actually Covered: The 8-Question Diagnosis

To validate my positioning, Gemini acted as a strict interviewer, throwing 8 specific "Gotcha" questions at me across three rounds.

I recorded my immediate **"Instinct"** (how I thought about it) versus the **"Standard Answer"** (what the textbook says). The gap between them revealed my true ecological niche.

## Round 1: Engineering Intuition (System vs. Physics)
*Testing if I think about the signal's behavior or the electron's movement.*

| Scenario | My Instinct (Middle-layer View) | The Standard Answer (Bottom-layer Reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **1. The Shaking Ghost**<br>(ADC readings fluctuate, LED flickers) | "The data is dirty. I should send it to the PC to analyze the noise pattern, or add a logic filter." | **Moving Average Filter.** Calculate the average of N samples to smooth out hardware noise. | **Pass.** I intuitively understood signal processing, even if I didn't name the specific filter. |
| **2. The Cost of Precision**<br>(High PWM frequency = Jerky dimming) | "It feels like the counter implies a trade-off. Fast speed means fewer steps available." | **Resolution vs. Frequency.** Higher frequency reduces the period count (ARR), lowering the resolution. | **Pass.** I grasped the physical trade-off: you can't have both speed and smoothness without infinite clock. |
| **3. Fatal Deadlock**<br>(How to multitask while `HAL_Delay` blocks?) | "I need a check loop inside the delay? Or a parallel structure?" | **Non-blocking Architecture.** Abandon `HAL_Delay`. Use `HAL_GetTick()` to schedule tasks based on timestamps. | **Pass.** I recognized the need for concurrency, even if I forgot the specific API. |

## Round 2: The "Killer Moves" (Coding & Data)
*Testing if I can solve problems that sit on the boundary of software and hardware.*

| Scenario | My Instinct (Middle-layer View) | The Standard Answer (Bottom-layer Reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **4. The Disappearing Flag**<br>(`while(flag)` loop never exits despite ISR) | "I guess it's similar to `volatile`? The variable isn't updating in the loop's view." | **Compiler Optimization.** The compiler caches the variable. You must use `volatile` to force RAM reads. | **Pass.** I didn't just memorize the keyword; I understood the *mechanism* of the bug. |
| **5. Disordered Bytes**<br>(STM32 sends 2000, Python sees 53255) | "I forgot the term, but in Python code, I always use `<H` in `struct` to fix it." | **Endianness (Little-Endian).** Low byte is sent first. The `<` symbol explicitly handles this order. | **High Pass.** My muscle memory (coding habit) proved more useful than rote memorization. |

## Round 3: The Boundaries (The "Survival Kit")
*Testing knowledge of low-level hardware constraints. I failed these, but learned where my limits are.*

| Scenario | My Instinct (Middle-layer View) | The Standard Answer (Bottom-layer Reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **6. Stuck Delay**<br>(System freezes when `HAL_Delay` is in ISR) | "Is it a conflict between receiving data and lighting the LED?" | **Priority Deadlock.** `HAL_Delay` depends on SysTick. If ISR priority > SysTick, the timer never ticks. | **Gap Identified.** I need to be careful with Interrupt Priorities. |
| **7. Misplaced Address**<br>(I2C Address 0x68 fails) | "Is it related to the binary sign bit?" | **Bit Shifting.** In many STM32 HAL call patterns, the 7-bit datasheet address is shifted left (<< 1) to make room for the R/W bit—always check what the specific API expects. | **Gap Identified.** Datasheet addresses are not always Code addresses. |
| **8. Exploding Stack**<br>(20KB array crashes 32KB RAM chip) | "Runtime error? Maybe the chip is broken?" | **Stack Overflow.** Large local variables go on the Stack (often small by default). Large buffers should live in static/global storage (or be allocated carefully). | **Gap Identified.** Large data must be `static` or global. |

### Summary of the Test
The results were clear:
1.  **I have strong intuition** for system logic and data processing (Rounds 1 & 2).
2.  **I have gaps** in specific hardware constraints (Round 3).

This confirms my "Sandwich" theory: I should focus on the middle layer, while keeping a "Survival Checklist" for the bottom layer to avoid those specific pitfalls.
