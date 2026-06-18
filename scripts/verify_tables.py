#!/usr/bin/env python3
"""Verify security tables via Prisma client with correct DATABASE_URL env var."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

def run(cmd, timeout=120):
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

# Get DB URL from .env
out, _ = run("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = out.strip()
print("DB URL: " + db_url[:60] + "...")

# Write verification JS file
verify_js = """const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('SECURITY TABLES: ' + tables.length + '/5');
    tables.forEach(t => console.log('  [OK] ' + t.table_name));
    if (tables.length === 5) console.log('ALL 5 TABLES PRESENT');
    else console.log((5 - tables.length) + ' tables missing');
  } catch(e) { console.log('ERR: ' + e.message.slice(0,300)); }
  try {
    const cols = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('passwordHash column: ' + (cols.length > 0 ? 'EXISTS' : 'MISSING'));
  } catch(e) { console.log('PW_ERR: ' + e.message.slice(0,200)); }
  await p.$disconnect();
})();
"""
run("cat > " + DIR + "/v.js << 'ENDOFJS'\n" + verify_js + "\nENDOFJS\n")
print("\nExecuting verification...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' node v.js 2>&1 && echo 'DONEOK'", 60)
print(out)
run("rm -f " + DIR + "/v.js")

# Final health
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("Health: " + (out.strip()[:150] if out.strip() else "Offline"))

ssh.close()
