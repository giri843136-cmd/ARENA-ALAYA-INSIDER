#!/usr/bin/env python3
"""Simple final run - seed with explicit env vars."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=180):
    print(f"  $ {cmd[:120]}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8","replace")
    err = stderr.read().decode("utf-8","replace")
    return out, err, code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Read the DATABASE_URL from .env on VPS
out, _, _ = run(ssh, f"grep DATABASE_URL {DIR}/.env 2>/dev/null | head -1")
db_url = out.strip()
print(f"DB URL found: {db_url[:60]}...")

# Use Node v22 from nvm
NODE22 = "$HOME/.nvm/versions/node/v22.22.3/bin/node"
NPX22 = "$HOME/.nvm/versions/node/v22.22.3/bin/npx"
EXPORT = f"export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"

# Step 1: Prisma generate
print("\n1/3: Prisma generate...")
out, err, code = run(ssh, f"cd {DIR} && {EXPORT} && {NPX22} prisma generate 2>&1 && echo 'GENOK'", 120)
if "GENOK" in out:
    print("  OK: Prisma generated")
else:
    print(f"  {out[-300:]}")

# Step 2: Run seed
print("\n2/3: Run seed...")
seed_cmd = f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' DATABASE_URL='{db_url.replace('DATABASE_URL=','').strip()}' {NPX22} tsx prisma/seed.ts 2>&1 && echo 'SEEDOK'"
out, err, code = run(ssh, seed_cmd, 300)
if "SEEDOK" in out:
    print("  OK: Seed completed - password hash updated!")
else:
    print(f"  Seed output: {out[-300:]}")
    # Fallback: try via npm
    out2, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEEDOK2'", 300)
    if "SEEDOK2" in out2:
        print("  OK: Seed via npm completed!")
    else:
        print(f"  Seed via npm: {out2[-300:]}")

# Step 3: Restart app
print("\n3/3: Restarting app...")
# Kill existing
run(ssh, "pkill -f next-server 2>/dev/null || true")
time.sleep(2)
# Start with Node v22
out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && nohup {NODE22} node_modules/.bin/next start > /tmp/alaya-start.log 2>&1 & echo 'STARTED' && sleep 5", 30)
print(f"  Start: {out[:100]}")

time.sleep(8)
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nHealth: {out[:300] if out.strip() else '(no response)'}")

print("\n" + "=" * 60)
print("DONE")
print(f"Admin: alayainsider@gmail.com")
print(f"Password: {NEW_PW}")
ssh.close()
