#!/usr/bin/env python3
"""Check PM2 logs for Redis and app."""
import paramiko, sys, os, time, base64
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

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

    # PM2 logs for Redis
    print("=== REDIS PM2 LOG ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs redis --lines 50 --nostream 2>&1 | head -40
""")
    print(o[:2000])

    # PM2 logs for app
    print("\n=== APP PM2 LOG ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs alaya-insider --lines 30 --nostream 2>&1 | head -40
""")
    print(o[:2000])

    # PM2 status
    print("\n=== PM2 STATUS ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 list 2>&1
""")
    print(o)

    # Check if we can see anything on port 6379 by trying to connect with a delay
    print("\n=== DELAYED PING ===")
    for delay in [1, 3, 5]:
        time.sleep(delay)
        o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1',function(){c.write('*1\\\\r\\\\n$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on('error',function(e){console.log(e.message);process.exit(1)});" 2>&1""")
        print(f"  delay={delay}s: {o[:100]}")

    # Try to restart Redis via PM2 and wait
    print("\n=== RESTART REDIS VIA PM2 ===")
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 delete redis 2>&1
sleep 1
pm2 start /home/u131951911/redis-server --interpreter none --name redis -- /tmp/redis.conf 2>&1
""")
    print(o)
    time.sleep(5)

    # PING
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "var c=require('net').connect(6379,'127.0.0.1',function(){c.write('*1\\\\r\\\\n$4\\\\r\\\\nPING\\\\r\\\\n')});c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});c.setTimeout(5000);c.on('error',function(e){console.log(e.message);process.exit(1)});" 2>&1""")
    print(f"PING: {o}")

    # Check pm2 log immediately after start
    o = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
pm2 logs redis --lines 20 --nostream 2>&1 | head -20
""")
    print(f"REDIS_LOG:\n{o}")

    ssh.close()
except Exception as ex:
    print(f"ERR: {ex}")
