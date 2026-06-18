#!/usr/bin/env python3
"""Run SQL migration - simplest approach: write file via stdin on SSH channel."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

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

# Write SQL file using cat with stdin
print("Writing file via SSH stdin...")
transport = ssh.get_transport()
channel = transport.open_session()
channel.exec_command("cat > " + DIR + "/prisma/migrations/migration_add_security.sql")
channel.send(sql)
channel.shutdown_write()
exit_code = channel.recv_exit_status()
print("Write exit code: " + str(exit_code))

# Verify
stdin, stdout, stderr = ssh.exec_command("wc -c " + DIR + "/prisma/migrations/migration_add_security.sql 2>/dev/null && echo 'FILE_OK' || echo 'MISSING'")
code = stdout.channel.recv_exit_status()
out = stdout.read().decode("utf-8","replace")
if "FILE_OK" in out:
    print("File: " + out.strip()[:80])
else:
    print("File write failed")
    ssh.close()
    sys.exit(1)

# Run migration via Prisma db execute
print("\n[1/2] Running SQL migration...")
cmd = "cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && cat prisma/migrations/migration_add_security.sql | npx prisma db execute --stdin 2>&1 && echo 'EXEC_OK'"
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
code = stdout.channel.recv_exit_status()
out = stdout.read().decode("utf-8","replace")
err = stderr.read().decode("utf-8","replace")

if "EXEC_OK" in out:
    print("OK: Migration executed")
elif "already exists" in out.lower():
    print("OK: Tables already exist (idempotent)")
else:
    print("Migration: " + out[-400:])
    if err.strip():
        print("Errors: " + err[:200])

# Prisma migrate deploy
print("\n[2/2] Prisma migrate deploy...")
stdin, stdout, stderr = ssh.exec_command("cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'MIGRATE_OK'", timeout=60)
code = stdout.channel.recv_exit_status()
out = stdout.read().decode("utf-8","replace")
if "MIGRATE_OK" in out:
    print("OK: Migrate deploy done")
else:
    print("Migrate: " + out[:300])

# Prisma generate
ssh.exec_command("cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1")

# Verify tables
print("\nVerifying tables...")
vcmd = ("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && "
    + "node -e 'const{P}=require(\"@prisma/client\");const p=new P();"
    + "(async()=>{try{const r=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int FROM information_schema.tables "
    + "WHERE table_schema=\\'public\\' AND table_name IN(\\'TwoFactorAuth\\',\\'BackupCode\\',"
    + "\\'LoginAttempt\\',\\'DelegatedAccess\\',\\'SecurityAuditLog\\')\");"
    + "console.log(\"Tables: \"+r[0].count+\"/5\");"
    + "const c=await p.$queryRawUnsafe(\"SELECT COUNT(*)::int FROM information_schema.columns "
    + "WHERE table_name=\\'User\\' AND column_name=\\'passwordHash\\'\");"
    + "console.log(\"passwordHash: \"+(c[0].count>0?\"EXISTS\":\"MISSING\"));"
    + "await p.$disconnect()}catch(e){console.log(\"E: \"+e.message);await p.$disconnect()}})()' "
    + "2>&1 && echo 'VERIFY_OK'")
stdin, stdout, stderr = ssh.exec_command(vcmd, timeout=60)
code = stdout.channel.recv_exit_status()
out = stdout.read().decode("utf-8","replace")
if "VERIFY_OK" in out:
    print(out.strip())
else:
    print("Verify: " + out[:200])

# Health
stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200", timeout=15)
out = stdout.read().decode("utf-8","replace")
print("\nHealth: " + (out[:150] if out.strip() else "App offline"))

print("\nMigration complete.")
ssh.close()
