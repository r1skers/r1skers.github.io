import os
import shutil
import re
from pathlib import Path

# ================= 1. 配置区域 =================
# 请确保路径前加了 r
TARGET_DIR = Path(r"D:\Hephaestus_Foundry\content\posts")
IMAGE_SOURCE_DIR = Path(r"D:\Hephaestus_Foundry\public")

# ================= 2. 正则表达式 =================
REGEX_MD = re.compile(r'(!\[.*?\]\()(.*?)((\s+".*?")?\))')
REGEX_HTML = re.compile(r'(<img\s+[^>]*src=["\'])(.*?)(["\'])', re.IGNORECASE)

# ================= 3. 核心功能 =================

def migrate_to_bundles():
    """
    第一步：扫描所有散乱的 .md 文件，为它们创建文件夹，并移动进去改名为 index.md
    """
    print(f"🚀 [第一步] 正在整理文章结构: {TARGET_DIR.resolve()}")
    print("-" * 30)

    count = 0 
    # 扫描目录下所有的 .md 文件
    for md_file in TARGET_DIR.glob("*.md"):
        # 排除已经是入口文件的
        if md_file.name.lower() in ['index.md', '_index.md']:
            continue
        
        print(f"📄 发现文章: {md_file.name}")

        # 1. 创建同名文件夹
        bundle_dir = TARGET_DIR / md_file.stem
        if not bundle_dir.exists():
            bundle_dir.mkdir()
            print(f"    📂 创建文件夹: {bundle_dir.name}")
        
        # 2. 移动并重命名 (file.md -> folder/index.md)
        target_file = bundle_dir / "index.md"
        
        if target_file.exists():
            print(f"    ⚠️ [跳过] 目标已存在 index.md")
            continue

        try:
            shutil.move(str(md_file), str(target_file))
            print(f"    ✅ 迁移成功")
            count += 1
        except Exception as e:
            print(f"    ❌ 迁移失败: {e}")

    print("-" * 30)
    print(f"🎉 结构整理完毕，处理了 {count} 篇文章。")
    
    # === 关键：第一步做完后，自动触发第二步 ===
    migrate_images()

def migrate_images():
    """
    第二步：遍历刚才生成的那些文件夹，读取 index.md，把图片搬进去
    """
    print("\n🚀 [第二步] 开始扫描并移动图片...")
    
    # 辅助函数：如果源文件存在，就移动到新位置（并自动创建父目录）
    def safe_move(src, dst):
        if not src.exists(): return False
        # 如果目标文件夹(比如 img/physics/)不存在，先创建
        if not dst.parent.exists(): 
            dst.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.move(str(src), str(dst))
            return True
        except Exception:
            return False

    # 遍历 Target 目录下的每一个子文件夹
    for folder in TARGET_DIR.iterdir():
        if not folder.is_dir(): continue
        
        index_file = folder / "index.md"
        if not index_file.exists(): continue

        # --- 回调函数：处理每一个找到的图片链接 ---
        def process_image(match):
            prefix = match.group(1)   # 前缀 (比如 <img src=")
            rel_path = match.group(2) # 路径 (比如 /img/a.png)
            suffix = match.group(3)   # 后缀 (比如 ")

            # 调试日志
            tag_type = "HTML" if "img" in prefix.lower() else "Markdown"

            # 1. 跳过网络图片
            if rel_path.startswith(('http:', 'https:')):
                return match.group(0)

            # 2. 拼接路径
            clean_path = rel_path.lstrip("/\\") # 去掉开头的 /
            old_abs_path = IMAGE_SOURCE_DIR / clean_path # 旧图位置
            img_filename = Path(clean_path).name
            new_abs_path = folder / img_filename           # 新图位置

            # 3. 搬运图片
            if safe_move(old_abs_path, new_abs_path):
                print(f"    [{tag_type}] 🚚 搬运成功: {img_filename}")
            
            # 4. 修改链接 (去掉开头的 /，变成相对路径)
            new_rel_path = img_filename            
            return f"{prefix}{new_rel_path}{suffix}"

        # --- 读取并修改文件 ---
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 这里的 sub 会自动调用上面的 process_image 函数
            new_content = REGEX_MD.sub(process_image, content)       # 处理 Markdown 格式
            new_content = REGEX_HTML.sub(process_image, new_content) # 处理 HTML 格式

            if new_content != content:
                with open(index_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"  💾 链接已更新: {folder.name}")
                
        except Exception as e:
            print(f"  ❌ 读写出错 {folder.name}: {e}")

# ================= 4. 程序入口 =================
if __name__ == "__main__":
    print(
"此模式会将图片直接移动到 index.md 同级目录下 (不创建子文件夹)。"
)
    if input("确认运行? (y/n): ").lower() == 'y':
        migrate_to_bundles()