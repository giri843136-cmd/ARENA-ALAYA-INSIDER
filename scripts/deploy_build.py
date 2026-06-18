#!/usr/bin/env python3
"""Deploy local .next build to VPS and restart the app."""

import paramiko, os, sys, time, tarfile, io

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
LOCAL_DIR = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Step 1: Create tar of local .next directory
print("\n[1/4] Creating .next.tar.gz locally...")
next_dir = os.path.join(LOCAL_DIR, ".next")
tar_path = os.path.join(LOCAL_DIR, ".next.tar.gz")

with tarfile.open(tar_path, "w:gz") as tar:
    tar.add(next_dir, arcname=".next")
    
tar_size = os.path.getsize(tar_path)
print(f"  Size: {tar_size / 1024 / 1024:.1f} MB")

# Step 2: SFTP to VPS
print("\n[2/4] Uploading to VPS...")
sftp = ssh.open_sftp()
sftp.put(tar_path, f"{DIR}/.next.tar.gz")
sftp.close()
print("  Upload complete")

# Step 3: Extract and set up
print("\n[3/4] Extracting on VPS...")
# Remove old .next
run(ssh, f"rm -rf {DIR}/.next.old 2>/dev/null; mv {DIR}/.next {DIR}/.next.old 2>/dev/null || true")
# Extract new build
out, err, code = run(ssh, f"cd {DIR} && tar xzf .next.tar.gz && echo 'EXTRACTED'", 60)
if "EXTRACTED" in out:
    print("  Extraction done")
else:
    print(f"  Extract: {out[-200:]}")
# Clean up tar
run(ssh, f"rm {DIR}/.next.tar.gz")

# Also copy server files needed for standalone
standalone_src = os.path.join(LOCAL_DIR, ".next", "standalone")
if os.path.exists(standalone_src):
    print("  Copying standalone files...")
    tar_standalone = os.path.join(LOCAL_DIR, ".next_standalone.tar.gz")
    with tarfile.open(tar_standalone, "w:gz") as tar:
        tar.add(standalone_src, arcname="standalone")
    sftp = ssh.open_sftp()
    sftp.put(tar_standalone, f"{DIR}/standalone.tar.gz")
    sftp.close()
    run(ssh, f"cd {DIR} && tar xzf standalone.tar.gz && echo 'STANDALONE_OK'", 60)
    run(ssh, f"rm {DIR}/standalone.tar.gz")
    os.remove(tar_standalone)

# Step 4: Restart app
print("\n[4/4] Starting app...")
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 2")

# Try with Node v18 first (use existing start command)
out, _, _ = run(ssh, f"cd {DIR} && export PATH=/opt/alt/alt-nodejs18/root/usr/bin:$PATH && nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'")
print(f"  Started: {out.strip()}")

# Wait for startup
for i in range(12):
    time.sleep(5)
    out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if out.strip():
        print(f"  Health check OK at attempt {i+1}: {out[:150]}")
        break
    out2, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
    if int(out2.strip()) > 0:
        print(f"  App process running, waiting for health... (attempt {i+1})")
    else:
        # Try Node v22
        print(f"  Node v18 failed, trying v22...")
        run(ssh, "pkill -9 -f next-server 2>/dev/null; sleep 1")
        run(ssh, f"cd {DIR} && export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'")
        time.sleep(10)
        out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
        if out.strip():
            print(f"  Node v22 health: {out[:150]}")
        break

# Final health
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
public_out, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")

print("\n" + "=" * 60)
print("COMPLETE")
print("=" * 60)
print(f"Local health:   {out[:200] if out.strip() else 'OFFLINE'}")
print(f"Public health:  {public_out[:200] if public_out.strip() else 'OFFLINE'}")
print(f"Admin:          alayainsider@gmail.com")
print(f"Password:       {NEW_PW} (set in .env)")
print(f"Change via:     /admin/security (log in with old password)")

os.remove(tar_path)
ssh.close()
