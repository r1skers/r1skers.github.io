---
date: '2026-04-20T18:10:00+09:00'
draft: false
title: "[Artifact-4] DEM 地貌稳定性 Demo 复盘"
summary: "一个基于公开 DEM 的小型地形分析实验：比较不同预处理强度下坡度与曲率代理指标的响应，观察大尺度地貌骨架与小尺度地形表达的稳定性差异。"
description: "Artifact-4 记录 dem-landform-stability-lab 的完整学习链：研究区裁剪、DEM 预处理、整区地形指标比较、局部窗口对照，以及对地貌解释边界的复盘。"
tags:
  - "Artifact"
  - "DEM"
  - "Terrain Analysis"
  - "Geomorphology"
  - "Preprocessing"
categories:
  - "Artifacts"
weight: 40
---

项目地址：[dem-landform-stability-lab](https://github.com/r1skers/dem-landform-stability-lab)

# 问题设置

**基于公开 DEM 的小区域地形分析：不同预处理条件下地貌特征识别的稳定性，以及它们可能对应的解释边界。**

这个项目不是反演问题，也不是 PDE 数值求解问题。  
它更接近一个小型的地形分析 / 地貌解释导向 DEM demo：

- 选取真实公开 DEM
- 对同一研究区施加不同预处理
- 比较 `slope` 和 `curvature proxy`
- 看哪些地貌特征更稳，哪些更敏感

因为是学习 demo，这里使用的是 [USGS The National Map Downloader](https://apps.nationalmap.gov/downloader/) 提供的公开 DEM 数据（`n45w121`, `n45w122`）。

## 这篇文章真正想回答什么

一个很具体的问题：

> 在不同预处理强度下，大尺度地貌骨架是否仍然稳健？  
> 哪些小尺度地形表达会更先受到影响？

# 数据处理阶段

这一阶段有三个步骤：

1. `inspect_dem.py`
2. `crop_study_area.py`
3. `preprocess_dem.py`

这三个脚本对应的任务分别是：

- 确认 DEM 文件本身能不能正常读取
- 从大图幅里裁出真正的研究区
- 最后构造 raw / mild / strong 三个可比较的输入版本

总体目标是把数据变成一个**可控的比较对象**。

# 第一步：检查原始 DEM（`inspect_dem.py`）

脚本中主要是三个步骤：

- 读取原始 `.tif` DEM
- 把 `nodata` 转成 `NaN`，方便后续统计
- 打印基本元信息并导出 quicklook

具体来说，这一步检查：

- `shape`
- `resolution`
- `bounds`
- `crs`
- `nodata`
- 高程最小值、最大值、平均值

以及导出一张快速预览图，方便判断：

- 这块数据是不是太大
- 地形起伏是否足够明显
- 该不该继续往下做裁剪

![原始研究区候选 quicklook](study_area_candidate_a_quicklook.png)

# 第二步：裁剪研究区（`crop_study_area.py`）

原始下载的 DEM 图幅很大，不适合直接拿来做项目主体分析。  
原因是：

- 范围太大
- 地貌单元太杂
- 后面解释梯度会发散
- 计算和出图笨重

所以第二步：  
从较大的原始 tile 中裁出一个**研究区**。

在当前版本里，这个研究区是从 `USGS_13_n45w121_20260202.tif` 中裁出来的一个 ridge-hillslope-valley 单元，保存在：

`study_area_candidate_a_n45w121.tif`

这一块满足当前项目需要的几个条件：

- 有清楚的 ridge
- 有 valley / drainage
- 有坡面过渡
- 结构完整但不过于复杂

这一步的意义是：

**把“大而散的原始 DEM”收缩成“一个可以围绕研究问题做比较的小对象”。**

# 第三步：构造预处理对比（`preprocess_dem.py`）

有了研究区之后，就进入预处理阶段，目的是构造一个可比较的实验设计。

脚本最终生成三个版本：

- `Raw DEM`
- `Mild smoothing`
- `Strong smoothing`

当前版本使用的是高斯平滑：

- mild: `sigma = 1.0`
- strong: `sigma = 3.0`

这里更适合把它理解为：

**平滑不是为了粗暴“去噪”，而是为了比较不同处理强度下，地形表达会怎么变。**

所以这里的预处理更像是一个“受控扰动”：

- 大地形骨架是否还在？
- 局部坡折是否开始变钝？
- 曲率响应是否更快向 0 收缩？

这也自然引出后面要计算的 `slope` 和 `curvature proxy`。

![三种预处理对比](study_area_candidate_a_preprocessing_comparison.png)

# 第四步：计算地形指标（`terrain_metrics_stage1.py`）

有了三组输入版本之后，接下来的问题转变成：

- 哪些地形表达出现变化？
- 哪些变化是大尺度的，哪些是小尺度的？
- 哪些特征在预处理下仍然稳定？

这一阶段我计算了三个地形指标：

- `hillshade`
- `slope`
- `curvature proxy`

## hillshade：帮助重新“看懂”研究区

`hillshade` 的作用是把 DEM 从抽象高程矩阵转成更接近人眼直觉的地形表面。

在这个项目里，hillshade 主要用来回答：

- ridge / valley 的骨架还在不在？
- 预处理有没有立刻把研究区“变成另一个地形”？

当前结果说明：

**raw / mild / strong 三个版本下，大尺度 ridge-valley 骨架都仍然能被识别。**

这意味着：

- 预处理没有立刻破坏研究区的大结构
- 当前 smoothing 强度还在合理范围内

## slope：看局部陡变是否被削弱

`slope` 是第一个真正有量化意义的地形指标。  
它关心的是：

**高程变化有多快，也就是地形有多陡。**

在当前版本中，随着 smoothing 增强：

- mean slope 从 `15.269` 下降到 `13.553`
- slope `p95` 从 `29.016` 下降到 `25.464`
- max slope 从 `80.330` 下降到 `54.868`

这里的 `p95` 不是中间值，而是 **95th percentile**，也就是：

> 95% 的像元都不超过这个值，只有最陡的 5% 在它之上。

所以 `p95` 比 `max` 更稳定，更适合描述高坡度尾部是否被压缩。

这一部分的结果说明：

- smoothing 会削弱局部高坡度响应
- 但 slope 的大尺度空间格局仍然比较稳定

也就是说：

**坡面会变缓，但不会一下子让 ridge / valley 框架消失。**

![slope 对比图](study_area_candidate_a_slope_comparison.png)

## curvature proxy：看局部凸凹表达是否敏感

如果说 slope 看的是一阶变化，那么 `curvature proxy` 更接近在看：

**局部形态变化的变化。**

这也是为什么它比 slope 更敏感。

在当前整区结果中：

- Raw:
  - `p05 = -0.015161`
  - `p95 = 0.016755`
  - `std = 0.010544`
- Mild smoothing:
  - `p05 = -0.011878`
  - `p95 = 0.012941`
  - `std = 0.007778`
- Strong smoothing:
  - `p05 = -0.006600`
  - `p95 = 0.006850`
  - `std = 0.004053`

这里最重要的不是它“像不像高斯分布”，而是：

- 分布是否向 `0` 收缩
- 两侧尾部是否变短
- 极端曲率响应是否减少

当前结果非常清楚：

**strong smoothing 后，曲率分布明显向 0 收缩，说明大量小尺度凸凹变化被压弱了。**

换句话说：

- 大尺度地貌骨架还在
- 但小尺度地形表达更快地被 smoothing 抹平

![curvature 直方图对比](study_area_candidate_a_curvature_histograms.png)

# 第五步：整区比较的含义（`terrain_metrics_stage2_summary.py`）

在这一阶段，生成：

- `slope histograms`
- `curvature histograms`
- 整区 summary statistics

将视觉判断变成可以支撑解释的量化证据。

## 这一阶段的核心结论

目前整区比较已经能说明一个非常清楚的结论：

**预处理不会立刻改变研究区的大尺度地形骨架，但会明显改变小尺度地形表达。**

更具体地说：

- `hillshade` 表明主要 ridge-valley 骨架仍然稳定
- `slope` 表明局部陡坡表达被削弱，但整体坡度结构仍能识别
- `curvature proxy` 表明小尺度凸凹响应被更强烈地压向 0

所以从这一阶段开始，这个项目真正要回答的问题就已经出现了：

> 大尺度地貌骨架是否稳健？  
> 小尺度地形表达是否更依赖预处理？

到这里，数据处理和整区地形指标的部分就基本完整了。  
下一步自然就会进入更具体的：

- local feature windows
- ridge / valley / transition 的局部比较
- 哪些具体地貌特征稳，哪些更敏感

# 第六步：局部窗口比较（`local_feature_overview.py` + `local_feature_panels.py`）

整区比较能回答：

- 整体分布有没有变化
- 预处理影响更偏向 slope 还是 curvature

但它还不能很好回答：

- 具体是哪一类地貌特征更稳？
- ridge、valley、transition 到底分别怎么变？

所以接下来我又做了一步：

**从整个研究区里再切出几个具有代表性的局部窗口。**

当前版本一共选了三个：

- `ridge window`
- `valley window`
- `transition window`

其中：

- `local_feature_overview.py` 用来在整张研究区图上标出这三个窗口的位置
- `local_feature_panels.py` 用来把每个窗口在 raw / mild / strong 三个版本下并排比较

![局部窗口在整张研究区中的位置](study_area_candidate_a_local_feature_overview.png)

## 为什么还要切局部窗口

原因其实很简单：

**整区统计只能告诉我“整体趋势”，但不能直接告诉我“具体哪个地貌单元在变”。**

比如：

- curvature 整体上向 0 收缩
  
但是不够，还需要知道：

- 是 ridge edge 变钝了？
- 是 valley 小支沟变弱了？
- 还是 transition 区域的小尺度分割感被削弱了？


## ridge window：大 ridge 稳，边缘锐度更敏感

这一块最明显的特征是一条连续的高 ridge 带，以及它两侧的坡面。

从图上看：

- raw 里 ridge crest 很清楚
- mild 里仍然清楚
- strong 里主 ridge 还是能认出来

所以第一层结论是：

**主 ridge 这个大尺度地貌结构是稳的。**

但同时也能看到：

- raw 的 ridge 边缘更尖
- strong 的 ridge 边缘更圆、更钝

所以第二层结论：

**ridge 本体没有消失，但 ridge 边缘的锐利程度会随着 smoothing 增强而减弱。**

局部统计也支持这个判断：

- `95th-percentile slope` 大约下降了 `12.6%`
- `curvature std` 大约下降了 `63.6%`

所以这一块更自然的说法是：

> 主 ridge 的大尺度几何仍然稳健，但更细的边缘锐度对处理方式更敏感。

![ridge window 对比](ridge_window_local_panel.png)

## valley window：宽谷框架稳，小支沟纹理更敏感

这一块最明显的对象是一个较宽的 valley 主体，以及一些 tributary-like branching texture。

从图上看：

- valley 主体在三个版本里都还能识别
- 低地通道并没有消失
- 但 raw 里的小分支和细纹理在 strong 里明显变弱

所以这里的判断是：

**宽谷框架更稳，但更细的小支沟纹理更敏感。**

对应的局部统计是：

- `95th-percentile slope` 大约下降了 `9.7%`
- `curvature std` 大约下降了 `60.5%`

这说明：

- 宽谷这个大对象仍然存在
- 但更小尺度的 incision / branching 表达在 strong smoothing 下会被削弱

![valley window 对比](valley_window_local_panel.png)

## transition window：大尺度过渡稳，小尺度分割感更敏感

这一块看的是：

- 上部较高地形
- 中间坡面过渡
- 下部较低区域
- 以及其中的一些 side gullies

从图上看：

- 从高到低的大尺度 transition 在三个版本里都还在
- 但一些局部 side-gully texture 逐渐变得不明显

也就是说：

**大尺度过渡仍然可解释，但局部地形分割感对处理方式更敏感。**

对应的局部统计是：

- `95th-percentile slope` 大约下降了 `13.3%`
- `curvature std` 大约下降了 `64.8%`

这和前两个窗口其实形成了一个很一致的模式：

- 大对象没有立刻消失
- 小尺度表达更先被 smoothing 抹平

![transition window 对比](transition_window_local_panel.png)

# 第七步：局部窗口比较的含义（`terrain_metrics_stage3_local_summary.py`）

走到这里，这个项目已经不只是“看几张图差多少”了。

通过局部窗口，我能更明确地说：

- 预处理不会首先破坏大尺度地貌骨架
- 预处理首先影响的是小尺度地形表达
- ridge、valley、transition 三种对象都显示出类似模式

这一阶段最重要的意义，是把前面整区比较的结论进一步具体化：

## 不是所有地貌特征都同样敏感

这一点非常关键。

当前结果并不是在说：

- smoothing 会让所有地貌特征一起消失

而是在说：

- 不同层级的地貌特征，对预处理的敏感性不一样

更准确地说：

- 大尺度 ridge / valley / transition 骨架：相对稳健
- 小尺度 edge sharpness / tributary texture / side gullies / 局部凸凹变化：更敏感

## 这一步让解释更像“研究判断”

如果没有局部窗口，文章很容易停留在：

- 图变了
- histogram 变了
- curvature 更敏感

这些当然是对的，但还比较抽象。

加入局部窗口之后，项目才真正开始回答：

> 哪一类地貌对象在预处理下仍然稳？  
> 哪一类对象更依赖处理方式？

这个差别很大。

因为它让“指标变化”真正转化成了：

**地貌解释上的变化**

# 总结：局限性

虽然这个项目已经形成了一条比较完整的比较链，但它仍然只是一个 learning demo，而不是完整研究。

当前版本至少有这几个局限：

## 1. 研究区只有一个

现在所有分析都建立在一个 study area 上。  
这意味着：

- 当前结论首先是对这一个区域成立
- 它是否能推广到其他地形类型，还不能直接下结论

也就是说，这一版更像：

**单案例地形敏感性 demo**

而不是跨多个区域的系统性比较研究。

## 2. 预处理形式还比较简单

当前只比较了三种版本：

- raw
- mild smoothing
- strong smoothing

这当然足够支撑当前问题，但还没有涉及：

- 不同类型滤波器
- 不同分辨率变化
- 多尺度 resampling
- 更复杂的预处理链

所以这版主要反映的是：

**在当前 smoothing 设定下，地形指标会如何响应。**

## 3. curvature 这里只是 proxy

当前的 `curvature proxy` 是一个简化指标，主要用于追踪局部凸凹表达是否被压弱。  
它不是完整的标准地貌曲率体系，也不应该被过度解释成严格的 geomorphological truth。

所以更准确的说法是：

- 它是一个有用的敏感性指标
- 不是一个足以单独支撑复杂地貌过程判断的终极量

## 4. 过程解释仍然是轻量级的

这版项目虽然已经开始谈：

- ridge
- valley
- transition
- tributary-like texture

但它仍然只是一个较轻的 geomorphological interpretation。

也就是说，这一版最多做到：

- 讨论哪些地形表达更稳
- 讨论哪些局部特征对处理方式更敏感

它还没有进入：

- landscape evolution modeling
- 复杂过程归因
- 更强的 field-based or process-based validation

# 总结：经验

从技术难度上看，这个项目其实不算难。  
它的难点不在于“算法多复杂”，而在于这个方法论：

- 问题有没有设清楚
- 预处理和解释之间的关系有没有讲清楚
- 结果有没有被过度解释

对我来说有三点：

## 1. 学会把真实 DEM 变成一个可比较的问题

不是下载下来就直接算图，而是先问：

- 数据状态是什么？
- 研究区应该怎么选？
- 预处理应该怎么设计？

这一步让我更清楚地意识到：

**项目不是从“写代码”开始的，而是从“把对象和问题收紧”开始的。**

## 2. 学会区分“大尺度稳定”与“小尺度敏感”

这是这个项目最核心的一点。

在做之前，我更容易把预处理理解成：

- 处理一下图像
- 然后继续算指标

但现在我更清楚地知道：

- 预处理不一定先改变大地形骨架
- 它更可能先改变小尺度地形表达
- 所以解释时必须区分不同层级的地貌对象


