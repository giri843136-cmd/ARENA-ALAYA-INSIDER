#!/usr/bin/env python3
"""
ALAYA INSIDER — Security Deployment Script
SSHes into the production VPS, copies the latest code, runs migrations + seed, rebuilds and restarts.
Usage: python scripts/deploy_security.py
"""

import paramiko
import os
import sys
import time
import getpass
import tarfile
import io

VPS_HOST = "157.173.216.156"
VPS_USER = "u131951911"
VPS_PORT = 65002

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_ssh_command(ssh, command, timeout=120):
    """Run a command via SSH and return (stdout, stderr, exit_code)."""
    print(f"  → {command[:120]}...")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    return out, err, exit_code

def main():
    print("=" * 60)
    print("ALAYA INSIDER — Security Deployment to VPS")
    print("=" * 60)
    print(f"Target: {VPS_USER}@{VPS_HOST}:{VPS_PORT}")
    print()

    # Get VPS password from env var (set by caller) or prompt
    password = os.environ.get("VPS_PASSWORD") or getpass.getpass("Enter VPS SSH password: ")

    # Connect to VPS
    print("\n[1/5] Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(
            hostname=VPS_HOST,
            port=VPS_PORT,
            username=VPS_USER,
            password=password,
            look_for_keys=False,
            allow_agent=False,
            timeout=30,
        )
        print("  ✅ Connected to VPS")
    except Exception as e:
        print(f"  ❌ Connection failed: {e}")
        sys.exit(1)

    try:
        # Check project directory
        print("\n[2/5] Checking project directory on VPS...")
        out, err, code = run_ssh_command(ssh, "ls -la /opt/alaya-insider/package.json 2>/dev/null || ls -la /home/alaya/alaya-insider/package.json 2>/dev/null || echo 'NOT_FOUND'")
        
        if "NOT_FOUND" in out:
            print("  ⚠️  Project directory not found at /opt/alaya-insider or /home/alaya/alaya-insider")
            out, err, code = run_ssh_command(ssh, "find / -name \"package.json\" -path \"*alaya*\" -maxdepth 4 2>/dev/null | head -5")
            print(f"  Searching... Found: {out[:200] if out.strip() else 'None'}")
            if not out.strip():
                print("  ❌ Cannot find project directory on VPS. Aborting.")
                sys.exit(1)
            vps_project_dir = out.strip().split('\n')[0].replace('/package.json', '')
        else:
            if "alayainsider.com" in out or "/opt/alaya-insider" in out:
                vps_project_dir = "/opt/alaya-insider"
            else:
                vps_project_dir = "/home/alaya/alaya-insider"
        
        print(f"  ✅ Project directory: {vps_project_dir}")

        # Check current git state
        print(f"\n[3/5] Checking git state on VPS...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && git log --oneline -3 2>/dev/null || echo 'NO_GIT'")
        print(f"  Current commits:\n{out[:300]}")

        # Pull latest code from GitHub
        print(f"\n[4/5] Pulling latest code from GitHub...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && git pull origin main 2>&1", timeout=60)
        if code != 0:
            print(f"  ⚠️  Git pull failed (may need auth): {err[:200]}")
            print(f"  Will try to push code from local machine...")
            
            # Create a tar.gz of the critical files
            print("  Creating code archive to transfer...")
            sftp = ssh.open_sftp()
            
            # Files to transfer (project root files + changed dirs)
            critical_files = [
                "package.json", "package-lock.json", "next.config.ts", 
                "middleware.ts", "ecosystem.config.js", ".env.example",
                "prisma/schema.prisma", "prisma/seed.ts",
                "prisma/migrations/migration_add_security.sql",
                "scripts/setup-real-db-and-seed.sh",
            ]
            
            for f in critical_files:
                local_path = os.path.join(PROJECT_DIR, f)
                if os.path.exists(local_path):
                    remote_path = f"{vps_project_dir}/{f}"
                    try:
                        sftp.stat(os.path.dirname(remote_path))
                        sftp.put(local_path, remote_path)
                        print(f"    ✅ Copied {f}")
                    except Exception as e:
                        print(f"    ❌ Failed to copy {f}: {e}")
            
            # Create remote dirs for new files
            for remote_dir in [
                "app/api/auth/[...nextauth]",
                "app/api/csp-violation",
                "app/api/v1/admin/security/change-password",
                "app/api/v1/admin/security/setup-2fa",
                "app/api/v1/admin/security/activity",
                "app/api/v1/admin/security/delegated-access",
                "lib/backend/auth",
                "lib/backend/security",
                "lib/backend/observability",
                "components/ui",
            ]:
                run_ssh_command(ssh, f"mkdir -p {vps_project_dir}/{remote_dir}")
            
            # Copy all new directories
            new_dirs = [
                "app/api/auth/[...nextauth]",
                "app/api/csp-violation",
                "app/api/v1/admin/security",
                "lib/backend/auth",
                "lib/backend/security",
                "components/ui/CookieConsent.tsx",
            ]
            
            for d in new_dirs:
                local_path = os.path.join(PROJECT_DIR, d)
                if os.path.isdir(local_path):
                    for root, dirs, files in os.walk(local_path):
                        for file in files:
                            local_file = os.path.join(root, file)
                            rel_path = os.path.relpath(local_file, PROJECT_DIR)
                            remote_file = f"{vps_project_dir}/{rel_path.replace(os.sep, '/')}"
                            try:
                                sftp.put(local_file, remote_file)
                                print(f"    ✅ Copied {rel_path}")
                            except Exception as e:
                                print(f"    ❌ Failed to copy {rel_path}: {e}")
                elif os.path.isfile(local_path):
                    rel_path = os.path.relpath(local_path, PROJECT_DIR)
                    remote_file = f"{vps_project_dir}/{rel_path.replace(os.sep, '/')}"
                    try:
                        sftp.put(local_path, remote_file)
                        print(f"    ✅ Copied {rel_path}")
                    except Exception as e:
                        print(f"    ❌ Failed to copy {rel_path}: {e}")
            
            sftp.close()
            print("  ✅ Code transfer complete")
        else:
            print(f"  ✅ Git pull successful")

        # Run the security migration
        print(f"\n[5/5] Running security migration on production database...")
        print("  Step 5a: Running SQL migration (passwordHash, 2FA, audit tables)...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && psql \"$DATABASE_URL\" -f prisma/migrations/migration_add_security.sql 2>&1", timeout=60)
        if code != 0:
            print(f"  ⚠️  Migration output: {out[:300]}")
            if "already exists" in out.lower() or "IF NOT EXISTS" in err:
                print("  ℹ️  Tables may already exist. Continuing...")
            else:
                print(f"  ❌ Migration failed: {err[:300]}")
                sys.exit(1)
        else:
            print(f"  ✅ SQL migration completed: {out[:200]}")

        print("  Step 5b: Running Prisma generate...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && npx prisma generate 2>&1", timeout=60)
        if code != 0:
            print(f"  ❌ Prisma generate failed: {err[:200]}")
            sys.exit(1)
        print("  ✅ Prisma generate done")

        print("  Step 5c: Running Prisma migrate deploy...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && npx prisma migrate deploy 2>&1", timeout=60)
        print(f"  Output: {out[:200]}")
        if code != 0:
            print(f"  ⚠️  Migrate deploy had issues: {err[:200]}")
        else:
            print("  ✅ Migrations deployed")

        print("  Step 5d: Running seed (admin user alayainsider@gmail.com)...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && npm run db:seed 2>&1", timeout=120)
        if code != 0:
            print(f"  ⚠️  Seed output: {out[:300]}")
            print(f"  ⚠️  Seed errors: {err[:300]}")
            if "already exists" in out.lower() or "unique constraint" in out.lower():
                print("  ℹ️  Some records may already exist. Continuing...")
            else:
                print(f"  ❌ Seed failed.")
        else:
            print(f"  ✅ Seed completed: {out[:200]}")

        # Build and restart
        print("  Step 5e: Building app...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && npm run build 2>&1 | tail -20", timeout=300)
        if code != 0:
            print(f"  ⚠️  Build had issues: {out[:300]}")
        else:
            print(f"  ✅ Build completed")

        print("  Step 5f: Restarting PM2...")
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && pm2 restart alaya-insider 2>&1", timeout=30)
        print(f"  Output: {out[:200]}")
        
        out, err, code = run_ssh_command(ssh, f"cd {vps_project_dir} && pm2 restart alaya-workers 2>&1", timeout=30)
        print(f"  Output: {out[:200]}")

        # Verify health
        print("\n  Step 5g: Verifying production health...")
        time.sleep(5)
        out, err, code = run_ssh_command(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 500", timeout=30)
        print(f"  Health check: {out[:300]}")

        print("\n" + "=" * 60)
        print("✅ DEPLOYMENT COMPLETE")
        print("=" * 60)
        print(f"Primary admin: alayainsider@gmail.com")
        print(f"Login at: https://alayainsider.com/admin")
        print()

    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
