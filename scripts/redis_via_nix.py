#!/usr/bin/env python3
"""Install Nix single-user to get a working Redis binary."""
import paramiko
import sys
import os
import time
import base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    o = stdout.read().decode().strip()
    e = stderr.read().decode().strip()
    return o, e, ec

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("SSH_CONNECTED\n")

    # Kill old Redis
    run("pkill -9 -f 'redis-server' 2>/dev/null; sleep 1")

    # Clear old log
    run("rm -f /home/u131951911/redis-data/redis.log")

    # Check for existing Nix installation
    print("=== CHECK NIX ===")
    o, e, _ = run("which nix-env nix nix-store 2>&1; ls -la /home/u131951911/.nix-profile 2>&1")
    print(o)

    # Try installing nix single-user (non-interactive)
    print("\n=== INSTALL NIX ===")
    # Nix has a single-user install mode for Linux
    o, e, _ = run("""cd /home/u131951911 && 
curl -sL https://nixos.org/nix/install 2>&1 | sh > /tmp/nix-install.log 2>&1 &
echo "NIX_INSTALL_STARTED_PID=$!"
""")
    print(o)

    # Wait for nix install to complete (it might prompt or take a while)
    time.sleep(30)
    
    # Check install result
    o, e, _ = run("tail -20 /tmp/nix-install.log 2>/dev/null | head -20")
    print(f"NIX_LOG:\n{o}")

    # Check if .nix-profile exists
    o, e, _ = run("ls -la /home/u131951911/.nix-profile/bin/ 2>&1 | head -20")
    print(f"NIX_BIN:\n{o}")

    # Try to install Redis via Nix
    o, e, _ = run("""export PATH=/home/u131951911/.nix-profile/bin:$PATH
which nix-env 2>&1 && {
  echo "NIX_AVAILABLE"
  nix-env -iA nixpkgs.redis 2>&1 | tail -10
  echo "---"
  which redis-server 2>&1
  redis-server --version 2>&1
} || echo "NIX_NOT_AVAILABLE"
""")
    print(f"INSTALL_REDIS:\n{o}")

    # If Nix install failed or timed out, try the simplest approach:
    # Use the binary from the deb (which WAS extracted but may be crashing)
    print("\n=== TRY ALTERNATIVE ===")
    # Check the deb-extracted binary
    o, e, _ = run("file /home/u131951911/redis-server 2>&1; ldd /home/u131951911/redis-server 2>&1 | head -5")
    print(f"BINARY_INFO:\n{o}")

    # Try starting with strace to see why it fails (if strace is available)
    o, e, _ = run("which strace 2>&1 || echo 'NO_STRACE'")
    print(o)

    # Try running Redis in foreground briefly to see the error
    o, e, _ = run("""timeout 5 /home/u131951911/redis-server /tmp/redis.conf 2>&1 || echo 'EXIT_CODE:'$?
echo '==='
tail -10 /home/u131951911/redis-data/redis.log 2>/dev/null || echo 'NO_LOG'
""")
    print(f"FOREGROUND_TEST:\n{o}")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERROR: {ex}")
