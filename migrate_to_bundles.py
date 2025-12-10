import os;
import shutil;
import re;
from pathlib import Path;

# Define the target directory (change 'your_directory_path' to the actual path you want to use)
TARGET_DIR = Path(r"D:\Hephaestus_Foundry\content\posts")
IMAGE_SOURCE_DIR = Path(r"D:\Hephaestus_Foundry\public")
REGEX_MD = re.compile(r'(!\[.*?\]\()(.*?)((\s+".*?")?\))')
REGEX_HTML = re.compile(r'(<img\s+[^>]*src=["\'])(.*?)(["\'])', re.IGNORECASE)


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

def migrate_images():
    def safe_move(src, dst):
        if not src.exists(): return False
        if not dst.parent.exists(): dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
        return True
    
    for folder in TARGET_DIR.iterdir():
        if not folder.is_dir(): continue
        index_file = folder / "index.md"
        if not index_file.exists(): continue

    def process_image(match):
            prefix = match.group(1)  
            rel_path = match.group(2) 
            suffix = match.group(3)  

            if "img" in prefix.lower():
                tag_type = "HTML 标签"
            else:
                tag_type = "Markdown"
            clean_path = rel_path.lstrip("/\\") # 去掉开头的斜杠
            old_abs_path = IMAGE_SOURCE_DIR / clean_path
            new_abs_path = folder / clean_path
            if safe_move(old_abs_path, new_abs_path):
                print(f"    [{tag_type}] 🚚 成功搬运: {clean_path}")
            else:
                # 如果没找到文件，也打印一下，方便排查
                if not new_abs_path.exists() and not old_abs_path.exists():
                     pass 
                     # print(f"    [{tag_type}] ⚠️ 原图不存在: {clean_path}")

            new_rel_path = rel_path[1:] if rel_path.startswith("/") else rel_path
            return f"{prefix}{new_rel_path}{suffix}"
    
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = REGEX_HTML.sub(process_image, new_content)

    if new_content != content:
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  💾 已更新链接: {folder.name}")




if __name__ == "__main__":
    # 为了防止手误，先打印一下源目录，确认无误再按 y
    print(f"图片源目录: {IMAGE_SOURCE_DIR}")
    if input("确认运行? (y/n): ").lower() == 'y':
        # 这里只调用图片处理，假设你文件已经归档好了
        # 如果需要连归档一起做，请把 migrate_to_bundles() 的逻辑加回来
        move_pictures_final()

            
            
