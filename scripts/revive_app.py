#!/usr/bin/env python3
"""Revive the app on VPS - rebuild and start."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
N18 = "/opt/alt/alt-nodejs18/root/usr/bin"
EXP = f"export PATH={N18}:$PATH"

def run(ssh, cmd, timeout=300):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Clean up all old processes
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 2")

# Check if .next still has a build
out, _, _ = run(ssh, f"ls {DIR}/.next/BUILD_ID 2>/dev/null && cat {DIR}/.next/BUILD_ID || echo 'NO_BUILD'")
print(f"Build: {out.strip()[:100]}")

if "NO_BUILD" in out:
    print("No existing build found - rebuilding...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && npm run build 2>&1 && echo 'BUILDOK'", 600)
    if "BUILDOK" in out:
        print("Build: OK")
    else:
        print(f"Build failed: {out[-300:]}")
        print("Trying with Node v22...")
        run(ssh, "export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh; nvm use 22 2>/dev/null")
        out, _, _ = run(ssh, f"cd {DIR} && export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && npm run build 2>&1 && echo 'BUILDOK'", 600)
        if "BUILDOK" in out:
            print("Build with v22: OK")
            EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
        else:
            print(f"Build v22 failed: {out[-300:]}")

# Start the app
print("\nStarting app...")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'")
print(f"Start: {out.strip()[:100]}")

# Wait and check
for i in range(6):
    time.sleep(5)
    out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if out.strip():
        print(f"Health (attempt {i+1}): {out[:200]}")
        break
    out2, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
    print(f"Attempt {i+1}: no response, next processes: {out2.strip()}")

# Final check
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nFinal health: {out[:300] if out.strip() else 'OFFLINE'}")
if not out.strip():
    # Check logs
    out, _, _ = run(ssh, f"tail -30 {DIR}/.next/logs/* 2>/dev/null || tail -30 /tmp/alaya-out.log 2>/dev/null || tail -30 /tmp/alaya-restart.log 2>/dev/null || echo 'NO_LOGS'")
    print(f"Logs: {out[:500]}")

print(f"\nAdmin: alayainsider@gmail.com / {NEW_PW}")
print(f"Password set in: {DIR}/.env")
ssh.close()
