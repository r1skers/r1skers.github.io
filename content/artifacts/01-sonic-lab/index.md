---
date: '2026-01-08T00:00:00+09:00'
draft: false
title: "[Artifact-1] Sonic Lab 开发日志 / Sonic Lab Development Log"
summary: "异构声学异常检测项目的长期开发记录。 / Long-term development log for the heterogeneous acoustic anomaly detection project."
description: "Artifact 1 focuses on SonicLab: embedded data path, PC analysis loop, and iterative validation notes."
tags: ["STM32", "Embedded C", "Python", "DevLog"]
categories: ["Projects"]
weight: 10
aliases:
  - /posts/神器-声波检测/
---

<details>
  <summary>01.11</summary>

PC-only sweep milestone: ran large randomized scenes, generated heatmaps, and recorded metrics/logs. Conclusion: RMS + whistle_ratio works in clean regimes but degrades in low SNR regions (weak event + strong background). This is a solid learning checkpoint even if the pipeline is not yet production-grade.

## python-scripts/project
- metrics_report.py: unified all/impact/whistle summaries
- heatmap_report.py: 2D accuracy maps for failure boundary inspection
- mini_sweep_log.csv / metrics_log.csv: run history for reproducibility

</details>

<details>
  <summary>01.10</summary>

Switched mini sweep from fixed event-aligned windows to sliding window scanning. Use max whistle_ratio / max RMS across the entire sample to handle overlaps and unknown event timing.

## python-scripts/project
- mini_sweep.py: scan whole signal with hop window; classify by max_ratio then max_rms
- Makefile: added WINDOW_SEC + HOP_SEC and wired into mini-sweep target

<details>
  <summary>world/mini_sweep.py (sliding)</summary>

```python
parser.add_argument(”—window-sec“, type=float, default=0.5)
parser.add_argument(”—hop-sec“, type=float, default=0.1)

win_len = int(args.window_sec * cfg.fs)
hop_len = int(args.hop_sec * cfg.fs)
if win_len <= 0 or win_len > len(samples):
    win_len = len(samples)
if hop_len <= 0:
    hop_len = win_len

max_ratio = None
max_rms = None
for start in range(0, len(samples) - win_len + 1, hop_len):
    end = start + win_len
    features = window_features(samples, start, end, sm_cfg)
    if features is None:
        continue
    ratio = features.get(”whistle_ratio“)
    rms = features.get(”rms“)
    if ratio is not None:
        max_ratio = ratio if max_ratio is None else max(max_ratio, ratio)
    if rms is not None:
        max_rms = rms if max_rms is None else max(max_rms, rms)

pred_state = ”normal“
if max_ratio is not None and max_ratio >= args.whistle_ratio:
    pred_state = ”whistle“
elif max_rms is not None and max_rms >= args.rms_thresh:
    pred_state = ”impact“
```

</details>

<details>
  <summary>Makefile (mini sweep params)</summary>

```make
WINDOW_SEC = 0.5
HOP_SEC = 0.1

mini-sweep:
	PYTHONPATH=. $(PY) world/mini_sweep.py —csv $(SCENES) —out $(MINI_OUT) —window-sec $(WINDOW_SEC) —hop-sec $(HOP_SEC) —rms-thresh $(RMS_THRESH) —whistle-ratio $(WHISTLE_RATIO) —whistle-band-low $(WHISTLE_BAND_LOW) —whistle-band-high $(WHISTLE_BAND_HIGH)
```

</details>

</details>


<details>
  <summary>01.09</summary>

Week1-2 PC-only loop refinement: aligned analysis windows to event times, added mismatch export tool, and switched whistle feature to a band-vs-background ratio for stability.

## python-scripts/project
- CSV contract walkthrough and parsing (mini_scenes + csv_io)
- scene synthesis order clarified (bg + whistle + impact)
- mini sweep now aligns window to event time and separates whistle/impact checks
- whistle ratio uses band vs background power

<details>
  <summary>world/csv_io.py</summary>

```python
import csv

from world.scene import SceneConfig


def _get_float(row: dict, key: str, default: float) -> float:
    value = row.get(key, "")
    if value == "":
        return default
    return float(value)


def _get_int(row: dict, key: str, default: int) -> int:
    value = row.get(key, "")
    if value == "":
        return default
    return int(value)


def scene_config_from_row(row: dict) -> SceneConfig:
    cfg = SceneConfig()
    return SceneConfig(
        fs=_get_int(row, "fs", cfg.fs),
        total_sec=_get_float(row, "total_sec", cfg.total_sec),
        seed=_get_int(row, "seed", cfg.seed),
        bg_gain=_get_float(row, "bg_gain", cfg.bg_gain),
        whistle_freq_hz=_get_float(row, "whistle_freq_hz", cfg.whistle_freq_hz),
        whistle_gain=_get_float(row, "whistle_gain", cfg.whistle_gain),
        whistle_start_sec=_get_float(row, "whistle_start_sec", cfg.whistle_start_sec),
        whistle_end_sec=_get_float(row, "whistle_end_sec", cfg.whistle_end_sec),
        impact_gain=_get_float(row, "impact_gain", cfg.impact_gain),
        impact_start_sec=_get_float(row, "impact_start_sec", cfg.impact_start_sec),
        impact_dur_sec=_get_float(row, "impact_dur_sec", cfg.impact_dur_sec),
    )


def load_scene_rows(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return list(reader)
```

