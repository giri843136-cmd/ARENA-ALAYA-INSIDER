#!/usr/bin/env python3
"""Use prisma db push to sync schema + run extra SQL via inline env vars."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

with open(os.path.join(PROJ, "prisma", "migrations", "migration_add_security.sql")) as f:
    sql_b64 = base64.b64encode(f.read().encode()).decode()

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Read DB URL from .env on VPS first
ch = ssh.get_transport().open_session()
ch.exec_command("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = ch.recv(4096).decode("utf-8","replace").strip()
print(f"DB URL: {db_url[:60]}...")

# Step 1: Prisma generate
print("\n[1/4] Prisma generate with explicit DB URL...")
ch = ssh.get_transport().open_session()
ch.settimeout(120)
ch.exec_command("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma generate 2>&1 && echo 'GEN_OK'")
out = ch.recv(8192).decode("utf-8","replace")
print(out[-200:] if 'GEN_OK' in out else out[-300:])

# Step 2: Prisma db push (direct schema sync)
print("\n[2/4] Prisma db push...")
ch = ssh.get_transport().open_session()
ch.settimeout(120)
ch.exec_command("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma db push --accept-data-loss 2>&1 && echo 'PUSH_OK'")
out = ch.recv(16384).decode("utf-8","replace")
if 'PUSH_OK' in out:
    print("OK: Schema pushed to database")
else:
    print(out[-400:])

# Step 3: Run custom SQL via Node with explicit env vars
print("\n[3/4] Running custom SQL migration...")
ch = ssh.get_transport().open_session()
ch.settimeout(120)
js = "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient({datasources:{db:{url:process.env.DB_URL}}});const sql=Buffer.from('" + sql_b64 + "','base64').toString();(async()=>{try{await p.$executeRawUnsafe(sql);console.log('SQL_OK')}catch(e){console.log('ERR:'+e.message.slice(0,200))};try{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog')\");console.log('TABLES:'+t.length+'/5');t.forEach(x=>console.log('- '+x.table_name));const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('PWHASH:'+(c.length>0?'EXISTS':'MISSING'))}catch(e){console.log('V_ERR:'+e.message.slice(0,200))};await p.$disconnect()})()"
ch.exec_command("cd " + DIR + " && " + EXP + " && DB_URL='" + db_url + "' node -e '" + js + "' 2>&1 && echo 'JS_DONE'")
out = ch.recv(8192).decode("utf-8","replace")
print(out)

# Step 4: Health
print("\n[4/4] Health check...")
ch = ssh.get_transport().open_session()
ch.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
h = ch.recv(4096).decode("utf-8","replace")
print(h[:150] if h.strip() else "App offline")

ssh.close()
print("\nMigration complete.")
