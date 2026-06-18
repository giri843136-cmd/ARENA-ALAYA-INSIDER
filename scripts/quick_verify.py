#!/usr/bin/env python3
"""Quick verify Redis and app health."""
import paramiko
import sys
import os

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)

    # Check Redis process
    stdin, stdout, stderr = ssh.exec_command("ps aux | grep redis-server | grep -v grep | head -3")
    print(f"REDIS_PROC: {stdout.read().decode().strip()}")

    # Check app process
    stdin, stdout, stderr = ssh.exec_command("ps aux | grep 'next-server' | grep -v grep | head -3")
    print(f"APP_PROC: {stdout.read().decode().strip()}")

    # Redis PING via node
    cmd = 'node -e "var c=require(\"net\").connect(6379,\"127.0.0.1\");c.on(\"connect\",function(){c.write(\"*1\\\\r\\\\n$4\\\\r\\\\nPING\\\\r\\\\n\")});c.on(\"data\",function(d){process.stdout.write(\"PONG:\"+d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on(\"error\",function(e){process.stdout.write(\"ERR:\"+e.message);process.exit(1)});" 2>&1'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(f"PING: {stdout.read().decode().strip()}")

    # Health check
    stdin, stdout, stderr = ssh.exec_command("curl -s --connect-timeout 5 http://localhost:3000/api/ops/health 2>&1 | head -c 500")
    print(f"HEALTH: {stdout.read().decode().strip()}")

    # Redis log tail
    stdin, stdout, stderr = ssh.exec_command("tail -5 /home/u131951911/redis-data/redis.log 2>/dev/null || echo 'NO_LOG'")
    print(f"LOG: {stdout.read().decode().strip()}")

    # ss listening ports
    stdin, stdout, stderr = ssh.exec_command("ss -tlnp 2>/dev/null | grep 6379 || echo 'PORT_6379_NOT_LISTENING'")
    print(f"PORT: {stdout.read().decode().strip()}")

    ssh.close()
except Exception as ex:
    print(f"ERROR: {ex}")
