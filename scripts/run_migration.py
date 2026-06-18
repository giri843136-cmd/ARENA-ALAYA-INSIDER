#!/usr/bin/env python3
"""Run SQL migration. Writes file via heredoc to avoid SFTP issues."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

# Read SQL
sql_path = os.path.join(PROJ, "prisma", "migrations", "migration_add_security.sql")
with open(sql_path, "r") as f:
    sql = f.read()
print("SQL: " + str(len(sql)) + " chars")

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Write SQL file via heredoc to avoid SFTP
print("Writing migration file to VPS...")
write_cmd = "cat > " + DIR + "/prisma/migrations/migration_add_security.sql << 'SQLEOF'\n" + sql + "\nSQLEOF\n"
stdin, stdout, stderr = ssh.exec_command(write_cmd, timeout=30)
stdin.write(sql)
stdin.channel.shutdown_write()
code = stdout.channel.recv_exit_status()
print("Write done (exit: " + str(code) + ")")

# Verify file exists
out, _, _ = run(ssh, "wc -c " + DIR + "/prisma/migrations/migration_add_security.sql 2>/dev/null || echo 'MISSING'")
print("File: " + out.strip()[:80])

# Run migration
print("\n[1/2] Running migration...")
cmd = "cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && cat prisma/migrations/migration_add_security.sql | npx prisma db execute --stdin 2>&1 && echo 'EXEC_OK'"
out, err, code = run(ssh, cmd, 120)
if "EXEC_OK" in out:
    print("OK: Migration executed")
elif "already exists" in out.lower():
    print("OK: Tables already exist")
else:
    print("Out: " + out[-400:])
    print("Err: " + err[:200])

# Prisma migrate deploy
print("\n[2/2] Prisma migrate deploy...")
out, _, _ = run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'MIGRATE_OK'", 60)
if "MIGRATE_OK" in out:
    print("OK: Prisma migrate deploy done")
else:
    print(out[:300])

run(ssh, "cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1")

# Verify
print("\nVerifying...")
out, _, _ = run(ssh, "cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && node -e "
    + "'const{PrismaClient}=require(\"@prisma/client\");const p=new PrismaClient();"
    + "(async()=>{try{const r=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int as cnt FROM information_schema.tables "
    + "WHERE table_schema=\\'public\\' AND table_name IN(\\'TwoFactorAuth\\',\\'BackupCode\\',"
    + "\\'LoginAttempt\\',\\'DelegatedAccess\\',\\'SecurityAuditLog\\')\");"
    + "console.log(\"Security tables found: \"+r[0].cnt+\"/5\");"
    + "const c=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int as cnt FROM information_schema.columns "
    + "WHERE table_name=\\'User\\' AND column_name=\\'passwordHash\\'\");"
    + "console.log(\"passwordHash column: \"+(c[0].cnt>0?\"EXISTS\":\"MISSING\"));"
    + "await p.$disconnect()}catch(e){console.log(\"Error: \"+e.message);await p.$disconnect()}})()' "
    + "2>&1 && echo 'VERIFY_OK'", 60)
if "VERIFY_OK" in out:
    print(out.strip())
else:
    print("Verify: " + out[:200])

# Health
h, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
print("\nHealth: " + h[:150] if h.strip() else "App offline")
print("\nMigration complete.")
ssh.close()
