---
date: '2025-12-19T14:17:00+09:00'
draft: false
title: '[Tempering] Self-Debugging My Place in the Embedded Stack'
summary: "This is a self-debugging learning record: Starting from the anxiety of wanting to control every line of underlying details, I used the engineering-oriented stress test questions provided by Gemini to verify my embedded intuition and preferences. I confirmed that I am more suited to take the middle-layer path of data flow/algorithms/system integration and clarified the underlying survival skills that need to be supplemented next."
tags: ["Learning Notes", "Embedded Systems", "System Integration", "Debugging", "Signal Processing", "STM32", "Gemini"]
categories: ["Tempering"]
---

# Anxiety and Conflict

**Anxiety:**  As a student, to achieve high scores in exams, I’ve been trained to learn subjects deeply. For instance, it’s not enough to merely memorize the definition of Fourier Transform; I must understand the underlying math, how the transform works, and exactly when to use it. I call this "**Controlling**." It feels like I need to possess these tools completely to dominate the problem.

However, after diving into embedded systems, I found that maintaining this level of "control" is difficult—perhaps impossible.

Take **HAL_GPIO_ReadPin** as a simple example. We all know its function: to read the electrical level of a pin. We all know how to call it. But the moment I tried to control this knowledge—to bring this function completely under my domination by understanding its every internal detail—I hit a wall.

I clicked "Go to Definition," expecting simple logic, but was greeted by a labyrinth of register mappings, memory addresses, and bitwise operations like (**GPIOx->IDR & GPIO_Pin**). Suddenly, one question spawned ten more: Why is it masked this way? How does the bus matrix handle this address?

I realized that if I spent hours dissecting such a trivial function, I would never finish my project. This triggered a profound anxiety: **there is an ocean of low-level logic out there, and I am drowning in it because I can no longer "dominate" every single line of code I use**.

***

**Conflict:** These mounting anxieties forced me to confront a hard question: Where does my passion actually lie? Do I really want to dedicate my life to ECE, or am I just drowning in details?

To find the answer, I rewound my memory, looking for the sparks that kept me going. I realized my joy didn't come from memorizing registers. The most exciting moment was when I built a bridge: using Python to talk to the STM32 via UART and watching the data flow between the digital and physical worlds.

This realization only deepened the conflict. If system integration and signal analysis are what I love, is it a waste of time to bury myself in the bottomless pit of underlying logic? Should I pivot towards the intersection of multiple disciplines instead?

I was standing at a crossroads, torn between the engineer I thought I should be, and the architect I wanted to be.


# Relocation
So—where am I in the stack, and where should I go next? I was lost in the fog, so I did what any engineer would do when stuck: I sought an external perspective. I turned to Gemini.

I treated Gemini as an “external architecture reviewer / interviewer” rather than a code generator. Its job wasn’t to give me solutions, but to translate my anxiety into testable questions—and pull what I truly enjoy and what I’m actually good at from the emotional layer back into the engineering layer. In other words, it helped me set up a test bench: I just had to put my honest first reactions on it, and the results would reveal a direction.

## The Simulation
**Scenario 1: The Jittery Motor** The Setup: My sound-controlled motor is stuttering. It’s not running smoothly. Two paths lie before me:

Path A: Grab an oscilloscope, hook up the PWM pin, check for nanosecond-level timing errors, or dig into interrupt priorities.

Path B: Plot the PID error curve on a laptop, check for parameter overshooting, or design a software filter.

My Instinct: I realized I wouldn't rush to Path A. In fact, my first reaction (Plan C) was to use a "Control Variable" approach—flash a known working program to isolate the problem. If it was a software issue, I would firmly choose Path B. I prefer diagnosing the system logic over diagnosing the electrical signal.

**Scenario 2: The Memory Crisis** The Setup: The boss wants to add an OLED display, but the STM32 has only 2KB of RAM left.

Path A (The Optimizer): Hand-write SPI drivers, replace HAL libraries with register operations, and use bit-fields to squeeze every byte.

