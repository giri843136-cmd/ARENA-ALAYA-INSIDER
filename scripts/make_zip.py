"""Create deployment ZIP for Hostinger - skips locked files"""
import zipfile, os, time

SRC = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"
OUT = os.path.join(SRC, "alaya-insider-deploy-v6.zip")
SKIP_DIRS = {".git", "__pycache__", "node_modules", ".next"}
SKIP_EXTS = {".map", ".pyc", ".pyo"}
SKIP_PREFIX = {"alaya-insider-deploy", "next-build", "next-output", "output.txt", "filelist.txt"}

if os.path.exists(OUT):
    os.remove(OUT)

now = time.localtime()
default_zt = (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min, now.tm_sec)

count = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(SRC):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and d != "__pycache__"]
        rel = dirpath[len(SRC):].lstrip(os.sep)
        for fname in filenames:
            ext = os.path.splitext(fname)[1]
            if ext in SKIP_EXTS:
                continue
            if any(fname.startswith(p) for p in SKIP_PREFIX):
                continue
            fpath = os.path.join(dirpath, fname)
            arcname = os.path.join(rel, fname) if rel else fname
            try:
                info = zipfile.ZipInfo(arcname, default_zt)
                with open(fpath, "rb") as f:
                    zf.writestr(info, f.read())
                count += 1
            except (PermissionError, OSError):
                print(f"Skipped locked file: {arcname}")
            except Exception as e:
                print(f"Skipped {arcname}: {e}")

size_mb = os.path.getsize(OUT) / (1024 * 1024)
print(f"Created: {OUT}")
print(f"Size: {size_mb:.1f} MB")
print(f"Files: {count}")
