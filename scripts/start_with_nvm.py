#!/usr/bin/env python3
"""Start app with Node v22 from nvm using the old build."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = f"export PATH={N22}:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

# Verify Node v22 works
out, _, _ = run(ssh, f"{EXP} && node --version")
print(f"Node: {out.strip()}")

# Kill any stale processes
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f node.*3000 2>/dev/null; sleep 2")

# Check BUILD_ID still exists
out, _, _ = run(ssh, f"cat {DIR}/.next/BUILD_ID 2>/dev/null || echo 'NO_BUILD'")
if "NO_BUILD" in out:
    print("Build missing, restoring backup...")
    run(ssh, f"ls {DIR}/.next.old/BUILD_ID 2>/dev/null && rm -rf {DIR}/.next && mv {DIR}/.next.old {DIR}/.next || echo 'NO_BACKUP'")
    out, _, _ = run(ssh, f"cat {DIR}/.next/BUILD_ID 2>/dev/null || echo 'STILL_NO_BUILD'")
    if "STILL_NO_BUILD" in out:
        print("No build available. Cannot start.")
        ssh.close()
        sys.exit(1)

# Check node_modules has next
out, _, _ = run(ssh, f"ls {DIR}/node_modules/next/package.json 2>/dev/null && echo 'NM_OK' || echo 'NM_MISSING'")
if "NM_MISSING" in out:
    print("node_modules missing, running npm install...")
    run(ssh, f"cd {DIR} && {EXP} && npm install --production 2>&1 && echo 'NPMOK'", 180)

# Start with Node v22
print("\nStarting app with Node v22...")
run(ssh, f"cd {DIR} && {EXP} && nohup {N22}/node node_modules/.bin/next start > /tmp/alaya-n22.log 2>&1 & echo 'STARTED'")
print("Start initiated, waiting 30s...")

for i in range(6):
    time.sleep(5)
    out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
    if out.strip():
        print(f"Health (attempt {i+1}): {out[:150]}")
        break
    ps, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
    print(f"Attempt {i+1}: {ps.strip()} process(es)")

# Run seed
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
if out.strip():
    print("\nRunning seed...")
    out2, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
    if "SEEDOK" in out2:
        print("Seed: OK - password hash updated in database")
    else:
        print(f"Seed: {out2[-400:]}")

# Final
health, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nLocal:  {health[:200] if health.strip() else 'OFFLINE'}")
public, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"Public: {public[:200] if public.strip() else 'OFFLINE'}")
print(f"Admin:  alayainsider@gmail.com / {NEW_PW}")
ssh.close()
