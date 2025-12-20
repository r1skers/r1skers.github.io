---
date: '2025-12-15T22:17:00+09:00'
draft: false
title: '[Artifact] Project Sonic Implant: Development Log'
summary: "A cumulative engineering journal for the heterogeneous acoustic anomaly detection system. This log is updated chronologically, documenting implementation milestones, troubleshooting notes , and system integration details across STM32, FPGA, and Python."
tags: ["STM32", "Embedded C","FPGA", "Python", "DevLog"]
categories: ["Artifact"]
---

# 12.15
STM32 USART DMA callback test with Python-side waveform sender.
<details>
  <summary>Log</summary>
  
## main.c
Mainly configured **USART1 (circular buffer)**, **DMA**, the RX **callback**, LED_R check, and **rewrote fputc**.
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
Python utility to synthesize a sine wave and push it over UART for callback validation.

<details>
  <summary>hil.sender1.py</summary>

```python
import serial
import struct
import math
import time

# ================= Configuration Area =================
# ⚠️ Make sure the baud rate here is exactly the same as setting in CubeMX!
# If set it to 460800 in CubeMX, need to change it here too
STM32_PORT = 'COM5'      
BAUD_RATE  = 460800     
POINTS_LEN = 1024        # Number of data points (matching the length of the STM32 array)
# ===========================================

def generate_sine_wave(length):
    """
    Generate a sine wave for simulating ADC data
    Range: 0 ~ 4095 (12-bit)
    Center: 2048 (approximately 1.65V)
    """
    data = []
    print(f"Generating sine wave data with {length} sampling points...")
    
    for i in range(length):
        # Generate a sine wave: 2048 is the midpoint, 1800 is the amplitude (to avoid peaking)
        # i / 50 controls the frequency of the waveform (adjusting this denominator can change the density of the waves)
        value = 2048 + 1800 * math.sin(2 * math.pi * i / 50)
        
        # Ensure the data does not exceed 0-4095 (mathematically it won't, but it's rigorous in engineering)
        value = int(max(0, min(4095, value)))
        data.append(value)
        
    return data

def main():
    try:
        # 1. Open the serial port
        print(f"Connecting to STM32 ({STM32_PORT} @ {BAUD_RATE})...")
        ser = serial.Serial(STM32_PORT, BAUD_RATE, timeout=1)
        print("Connection successful! ✅")

        # 2. Prepare data
        wave_data = generate_sine_wave(POINTS_LEN)
        
        # 3. Package data (key step!)
        # STM32 uses little-endian mode, and uint16_t occupies 2 bytes
        # '<' represents little-endian, 'H' represents unsigned short (2 bytes)
        # This line of code converts an array like [2048, 2100...] into a binary byte stream
        binary_packet = struct.pack('<' + 'H' * len(wave_data), *wave_data)

        # 4. Send data
        print(f"Sending a data packet of {len(binary_packet)} bytes...")
        start_time = time.time()
        
        bytes_sent = ser.write(binary_packet)
        ser.flush()  # Ensure all data is pushed out
        
        end_time = time.time()
        print(f"Transmission completed! 🚀 Time taken: {(end_time - start_time):.4f} seconds")
        print(f"In theory, the rx_buffer of STM32 should now be full.")

        # Optional: If you have written code to send back 'K', you can read it here
        response = ser.read(1)
        if response: print(f"Received reply from STM32: {response}")

        ser.close()
        print("Serial port closed.")

    except serial.SerialException as e:
        print(f"❌ Serial port error: {STM32_PORT} not found or port is occupied!")
        print("Suggestion: Close other serial port assistant software and check the USB cable.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    main()
```

</details>

## Terminal
The terminal output confirms the STM32 DMA/RX callback and the Python sender completed successfully (2048 bytes sent, ‘K’ ACK received).
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


# 12.19
USART DMA loopback using simulated MAX4466 data plus end-to-end integrity checks.
<details>
  <summary>Log</summary>

## main.c
USART1 DMA receives 2048 bytes and echoes them back for loopback verification.

<details>
  <summary>main.c</summary>

```c
uint8_t rx_buffer[2048];

HAL_UART_Receive_DMA(&huart1, (uint8_t*)rx_buffer, sizeof(rx_buffer));

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  if(huart->Instance == USART1)
  {
    HAL_GPIO_TogglePin(GPIOA, LED_R_Pin);
    HAL_UART_Transmit(&huart1, (uint8_t*)rx_buffer, sizeof(rx_buffer), 1000);
    HAL_UART_Receive_DMA(&huart1, rx_buffer, sizeof(rx_buffer));
  }
}

```

