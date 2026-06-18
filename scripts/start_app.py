#!/usr/bin/env python3
"""Quick start the app on VPS with the uploaded build."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
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

# Check what builds are available
out, _, _ = run(ssh, f"ls -la {DIR}/.next/BUILD_ID 2>/dev/null || ls -la {DIR}/.next.old/BUILD_ID 2>/dev/null || echo 'NO_BUILD'")
print(f"Build status: {out.strip()[:200]}")

if "NO_BUILD" in out:
    print("No build found - checking if uploaded tar arrived")
    out, _, _ = run(ssh, f"ls -la {DIR}/.next.tar.gz 2>/dev/null || echo 'NO_TAR'")
    print(f"Tar: {out.strip()[:100]}")
    if "NO_TAR" not in out:
        run(ssh, f"cd {DIR} && tar xzf .next.tar.gz 2>&1 && echo 'EXTRACTED'")
        print("Extracted build from tar")

# Check node_modules
out, _, _ = run(ssh, f"ls {DIR}/node_modules/.package-lock.json 2>/dev/null && echo 'NM_EXISTS' || echo 'NO_NM'")
print(f"node_modules: {out.strip()}")

if "NO_NM" in out:
    print("node_modules missing - running npm ci...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && npm ci --production 2>&1 && echo 'CIOK'", 180)
    if "CIOK" in out:
        print("npm ci: OK")
    else:
        print(f"npm ci: {out[-200:]}")
        run(ssh, f"cd {DIR} && {EXP} && npm install --production 2>&1 && echo 'NPMOK'", 180)

# Kill any existing processes
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 2")

# Start with Node v18
print("Starting app...")
run(ssh, f"cd {DIR} && {EXP} && nohup node node_modules/.bin/next start > /tmp/alaya-start.log 2>&1 & echo 'STARTED'")
print("App start initiated")

# Wait and check
for i in range(6):
    time.sleep(10)
    ps_out, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | head -3")
    health_out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
    
    if health_out.strip():
        print(f"App is RUNNING: {health_out[:150]}")
        break
    elif "next-server" in ps_out:
        print(f"Process running, waiting for health... (attempt {i+1})")
    else:
        print(f"Attempt {i+1}: process not found")
        log_out, _, _ = run(ssh, f"tail -10 /tmp/alaya-start.log 2>/dev/null || echo 'no log'")
        print(f"Log: {log_out[:200]}")

# Final status
health_out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nHealth: {health_out[:200] if health_out.strip() else 'OFFLINE'}")

public_out, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"Public: {public_out[:200] if public_out.strip() else 'OFFLINE'}")

# Run seed if app is running
if health_out.strip():
    print("\nRunning seed to update admin password...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P' npx tsx prisma/seed.ts 2>&1 && echo 'SEEDOK'", 300)
    if "SEEDOK" in out:
        print("Seed: OK - password hash updated")
    else:
        print(f"Seed: {out[-300:]}")

print(f"\nAdmin: alayainsider@gmail.com / 7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P")
ssh.close()
