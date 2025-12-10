import os;
import shutil;
import re;
from pathlib import Path;

# Define the target directory (change 'your_directory_path' to the actual path you want to use)
TARGET_DIR = Path("D:\Hephaestus_Foundry\content\posts")
POSTS_DIR = Path(".")
IMG_PATTERN = re.compile(r'!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)')

def migrate_to_bundles():
    print(f"Searching :{TARGET_DIR.resolve()} ")
    print("-"*30)

    for md_file in TARGET_DIR.glob("*.md"):
        count = 0
        # 1. 排除已经是 Bundle 的文件 (index.md 或 _index.md)
        if md_file.name in ['index.md', '_index.md']:
            print(f" [跳过] 已是Bundle或入口: {md_file.name}")
            continue

        # 2. 排除脚本自己 (虽然 glob *.md 不会抓到 .py，但为了逻辑严谨)
        if md_file.suffix != '.md':
            continue

        print(f"Found .md files!: {md_file.name}")

        # 3. 创建同名目录
        bundle_dir = TARGET_DIR / md_file.stem
        print("Making directory...")

        if not bundle_dir.exists():
            bundle_dir.mkdir()
            print(f" Created directory: {bundle_dir.name}")
        else:
            print(f" Directory already exists: {bundle_dir.name}")

        # 4. 移动 .md 文件到新目录并重命名为 index.md

        target_file = bundle_dir / "index.md"

        if target_file.exists():
            print(f"   ⚠️ [跳过] 目标文件夹里已经有 index.md 了，请手动检查！")
            continue
        try:
            # 这里的 move 相当于剪切+重命名
            shutil.move(str(md_file), str(target_file))
            print(f"   ✅ [迁移成功] 📄 -> 📂/index.md")
            count += 1
        except Exception as e:
            print(f"   ❌ [出错] {e}")
 

        
    print("-" * 30)
    print(f"🎉 Struction adjustment finished, moved {count} articles.")
    print("👉 Next, move pictures")


            
            