</details>


## mock_max4466_wave.py
Generates a 16 kHz, 10 s synthetic MAX4466-like signal and saves it as uint16 binary.

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Matplotlib
  </summary>
  
  <br> <img src="12.19_MAX4466_signal_simulation.png" alt="模拟MAX4466信号" width="100%" height="auto">
</details>

<details>
  <summary>mock_max4466_wave.py</summary>
  
```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(0)
# ========== Configuration Information ==========
FS = 16000    # Sampling rate Hz
DURATION = 10 # seconds
ADC_BITS = 12 # STM32F103 ADC
ADC_MAX = 2**ADC_BITS - 1  # 4095

N = (FS * DURATION // 1024) * 1024   # Number of samples

# ========== Signal Synthesis ==========
t = np.arange(N) / FS

# Main signal (simulated ambient sound) — such as simulating speech, mechanical vibration
base_freq = 300           # Hz
base_wave = 2048 + 900 * np.sin(2 * np.pi * base_freq * t)
# Superimpose a high frequency
high_freq = 3000
high_wave = 300 * np.sin(2 * np.pi * high_freq * t)
# Simulate a burst event (abnormality): amplitude spike between 4th and 5th second
burst = np.zeros(N)
burst_idx = np.logical_and(t >= 4, t < 5)
burst[burst_idx] = 1200 * np.sin(2 * np.pi * 1000 * t[burst_idx])
# Superimpose ambient noise
noise = np.random.normal(0, 100, N)

# Total signal
wave = base_wave + high_wave + burst + noise
# Clip to [0, 4095]
wave = np.clip(wave, 0, ADC_MAX).astype(np.uint16)

# ========== Visualization ==========
plt.figure(figsize=(12, 4))
plt.plot(t[:4000], wave[:4000]) # Plot only the first 4000 points, approximately 0.25 seconds
plt.xlabel("Time (sec)")
plt.ylabel("ADC code")
plt.title("Simulated MAX4466 ADC Signal (first 0.25s of 10s)")
plt.show()

# ========== Save Binary File ==========
wave.tofile("sim_max4466_16k_10s.bin")  # Save as uint16 little-endian
print(f"Number of sampling points: {N}, file saved as sim_max4466_16k_10s.bin")
```

</details>

## try.py
Streams the generated binary to STM32 in 1024-sample frames and captures the echo.

<details>
  <summary>try.py</summary>
  
```python
# loopback_inject_and_capture.py
import serial
import numpy as np
import time

PORT = "COM5"
BAUD = 460800
TIMEOUT = 1.0

IN_FILE = "sim_max4466_16k_10s.bin"
OUT_FILE = "loopback_data.bin"

POINTS_PER_PACKET = 1024
BYTES_PER_PACKET = POINTS_PER_PACKET * 2  # uint16

def read_exact(ser, n: int) -> bytes:
    buf = bytearray()
    while len(buf) < n:
        chunk = ser.read(n - len(buf))
        if not chunk:
            raise TimeoutError(f"Timeout while reading: got {len(buf)}/{n} bytes")
        buf.extend(chunk)
    return bytes(buf)

def main():
    adc_codes = np.fromfile(IN_FILE, dtype=np.uint16)
    n_packets = len(adc_codes) // POINTS_PER_PACKET
    adc_codes = adc_codes[:n_packets * POINTS_PER_PACKET]  # Align to whole packets

    print(f"Total samples: {len(adc_codes)}")
    print(f"Packets: {n_packets}, {POINTS_PER_PACKET} points/packet, {BYTES_PER_PACKET} bytes/packet")

    with serial.Serial(PORT, BAUD, timeout=TIMEOUT) as ser, open(OUT_FILE, "wb") as f:
        # Optional: Clear input buffer to avoid interference from power-up residual data
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        time.sleep(0.05)

        for i in range(n_packets):
            pkt_u16 = adc_codes[i*POINTS_PER_PACKET:(i+1)*POINTS_PER_PACKET]
            pkt_bytes = pkt_u16.tobytes()  # 2048 bytes

            ser.write(pkt_bytes)

            echo = read_exact(ser, BYTES_PER_PACKET)
            f.write(echo)

            # Optional: Consistency check (adds a bit of CPU load but is useful)
            if echo != pkt_bytes:
                print(f"[Mismatch] frame {i}: echo != sent (link corruption or misalignment)")
                # You can break here or continue collecting
                break

            if (i % 50) == 0:
                print(f"Frame {i}/{n_packets} OK")

    print(f"Saved loopback to {OUT_FILE}")

if __name__ == "__main__":
    main()
```

