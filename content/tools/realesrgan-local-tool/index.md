---
title: "RealESRGAN Local Tool (Download)"
date: "2026-02-16T00:00:00+08:00"
draft: false
summary: "Download, unzip, and run RealESRGAN locally."
tags: ["Tooling", "Image Processing", "Machine Learning"]
categories: ["Tools"]
weight: 3
---

## Download

- ZIP: [RealESRGAN_LocalTool_20260216-r1.zip](/downloads/realesrgan/RealESRGAN_LocalTool_20260216-r1.zip)
- This package already includes the required notices and license files.

## Quick Start

1. Download the ZIP file and extract it to any local folder.
2. Open terminal in `RealESRGAN_LocalTool_20260216-r1/realesrgan_api`.
3. Run CLI (example):

```powershell
python .\realesrgan_cli.py `
  -i "C:\path\to\input.jpg" `
  -o "C:\path\to\output.png" `
  -n realesrgan-x4plus -s 4 -f png
```

## Notes

- Folder layout is designed for auto-discovery:
  - `realesrgan_api/`
  - `realesrgan-ncnn-vulkan-20220424-windows/`
- If VRAM is low, add `-t 128` or `-t 256`.
- Anime images: use `-n realesrgan-x4plus-anime`.

## Open Source Attribution

- Third-party notices and license files are included inside the ZIP (`THIRD_PARTY_NOTICES.md` and `LICENSES/`).

- Upstream repositories:
  - [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)
  - [Real-ESRGAN-ncnn-vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)

## Acknowledgement

This page was created with assistance from OpenAI Codex.
