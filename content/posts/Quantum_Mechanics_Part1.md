---
date: '2025-11-22T10:17:00+09:00'
draft: false
title: 'Quantum Mechanics Part 1: From Schrödinger to Wave Functions[To be continued]'
tags: ["basic", "Quantum Mechanics"]
categories: ["Promethean Fire", "Fireside Notes"]
---
This article is actually used to prepare for test, but during the review, I realized how imperative quantom mechanics it is, So I decided to summarize my notes in detail.
# After Reading
<details>
    <summary>1.为什么波函数在推导时只需要关注x轴？</summary>
</details>
<details>
    <summary>2.为什么波函数在推导时只取虚部？</summary>
</details>
<details>
    <summary>3.为什么电子不适用于经典波动方程？</summary>
</details>

# Introduce
为什么我们工程研究时要用到量子力学，一个最直接的原因是摩尔定律到达极限了。摩尔定律说的是集成电路上的晶体管数量每 18~24 个月翻一番，芯片性能也跟着暴涨。但这个定律能持续几十年，核心是晶体管越做越小，从早期的微米级，到现在手机、FPGA 里的晶体管已经小到3 纳米、2 纳米级别，甚至快逼近 1 纳米了。这个时候，不考虑量子的性质就不可行了，这就是量子力学的必要性。
# The Failure of Classical Physics & Duality
## Classic Physics 的局限
当存在高速运动、微观尺度或极端条件时，经典力学的适用性就会受到限制。首先，当物体的运动速度接近光速时，经典力学的速度叠加定律和动量定律将失效。其次，当研究微观尺度下的物体时，例如原子、分子和粒子，经典力学的宏观近似将不再适用。在微观尺度下，存在量子力学效应，例如波粒二象性、不确定性原理等，它们无法通过经典力学的框架进行解释。
## Wave-Particle Duality
### 光的波动性
光的波动性是由众多实验观测得来的，不仅仅是杨氏双缝干涉实验，还有光的衍射实验，光的偏振实验等等。根据前人的成果，有以下公式：<p>
#### 光的麦克斯韦方程式：
$$c=f\lambda$$
$c$: velocity of speed<p>
$f$: frequency<p>
$\lambda$: wavelength<p>

### 光的粒子性
光的粒子性同样是有众多实验观察得来的，包括康普顿效应。光的粒子性体现在能量E，动量p上，有以下公式:<p>
#### 一个光子的能量大小：

$$E=hf=h\frac{c}{\lambda}=h\frac{\omega}{2\pi}=\hbar\omega$$

$h$ :普朗克常量<p>

$\hbar$ :约化普朗克常量，数值上等于普朗克常量除以$2\pi$,即$\hbar=\frac{h}{2\pi}$

#### 一个光子的动能大小：
$$p=\frac{h}{\lambda}=h\frac{k}{2\pi}=\hbar k$$

$k$: 在$2\pi$长度的空间内，光波完整振动的次数

### 电子的波粒二象性
#### 德布罗意波
参考光的动量方程$p=\frac{h}{\lambda}$

$$\lambda=\frac{h}{p}=\frac{h}{mv}$$

$m$: mass<p>
$v$: velocity<p>

### 哥本哈根解释
1.  一个量子系统的量子态可以用波函数来完全地表述。波函数代表一个观察者对于量子系统所知道的全部信息。<p>
2.  量子系统的描述是概率性的。一个事件的概率是波函数的绝对值平方。<p>
3.  不确定性原理阐明，在量子系统里，一个粒子的位置和动量无法同时被确定。
# The Wave Function
## 一维波函数的推导
首先根据欧拉公式

$$e^{ix}=cos(x)+isin(x)$$

我们可以用以下式子来描述在x轴上传播的波

$$\Psi(x,t)=Acos(k(x-vt)+\theta_0)$$

这里根据这个推导

$$v=f\lambda=\frac{\omega}{2\pi} \cdot \frac{2\pi}{k}=\frac{\omega}{k}$$

结合欧拉公式，发现其实求的是实部

$$\Psi(x,t)=Acos(kx-\omega t+\theta_0)=\mathrm{Re}[Ae^{i(kx-\omega t+\theta_0)}]$$

不取实部，这里$Ae^{i\theta_0}$是复振幅，用$\widetilde{A}$代替后得到波函数