</details>

<details>
  <summary>world/scene.py</summary>

```python
def generate_scene(cfg: SceneConfig) -> np.ndarray:
    rng = np.random.default_rng(cfg.seed)
    n = int(cfg.fs * cfg.total_sec)
    t = np.arange(n, dtype=np.float32) / float(cfg.fs)

    bg = np.zeros_like(t)
    for freq in cfg.bg_freqs_hz:
        bg += _tone(t, freq)
    bg *= cfg.bg_gain / max(len(cfg.bg_freqs_hz), 1)

    whistle = np.zeros_like(t)
    wh_mask = (t >= cfg.whistle_start_sec) & (t < cfg.whistle_end_sec)
    if np.any(wh_mask) and cfg.whistle_gain != 0.0:
        whistle[wh_mask] = cfg.whistle_gain * _tone(t[wh_mask], cfg.whistle_freq_hz)

    impact = np.zeros_like(t)
    impact_end = cfg.impact_start_sec + cfg.impact_dur_sec
    impact_mask = (t >= cfg.impact_start_sec) & (t < impact_end)
    if np.any(impact_mask) and cfg.impact_gain != 0.0:
        win_t = (t[impact_mask] - cfg.impact_start_sec) / max(cfg.impact_dur_sec, 1e-6)
        env = np.where(win_t < 0.5, win_t * 2.0, (1.0 - win_t) * 2.0)
        noise = rng.standard_normal(impact_mask.sum()).astype(np.float32)
        impact[impact_mask] = cfg.impact_gain * env * noise

    x = bg + whistle + impact
    return x.astype(np.float32)
```

</details>

<details>
  <summary>world/mini_sweep.py</summary>

```python
def window_slice(center_sec: float, window_sec: float, fs: int, total_samples: int) -> tuple[int, int]:
    win_len = int(window_sec * fs)
    if win_len <= 0 or win_len > total_samples:
        win_len = total_samples
    center_idx = int(center_sec * fs)
    start = center_idx - (win_len // 2)
    start = max(0, min(start, total_samples - win_len))
    end = start + win_len
    return start, end


def window_features(samples: np.ndarray, start: int, end: int, cfg: StateMachineConfig) -> dict | None:
    window = np.hanning(cfg.win).astype(np.float32)
    return compute_features(
        samples=samples[start:end],
        fs=cfg.fs,
        window=window,
        nfft=cfg.nfft,
        hop=cfg.hop,
        band_low=cfg.whistle_band_low,
        band_high=cfg.whistle_band_high,
    )


pred_state = "normal"
whistle_ratio = None
rms = None

if cfg.whistle_gain > 0.0:
    wh_center = 0.5 * (cfg.whistle_start_sec + cfg.whistle_end_sec)
    wh_start, wh_end = window_slice(wh_center, args.window_sec, cfg.fs, len(samples))
    wh_features = window_features(samples, wh_start, wh_end, sm_cfg)
    if wh_features is not None:
        whistle_ratio = wh_features.get("whistle_ratio")
        rms = wh_features.get("rms")
        if whistle_ratio is not None and whistle_ratio >= args.whistle_ratio:
            pred_state = "whistle"

if pred_state != "whistle" and cfg.impact_gain > 0.0:
    im_center = cfg.impact_start_sec + 0.5 * cfg.impact_dur_sec
    im_start, im_end = window_slice(im_center, args.window_sec, cfg.fs, len(samples))
    im_features = window_features(samples, im_start, im_end, sm_cfg)
    if im_features is not None:
        rms = im_features.get("rms")
        if rms is not None and rms >= args.rms_thresh:
            pred_state = "impact"
```

</details>

<details>
  <summary>processing/features.py</summary>

```python
    total_power = float(np.sum(power_avg)) + 1e-12
    band_power = float(np.sum(power_avg[band_mask]))
    background_power = max(total_power - band_power, 1e-12)
    whistle_ratio = band_power / background_power
```

</details>

<details>
  <summary>world/mismatch_report.py</summary>

```python
def _reason_from_features(rms: float | None, ratio: float | None, rms_thresh: float, ratio_thresh: float) -> str:
    if rms is None or ratio is None:
        return "missing_features"
    if rms < rms_thresh:
        return "rms_below_thresh"
    if ratio >= ratio_thresh:
        return "whistle_ratio_above_thresh"
    return "whistle_ratio_below_thresh"
```

</details>

