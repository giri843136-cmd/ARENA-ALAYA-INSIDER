#!/usr/bin/env python3
"""Execute SQL migration using lightweight Node.js + Prisma client."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = "export PATH=" + N22 + ":/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

# Read SQL content
sql_path = os.path.join(PROJ, "prisma", "migrations", "migration_add_security.sql")
with open(sql_path, "r") as f:
    sql = f.read()
sql_b64 = base64.b64encode(sql.encode()).decode()
print("SQL: " + str(len(sql)) + " chars")

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Create a small Node.js script to execute the SQL via Prisma client
# This is much lighter than prisma db execute CLI
js_script = '''
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const sql = Buffer.from("SQL_BASE64", "base64").toString();
(async () => {
  try {
    const r = await p.$executeRawUnsafe(sql);
    console.log("SQL executed, rows affected:", r);
    
    // Verify tables
    const tables = await p.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name"
    );
    console.log("Tables found:", tables.length + "/5 - " + tables.map(t=>t.table_name).join(", "));
    
    const cols = await p.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'"
    );
    console.log("passwordHash:", cols.length > 0 ? "EXISTS" : "MISSING");
    
    await p.$disconnect();
  } catch(e) {
    console.log("Error:", e.message.slice(0, 200));
    await p.$disconnect();
  }
})();
'''.replace("SQL_BASE64", sql_b64)

# Write script via SSH stdin
print("\n[1/2] Running SQL migration via Node.js (lighter than prisma CLI)...")
transport = ssh.get_transport()
channel = transport.open_session()
channel.exec_command("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && node -e '" + js_script.replace("'", "'\\''") + "' 2>&1 && echo 'RUN_OK'")

# Can't use complex inline script with escaped quotes. Let me write to a file instead.
# Write the JS file via the channel's stdin
print("Writing JS script to VPS via stdin...")
script_content = '''
const { PrismaClient } = require("@prisma/client");
const sql = Buffer.from("SQL_B64", "base64").toString();
const p = new PrismaClient();
(async () => {
  try {
    const r = await p.$executeRawUnsafe(sql);
    console.log("SQL executed, rows:", r);
    const t = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log("Tables:", t.length + "/5 -", t.map(x=>x.table_name).join(", "));
    const c = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log("passwordHash:", c.length > 0 ? "EXISTS" : "MISSING");
    await p.$disconnect();
  } catch(e) {
    console.log("Error:", e.message.slice(0,300));
    await p.$disconnect();
  }
})();
'''.replace("SQL_B64", sql_b64)

ch2 = transport.open_session()
ch2.exec_command("cat > " + DIR + "/run_migration.js")
ch2.send(script_content)
ch2.shutdown_write()
code = ch2.recv_exit_status()
print("Write JS script: exit " + str(code))

# Run the JS script
print("Executing migration script...")
ch3 = transport.open_session()
ch3.exec_command("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && " + N22 + "/node run_migration.js 2>&1 && echo 'RUN_OK'")
ch3.shutdown_write()
out = ch3.recv(8192).decode("utf-8","replace")
err = ch3.recv_stderr(4096).decode("utf-8","replace")
code = ch3.recv_exit_status()

if "RUN_OK" in out:
    print("Migration via Node.js: OK")
    print(out)
else:
    print("Migration output:")
    print(out[-600:])
    if err.strip():
        print("Stderr:")
        print(err[:300])

# Step 2: Prisma migrate deploy
print("\n[2/2] Prisma migrate deploy...")
stdin, stdout, stderr = ssh.exec_command("cd " + DIR + " && " + EXP + " && npx prisma migrate deploy 2>&1 && echo 'MIGRATE_OK'", timeout=60)
code = stdout.channel.recv_exit_status()
out = stdout.read().decode("utf-8","replace")
if "MIGRATE_OK" in out:
    print("OK: Prisma migrate deploy completed")
else:
    print("Prisma migrate: " + out[:300])

# Prisma generate
ssh.exec_command("cd " + DIR + " && " + EXP + " && npx prisma generate 2>&1")

# Health
stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200", timeout=15)
out = stdout.read().decode("utf-8","replace")
print("\nHealth: " + (out[:150] if out.strip() else "App offline"))

print("\nMigration process complete.")
ssh.close()
