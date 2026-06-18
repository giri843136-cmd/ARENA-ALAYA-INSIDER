#!/usr/bin/env python3
"""Diagnose VPS issues - env vars, DB connectivity, build errors."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("Connected")

# Check .env contents (sanitized)
out, _, _ = run(ssh, f"grep -v 'PASSWORD\\|SECRET\\|KEY' {DIR}/.env 2>/dev/null | head -30 || echo 'NO_ENV'")
print(f"--- .env (public vars) ---\n{out}")

# Check if DATABASE_URL is set and try a connection
out, _, _ = run(ssh, f"grep DATABASE_URL {DIR}/.env 2>/dev/null | head -1 || echo 'NO_DB_URL'")
print(f"\n--- DB URL ---\n{out.strip()[:100]}...")

# Try psql connection
out, _, _ = run(ssh, f"cd {DIR} && source .env 2>/dev/null; psql \"$DATABASE_URL\" -c 'SELECT 1' 2>&1 | head -5")
print(f"\n--- psql test ---\n{out[:300]}")

# Check build log
out, _, _ = run(ssh, f"ls {DIR}/.next/build-manifest.json 2>/dev/null && echo 'PREV_BUILD_EXISTS' || echo 'NO_PREV_BUILD'")
print(f"\n--- Build state ---\n{out.strip()}")

# Check running processes
out, _, _ = run(ssh, "ps aux | grep -E 'next|node' | grep -v grep | head -10")
print(f"\n--- Running processes ---\n{out[:500] if out.strip() else '(none)'}")

# Check previous build errors
out, _, _ = run(ssh, f"ls {DIR}/.next 2>/dev/null | head -5")
print(f"\n--- .next directory ---\n{out[:200] if out.strip() else '(empty)'}")

# Check package.json node engine requirement
out, _, _ = run(ssh, f"grep -A2 '\"engines\"' {DIR}/package.json 2>/dev/null || echo 'NO_ENGINES'")
print(f"\n--- Package engines ---\n{out[:200]}")

# Check available node versions
out, _, _ = run(ssh, "ls $HOME/.nvm/versions/node/ 2>/dev/null || echo 'NO_NVM_VERSIONS'")
print(f"\n--- NVM versions ---\n{out[:200]}")

ssh.close()
