#!/usr/bin/env python3
"""Final attempt - run seed with Node v22 and proper env."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
DIR = "/home/u131951911/alaya-insider"
NVM_SETUP = "export NVM_DIR=$HOME/.nvm; [ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh; nvm use 22 2>/dev/null || true"

def run(ssh, cmd, timeout=180):
    print(f"$ {cmd[:120]}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8","replace")
    err = stderr.read().decode("utf-8","replace")
    return out, err, code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Verify Node v22
out, _, _ = run(ssh, f"{NVM_SETUP} && node --version && npx --version")
print(f"Node: {out.split(chr(10))[0].strip() if out.strip() else '(n/a)'}")

# Source .env file before running seed
cmd = (
    f"cd {DIR} && "
    f"{NVM_SETUP} && "
    f"set -a && "
    f"source .env 2>/dev/null && "
    f"set +a && "
    f"env | grep DATABASE_URL && "
    f"echo '---' && "
    f"echo 'Testing DB connection...' && "
    f"node -e \"require('net').connect({host:require('url').parse(process.env.DATABASE_URL || '').hostname || 'unknown', port:5432},()=>console.log('TCP_OK')).on('error',e=>console.log('TCP_ERR:'+e.message))\" 2>&1 && "
    f"echo '---' && "
    f"PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma db execute --stdin <<< 'SELECT 1' 2>&1 && "
    f"echo 'DB_OK'"
)
out, err, code = run(ssh, cmd, 60)
print(f"Connection test:\n{out[:500]}")

# Try the seed
print("\nRunning seed with Node v22 + sourced env...")
cmd2 = (
    f"cd {DIR} && "
    f"{NVM_SETUP} && "
    f"set -a && "
    f"source .env 2>/dev/null && "
    f"set +a && "
    f"PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && "
    f"echo '---GENOK---' && "
    f"PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && "
    f"echo '---SEEDOK---'"
)
out, err, code = run(ssh, cmd2, 300)
if "---SEEDOK---" in out:
    print("OK: Seed completed - password hash updated in database!")
elif "---GENOK---" in out:
    print("Prisma generated but seed had issues:")
    print(out[-500:])
else:
    print(f"Output:\n{out[-500:]}")
    if err.strip():
        print(f"Errors:\n{err[:500]}")

# Restart PM2
print("\nRestarting...")
out, _, _ = run(ssh, f"{NVM_SETUP} && cd {DIR} && npm install -g pm2 2>&1 && echo 'PM2_INSTALLED'", 60)
if "PM2_INSTALLED" in out:
    print("OK: pm2 installed globally")
    out2, _, _ = run(ssh, f"{NVM_SETUP} && cd {DIR} && pm2 restart alaya-insider 2>&1 && echo 'PM2OK'", 30)
    print(f"PM2 restart: {out2[:200]}")
else:
    # Just restart via process kill
    run(ssh, "pkill -f 'next-server' 2>/dev/null || true")
    run(ssh, f"cd {DIR} && {NVM_SETUP} && nohup npm start > /tmp/alaya.log 2>&1 & echo 'STARTED'")

time.sleep(8)
out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400")
print(f"\nHealth: {out[:300] if out.strip() else '(no response)'}")

print("\n" + "=" * 60)
if "---SEEDOK---" in out:
    print("ALL COMPLETE - Password updated successfully")
else:
    print("Password set in .env - seed needs manual attention")
print("=" * 60)
print(f"Admin: alayainsider@gmail.com")
print(f"Password: {NEW_PW}")
ssh.close()
