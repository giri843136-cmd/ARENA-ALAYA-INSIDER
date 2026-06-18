#!/usr/bin/env python3
"""Check Redis logs, kill and restart both services properly, verify everything."""
import paramiko
import sys
import os
import time

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    o = stdout.read().decode().strip()
    e = stderr.read().decode().strip()
    return o, e, ec

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("=== CHECK REDIS LOGS ===")
    o, e, _ = run("cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -20 || echo 'LOG_NOT_FOUND'")
    print(o)

    print("\n=== KILL EVERYTHING ===")
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; sleep 2")
    print("KILLED")

    print("\n=== START REDIS ===")
    # Write clean config
    conf_b64 = "cG9ydCA2Mzc5CmJpbmQgMTI3LjAuMC4xCmRhZW1vbml6ZSB5ZXMKcGlkZmlsZSAvaG9tZS91MTMxOTUxOTExL3JlZGlzLWRhdGEvcmVkaXMucGlkCmxvZ2ZpbGUgL2hvbWUvdTEzMTk1MTkxMS9yZWRpcy1kYXRhL3JlZGlzLmxvZw==\n"
    # Actually let me just write it out directly
    run("mkdir -p /home/u131951911/redis-data")
    o, e, _ = run("""cat > /tmp/redis.conf << 'ENDOFCONF'
port 6379
bind 127.0.0.1
daemonize yes
pidfile /home/u131951911/redis-data/redis.pid
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
save ""
appendonly no
loglevel notice
ENDOFCONF
echo "CONF_OK"
""")
    print(f"CONF: {o}")

    # Start Redis
    o, e, _ = run("/home/u131951911/redis-server /tmp/redis.conf 2>&1")
    print(f"START: {o}")
    time.sleep(3)

    # Check process
    o, e, _ = run("ps aux | grep redis-server | grep -v grep")
    print(f"PROCESS: {o}")

    # Check port
    o, e, _ = run("ss -tlnp 2>/dev/null | grep 6379; echo '---'; cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -5")
    print(f"PORT+LOG: {o}")

    print("\n=== START APP ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=\"$(grep DATABASE_URL .env | cut -d= -f2-)\"
export REDIS_URL=\"$(grep REDIS_URL .env | cut -d= -f2-)\"
nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
echo "LAUNCHED"
sleep 5
ps aux | grep 'next-server' | grep -v grep | head -3
""")
    print(f"APP: {o}")

    print("\n=== FINAL HEALTH CHECK ===")
    o, e, _ = run("""curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1 | head -c 800""")
    print(f"HEALTH: {o}")

    # Also check app log
    o, e, _ = run("tail -10 /tmp/alaya-app.log 2>/dev/null | head -10")
    print(f"APP_LOG: {o}")

    ssh.close()
    print("\nCOMPLETE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
