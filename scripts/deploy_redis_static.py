#!/usr/bin/env python3
"""Download static Redis binary to VPS, start it, and configure the app."""
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

    # Step 1: Check if curl is available and download static Redis binary
    print("=== STEP 1: Download static Redis binary ===")
    # Try multiple sources for static Redis binaries
    cmd = """
set -e
echo "Trying phlummox-dev/redis-static-binaries..."
# Try multiple URLs for static builds
for URL in \
  "https://github.com/phlummox-dev/redis-static-binaries/releases/download/6.2.5.0/redis-server" \
  "https://github.com/phlummox-dev/redis-static-binaries/releases/download/6.2.5.0/redis-cli"; do
  echo "Trying: $URL"
  wget -q --timeout=15 -O /home/u131951911/redis-server "$URL" 2>&1 && { echo "DOWNLOAD_OK"; break; } || echo "FAILED"
done
if [ -f /home/u131951911/redis-server ]; then
  chmod +x /home/u131951911/redis-server
  echo "CHMOD_OK"
  file /home/u131951911/redis-server
else
  echo "ALL_DOWNLOADS_FAILED"
  exit 1
fi
"""
    out, err, code = run(cmd)
    print(out)
    if err: print(f"ERR: {err}")
    print()

    # Step 2: Check the file
    print("=== STEP 2: Verify binary ===")
    out, err, code = run("ls -lh /home/u131951911/redis-server 2>&1; /home/u131951911/redis-server --version 2>&1 || echo 'BINARY_NOT_EXECUTABLE'")
    print(out)

    # If the binary doesn't work, try an alternative approach
    out_str = out
    if 'BINARY_NOT_EXECUTABLE' in out_str or 'cannot execute' in out_str.lower() or 'not found' in out_str.lower() or not out_str.strip():
        print("\n=== ALTERNATIVE: Try downloading Redis deb and extracting ===")
        alt_cmd = """
cd /tmp
# Download the deb package
wget -q --timeout=15 "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_6.0.16-1ubuntu1_amd64.deb" -O redis.deb 2>&1 || wget -q --timeout=15 "http://security.ubuntu.com/ubuntu/pool/main/r/redis/redis-server_6.0.16-1build1_amd64.deb" -O redis.deb 2>&1
if [ -f redis.deb ]; then
  echo "DEB_DOWNLOADED $(ls -lh redis.deb | awk '{print $5}')"
  # Extract using dpkg-deb (check if available)
  if command -v dpkg-deb &>/dev/null; then
    mkdir -p /tmp/redis-extract
    dpkg-deb -x redis.deb /tmp/redis-extract 2>&1
    find /tmp/redis-extract -name 'redis-server' -type f 2>/dev/null | head -5
    BIN=$(find /tmp/redis-extract -name 'redis-server' -type f 2>/dev/null | head -1)
    if [ -n "$BIN" ]; then
      cp "$BIN" /home/u131951911/redis-server
      chmod +x /home/u131951911/redis-server
      echo "COPIED_OK"
    else
      echo "BIN_NOT_FOUND"
    fi
  else
    # Try ar + tar extraction
    ar x redis.deb 2>&1
    ls *.tar.* 2>/dev/null
    for f in data.tar.*; do
      [ -f "$f" ] && tar xf "$f" -C /tmp/redis-extract 2>/dev/null && break
    done
    BIN=$(find /tmp/redis-extract -name 'redis-server' -type f 2>/dev/null | head -1)
    if [ -n "$BIN" ]; then
      cp "$BIN" /home/u131951911/redis-server
      chmod +x /home/u131951911/redis-server
      echo "COPIED_OK"
    else
      echo "BIN_NOT_FOUND"
    fi
  fi
else
  echo "DEB_DOWNLOAD_FAILED"
fi
"""
        out2, err2, code2 = run(alt_cmd)
        print(out2)
        if err2: print(f"ERR: {err2}")

    # Step 3: Check if we got a working binary
    print("\n=== STEP 3: Test binary ===")
    out, err, code = run("ls -lh /home/u131951911/redis-server 2>&1; echo '---'; file /home/u131951911/redis-server 2>&1; echo '---'; /home/u131951911/redis-server --version 2>&1 || echo 'VERSION_FAILED'")
    print(out)

    # Step 4: Start Redis
    print("\n=== STEP 4: Start Redis ===")
    start_cmd = """
# Kill any existing redis
pkill -f redis-server 2>/dev/null || true
sleep 1

# Start Redis with minimal config
mkdir -p /home/u131951911/redis-data
cat > /tmp/redis.conf << 'EOF'
port 6379
bind 127.0.0.1
daemonize yes
save ""
appendonly no
loglevel notice
pidfile /home/u131951911/redis-data/redis.pid
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
EOF

/home/u131951911/redis-server /tmp/redis.conf 2>&1
sleep 2

# Check if running
ps aux | grep redis-server | grep -v grep | head -3
echo "---"
# Try to connect
/home/u131951911/redis-cli -p 6379 ping 2>&1 || echo "No redis-cli, trying node..."
node -e "const net=require('net');const c=net.connect(6379,'127.0.0.1',()=>{c.write('*1\\r\\n\$4\\r\\nPING\\r\\n');c.on('data',d=>console.log('RESP:',d.toString()));c.end()});c.on('error',e=>console.log('CONN_ERR:',e.message))" 2>&1 || echo "PING_FAILED"
"""
    out, err, code = run(start_cmd)
    print(out)
    if err: print(f"ERR: {err}")

    # Step 5: Update .env with REDIS_URL
    print("\n=== STEP 5: Update .env ===")
    env_cmd = """
cd /home/u131951911/alaya-insider
# Check current REDIS_URL
echo "Current REDIS_URL:"
grep REDIS_URL .env 2>/dev/null || echo "NOT_SET"

# Update or add REDIS_URL
if grep -q 'REDIS_URL' .env 2>/dev/null; then
  sed -i 's|REDIS_URL=.*|REDIS_URL=redis://127.0.0.1:6379|' .env
  echo "UPDATED_REDIS_URL"
else
  echo 'REDIS_URL=redis://127.0.0.1:6379' >> .env
  echo "ADDED_REDIS_URL"
fi

# Verify
grep REDIS_URL .env
"""
    out, err, code = run(env_cmd)
    print(out)
    if err: print(f"ERR: {err}")

    # Step 6: Restart the app
    print("\n=== STEP 6: Restart app ===")
    restart_cmd = """
# Kill old app
pkill -f "next-server" 2>/dev/null || true
sleep 2

# Start with Node v22
export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
cd /home/u131951911/alaya-insider
source .env 2>/dev/null

export NODE_ENV=production
export DATABASE_URL="$DATABASE_URL"
export REDIS_URL="$REDIS_URL"

nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
echo "APP_STARTED_PID=$!"
sleep 5
"""
    out, err, code = run(restart_cmd)
    print(out)
    if err: print(f"ERR: {err}")

    # Step 7: Health check
    print("\n=== STEP 7: Health check ===")
    health_cmd = """
sleep 3
curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 500
echo ""
echo "---"
# Also check app log
tail -20 /tmp/alaya-app.log 2>/dev/null | head -20
"""
    out, err, code = run(health_cmd)
    print(out)
    if err: print(f"ERR: {err}")

    ssh.close()
    print("\nALL_DONE")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
