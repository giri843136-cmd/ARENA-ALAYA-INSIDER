#!/usr/bin/env python3
"""Final verification: Redis is running, restart app to connect."""
import paramiko, sys, os, time, base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=30):
    i,o,e = ssh.exec_command(cmd, timeout=timeout)
    ec = o.channel.recv_exit_status()
    return o.read().decode('utf-8', errors='replace').strip()

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)

    # Confirm Redis is running and PONGs
    print("=== REDIS PING ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var c=require('net').connect(6379,'127.0.0.1',function(){
  c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n');
});
c.on('data',function(d){
  var r=d.toString().trim();
  console.log('RESULT:'+r);
  c.end();
  process.exit(r==='+PONG'?0:1);
});
c.setTimeout(10000,function(){console.log('TIMEOUT');process.exit(1)});
c.on('error',function(e){console.log('ERR:'+e.message);process.exit(1)});
" 2>&1""")
    print(o)

    # Kill the app (Redis stays)
    print("\n=== RESTART APP ===")
    o = run("pkill -9 -f 'next-server' 2>/dev/null; sleep 2; echo 'APP_KILLED'")
    print(o)

    # Start app
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
export REDIS_URL=redis://127.0.0.1:6379
nohup node node_modules/.bin/next start -p 3000 < /dev/null > /tmp/alaya-app.log 2>&1 &
echo "APP_STARTED"
sleep 12
""")
    print(o)

    # Health check - multiple attempts
    print("\n=== HEALTH CHECK ===")
    for i in range(5):
        time.sleep(3)
        o = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"H{i+1}: {o[:300]}")
        if '"redis":"ok"' in o or '"redis":"ok"' in o.replace(' ', ''):
            print("*** REDIS OK ***")
            break

    # App log for redis connection messages
    o = run("tail -20 /tmp/alaya-app.log 2>/dev/null")
    print(f"\nAPP_LOG:\n{o}")

    # Summary
    print("\n=== FINAL STATUS ===")
    o = run("ps aux | grep -E 'redis-server|next-server' | grep -v grep")
    print(o)

    ssh.close()
    print("\nCOMPLETE")
except Exception as ex:
    print(f"ERROR: {ex}")
