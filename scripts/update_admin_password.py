#!/usr/bin/env python3
"""
ALAYA INSIDER -- Update Primary Admin Password on Production VPS
SSHs in, updates .env.production with the new password, re-runs the seed, restarts PM2.
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
    print(f"  -> {cmd[:120]}...")
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
    print("ALAYA INSIDER -- Update Admin Password")
    print(f"Target: {VPS_USER}@{VPS_HOST}:{VPS_PORT}")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("\n[1/4] Connecting to VPS...")
    try:
        ssh.connect(
            hostname=VPS_HOST, port=VPS_PORT,
            username=VPS_USER, password=password,
            look_for_keys=False, allow_agent=False, timeout=30,
        )
        print("[OK] Connected")
    except Exception as e:
        print(f"[FAILED] Connection: {e}")
        sys.exit(1)

    try:
        # Find project directory
        print("\n[2/4] Locating project directory...")
        VPS_DIR = None
        for d in ["/opt/alaya-insider", "/home/u131951911/alaya-insider", "/home/u131951911/domains/alayainsider.com"]:
            out, _, _ = run_cmd(ssh, f"ls -la {d}/package.json 2>/dev/null && echo 'FOUND'")
            if "FOUND" in out:
                VPS_DIR = d
                print(f"[OK] Found at {VPS_DIR}")
                break
        if not VPS_DIR:
            out, _, _ = run_cmd(ssh, "find / -name package.json -maxdepth 5 2>/dev/null | grep -i alaya | head -5")
            if out.strip():
                VPS_DIR = os.path.dirname(out.strip().split("\n")[0])
                print(f"[OK] Found at {VPS_DIR}")
            else:
                print("[FAILED] Project directory not found")
                sys.exit(1)

        # Update .env.production with new password
        print(f"\n[3/4] Updating PRIMARY_ADMIN_PASSWORD...")
        
        # Check which env file exists
        out, _, _ = run_cmd(ssh, f"ls -la {VPS_DIR}/.env.production 2>/dev/null || ls -la {VPS_DIR}/.env 2>/dev/null || echo 'NOT_FOUND'")
        
        if ".env.production" in out:
            env_file = ".env.production"
        elif ".env" in out:
            env_file = ".env"
        else:
            env_file = ".env"
            # Create it
            run_cmd(ssh, f"touch {VPS_DIR}/{env_file}")
        
        # Remove old PRIMARY_ADMIN_PASSWORD line, append new one
        cmd = f"cd {VPS_DIR} && sed -i '/^PRIMARY_ADMIN_PASSWORD=/d' {env_file} && echo 'PRIMARY_ADMIN_PASSWORD={NEW_PASSWORD}' >> {env_file}"
        out, err, code = run_cmd(ssh, cmd)
        if code == 0:
            print(f"[OK] PRIMARY_ADMIN_PASSWORD set in {env_file}")
        else:
            # Fallback: just append
            run_cmd(ssh, f"cd {VPS_DIR} && echo 'PRIMARY_ADMIN_PASSWORD={NEW_PASSWORD}' >> {env_file}")
            print(f"[OK] Appended to {env_file}")
        
        # Also ensure .env has it (setup script sources .env)
        run_cmd(ssh, f"cd {VPS_DIR} && (grep -q 'PRIMARY_ADMIN_PASSWORD' .env 2>/dev/null && sed -i '/^PRIMARY_ADMIN_PASSWORD=/d' .env; echo 'PRIMARY_ADMIN_PASSWORD={NEW_PASSWORD}' >> .env) || echo 'PRIMARY_ADMIN_PASSWORD={NEW_PASSWORD}' >> .env")

        # Verify
        out, _, _ = run_cmd(ssh, f"cd {VPS_DIR} && grep PRIMARY_ADMIN_PASSWORD .env")
        print(f"Verified in .env: {out.strip()[:60]}...")
        out, _, _ = run_cmd(ssh, f"cd {VPS_DIR} && cat {env_file} | grep PRIMARY_ADMIN_PASSWORD | head -1")
        print(f"Verified in {env_file}: {out.strip()[:60]}...")

        # Re-run the seed
        print(f"\n[4/4] Re-running seed to update password hash...")
        out, err, code = run_cmd(ssh, f"cd {VPS_DIR} && PRIMARY_ADMIN_PASSWORD='{NEW_PASSWORD}' npm run db:seed 2>&1", timeout=180)
        print(f"Seed output (last 500 chars): {out[-500:]}")
        if code != 0:
            print(f"[WARN] Seed exit code: {code}")
            print(f"[WARN] Seed stderr: {err[:200]}")
        else:
            print("[OK] Admin password hash updated in database")

        # Restart PM2
        print("\nRestarting PM2...")
        out, _, _ = run_cmd(ssh, f"cd {VPS_DIR} && pm2 restart alaya-insider 2>&1", timeout=30)
        print(f"PM2: {out[:200]}")

        # Health check
        time.sleep(5)
        out, _, _ = run_cmd(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300", timeout=15)
        print(f"\nHealth: {out[:200]}")

        print("\n" + "=" * 60)
        print("[OK] PASSWORD UPDATE COMPLETE")
        print("=" * 60)
        print(f"Primary admin: alayainsider@gmail.com")
        print(f"New password:   {NEW_PASSWORD}")
        print()

    except Exception as e:
        print(f"\n[FAILED] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