<details>
  <summary>Makefile</summary>

```make
PY = python
PORT = COM5
BAUD = 460800
SCENES = world/mini_scenes.csv
MINI_OUT = world/mini_results.csv
RMS_THRESH = 0.1
WHISTLE_RATIO = 0.055
WHISTLE_BAND_LOW = 3800
WHISTLE_BAND_HIGH = 4500

.PHONY: run run-plot mini-sweep mismatch-report help

mini-sweep:
	PYTHONPATH=. $(PY) world/mini_sweep.py --csv $(SCENES) --out $(MINI_OUT) --rms-thresh $(RMS_THRESH) --whistle-ratio $(WHISTLE_RATIO) --whistle-band-low $(WHISTLE_BAND_LOW) --whistle-band-high $(WHISTLE_BAND_HIGH)

mismatch-report:
	PYTHONPATH=. $(PY) world/mismatch_report.py --in $(MINI_OUT) --out world/mini_mismatches.csv --rms-thresh $(RMS_THRESH) --whistle-ratio $(WHISTLE_RATIO)
```

</details>

</details>

<details>
  <summary>01.08</summary>

Clean log restart. Current focus is the end-to-end pipeline: serial RX -> framing -> decode -> ring -> state machine -> plotting. Makefile is the entry point. MCU side provides the scenario generator and OLED state display.

## python-scripts/project
- Modular pipeline: transport -> protocol -> processing -> buffer -> ui
- main.py is the single entry, with RX + state classification + optional plot
- Makefile wraps runtime parameters for quick use

<details>
  <summary>main.py</summary>

```python
import argparse
import threading
import time

import serial

from transport.serial_rx import iter_serial_chunks_from_serial
from protocol.framing import pop_frame_from_buffer, DEFAULT_PAYLOAD_BYTES
from processing.analysis import decode_payload_u16
from processing.state_machine import StateMachine, StateMachineConfig
from buffer.ring import RingBuffer
from ui.plot import run_plot_loop


def rx_loop(stop_evt, ring, stats, ser, payload_bytes):
    rx_buf = bytearray()
    last_seq = None

    for chunk in iter_serial_chunks_from_serial(ser, stop_evt=stop_evt):
        if not chunk:
            continue
        rx_buf.extend(chunk)

        while True:
            res = pop_frame_from_buffer(rx_buf, payload_bytes=payload_bytes)
            if res is None:
                break

            seq, payload = res
            if last_seq is not None:
                expected = (last_seq + 1) & 0xFFFFFFFF
                if seq != expected:
                    gap = (seq - expected) & 0xFFFFFFFF
                    stats[”dropped“] += gap
            last_seq = seq
            stats[”frames_ok“] += 1
            stats[”last_seq“] = seq

            x = decode_payload_u16(payload)
            if x.size:
                ring.write(x)

    stats[”stopped“] = True


def state_loop(stop_evt, ring, stats, sm, ser, tx_lock, window_sec: float = 0.5, interval_sec: float = 0.2):
    state_codes = {”normal“: 0, ”whistle“: 1, ”impact“: 2}
    last_state = None
    last_code = None
    while not stop_evt.is_set():
        snap = ring.snapshot()
        if snap is None:
            time.sleep(interval_sec)
            continue

        win_len = int(window_sec * sm.cfg.fs)
        if win_len <= 0 or win_len > snap.size:
            win_len = snap.size

        features = sm.update(snap[-win_len:])
        state = features.get(”state“)
        stats[”state“] = state
        stats[”state_features“] = features
        if features and ”rms“ in features and ”whistle_ratio“ in features:
            stats[”oled_line“] = (
                f”{state} rms={features[’rms‘]:.1f} “
                f”ratio={features[’whistle_ratio‘]:.2f}“
            )
        if state and state != last_state:
            print(f”State -> {state}“)
            last_state = state
            code = state_codes.get(state)
            if code is not None and code != last_code:
                with tx_lock:
                    ser.write(bytes([code]))
                last_code = code

        time.sleep(interval_sec)


def main():
    parser = argparse.ArgumentParser(description=”Serial RX -> RingBuffer -> Plot“)
    parser.add_argument(”—port“, default=”COM5“)
    parser.add_argument(”—baud“, type=int, default=460800)
    parser.add_argument(”—fs“, type=int, default=16000)
    parser.add_argument(”—seconds“, type=float, default=10.0)
    parser.add_argument(”—payload-bytes“, type=int, default=DEFAULT_PAYLOAD_BYTES)
    parser.add_argument(”—plot“, action=”store_true“)
    parser.add_argument(”—state-window“, type=float, default=0.5)
    parser.add_argument(”—state-interval“, type=float, default=0.2)
    parser.add_argument(”—rms-thresh“, type=float, default=100.0)
    parser.add_argument(”—whistle-band-low“, type=float, default=3800.0)
    parser.add_argument(”—whistle-band-high“, type=float, default=4200.0)
    parser.add_argument(”—whistle-ratio“, type=float, default=0.25)
    args = parser.parse_args()

    ring = RingBuffer(int(args.fs * args.seconds))
    stats = {
        ”frames_ok“: 0,
        ”dropped“: 0,
        ”last_seq“: None,
        ”t0“: time.time(),
        ”stopped“: False,
    }
    stop_evt = threading.Event()

    ser = serial.Serial(args.port, args.baud, timeout=0.1)
    tx_lock = threading.Lock()

    rx_thr = threading.Thread(
        target=rx_loop,
        args=(stop_evt, ring, stats, ser, args.payload_bytes),
        daemon=True,
    )
    rx_thr.start()
    sm_cfg = StateMachineConfig(
        fs=args.fs,
        window_sec=args.state_window,
        rms_threshold=args.rms_thresh,
        whistle_band_low=args.whistle_band_low,
        whistle_band_high=args.whistle_band_high,
        whistle_ratio_threshold=args.whistle_ratio,
    )
    sm = StateMachine(sm_cfg)
    sm_thr = threading.Thread(
        target=state_loop,
        args=(stop_evt, ring, stats, sm, ser, tx_lock, args.state_window, args.state_interval),
        daemon=True,
    )
    sm_thr.start()

    try:
        if args.plot:
            run_plot_loop(ring, args.fs, stats=stats, stop_evt=stop_evt)
        else:
            while True:
                time.sleep(1.0)
                dt = time.time() - stats[”t0“]
                fps = stats[”frames_ok“] / dt if dt > 0 else 0.0
                state = stats.get(”state“, ”unknown“)
                oled_line = stats.get(”oled_line“)
                oled_suffix = f”  OLED: {oled_line}“ if oled_line else ”“
                print(
                    f”Frames: {stats[’frames_ok‘]}  Dropped: {stats[’dropped‘]}  “
                    f”Last seq: {stats[’last_seq‘]}  FPS: {fps:.2f}  State: {state}“
                    f”{oled_suffix}“
                )
    except KeyboardInterrupt:
        pass
    finally:
        stop_evt.set()
        rx_thr.join(timeout=1.0)
        if sm_thr is not None:
            sm_thr.join(timeout=1.0)
        ser.close()


if __name__ == ”__main__“:
    main()
```

