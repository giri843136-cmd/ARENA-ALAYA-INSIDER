#!/usr/bin/env python3
"""Add swap, rebuild with Node v22, start app, run seed, verify health."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=600):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"

# Step 1: Add swap
print("\n=== Step 1: Add 2GB swap ===")
out, _, _ = run(ssh, "swapon --show 2>&1 || free -m | grep -i swap")
print(f"Current swap: {out.strip()[:100] or 'none'}")

# Create 2GB swap file
out, _, _ = run(ssh, "dd if=/dev/zero of=/swapfile bs=1M count=2048 2>&1 && echo 'SWAP_CREATED'", 120)
if "SWAP_CREATED" in out:
    print("Swap file created (2GB)")
else:
    print(f"Swap creation: {out[-200:]}")

# Set permissions and enable
out, _, _ = run(ssh, "chmod 600 /swapfile && mkswap /swapfile 2>&1 && swapon /swapfile 2>&1 && echo 'SWAP_ON'")
if "SWAP_ON" in out:
    # Make permanent
    run(ssh, "grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab")
    out2, _, _ = run(ssh, "free -m | head -3")
    print(f"Swap enabled: {out2}")
else:
    print(f"Swap enable: {out[-200:]}")
    # Might need root, try with sudo
    out, _, _ = run(ssh, "sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile 2>&1 && echo 'SWAP_ON'", 60)
    if "SWAP_ON" in out:
        print("Swap enabled via sudo")

# Verify swap
out, _, _ = run(ssh, "free -m | head -3")
print(f"Memory:\n{out}")

# Step 2: Rebuild with Node v22
print("\n=== Step 2: Rebuild with Node v22 ===")
# Clean old Windows build
run(ssh, f"rm -rf {DIR}/.next.old 2>/dev/null; mv {DIR}/.next {DIR}/.next.old 2>/dev/null || true")

# npm ci first
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && npm ci 2>&1 && echo 'NPMCI_OK'", 180)

# Build with Node v22 and limited parallelism
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && NODE_OPTIONS='--max-old-space-size=2048' npx next build 2>&1 && echo 'BUILD_OK'", 600)
if "BUILD_OK" in out:
    print("Build: OK")
else:
    print(f"Build: {out[-500:]}")
    # Try with less parallelism
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && NODE_OPTIONS='--max-old-space-size=1024' npm run build 2>&1 && echo 'BUILD_OK2'", 600)
    if "BUILD_OK2" in out:
        print("Build (retry): OK")
    else:
        print(f"Build (retry): {out[-500:]}")

# Step 3: Start app
print("\n=== Step 3: Start app ===")
run(ssh, "pkill -9 -f next-server 2>/dev/null; sleep 2")

# Also install next globally for the start command
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && npm install -g next 2>&1 || true", 60)

# Start with Node v22
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'")
print("App start initiated")

# Wait for startup
for i in range(12):
    time.sleep(5)
    out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if out.strip():
        print(f"Health (attempt {i+1}): {out[:150]}")
        break
    ps_out, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | head -1")
    if ps_out.strip():
        mid = "running"
    else:
        mid = "not running"
    print(f"Attempt {i+1}: process {mid}")

# Step 4: Run seed
print("\n=== Step 4: Run seed ===")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && echo 'GEN_OK'", 120)
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEED_OK'", 300)
if "SEED_OK" in out:
    print("Seed: OK - password hash updated in database")
else:
    print(f"Seed: {out[-400:]}")

# Final health
time.sleep(5)
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nLocal: {out[:200] if out.strip() else 'OFFLINE'}")
public_out, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"Public: {public_out[:200] if public_out.strip() else 'OFFLINE'}")

print(f"\nAdmin: alayainsider@gmail.com / {NEW_PW}")
ssh.close()
