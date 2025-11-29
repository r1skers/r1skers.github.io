---
date: '2025-11-27T17:04:00+09:00'
draft: false
title: '[Fireside Notes] The First Step into Embedded Systems: Blinking LED & Speaking UART'
summary: "A journey from toggling GPIOs to mastering serial communication on STM32. Understanding the heartbeat and the voice of a microcontroller."
tags: ["Embedded Systems", "STM32", "C/C++"]
categories: ["Fireside Notes"]
---

# After Reading

## 1.为什么要防止芯片锁死

### 原理

• 默认状态下，STM32 上电复位后，PA13 (SWDIO) 和 PA14 (SWCLK) 默认连接到内部的 调试单元 (CoreSight)。此时 ST-Link 可以控制芯片。<p>
• 如果在 SYS 选项中选择了 No Debug，生成的初始化代码（HAL_MspInit）包含了一句指令，命令 AFIO (复用控制器) 切断调试单元的连线，把这两个引脚变成普通的 GPIO。<p>

```C
__HAL_AFIO_REMAP_SWJ_DISABLE(); // 禁用 SWJ 调试端口
```

• 当你下载代码并重启后，芯片启动极快（毫秒级），瞬间执行了这句指令。<p>
• 当你再次想下载时，ST-Link 敲门，但“门”已经被堵死变成了“墙”，信号无法进入调试核心。<p>

### 这么设计的原因

**资源稀缺性**：STM32F103C8T6 只有 48 个引脚，除去电源和晶振，可用 IO 口非常少。<p>
**开发 vs 量产**：<p>
• 开发阶段：需要调试，所以这两个脚必须是调试口。<p>
• 量产阶段：产品卖给客户后不再需要调试。为了不浪费资源，回收这两个脚用来控制 LED 或按键。<p>

## 2.异步在这里如何体现
等板子

## 3.MicroLIB的作用
**MicroLIB 是 Keil 专门为嵌入式芯片（如 STM32）量身定做的“瘦身版” C 语言标准库。**<p>
• 标准库的printf函数默认需要显示器、键盘、操作系统，而启用MicroLIB，调用printf时只要求你提供一个最简单的“发字符”函数(fputc),剩下的格式化工作（比如把数字 100 变成字符 "100"）它帮你做。<p>
• MicroLIB 经过深度裁剪，代码体积比标准库小很多。这对于 Flash 和 RAM 都很金贵的单片机来说，是巨大的优势。<p>
• MicroLIB 简化了 main 函数执行之前的初始化代码（Startup Code）。这意味着单片机上电后，能更快地进入 main 函数开始干活。<p>

## 4.fput函数

### 苦力 (fputc)：<p>
• 来源：标准库 <stdio.h>。<p>
• 职责：负责“搬砖”。它一次只处理一个字符。<p>
• 工作：它的原型是 int fputc(int ch, FILE *stream)。它的任务就是把 ch 这个字符送到“某个地方”去。<p>

### HAL_UART_Transmit

## 5.为什么是USER CODE BEGIN 3

### USER CODE BEGIN 1(变量定义区)
位置：在 main 函数的最开头，HAL_Init 之前。<p>
用途：用来定义你自己在这个函数里要用的局部变量。<p>
现状：你通常不需要在这里写东西，除非你要定义一些临时变量。<p>
### USER CODE BEGIN 2(初始化后、循环前)
位置：在所有外设初始化（MX_GPIO_Init 等）做完之后，但在 while(1) 之前。<p>
用途：只执行一次的代码。<p>
比如：你想开机时打印一句 "System Booting..."，或者先把 LED 闪两下表示开机，就写在这里。<p>
### USER CODE BEGIN 3(死循环区)
位置：在 while(1) 的大括号里面。<p>
用途：反复执行的代码。<p>
比如：你的“闪灯”、“串口发消息”，因为需要不停地做，所以必须放在这里。<p>

## 6. 内存与运存

### 工作原理
| 特性 | Flash (闪存) | SRAM (静态随机存储器) |
| :--- | :---: | :---: |
| **角色** | 仓库 (Warehouse) | 工作台 (Workbench) |
| **容量 (Blue Pill)** | 64 KB (很大) | 20 KB (寸土寸金) |
| **断电表现** | 数据保留 (非易失) | 数据清空 (易失) |
| **物理本质** | 浮栅晶体管 (电子陷阱) | 6 晶体管锁存器 (互锁电路) |
| **存什么**| 代码、常量、变量的初始值 | 正在变化的变量、堆栈 |