</details>

<details>
  <summary>Makefile</summary>

```make
PY = python
PORT = COM5
BAUD = 460800

.PHONY: run run-plot help

help:
	@echo ”Targets:“
	@echo ”  make run       - serial RX + stats (no plot)“
	@echo ”  make run-plot  - serial RX + waveform + spectrogram“
	@echo ”  Set PORT and BAUD env vars as needed (default COM5/460800).“

run:
	$(PY) main.py —port $(PORT) —baud $(BAUD)

run-plot:
	$(PY) main.py —port $(PORT) —baud $(BAUD) —plot
```

</details>

<details>
  <summary>transport/serial_rx.py</summary>

```python
import serial
from typing import Iterator


def iter_serial_chunks_from_serial(ser: serial.Serial, stop_evt=None) -> Iterator[bytes]:
    while True:
        if stop_evt is not None and stop_evt.is_set():
            break
        n = ser.in_waiting or 1
        data = ser.read(n)
        if data:
            yield data


# IO: serial byte stream input
def iter_serial_chunks(port: str, baud: int, stop_evt=None) -> Iterator[bytes]:
    ser = serial.Serial(port, baud, timeout=0.1)
    try:
        yield from iter_serial_chunks_from_serial(ser, stop_evt=stop_evt)
    finally:
        ser.close()
```

</details>

<details>
  <summary>protocol/framing.py</summary>

```python
# protocol/framing.py
import struct

MAGIC_U32 = 0xAABBCCDD
MAGIC_BYTES = struct.pack(”<I“, MAGIC_U32)
HEADER_BYTES = 4 + 4  # magic + seq
DEFAULT_PAYLOAD_BYTES = 1024 * 2

def pop_frame_from_buffer(buf: bytearray, payload_bytes: int = DEFAULT_PAYLOAD_BYTES):
    ”“”
    Frame format (v4 MCU):
      [MAGIC 4B][SEQ 4B][PAYLOAD N bytes]
    Returns:
      (seq: int, payload: bytes) on success, or None if not enough data.
    Mutates buf: consumes bytes for the returned frame, or discards garbage before MAGIC.
    “”“
    idx = buf.find(MAGIC_BYTES)
    if idx < 0:
        # Keep the last 3 bytes to allow matching a split magic word.
        if len(buf) > 3:
            del buf[:-3]
        return None

    if idx > 0:
        del buf[:idx]

    frame_bytes = HEADER_BYTES + payload_bytes
    if len(buf) < frame_bytes:
        return None

    seq = struct.unpack_from(”<I“, buf, 4)[0]
    payload = bytes(buf[8 : 8 + payload_bytes])
    del buf[:frame_bytes]
    return seq, payload
```

