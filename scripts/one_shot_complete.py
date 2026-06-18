#!/usr/bin/env python3
"""One-shot complete: restart app, run seed, verify health - all in one go."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=180):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Kill any stale node processes
run(ssh, "pkill -9 -f 'next-server' 2>/dev/null; pkill -9 -f 'node.*next' 2>/dev/null; sleep 2")

# Verify app is not running
out, _, _ = run(ssh, "ps aux | grep next | grep -v grep | wc -l")
print(f"Next processes remaining: {out.strip()}")

# Read DATABASE_URL from .env
out, _, _ = run(ssh, f"source {DIR}/.env 2>/dev/null && echo $DATABASE_URL || grep DATABASE_URL {DIR}/.env | cut -d= -f2- | head -1")
db_url = out.strip().split('\n')[0] if out.strip() else ""
print(f"DB URL: {db_url[:70]}...")

# Start app with Node v18 (known working version)
NODE18 = "/opt/alt/alt-nodejs18/root/usr/bin/node"
NPM18 = "/opt/alt/alt-nodejs18/root/usr/bin/npm"
EXPORT18 = f"export PATH=/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

print("Starting app with Node v18...")
run(ssh, f"cd {DIR} && {EXPORT18} && nohup {NODE18} node_modules/.bin/next start > /tmp/alaya-restart.log 2>&1 & echo 'STARTED'")
time.sleep(10)

# Check if running
out, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | head -3")
print(f"Running: {out[:200] if out.strip() else 'NOT RUNNING'}")

# Health check
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"Health: {out[:300] if out.strip() else 'NO RESPONSE'}")

# Public health
out, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"Public: {out[:300] if out.strip() else 'NO RESPONSE'}")

# Try running seed with proper env
if db_url:
    print("\nRunning seed...")
    out, err, code = run(ssh, f"cd {DIR} && {EXPORT18} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' DATABASE_URL='{db_url}' npx prisma generate 2>&1 && echo 'GENOK'", 120)
    if "GENOK" in out:
        print("Prisma: OK")
    else:
        print(f"Prisma: {out[-200:]}")

    out, err, code = run(ssh, f"cd {DIR} && {EXPORT18} && NODE_OPTIONS='--max-http-header-size=16384' PRIMARY_ADMIN_PASSWORD='{NEW_PW}' DATABASE_URL='{db_url}' npx tsx prisma/seed.ts 2>&1 && echo 'SEEDOK'", 300)
    if "SEEDOK" in out:
        print("Seed: OK - password hash updated")
    else:
        print(f"Seed: {out[-500:]}")

print("\n=== FINAL STATUS ===")
print(f"Password in .env: {NEW_PW}")
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print(f"App status: {out[:200] if out.strip() else 'OFFLINE - check Hostinger panel'}")
print(f"Admin: alayainsider@gmail.com / {NEW_PW}")
ssh.close()
