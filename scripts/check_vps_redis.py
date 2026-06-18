#!/usr/bin/env python3
"""Check VPS for Redis availability, build tools, and what's needed."""
import paramiko
import sys
import os

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
        "REDIS_BINARY": "which redis-server 2>&1; echo '---'; ls -la /usr/bin/redis-server /usr/local/bin/redis-server 2>&1",
        "COMPILERS": "which gcc make 2>&1; echo '---'; gcc --version 2>&1 | head -1",
        "PACKAGE_MGR": "which apt-get apt yum dnf 2>&1; echo '---'; dpkg -l 2>/dev/null | head -3",
        "RUNNING": "ps aux | grep -i redis 2>&1 | grep -v grep | head -5",
        "PORTS": "ss -tlnp 2>/dev/null | grep -E '6379|6380' || netstat -tlnp 2>/dev/null | grep -E '6379|6380' || echo 'NO_REDIS_PORT'",
        "DISK": "df -h / 2>&1 | tail -1",
        "RAM": "free -m 2>&1 | head -3",
        "UNAME": "uname -m 2>&1",
        "LSB": "cat /etc/os-release 2>&1 | head -5",
        "NODE_VER": "/home/u131951911/.nvm/versions/node/v22.22.3/bin/node --version 2>&1",
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

    ssh.close()
    print("ALL_CHECKS_COMPLETE")

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