Path B (The Designer): Ask for a working driver interface and focus on designing the UI logic—how the FFT spectrum translates into user-friendly icons.

My Instinct: Without hesitation, Path B. I find no joy in the Tetris-game of memory compression. My excitement comes from transforming raw data into human-readable information (Visualization).

**Scenario 3: The Algorithm Validation** The Setup: Validating a glass-breaking detection algorithm.

Path A (Hardware-in-Loop): Build a complex circuit, input waveforms via a signal generator, and debug step-by-step with J-Link.

Path B (Data Flow): Write a Python script to inject recorded audio via UART, retrieve the intermediate features from the MCU, and compare the waveforms on my PC screen.

My Instinct: Path B. I realized I love the "God Mode" perspective—using Python to peer inside the chip's logic flow, rather than probing its physical pins.

## The Conclusion: The "Sandwich" Theory
Analyzing these choices, the fog of anxiety lifted. I realized I was trying to force myself into the wrong layer of the stack. If an embedded system is a sandwich, I had been obsessing over the wrong ingredients.

The Bottom Bun (BSP/Drivers): This is the world of registers, timing, and pure hardware. This is where my anxiety came from. This is not my battlefield.

The Top Bun (Cloud/App): This is pure software and databases, far removed from the physical world.

The Meat Patty (My Niche): Embedded Algorithms & Application.

My value—and my passion—lies in the middle. I am the translator who takes raw physical data (from the bottom), processes it with math and logic (the meat), and delivers meaningful insights (to the top).

I am not failing at being a "Hardware Engineer"; I am succeeding at being an Edge AI Engineer. My goal isn't to be a master of ReadPin bit-shifting, but to be a master of Data Flow Logic.

# Intuition Test 1 - Seeking Approval

I asked Gemini to continue playing the role of a "stress tester": it wouldn't teach me to memorize knowledge points, but instead force me to make choices using productized scenarios—would I first look at the waveform, first modify the parameters, or first check the data flow? What I wanted to verify was not "whether I can do it" but "where I would go first."

## Question 1: The Shaking Ghost (Signal Processing and Stability)
**Scenario:** You have turned this system into a product and sold it to a customer. The customer complains: "When I look at that light, it's not just breathing; sometimes it flickers for no reason, or the rhythm of the breathing suddenly goes haywire."

**Diagnosis:** You take the product back, connect an oscilloscope to check the potentiometer voltage. You find that even though you don't touch it, due to power supply ripple or environmental electromagnetic interference, the values read back by the ADC are fluctuating wildly: 2048 -> 2055 -> 2030 -> 2048. This causes your breath_speed_delay, that is, the breathing speed, to change drastically at the millisecond level.

**Exam Question:** You cannot replace the hardware (cost is locked). Please provide the simplest solution at the software level to eliminate this "jitter" and make the breathing speed smooth? (Hint: You now have a bunch of dirty data; how to clean it up?)

**My Answer:** Send the signal to the computer for further analysis, Update the algorithm to remove noise.

**True Answer:** Don't use it after reading it once. We need to read it 10 times, add up these 10 readings, divide by 10, and use this average to control the breathing light. If there is a sudden "noise" in one of the readings (for example, suddenly reading 4095), it will be smoothed out by the other 9 normal values, making the breathing light as smooth as silk.

## Question 2: The Cost of Precision (In-depth Understanding of PWM Principles)
**Scenario:** Your current PWM settings are as follows:
- ARR (period) = 999 (which means it is divided into 1000 parts).
- Frequency = 1kHz.

Now, the boss thinks that 1kHz is too low and is worried about noise, so he asks you to increase the frequency to **100kHz** (100 times higher). You confidently **change the ARR to 9** .

**Exam Question:** The frequency has indeed become 100kHz, but the "breathing" effect of the lamp suddenly **becomes very jerky, stuttering, and even like a step. Please tell me why increasing the frequency sacrifices the "smoothness"? What is the mathematical relationship here?**

**My Answer:** My understanding is the issue of the proportion of CCR.

