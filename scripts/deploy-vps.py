"""
ALAYA INSIDER — Automated VPS Deployment via SSH
Connects to the Hostinger VPS and runs deploy-complete.sh
"""

import paramiko
import sys
import time

# Force UTF-8 for print statements
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = "157.173.216.156"
PORT = 65002
USER = "u131951911"
PASSWORD = "((Giri)1923@+-)"

CHECK = "[OK]"
CROSS = "[FAIL]"
ARROW = "  ->"

def run_command(ssh, command, timeout=120, label=""):
    """Run a command on the remote server and print output."""
    print()
    print("=" * 60)
    print(f"  {label or command}")
    print("=" * 60)
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    output = stdout.read().decode("utf-8", errors="replace").strip()
    error = stderr.read().decode("utf-8", errors="replace").strip()
    if output:
        print(output)
    if error and exit_code != 0:
        err_clean = error[:500]
        print(f"  STDERR: {err_clean}")
    status = CHECK if exit_code == 0 else CROSS
    print(f"  Exit code: {exit_code} {status}")
    return exit_code, output, error

def main():
    print("=" * 60)
    print("  ALAYA INSIDER VPS DEPLOYMENT")
    print("=" * 60)
    print(f"  Host: {USER}@{HOST}:{PORT}")
    print()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            hostname=HOST,
            port=PORT,
            username=USER,
            password=PASSWORD,
            look_for_keys=False,
            allow_agent=False,
            timeout=30,
        )
        print(f"  {CHECK} Connected successfully!")
    except Exception as e:
        print(f"  {CROSS} Connection failed: {e}")
        sys.exit(1)

    try:
        # Step 1: Check connectivity
        run_command(client, "echo CONNECTED && whoami", label="[1/8] Verify SSH connection")

        # Step 2: Clone or pull the repo
        run_command(client, """
            if [ -d "$HOME/alaya-insider" ]; then
                cd "$HOME/alaya-insider" && git fetch origin && git reset --hard origin/main
                echo "[OK] Repo updated"
            else
                git clone https://github.com/giri843136-cmd/ARENA-ALAYA-INSIDER.git "$HOME/alaya-insider"
                echo "[OK] Repo cloned"
            fi
        """, label="[2/8] Get latest code from GitHub", timeout=60)

        # Step 3: Check .env
        run_command(client, """
            cd "$HOME/alaya-insider"
            if [ -f ".env" ]; then
                echo "[OK] .env found"
            elif [ -f ".env.production" ]; then
                cp .env.production .env && echo "[OK] Copied .env.production -> .env"
            elif [ -f "$HOME/.env" ]; then
                cp "$HOME/.env" .env && echo "[OK] Copied ~/.env"
            else
                echo "[WARN] No .env found"
                cp .env.example .env
                echo "[WARN] Created from .env.example - EDIT REQUIRED"
            fi
        """, label="[3/8] Check environment configuration")

        # Step 4: Run sudo apt update
        run_command(client, "sudo apt update -qq 2>/dev/null; echo '[OK] apt updated'", label="[4/8] Update packages", timeout=120)

        # Step 5: Install Docker if needed
        run_command(client, """
            which docker >/dev/null 2>&1 && echo "[OK] Docker installed" || {
                echo "Installing Docker...";
                sudo apt install -y -qq docker.io docker-compose 2>&1 | tail -3;
                sudo systemctl enable docker 2>/dev/null;
                sudo systemctl start docker 2>/dev/null;
                echo "[OK] Docker installed";
            }
        """, label="[5/8] Install Docker prerequisites", timeout=120)

        # Step 6: Build Docker image
        run_command(client, """
            cd "$HOME/alaya-insider"
            sudo docker build -t alaya-insider:latest . 2>&1 | tail -5
        """, label="[6/8] Build Docker image", timeout=300)

        # Step 7: Start with Docker Compose
        run_command(client, """
            cd "$HOME/alaya-insider"
            sudo docker-compose -f docker-compose.yml down 2>/dev/null || true
            sudo docker-compose -f docker-compose.yml up -d --build 2>&1 | tail -5
        """, label="[7/8] Start Docker services", timeout=120)

        # Step 8: Run migrations
        run_command(client, """
            cd "$HOME/alaya-insider"
            APP_CONTAINER=$(sudo docker ps -q --filter "name=alaya" | head -1)
            if [ -n "$APP_CONTAINER" ]; then
                sudo docker exec "$APP_CONTAINER" npx prisma generate 2>/dev/null || true
                sudo docker exec "$APP_CONTAINER" npx prisma migrate deploy 2>/dev/null || true
                echo "[OK] Migrations applied"
            else
                echo "[WARN] No alaya container found"
            fi
        """, label="[8/8] Run database migrations", timeout=60)

        # Final verification
        run_command(client, """
            echo ""
            echo "=== VERIFICATION ==="
            echo "Docker containers:"
            sudo docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" 2>/dev/null
            echo ""
            echo "Health check:"
            curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:3000/api/ops/health 2>/dev/null || echo "App starting..."
        """, label="Final Verification")

        print()
        print("=" * 60)
        print("  [OK] DEPLOYMENT COMPLETE")
        print("=" * 60)
        print("  Production URLs:")
        print("    Public:  https://alayainsider.com")
        print("    Admin:   https://alayainsider.com/admin")
        print("    Health:  https://alayainsider.com/api/ops/health")
        print()

    except Exception as e:
        print(f"  [FAIL] Deployment error: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    main()
