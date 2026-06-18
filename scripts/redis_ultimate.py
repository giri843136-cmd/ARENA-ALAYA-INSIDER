#!/usr/bin/env python3
"""Ultimate attempt: try different Redis binary + fallback to Upstash."""
import paramiko, sys, os, time, base64
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=60):
    i,o,e = ssh.exec_command(cmd, timeout=timeout)
    ec = o.channel.recv_exit_status()
    return o.read().decode('utf-8', errors='replace').strip()

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)

    # Get full PM2 log for Redis to see what happens after "Ready"
    print("=== FULL REDIS PM2 LOG ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs redis --lines 100 --nostream 2>&1 | head -60
""")
    print(o)

    # Try downloading a different Redis binary - from rabbitmq's static build
    print("\n=== TRY DIFFERENT BINARY ===")
    run("pkill -9 -f 'redis-server' 2>/dev/null; sleep 1")
    
    # Try: Alpine edge prebuilt binary
    o = run("""wget -q --timeout=15 -O /tmp/redis-alpine.tar.gz "https://dl-cdn.alpinelinux.org/alpine/edge/main/x86_64/redis-7.2.5-r0.apk" 2>&1 && echo 'APK_OK' || echo 'APK_FAIL'
if [ -f /tmp/redis-alpine.tar.gz ]; then
  # .apk is just a tar.gz
  mkdir -p /tmp/apk-extract
  tar xzf /tmp/redis-alpine.tar.gz -C /tmp/apk-extract 2>&1
  find /tmp/apk-extract -name 'redis-server' -type f 2>/dev/null
  BIN=$(find /tmp/apk-extract -name 'redis-server' -type f 2>/dev/null | head -1)
  if [ -n "$BIN" ]; then
    cp "$BIN" /home/u131951911/redis-server2
    chmod +x /home/u131951911/redis-server2
    echo "COPIED_OK"
    file /home/u131951911/redis-server2
    /home/u131951911/redis-server2 --version 2>&1
  else
    echo "BIN_NOT_FOUND_IN_APK"
  fi
fi
""")
    print(o)

    # Try the new binary
    if os.path.exists('/home/u131951911/redis-server2'):
        print("\n=== TRY NEW BINARY ===")
        run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 delete redis 2>/dev/null; sleep 1")
        o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 start /home/u131951911/redis-server2 --interpreter none --name redis -- --port 6379 --bind 127.0.0.1 --save "" --appendonly no 2>&1
sleep 5
""")
        print(o[:500])
        time.sleep(3)
        
        # PING
        o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1',function(){c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on('error',function(e){console.log(e.message);process.exit(1)});" 2>&1""")
        print(f"PING: {o}")
        
        # Show log
        o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs redis --lines 20 --nostream 2>&1 | head -20
""")
        print(f"LOG:\n{o}")

    # Fallback: configure app to work in degraded mode
    # The app has built-in graceful degradation - it just needs to restart cleanly
    print("\n=== ENSURE APP RUNS ===")
    # Kill the app that's erroring
    run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 delete alaya-insider 2>/dev/null; sleep 1")
    
    # Start app - it will use the in-memory Redis stub
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
export REDIS_URL=redis://127.0.0.1:6379
pm2 start node_modules/.bin/next --name alaya-insider -- start -p 3000 2>&1
""")
    print(o[:500])
    time.sleep(15)

    # Health check
    print("\n=== HEALTH ===")
    for i in range(3):
        o = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"H{i+1}: {o[:300]}")
        time.sleep(3)

    # Final PM2
    o = run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 list 2>&1")
    print(f"PM2:\n{o}")
    
    # Save PM2 config
    run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 save 2>&1")
    print("PM2_SAVED")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERR: {ex}")
