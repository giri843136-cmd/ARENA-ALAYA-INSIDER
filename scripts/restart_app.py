#!/usr/bin/env python3
"""Restart the app now that Redis is running so ioredis gets a fresh connection."""
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

    # Confirm Redis is running
    o, e, _ = run("redis-cli -p 6379 ping 2>&1 || /home/u131951911/redis-cli -p 6379 ping 2>&1 || node -e \"var c=require('net').connect(6379,'127.0.0.1',function(){c.write('*1\\r\\n'+String.fromCharCode(36)+'4\\r\\nPING\\r\\n')});c.on('data',function(d){process.stdout.write(d.toString().trim());c.end();process.exit(0)});c.setTimeout(3000);c.on('error',function(e){process.stdout.write('ERR:'+e.message);process.exit(1)})\" 2>&1")
    print(f"REDIS_CHECK: {o}")

    # Verify port is actually listening
    o, e, _ = run("ss -tlnp 2>/dev/null | grep 6379 || netstat -tlnp 2>/dev/null | grep 6379 || echo 'PORT_CHECK_FAILED'")
    print(f"PORT: {o}")

    # Kill app only (not Redis)
    o, e, _ = run("pkill -9 -f 'next-server' 2>/dev/null; sleep 2; echo 'APP_KILLED'")
    print(o)

    # Restart app with Node v22
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
source .env 2>/dev/null
nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
sleep 8
echo "APP_RESTARTED"
""")
    print(o)

    # Verify app process
    o, e, _ = run("ps aux | grep 'next-server' | grep -v grep | head -3")
    print(f"APP_PROC: {o}")

    # Health check with multiple retries
    for i in range(3):
        time.sleep(3)
        o, e, _ = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"HEALTH_ATTEMPT_{i+1}: {o}")
        if '"redis":"ok"' in o or '"redis":{"healthy":true}' in o or '"redis":"ok"' in o.replace(' ', ''):
            print("REDIS_OK_CONFIRMED")
            break

    # App log tail
    o, e, _ = run("tail -15 /tmp/alaya-app.log 2>/dev/null")
    print(f"APP_LOG: {o}")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
