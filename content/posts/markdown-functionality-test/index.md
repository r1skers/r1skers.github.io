---
date: '2025-10-29T17:01:21+09:00'
draft: true
title: 'Markdown Functionality Test (LaTeX and Mermaid)'
summary: "A meta-post testing the rendering capabilities of this blog. Including mathematical formulas (KaTeX) and diagrams (Mermaid)."
cover:
    image: img/avatar.jpg
    alt: 'This is maodie'
    caption: 'this is the caption'  
tags: ["Markdown", "LaTeX", "Mermaid"]
categories: ["Posts"]
---



This post specifically tests the Markdown capabilities of this site, such as LaTeX and Mermaid.

## 1. LaTeX Test

psi function： $ \Psi(x, t) $。

Schrödinger equation：
$$
\begin{aligned}
&i\hbar\frac{\partial}{\partial t}\Psi(x, t) = \left[ -\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x^2} + V(x, t) \right]\Psi(x, t)
\end{aligned}
$$
## 2. Mermaid Test

**Important：** ```mermaid：

```mermaid
flowchart LR
    A[Hard]-->B{Decision}
    B-->C[Result 1]
    B-->E[Result 2]   
```
## 3. Markdown Test

 Supported by Markdown 

```c
#include <stdio.h>
int main() {
    // 这应该会自动高亮
    printf("Hello, World!\n");
    return 0;
}
```

{{< details "这个默认是展开的" open >}}
...内容...
{{< /details >}}

<details>Makeleio>
  <summary>Fourier series</summary>
  
  <p>这里放你被折叠的内容。</p>
  <p>可以有很多行。</p>

</details>


<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Diagram
  </summary>
  
  <br> <img src="Infinite_potential_well-en.svg" alt="一维无限深势阱示意图" width="100%" height="auto">
  <div style="text-align: center; font-size: 11px; color: #888; margin-top: 6px;">
    Author: Krishnavedala (Wikimedia Commons) / License: CC BY-SA 3.0
    <br>
    Source: <a href="https://commons.wikimedia.org/wiki/File:Infinite_potential_well-en.svg" style="color: #007bff; text-decoration: none;">Wikimedia Commons</a>
  </div>
</details>
