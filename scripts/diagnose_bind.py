#!/usr/bin/env python3
"""Diagnose why port binding fails on the VPS."""
import paramiko, sys, os, time, base64

VPS_HOST = "157.173.216.156"
VPS_PORT = 65002
VPS_USER = "u131951911"
VPS_PASSWORD = os.environ.get("VPS_PASSWORD", "")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run(cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    ec = stdout.channel.recv_exit_status()
    return stdout.read().decode('utf-8', errors='replace').strip()

try:
    ssh.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASSWORD, timeout=15)

    # 1. Check what tools are available
    print("TOOLS:", run("which lsof ss netstat strace 2>&1"))
    
    # 2. Check what ports are listening on all interfaces
    print("ALL_PORTS:", run("ss -tln 2>/dev/null; netstat -tln 2>/dev/null; echo 'DONE'"))
    
    # 3. Check if some other process is using 6379
    print("PORT6379:", run("ss -tln 2>/dev/null | grep 6379; netstat -tln 2>/dev/null | grep 6379; lsof -i :6379 2>&1 | head -5; echo 'DONE'"))
    
    # 4. Check Redis process details
    pid = run("pgrep -f 'redis-server' | head -1")
    print(f"REDIS_PID: {pid}")
    
    if pid and pid.isdigit():
        # Check process state
        print(f"PROC_STAT: {run(f'cat /proc/{pid}/stat 2>/dev/null | head -c 200')}")
        # Check what ports it has open via /proc
        print(f"PROC_FDS: {run(f'ls -la /proc/{pid}/fd/ 2>/dev/null | head -10')}")
        print(f"PROC_TCP: {run(f'cat /proc/{pid}/net/tcp 2>/dev/null | head -5')}")
        print(f"PROC_CMDLINE: {run(f'cat /proc/{pid}/cmdline 2>/dev/null | tr \"\\0\" \" \"')}")
    
    # 5. Check system limits
    print("ULIMIT:", run("ulimit -n 2>&1"))
    print("ULIMIT_ALL:", run("ulimit -a 2>&1 | head -20"))
    
    # 6. Check SELinux/AppArmor
    print("SELINUX:", run("getenforce 2>&1; sestatus 2>&1 | head -3; echo 'DONE'"))
    print("APPARMOR:", run("apparmor_status 2>&1 | head -5; cat /sys/kernel/security/apparmor/profiles 2>/dev/null | head -10; echo 'DONE'"))
    
    # 7. Try to bind from Node.js (test if any program can bind to 6379)
    print("TEST_BIND:", run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var net=require('net');
var s=net.createServer();
s.on('error',function(e){console.log('BIND_ERR:'+e.message);process.exit(1)});
s.listen(6379,'127.0.0.1',function(){console.log('BIND_OK');s.close();process.exit(0)});
setTimeout(function(){console.log('TIMEOUT');process.exit(1)},5000);
" 2>&1"""))
    
    # 8. Try binding to 0.0.0.0
    print("TEST_BIND_ANY:", run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var net=require('net');
var s=net.createServer();
s.on('error',function(e){console.log('BIND_ERR:'+e.message);process.exit(1)});
s.listen(6379,function(){console.log('BIND_OK_ANY');s.close();process.exit(0)});
setTimeout(function(){console.log('TIMEOUT');process.exit(1)},5000);
" 2>&1"""))
    
    # 9. Try a high port
    print("TEST_HIGH_PORT:", run("""export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:$PATH
node -e "
var net=require('net');
var s=net.createServer();
s.on('error',function(e){console.log('BIND_ERR:'+e.message);process.exit(1)});
s.listen(16379,'127.0.0.1',function(){console.log('BIND_OK_16379');s.close();process.exit(0)});
setTimeout(function(){console.log('TIMEOUT');process.exit(1)},5000);
" 2>&1"""))

    # 10. Kill Redis, try Redis with NO config, just command line args
    run("pkill -9 -f 'redis-server' 2>/dev/null; sleep 1")
    print("\nREDIS_DIRECT_BIND:", run("""timeout 5 /home/u131951911/redis-server --port 6379 --bind 127.0.0.1 --save "" --appendonly no --daemonize no < /dev/null 2>&1 | head -10; echo 'EXIT:'$?"""))
    
    # 11. Try Redis with different bind
    print("REDIS_ANY_BIND:", run("""timeout 5 /home/u131951911/redis-server --port 6379 --save "" --appendonly no --daemonize no < /dev/null 2>&1 | head -10; echo 'EXIT:'$?"""))

    ssh.close()
except Exception as ex:
    print(f"ERR: {ex}")
