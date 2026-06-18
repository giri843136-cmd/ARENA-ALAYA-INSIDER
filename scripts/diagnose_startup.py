#!/usr/bin/env python3
"""Diagnose why the app won't start."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Check startup logs
out, _, _ = run(ssh, f"cat /tmp/alaya-start.log 2>/dev/null | tail -30")
print(f"--- Start log ---\n{out[:500]}")
out, _, _ = run(ssh, f"cat /tmp/alaya-out.log 2>/dev/null | tail -30")
print(f"--- Out log ---\n{out[:500]}")
out, _, _ = run(ssh, f"cat /tmp/alaya-restart.log 2>/dev/null | tail -10")
print(f"--- Restart log ---\n{out[:200]}")

# Check node_modules
out, _, _ = run(ssh, f"ls {DIR}/node_modules/next/dist/bin/next 2>/dev/null && echo 'NEXT_BIN_OK'")
print(f"next bin: {out.strip()[:100]}")
out, _, _ = run(ssh, f"ls {DIR}/node_modules/.bin/next 2>/dev/null || ls {DIR}/node_modules/next 2>/dev/null | head -5")
print(f"next: {out.strip()[:100]}")
out, _, _ = run(ssh, f"node -e \"require('{DIR}/node_modules/next/package.json').version\" 2>/dev/null && echo 'VERSION_OK'" )
print(f"next version check: {out.strip()[:100]}")

# Try direct start with error output
EXP = "export PATH=/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && node node_modules/.bin/next start 2>&1 | head -20")
print(f"\n--- Direct start ---\n{out[:500] if out.strip() else '(no output)'}")

# Check if next-server binary exists
out, _, _ = run(ssh, f"ls -la {DIR}/node_modules/.bin/next 2>/dev/null")
print(f"\nnext binary: {out.strip()[:200]}")

# Check Node compatibility
out, _, _ = run(ssh, f"{EXP} && node -e \"console.log(process.version, process.arch, process.platform)\"")
print(f"Node info: {out.strip()}")
out, _, _ = run(ssh, f"ls {DIR}/.next/standalone 2>/dev/null | head -5")
print(f"Standalone: {out.strip()[:100] or 'not found'}")

# Check if BUILD_ID exists
out, _, _ = run(ssh, f"cat {DIR}/.next/BUILD_ID 2>/dev/null || echo 'NO_BUILD_ID'")
print(f"BUILD_ID: {out.strip()[:50]}")

# Try running in foreground to see error
out, _, _ = run(ssh, f"cd {DIR} && {EXP} && timeout 15 node -e \"try{require('./.next/required-server-files.json')}catch(e){console.log('ERR:'+e.message)}\" 2>&1")
print(f"Server files check: {out.strip()[:200]}")

ssh.close()
