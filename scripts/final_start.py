#!/usr/bin/env python3
"""Start app with Node v22 properly in background, verify, seed."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("Connected")

N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = f"export PATH={N22}:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

# Verify build exists
out, _, _ = run(ssh, f"cat {DIR}/.next/BUILD_ID 2>/dev/null || echo 'NOBUILD'")
if "NOBUILD" in out:
    print("Restoring build from backup...")
    run(ssh, f"rm -rf {DIR}/.next && mv {DIR}/.next.old {DIR}/.next 2>/dev/null || true")
    out, _, _ = run(ssh, f"cat {DIR}/.next/BUILD_ID 2>/dev/null || echo 'NOBUILD'")
    if "NOBUILD" in out:
        print("No build available")
        ssh.close()
        sys.exit(1)

print(f"Build: {out.strip()[:50]}")

# Verify next is in node_modules
out, _, _ = run(ssh, f"ls {DIR}/node_modules/next/package.json 2>/dev/null || echo 'NOMOD'")
if "NOMOD" in out:
    print("Installing node_modules...")
    run(ssh, f"cd {DIR} && {EXP} && npm install --production 2>&1", 180)

# Kill old processes
run(ssh, "pkill -9 -f 'next-server' 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 1")

# Start in background using screen or simple background
# Use 'setsid' to detach process completely
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && setsid {N22}/node node_modules/.bin/next start > /tmp/alaya-n22.log 2>&1 & disown && echo 'STARTED' && sleep 2 && ps aux | grep next-server | grep -v grep | wc -l")
print(f"Start: {out.strip()[:100]}")

ps, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
print(f"Processes: {ps.strip()}")

# Wait for health
for i in range(12):
    time.sleep(5)
    health, _, _ = run(ssh, "curl -s --connect-timeout 3 http://localhost:3000/api/ops/health 2>&1 | head -c 200")
    if health.strip() and "error" not in health.lower():
        print(f"[OK] App running (attempt {i+1}): {health[:120]}")
        break
    ps, _, _ = run(ssh, "ps aux | grep next-server | grep -v grep | wc -l")
    print(f"Attempt {i+1}: {ps.strip()} proc(s)")
    if i == 3:
        log, _, _ = run(ssh, "tail -5 /tmp/alaya-n22.log 2>/dev/null || echo 'nolog'")
        print(f"Log: {log[:200]}")
else:
    print("App did not start in time")
    log, _, _ = run(ssh, "tail -20 /tmp/alaya-n22.log 2>/dev/null || echo 'nolog'")
    print(f"Final log: {log[:500]}")

# Run seed
health, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
if health.strip() and "error" not in health.lower():
    print("\nRunning seed with Node v22...")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && echo 'GENOK'", 120)
    if "GENOK" in out:
        print("Prisma: OK")
    out, _, _ = run(ssh, f"cd {DIR} && {EXP} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
    if "SEEDOK" in out:
        print("Seed: OK - password hash updated in database!")
    else:
        print(f"Seed: {out[-400:]}")
else:
    print("\nSkipping seed - app not healthy")

# Final
h, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
p, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 300")
print(f"\nLocal:  {h[:200] if h.strip() else 'OFFLINE'}")
print(f"Public: {p[:200] if p.strip() else 'OFFLINE'}")
print(f"Admin:  alayainsider@gmail.com / {NEW_PW}")
ssh.close()
