#!/usr/bin/env python3
"""Query Neon DB directly via pg module to verify security tables."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"

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
print("DB: " + db_url[:60] + "...")

# Use pg module (lighter than PrismaClient) to query
check_js = """const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.U });
(async () => {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('=== SECURITY TABLES ===');
    console.log('FOUND: ' + res.rows.length + '/5');
    res.rows.forEach(r => console.log('  [OK] ' + r.table_name));
    if (res.rows.length < 5) {
      console.log('MISSING: ' + (5 - res.rows.length) + ' table(s)');
    }
    const col = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('');
    console.log('=== passwordHash COLUMN ===');
    console.log(col.rows.length > 0 ? '  [OK] EXISTS' : '  [MISSING]');
    await pool.end();
  } catch(e) {
    console.log('ERROR: ' + e.message.slice(0,300));
    await pool.end();
  }
})();
"""
check_b64 = base64.b64encode(check_js.encode()).decode()
run("echo '" + check_b64 + "' | base64 -d > " + DIR + "/chk.js && echo 'JS_OK'")

out, _ = run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export U='" + db_url + "' && "
    "node chk.js 2>&1 && echo 'DONEOK'",
    60
)
print("\n" + out)

run("rm -f " + DIR + "/chk.js")

# Health
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("Health: " + (out.strip()[:150] if out.strip() else "Offline"))

ssh.close()