$$ \Psi(x,t)=\widetilde{A}e^{i(kx-\omega t)}$$
## 波恩统计解释（概率密度）规格化条件
### 波恩统计解释
这部分非常有趣，首先要明确我们刚求的$\Psi$是什么，Max Born 在 1926 年提出了一个大胆的假设，这也让他拿到了诺贝尔奖。<p>
核心概念： 本身没有直接的物理意义（你不能测量它），但是它的模方 (Modulus Squared) 代表了粒子在某处出现的概率密度 (Probability Density)。

$$P(x, t) = |\Psi(x, t)|^2 = \Psi^*(x, t) \cdot \Psi(x, t)$$

<a href="">也许有人发现了一些有趣的东西。。。（Tips:Correlation）</a>

### Normalization Condition
既然$|\Psi|^2$代表概率密度，那么这就引出了一个逻辑上的必然结论： **电子必须存在于宇宙中的某个地方。** 
如果我们在整个x轴上寻找这个电子，找到它的总概率必须是 100% (即 1)。

$$\int_{-\infty}^{+\infty} |\Psi(x, t)|^2 \, dx = 1$$

<a href="">也许有人发现了一些有趣的东西。。。（Tips:Dirac delta function）</a>

归一化就是用来算出$\widetilde{A}$的唯一工具。 没有归一化，我们的方程就只是一个比例，而不是精确的预测。

## Classical Wave Equation(d'Alembert Equation)

从波函数开始分别对x,t做二次求导，得到式子

$$\frac{\partial^2 \Psi}{\partial x^2} = (ik)^2 \Psi = -k^2 \Psi$$

$$\frac{\partial^2 \Psi}{\partial t^2} = (-i\omega)^2 \Psi = -\omega^2 \Psi$$

利用前面已经推导的$v=\frac{\omega}{k}$,可以得到$k^2=\frac{\omega^2}{v^2}$，带入上面二式可以得到经典波动方程：

$$（\frac{\partial^2}{\partial x^2} - \frac{1}{v^2} \frac{\partial^2}{\partial t^2} ）\Psi(x,t)= 0$$

这个方程的意义是：任何在真空中传播的光（电磁波），都必须严格遵守这个法律.<p>
<a href="">电子不能用这个方程</a>

# The Schrödinger Equation
## 推导
我们从能量守恒(动能加势能)入手：

$$E=K(t)+V(t)=\frac{p^2}{2m}+V(t)$$

这里引入两个算符（计算的过程）

$$\hat{p} = -i\hbar \frac{\partial}{\partial x}$$

$$\hat{E} = i\hbar \frac{\partial}{\partial t}$$

两边同时处理$\Psi(x,t)$

$$[-\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x^2}+V(t)]\Psi(x,t)=i\hbar\frac{\partial}{\partial t}\Psi(x,t)$$

带入哈密顿算符$\hat{H}$

$$\hat{H}\Psi(x,t)=i\hbar\frac{\partial}{\partial t}\Psi(x,t)$$

## 含时薛定谔方程
从这里开始：

$$\hat{H}\Psi(x,t)=i\hbar\frac{\partial}{\partial t}\Psi(x,t)$$

首先对波函数进行性参数分离

$$\Psi(x,t)=\psi(x)f(t)$$

代回原式
$$\frac{1}{\psi(x)} \left[ -\frac{\hbar^2}{2m} \frac{d^2 \psi(x)}{dx^2} \right] + V(x) = \frac{i\hbar}{f(t)} \frac{df(t)}{dt}=E$$

或者是带入哈密顿算符

$$\frac{\hat{H}\psi(x)}{\psi(x)}=\frac{i\hbar}{f(t)}\frac{df(t)}{dt}$$



这里的意义是让等号左边只与空间x相关，右边只与时间t相关，二者都等于常数$E$。
## 不含时薛定谔方程

这里接着含时薛定谔方程

$$\frac{1}{\psi(x)} \left[ -\frac{\hbar^2}{2m} \frac{d^2 \psi(x)}{dx^2} \right] + V(x) = \frac{i\hbar}{f(t)} \frac{df(t)}{dt}=E$$

两边乘以$\psi(x)$

$$-\frac{\hbar^2}{2m} \frac{d^2 \psi(x)}{dx^2} + V(x)\psi(x)=E\psi(x)$$

处理下

$$\psi(x) \left[ -\frac{\hbar^2}{2m} \frac{d^2}{dx^2}+V(x) \right]=E\psi(x)$$

带入哈密顿算符$\hat{H}$

$$\hat{H}\psi=E\psi$$

# 量子井户(薛定谔方程实战)

## 无限障壁
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Infinite Square Potential Well Diagram
  </summary>
  
  <br> <img src="/img/diagram/无限深势阱示意图.png" alt="一维无限深势阱示意图" width="100%" height="auto">
