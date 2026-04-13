---
date: '2025-12-19T14:17:00+09:00'
draft: false
title: '[Tempering] Self-Debugging My Place in the Embedded Stack'
summary: "A self-debugging record: I used engineering stress tests to resolve my confusion about where I fit in the embedded stack. I confirmed that instead of obsessing over bottom-layer registers, I’m strongest in the middle layer—where data flow, validation, and embedded algorithms live."
description: "Not debugging firmware this time, but debugging where I fit in the embedded stack."
tags: ["Learning Notes", "Embedded Systems", "System Integration", "STM32"]
categories: ["Sparks"]
---

# Why I Wrote This

I used to study by trying to control everything: if I learned a concept, I wanted to own the definition, the math, the mechanism, and the edge cases all at once. That works well for exams.

Embedded systems interrupted that habit.

Even something as small as `HAL_GPIO_ReadPin()` can open a rabbit hole of registers, bus addresses, and bit operations. The moment I tried to completely dominate every layer of code I touched, I realized the stack is too wide. If I insisted on that level of control, I would never finish a real system.

So this post is really about debugging my mindset rather than my firmware.

# The Question: Which Layer Actually Fits Me?

What I genuinely enjoy is the moment when a system becomes connected: Python scripts talk to STM32, data flows out of the physical world and into plots and decisions on my laptop. That feeling is very different from memorizing register maps.

So I asked myself a more practical question:

**Am I avoiding hard problems, or am I simply better suited to another layer of the stack?**

# The Method: An External Stress Test

I asked **Gemini** to act as an external architecture reviewer rather than a code generator. The goal was not to get answers from it, but to turn vague anxiety into situations I could observe.

I placed myself in three hypothetical engineering crises and watched where my first instinct went.

### Simulation Results: Three Critical Choices

| Scenario | The “Harder” Path (Bottom-layer focus) | My Instinct (Middle layer: Data Flow and Algorithms) |
| :--- | :--- | :--- |
| **1. The Jittery Motor** | Hook up an oscilloscope and stare at nanosecond timing and interrupts. | **Isolate variables first, then inspect PID logic and software filtering.** |
| **2. Low RAM Crisis** | Hand-optimize assembly and squeeze bytes with bit-fields. | **I would rather optimize UI logic and data visualization.** |
| **3. Algorithm Validation** | Build a complex hardware-in-the-loop setup. | **I would rather build a Python pipeline and inspect the internal data flow.** |

# Results: The Pattern in My Moves

Once I looked at these scenarios together, the pattern was obvious.

My instinct kept pointing toward the **middle layer**:

- I prefer **system-level isolation** over electrical-level diagnosis.
- I like turning raw signals into **meaning**, such as features, plots, and decisions.
- I enjoy building “God-view” debugging pipelines, meaning PC-side tools that expose internal system states.

That does not mean I dislike hardware. It means my leverage is not at the very bottom layer, but at the layer where hardware starts becoming data.

# My Current Model: The “Sandwich” Theory

Thinking of embedded systems as a sandwich actually helped me stop blaming myself.

- **Bottom bun (BSP / Drivers):** registers, timing, buses. Necessary, but easy to drown in.
- **Top bun (Cloud / App):** pure software, farther away from the physical world.
- **The meat (my layer):** **embedded algorithms and application logic.**

This is the layer where raw physical data gets cleaned, interpreted, and turned into system behavior.

My goal is not necessarily to master every bit shift.
It is closer to mastering the data flow.

# What the Stress Test Really Measured: Eight Diagnostic Questions

To validate this more seriously, Gemini later acted like a strict interviewer and threw eight specific gotcha questions at me in three rounds.

I compared my immediate **instinct** with a more standard **textbook answer**. What that revealed was not just whether I could answer, but which layer I naturally use to interpret problems.

## Round 1: Engineering Intuition (System View or Physical View)

| Scenario | My Instinct (Middle-layer view) | Standard Answer (Bottom-layer reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **1. The Shaking Ghost**<br>(ADC readings fluctuate and the LED flickers) | “The data is dirty. Send it to the PC, look at the noise shape, or add a logic filter.” | **Moving Average Filter.** Average N samples to smooth hardware noise. | **Pass.** I did not name the filter immediately, but I instinctively moved toward signal processing. |
| **2. The Cost of Precision**<br>(PWM dimming becomes jerky at high frequency) | “There must be a tradeoff in the counter. If the frequency goes up, the available steps go down.” | **Resolution vs. Frequency.** Higher frequency reduces the period count, so ARR resolution also drops. | **Pass.** I caught the core physical tradeoff. |
| **3. Fatal Blocking**<br>(How do you multitask while `HAL_Delay` blocks?) | “Maybe I need a check loop inside the delay, or some parallel structure?” | **Non-blocking Architecture.** Give up `HAL_Delay` and schedule tasks with `HAL_GetTick()`. | **Pass.** I did not recall the API immediately, but I recognized the concurrency issue. |

## Round 2: The Real Killer Questions (Boundary of Code and Data)

| Scenario | My Instinct (Middle-layer view) | Standard Answer (Bottom-layer reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **4. The Disappearing Flag**<br>(ISR changes `flag`, but `while(flag)` never exits) | “This sounds like `volatile`. The loop is not seeing the updated value.” | **Compiler Optimization.** The variable is cached, so `volatile` is required to force RAM reads. | **Pass.** I was not just reciting the keyword; I guessed the bug mechanism. |
| **5. Disordered Bytes**<br>(STM32 sends 2000, Python receives 53255) | “I cannot recall the exact term, but I always use `<H` in Python to pin it down.” | **Endianness.** In little-endian order the low byte comes first, and `<` makes that explicit. | **High Pass.** In this case, muscle memory was more useful than rote memory. |

## Round 3: Boundary Conditions (The Bottom-layer Survival Kit)

| Scenario | My Instinct (Middle-layer view) | Standard Answer (Bottom-layer reality) | Verdict |
| :--- | :--- | :--- | :--- |
| **6. Frozen Delay**<br>(Calling `HAL_Delay` inside an ISR freezes the system) | “Is it a conflict between receiving data and lighting the LED?” | **Priority Deadlock.** `HAL_Delay` depends on SysTick, and if ISR priority is higher than SysTick, the timer never advances. | **Gap Identified.** I need to be more careful with interrupt-priority issues. |
| **7. Misaligned Address**<br>(The I2C datasheet says 0x68, but the code still fails) | “Could it be something related to a binary sign bit?” | **Bit Shift.** Many STM32 HAL call patterns expect the 7-bit address to be shifted left by one to make room for the R/W bit. | **Gap Identified.** Datasheet addresses and code addresses are not always the same thing. |
| **8. Stack Explosion**<br>(A 20KB array crashes on a chip with 32KB RAM) | “A runtime error? Is the chip broken?” | **Stack Overflow.** Large local arrays go on the stack by default, so large buffers should live in `static` or global storage. | **Gap Identified.** Big data structures cannot be dropped into local variables casually. |

### What the Test Told Me

The conclusion was actually pretty clear:

1. My intuition is relatively strong in system logic and data-processing problems.
2. I still have obvious gaps in certain low-level hardware constraints.

That lines up with the sandwich model very well: I should focus on the middle layer while carrying a bottom-layer survival checklist, so I stop losing time to the same traps.
