---
date: '2025-10-29T17:01:21+09:00'
draft: false
title: 'First'
cover:
    image: img/avatar.jpg
    alt: 'This is maodie'
    caption: 'this is the caption'
tags: ["basic", "markdown"]
categories: ["Promethean Fire"]
---



这是我的功能测试笔记。

## 1. 数学公式 (LaTeX) 测试

这是行内公式： $ \Psi(x, t) $。

这是薛定谔方程的块级公式：
$$
\begin{aligned}
&i\hbar\frac{\partial}{\partial t}\Psi(x, t) = \left[ -\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x^2} + V(x, t) \right]\Psi(x, t)
\end{aligned}
$$
## 2. 流程图 (Mermaid) 测试

**重要：** 要让 Mermaid.js 识别图表，您**必须**使用这个特殊的 `div` 标签：

<div class="mermaid">

flowchart LR

A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]

</div>

## 3. 代码 (Markdown) 测试

这部分是 Markdown 原生支持的：

```c
#include <stdio.h>
int main() {
    // 这应该会自动高亮
    printf("Hello, World!\n");
    return 0;
}
```

## 4.这下咱们来试试图片！
![RUNOOB 图标](https://static.jyshare.com/images/runoob-logo.png)

![RUNOOB 图标](https://static.jyshare.com/images/runoob-logo.png "RUNOOB")

<img src="https://static.jyshare.com/images/runoob-logo.png" width="50%">