</details>

首先，我们建立一个最简单的模型。 想象一个电子被困在一个宽度为$L$的盒子里，墙壁无限高，电子绝对跑不出去。<p>
井内($0 < x < L$)：$V(x) = 0$（电子自由飞翔）。<p>
井外 (其他区域)：$V(x) = \infty$（电子绝对去不了，概率为 0）。

计算如下：<p>
首先因为势能不随时间变化，所以我们用不含时薛定谔方程：$\hat{H}\psi=E\psi$，同时因为在L区域内$V(x)=0$,得到式子如下：

$$-\frac{\hbar^2}{2m} \frac{d^2 \psi}{dx^2} = E \psi$$

整理得：

$$\frac{d^2 \psi}{dx^2} + \frac{2mE}{\hbar^2} \psi = 0$$

回顾之前的推导$E=\frac{p^2}{2m}$,$p=i\hbar$,代入得到Helmholtz Equation

$$\frac{d^2 \psi}{dx^2} + k^2 \psi = 0$$

一眼微分方程，解为：

$$\psi(x) = A \sin(kx) + B \cos(kx)$$

接下来是边界条件，因为不可能在墙上：

$$\psi(0)=B=0$$

$$\psi(L)=Asin(kx)=0$$

这意味着$kL = n\pi \quad (n = 1, 2, 3, \dots)$

接下来调查归一化条件，势阱外波函数为0，所以可以简化为：

$$\int_{0}^{L} |\psi(x)|^2 \ dx = 1$$

带入$\psi(x)=A\sin(\frac{nx\pi}{L})$

$$A^2 \int_{0}^{L} \sin^2\left( \frac{n\pi x}{L} \right) \ dx = 1$$

通过降幂，解方程得：

$$A^2 = \frac{2}{L} \implies A = \sqrt{\frac{2}{L}}$$

归一化后波函数：

$$\psi_n(x) = \sqrt{\frac{2}{L}} \sin\left( \frac{n\pi x}{L} \right)$$

$$E_n = \frac{\hbar^2 k^2}{2m} = \frac{n^2 \pi^2 \hbar^2}{2m L^2}$$

### python simulation
<details>
  <summary>Code</summary>

```python
import numpy as np
import matplotlib.pyplot as plt

# --- 1. 物理参数设定 ---
L = 1.0          # 势井宽度 (比如 1nm)
x = np.linspace(0, L, 1000)  # 在 0 到 L 之间生成 1000 个点

# --- 2. 定义波函数 ---
# 公式: psi = sqrt(2/L) * sin(n * pi * x / L)
def get_psi(n, x, L):
    return np.sqrt(2/L) * np.sin(n * np.pi * x / L)

# --- 3. 绘图设置 ---
plt.figure(figsize=(8, 6), dpi=120) # 设置画布大小和清晰度
plt.title("Infinite Square Well: Wave Functions & Probability", fontsize=14)
plt.xlabel("Position $x/L$", fontsize=12)
plt.ylabel("Energy Levels (Schematic)", fontsize=12)

# 为了美观，我们设定一些颜色
colors = ['#FF5733', '#33FF57', '#3357FF'] # 红、绿、蓝
levels = [1, 2, 3] # 我们画前三个能级

# --- 4. 循环画出 n=1, 2, 3 ---
for i, n in enumerate(levels):
    # 计算波函数
    psi = get_psi(n, x, L)
    
    # 计算概率密度 |psi|^2
    prob = psi**2
    
    # 设定一个基准高度，代表能量 E_n
    # 为了显示清楚，我们人工拉开间距，不完全按 n^2 比例，否则 n=1 会被压扁
    energy_level = n * 40 
    
    # 画基准线 (虚线)
    plt.axhline(y=energy_level, color='gray', linestyle='--', alpha=0.5)
    plt.text(-0.1, energy_level, f'n={n}', color=colors[i], fontweight='bold', fontsize=12)
    
    # 画波函数 (实线) - 这里的 + energy_level 是为了把它平移上去
    # 乘以 5 是为了放大波幅，让它在图上看得更清楚
    plt.plot(x, psi * 5 + energy_level, color=colors[i], label=f'$\psi_{n}(x)$')
    
    # 画概率密度 (填充颜色)
    # fill_between(x轴, 下限, 上限)
    plt.fill_between(x, energy_level, (prob * 5) + energy_level, 
                     color=colors[i], alpha=0.2, label=f'$|\psi_{n}|^2$ Probability')

# --- 5. 画势井的墙壁 ---
plt.axvline(0, color='black', linewidth=3)
plt.axvline(L, color='black', linewidth=3)
plt.text(0, 0, 'V = $\infty$', ha='right', va='bottom', fontsize=12)
plt.text(L, 0, 'V = $\infty$', ha='left', va='bottom', fontsize=12)

# 隐藏 Y 轴刻度 (因为是示意图)
plt.yticks([])
plt.xlim(-0.2, 1.2) # 留一点边距

# 导出建议: plt.savefig('quantum_well.png')
plt.show()
```
</details>
<details>
  <summary>matplotlib output</summary>
  
  <details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    无限深势阱的能量图
  </summary>
  
  <br> <img src="/img/diagram/无限深势阱的能量图.png" alt="Diagram" width="100%" height="auto">

  </details>
