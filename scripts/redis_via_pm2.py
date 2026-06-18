#!/usr/bin/env python3
"""Start Redis properly and verify."""
import paramiko, sys, os, time, base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")
sys.stdout.reconfigure = lambda: None  # Avoid encoding issues

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    o = stdout.read().decode('utf-8', errors='replace').strip()
    e = stderr.read().decode('utf-8', errors='replace').strip()
    return o, e, ec

def pr(label, text):
    print(f"{label}: {text[:500]}")

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("CONNECTED")

    # Kill old processes
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; sleep 2")
    run("rm -f /home/u131951911/redis-data/redis.log")
    run("mkdir -p /home/u131951911/redis-data")

    # Write redis conf
    conf = "port 6379\nbind 127.0.0.1\ndaemonize no\npidfile /home/u131951911/redis-data/redis.pid\nlogfile /home/u131951911/redis-data/redis.log\ndir /home/u131951911/redis-data\nsave \"\"\nappendonly no\nloglevel notice\n"
    conf_b64 = base64.b64encode(conf.encode()).decode()
    run(f"echo '{conf_b64}' | base64 -d > /tmp/redis.conf")

    # Start Redis with proper backgrounding (nohup + stdin redirect)
    print("\nSTART REDIS")
    o, e, _ = run("""nohup /home/u131951911/redis-server /tmp/redis.conf < /dev/null > /tmp/redis-startup.log 2>&1 &
echo "LAUNCHED"
sleep 4
ps aux | grep redis-server | grep -v grep | head -3
""")
    pr("REDIS_PROC", o)

    # Check port
    o, e, _ = run("ss -tln 2>/dev/null | grep 6379 || netstat -tln 2>/dev/null | grep 6379 || echo 'PORT_CLOSED'")
    pr("PORT", o)

    # PING via Node
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1');c.on('connect',function(){c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on('error',function(e){console.log(e.message);process.exit(1)});" 2>&1""")
    pr("PING", o)

    # redis-cli PING
    o, e, _ = run("/home/u131951911/redis-cli -p 6379 ping 2>&1 || echo 'NO_CLI'")
    pr("CLI", o)

    # Redis log
    o, e, _ = run("tail -10 /home/u131951911/redis-data/redis.log 2>/dev/null")
    pr("LOG", o)

    # Start app
    print("\nSTART APP")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
export REDIS_URL=redis://127.0.0.1:6379
nohup node node_modules/.bin/next start -p 3000 < /dev/null > /tmp/alaya-app.log 2>&1 &
echo "APP_PID=$!"
sleep 10
""")
    pr("APP", o)

    # Health check
    print("\nHEALTH CHECK")
    for i in range(3):
        o, e, _ = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        pr(f"H{i+1}", o)
        if "redis" in o and "error" not in o.split('"redis"')[1][:30] if '"redis"' in o else False:
            print("REDIS_OK!")
            break
        time.sleep(3)

    # Final processes
    o, e, _ = run("ps aux | grep -E 'redis-server|next-server' | grep -v grep")
    pr("FINAL", o)

    # App log
    o, e, _ = run("tail -10 /tmp/alaya-app.log 2>/dev/null")
    pr("APP_LOG", o)

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
