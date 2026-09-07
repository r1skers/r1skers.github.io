# r1skers' Blog

[r1skers.github.io](https://r1skers.github.io/) 是一个基于 Hugo 与 PaperMod 的双语技术博客，主要记录数学、计算科学、机器学习和系统方向的研究笔记、长文、实验产物与实用工具。

## 本地运行

### 环境要求

- Git（需要支持 submodule）
- Hugo Extended `0.157.0`
- PowerShell 7（运行发布前检查时需要）

首次克隆时初始化主题子模块：

```powershell
git clone --recurse-submodules https://github.com/r1skers/r1skers.github.io.git
cd r1skers.github.io
```

如果仓库已经克隆：

```powershell
git submodule update --init --recursive
```

启动本地预览（包含草稿）：

```powershell
hugo server -D
```

默认访问地址为 <http://localhost:1313/>。

## 内容结构

```text
content/
├── notes/       # 学科基础、专题、研究线程与习题
├── posts/       # 长文与方法性文章
├── artifacts/   # 项目构建记录、原型与验证结果
├── tools/       # 可直接使用或下载的工具
└── thinking/    # 相对独立的思考记录
```

站点默认语言为中文，同时使用 `*.en.md` 维护英文版本。内容分类、`note_kind`、系列与标签的具体约定见 [CONTENT_TAXONOMY.md](CONTENT_TAXONOMY.md)。

新建普通文章时可以使用 Hugo archetype：

```powershell
hugo new content posts/my-post/index.md
```

提交前请确保非草稿页面至少包含有效的 `summary` 与 `description`，并遵循现有分类和标签命名。

## 检查与构建

运行与 CI 相同的发布门禁：

```powershell
./prepublish.ps1 -AllowDrafts
```

需要把元数据告警也视为失败时：

```powershell
./prepublish.ps1 -AllowDrafts -StrictMetadata
```

生成生产构建：

```powershell
hugo --minify
```

构建结果写入 `public/`，该目录不会提交到 Git。

## 部署

推送到 `master` 后，GitHub Actions 会执行两条工作流：

- `Site Checks` 运行发布门禁；
- `Deploy Hugo site to Pages` 构建站点并部署到 GitHub Pages。

两条工作流与本地开发统一使用 Hugo Extended `0.157.0`。

## 主题与自定义

PaperMod 以 Git submodule 的形式保存在 `themes/PaperMod/`。站点级覆盖放在 `layouts/`，自定义样式放在 `assets/css/extended/`，静态资源放在 `static/`。修改主题表现时优先使用这些覆盖目录，避免直接改动子模块内容。