关键点：<p>
1.阴影面积就是概率。<p>
2.波函数穿过0的那个点的位置：概率为0，有正负是因为发生了隧穿效应。
</details>

## 有限障壁
<details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    Finite Square Potential Well Diagram
  </summary>
  
  <br> <img src="/img/diagram/有限深势阱示意图.png" alt="一维有限方势阱（含波函数隧穿效应）" width="100%" height="auto">
</details>

同样，根据上面的图

$$
V(x) =
\begin{cases}
  0, & |x| < \frac{L}{2} \\\\
  V_0, & \text{otherwise}
\end{cases}
$$

我们要分三个区域，领域一（$x<-\frac{L}{2}$）,领域二（$-\frac{L}{2}<x<\frac{L}{2}$）,领域三（$x>\frac{L}{2}$）<p>
首先分析领域二（$-\frac{L}{2}<x<\frac{L}{2}$），这里和无限量势阱是相似的

$$\psi'' + k^2\psi = 0$$

数学通解为：

$$\psi_{II}(x) = A_2\cos(kx) +B_2\sin(kx)$$

领域一（$x<-\frac{L}{2}$）

$$\psi'' - \kappa^2\psi = 0$$

数学通解为：

$$\psi_I(x) = A_1e^{\kappa x} + B_1e^{-\kappa x}$$

物理筛选：当 $x \to -\infty$ 时，$e^{-\kappa x}$ 会变成无穷大（物理上不允许）。<p>
最终解为：

$$\psi_I(x) = A_1e^{\kappa x}$$

领域三（$x>\frac{L}{2}$）

$$\psi'' - \kappa^2\psi = 0$$

数学通解为：

$$\psi_{III}(x) = A_3e^{\kappa x} + B_3e^{-\kappa x}$$

物理筛选：当 $x \to +\infty$ 时，$e^{\kappa x}$ 会变成无穷大。最终解为：

$$\psi_{III}(x) = B_3e^{-\kappa x}$$

边界条件（在边界的时候波函数相同），可以解得超越函数，可解能量和概率：

$$k \tan(kL/2) = \kappa$$

### python simulation
<details>
  <summary>Code</summary>

