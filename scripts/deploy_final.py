#!/usr/bin/env python3
"""Deploy updated schema with passwordHash. Generate, db push, verify tables."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

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

# Get DB URL
out, _ = run("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = out.strip()

# 1. Update schema file on VPS
print("[1/4] Updating schema.prisma on VPS...")
# Read local schema
with open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "schema.prisma")) as f:
    schema = f.read()
# Write via SSH stdin
import base64
schema_b64 = base64.b64encode(schema.encode()).decode()
run("echo '" + schema_b64 + "' | base64 -d > " + DIR + "/prisma/schema.prisma")
print("  OK")

# 2. Prisma generate
print("[2/4] Prisma generate...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma generate 2>&1 && echo 'GENOK'", 120)
print("  " + ("OK" if "GENOK" in out else "FAILED: " + out[-200:]))

# 3. Prisma db push
print("[3/4] Prisma db push...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma db push --accept-data-loss 2>&1 && echo 'PUSHOK'", 120)
if "PUSHOK" in out:
    print("  OK")
else:
    print("  " + out[-300:].replace('\n',' '))

# 4. Verify tables
print("[4/4] Verify security tables...")
verify_js = """const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('TABLES: ' + tables.length + '/5');
    tables.forEach(t => console.log('  [OK] ' + t.table_name));
    if (tables.length === 5) console.log('ALL 5 SECURITY TABLES PRESENT');
  } catch(e) { console.log('ERR: ' + e.message.slice(0,300)); }
  try {
    const cols = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('PWHASH: ' + (cols.length > 0 ? 'YES' : 'NO'));
    if (cols.length > 0) console.log('passwordHash COLUMN EXISTS');
  } catch(e) { console.log('PW_ERR: ' + e.message.slice(0,200)); }
  await p.$disconnect();
})();
"""
run("cat > " + DIR + "/v.js << 'ENDOFJS'\n" + verify_js + "\nENDOFJS\n")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' node v.js 2>&1 && echo 'DONEOK'", 60)
print(out)
run("rm -f " + DIR + "/v.js")

# Health
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("Health: " + (out.strip()[:150] if out.strip() else "Offline"))
ssh.close()
