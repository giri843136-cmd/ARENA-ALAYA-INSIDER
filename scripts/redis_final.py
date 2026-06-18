#!/usr/bin/env python3
"""Final Redis setup - daemonize properly and verify."""
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

def run(cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err, exit_code

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("SSH_CONNECTED\n")

    # Kill any existing Redis first
    run("pkill -9 -f 'redis-server' 2>/dev/null; sleep 1")

    # Write redis.conf with daemonize yes
    conf = """port 6379
bind 127.0.0.1
daemonize yes
pidfile /home/u131951911/redis-data/redis.pid
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
save ""
appendonly no
loglevel notice
"""
    # Write the conf file via base64 to avoid escaping issues
    import base64
    conf_b64 = base64.b64encode(conf.encode()).decode()
    
    cmd = f"echo '{conf_b64}' | base64 -d > /tmp/redis.conf && mkdir -p /home/u131951911/redis-data && echo 'CONF_WRITTEN'"
    out, err, _ = run(cmd)
    print(f"CONF: {out}")

    # Start Redis with daemonize yes
    out, err, _ = run("/home/u131951911/redis-server /tmp/redis.conf 2>&1; echo 'EXIT:'$?")
    print(f"START: {out}")
    if err: print(f"ERR: {err}")

    # Wait a moment
    import time
    time.sleep(2)

    # Check process
    out, err, _ = run("ps aux | grep redis-server | grep -v grep | head -5")
    print(f"PROCESS: {out}")

    # PING using Node v22 full path
    out, err, _ = run("""
/home/u131951911/.nvm/versions/node/v22.22.3/bin/node -e "
const c=require('net').connect(6379,'127.0.0.1',()=>{
  c.write('*1\\r\\n\$4\\r\\nPING\\r\\n');
  c.on('data',d=>{process.stdout.write(d.toString().trim());process.exit(0)});
  c.setTimeout(3000,()=>{console.log('TIMEOUT');process.exit(1)});
});
c.on('error',e=>{console.log('ERR:'+e.message);process.exit(1)});
" 2>&1
""")
    print(f"PING: {out}")

    # Health check
    out, err, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 500")
    print(f"HEALTH: {out}")

    # Verify REDIS_URL in .env
    out, err, _ = run("grep REDIS_URL /home/u131951911/alaya-insider/.env")
    print(f"ENV: {out}")

    # Create a permanent startup script
    startup_script = """#!/bin/bash
# Redis startup for Alaya Insider
export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
mkdir -p /home/u131951911/redis-data
if ! pgrep -f "redis-server.*redis" > /dev/null 2>&1; then
  /home/u131951911/redis-server /tmp/redis.conf > /dev/null 2>&1
  echo "Redis started at $(date)" >> /home/u131951911/redis-data/restart.log
fi
"""
    startup_b64 = base64.b64encode(startup_script.encode()).decode()
    cmd = f"echo '{startup_b64}' | base64 -d > /home/u131951911/redis-start.sh && chmod +x /home/u131951911/redis-start.sh && echo 'SCRIPT_OK'"
    out, err, _ = run(cmd)
    print(f"SCRIPT: {out}")

    # Check Redis log
    out, err, _ = run("tail -10 /home/u131951911/redis-data/redis.log 2>/dev/null || echo 'NO_LOG'")
    print(f"LOG: {out}")

    ssh.close()
    print("\nREDIS_FINAL_DONE")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
