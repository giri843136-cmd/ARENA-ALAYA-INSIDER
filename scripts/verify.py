#!/usr/bin/env python3
"""Write verify.js to VPS, execute, report security tables + passwordHash."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Get DB URL
c = ssh.get_transport().open_session()
c.exec_command("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = c.recv(4096).decode().strip()

# Write verify.js file
verify_js = """const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('SECURITY TABLES: ' + tables.length + '/5');
    tables.forEach(t => console.log('  [OK] ' + t.table_name));
  } catch(e) { console.log('TABLES_ERR: ' + e.message.slice(0,200)); }
  try {
    const cols = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('passwordHash COLUMN: ' + (cols.length > 0 ? 'EXISTS' : 'MISSING'));
  } catch(e) { console.log('PW_ERR: ' + e.message.slice(0,200)); }
  await p.$disconnect();
})();
"""
js_b64 = base64.b64encode(verify_js.encode()).decode()
c = ssh.get_transport().open_session()
c.exec_command("echo '" + js_b64 + "' | base64 -d > " + DIR + "/verify.js && echo 'JS_WRITTEN'")
out = c.recv(4096).decode()

# Run it with explicit DATABASE_URL
print("Verifying security tables...")
c = ssh.get_transport().open_session()
c.settimeout(60)
c.exec_command("cd " + DIR + " && export PATH=" + N22 + ":$PATH && export DATABASE_URL='" + db_url + "' && node verify.js 2>&1 && echo 'VERIFY_DONE'")
out = c.recv(8192).decode("utf-8","replace")
print(out)

# Cleanup
ssh.exec_command("rm -f " + DIR + "/verify.js")

# Health
c = ssh.get_transport().open_session()
c.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
h = c.recv(4096).decode("utf-8","replace")
print("Health: " + (h.strip()[:150] if h.strip() else "Offline"))

ssh.close()
