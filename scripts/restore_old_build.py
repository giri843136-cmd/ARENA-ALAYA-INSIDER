#!/usr/bin/env python3
"""Restore old working build and start app with Node v18."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Check old build
out, _, _ = run(ssh, f"ls {DIR}/.next.old/BUILD_ID 2>/dev/null && cat {DIR}/.next.old/BUILD_ID || echo 'NO_OLD_BUILD'")
print(f"Old build: {out.strip()[:100]}")

if "NO_OLD_BUILD" in out:
    # No old build backed up, check if current .next has anything
    out, _, _ = run(ssh, f"ls {DIR}/.next/server/app/index.html 2>/dev/null || ls {DIR}/.next/server/pages/index.html 2>/dev/null || echo 'NO_BUILD_FILES'")
    print(f"Current build files: {out.strip()[:100]}")
else:
    # Restore old build
    run(ssh, f"rm -rf {DIR}/.next 2>/dev/null; mv {DIR}/.next.old {DIR}/.next")
    print("Restored old build")

# Check the build contents
out, _, _ = run(ssh, f"ls {DIR}/.next/BUILD_ID 2>/dev/null && cat {DIR}/.next/BUILD_ID || echo 'STILL_NO_BUILD'")
print(f"Build ID: {out.strip()[:50]}")

if "STILL_NO_BUILD" in out:
    print("No build available - cannot start app")
    ssh.close()
    sys.exit(1)

# Check node_modules exists
out, _, _ = run(ssh, f"ls {DIR}/node_modules/next 2>/dev/null && echo 'NEXT_EXISTS' || echo 'NO_NEXT'")
print(f"next in node_modules: {out.strip()}")

if "NO_NEXT" in out:
    print("node_modules missing - this is a problem")

# Kill any existing processes
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 2")

# Start with Node v18
print("\nStarting app with Node v18...")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-start.log 2>&1 & echo 'STARTED'")
print(f"Start: {out.strip()}")

for i in range(6):
    time.sleep(5)
    health, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if health.strip():
        print(f"Health (attempt {i+1}): {health[:150]}")
        break
    ps, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | head -1")
    if ps.strip():
        print(f"Attempt {i+1}: process running")
    else:
        print(f"Attempt {i+1}: no process")
        run(ssh, "pkill -9 -f next 2>/dev/null; sleep 1")
        run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-start.log 2>&1 & echo 'RETRY'")
        print("Retrying start...")

# Run seed
health, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
if health.strip():
    print("\nRunning seed...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
    if "SEEDOK" in out:
        print("Seed: OK")
    else:
        print(f"Seed: {out[-300:]}")
else:
    # Try Node v22 for the seed
    print("\nTrying seed with Node v22...")
    EXP22 = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
    out, _, _ = run(ssh, f"cd {DIR} && {EXP22} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && echo 'GENOK'", 120)
    if "GENOK" in out:
        print("Prisma generate with v22: OK")
        out2, _, _ = run(ssh, f"cd {DIR} && {EXP22} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
        if "SEEDOK" in out2:
            print("Seed with v22: OK")
        else:
            print(f"Seed with v22: {out2[-300:]}")

# Final health
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
public, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"\nLocal:  {out[:200] if out.strip() else 'OFFLINE'}")
print(f"Public: {public[:200] if public.strip() else 'OFFLINE'}")
print(f"\nAdmin: alayainsider@gmail.com / {NEW_PW}")
ssh.close()
