#!/usr/bin/env python3
"""Fix Redis for real - diagnose the crash and start properly."""
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

    # Check current state
    print("=== CURRENT STATE ===")
    o, e, _ = run("ps aux | grep -E 'redis|next-server' | grep -v grep | head -10")
    print(o)
    
    o, e, _ = run("ss -tlnp 2>/dev/null | head -20 || netstat -tlnp 2>/dev/null | head -20")
    print(f"PORTS:\n{o}")

    o, e, _ = run("cat /home/u131951911/redis-data/redis.log 2>/dev/null || echo 'NO_LOG'")
    print(f"LOG:\n{o}")

    # Kill everything
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; sleep 2")
    print("\nKILLED ALL")

    # Start Redis WITHOUT daemonize - use nohup + setsid
    print("\n=== START REDIS (no daemonize) ===")
    run("mkdir -p /home/u131951911/redis-data")
    
    # Write conf
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
    # Use python to write the file to avoid shell escaping issues
    import base64
    conf_b64 = base64.b64encode(conf.encode()).decode()
    
    o, e, _ = run(f"echo '{conf_b64}' | base64 -d > /tmp/redis.conf && echo 'CONF_WRITTEN'")
    print(o)

    # Start Redis with nohup AND setsid to properly detach
    o, e, _ = run("nohup setsid /home/u131951911/redis-server /tmp/redis.conf > /tmp/redis-startup.log 2>&1 &")
    time.sleep(1)
    
    # Check what happened
    o, e, _ = run("cat /tmp/redis-startup.log 2>/dev/null; echo '==='; cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -10; echo '==='; ps aux | grep redis-server | grep -v grep | head -5")
    print(f"STARTUP:\n{o}")
    
    time.sleep(2)
    
    # Try PING via Node (the full path)
    print("\n=== PING TEST ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var c=require('net').connect(6379,'127.0.0.1');
c.on('connect',function(){
  c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n');
});
c.on('data',function(d){
  console.log('PONG:'+JSON.stringify(d.toString()));
  c.end();
  process.exit(0);
});
c.setTimeout(5000,function(){
  console.log('TIMEOUT');
  process.exit(1);
});
c.on('error',function(e){
  console.log('ERR:'+e.message);
  process.exit(1);
});
" 2>&1""")
    print(f"PING: {o}")

    # Check port again
    o, e, _ = run("ss -tlnp 2>/dev/null | grep 6379 || echo 'PORT_6379_NOT_OPEN'")
    print(f"PORT: {o}")

    # If Redis is working, start the app
    print("\n=== START APP ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL="$(source .env 2>/dev/null && echo "$DATABASE_URL")"
export REDIS_URL="redis://127.0.0.1:6379"
nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
echo "LAUNCHED_PID=$!"
sleep 10
""")
    print(o)

    # Health check
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

    # Redis log
    o, e, _ = run("tail -10 /home/u131951911/redis-data/redis.log 2>/dev/null")
    print(f"REDIS_LOG:\n{o}")

    ssh.close()
    print("\nALL_DONE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
