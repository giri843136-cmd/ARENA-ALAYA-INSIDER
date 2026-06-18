#!/usr/bin/env python3
"""Final attempt - seed at /home/u131951911/alaya-insider"""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
NODE = "/opt/alt/alt-nodejs18/root/usr/bin"
EXPORT = f"export PATH={NODE}:$PATH"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("Connected")

# Verify path
out, _, _ = run(ssh, f"ls -la {DIR}/package.json && echo FOUND")
if "FOUND" not in out:
    print(f"FAILED: no package.json at {DIR}")
    out, _, _ = run(ssh, "find /home -name package.json -maxdepth 5 2>/dev/null | head -5")
    print(f"Candidates: {out}")
    ssh.close()
    sys.exit(1)

print(f"OK: Project at {DIR}")

# Check .env has PRIMARY_ADMIN_PASSWORD
out, _, _ = run(ssh, f"grep PRIMARY_ADMIN_PASSWORD {DIR}/.env 2>/dev/null || echo NOT_FOUND")
if "NOT_FOUND" in out:
    # Add it
    run(ssh, f"echo 'PRIMARY_ADMIN_PASSWORD={NEW_PW}' >> {DIR}/.env")
    print("Added PRIMARY_ADMIN_PASSWORD to .env")
else:
    # Update it
    run(ssh, f"sed -i 's|^PRIMARY_ADMIN_PASSWORD=.*|PRIMARY_ADMIN_PASSWORD={NEW_PW}|' {DIR}/.env")
    print("Updated PRIMARY_ADMIN_PASSWORD in .env")

# Verify
out, _, _ = run(ssh, f"grep PRIMARY_ADMIN_PASSWORD {DIR}/.env")
print(f"Env: {out.strip()[:70]}")

# Run seed
print("\nRunning seed...")
out, err, code = run(ssh, f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1", 120)
print(f"Prisma gen: {'OK' if 'generated' in out.lower() else 'CHECK OUTPUT'}")
if 'generated' not in out.lower():
    print(f"  Out: {out[-300:]}")
    print(f"  Err: {err[:200]}")

out, err, code = run(ssh, f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1", 300)
if "seed complete" in out.lower() or "AYA INSIDER seed complete" in out:
    print("OK: Seed completed successfully - password hash updated")
else:
    print(f"WARN: Seed output: {out[-500:]}")
    print(f"WARN: Seed errors: {err[:300]}")

# Restart app
print("\nRestarting app...")
out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && pm2 restart alaya-insider 2>&1 && echo 'PM2OK'")
if "PM2OK" in out:
    print("OK: PM2 restarted")
else:
    print(f"PM2: {out[:200]}")
    # Try npm run build
    print("Building with npm...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && npm run build 2>&1 && echo 'BUILDOK'", 300)
    if "BUILDOK" in out:
        print("OK: Build completed")
    else:
        print(f"Build: {out[-200:]}")

# Health
time.sleep(8)
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nHealth: {out[:300] if out.strip() else '(no response)'}")

print("\nDONE")
print(f"Primary admin: alayainsider@gmail.com / {NEW_PW}")
ssh.close()