</details>

<details>
  <summary>processing/analysis.py</summary>

```python
# processing/analysis.py
import numpy as np

def decode_payload_u16(payload: bytes) -> np.ndarray:
    ”“”
    Decode payload bytes to float32 samples.

    payload: raw bytes (length must be even)
    returns: 1-D np.float32 array
    “”“
    if len(payload) % 2 != 0:
        return np.array([], dtype=np.float32)

    # bytes -> uint16
    u16 = np.frombuffer(payload, dtype=np.uint16)


    x = x - x.mean()

    return x
```

</details>

<details>
  <summary>processing/features.py</summary>

```python
import numpy as np


def compute_features(
    samples: np.ndarray,
    fs: int,
    window: np.ndarray,
    nfft: int,
    hop: int,
    band_low: float,
    band_high: float,
):
    if samples is None or samples.size == 0:
        return None

    win_len = len(window)
    if samples.size < win_len:
        return None

    x = samples.astype(np.float32, copy=False)
    x = x - x.mean()

    energy = float(np.mean(x * x))
    rms = float(np.sqrt(energy))

    n_frames = 1 + (len(x) - win_len) // hop
    if n_frames <= 0:
        return None

    freqs = np.fft.rfftfreq(nfft, d=1.0 / fs)
    band_mask = (freqs >= band_low) & (freqs <= band_high)

    power_sum = np.zeros(freqs.shape, dtype=np.float32)
    for i in range(n_frames):
        start = i * hop
        frame = x[start:start + win_len] * window
        fft = np.fft.rfft(frame, n=nfft)
        power_sum += (np.abs(fft) ** 2)

    power_avg = power_sum / n_frames
    total_power = float(np.sum(power_avg)) + 1e-12
    band_power = float(np.sum(power_avg[band_mask]))
    whistle_ratio = band_power / total_power
    peak_freq = float(freqs[int(np.argmax(power_avg))])

    return {
        ”rms“: rms,
        ”energy“: energy,
        ”total_power“: total_power,
        ”band_power“: band_power,
        ”whistle_ratio“: whistle_ratio,
        ”peak_freq“: peak_freq,
    }
```

</details>

<details>
  <summary>processing/state_machine.py</summary>

```python
from dataclasses import dataclass
import numpy as np

from processing.features import compute_features
from processing.stft import DEFAULT_HOP, DEFAULT_NFFT, DEFAULT_WIN


@dataclass
class StateMachineConfig:
    fs: int = 16000
    window_sec: float = 0.5
    rms_threshold: float = 100.0
    whistle_band_low: float = 3800.0
    whistle_band_high: float = 4200.0
    whistle_ratio_threshold: float = 0.25
    nfft: int = DEFAULT_NFFT
    hop: int = DEFAULT_HOP
    win: int = DEFAULT_WIN


class StateMachine:
    NORMAL = ”normal“
    WHISTLE = ”whistle“
    IMPACT = ”impact“

    def __init__(self, config: StateMachineConfig):
        self.cfg = config
        self._window = np.hanning(self.cfg.win).astype(np.float32)
        self.state = self.NORMAL

    def update(self, samples: np.ndarray) -> dict:
        features = compute_features(
            samples=samples,
            fs=self.cfg.fs,
            window=self._window,
            nfft=self.cfg.nfft,
            hop=self.cfg.hop,
            band_low=self.cfg.whistle_band_low,
            band_high=self.cfg.whistle_band_high,
        )
        if features is None:
            return {”state“: self.state}

        rms = features[”rms“]
        ratio = features[”whistle_ratio“]

        if rms < self.cfg.rms_threshold:
            self.state = self.NORMAL
        elif ratio >= self.cfg.whistle_ratio_threshold:
            self.state = self.WHISTLE
        else:
            self.state = self.IMPACT

        features[”state“] = self.state
        return features
```

</details>

<details>
  <summary>processing/stft.py</summary>

```python
# processing/stft.py
import numpy as np

DEFAULT_NFFT = 512
DEFAULT_HOP = 160
DEFAULT_WIN = 400


def default_window(win_len: int = DEFAULT_WIN) -> np.ndarray:
    return np.hanning(win_len).astype(np.float32)


def stft_db(sig: np.ndarray, fs: int, window: np.ndarray,
            nfft: int = DEFAULT_NFFT, hop: int = DEFAULT_HOP,
            eps: float = 1e-6):
    sig = sig.astype(np.float32)
    n_frames = 1 + (len(sig) - len(window)) // hop
    if n_frames <= 0:
        return None, None, None

    n_freq = nfft // 2 + 1
    S = np.empty((n_freq, n_frames), dtype=np.float32)

    for i in range(n_frames):
        start = i * hop
        frame = sig[start:start + len(window)] * window
        fft = np.fft.rfft(frame, n=nfft)
        S[:, i] = np.abs(fft)

    S_db = 20.0 * np.log10(S + eps)
    freqs = np.fft.rfftfreq(nfft, d=1.0 / fs)
    times = (np.arange(n_frames) * hop) / fs
    return S_db, freqs, times
```

