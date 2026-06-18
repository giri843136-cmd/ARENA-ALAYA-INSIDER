#!/usr/bin/env python3
"""Final migration: generate Prisma client, execute SQL migration."""

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

def run(cmd, timeout=120):
    c = ssh.get_transport().open_session()
    c.settimeout(timeout)
    c.exec_command(cmd)
    out = c.recv(16384).decode("utf-8","replace")
    code = c.recv_exit_status()
    return out, code

# Step 1: Prisma generate
print("[1/4] Prisma generate...")
out, code = run("cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1 && echo 'GEN_OK'", 120)
print(out[-200:] if 'GEN_OK' in out else out[-300:])

# Step 2: Run migrate deploy 
print("\n[2/4] Prisma migrate deploy...")
out, code = run("cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'DEPLOY_OK'", 120)
if 'DEPLOY_OK' in out:
    print("OK: Migrations deployed")
else:
    print(out[-300:])

# Step 3: Execute SQL via prisma db push or db execute
print("\n[3/4] Pushing SQL directly...")
run("cd " + DIR + " && echo '" + sql_b64 + "' | base64 -d > " + DIR + "/_migrate.sql && echo 'SQL_WRITTEN'")
out, code = run("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && cat _migrate.sql | npx prisma db execute --stdin 2>&1 && echo 'EXEC_OK'", 120)
if 'EXEC_OK' in out:
    print("OK: SQL executed")
elif 'already exists' in out.lower():
    print("OK: Tables already exist")
else:
    print(out[-400:])
    # Alternative: Use Node.js with proper PrismaClient
    js = "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();const sql=require('fs').readFileSync('" + DIR + "/_migrate.sql','utf8');(async()=>{try{await p.$executeRawUnsafe(sql);console.log('SQL_OK')}catch(e){console.log('ERR:'+e.message.slice(0,200))};try{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog')\");console.log('TABLES:'+t.length+'/5 '+t.map(x=>x.table_name).join(','));const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('PWHASH:'+(c.length>0?'EXISTS':'MISSING'))}catch(e){console.log('V_ERR:'+e.message.slice(0,200))};await p.$disconnect()})()"
    # Write JS to file to avoid quote escaping issues
    run("cat > " + DIR + "/_run.js << 'JSEOF'\n" + js + "\nJSEOF\n")
    out, code = run("cd " + DIR + " && " + EXP + " && node _run.js 2>&1 && echo 'JS_DONE'", 60)
    print(out)

# Step 4: Health  
print("\n[4/4] Health check...")
out, code = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200", 15)
print(out[:150] if out.strip() else "App offline")

# Cleanup
run("rm -f " + DIR + "/_migrate.sql " + DIR + "/_run.js " + DIR + "/migration.js")
ssh.close()
print("\nDone.")
