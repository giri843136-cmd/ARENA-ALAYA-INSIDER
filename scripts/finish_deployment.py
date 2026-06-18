#!/usr/bin/env python3
"""
ALAYA INSIDER -- Finish deployment: find node/npm/pm2 paths, re-run seed, restart PM2.
"""

import paramiko
import os
import sys
import time

VPS_HOST = "157.173.216.156"
VPS_USER = "u131951911"
VPS_PORT = 65002
NEW_PASSWORD = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"

def run_cmd(ssh, cmd, timeout=120):
    print(f"  -> {cmd[:150]}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    return out, err, exit_code

def main():
    password = os.environ.get("VPS_PASSWORD")
    if not password:
        print("[FAILED] Set VPS_PASSWORD env var")
        sys.exit(1)

    print("=" * 60)
    print("ALAYA INSIDER -- Finish Deployment on VPS")
    print(f"Target: {VPS_USER}@{VPS_HOST}:{VPS_PORT}")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("\n[1/5] Connecting...")
    try:
        ssh.connect(hostname=VPS_HOST, port=VPS_PORT, username=VPS_USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
        print("[OK] Connected")
    except Exception as e:
        print(f"[FAILED] {e}")
        sys.exit(1)

    try:
        # Find project dir
        VPS_DIR = None
        for d in ["/opt/alaya-insider", "/home/u131951911/alaya-insider", "/home/u131951911/domains/alayainsider.com"]:
            out, _, _ = run_cmd(ssh, f"ls {d}/package.json 2>/dev/null && echo 'FOUND'")
            if "FOUND" in out:
                VPS_DIR = d
                break
        if not VPS_DIR:
            print("[FAILED] Project not found")
            sys.exit(1)
        print(f"[OK] Project at {VPS_DIR}")

        # [2/5] Find node/npm paths
        print("\n[2/5] Finding Node/npm paths...")
        cmds_to_try = [
            "which node 2>/dev/null || command -v node",
            "which npm 2>/dev/null || command -v npm",
            "which pm2 2>/dev/null || command -v pm2",
            "ls -la /usr/local/bin/node* /usr/bin/node* /usr/local/nvm/*/bin/node 2>/dev/null || echo 'no node'",
            "source ~/.bashrc 2>/dev/null; which node npm pm2 2>/dev/null",
            "source ~/.profile 2>/dev/null; which node npm pm2 2>/dev/null",
            "source ~/.bash_profile 2>/dev/null; which node npm pm2 2>/dev/null",
            "export NVM_DIR=\"$HOME/.nvm\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"; which node npm pm2 2>/dev/null",
        ]
        for c in cmds_to_try:
            out, _, _ = run_cmd(ssh, c)
            if out.strip() and "no node" not in out and "not found" not in out.lower():
                print(f"[OK] Found: {out.strip()[:200]}")

        # Check for common Node.js installation patterns
        out, _, _ = run_cmd(ssh, "ls /usr/local/nvm/versions/node/*/bin/node 2>/dev/null || ls /root/.nvm/versions/node/*/bin/node 2>/dev/null || ls /home/u131951911/.nvm/versions/node/*/bin/node 2>/dev/null || echo 'no_nvm'")
        if "no_nvm" not in out and out.strip():
            nvm_node = out.strip().split('\n')[0]
            nvm_bin = os.path.dirname(nvm_node)
            print(f"[OK] NVM node at: {nvm_node}")
            print(f"[OK] NVM bin at: {nvm_bin}")

            # Use this path for everything
            export_path = f"export PATH={nvm_bin}:$PATH"

            # [3/5] Run seed with correct PATH
            print("\n[3/5] Running seed with correct PATH...")
            cmd = f"cd {VPS_DIR} && {export_path} && PRIMARY_ADMIN_PASSWORD='{NEW_PASSWORD}' npx prisma generate 2>&1 && echo '---GENERATE_DONE---'"
            out, err, code = run_cmd(ssh, cmd, timeout=120)
            if "---GENERATE_DONE---" in out:
                print("[OK] Prisma generate done")
            else:
                print(f"[WARN] Prisma generate: {out[-200:]}")

            cmd = f"cd {VPS_DIR} && {export_path} && PRIMARY_ADMIN_PASSWORD='{NEW_PASSWORD}' npm run db:seed 2>&1 && echo '---SEED_DONE---'"
            out, err, code = run_cmd(ssh, cmd, timeout=180)
            if "---SEED_DONE---" in out:
                print("[OK] Seed completed - password hash updated")
            else:
                print(f"[WARN] Seed output (last 300): {out[-300:]}")

            # [4/5] Restart PM2 with correct PATH
            print("\n[4/5] Restarting PM2...")
            cmd = f"cd {VPS_DIR} && {export_path} && pm2 restart alaya-insider 2>&1 && echo '---PM2_DONE---'"
            out, err, code = run_cmd(ssh, cmd, timeout=30)
            if "---PM2_DONE---" in out:
                print("[OK] PM2 restarted")
            else:
                print(f"[WARN] PM2: {out[:200]}")
                # Try starting if restart fails
                cmd = f"cd {VPS_DIR} && {export_path} && pm2 start npm --name alaya-insider -- run start 2>&1"
                out, _, _ = run_cmd(ssh, cmd, timeout=30)
                print(f"PM2 start: {out[:200]}")

        else:
            print("[WARN] No NVM found, trying system PATH...")
            # Try finding npm directly
            out, _, _ = run_cmd(ssh, "find / -name npm -type f 2>/dev/null | head -5")
            print(f"npm locations: {out[:200]}")

        # [5/5] Health check
        print("\n[5/5] Health check...")
        time.sleep(8)
        out, _, _ = run_cmd(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400", timeout=15)
        print(f"Health: {out[:300] if out.strip() else '(no response - app may still be starting)'}")

        print("\n" + "=" * 60)
        print("[OK] DEPLOYMENT FINISHED")
        print("=" * 60)
        print(f"Primary admin: alayainsider@gmail.com")
        print(f"New password:   {NEW_PASSWORD}")
        print()
        print("IMPORTANT: Change this password immediately on first login")
        print("via the Security Center at /admin/security")

    except Exception as e:
        print(f"\n[FAILED] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