</details>

<details>
  <summary>buffer/ring.py</summary>

```python
# buffer/ring.py
import threading
import numpy as np

class RingBuffer:
    def __init__(self, size: int):
        self.buf = np.zeros(size, dtype=np.float32)
        self.size = size
        self.wptr = 0
        self.filled = False
        self.lock = threading.Lock()

    def write(self, x: np.ndarray) -> None:
        ”“”Write 1-D float32 array into ring (overwrites oldest when full).“”“
        x = np.asarray(x, dtype=np.float32)
        n = len(x)
        if n == 0:
            return

        if n >= self.size:
            x = x[-self.size:]
            n = self.size

        with self.lock:
            end = self.wptr + n
            if end <= self.size:
                self.buf[self.wptr:end] = x
                self.wptr = end
                if self.wptr == self.size:
                    self.wptr = 0
                    self.filled = True
            else:
                k = self.size - self.wptr
                self.buf[self.wptr:] = x[:k]
                self.buf[:n - k] = x[k:]
                self.wptr = n - k
                self.filled = True

    def snapshot(self) -> np.ndarray | None:
        with self.lock:
            if not self.filled:
                return None
            w = self.wptr
            # oldest is at wptr when filled=True
            return np.concatenate((self.buf[w:], self.buf[:w])).copy()
```

</details>

<details>
  <summary>ui/plot.py</summary>

```python
# ui/plot.py
import time
import matplotlib.pyplot as plt
import numpy as np

from processing.stft import default_window, stft_db


def run_plot_loop(ring, fs: int, stats=None, stop_evt=None, update_sec: float = 0.15):
    ”“”
    ring: RingBuffer
    fs: sample rate
    stop_evt: threading.Event or None
    “”“
    plt.ion()
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 7))

    # Waveform
    line, = ax1.plot([], [], lw=0.8)
    ax1.set_title(”Waveform (RingBuffer Snapshot)“)
    ax1.set_xlabel(”Time (s)“)
    ax1.set_ylabel(”Amplitude“)
    ax1.grid(True, alpha=0.3)
    info = ax1.text(
        0.02, 0.95, ”“,
        transform=ax1.transAxes,
        va=”top“, ha=”left“,
        bbox=dict(boxstyle=”round“, facecolor=”black“, alpha=0.5),
        color=”white“,
    )

    # Spectrogram
    img = None
    window = default_window()

    last_draw = time.time()

    while True:
        if stop_evt is not None and stop_evt.is_set():
            break

        snap = ring.snapshot()
        if snap is None:
            plt.pause(0.01)
            continue

        if time.time() - last_draw < update_sec:
            plt.pause(0.01)
            continue
        last_draw = time.time()

        t = np.arange(len(snap)) / fs
        line.set_data(t, snap)
        ax1.set_xlim(t[0], t[-1])
        ymin, ymax = float(np.min(snap)), float(np.max(snap))
        if ymin == ymax:
            ymin -= 1.0
            ymax += 1.0
        ax1.set_ylim(ymin * 1.1, ymax * 1.1)

        if stats is not None:
            dt = time.time() - stats.get(”t0“, 0.0)
            fps = stats.get(”frames_ok“, 0) / dt if dt > 0 else 0.0
            dropped = stats.get(”dropped“, 0)
            state = stats.get(”state“, ”unknown“)
            features = stats.get(”state_features“, {})
            rms = features.get(”rms“)
            ratio = features.get(”whistle_ratio“)
            extra = ”“
            if rms is not None and ratio is not None:
                extra = f”\nRMS: {rms:.1f}  Ratio: {ratio:.2f}“
            info.set_text(
                f”FPS: {fps:.2f}\nDropped: {dropped}\nState: {state}{extra}“
            )

        S_db, freqs, times_arr = stft_db(snap, fs, window)
        if S_db is not None:
            vmin = float(S_db.max() - 80.0)
            vmax = float(S_db.max())
            if img is None:
                img = ax2.imshow(
                    S_db,
                    origin=”lower“,
                    aspect=”auto“,
                    extent=[times_arr[0], times_arr[-1], freqs[0], freqs[-1]],
                    cmap=”magma“,
                    vmin=vmin,
                    vmax=vmax,
                )
                fig.colorbar(img, ax=ax2, format=”%.0f dB“)
                ax2.set_title(”Spectrogram (dB)“)
                ax2.set_xlabel(”Time (s)“)
                ax2.set_ylabel(”Frequency (Hz)“)
                ax2.set_ylim(0, fs / 2)
            else:
                img.set_data(S_db)
                img.set_extent([times_arr[0], times_arr[-1], freqs[0], freqs[-1]])
                img.set_clim(vmin=vmin, vmax=vmax)

        plt.pause(0.001)
```

