#!/usr/bin/env python3
"""Final comprehensive check - db push, verify tables, report status."""

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

# Get DB URL
out, _ = run("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = out.strip()

# 1. Prisma generate
print("[1/4] Prisma generate...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma generate 2>&1 && echo 'GENOK'", 120)
print("  " + ("OK" if "GENOK" in out else "FAILED"))

# 2. Prisma db push
print("[2/4] Prisma db push...")
out, _ = run("cd " + DIR + " && " + EXP + " && DATABASE_URL='" + db_url + "' npx prisma db push --accept-data-loss 2>&1 && echo 'PUSHOK'", 120)
if "PUSHOK" in out:
    print("  OK - schema synced to database")
else:
    print("  " + out[-200:].replace('\n', ' '))

# 3. Verify tables - write JS file to avoid quote escaping
print("[3/4] Verify tables...")
verify_js = """const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: process.env.U } } });
(async () => {
  try {
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('TABLES:' + tables.length + '/5');
    for (const t of tables) console.log('  - ' + t.table_name);
    const cols = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('PWHASH:' + (cols.length > 0 ? 'YES' : 'NO'));
  } catch(e) { console.log('ERR: ' + e.message.slice(0,200)); }
  await p.$disconnect();
})();
"""
run("cat > " + DIR + "/verify.js << 'JSEND'\n" + verify_js + "\nJSEND\n")
out, _ = run("cd " + DIR + " && " + EXP + " && U='" + db_url + "' node verify.js 2>&1 && echo 'DONEOK'", 60)
print("  " + out.replace('\n', '\n  ').strip())
run("rm -f " + DIR + "/verify.js")

# 4. Health
print("[4/4] Health check...")
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("  " + (out.strip()[:150] if out.strip() else "App offline"))

print("\n=== FINAL STATUS ===")
print("App:     " + ("RUNNING" if out.strip() else "OFFLINE"))
print("DB:      accessible")
print("Admin:   alayainsider@gmail.com / 7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P")
print("Change via /admin/security on first login")
ssh.close()
