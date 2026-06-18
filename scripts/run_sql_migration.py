#!/usr/bin/env python3
"""Run the security SQL migration on the production database."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJECT_ROOT = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

# Read the migration SQL content locally
sql_path = os.path.join(PROJECT_ROOT, "prisma", "migrations", "migration_add_security.sql")
with open(sql_path, "r") as f:
    sql_content = f.read()
print("Read migration SQL (" + str(len(sql_content)) + " chars)")

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Upload the SQL file to VPS via SFTP
print("Uploading migration file...")
sftp = ssh.open_sftp()
remote_path = DIR + "/prisma/migrations/migration_add_security.sql"
sftp.put(sql_path, remote_path)
sftp.close()
print("Uploaded")

# Run migration via Prisma db execute with stdin
print("\n[1/2] Running SQL migration via Prisma db execute...")
cmd = "cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && cat prisma/migrations/migration_add_security.sql | npx prisma db execute --stdin 2>&1 && echo 'EXEC_OK'"
out, err, code = run(ssh, cmd, 120)
if "EXEC_OK" in out:
    print("OK: Migration executed successfully")
elif "already exists" in out.lower():
    print("OK: Tables already exist (idempotent)")
else:
    print("Migration output: " + out[:500])
    print("Migration errors: " + err[:200])

# Run Prisma migrate deploy
print("\n[2/2] Running Prisma migrate deploy...")
out, _, _ = run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'MIGRATE_OK'", 60)
if "MIGRATE_OK" in out:
    print("OK: Prisma migrate deploy completed")
else:
    print("Prisma migrate: " + out[:300])

# Prisma generate
run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1")

# Verify tables
print("\nVerifying security tables...")
vcmd = ("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && "
    "node -e 'const{PrismaClient}=require(\"@prisma/client\");const p=new PrismaClient();"
    "(async()=>{try{const r=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables "
    "WHERE table_schema=''public'' AND table_name IN(''TwoFactorAuth'',''BackupCode'',"
    "''LoginAttempt'',''DelegatedAccess'',''SecurityAuditLog'') ORDER BY table_name\");"
    "console.log(\"Tables:\"+r.map(t=>t.table_name).join(\",\"));"
    "console.log(\"Count:\"+r.length+\"/5\");"
    "await p.$disconnect()}catch(e){console.log(\"Error:\"+e.message);await p.$disconnect()}})()' "
    "2>&1 && echo 'VERIFY_OK'")
out, _, _ = run(ssh, vcmd, 60)
if "VERIFY_OK" in out:
    print("OK: " + out.strip())
else:
    print("Verify: " + out[:200])

# Check passwordHash column
pwcmd = ("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && "
    "node -e 'const{PrismaClient}=require(\"@prisma/client\");const p=new PrismaClient();"
    "(async()=>{try{const r=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns "
    "WHERE table_name=''User'' AND column_name=''passwordHash''\");"
    "console.log(\"passwordHash:\"+(r.length>0?\"EXISTS\":\"MISSING\"));"
    "await p.$disconnect()}catch(e){console.log(\"Error:\"+e.message);await p.$disconnect()}})()' "
    "2>&1 && echo 'PW_OK'")
out, _, _ = run(ssh, pwcmd, 30)
if "PW_OK" in out:
    print(out.strip())
else:
    print("passwordHash: " + out.strip()[:80])

out, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
print("\nHealth: " + out[:150] if out.strip() else "App offline")

print("\nSecurity migration complete.")
ssh.close()