**True Answer:** The frequency and resolution of PWM are mutually exclusive. The higher the frequency, the fewer the number of segments you can divide. Want it to be smooth? You have to appropriately reduce the frequency or increase the main frequency (such as replacing it with a faster chip).


## Question 3: Fatal Deadlock (System Architecture and Blocking)
**Scenario:** This question is the entry threshold for architects. In your current code logic, you use HAL_Delay(breath_speed_delay). This breath_speed_delay changes with the potentiometer and can reach a maximum of 20ms or even more. And in one breathing cycle, you call this Delay 200 times. This means that during one breathing cycle, the CPU spends several seconds just **waiting idly**.

Now, I need to add an **"emergency button"**. Requirement: As soon as I press the button, the light turns off immediately, right away, instantly.

**Exam Question:** If your current code is executing HAL_Delay(20), you cannot respond to the button instantly (unless using an interrupt, but assuming the button has severe jitter, we don't want to use an interrupt). **If interrupts are not allowed, how should you modify your while(1) structure to achieve "both smooth breathing and real-time button detection"?** (Hint: Abandon for loops and HAL_Delay. Think about how to use "timestamps".)

**My Answer:** Add another while loop inside for detection.

**True Answer:** Abandon Delay and learn to look at the "watch". We need to utilize a "system tick time" (HAL_GetTick()) inside the STM32.


The prototype of **the operating system (RTOS):**
```c
uint32_t last_time = 0;

while(1) {
    // 1. 实时检测按钮（不管呼吸到哪一步，我每一圈都查）
    if(HAL_GPIO_ReadPin(BUTTON_PIN) == PRESS) {
        TurnOffLight();
    }

    // 2. 处理呼吸逻辑（非阻塞！）
    // 只有当“当前时间”比“上次动的时间”过了 10ms，我才动一下
    if(HAL_GetTick() - last_time >= 10) {
        ChangeBrightness(); // 改变 CCR
        last_time = HAL_GetTick(); // 更新时间戳
    }
    
    // 这里的循环跑得飞快，每秒可能跑几十万次，按钮绝对灵敏！
}
```

## Summary (What Gemini helped me validate)
These first three questions weren’t really about APIs—they were about instincts. Gemini’s scenarios pinned down three core engineering habits: clean dirty inputs (simple averaging / filtering), understand PWM’s hard constraint (frequency vs. resolution), and avoid blocking structures when real-time responsiveness matters (tick-based scheduling instead of `HAL_Delay`).  

My first reaction often leaned toward “observe the data flow from above” (PC plots, curves, intermediate signals). That doesn’t mean I’m avoiding hardware—it means my natural strength is *system behavior* and *data-driven debugging*. Gemini’s “true answers” turned that intuition into concrete, minimal, implementable actions. As a sophomore, that’s encouraging: my instincts are usable, not imaginary—they can already translate into maintainable embedded structure.

# Intuition Test 2 - Problem Localization

## Question 4: The Disappearing Flag Bit (A Battle Between C Language and the Compiler)

**Scenario:** You are working on a simple function: when a button is pressed, the LED in the main loop turns off. You wrote an Interrupt Service Routine (ISR) to detect the button press, using a global variable int flag = 0; as a flag.

The code logic is as follows:
1. Global variable: int flag = 0;
2. Interrupt function (ISR): When the button is pressed, execute flag = 1;
3. Main function (main):
```C
while(1)
{
    if (flag == 1) 
    {
        TurnOffLED(); // Turn off the light
        break;        // Exit the loop
    }
}
```
**Crisis:** You burn the code into the device, press the button, but the light just won't turn off. You use the Debugger to pause and check, and find that the flag in the memory is clearly 1! However, the while loop just doesn't enter the if statement, as if it's turning a blind eye.

**Exam Question:** Why can't the main loop "see" this variable that has been modified by the interrupt? (Hint: The compiler is very smart. It thinks that no one is modifying the flag in this while loop. What "overly clever" optimization will it perform? And what keyword do you need to add to "slap" the compiler?)

**My Answer:** I guess it's similar to volatile.

**True Answer:** **The role of volatile:** It's equivalent to sticking a note on the forehead of flag, telling the compiler: "Don't be smart! This variable may be modified at any time (by interrupts/hardware), and every time you must honestly read it from the memory!"

## Question 5: Disordered Bytes (Communication Protocols and Data Structures)
**Scenario:** You need to send the ADC voltage collected by STM32 (which is a uint16_t type, for example, the value is 2000, and its hexadecimal is 0x07D0) to Python via a serial port for plotting.

You call the function: **HAL_UART_Transmit(&huart1, &adc_value, 2, 10)**; (sending 2 bytes).

**Crisis:** You receive 2 bytes on the Python side.
• What STM32 sends: **0x07** and **0xD0**.
• The byte order received by Python is: **b'\xD0\x07'**.
• If Python directly combines them into **0xD007**, the calculated decimal value is **53255**! This is vastly different from the original **2000**.

**Examination Questions:**
1. What is this phenomenon called? (If you don't know the name, describing the principle is also acceptable.)
2. As an architect, without modifying the STM32 code (assuming it is fixed firmware), how would you restore this "out-of-order" data to the correct value of 2000 on the Python side?

**My Answer:** I really forgot the name, but when I say this, you should know that I know,"<H"

**True Answer:** 

You said: "I forgot the name, but I know <h". This move is a killer!

Your intuition: Knowing that the data is pieced together section by section, and the order may be reversed. Knowing to use Python's struct library to unpack it.

*Terminology completion:*
1.  This is called Endianness.
2.  Little-Endian: The lower bits come first (STM32 and Intel computers use this). **0x07D0** is stored as **D0 07**.
3.  Big-Endian: The higher bits come first (commonly used in network transmission). **0x07D0** is stored as **07 D0**.


## Summary (Problem localization is my strong suit)
This set felt like a diagnostic split between two worlds: compiler/concurrency reality (`volatile` and visibility across ISR vs. main) and protocol/data interpretation (endianness across UART). Even when I forgot the formal term, I still reached for the correct recovery tool on the PC side (`struct.unpack("<H", ...)`).  

Gemini’s contribution here was not just “the answer,” but the naming + the framing that makes the knowledge reusable: *endianness*, *little-endian conventions*, and “don’t trust raw bytes until you define interpretation.” It reinforced a pattern: I’m strongest when I think end-to-end—what the MCU sends, what the PC receives, and what the numbers *mean*.


# Intuition Test 3 - Recognize the gap

## Question 6: Stuck Delay (A Game of Interrupt Priorities)
**Scenario:** You are writing a serial port reception program. When the serial port receives data and triggers an interrupt (HAL_UART_RxCpltCallback), you want an LED to blink once to indicate "I have received it". So you wrote in the callback function:

```C
void HAL_UART_RxCpltCallback(...) 
{
    HAL_GPIO_TogglePin(LED_PIN);
    HAL_Delay(100); // Keep blinking for 100ms
}
```
**Crisis:** After the program runs, when data is received for the first time, the light turns on, and then... the system freezes. The main loop no longer runs, and the light stays on without turning off.

**Exam Question:** Why does calling HAL_Delay in the interrupt cause a freeze? (Hint: HAL_Delay also works by means of an interrupt (SysTick). This involves the issue of "who is bigger and who is smaller".)

**My Answer:** I think there might be a conflict between receiving data and turning on the light.

**True Answer:** **The principle of HAL_Delay:** It is actually constantly asking that secretary (the SysTick system tick timer): "Is the time up? Is the time up?"**The key point is:** In the default settings of STM32, the priority of the serial port interrupt is higher than that of SysTick.**Solution:** Never call **HAL_Delay** in an **interrupt**! Or set the **priority of SysTick higher than everyone else's**.


## Question 7: Misplaced Address (A Mathematical Game of the I2C Protocol)
**Scenario:** You bought an MPU6050 gyroscope module. You opened the Datasheet, and it clearly states: Device Address = 0x68.

So you wrote in the code:

```c
// Attempting to read data
HAL_I2C_Master_Transmit(&hi2c1, 0x68, buffer, 1, 100);
```
**Crisis:** The HAL library directly reports HAL_ERROR, and no ACK (acknowledgment) signal is seen on the oscilloscope. You tried three modules, but all failed. You began to doubt yourself: the manual clearly says 0x68!

**Exam Question:** In STM32's HAL library, should the address parameter filled in be 0x68 or another number? Why does it need to be changed? (Hint: The I2C address is only 7 bits, but a byte has 8 bits. Where did the remaining bit go?)

**My Answer:** I haven't learned I2c yet, but I guess it's related to two's complement? Sign bits, after all, it's binary.

**True Answer:** The I2C protocol stipulates that the device address is 7 bits. However, a byte transmission is 8 bits. What is the purpose of the extra 8th bit?

1.  It is used to tell the device: whether I want to read (1) or write (0).

2.  0x68 in the manual: 110 1000 (7 bits)

3.  Parameters required by the HAL library: It not only needs the address but also leaves a space for that read-write bit. So the address needs to be shifted left by one bit. 110 1000 << 1 = 1101 0000， Result: 0xD0.

4.  Conclusion: When filling in the address in the HAL library, always remember to shift the address in the manual by 1 bit to the left (multiply by 2). If you don't shift it, the chip won't respond at all.


## Question 8: Exploding Stack (Pitfalls in C Language Memory Management)
**Scenario:** You need to display an image on the screen. The image is a bit large, a 100x100 color image, which requires approximately 20KB of data. You think this is simple, so you define an array in the function:

```C

void ShowImage() {
    uint8_t image_buffer[20480]; // Define a 20KB array
    
    // ... Read data from the SD card to fill the array ...
    LCD_Draw(image_buffer);
}
```

**Crisis:** There are no compilation errors at all. But as soon as the program runs to the ShowImage() function, the microcontroller immediately resets, or jumps into the HardFault_Handler (hardware error infinite loop).

**Exam Question:** Why can't the STM32F103 with 32KB of RAM store this 20KB array? (Hint: Where are local variables stored? Where are global variables stored? What is the default size of the "stack" in STM32?)

**My Answer:** I think it's a problem that occurs during operation, and it has little to do with 32kb.

**True Answer:** 

Warehouse (Global/Static Area): Very large, almost filling up 32KB.

Schoolbag (Stack): Extremely small! In the default settings, the stack of STM32 is usually only 1KB (0x400) or even smaller.

Your code: **uint8_t image_buffer[20480]**; defined **inside the function**.

Consequence: This kind of "local variable" has to be stuffed into the "schoolbag (stack)".

Tragedy: You are trying to stuff a **20KB** elephant into a **1KB** schoolbag.

**Result: Stack Overflow.** The schoolbag bursts, overwriting the important data next to it (such as the return address), and the CPU goes crazy directly, entering HardFault.

**Solutions:**

1.  Add the static keyword: static uint8_t image_buffer[20480]; (throw it into the large warehouse, not occupying the schoolbag).

2.  Move it outside the function: turn it into a global variable (also throw it into the large warehouse).

## Summary (The gap is a roadmap, not a verdict)
This test was a clean boundary scan. Gemini picked the exact “kills your system” fundamentals: calling `HAL_Delay` inside an interrupt (SysTick dependence + priority), the I2C 7-bit address vs. R/W bit (left shift in HAL), and stack overflow from large local arrays (linker defaults and memory layout).  

My current gap is not interest, but *systematic bottom-layer survival skills*: interrupts/timing, bus protocol conventions, and memory model basics. That doesn’t invalidate my direction—it clarifies it. I can keep aiming for the “middle layer” (data flow, algorithms, integration) while deliberately building enough low-level knowledge to avoid fatal pitfalls. Gemini effectively turned vague anxiety into a concrete checklist.