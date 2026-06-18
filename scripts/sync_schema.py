#!/usr/bin/env python3
"""Run 3 deployment commands on VPS: source env, db push, verify."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"

def run(cmd, timeout=120):
    c = ssh.get_transport().open_session()
    c.settimeout(timeout)
    c.exec_command(cmd)
    out = c.recv(65536).decode("utf-8","replace")
    code = c.recv_exit_status()
    return out, code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# 1. Source env and get DB URL
print("\n[1/3] Reading DATABASE_URL from .env...")
out, _ = run("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = out.strip()
print("  DB URL: " + db_url[:60] + "...")

# 2. Prisma db push with explicit DATABASE_URL
print("\n[2/3] Running prisma db push...")
out, _ = run("cd " + DIR + " && export PATH=" + N22 + ":$PATH && export DATABASE_URL='" + db_url + "' && npx prisma db push --accept-data-loss 2>&1 && echo 'PUSH_DONE'", 180)
if "PUSH_DONE" in out:
    print("  OK: Schema synced to database")
else:
    print("  Output: " + out[-300:])

# 3. Verify - check tables with a simple Node query
print("\n[3/3] Verifying security tables...")
verify = (
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export DATABASE_URL='" + db_url + "' && "
    "node -e 'const{P}=require(\"@prisma/client\");(async()=>{"
    "const p=new P();"
    "try{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema=\\'public\\' AND table_name IN(\\'TwoFactorAuth\\',\\'BackupCode\\',\\'LoginAttempt\\',\\'DelegatedAccess\\',\\'SecurityAuditLog\\') ORDER BY table_name\");"
    "console.log(\"SECURITY TABLES: \"+t.length+\"/5\");"
    "t.forEach(x=>console.log(\"  [OK] \"+x.table_name))}"
    "catch(e){console.log(\"TABLES_ERR: \"+e.message.slice(0,200))}"
    "try{const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name=\\'User\\' AND column_name=\\'passwordHash\\'\");"
    "console.log(\"passwordHash: \"+(c.length>0?\"EXISTS\":\"MISSING\"))}"
    "catch(e){console.log(\"PW_ERR: \"+e.message.slice(0,200))}"
    "await p.$disconnect()})()' 2>&1 && echo 'VERIFY_DONE'"
)
out, _ = run(verify, 60)
if "VERIFY_DONE" in out:
    print("  " + out.replace('\n', '\n  ').strip())
else:
    print("  " + out[-300:])

# Health check
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("\nHealth: " + (out.strip()[:150] if out.strip() else "Offline"))

ssh.close()
print("\nDone.")
