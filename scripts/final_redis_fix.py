#!/usr/bin/env python3
"""Use PM2 to manage Redis and the app permanently."""
import paramiko, sys, os, time, base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=60):
    i,o,e = ssh.exec_command(cmd, timeout=timeout)
    ec = o.channel.recv_exit_status()
    return o.read().decode('utf-8', errors='replace').strip()

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)

    # Kill old
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; sleep 2")
    run("rm -f /home/u131951911/redis-data/redis.log")
    run("mkdir -p /home/u131951911/redis-data")

    # Write conf
    conf = base64.b64encode(b"port 6379\nbind 127.0.0.1\ndaemonize no\npidfile /home/u131951911/redis-data/redis.pid\nlogfile /home/u131951911/redis-data/redis.log\ndir /home/u131951911/redis-data\nsave \"\"\nappendonly no\nloglevel notice\n").decode()
    run(f"echo '{conf}' | base64 -d > /tmp/redis.conf")

    # Restart PM2 (kill any existing)
    run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 kill 2>&1; sleep 1")

    # PM2 start Redis
    print("PM2 START REDIS")
    o = run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 start /home/u131951911/redis-server --interpreter none --name redis -- /tmp/redis.conf 2>&1")
    print(o[:500])
    time.sleep(3)

    # PING
    print("\nPING")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1',function(){c.write('*1\\\\r\\\\n$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});c.setTimeout(10000);c.on('error',function(e){console.log(e.message);process.exit(1)});" 2>&1""")
    print(o)

    # PM2 list
    print("\nPM2 LIST")
    o = run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 list 2>&1")
    print(o[:500])

    # Start app
    print("\nSTART APP")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
export REDIS_URL=redis://127.0.0.1:6379
pm2 start node_modules/.bin/next --name alaya-insider -- start -p 3000 2>&1
""")
    print(o[:500])
    time.sleep(10)

    # Health check
    print("\nHEALTH")
    for i in range(3):
        time.sleep(3)
        o = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"H{i+1}: {o[:300]}")
        if '"redis":"ok"' in o:
            print("*** REDIS OK ***")
            break

    # Save PM2
    run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 save 2>&1")
    print("\nPM2 SAVED")

    # Status
    o = run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 list 2>&1")
    print(f"PM2 LIST:\n{o}")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERR: {ex}")
