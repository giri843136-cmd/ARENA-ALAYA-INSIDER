"""
ALAYA INSIDER — Simple Deployment ZIP Creator
Creates a clean deployment ZIP excluding dev-only files
"""
import zipfile, os, sys

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT)
ZIP_NAME = "alaya-insider-deploy-final.zip"

# Directories to skip entirely
SKIP_DIRS = {
    ".git", "__pycache__", "node_modules",
    ".next/cache", ".next/traces",
    ".storybook", "tests",
}

# File extensions to skip
SKIP_EXTS = {".map", ".pyc", ".pyo", ".tsbuildinfo"}

# File prefixes to skip
SKIP_PREFIX = {
    "alaya-insider-deploy", "next-build", "next-output",
    "output.txt", "filelist.txt",
}

def should_skip(rel_path: str) -> bool:
    parts = rel_path.replace(os.sep, "/").split("/")
    for sp in SKIP_DIRS:
        if sp in parts:
            return True
    return False

def create_zip():
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)

    count = 0
    with zipfile.ZipFile(ZIP_NAME, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk("."):
            # Remove skip dirs in-place
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith("__")]

            rel_root = os.path.relpath(root, ".")
            if should_skip(rel_root):
                continue

            for fname in files:
                if fname.startswith("."):
                    continue
                ext = os.path.splitext(fname)[1]
                if ext in SKIP_EXTS:
                    continue
                if any(fname.startswith(p) for p in SKIP_PREFIX):
                    continue

                fpath = os.path.join(root, fname)
                arcname = os.path.relpath(fpath, ".")
                try:
                    zf.write(fpath, arcname)
                    count += 1
                except Exception as e:
                    print(f"  Skipped {arcname}: {e}")

    size_mb = os.path.getsize(ZIP_NAME) / (1024 * 1024)
    print(f"\nZIP created: {ZIP_NAME}")
    print(f"Size: {size_mb:.1f} MB")
    print(f"Files: {count}")

if __name__ == "__main__":
    create_zip()
