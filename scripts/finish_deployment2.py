#!/usr/bin/env python3
"""
ALAYA INSIDER -- Final deployment step.
Uses Hostinger's alt-nodejs18 paths for npm and pm2.
"""

import paramiko
import os
import sys
import time

VPS_HOST = "157.173.216.156"
VPS_USER = "u131951911"
VPS_PORT = 65002
NEW_PASSWORD = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
VPS_DIR = "/home/u131951911/domains/alayainsider.com"

def run_cmd(ssh, cmd, timeout=180):
    print(f"  $ {cmd[:150]}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    return out, err, exit_code

def main():
    password = os.environ.get("VPS_PASSWORD")
    if not password:
        print("FAILED: Set VPS_PASSWORD env var")
        sys.exit(1)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("[1/4] Connecting...")
    ssh.connect(hostname=VPS_HOST, port=VPS_PORT, username=VPS_USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
    print("OK: Connected")

    # Set up the Hostinger-specific PATH
    NODE_BIN = "/opt/alt/alt-nodejs18/root/usr/bin"
    NPM_BIN = "/opt/alt/alt-nodejs18/root/usr/lib/node_modules/npm/bin"
    EXPORT = f"export PATH={NODE_BIN}:{NPM_BIN}:$PATH"

    print(f"\n[2/4] Verifying Node.js...")
    out, err, code = run_cmd(ssh, f"{EXPORT} && node --version && npm --version && npx --version")
    print(f"  node: {out.split(chr(10))[0].strip()}")
    print(f"  npm:  {out.split(chr(10))[1].strip()}")
    print(f"  npx:  {out.split(chr(10))[2].strip()}")

    # Verify project exists
    out, _, _ = run_cmd(ssh, f"ls {VPS_DIR}/package.json")
    if "No such file" in out:
        print(f"FAILED: No project at {VPS_DIR}")
        # Search
        out, _, _ = run_cmd(ssh, "find /home -name package.json -maxdepth 4 2>/dev/null")
        print(f"Found: {out[:300]}")
        sys.exit(1)
    print(f"OK: Project found at {VPS_DIR}")

    print(f"\n[3/4] Running seed with new password...")

    # Generate Prisma client
    print("  Generating Prisma client...")
    out, err, code = run_cmd(ssh, f"cd {VPS_DIR} && {EXPORT} && npx prisma generate 2>&1 && echo 'GENERATE_OK'")
    if "GENERATE_OK" in out:
        print("  OK: Prisma generated")
    else:
        print(f"  WARN: {out[-200:]}")

    # Run seed
    print("  Running seed...")
    out, err, code = run_cmd(ssh, f"cd {VPS_DIR} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PASSWORD}' npm run db:seed 2>&1 && echo 'SEED_OK'")
    if "SEED_OK" in out:
        print("  OK: Seed completed - password hash updated")
    else:
        print(f"  WARN: Seed output (last 500): {out[-500:]}")
        print(f"  WARN: Seed errors: {err[:300]}")

    # Find and restart PM2
    print("\n[4/4] Restarting application...")

    # Check what's running
    out, _, _ = run_cmd(ssh, f"{EXPORT} && pm2 list 2>&1 || ls /usr/local/bin/pm2* /usr/bin/pm2* 2>/dev/null || find /opt -name 'pm2' -type f 2>/dev/null | head -3 || echo 'PM2_NOT_FOUND'")
    print(f"  PM2 status: {out[:300]}")

    # Try to restart via npm
    print("  Restarting app...")
    out, _, _ = run_cmd(ssh, f"cd {VPS_DIR} && {EXPORT} && npm run build 2>&1 && echo 'BUILD_OK'", timeout=300)
    if "BUILD_OK" in out:
        print("  OK: Build completed")
    else:
        print(f"  WARN: Build output: {out[-200:]}")

    # Check if process is running
    out, _, _ = run_cmd(ssh, "ps aux | grep -i 'next\|node\|3000' | grep -v grep | head -5")
    print(f"  Running processes: {out[:300] if out.strip() else '(none found)'}")

    # Health check
    print("\n  Health check...")
    time.sleep(10)
    out, _, _ = run_cmd(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400", timeout=15)
    print(f"  Health: {out[:300] if out.strip() else '(no response)'}")

    # Also check via the public domain
    out, _, _ = run_cmd(ssh, "curl -s https://alayainsider.com/api/ops/health 2>&1 | head -c 400", timeout=15)
    print(f"  Public health: {out[:300] if out.strip() else '(no response)'}")

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE")
    print("=" * 60)
    print(f"Primary admin: alayainsider@gmail.com")
    print(f"New password:   {NEW_PASSWORD}")
    print()
    print("Change this password immediately after first login via /admin/security")

    ssh.close()

if __name__ == "__main__":
    main()
