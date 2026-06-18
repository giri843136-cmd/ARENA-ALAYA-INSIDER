#!/usr/bin/env python3
"""Download and set up Redis on the VPS using a static binary."""
import paramiko
import sys
import os
import base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

if not VPS_PASSWORD:
    print("ERROR: Set VPS_PASSWORD env var")
    sys.exit(1)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("SSH_CONNECTED")

    commands = {
        "DOWNLOAD_TOOLS": "which wget curl 2>&1; echo '---'; which python3 python 2>&1",
        "DOCKER": "which docker 2>&1; echo '---'; docker --version 2>&1 | head -1",
        "NIX": "which nix-env 2>&1",
        "STATIC_CHECK": "ls /home/u131951911/redis* 2>/dev/null; ls /tmp/redis* 2>/dev/null; echo 'DONE'",
        "NPM_GLOBAL": "ls /home/u131951911/.nvm/versions/node/v22.22.3/lib/node_modules/ 2>/dev/null | head -10",
    }

    for name, cmd in commands.items():
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_code = stdout.channel.recv_exit_status()
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f"=== {name} ===")
        if out:
            print(out)
        if err:
            print(f"STDERR: {err}")
        print()

    # Step 2: Download and set up Redis static binary
    print("=== DOWNLOADING REDIS ===")
    # Use curl to download Redis source, or better, use a prebuilt static binary
    dl_cmd = (
        'cd /home/u131951911 && '
        'curl -sL -o /home/u131951911/redis-stable.tar.gz https://download.redis.io/redis-stable.tar.gz 2>&1 && '
        'echo "DOWNLOAD_OK $(ls -lh redis-stable.tar.gz 2>&1)" || echo "DOWNLOAD_FAILED"'
    )
    stdin, stdout, stderr = ssh.exec_command(dl_cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    print(out)

    # Step 3: Check if downloaded
    stdin, stdout, stderr = ssh.exec_command('ls -lh /home/u131951911/redis-stable.tar.gz 2>&1')
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    print(f"FILE_CHECK: {out}")

    # Step 4: Extract and try to make (even without gcc, let's check what's in there)
    extract_cmd = (
        'cd /home/u131951911 && '
        'tar xzf redis-stable.tar.gz 2>&1 && '
        'echo "EXTRACT_OK" || echo "EXTRACT_FAILED"'
    )
    stdin, stdout, stderr = ssh.exec_command(extract_cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    print(f"EXTRACT: {out}")

    # Step 5: Check contents
    stdin, stdout, stderr = ssh.exec_command('ls /home/u131951911/redis-stable/src/redis-server 2>&1; ls /home/u131951911/redis-stable/ 2>&1 | head -20')
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    print(f"CONTENTS: {out}")

    ssh.close()
    print("ALL_DONE")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