</details>

## main.c
- v4 frame format preserved: MAGIC(4B) + SEQ(4B) + PAYLOAD(2048B)
- Scenario synthesis: multi-tone background + 4 kHz whistle + noise-burst fall event
- 10 s loop with randomized event window (xorshift + envelope)
- OLED status display via SSD1306 (I2C), UART 1-byte state updates

<details>
  <summary>main.c (scenario generation)</summary>

This block builds the synthetic signal: background mix + whistle + fall event,
then maps the mixed Q15 signal into 12-bit ADC codes.

```c
#define FS                 16000u
#define SAMPLES_PER_FRAME  1024u
#define PAYLOAD_BYTES      (SAMPLES_PER_FRAME * 2u)
#define FRAME_BYTES        (4u + 4u + PAYLOAD_BYTES)

static const uint32_t MAGIC = 0xAABBCCDD;
static uint32_t g_seq = 0;

static uint8_t  tx_frame[FRAME_BYTES];
static uint16_t tx_payload[SAMPLES_PER_FRAME];

static volatile uint8_t g_state_code = 0;
static uint8_t rx_state_byte = 0;

/* Scenario parameters */
#define TOTAL_SEC          10u
#define TOTAL_SAMPLES      (FS * TOTAL_SEC)

/* Background: multi-tone mix */
static uint32_t phase_bg1 = 0;
static uint32_t phase_bg2 = 0;
static uint32_t phase_bg3 = 0;

/* Whistle */
static uint32_t phase_wh  = 0;

/* Fall event */
static uint32_t g_global_sample_idx = 0;  // 0..TOTAL_SAMPLES-1
static uint32_t fall_start_sample = 0;    // event start (global sample index)
static uint32_t fall_len_samples  = 0;    // event length (samples)

// 256-point sine LUT, Q15 (-32767..32767)
static int16_t sin_lut[256];
static uint8_t lut_inited = 0;

static void init_sin_lut(void) {
  if (lut_inited) return;
  lut_inited = 1;
  for (int i = 0; i < 256; i++) {
    float a = 2.0f * 3.1415926f * (float)i / 256.0f;
    sin_lut[i] = (int16_t)(32767.0f * sinf(a));
  }
}

static inline uint16_t clamp12(int32_t v) {
  if (v < 0) return 0;
  if (v > 4095) return 4095;
  return (uint16_t)v;
}

static inline int16_t sin_q15_from_phase(uint32_t phase) {
  uint8_t idx = (uint8_t)(phase >> 24);  // top 8 bits
  return sin_lut[idx];
}

// Simple xorshift RNG for event timing/noise
static uint32_t rng_state = 0x12345678u;
static uint32_t xorshift32(void) {
  uint32_t x = rng_state;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return rng_state = x;
}
static float rand01(void) {
  return (xorshift32() / 4294967296.0f); // 0..1
}

static void reset_fall_event_window(void) {
  float t0_sec = 5.0f + 0.2f * rand01();   // 5.0~5.2
  float dur_sec = 0.2f;                    // 0.2s

  fall_start_sample = (uint32_t)(t0_sec * FS);
  fall_len_samples  = (uint32_t)(dur_sec * FS);
}

#define PHASE_STEP_FROM_FREQ(f)  ((uint32_t)(((double)(f) * 4294967296.0) / (double)FS))

static void scenario_init(void) {
  init_sin_lut();
  rng_state = 0x12345678u;

  phase_bg1 = 0;
  phase_bg2 = 0;
  phase_bg3 = 0;
  phase_wh  = 0;

  g_global_sample_idx = 0;
  reset_fall_event_window();
}

static inline int16_t gen_bg_q15(void) {
  const int32_t A_bg1 = 400;
  const int32_t A_bg2 = 300;
  const int32_t A_bg3 = 200;

  static const uint32_t STEP_BG1 = PHASE_STEP_FROM_FREQ(200.0);
  static const uint32_t STEP_BG2 = PHASE_STEP_FROM_FREQ(500.0);
  static const uint32_t STEP_BG3 = PHASE_STEP_FROM_FREQ(800.0);

  int16_t s1 = sin_q15_from_phase(phase_bg1);
  int16_t s2 = sin_q15_from_phase(phase_bg2);
  int16_t s3 = sin_q15_from_phase(phase_bg3);

  int32_t acc =
      (A_bg1 * s1) / 32768 +
      (A_bg2 * s2) / 32768 +
      (A_bg3 * s3) / 32768;

  phase_bg1 += STEP_BG1;
  phase_bg2 += STEP_BG2;
  phase_bg3 += STEP_BG3;

  if (acc > 32767) acc = 32767;
  if (acc < -32767) acc = -32767;
  return (int16_t)acc;
}

static inline int16_t gen_whistle_q15(uint32_t global_n) {
  uint32_t start = 3u * FS;
  uint32_t end   = 4u * FS;
  if (global_n < start || global_n >= end) {
    return 0;
  }

  static const uint32_t STEP_WH = PHASE_STEP_FROM_FREQ(4000.0);
  const int32_t A_wh = 8000;

  int16_t s = sin_q15_from_phase(phase_wh);
  phase_wh += STEP_WH;

  int32_t v = (A_wh * s) / 32768;
  if (v > 32767) v = 32767;
  if (v < -32767) v = -32767;
  return (int16_t)v;
}

static inline int16_t gen_fall_q15(uint32_t global_n) {
  if (fall_len_samples == 0) return 0;

  uint32_t start = fall_start_sample;
  uint32_t end   = fall_start_sample + fall_len_samples;
  if (global_n < start || global_n >= end) {
    return 0;
  }

  uint32_t k = global_n - start;
  float pos = (float)k / (float)fall_len_samples; // 0..1

  float env = (pos < 0.5f) ? (pos * 2.0f) : ((1.0f - pos) * 2.0f);
  const float A_fall = 0.8f;

  int32_t noise = (int32_t)((int32_t)xorshift32() & 0xFFFF);
  noise = (noise - 32768) & 0xFFFF;

  float nf = (float)noise / 32768.0f; // -1..1

  float vf = nf * env * A_fall;
  if (vf > 0.999f) vf = 0.999f;
  if (vf < -0.999f) vf = -0.999f;

  int32_t q15 = (int32_t)(vf * 32767.0f);
  return (int16_t)q15;
}

static void fill_payload_scenario(uint16_t *dst, uint32_t n) {
  for (uint32_t i = 0; i < n; i++) {
    uint32_t global_n = g_global_sample_idx;

    int16_t bg_q15 = gen_bg_q15();
    int16_t wh_q15 = gen_whistle_q15(global_n);
    int16_t fall_q15 = gen_fall_q15(global_n);

    int32_t acc_q15 = (int32_t)bg_q15 + wh_q15 + fall_q15;
    if (acc_q15 > 32767) acc_q15 = 32767;
    if (acc_q15 < -32767) acc_q15 = -32767;

    const int32_t Amax = 1500;
    int32_t v = 2048 + (Amax * acc_q15) / 32768;
    dst[i] = clamp12(v);

    g_global_sample_idx++;
    if (g_global_sample_idx >= TOTAL_SAMPLES) {
      g_global_sample_idx = 0;
      reset_fall_event_window();
    }
  }
}
```

