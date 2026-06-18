#!/usr/bin/env python3
"""Restart Redis with nohup for persistence + download redis-cli + health check."""
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

    # Step 1: Kill existing Redis
    print("=== STEP 1: Kill stale Redis ===")
    out, err, _ = run("pkill -f 'redis-server' 2>/dev/null; echo 'KILLED'; sleep 1")
    print(out)

    # Step 2: Start Redis with nohup
    print("=== STEP 2: Start Redis with nohup ===")
    # Using a single command chain with nohup
    out, err, _ = run("""
cd /home/u131951911
cat > /tmp/redis-start.sh << 'SCRIPTEOF'
#!/bin/bash
mkdir -p /home/u131951911/redis-data
cat > /tmp/redis.conf << 'CONFEOF'
port 6379
bind 127.0.0.1
daemonize no
save ""
appendonly no
loglevel notice
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
CONFEOF
/home/u131951911/redis-server /tmp/redis.conf >> /home/u131951911/redis-data/redis.log 2>&1
SCRIPTEOF
chmod +x /tmp/redis-start.sh
nohup /tmp/redis-start.sh > /dev/null 2>&1 &
echo "REDIS_LAUNCHED"
sleep 2
""")
    print(out)
    if err: print(f"ERR: {err}")

    # Step 3: Check if Redis is running
    print("=== STEP 3: Check Redis process ===")
    out, err, _ = run("ps aux | grep redis-server | grep -v grep | head -5")
    print(out)

    # Step 4: Test Redis via Node.js (since redis-cli may not exist)
    print("=== STEP 4: Redis PING ===")
    out, err, _ = run("""
node -e "
const c=require('net').connect(6379,'127.0.0.1',()=>{
  c.write('*1\\r\\n\$4\\r\\nPING\\r\\n');
  c.on('data',d=>{process.stdout.write('PONG_RESPONSE: '+d.toString().trim());process.exit(0)});
  c.on('end',()=>{console.log('CONN_CLOSED');process.exit(1)});
  c.setTimeout(3000,()=>{console.log('TIMEOUT');process.exit(1)});
});
c.on('error',e=>{console.log('CONN_ERR:'+e.message);process.exit(1)});
" 2>&1
""")
    print(out)
    if err: print(f"ERR: {err}")

    # Step 5: Download redis-cli
    print("=== STEP 5: Download redis-cli ===")
    out, err, _ = run("""
wget -q --timeout=15 "https://github.com/phlummox-dev/redis-static-binaries/releases/download/6.2.5.0/redis-cli" -O /home/u131951911/redis-cli 2>&1
chmod +x /home/u131951911/redis-cli
ls -lh /home/u131951911/redis-cli
/home/u131951911/redis-cli -p 6379 ping 2>&1
""")
    print(out)
    if err: print(f"ERR: {err}")

    # Step 6: Health check
    print("=== STEP 6: App Health Check ===")
    out, err, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 500")
    print(out)

    # Step 7: Create a startup script for Redis persistence across reboots
    print("=== STEP 7: Create persistent Redis startup ===")
    out, err, _ = run("""
# Add Redis startup to .bashrc for persistence
grep -q 'redis-start' /home/u131951911/.bashrc 2>/dev/null || {
  echo '
# Start Redis if not running
if ! pgrep -f "redis-server" > /dev/null; then
  nohup /tmp/redis-start.sh > /dev/null 2>&1 &
fi
' >> /home/u131951911/.bashrc
  echo "ADDED_TO_BASHRC"
}
# Also create a crontab entry to keep Redis alive
(crontab -l 2>/dev/null | grep -q redis-start) || {
  (crontab -l 2>/dev/null; echo '* * * * * pgrep -f redis-server > /dev/null || /tmp/redis-start.sh') | crontab - 2>&1
  echo "ADDED_CRON"
}
""")
    print(out)
    if err: print(f"ERR: {err}")

    # Step 8: Logs
    print("=== STEP 8: Redis logs ===")
    out, err, _ = run("tail -10 /home/u131951911/redis-data/redis.log 2>/dev/null || echo 'NO_LOG'")
    print(out)

    ssh.close()
    print("\nREDIS_SETUP_COMPLETE")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
