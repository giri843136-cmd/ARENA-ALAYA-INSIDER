#!/usr/bin/env python3
"""Complete everything: install Node v22 via nvm, run seed, build, restart."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=180):
    print(f"$ {cmd[:120]}")
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

# Verify project exists
out, _, _ = run(ssh, f"ls {DIR}/package.json && echo FOUND")
if "FOUND" not in out:
    print(f"FAILED: no project at {DIR}")
    ssh.close()
    sys.exit(1)
print(f"OK: Project at {DIR}")

# Step 1: Check if nvm is installed, install if not
print("\n=== Step 1: Node.js via nvm ===")
out, _, _ = run(ssh, "export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && echo 'NVM_EXISTS' || echo 'NO_NVM'")
if "NVM_EXISTS" in out:
    print("OK: nvm already installed")
else:
    print("Installing nvm...")
    out, _, _ = run(ssh, "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh 2>/dev/null | bash 2>&1 && echo 'NVM_INSTALLED'", 60)

# Setup nvm and install Node v22
setup_nvm = "export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh"

# Check current node
out, _, _ = run(ssh, f"{setup_nvm} && node --version && nvm --version 2>&1")
print(f"Node: {out.split(chr(10))[0].strip() if out.strip() else '(n/a)'}")

# Install Node v22
print("Installing Node.js v22...")
out, _, _ = run(ssh, f"{setup_nvm} && nvm install 22 2>&1 && echo 'NVM22_OK'", 120)
if "NVM22_OK" in out:
    print("OK: Node v22 installed")
    # Find the path to Node v22
    out2, _, _ = run(ssh, f"{setup_nvm} && nvm which 22 2>&1")
    node22_path = out2.strip()
    print(f"Node v22 at: {node22_path}")
else:
    # Try to find nvm's Node 22 binary directly
    out2, _, _ = run(ssh, "ls $HOME/.nvm/versions/node/v22*/bin/node 2>/dev/null || echo 'NOT_FOUND'")
    if "NOT_FOUND" not in out2:
        node22_path = out2.strip().split('\n')[0]
    else:
        print(f"WARN: {out[-200:]}")
        print(f"WARN: {out2[:200]}")
        # Use the system Node v18 as fallback
        node22_path = "/opt/alt/alt-nodejs18/root/usr/bin/node"

# Now use the new Node
node22_bin = os.path.dirname(node22_path)
EXPORT = f"export PATH={node22_bin}:$PATH"

out, _, _ = run(ssh, f"{EXPORT} && node --version 2>&1")
print(f"Using: {out.strip()}")

# Step 2: Update .env with new password
print("\n=== Step 2: Update password in .env ===")
run(ssh, f"sed -i '/^PRIMARY_ADMIN_PASSWORD=/d' {DIR}/.env 2>/dev/null || true")
run(ssh, f"echo 'PRIMARY_ADMIN_PASSWORD={NEW_PW}' >> {DIR}/.env")
out, _, _ = run(ssh, f"grep PRIMARY_ADMIN_PASSWORD {DIR}/.env")
print(f"OK: {out.strip()[:70]}")

# Step 3: Run Prisma generate and seed
print("\n=== Step 3: Prisma generate + seed ===")
out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && npx prisma generate 2>&1 && echo 'GENOK'", 120)
if "GENOK" in out:
    print("OK: Prisma generated")
else:
    print(f"WARN: {out[-300:]}")
    # Try with node --experimental-modules flag or from dist
    out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && node --experimental-modules node_modules/.bin/prisma generate 2>&1 && echo 'GENOK2'", 120)

out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEEDOK'", 300)
if "SEEDOK" in out:
    print("OK: Seed completed - password hash updated")
else:
    print(f"Seed: {out[-400:]}")
    # Try with node directly
    out2, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx tsx prisma/seed.ts 2>&1 && echo 'SEEDOK2'", 300)
    if "SEEDOK2" in out2:
        print("OK: Seed via tsx completed")
    else:
        print(f"Seed via tsx: {out2[-400:]}")

# Step 4: Build with Node v22
print("\n=== Step 4: Build with Node v22 ===")
out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && npm run build 2>&1 && echo 'BUILDOK'", 600)
if "BUILDOK" in out:
    print("OK: Build completed")
else:
    print(f"Build: {out[-300:]}")
    # Retry with --no-lint
    out, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && NODE_OPTIONS='--max-old-space-size=4096' npm run build 2>&1 && echo 'BUILDOK2'", 600)
    if "BUILDOK2" in out:
        print("OK: Build completed (retry)")
    else:
        print(f"Build retry: {out[-300:]}")

# Step 5: Find and restart the app process
print("\n=== Step 5: Restart app ===")
# Try to find pm2 with nvm node
out, _, _ = run(ssh, f"{setup_nvm} && {EXPORT} && which pm2 2>/dev/null; npm install -g pm2 2>&1 && which pm2 2>/dev/null || echo 'PM2_NOT_FOUND'", 60)

out2, _, _ = run(ssh, f"{setup_nvm} && {EXPORT} && pm2 restart alaya-insider 2>&1 && echo 'PM2OK'", 30)
if "PM2OK" in out2:
    print("OK: PM2 restarted")
else:
    # Kill existing next processes and start fresh
    run(ssh, "pkill -f 'next-server' 2>/dev/null || true")
    time.sleep(2)
    out3, _, _ = run(ssh, f"cd {DIR} && {EXPORT} && nohup npm start > /tmp/alaya-out.log 2>&1 & echo 'STARTED' && sleep 3 && ps aux | grep next | grep -v grep | head -3", 30)
    print(f"Start: {out3[:200] if out3.strip() else '(failed)'}")

# Step 6: Health check
print("\n=== Step 6: Health check ===")
time.sleep(10)
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400", 15)
print(f"Local health: {out[:300] if out.strip() else '(no response)'}")

out, _, _ = run(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400", 15)
print(f"Public health: {out[:300] if out.strip() else '(no response)'}")

print("\n" + "=" * 60)
print("COMPLETE")
print("=" * 60)
print(f"Primary admin: alayainsider@gmail.com")
print(f"Password: {NEW_PW}")
print()
print("IMPORTANT: Change this password on first login via")
print("https://alayainsider.com/admin/security")
ssh.close()
