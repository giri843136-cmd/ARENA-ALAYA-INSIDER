#!/usr/bin/env python3
"""Upload new .next build, restart app, verify auth works."""

import paramiko, os, sys, tarfile, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
LOCAL = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = "export PATH=" + N22 + ":/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

def run(cmd, timeout=60):
    c = ssh.get_transport().open_session()
    c.settimeout(timeout)
    c.exec_command(cmd)
    out = c.recv(32768).decode("utf-8","replace")
    code = c.recv_exit_status()
    return out, code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Create tar of new .next directory (exclude cache for smaller size)
print("\n[1/4] Creating .next.tar.gz...")
next_dir = os.path.join(LOCAL, ".next")
tar_path = os.path.join(LOCAL, ".next-new.tar.gz")
with tarfile.open(tar_path, "w:gz") as tar:
    for root, dirs, files in os.walk(next_dir):
        # Skip cache directory
        if "\\cache" in root or "/cache" in root:
            continue
        for f in files:
            filepath = os.path.join(root, f)
            arcname = os.path.relpath(filepath, LOCAL)
            tar.add(filepath, arcname=arcname)
size = os.path.getsize(tar_path)
print(f"  Size: {size/1024/1024:.1f} MB")

# Upload
print("[2/4] Uploading to VPS...")
sftp = ssh.open_sftp()
sftp.put(tar_path, DIR + "/.next-new.tar.gz")
sftp.close()
print("  Uploaded")

# Extract
print("[3/4] Extracting and restarting...")
run("rm -rf " + DIR + "/.next.old 2>/dev/null; mv " + DIR + "/.next " + DIR + "/.next.old 2>/dev/null || true")
out, _ = run("cd " + DIR + " && tar xzf .next-new.tar.gz && echo 'EXTRACTED'", 120)
if "EXTRACTED" in out:
    print("  Extracted")
else:
    print("  Extract: " + out[-200:])
run("rm -f " + DIR + "/.next-new.tar.gz")

# Kill and restart
run("pkill -9 -f next-server 2>/dev/null; sleep 2")
out, _ = run("cd " + DIR + " && " + EXP + " && nohup " + N22 + "/node node_modules/.bin/next start > /tmp/alaya-n22.log 2>&1 & disown && echo 'STARTED'")
print("  Start: " + out.strip()[:100])

# Wait and check
for i in range(12):
    time.sleep(5)
    out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
    if out.strip():
        print(f"  Health OK (attempt {i+1}): {out[:80]}")
        break
    print(f"  Waiting... (attempt {i+1})")

# Verify auth endpoint
time.sleep(3)
out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth/session 2>&1")
print(f"\n[4/4] Auth endpoint (/api/auth/session): HTTP {out.strip()}")

out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth/signin 2>&1")
print(f"Auth provider (/api/auth/signin): HTTP {out.strip()}")

out, _ = run("curl -s http://localhost:3000/api/auth/session 2>&1 | head -c 200")
print(f"Session response: {out[:150] if out.strip() else '(empty)'}")

# Public
out, _ = run("curl -s -o /dev/null -w '%{http_code}' https://alayainsider.com/api/auth/session 2>&1")
print(f"Public auth endpoint: HTTP {out.strip()}")

os.remove(tar_path)
ssh.close()
print("\nDeployment complete.")