</details>

## plot_stm32_adc_wave.py
Loads the echoed data, converts to volts, and plots the first 0.25 seconds.

<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Matplotlib
  </summary>
  
  <br> <img src="12.19_STM32_signal_received.png" alt="对接收数据绘制" width="100%" height="auto">
</details>

<details>
  <summary>plot_stm32_adc_wave.py</summary>
  
```python
import numpy as np
import matplotlib.pyplot as plt

# ====== Basic parameters ======
FS = 16000            # Sampling rate (Hz)
ADC_BITS = 12
ADC_MAX = 2**ADC_BITS - 1  # 4095
VREF = 3.3            # ADC reference voltage (V) (depends on your board supply)

FILENAME = "loopback_data.bin"

# ====== Load binary data ======
adc_codes = np.fromfile(FILENAME, dtype=np.uint16)
print(f"Total samples loaded: {len(adc_codes)}")

# ====== Convert ADC codes to voltage ======
voltages = adc_codes.astype(np.float32) * VREF / ADC_MAX

# ====== Plot 0 ~ 0.25 s waveform ======
T_SHOW = 0.25                         # seconds
N_show = min(int(FS * T_SHOW), len(voltages))
t = np.arange(N_show) / FS

plt.figure(figsize=(12, 4))
plt.plot(t, voltages[:N_show], linewidth=1.0)
plt.xlim(0, T_SHOW)
plt.xlabel("Time (s)")
plt.ylabel("Voltage (V)")
plt.title("STM32 ADC waveform (0 to 0.25 s)")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# ====== Optional: statistics ======
print(f"Mean voltage: {voltages.mean():.3f} V")
print(f"Voltage range: {voltages.min():.3f} ~ {voltages.max():.3f} V")
```

</details>

## check.py

Compares size and MD5 of original and loopback binaries to confirm lossless transfer.

<details>
  <summary>check.py</summary>

```python
import hashlib
import os

def file_md5(filename):
    """Compute the MD5 checksum of a file."""
    hash_md5 = hashlib.md5()
    with open(filename, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def main():
    files = [    "D:\\Github_Repos\\Project-Sonic-Implant\\python-scripts\\sim_max4466_16k_10s.bin",
    "D:\\Github_Repos\\Project-Sonic-Implant\\python-scripts\\loopback_data.bin"]

    for file in files:
        if not os.path.exists(file):
            print(f"Error: {file} not found.")
            return

    # Compare sizes
    size1 = os.path.getsize(files[0])
    size2 = os.path.getsize(files[1])

    print(f"path: {files[0]}\nsize: {size1}\nmd5 : {file_md5(files[0])}\n---")
    print(f"path: {files[1]}\nsize: {size2}\nmd5 : {file_md5(files[1])}\n")

    if size1 == size2:
        print("File size: OK")
    else:
        print("File size: MISMATCH")

    if file_md5(files[0]) == file_md5(files[1]):
        print("MD5: OK")
    else:
        print("MD5: MISMATCH")

if __name__ == "__main__":
    main()
```

</details>

## Terminal
Run logs showing generation, loopback transfer, plotting, and checksum match.

```terminal

(base) PS D:\Github_Repos\Project-Sonic-Implant\python-scripts> python .\mock_max4466_wave.py  
Number of sampling points: 159744, file saved as sim_max4466_16k_10s.bin
(base) PS D:\Github_Repos\Project-Sonic-Implant\python-scripts> python .\try.py
Packets: 156, 1024 points/packet, 2048 bytes/packet
Frame 0/156 OK
Frame 50/156 OK
Frame 100/156 OK
Frame 150/156 OK
Saved loopback to loopback_data.bin
(base) PS D:\Github_Repos\Project-Sonic-Implant\python-scripts> python .\plot_stm32_adc_wave.py
Total samples loaded: 159744
Mean voltage: 1.650 V
Voltage range: 0.000 ~ 3.300 V
(base) PS D:\Github_Repos\Project-Sonic-Implant\python-scripts> python .\check.py
path: D:\Github_Repos\Project-Sonic-Implant\python-scripts\sim_max4466_16k_10s.bin
size: 319488
md5 : 352c4e63873228067e670a493f649ae4
---
path: D:\Github_Repos\Project-Sonic-Implant\python-scripts\loopback_data.bin
size: 319488
md5 : 352c4e63873228067e670a493f649ae4

File size: OK
MD5: OK
```
</details>