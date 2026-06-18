#!/usr/bin/env python3
"""Start Redis properly using screen for persistence, then restart app."""
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

    # Check what's available
    print("=== CHECK TOOLS ===")
    o, e, _ = run("which screen tmux nohup setsid 2>&1; echo '---'; screen --version 2>&1")
    print(o)

    # Kill old Redis
    run("pkill -9 -f 'redis-server' 2>/dev/null; sleep 1")
    run("screen -X -S redis quit 2>/dev/null || true")

    # Clear log
    run("rm -f /home/u131951911/redis-data/redis.log")
    run("mkdir -p /home/u131951911/redis-data")

    # Write clean conf via base64
    conf = """port 6379
bind 127.0.0.1
daemonize no
pidfile /home/u131951911/redis-data/redis.pid
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
save ""
appendonly no
loglevel notice
"""
    conf_b64 = base64.b64encode(conf.encode()).decode()
    run(f"echo '{conf_b64}' | base64 -d > /tmp/redis.conf && echo 'CONF_OK'")

    # Start Redis in a screen session
    print("\n=== START REDIS IN SCREEN ===")
    o, e, _ = run("""
screen -dmS redis bash -c '/home/u131951911/redis-server /tmp/redis.conf 2>&1; echo "REDIS_EXITED:$?"'
echo "SCREEN_STARTED"
sleep 3
""")
    print(o)

    # Check if Redis is running
    o, e, _ = run("ps aux | grep redis-server | grep -v grep | head -5")
    print(f"PROCESS:\n{o}")

    # Check port
    o, e, _ = run("ss -tln 2>/dev/null | grep 6379 || netstat -tln 2>/dev/null | grep 6379 || echo 'PORT_NOT_OPEN'")
    print(f"PORT:\n{o}")

    # Try PING
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1');c.on('connect',function(){c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log('PONG:'+d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on('error',function(e){console.log('ERR:'+e.message);process.exit(1)});" 2>&1""")
    print(f"PING:\n{o}")

    # Check Redis log
    o, e, _ = run("cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -10")
    print(f"LOG:\n{o}")

    # If Redis is working via screen, try redis-cli
    o, e, _ = run("/home/u131951911/redis-cli -p 6379 ping 2>&1 || echo 'NO_CLI'")
    print(f"CLI:\n{o}")

    # Start the app if Redis is working
    print("\n=== START APP ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)"
export REDIS_URL="redis://127.0.0.1:6379"
nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
echo "APP_STARTED"
sleep 10
""")
    print(o)

    # Health check
    print("\n=== HEALTH CHECK ===")
    for i in range(3):
        o, e, _ = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"HEALTH_{i+1}: {o}")
        if '"redis":"ok"' in o:
            print("*** REDIS_OK ***")
            break
        time.sleep(3)

    # App log
    o, e, _ = run("tail -15 /tmp/alaya-app.log 2>/dev/null")
    print(f"APP_LOG:\n{o}")

    # Final process check
    o, e, _ = run("ps aux | grep -E 'redis-server|next-server' | grep -v grep")
    print(f"FINAL_PROCESSES:\n{o}")

    # Create persistent Redis startup script
    startup = """#!/bin/bash
export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
mkdir -p /home/u131951911/redis-data
if ! ss -tln 2>/dev/null | grep -q 6379; then
  screen -dmS redis bash -c '/home/u131951911/redis-server /tmp/redis.conf 2>&1'
  echo "Redis started at $(date)" >> /home/u131951911/redis-data/restart.log
fi
"""
    startup_b64 = base64.b64encode(startup.encode()).decode()
    run(f"echo '{startup_b64}' | base64 -d > /home/u131951911/start-redis.sh && chmod +x /home/u131951911/start-redis.sh")
    
    # Add to bashrc
    run("""grep -q 'start-redis' /home/u131951911/.bashrc 2>/dev/null || {
  echo '
# Start Redis if not running
if ! ss -tln 2>/dev/null | grep -q 6379; then
  if [ -f /home/u131951911/start-redis.sh ]; then
    bash /home/u131951911/start-redis.sh
  fi
fi
' >> /home/u131951911/.bashrc
  echo "BASHRC_UPDATED"
} || echo "BASHRC_ALREADY_HAS_REDIS"
""")

    # Also try to add to crontab (if available)
    o, e, _ = run("""(crontab -l 2>/dev/null | grep -q start-redis) || {
  (crontab -l 2>/dev/null; echo '* * * * * /home/u131951911/start-redis.sh > /dev/null 2>&1') | crontab - 2>/dev/null && echo 'CRON_ADDED' || echo 'CRON_FAILED'
} || echo 'CRON_EXISTS'
""")
    print(f"CRON:\n{o}")

    ssh.close()
    print("\nALL_DONE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