```python
import numpy as np
import matplotlib.pyplot as plt

# --- 1. 设定示意性参数 ---
L = 2.0           # 井宽 (示意值，比如 2nm，从 -1 到 1)
V0 = 10.0         # 墙高 (示意值)
x = np.linspace(-L*1.5, L*1.5, 1000) # 画宽一点，展示墙外

# 定义区域
inside_mask = np.abs(x) <= L/2
outside_mask = np.abs(x) > L/2

# --- 2. 构造示意性波函数 (非精确解，仅做视觉展示) ---
# 我们需要手动调整 k (波数) 和 kappa (衰减系数) 来让图看起来像真的
# 关键点：能量越高(n越大)，kappa越小(衰减越慢，渗透越深)

def get_schematic_psi(n, x, L):
    psi = np.zeros_like(x)
    
    # --- 手动调参区 (Magic Numbers for visuals) ---
    if n == 1:   # 基态 (偶对称 cos)
        E_schematic = 2.0
        k = np.pi / (L * 1.1)  # 波长比无限井稍微长一点点
        kappa = 3.5            # 衰减较快
        
        # 井内
        psi[inside_mask] = np.cos(k * x[inside_mask])
        # 边界值 (用于缝合)
        boundary_val = np.cos(k * L/2)
        # 井外 (指数衰减)
        psi[outside_mask] = boundary_val * np.exp(-kappa * (np.abs(x[outside_mask]) - L/2))
        
    elif n == 2: # 第一激发态 (奇对称 sin)
        E_schematic = 7.5
        k = 2 * np.pi / (L * 1.15)
        kappa = 1.5            # 能量高了，衰减变慢了 (渗透更深!)
        
        # 井内
        psi[inside_mask] = np.sin(k * x[inside_mask])
        # 边界值
        boundary_val = np.sin(k * L/2)
        # 井外 (指数衰减，注意要乘 sign(x) 保持奇对称)
        psi[outside_mask] = boundary_val * np.exp(-kappa * (np.abs(x[outside_mask]) - L/2)) * np.sign(x[outside_mask])
        
    # 归一化视觉幅度
    psi = psi / np.max(np.abs(psi))
    return psi, E_schematic

# --- 3. 绘图设置 ---
plt.figure(figsize=(10, 7), dpi=120)
plt.style.use('seaborn-v0_8-whitegrid')

# 画势阱 V(x) 的轮廓
V_x = np.zeros_like(x)
V_x[outside_mask] = V0
plt.plot(x, V_x, color='black', linewidth=3, alpha=0.6, label='Potential $V(x)$')
plt.fill_between(x, V_x, V0+2, color='gray', alpha=0.2) # 给墙壁上色

# --- 4. 循环画出能级 n=1, n=2 ---
colors = ['#E63946', '#1D3557'] # 红、蓝
states = [1, 2]

for i, n in enumerate(states):
    psi, E_level = get_schematic_psi(n, x, L)
    prob = psi**2
    
    # 画能级基准线
    plt.axhline(E_level, color=colors[i], linestyle='--', alpha=0.5)
    plt.text(-L*1.4, E_level, f'State n={n}\n(Bound)', color=colors[i], va='center', fontweight='bold')
    
    # 画波函数 (稍微放大一点平移到能级上)
    scale_factor = 1.5
    plt.plot(x, psi * scale_factor + E_level, color=colors[i], linewidth=2, alpha=0.8, label=f'$\psi_{n}$')
    
    # 画概率密度 (重点展示渗透！)
    plt.fill_between(x, E_level, prob * scale_factor + E_level, color=colors[i], alpha=0.3)

# --- 5. 装饰图表 ---
# 标出关键区域
plt.axvline(-L/2, color='black', linestyle=':', alpha=0.5)
plt.axvline(L/2, color='black', linestyle=':', alpha=0.5)
plt.text(0, -1, 'Inside Well ($V=0$)\nOscillation', ha='center', fontsize=11)
plt.text(-L, -1, 'Barrier ($V=V_0$)\nDecay', ha='center', fontsize=11)
plt.text(L, -1, 'Barrier ($V=V_0$)\nDecay', ha='center', fontsize=11)

# 标注 V0
plt.text(L*1.1, V0, '$V_0$ (Barrier Height)', va='center', fontsize=12)

# 重点：标注渗透现象
plt.annotate('Penetration (Quantum Tunneling Tail)', 
             xy=(L/2 + 0.2, E_level + 0.2), 
             xytext=(L/2 + 0.8, E_level + 2),
             arrowprops=dict(facecolor='black', arrowstyle='->'),
             fontsize=10, color='darkblue')


plt.title('Finite Potential Well: Wave Function Penetration (Schematic)', fontsize=14)
plt.xlabel('Position $x$ (Center origin)', fontsize=12)
plt.ylabel('Energy', fontsize=12)
plt.yticks([]) # 隐藏Y轴刻度
plt.xticks([-L/2, 0, L/2], ['$-L/2$', '$0$', '$L/2$']) # 设置X轴刻度
plt.xlim(-L*1.5, L*1.5)
plt.ylim(-2, V0 + 3)
plt.legend(loc='upper right')

plt.tight_layout()
plt.show()
# plt.savefig('finite_well_schematic.png')
```
</details>
<details>
  <summary>matplotlib output</summary>
  
  <details>
  <summary style="cursor: pointer; color: #007bff; text-decoration: underline;">
    有限深势阱的能量图
  </summary>
  
  <br> <img src="/img/diagram/有限深势阱的能量图.png" alt="Diagram" width="100%" height="auto">

  </details>
关键点：<p>
1.比较一下 （低能量，红色）和 （高能量，蓝色）。会发现蓝色的尾巴衰减得更慢，伸得更远。这很符合直觉：电子能量越高，它就越‘不安分’，向墙里钻得就越深。<p>
2.看这些延伸到墙壁里的彩色阴影！在经典物理中，这是绝对禁区。但在量子力学中，波函数没有在边界突然截止，而是以指数形式衰减。这证明了电子有一定概率存在于势垒内部。这就是‘隧道效应’的根本原因。
</details>

# Conclusion & Uncertainty Principle 