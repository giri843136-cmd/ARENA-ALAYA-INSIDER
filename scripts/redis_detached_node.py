#!/usr/bin/env python3
"""Use Node.js to spawn Redis as detached child process and verify."""
import paramiko, sys, os, time, base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    o = stdout.read().decode('utf-8', errors='replace').strip()
    e = stderr.read().decode('utf-8', errors='replace').strip()
    return o, e, ec

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("CONNECTED")

    # Kill old
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; pkill -f 'redis-wrapper' 2>/dev/null; sleep 2")
    run("rm -f /home/u131951911/redis-data/redis.log")
    run("mkdir -p /home/u131951911/redis-data")

    # Write conf
    conf = "port 6379\nbind 127.0.0.1\ndaemonize no\npidfile /home/u131951911/redis-data/redis.pid\nlogfile /home/u131951911/redis-data/redis.log\ndir /home/u131951911/redis-data\nsave \"\"\nappendonly no\nloglevel notice\n"
    cb = base64.b64encode(conf.encode()).decode()
    run(f"echo '{cb}' | base64 -d > /tmp/redis.conf")

    # Write Node.js wrapper that spawns Redis as detached child
    wrapper = """const { spawn } = require('child_process');
const path = '/home/u131951911/redis-server';
const args = ['/tmp/redis.conf'];
const child = spawn(path, args, {
  stdio: 'ignore',
  detached: true
});
child.unref();
console.log('REDIS_SPAWNED_PID=' + child.pid);
// Keep this process alive for a while to verify
setTimeout(() => {
  const net = require('net');
  const c = net.connect(6379, '127.0.0.1');
  c.on('connect', () => {
    c.write('*1\\\\r\\\\n$4\\\\r\\\\nPING\\\\r\\\\n');
    c.on('data', d => { process.stdout.write('PONG:' + d.toString().trim()); c.end(); });
  });
  c.setTimeout(3000);
  c.on('error', e => process.stdout.write('ERR:' + e.message));
  c.on('end', () => process.exit(0));
}, 3000);
setTimeout(() => process.exit(0), 15000);
"""
    wb = base64.b64encode(wrapper.encode()).decode()
    run(f"echo '{wb}' | base64 -d > /home/u131951911/redis-wrapper.js")

    # Run the Node.js wrapper
    print("\nSPAWN REDIS VIA NODE.JS")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node /home/u131951911/redis-wrapper.js 2>&1
""", timeout=20)
    print(f"WRAPPER_OUTPUT:\n{o}")

    # Now check if Redis is running
    o, e, _ = run("ps aux | grep redis-server | grep -v grep")
    print(f"REDIS_PROC:\n{o}")

    # Check port
    o, e, _ = run("ss -tln 2>/dev/null | grep 6379 || netstat -tln 2>/dev/null | grep 6379 || echo 'PORT_CLOSED'")
    print(f"PORT: {o}")

    # redis-cli PING
    o, e, _ = run("/home/u131951911/redis-cli -p 6379 ping 2>&1 || echo 'CLI_FAILED'")
    print(f"CLI: {o}")

    # Full Redis log
    o, e, _ = run("cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -20")
    print(f"LOG:\n{o}")

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
    print(o)

    # Health check
    print("\nHEALTH CHECK")
    for i in range(3):
        o, e, _ = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"H{i+1}: {o[:200]}")
        if "redis" in o:
            # Check if redis shows ok
            idx = o.find('"redis"')
            if idx >= 0:
                after = o[idx:idx+60]
                if '"ok"' in after:
                    print("*** REDIS OK ***")
                    break
        time.sleep(3)

    # Final processes
    o, e, _ = run("ps aux | grep -E 'redis-server|next-server' | grep -v grep")
    print(f"FINAL:\n{o}")

    ssh.close()
    print("\nDONE")
except Exception as ex:
    print(f"ERROR: {ex}")
