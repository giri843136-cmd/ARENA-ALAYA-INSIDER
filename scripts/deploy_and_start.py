#!/usr/bin/env python3
"""Upload start script, run it, check app, seed, verify."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
SCRIPT = "scripts/final_vps_start.sh"
LOCAL_DIR = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Upload startup script to VPS
print("\n[1/5] Uploading start script...")
sftp = ssh.open_sftp()
local_path = os.path.join(LOCAL_DIR, SCRIPT)
sftp.put(local_path, f"{DIR}/start_alaya.sh")
sftp.close()
run(ssh, f"chmod +x {DIR}/start_alaya.sh")
print("OK: Uploaded")

# Kill stale processes
run(ssh, "pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 1")
print("Old processes killed")

# Run the start script with a short timeout (nohup should return instantly)
print("\n[2/5] Starting app...")
stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && bash start_alaya.sh 2>&1", timeout=10)
try:
    out = stdout.read().decode("utf-8","replace")
    err = stderr.read().decode("utf-8","replace")
    print(f"Start output: {out.strip()[:200]}")
except:
    print("Start initiated (timeout expected)")

# Wait for app to initialize
print("\n[3/5] Waiting for app to start...")
for i in range(12):
    time.sleep(5)
    health, _, _ = run(ssh, "curl -s --connect-timeout 3 http://localhost:3000/api/ops/health 2>&1 | head -c 200")
    if health.strip() and "error" not in health.lower()[:10]:
        print(f"[OK] App live! (attempt {i+1}): {health[:120]}")
        break
    ps, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
    log, _, _ = run(ssh, "tail -3 /tmp/alaya-n22.log 2>/dev/null || echo 'nolog'")
    print(f"Attempt {i+1}: {ps.strip()} proc(s) | {log.strip()[:100]}")
else:
    log, _, _ = run(ssh, "tail -20 /tmp/alaya-n22.log 2>/dev/null")
    print(f"App did not start. Log:\n{log[:500]}")
    ssh.close()
    sys.exit(1)

# Run seed
print("\n[4/5] Running seed...")
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = f"export PATH={N22}:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && echo 'GENOK'", 120)
if "GENOK" in out:
    print("Prisma: OK")
else:
    print(f"Prisma: {out[-200:]}")
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
if "SEEDOK" in out:
    print("Seed: OK - password hash updated!")
else:
    print(f"Seed: {out[-400:]}")

# Final health
print("\n[5/5] Final verification...")
h, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
p, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400")
print(f"Local:  {h[:200] if h.strip() else 'OFFLINE'}")
print(f"Public: {p[:200] if p.strip() else 'OFFLINE'}")

# Save PM2 config for persistence
print("\nSaving PM2 config for auto-restart...")
run(ssh, f"cd {DIR} && {EXP} && npm install -g pm2 2>&1 && pm2 start ecosystem.config.js 2>&1 && pm2 save 2>&1", 60)

print(f"\nAdmin: alayainsider@gmail.com / {NEW_PW}")
print(f"Start script: {DIR}/start_alaya.sh")
ssh.close()
