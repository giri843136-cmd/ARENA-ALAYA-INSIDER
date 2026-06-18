#!/usr/bin/env python3
"""Regenerate Prisma client with explicit DATABASE_URL, push, verify."""

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

# Read and upload updated schema.prisma with passwordHash
print("[1/5] Uploading updated schema.prisma...")
local_schema = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "prisma", "schema.prisma"
)
with open(local_schema) as f:
    schema_b64 = base64.b64encode(f.read().encode()).decode()
run("echo '" + schema_b64 + "' | base64 -d > " + DIR + "/prisma/schema.prisma && echo 'SCHEMA_OK'")
print("  OK")

# Generate with explicit URL
print("[2/5] Prisma generate with explicit DATABASE_URL...")
out, _ = run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export DATABASE_URL='" + db_url + "' && "
    "npx prisma generate 2>&1 && echo 'GEN_OK'",
    120
)
if "GEN_OK" in out:
    print("  OK")
else:
    print("  " + out[-300:])

# Push schema
print("[3/5] Prisma db push with explicit DATABASE_URL...")
out, _ = run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export DATABASE_URL='" + db_url + "' && "
    "npx prisma db push --accept-data-loss 2>&1 && echo 'PUSH_OK'",
    120
)
if "PUSH_OK" in out:
    print("  OK - schema synced")
else:
    print("  " + out[-300:])

# Write verify.js as base64 to avoid escaping
print("[4/5] Verifying tables...")
verify_js = """const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const t = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");
    console.log('TABLES: ' + t.length + '/5');
    t.forEach(x => console.log('  ' + x.table_name));
  } catch(e) { console.log('TE: ' + e.message.slice(0,200)); }
  try {
    const c = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");
    console.log('PWHASH: ' + (c.length > 0 ? 'YES' : 'NO'));
  } catch(e) { console.log('PE: ' + e.message.slice(0,200)); }
  await p.$disconnect();
})();
"""
verify_b64 = base64.b64encode(verify_js.encode()).decode()
run("echo '" + verify_b64 + "' | base64 -d > " + DIR + "/v.js && echo 'VJS_OK'")

out, _ = run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export DATABASE_URL='" + db_url + "' && "
    "node v.js 2>&1 && echo 'VERIFY_OK'",
    60
)
if "VERIFY_OK" in out:
    print(out)
else:
    print("  " + out[-300:])

run("rm -f " + DIR + "/v.js")

# Health
print("[5/5] Health check...")
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("  " + (out.strip()[:150] if out.strip() else "Offline"))

ssh.close()
