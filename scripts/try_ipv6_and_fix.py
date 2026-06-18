#!/usr/bin/env python3
"""Check IPv6 binding, kill stale app, fix Redis once and for all."""
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

    # 1. Check listening ports comprehensively
    print("=== ALL LISTENING PORTS ===")
    o = run("ss -tln4 2>/dev/null; echo '---ipv6---'; ss -tln6 2>/dev/null; echo '---all---'; cat /proc/net/tcp 2>/dev/null | head -10; echo '---tcp6---'; cat /proc/net/tcp6 2>/dev/null | head -10")
    print(o[:1500])

    # 2. Check what's on port 3000 (blocking the app)
    print("\n=== PORT 3000 ===")
    o = run("ss -tlnp 2>/dev/null | grep 3000 || lsof -i :3000 2>&1 | head -5 || cat /proc/*/net/tcp 2>/dev/null | grep -i '0BB8' | head -5 || echo 'PORT3000_STATUS_UNKNOWN'")
    print(o)

    # 3. Try connecting to different addresses
    print("\n=== MULTI-PING ===")
    pings = """
for addr in "127.0.0.1" "::1" "localhost" "0.0.0.0"; do
  echo -n "PING $addr: "
  node -e "
var c=require('net').connect(6379,'$addr',function(){c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')});
c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});
c.setTimeout(3000);
c.on('error',function(e){process.stdout.write(e.message);process.exit(1)});
" 2>&1
done
"""
    o = run(f"export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && eval \"{pings}\"")
    print(o)

    # 4. Try connecting to port 16379 (which Node.js successfully bound to earlier)
    print("\n=== TEST PORT 16379 ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var c=require('net').connect(16379,'127.0.0.1',function(){console.log('CONNECTED_TO_16379');c.end();process.exit(0)});
c.setTimeout(3000);
c.on('error',function(e){console.log('ERR:'+e.message);process.exit(1)});
" 2>&1""")
    print(o)

    # 5. Kill ALL processes on port 3000 
    print("\n=== KILL STALE APP ===")
    o = run("""# Find what's on port 3000
fuser -k 3000/tcp 2>/dev/null || kill $(lsof -ti:3000 2>/dev/null) 2>/dev/null || echo 'FUSER_FAILED'
# Also PM2 delete
export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 delete alaya-insider 2>/dev/null || true
pm2 delete redis 2>/dev/null || true
pkill -9 -f 'next-server' 2>/dev/null || true
sleep 2
echo 'KILLED'
""")
    print(o)

    # 6. Start Redis WITHOUT config file - just command line args
    print("\n=== REDIS CMD LINE ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 start /home/u131951911/redis-server --interpreter none --name redis -- --port 6379 --bind 127.0.0.1 --save "" --appendonly no --loglevel notice 2>&1
""")
    print(o[:500])
    time.sleep(5)

    # 7. Check PM2 log immediately
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs redis --lines 20 --nostream 2>&1 | head -20
""")
    print(f"LOG:\n{o[:1000]}")

    # 8. PING
    print("\n=== PING ===")
    for addr in ["127.0.0.1", "::1", "0.0.0.0"]:
        o = run(f"""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'{addr}',function(){{c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')}});c.on('data',function(d){{console.log(d.toString().trim());c.end();process.exit(0)}});c.setTimeout(5000);c.on('error',function(e){{console.log(e.message);process.exit(1)}});" 2>&1""")
        print(f"  {addr}: {o[:100]}")

    # 9. Check /proc for Redis process fds
    pid = run("pgrep -f 'redis-server' | head -1")
    if pid and pid.isdigit():
        o = run(f"ls -la /proc/{pid}/fd/ 2>/dev/null | head -10")
        print(f"\nFDs:\n{o}")
        o = run(f"cat /proc/{pid}/net/tcp 2>/dev/null | head -5")
        print(f"TCP:\n{o}")

    # 10. Start app
    print("\n=== START APP ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
export REDIS_URL=redis://127.0.0.1:6379
pm2 start node_modules/.bin/next --name alaya-insider -- start -p 3000 2>&1
""")
    print(o[:500])
    time.sleep(12)

    # 11. Health check
    print("\n=== HEALTH ===")
    for i in range(3):
        o = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"H{i+1}: {o[:300]}")
        if '"redis":"ok"' in o:
            print("*** REDIS OK ***")
            break
        time.sleep(3)

    # 12. PM2 list
    o = run("export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH && pm2 list 2>&1")
    print(f"PM2:\n{o}")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERR: {ex}")
