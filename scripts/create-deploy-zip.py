import zipfile
import os

src = r'C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed'
dest = os.path.join(src, 'alaya-insider-deploy-v3.zip')

os.chdir(src)

if os.path.exists(dest):
    os.remove(dest)

dirs_to_include = ['app', 'components', 'lib', 'prisma', 'public', 'i18n', 'workers', '.next', 'scripts']
files_to_include = ['package.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 
                    'eslint.config.mjs', '.gitignore', '.env.example', 'README.md']

skip_dirs = {'.git', '__pycache__', 'node_modules', 'traces', 'dev'}

def should_skip(path):
    parts = path.replace(os.sep, '/').split('/')
    for part in parts:
        if part in skip_dirs:
            return True
    # Only skip .next/cache/ not lib/backend/cache/
    if len(parts) >= 3 and parts[0] == '.next' and parts[1] == 'cache':
        return True
    return False

zipf = zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED)

for f in files_to_include:
    if os.path.isfile(f):
        zipf.write(f)
        print(f'Added: {f}')

for d in dirs_to_include:
    if os.path.isdir(d):
        for root, dirs_inner, files_inner in os.walk(d):
            if should_skip(root):
                continue
            for file in files_inner:
                if file.endswith(('.map', '.pyc')):
                    continue
                fp = os.path.join(root, file)
                if should_skip(fp):
                    continue
                zipf.write(fp)

zipf.close()
size_mb = os.path.getsize(dest) / (1024 * 1024)
count = len(zipf.namelist()) if hasattr(zipf, 'namelist') else '?'
print(f'ZIP created: {size_mb:.1f} MB')
print(f'Files: {count}')
print(f'Path: {dest}')
