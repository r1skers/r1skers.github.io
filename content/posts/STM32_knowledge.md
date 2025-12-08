---
date: '2025-12-04T20:30:00+09:00'
lastmod: '2025-12-04T20:30:00+09:00' 
draft: false
title: '[The Crucible] Embedded C Chronicles: Traps, Idioms, and Best Practices'
summary: "A living collection of engineering wisdom and lessons learned from STM32 development. Covering topics from timer overflows to memory management."
tags: ["Embedded C", "STM32", "Best Practices", "Debugging"]
categories: ["The Crucible"]
math: true
---

> **Note:** This is a living document. New entries will be appended as I encounter more interesting challenges in the world of Embedded Systems.

## Entry 0x01: Surviving the Timer Overflow (The Magic of Two's Complement)

**Date:** 2025-12-04

### Delay

Here is the HAL_Delay function's defination:

```C
_weak void HAL_Delay(uint32_t Delay)
{
  uint32_t tickstart = HAL_GetTick();
  uint32_t wait = Delay;

  /* Add a freq to guarantee minimum wait */
  if (wait < HAL_MAX_DELAY)
  {
    wait += (uint32_t)(uwTickFreq);
  }

  while ((HAL_GetTick() - tickstart) < wait)
  {
  }
}
```

**if zone: The "Minimum Wait" Guarantee & Defensive Safety**<p>
This block serves two critical purposes: Precision and Safety.<p>
1.  Compensation for Discrete Time (Precision):<p>
HAL_GetTick() is discrete. If you request a 1ms delay, but the SysTick timer is just about to roll over (e.g., 99% through the current tick), your delay might effectively become nearly 0ms.<p>
The Fix: By adding uwTickFreq (usually 1 tick), the function enforces a "ceil" operation. It guarantees that the delay is at least the requested duration, preventing timing violations in sensitive peripherals.<p>
2.  Defensive Programming (Safety):<p>
Why check if (wait < HAL_MAX_DELAY)?<p>
If Delay is already the maximum value (0xFFFFFFFF), adding uwTickFreq would cause an integer overflow, rolling wait back to a small number (e.g., 0).<p>
This would cause the subsequent while loop to exit immediately, resulting in zero delay. This check prevents that catastrophic logic error.<p>

**while zone: The Magic of Modular Arithmetic**<p>
This is the core implementation of the non-blocking logic discussed earlier, relying entirely on Two's Complement.<p>
1.  The Pattern: (Current - Start) < Wait<p>
If $Start + Wait$ overflows, the condition breaks.<p>
By calculating the difference (Current - Start), we utilize the circular nature of unsigned integers.<p>
2.  The Overflow Case:<p>
Imagine Start = 0xFFFFFFF0 and Current = 0x00000005 (Overflowed).<p>
In uint32_t arithmetic: 0x00000005 - 0xFFFFFFF0 results in 0x00000015 (Decimal 21).<p>
The result represents the true elapsed time, making the logic robust against counter rollovers without any extra if-else branching.<p>