编译代码时，Keil 会把C代码切成四块。它们最终：
1. Code: 代码指令（函数逻辑）。
2. RO-data: Read Only，只读数据（字符串 "Hello"、const 变量）。
3. RW-data: Read Write，有初值的全局变量（如 int score = 100;）。
4. ZI-data: Zero Initialized，无初值的变量 + 堆栈 (Stack)。

占用硬盘 (Flash):

$$Size = \text{Code} + \text{RO\\_data} + \text{RW\\_data}$$

占用内存 (RAM):

$$Size = \text{RW\\_data} + \text{ZI\\_data}$$

1.  上电瞬间：int score = 100; 的那个 100 记在 Flash 里。
2.  启动阶段：在 main() 执行前，CPU 偷偷运行了一段汇编代码。
3.  搬运：它把 100 从 Flash 复制 到了 RAM 里的 score 变量地址。
4.  清零：它同时把 RAM 里 ZI-data 的区域（比如未初始化的数组）全部刷成 0。
5.  就位：做完这些，才跳转到 main()。
### 哈佛架构

# 使用工具
1.  STM32F1038C8T6(开发板)
2.  Keil MDK-ARM (Version 5, Keil5)(编译器)
3.  STM32CubeMX(代码生成器)

# 控制它的心跳（CLK）和肌肉（GPIO）

## 配置in CubeMX
1.  System Core-> SYS-> Debug-> Serial Wire(防止芯片锁死)
2.  System Core-> RCC-> HSE(High Speed External): Crystal/Ceramic Resonator
3.  芯片图: PC13-> GPIO_Output-> Enter User Label(LED_PIN)

# 让他说话！(UART)

## 配置in CubeMX
1.  Connectivity-> USART1-> Mode: Asynchronous
2.  Connectivity-> USART1-> Baud Rate: 115200 Bits/s  || Word Length: 8 Bits  || Parity: None  || Stop Bits: 1
3.  Generate Code

# 注入灵魂注入灵魂 —— 编写代码 & 重定向

## 配置Keil5
1.  Options for Target...-> Target-> Use MicroLIB<p>
为了使用精简版的 C 标准库，防止 printf 卡死。<p>

2.  重写 fputc (Retargeting)：<p>
在 main.c 里引入 #include <stdio.h><p>
重写 fputc 函数，将字符通过 HAL_UART_Transmit 发送给串口1<p>
原因：把 C 语言的“打印到屏幕”偷梁换柱为“打印到串口”<p>

3.  主逻辑(main):<p>

```C
while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
    printf("Hello! System Running: LED Toggle...\r\n");
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
    HAL_Delay(1000);
	/* USER CODE END 3 */
  }
  
```
4.  完整代码

<details>
    <summary>main.c</summary>

```C

/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include <stdio.h>
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
UART_HandleTypeDef huart1;

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_USART1_UART_Init(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
int fputc(int ch,FILE*f)
{
	HAL_UART_Transmit(&huart1,(uint8_t *)&ch,1,0xFFFF);
	return ch;
}
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_USART1_UART_Init();
  /* USER CODE BEGIN 2 */

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
		// 1. ???????
    // \r\n ????,Windows ???????????
    printf("Hello! System Running: LED Toggle...\r\n");

    // 2. ?? LED
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);

    // 3. ?? 1 ?
    HAL_Delay(1000);
		/* USER CODE END 3 */
  }
  
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief USART1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART1_UART_Init(void)
{

  /* USER CODE BEGIN USART1_Init 0 */

  /* USER CODE END USART1_Init 0 */

  /* USER CODE BEGIN USART1_Init 1 */

  /* USER CODE END USART1_Init 1 */
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 115200;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_NONE;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN USART1_Init 2 */

  /* USER CODE END USART1_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  /* USER CODE BEGIN MX_GPIO_Init_1 */

  /* USER CODE END MX_GPIO_Init_1 */

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOC_CLK_ENABLE();
  __HAL_RCC_GPIOD_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(LED_PIN_GPIO_Port, LED_PIN_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin : LED_PIN_Pin */
  GPIO_InitStruct.Pin = LED_PIN_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(LED_PIN_GPIO_Port, &GPIO_InitStruct);

  /* USER CODE BEGIN MX_GPIO_Init_2 */

  /* USER CODE END MX_GPIO_Init_2 */
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  /* Infinite loop */
  while (1)
  {
    /* USER CODE BEGIN 3 */

    

    /* USER CODE END 3 */
  }
  /* USER CODE END Error_Handler_Debug */
}
#ifdef USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */


```

</details>

