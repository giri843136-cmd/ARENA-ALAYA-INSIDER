#!/usr/bin/env python3
"""Download Redis deb and extract binary using pure Python (no ar/dpkg needed)."""
import paramiko
import sys
import os
import base64
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
    print("SSH_CONNECTED\n")

    # Kill any existing redis and app
    run("pkill -9 -f 'redis-server' 2>/dev/null; pkill -9 -f 'next-server' 2>/dev/null; sleep 1")

    # Step 1: Download the Redis deb package from Ubuntu repositories
    print("=== DOWNLOAD DEB ===")
    # Try a few Redis 6.x and 7.x deb packages
    urls = [
        "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_6.0.16-1ubuntu1_amd64.deb",
        "http://archive.ubuntu.com/ubuntu/pool/universe/r/redis/redis-server_5.0.7-2_amd64.deb",
    ]
    for url in urls:
        o, e, _ = run(f"wget -q --timeout=15 -O /tmp/redis.deb '{url}' 2>&1 && echo 'OK' || echo 'FAIL'")
        if 'OK' in o:
            print(f"Downloaded: {url}")
            break
    
    o, e, _ = run("ls -lh /tmp/redis.deb 2>&1")
    print(o)

    # Step 2: Extract the Redis binary from deb using pure Python approach
    # Write a Python script to extract the binary
    extract_script = '''
import ar
import tarfile
import os
import sys
import lzma
import gzip

# The deb file path
deb_path = "/tmp/redis.deb"

# Read the ar archive
with open(deb_path, "rb") as f:
    data = f.read()

# Parse ar header (8 bytes magic + header entries)
# ar format: global header "!<arch>\\n" then entries
# Each entry: 60 bytes header + file data
magic = data[:8]
if magic != b"!<arch>\\n":
    print("NOT_AR_FORMAT")
    sys.exit(1)

pos = 8
found_data = False

while pos < len(data):
    # Parse 60-byte header
    header = data[pos:pos+60]
    if len(header) < 60:
        break
    name = header[:16].decode("ascii", errors="replace").strip()
    # size is in bytes 48-57 (decimal ASCII)
    try:
        size_str = header[48:58].decode("ascii").strip()
        file_size = int(size_str)
    except:
        break
    
    # Skip the header
    pos += 60
    
    # Check if this is data.tar
    if "data.tar" in name:
        print(f"Found: {name} size={file_size}")
        file_data = data[pos:pos+file_size]
        
        # Write temp file
        ext = name.rsplit(".", 1)[-1].strip()
        tmp_path = f"/tmp/data.tar.{ext}"
        with open(tmp_path, "wb") as fout:
            fout.write(file_data)
        
        # Extract
        extract_dir = "/tmp/redis-extract"
        os.makedirs(extract_dir, exist_ok=True)
        
        if ext == "xz":
            import lzma
            decomp = lzma.LZMAFile(tmp_path)
            with tarfile.open(fileobj=decomp) as tar:
                tar.extractall(path=extract_dir)
            decomp.close()
            print("EXTRACTED_XZ_OK")
        elif ext == "gz":
            with tarfile.open(tmp_path, "r:gz") as tar:
                tar.extractall(path=extract_dir)
            print("EXTRACTED_GZ_OK")
        elif ext == "zst":
            # Try zstd - might not be available
            print("ZST_NOT_SUPPORTED")
            found_data = False
            break
        else:
            # Try as gz
            try:
                with tarfile.open(tmp_path, "r:gz") as tar:
                    tar.extractall(path=extract_dir)
                print("EXTRACTED_GZ_OK")
            except:
                print(f"UNSUPPORTED_FORMAT:{ext}")
                found_data = False
                break
        
        found_data = True
        
        # Find redis-server
        for root, dirs, files in os.walk(extract_dir):
            for f in files:
                if f == "redis-server":
                    src = os.path.join(root, f)
                    dst = "/home/u131951911/redis-server"
                    with open(src, "rb") as fin:
                        with open(dst, "wb") as fout:
                            fout.write(fin.read())
                    os.chmod(dst, 0o755)
                    print(f"REDIS_COPIED:{dst}")
                    # Also copy redis-cli
                    for f2 in files:
                        if f2 == "redis-cli":
                            cli_src = os.path.join(root, f2)
                            cli_dst = "/home/u131951911/redis-cli"
                            with open(cli_src, "rb") as fin:
                                with open(cli_dst, "wb") as fout:
                                    fout.write(fin.read())
                            os.chmod(cli_dst, 0o755)
                            print(f"CLI_COPIED:{cli_dst}")
                    found_data = True
                    break
            if found_data:
                break
    
    # Move to next entry (file data is padded to even boundary)
    pos += file_size
    if file_size % 2 != 0:
        pos += 1

if not found_data:
    print("REDIS_NOT_FOUND_IN_DEB")
    sys.exit(1)

# Verify
import subprocess
result = os.popen("/home/u131951911/redis-server --version 2>&1").read()
print(f"VERSION:{result.strip()}")
print("EXTRACT_SUCCESS")
'''

    # Base64 encode the script to avoid quoting issues
    script_b64 = base64.b64encode(extract_script.encode()).decode()
    
    o, e, _ = run(f"echo '{script_b64}' | base64 -d > /tmp/extract_redis.py && python3 /tmp/extract_redis.py 2>&1 || python /tmp/extract_redis.py 2>&1")
    print(f"EXTRACT:\n{o}")
    if e: print(f"ERR: {e}")

    # Step 3: Verify binary
    print("\n=== VERIFY BINARY ===")
    o, e, _ = run("ls -lh /home/u131951911/redis-server; file /home/u131951911/redis-server; /home/u131951911/redis-server --version 2>&1")
    print(o)

    # Step 4: Start Redis
    print("\n=== START REDIS ===")
    run("mkdir -p /home/u131951911/redis-data")
    
    conf = """port 6379
bind 127.0.0.1
daemonize no
pidfile /home/u131951911/redis-data/redis.pid
logfile /home/u131951911/redis-data/redis.log
dir /home/u131951911/redis-data
save ""
appendonly no
loglevel notice
"""
    conf_b64 = base64.b64encode(conf.encode()).decode()
    run(f"echo '{conf_b64}' | base64 -d > /tmp/redis.conf")
    
    # Start with setsid
    o, e, _ = run("nohup setsid /home/u131951911/redis-server /tmp/redis.conf > /tmp/redis-startup.log 2>&1 &")
    time.sleep(3)
    
    # Check
    o, e, _ = run("ps aux | grep redis-server | grep -v grep | head -3; echo '==='; cat /home/u131951911/redis-data/redis.log 2>/dev/null | tail -5; echo '==='; ss -tln 2>/dev/null | grep 6379 || netstat -tln 2>/dev/null | grep 6379 || echo 'NO_PORT'")
    print(f"REDIS_STATUS:\n{o}")

    # Step 5: Test PING
    print("\n=== PING TEST ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var c=require('net').connect(6379,'127.0.0.1');
c.on('connect',function(){c.write('*1\\\\r\\\\n\$4\\\\r\\\\nPING\\\\r\\\\n')});
c.on('data',function(d){console.log(d.toString().trim());c.end();process.exit(0)});
c.setTimeout(5000);
c.on('error',function(e){console.log(e.message);process.exit(1)});
" 2>&1""")
    print(f"PING: {o}")

    # Check if redis-cli now works
    o, e, _ = run("/home/u131951911/redis-cli -p 6379 ping 2>&1")
    print(f"CLI_PING: {o}")

    # Step 6: Start app
    print("\n=== START APP ===")
    o, e, _ = run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:$PATH
cd /home/u131951911/alaya-insider
export NODE_ENV=production
export DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)"
export REDIS_URL="redis://127.0.0.1:6379"
nohup node node_modules/.bin/next start -p 3000 > /tmp/alaya-app.log 2>&1 &
echo "APP_STARTED"
sleep 10
""")
    print(o)

    # Step 7: Health check
    print("\n=== HEALTH CHECK ===")
    for i in range(3):
        o, e, _ = run("curl -s --connect-timeout 10 http://localhost:3000/api/ops/health 2>&1")
        print(f"HEALTH_{i+1}: {o}")
        if "redis" in o:
            break
        time.sleep(3)

    # App logs
    o, e, _ = run("tail -15 /tmp/alaya-app.log 2>/dev/null")
    print(f"APP_LOG:\n{o}")

    ssh.close()
    print("\nCOMPLETE")
except Exception as ex:
    print(f"ERROR: {ex}")
    import traceback
    traceback.print_exc()
