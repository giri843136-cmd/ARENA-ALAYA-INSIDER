#!/usr/bin/env python3
"""Verify Redis status and app health check."""
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
    print("SSH_CONNECTED\n")

    # Check Redis is running
    stdin, stdout, stderr = ssh.exec_command("ps aux | grep redis-server | grep -v grep | head -5")
    print("=== REDIS PROCESS ===")
    print(stdout.read().decode().strip())

    # Redis PING
    stdin, stdout, stderr = ssh.exec_command("/home/u131951911/redis-cli -p 6379 ping 2>&1 || node -e \"const c=require('net').connect(6379,'127.0.0.1',()=>{c.write('*1\\r\\n\$4\\r\\nPING\\r\\n');c.on('data',d=>process.stdout.write(d.toString()));c.on('end',()=>process.exit(0))});c.setTimeout(3000);c.on('error',e=>{console.log('ERR:'+e.message);process.exit(1)})\"")
    print("=== REDIS PING ===")
    print(stdout.read().decode().strip())

    # Health check
    stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 500")
    print("=== HEALTH CHECK ===")
    health = stdout.read().decode().strip()
    print(health)

    # .env REDIS_URL
    stdin, stdout, stderr = ssh.exec_command("grep REDIS_URL /home/u131951911/alaya-insider/.env")
    print("\n=== .ENV REDIS_URL ===")
    print(stdout.read().decode().strip())

    ssh.close()
    print("\nVERIFICATION_COMPLETE")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
