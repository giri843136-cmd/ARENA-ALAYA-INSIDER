#!/usr/bin/env python3
"""Build on VPS with Node v22 and reduced memory usage."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
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

# Check resources
out, _, _ = run(ssh, "free -m | head -3; echo '---'; nproc; echo '---'; df -h / | tail -1")
print(f"Resources:\n{out[:300]}")

# Set up Node v22
NVM = "export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh; nvm use 22 2>/dev/null || true"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = f"export PATH={N22}:$PATH"

# Verify Node
out, _, _ = run(ssh, f"{EXP} && node --version")
print(f"Node: {out.strip()}")

# Build with limited parallelism and memory
print("\nBuilding (reduced resources)...")
# First install deps fresh
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && npm ci 2>&1 && echo 'CIOK'", 180)
if "CIOK" in out:
    print("npm ci: OK")
else:
    print(f"npm ci: {out[-200:]}")

# Build with limited parallelism
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && NODE_OPTIONS='--max-old-space-size=2048' npx next build --no-lint 2>&1 && echo 'BUILDOK'", 600)
if "BUILDOK" in out:
    print("Build: OK")
else:
    print(f"Build: {out[-500:]}")
    # Try without npx, via npm
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && NODE_OPTIONS='--max-old-space-size=1024' npm run build 2>&1 && echo 'BUILDOK2'", 600)
    if "BUILDOK2" in out:
        print("Build via npm: OK")
    else:
        print(f"Build via npm: {out[-500:]}")

# Start app
print("\nStarting app...")
run(ssh, "pkill -9 -f next-server 2>/dev/null; sleep 2")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'")
print(f"Start: {out.strip()}")

for i in range(12):
    time.sleep(5)
    out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if out.strip():
        print(f"Health: {out[:150]}")
        break

out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nFinal: {out[:200] if out.strip() else 'OFFLINE'}")

# Run seed
print("\nRunning seed...")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P' npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
if "SEEDOK" in out:
    print("Seed: OK - password updated in DB")
else:
    print(f"Seed: {out[-400:]}")

print(f"\nAdmin: alayainsider@gmail.com / 7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P")
ssh.close()
