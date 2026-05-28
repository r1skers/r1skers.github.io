---
title: "CV"
url: "/en/cv/"
summary: "A concise research-oriented CV draft."
description: "A research-oriented CV draft for r1skers, covering interests, selected projects, technical skills, and site references."
aliases:
  - /en/resume/
---

# CV

This is a research-oriented CV draft for organizing application materials. A final version will be trimmed for each program or opportunity.

## Profile

Electrical Engineering undergraduate based in Yamagata, Japan.  
Current focus: representation geometry, unsupervised learning, transformer embeddings, and computational modeling.

## Research Interests

- Representation learning and embedding geometry
- Unsupervised learning, clustering, and evaluation
- Transformer representations and model analysis
- Scientific computing, inverse problems, and stable numerical workflows

## Selected Projects

### BERT Cluster Geometry Probe

Independent research artifact, 2026  
Links: [Artifact-5 series](/en/artifacts/05-bert-representation-probes/) · [5.1 clustering view](/en/artifacts/05-1-clustering-view/) · [5.1.1 whitening demo](/en/artifacts/05-1-1-pca-whitening-demo/) · [GitHub](https://github.com/r1skers/bert-cluster-stability)

- Designed an unsupervised probing pipeline to analyze whether BERT document-segment embeddings contain topic-aligned geometric structure across layers.
- Extracted 13-layer `bert-base-uncased` representations on 20 Newsgroups and compared pretrained BERT against a random-initialized architecture control.
- Evaluated PCA whitening, spherical KMeans, Lloyd KMeans, GMM, agglomerative clustering, K sweeps, and subset-resampling stability.
- Found that late-layer pretrained embeddings show stronger topic alignment after whitening, while stability alone can be misleading under anisotropic random geometry.

### Orogeny Sandbox

Computational modeling / PDE-to-ML pipeline artifact  
Link: [Artifact-3](/artifacts/03-orogeny-sandbox/)

- Built an end-to-end validation chain from terrain generation and diffusion simulation to dataset construction and rollout evaluation.
- Used the project to practice numerical stability checks, structured data generation, and ML-based surrogate modeling.

## Selected Notes

- [Unsupervised Learning Series](/notes/笔记-机器学习-无监督学习0-路线图与核心问题/)
- [PCA, Whitening, and Neighborhood Visualization](/notes/笔记-机器学习-无监督学习1-pcawhitening与邻域可视化/)
- [CLIP and Multimodal Alignment](/notes/笔记-机器学习-CLIP与多模态对齐1-从对比学习到图文共享空间/)
- [ViT and Visual Transformers](/notes/笔记-机器学习-ViT与视觉Transformer1-从图像分块到注意力分类/)

## Technical Skills

- Programming: Python, C/C++, MATLAB basics
- ML / data: PyTorch, HuggingFace Transformers, scikit-learn, NumPy, pandas, Matplotlib
- Web / documentation: Hugo, Markdown, Git, GitHub
- Areas: embedding analysis, clustering evaluation, PCA whitening, numerical experiments

## Contact

- GitHub: [r1skers](https://github.com/r1skers)
- Email: <t243057@st.yamagata-u.ac.jp>
