---
date: '2025-12-10T18:57:00+09:00'
draft: false
title: '[Automata] Some Useful Scripts in Computer Science Learning'
summary: "Like the self-moving tripods of Olympus, these scripts are forged to serve. A curation of digital automata designed to banish repetitive tasks and streamline the rugged path of CS learning."
tags: ["Python", "Re", "Shutil", "Os"]
categories: ["Automata"]
---


# Migration

Description<p>
1.  Traverse the markdown files in the directory, 
2.  create folders with the same names, 
3.  and place the files inside. 
4.  Read the content of the articles and move the files referenced by relative paths in the articles to the corresponding folders.

<details>
  <summary>python code</summary>
  
```python
import os
import shutil
import re
from pathlib import Path


TARGET_DIR = Path(r"D:\Hephaestus_Foundry\content\posts")
IMAGE_SOURCE_DIR = Path(r"D:\Hephaestus_Foundry\public")
REGEX_MD = re.compile(r'(!\[.*?\]\()(.*?)((\s+".*?")?\))')
REGEX_HTML = re.compile(r'(<img\s+[^>]*src=["\'])(.*?)(["\'])', re.IGNORECASE)

def migrate_to_bundles():
    """
    Step 1:Scan all scattered .md files, create directory for the, and move them into the directory within a new name "index.md"
    """
    print(f"🚀 [First] Organizing the structure of the article: {TARGET_DIR.resolve()}")
    print("-" * 30)

    count = 0 
    # Traverse all files with the .md suffix in the specified directory
    for md_file in TARGET_DIR.glob("*.md"):
        # Excluding those that are already index.md
        if md_file.name.lower() in ['index.md', '_index.md']:
            continue
        
        print(f"📄 Find article: {md_file.name}")

        # 1. Create a folder with the same name
        bundle_dir = TARGET_DIR / md_file.stem
        if not bundle_dir.exists():
            bundle_dir.mkdir()
            print(f"    📂 create folder {bundle_dir.name}")
        
        # 2. move and rename (file.md -> folder/index.md)
        target_file = bundle_dir / "index.md"
        
        if target_file.exists():
            print(f"    ⚠️ [Skip] target index.md exists ")
            continue

        try:
            shutil.move(str(md_file), str(target_file))
            print(f"    ✅ Move successful")
            count += 1
        except Exception as e:
            print(f"    ❌ Move failed {e}")

    print("-" * 30)
    print(f"🎉 Structure organizing finished, Processed {count} articles.")
    migrate_images()

def migrate_images():
    """
    Step 2: Traverse all the .md files in directories, read the articles and move the referenced images
    """
    print("\n🚀 [Second] Scanning and moving")
    
    # Helper function: If the source file exists, move it to a new location (and automatically create the parent directory)
    def safe_move(src, dst):
        if not src.exists(): return False
        # If the target folder (such as img/physics/) does not exist, create it first.
        if not dst.parent.exists(): 
            dst.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.move(str(src), str(dst))
            return True
        except Exception:
            return False

    # Iterate through each subfolder under the Target directory
    for folder in TARGET_DIR.iterdir():
        if not folder.is_dir(): continue
        
        index_file = folder / "index.md"
        if not index_file.exists(): continue

        # --- Callback function: process each found image link ---
        def process_image(match):
            prefix = match.group(1)   # Prefix (for example <img src=")
            rel_path = match.group(2) # Path (for example /img/a.png)
            suffix = match.group(3)   # Suffix (for example ")
            tag_type = "HTML" if "img" in prefix.lower() else "Markdown"

            # 1. Skip web images
            if rel_path.startswith(('http:', 'https:')):
                return match.group(0)

            # 2. Concatenate paths
            clean_path = rel_path.lstrip("/\\") # Remove the leading /
            old_abs_path = IMAGE_SOURCE_DIR / clean_path # Old address
            img_filename = Path(clean_path).name
            new_abs_path = folder / img_filename           # New address

            # 3. Moving
            if safe_move(old_abs_path, new_abs_path):
                print(f"    [{tag_type}] 🚚 Migration successful: {img_filename}")
            
            # 4. Modify the link (remove the leading / to make it a relative path)
            new_rel_path = img_filename            
            return f"{prefix}{new_rel_path}{suffix}"

        # --- Read and Edit the articles ---
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = REGEX_MD.sub(process_image, content)       
            new_content = REGEX_HTML.sub(process_image, new_content) 

            if new_content != content:
                with open(index_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"  💾The link has been updated: {folder.name}")
                
        except Exception as e:
            print(f"  ❌ Reading and writing errors {folder.name}: {e}")


if __name__ == "__main__":
    print("This mode will directly move the images to the same directory as index.md (without creating subfolders).")
    if input("Confirm running? (y/n): ").lower() == 'y':
        migrate_to_bundles()
```

</details>