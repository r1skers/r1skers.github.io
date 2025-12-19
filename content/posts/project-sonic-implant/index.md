---
date: '2025-12-15T22:17:00+09:00'
draft: false
title: '[Artifact] Project Sonic Implant: Development Log'
summary: "A cumulative engineering journal for the heterogeneous acoustic anomaly detection system. This log is updated chronologically, documenting implementation milestones, troubleshooting notes , and system integration details across STM32, FPGA, and Python."
tags: ["STM32", "Embedded C","FPGA", "Python", "DevLog"]
categories: ["Artifact"]
---

# 12.15
<details>
  <summary>Log</summary>
  
## main.c
Mainly set  **USART1(Circular Buffer)** , **DMA**, **Callback function**, **LED_R(check)**,rewite **fputc**.
<details>
  <summary>main.c</summary>
  
```c
volatile uint16_t rx_buffer[1024];

    HAL_UART_Receive_DMA(&huart1, (uint8_t*)rx_buffer, 2048);

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  if(huart->Instance == USART1)
  {
    HAL_GPIO_TogglePin(GPIOA, LED_R_Pin);
    uint8_t ack = 'K';
    HAL_UART_Transmit(&huart1, &ack, 1, 10);
  }
}

int _write(int file, char *data, int len)
{
  HAL_UART_Transmit(&huart1, (uint8_t*)data, len, 1000);
  return len;
}

```

</details>

## hil.sender1.py

## Terminal

<details>
  <summary>Terminal</summary>

```terminal
Connecting to STM32 (COM5 @ 460800)...
Connection successful! ✅
Generating sine wave data with 1024 sampling points...
Sending a data packet of 2048 bytes...
Transmission completed! 🚀 Time taken: 0.0433 seconds
In theory, the rx_buffer of STM32 should now be full.
Received reply from STM32: b'K'
Serial port closed.

```
</details>



</details>

***