</details>

<details>
  <summary>main.c (OLED + UART RX)</summary>

This block updates the OLED display and listens for 1-byte state updates over UART.

```c
static void oled_show_state_centered(const char *state)
{
  uint8_t width = (uint8_t)(8 + (uint8_t)(strlen(state) - 1U) * 9U);
  uint8_t x = (uint8_t)((128U - width) / 2U);
  SSD1306_Clear();
  HAL_UART_Receive_IT(&huart1, &rx_state_byte, 1);
  SSD1306_DrawString(x, 3, state);
}

static void oled_update_state(void)
{
  static uint32_t last_tick = 0;
  static uint8_t last_code = 0xFF;
  const char *states[] = {”NORMAL“, ”WHISTLE“, ”IMPACT“};

  uint32_t now = HAL_GetTick();
  if (g_state_code == last_code && (now - last_tick) < 200U)
    return;
  last_tick = now;

  if (g_state_code < 3)
  {
    oled_show_state_centered(states[g_state_code]);
    last_code = g_state_code;
  }
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  if (huart->Instance == USART1)
  {
    if (rx_state_byte < 3)
      g_state_code = rx_state_byte;
    HAL_UART_Receive_IT(&huart1, &rx_state_byte, 1);
  }
}
```

</details>

<details>
  <summary>main.c (init + main loop)</summary>

This block initializes peripherals, sends framed payloads over UART, and keeps a 64 ms cadence.

```c
  MX_GPIO_Init();
  MX_DMA_Init();
  MX_USART1_UART_Init();
  MX_ADC1_Init();
  MX_I2C1_Init();
  /* USER CODE BEGIN 2 */
  memcpy(tx_frame + 0, &MAGIC, 4);
  init_sin_lut();
  scenario_init();
  SSD1306_Init();
  SSD1306_Clear();
  /* USER CODE END 2 */

  while (1)
  {
    uint32_t t0 = HAL_GetTick();

    uint32_t seq = g_seq++;
    memcpy(tx_frame + 4, &seq, 4);
    fill_payload_scenario(tx_payload, SAMPLES_PER_FRAME);
    memcpy(tx_frame + 8, tx_payload, PAYLOAD_BYTES);

    HAL_UART_Transmit(&huart1, tx_frame, FRAME_BYTES, 1000);
    oled_update_state();

    uint32_t elapsed = HAL_GetTick() - t0;
    if (elapsed < 64)
    {
      HAL_Delay(64 - elapsed);
    }
  }
```

</details>

</details>

