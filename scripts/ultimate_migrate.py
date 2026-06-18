#!/usr/bin/env python3
"""Clean migration runner - uses paramiko, no inline JS escaping issues."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

def run(cmd, timeout=60):
    c = ssh.get_transport().open_session()
    c.settimeout(timeout)
    c.exec_command(cmd)
    out = c.recv(32768).decode("utf-8","replace")
    code = c.recv_exit_status()
    return out, code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Get DB URL
out, _ = run("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = out.strip()
print("DB URL: " + db_url[:60] + "...")

# Prisma generate
print("\n[1/3] Prisma generate...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma generate 2>&1 && echo 'GENOK'", 120)
if "GENOK" in out: print("OK")
else: print(out[-200:])

# Prisma db push
print("[2/3] Prisma db push...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma db push --accept-data-loss 2>&1 && echo 'PUSHOK'", 120)
if "PUSHOK" in out: print("OK - Schema synced")
else: print(out[-300:])

# Verify tables
print("[3/3] Verify tables...")
verify_js = "const{P}=require('@prisma/client');const p=new P({datasources:{db:{url:process.env.U}}});(async()=>{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog')\");console.log('TABLES:'+t.length+'/5');t.forEach(x=>console.log(x.table_name));const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('PWHASH:'+(c.length>0?'YES':'NO'));await p.$disconnect()})()"
# Write JS to file to avoid escaping
run("cat > " + DIR + "/v.js << 'ENDOFJS'\n" + verify_js + "\nENDOFJS\n")
out, _ = run("cd " + DIR + " && " + EXP + " && U='" + db_url + "' node v.js 2>&1 && echo 'DONEOK'", 60)
print(out)
run("rm -f " + DIR + "/v.js")

# Health
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
print("\nHealth: " + (out[:150] if out.strip() else "Offline"))

ssh.close()
print("\nDone.")
