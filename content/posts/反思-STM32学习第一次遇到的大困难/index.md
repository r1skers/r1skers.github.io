---
date: '2025-12-08T10:17:00+09:00'
draft: false
title: '[淬火] STM32 学习中第一次遇到的大困难'
summary: "一篇关于 STM32 开发中“幽灵串口”问题的排障记录：一次看起来像工具链迁移失败的问题，最后却被证明只是物理接线错误。"
description: "从 Keil 迁移到 CLion 之后，一次 USART 调试失败如何一步步被定位为物理层接线问题。"
tags: ["STM32","硬件调试","环境搭建","UART"]
categories: ["Sparks"]
---

# 背景

之前我一直用 Keil MDK（Keil5）学习 STM32 开发，但慢慢开始感觉工作流很低效。一个很典型的例子就是 `printf` 重定向：在 Keil 里通常要重写 `fputc`，而且几乎每个新项目都要再写一遍样板代码。

为了换一个更现代的开发体验，我开始尝试迁移到 CLion。虽然把 STM32CubeMX、CLion、MinGW 和 OpenOCD 这一整套链路接起来几乎花了我一整天，但最后搭好的环境确实值得。

# 问题描述

真正的问题出现在我尝试做多路 USART 通信的时候。我参考的是一套基于 Keil 的教程，并试着把它移植到 CLion 环境中。这个过程涉及把底层 I/O 重定向从 Keil 风格的 `fputc` 改成 GCC 兼容的 `_write`。

代码编译、烧录都没有报错，单片机看起来也在运行，但串口通信完全没有成功。

# 排查过程

## 第一步：先看代码

最开始我以为问题出在代码移植本身，所以首先回看了 `main.c`，确认初始化、串口中断和 `_write` 路径本身有没有明显错误。

<details>
  <summary>main.c</summary>
  
```c
/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  */
#include "main.h"
#include "usart.h"
#include "gpio.h"
#include <stdio.h>

#define LENGTH 64

uint8_t Rxbuff1[LENGTH];
uint8_t Rxbuff2[LENGTH];

void SystemClock_Config(void);
void USART_SendString(UART_HandleTypeDef *huart, char *str);

int main(void)
{
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  MX_USART1_UART_Init();
  MX_USART2_UART_Init();

  HAL_UARTEx_ReceiveToIdle_IT(&huart1, Rxbuff1, LENGTH);
  HAL_UARTEx_ReceiveToIdle_IT(&huart2, Rxbuff2, LENGTH);
  printf("Ready to go!!");

  while (1)
  {
  }
}

void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
  if(huart->Instance == USART1)
  {
    USART_SendString(&huart1, "\r\nUSART1 received data,send to USART2:\r\n");
    HAL_UART_Transmit_IT(&huart2, Rxbuff1, Size);
    USART_SendString(&huart1, "\r\nUSART1 Sending finished\r\n");
    HAL_UARTEx_ReceiveToIdle_IT (&huart1, Rxbuff1, LENGTH);
  }
  else if(huart->Instance == USART2)
  {
    USART_SendString(&huart2, "\r\nUSART2 received data,send to USART1:\r\n");
    HAL_UART_Transmit_IT(&huart1, Rxbuff2, Size);
    USART_SendString(&huart2, "\r\nUSART2 Sending finished\r\n");
    HAL_UARTEx_ReceiveToIdle_IT(&huart2, Rxbuff2, LENGTH);
  }
}

void USART_SendString(UART_HandleTypeDef *huart, char *str)
{
  while (*str)
  {
    HAL_UART_Transmit(huart, (uint8_t *)str, 1, HAL_MAX_DELAY);
    str++;
  }
}

int _write(int file, char *ptr, int len)
{
  HAL_UART_Transmit(&huart1, (uint8_t *)ptr, len, HAL_MAX_DELAY);
  return len;
}
```

</details>

## 第二步：检查串口识别

接着我写了一个简单的 Python 脚本去枚举串口：

<details>
  <summary>c0mlist.py</summary>
  
```python
import serial.tools.list_ports

ports_list = list(serial.tools.list_ports.comports())

if len(ports_list) <= 0:
    print("No serial port device found. Please check if the USB is plugged in tightly!")
else:
    print("The following serial port devices are found:")
    for port in ports_list:
        print(f"Port number:{port.device} - Description:{port.description}")
```

</details>

返回结果是：

```text
The following serial port devices are found:
Port number:COM3 - Description:USB-SERIAL CH340 (COM3)
Port number:COM5 - Description:USB-SERIAL CH340 (COM5)
Port number:COM1 - Description:通信端口 (COM1)
```

从系统视角看，一切似乎都正常。所以我开始怀疑是不是 `printf` 的重定向路径还不对。

## 第三步：回到 Keil 版本交叉验证

我把关键实现从：

```c
int _write(int file, char *ptr, int len)
{
  HAL_UART_Transmit(&huart1, (uint8_t *)ptr, len, HAL_MAX_DELAY);
  return len;
}
```

改回了更接近 Keil 教程的形式：

```c
int fputc(int ch , FILE *f)
{
    HAL_UART_Transmit(&huart1 , (uint8_t *)&ch , 1 , HAL_MAX_DELAY);
    return ch;
}
```

结果仍然不通。到这里我就开始意识到，问题未必是工具链迁移。

## 第四步：先做一个最基础的硬件自检

我先用 LED 验证板子最基本的行为：

```c
HAL_GPIO_WritePin(GPIOA, LED_R_Pin|LED_G_Pin|LED_B_Pin, GPIO_PIN_RESET);
```

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    photo
  </summary>
  
  <br> <img src="默认低电平点亮LED.jpg" alt="默认低电平点亮LED" width="100%" height="auto">
</details>

LED 能正常亮，说明最基础的板级逻辑没有大问题。

## 第五步：回到原理图和接线本身

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Schematic Diagram
  </summary>
  
  <br> <img src="STM32F103C8串口芯片背面图.png" alt="Schematic Diagram" width="100%" height="auto">
</details>

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    photo
  </summary>
  
  <br> <img src="按照原理图接线.jpg" alt="Schematic Diagram" width="100%" height="auto">
</details>

我当时的判断还是：

*PA2 (TX) -> RXD，PA3 (RX) -> TXD，看起来没错。那到底哪里出了问题？*

## 第六步：真正的答案

后来我突然意识到一个关键事实：

只要 USB 转 TTL 模块插在电脑上，系统就会把它识别成一个合法的 COM 口，即使模块另一端根本没有真正接到 MCU 上。

这意味着我其实一直在盯着一个“幽灵串口”。电脑能看到串口，并不代表这个串口已经物理连接到 STM32 的 PA2 和 PA3。

我重新换了一根专门的 USB 转 TTL 线，把 PA2（TX）和 PA3（RX）重新接好之后，通信立刻就恢复正常了。

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    photo
  </summary>
  
  <br> <img src="端口监测.png" alt="端口监测" width="100%" height="auto">
</details>

# 结论

这次经历虽然当时非常折磨人，但也很有价值。我的排查顺序最后可以总结成这样：

1. 先用最简单的 LED 程序确认最基础的硬件逻辑。
2. 再回退到原始 Keil 代码，排除软件移植错误。
3. 当软件和基础硬件都没有明显问题时，就必须回头检查物理层。
4. 最终发现它并不是什么复杂的寄存器问题，而只是一个非常朴素的接线错误。

有时候，问题真的就只是一根线没插对。

# 根因

**一次物理层接线错误。**

真正的故障不在软件移植，也不在工具链，而是在串口模块和 MCU 之间没有形成正确的实际连接。
