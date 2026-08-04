---
date: '2025-10-29T19:01:21+09:00'
draft: false
title: '线性系统第3部分：RLC电路分析（微分方程 vs 拉普拉斯变换）'
summary: "比较二阶线性电路的两种求解路径：传统微分方程法与拉普拉斯变换法，并展示拉普拉斯在含初值问题中的工程优势。"
tags: ["Mathematics", "Signal & Systems", "Laplace Transform"]
categories: ["Notes"]
series: ["Signal and Systems"]
note_kind: "foundation"
aliases:
  - /notes/note-linsys-3-laplace-pde/
---

# RLC 电路分析：微分方程法与拉普拉斯法对比

## 问题背景

课堂上分析振荡电路时，我们常通过二阶线性微分方程来求解。  

标准流程是先求齐次解（自然响应）和特解（受迫响应），再利用初值求常数。  

但在实际计算里，尤其是求电流 $i(t)=\frac{dq}{dt}$ 时，指数项与三角项的求导组合很容易变得繁琐且易错。  

这就是我想比较拉普拉斯法的原因：它是否更系统、更适合工程推导。  

## 例题：受迫串联 RLC 电路

考虑如下串联 RLC 电路，假设开关在 $t=0$ 闭合：  

<br> <img src="RLC示例图1.png" alt="RLC示例图" width="50%" height="auto">

```python
import schemdraw
import schemdraw.elements as elm
with schemdraw.Drawing(file='RLC示例图1') as d:
    d += (V1 := elm.SourceSin().up().label('$V_{in}$\n$1000V$'))
    d += elm.Resistor().right().label('$R$\n$100\Omega$')
    d += elm.Inductor().right().label('$L$\n$4mH$')
    d += elm.Capacitor().down().label('$C_1$\n$0.1\mu F$')
    d += elm.Line().left().to(V1.start)
    d += elm.Label().label("RLC Series Circuit 1").at((3, -2))

print("图片已生成！")
```


***

电路的 KVL 方程（以电荷 $q$ 表示）为：  
$$L \frac{d^2q}{dt^2} + R \frac{dq}{dt} + \frac{1}{C} q = E(t)$$

代入参数：  
$$0.004 q'' + 100 q' + \frac{1}{10^{-7}} q = 1000$$
$$0.004 q'' + 100 q' + 10,000,000 q = 1000$$

再除以 $L=0.004$：  
$$q'' + 25000 q' + 2,500,000,000 q = 250,000$$

目标是求电流 $i(t)$。  

---

### 方法1：传统微分方程法

总解写作 $q(t)=q_p(t)+q_h(t)$，其中 $q_p$ 为特解，$q_h$ 为齐次解。  

**1) 特解 $q_p$：**  

当 $t\to\infty$，电感近似短路、电容近似开路，故 $i(\infty)=0$，电容电压等于电源电压。  

$$q_p = C \times E = (10^{-7} \text{ F}) \times (1000 \text{ V}) = 10^{-4} \text{ C}.$$

**2) 齐次解 $q_h$：**  

求解特征方程  
$$q_h'' + 25000 q_h' + 2.5 \times 10^9 q_h = 0$$
$$s^2 + 25000s + 2,500,000,000 = 0$$

写成标准形式 $s^2+2\alpha s+\omega_0^2=0$，得：  
- 阻尼系数 $\alpha=\frac{R}{2L}=\frac{100}{2(0.004)}=12500$  
- 固有角频率 $\omega_0=\frac{1}{\sqrt{LC}}=\frac{1}{\sqrt{0.004\times10^{-7}}}=50000$  

因为 $\alpha\lt\omega_0$，系统为欠阻尼，根为 $s_{1,2}=-\alpha\pm j\omega_d$。

$$\omega_d=\sqrt{\omega_0^2-\alpha^2}=\sqrt{50000^2-12500^2}=12500\sqrt{15}\ \text{rad/s}$$

所以  
$$q_h(t)=e^{-12500t}\left(A\cos(12500\sqrt{15}\,t)+B\sin(12500\sqrt{15}\,t)\right)$$

**3) 合成总解并代入初值：**  

$$q(t)=10^{-4}+e^{-12500t}\left(A\cos(\omega_d t)+B\sin(\omega_d t)\right)$$

代入 $q(0)=0$：  
$$A=-10^{-4}$$

对总解求导得到电流：  
$$
i(t)=q'(t)=e^{-12500t}\left(-A\omega_d\sin(\omega_d t)+B\omega_d\cos(\omega_d t)\right)-12500e^{-12500t}\left(A\cos(\omega_d t)+B\sin(\omega_d t)\right)
$$

代入 $i(0)=q'(0)=0$：  
$$B\omega_d-12500A=0$$
$$B=-\frac{10^{-4}}{\sqrt{15}}$$

**4) 电流表达式：**  

为了得到最终 $i(t)$，还需把 $A,B$ 带回大表达式并继续求导整理，步骤较繁琐，容易出错。  

---

### 方法2：拉普拉斯变换法（更直接）

我们直接对电流建立方程，先写时域 KVL：  
$$L \frac{di}{dt} + Ri + \frac{1}{C} \int_0^t i(\tau) d\tau + v_c(0) = E(t)$$

拉普拉斯变换（已知 $i(0)=0,\ v_c(0)=q(0)/C=0$）：  
$$L[sI(s) - i(0)] + RI(s) + \frac{1}{C} \frac{I(s)}{s} = \frac{E}{s}$$
$$L sI(s) + RI(s) + \frac{1}{Cs} I(s) = \frac{E}{s}$$

两边乘以 $s$：  
$$L s^2 I(s) + R s I(s) + \frac{1}{C} I(s) = E$$
$$I(s) \left( Ls^2 + Rs + \frac{1}{C} \right) = E$$
$$I(s) = \frac{E}{Ls^2 + Rs + 1/C}$$

再除以 $L$：  
$$I(s) = \frac{E/L}{s^2 + (R/L)s + 1/LC}$$

代入参数：  
$$I(s) = \frac{250,000}{s^2 + 25000s + 2,500,000,000}$$

配方：  
$$s^2 + 25000s + 2.5 \times 10^9 = (s + 12500)^2 + (12500\sqrt{15})^2$$

因此  
$$I(s) = \frac{250,000}{(s + 12500)^2 + (12500\sqrt{15})^2}$$

匹配逆变换对  
$$\mathcal{L}^{-1} \left\{ \frac{b}{(s+a)^2 + b^2} \right\} = e^{-at} \sin(bt)$$

先调整分子：  
$$I(s)=\left(\frac{250,000}{12500\sqrt{15}}\right)\cdot\frac{12500\sqrt{15}}{(s+12500)^2+(12500\sqrt{15})^2}$$
$$\frac{250,000}{12500\sqrt{15}}=\frac{20}{\sqrt{15}}$$

于是  
$$i(t)=\frac{20}{\sqrt{15}}e^{-12500t}\sin(12500\sqrt{15}\,t)\ \text{(A)}$$

## 小结

- **传统微分方程法：** 步骤完整但计算重，尤其在求导和代入环节容易累积错误。  
- **拉普拉斯法：** 初值自动进入代数方程，流程更直接、可复用性更高。  
- **工程启发：** 对含初值、受迫项的线性电路，拉普拉斯法通常是更优先的求解路径。  
