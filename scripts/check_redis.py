#!/usr/bin/env python3
"""Check REDIS_URL in .env on the VPS."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Check REDIS_URL in .env
c = ssh.get_transport().open_session()
c.exec_command("grep REDIS_URL " + DIR + "/.env 2>/dev/null || echo 'NOT_FOUND'")
out = c.recv(4096).decode().strip()
print("REDIS_URL: " + out[:100])

# Also check if Redis is running locally
c = ssh.get_transport().open_session()
c.exec_command("redis-cli ping 2>/dev/null || systemctl status redis 2>/dev/null || ps aux | grep redis | grep -v grep || echo 'REDIS_NOT_RUNNING'")
out2 = c.recv(4096).decode().strip()
print("Local Redis: " + out2[:200])

# Check if redis is installed
c = ssh.get_transport().open_session()
c.exec_command("which redis-server 2>/dev/null && redis-server --version || dpkg -l | grep redis 2>/dev/null || echo 'NOT_INSTALLED'")
out3 = c.recv(4096).decode().strip()
print("Redis installed: " + out3[:200])

# Check node_modules for Upstash
c = ssh.get_transport().open_session()
c.exec_command("ls " + DIR + "/node_modules/@upstash/redis/package.json 2>/dev/null && echo 'UPSTASH_INSTALLED' || ls " + DIR + "/node_modules/ioredis/package.json 2>/dev/null && echo 'IOREDIS_INSTALLED' || echo 'NEITHER'")
out4 = c.recv(4096).decode().strip()
print("Redis modules: " + out4)

ssh.close()
