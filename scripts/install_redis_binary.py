#!/usr/bin/env python3
"""Download a precompiled Redis binary from Ubuntu/deb packages on the VPS."""
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

def run(cmd, label=""):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if label:
        print(f"== {label} ==")
    if out:
        print(out)
    if err:
        print(f"ERR: {err}")
    print()
    return out, err, exit_code

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)
    print("SSH_CONNECTED\n")

    # Step 1: Download the Ubuntu Redis deb package and extract the binary
    # Using Ubuntu 22.04 (jammy) redis-server 7.0 package
    script = r"""
set -e
echo "=== STEP 1: Download Redis deb package ==="
cd /tmp
# Try multiple Redis versions - start with 7.2
for URL in \
  "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_7.2.5-1_amd64.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_7.0.15-1~22.04.2_amd64.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_7.0.12-1~22.04.1_amd64.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_6.0.16-1build1_amd64.deb" \
  "http://security.ubuntu.com/ubuntu/pool/main/r/redis/redis-server_7.0.15-1~22.04.2_amd64.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_6.0.16-1ubuntu1_amd64.deb"; do
  echo "Trying: $URL"
  wget -q --timeout=10 -O redis.deb "$URL" 2>/dev/null && { echo "DOWNLOAD_OK"; break; } || echo "FAILED"
done

if [ ! -f redis.deb ]; then
  # Fallback: try to find any Redis binary from alternative sources
  echo "DEB_DOWNLOAD_FAILED"
  exit 1
fi

echo "=== STEP 2: Extract binary from deb ==="
# .deb is an ar archive. Extract data.tar.xz, then find redis-server
ar x redis.deb 2>/dev/null || {
  # If ar not available, try binutils
  echo "AR_NOT_FOUND, trying dpkg-deb..."
  dpkg-deb -x redis.deb /tmp/redis-extract 2>/dev/null || {
    # Last resort: just try to find data.tar
    echo "EXTRACT_FAILED"
    exit 1
  }
}

# If ar worked
if [ -f data.tar.xz ]; then
  tar xf data.tar.xz -C /tmp/redis-extract 2>/dev/null || tar xJf data.tar.xz -C /tmp/redis-extract 2>/dev/null
elif [ -f data.tar.gz ]; then
  tar xzf data.tar.gz -C /tmp/redis-extract 2>/dev/null
fi

echo "=== STEP 3: Locate redis-server ==="
find /tmp/redis-extract -name 'redis-server' -type f 2>/dev/null | head -5

# Copy to home directory
cp /tmp/redis-extract/usr/bin/redis-server /home/u131951911/redis-server 2>/dev/null && echo "COPIED_OK" || echo "COPY_FAILED"

# Also get redis-cli
cp /tmp/redis-extract/usr/bin/redis-cli /home/u131951911/redis-cli 2>/dev/null && echo "CLI_COPIED" || echo "CLI_MISSING"

echo "=== STEP 4: Verify ==="
ls -lh /home/u131951911/redis-server /home/u131951911/redis-cli 2>&1
file /home/u131951911/redis-server 2>&1
/home/u131951911/redis-server --version 2>&1 || echo "VERSION_CHECK_FAILED"

echo "=== STEP 5: Start Redis ==="
/home/u131951911/redis-server --daemonize yes --port 6379 --bind 127.0.0.1 --save "" --appendonly no 2>&1
sleep 1
/home/u131951911/redis-cli -p 6379 ping 2>&1

echo "=== STEP 6: Check process ==="
ps aux | grep redis-server | grep -v grep | head -3
"""
    
    # Write script to VPS and execute
    stdin, stdout, stderr = ssh.exec_command('cat > /tmp/install_redis.sh << \'SCRIPTEOF\'\n' + script + '\nSCRIPTEOF\nchmod +x /tmp/install_redis.sh\nbash /tmp/install_redis.sh 2>&1')
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(out)
    if err:
        print(f"STDERR: {err}")

    ssh.close()

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
