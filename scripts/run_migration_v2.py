#!/usr/bin/env python3
"""Run migration - use base64 to transfer SQL file, then execute via Prisma."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

# Read and base64-encode SQL
sql_path = os.path.join(PROJ, "prisma", "migrations", "migration_add_security.sql")
with open(sql_path, "r") as f:
    sql_content = f.read()
sql_b64 = base64.b64encode(sql_content.encode()).decode()
print("SQL: " + str(len(sql_content)) + " chars, base64: " + str(len(sql_b64)) + " chars")

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Write file via base64 decode
print("Writing migration file via base64...")
# Split base64 into chunks if needed (max cmd length)
chunk_size = 1000
if len(sql_b64) > chunk_size:
    # Write in chunks using append
    first = sql_b64[:chunk_size]
    rest = sql_b64[chunk_size:]
    run(ssh, "echo '" + first + "' | base64 -d > " + DIR + "/prisma/migrations/migration_add_security.sql")
    for i in range(0, len(rest), chunk_size):
        chunk = rest[i:i+chunk_size]
        run(ssh, "echo '" + chunk + "' | base64 -d >> " + DIR + "/prisma/migrations/migration_add_security.sql")
else:
    run(ssh, "echo '" + sql_b64 + "' | base64 -d > " + DIR + "/prisma/migrations/migration_add_security.sql")

# Verify
out, _, _ = run(ssh, "wc -c " + DIR + "/prisma/migrations/migration_add_security.sql 2>/dev/null && echo 'FILE_OK' || echo 'FILE_MISSING'")
if "FILE_OK" in out:
    print("File written: " + out.strip()[:80])
else:
    print("File write failed")
    ssh.close()
    sys.exit(1)

# Run the SQL migration
print("\n[1/2] Running SQL migration via Prisma db execute...")
cmd = "cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && cat prisma/migrations/migration_add_security.sql | npx prisma db execute --stdin 2>&1 && echo 'EXEC_OK'"
out, err, code = run(ssh, cmd, 120)
if "EXEC_OK" in out:
    print("OK: Migration executed")
elif "already exists" in out.lower():
    print("OK: Tables already exist (idempotent)")
else:
    print("Migration: " + out[-400:])

# Prisma migrate deploy
print("\n[2/2] Prisma migrate deploy...")
out, _, _ = run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'MIGRATE_OK'", 60)
if "MIGRATE_OK" in out:
    print("OK: Migrate deploy done")
else:
    print("Migrate: " + out[:300])

run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1")

# Verify tables
print("\nVerifying...")
vcmd = ("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && "
    + "node -e 'const{P}=require(\"@prisma/client\");const p=new P();"
    + "(async()=>{try{const r=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int FROM information_schema.tables "
    + "WHERE table_schema=\\'public\\' AND table_name IN(\\'TwoFactorAuth\\',\\'BackupCode\\',"
    + "\\'LoginAttempt\\',\\'DelegatedAccess\\',\\'SecurityAuditLog\\')\");"
    + "console.log(\"Security tables: \"+r[0].count+\"/5\");"
    + "const c=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int FROM information_schema.columns "
    + "WHERE table_name=\\'User\\' AND column_name=\\'passwordHash\\'\");"
    + "console.log(\"passwordHash: \"+(c[0].count>0?\"EXISTS\":\"MISSING\"));"
    + "await p.$disconnect()}catch(e){console.log(\"E: \"+e.message);await p.$disconnect()}})()' "
    + "2>&1 && echo 'VERIFY_OK'")
out, _, _ = run(ssh, vcmd, 60)
if "VERIFY_OK" in out:
    print(out.strip())
else:
    print("Verify: " + out[:200])

# Health
h, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
print("\nHealth: " + (h[:150] if h.strip() else "App offline"))

print("\nMigration complete.")
ssh.close()
