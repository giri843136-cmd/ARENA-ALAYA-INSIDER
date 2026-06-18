#!/usr/bin/env python3
"""Stop app, run db push with real DB URL, verify, restart."""

import paramiko, os, sys, base64, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"

def run(cmd, timeout=120):
    c = ssh.get_transport().open_session()
    c.settimeout(timeout)
    c.exec_command(cmd)
    out = b""
    while True:
        if c.recv_ready():
            out += c.recv(65536)
        elif c.exit_status_ready():
            break
        time.sleep(0.3)
    code = c.recv_exit_status()
    return out.decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Get real DB URL
c = ssh.get_transport().open_session()
c.exec_command("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = c.recv(4096).decode().strip()

# Step 1: Stop app to free memory
print("[1/5] Stopping app to free resources...")
run("pkill -9 -f next-server 2>/dev/null; pkill -9 -f 'node.*3000' 2>/dev/null; sleep 2")
print("  App stopped")

# Step 2: Update schema file on VPS with passwordHash
print("[2/5] Updating schema.prisma...")
local_schema = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "schema.prisma")
with open(local_schema) as f:
    schema_b64 = base64.b64encode(f.read().encode()).decode()
run("echo '" + schema_b64 + "' | base64 -d > " + DIR + "/prisma/schema.prisma && echo 'SCHEMA_OK'")
print("  OK")

# Step 3: Prisma db push with real DB URL (no generate needed, client already exists)
print("[3/5] Prisma db push with REAL Neon DB URL...")
out, code = run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "export DATABASE_URL='" + db_url + "' && "
    "npx prisma db push --accept-data-loss 2>&1 && echo 'PUSH_DONE'",
    180
)
if "PUSH_DONE" in out:
    print("  OK - Schema synced to Neon DB")
else:
    print("  " + out[-400:])

# Step 4: Verify tables using pg
print("[4/5] Verifying tables...")
verify_js = "const{Pool}=require('pg');const p=new Pool({connectionString:process.env.U});(async()=>{try{const r=await p.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name\");console.log('TABLES:'+r.rows.length+'/5');r.rows.forEach(x=>console.log('-'+x.table_name));const c=await p.query(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('PWHASH:'+(c.rows.length>0?'YES':'NO'))}catch(e){console.log('ERR:'+e.message.slice(0,200))};await p.end()})()"
verify_b64 = base64.b64encode(verify_js.encode()).decode()
run("echo '" + verify_b64 + "' | base64 -d > " + DIR + "/_v.js && echo 'VOK'")
out, _ = run("cd " + DIR + " && export PATH=" + N22 + ":$PATH && export U='" + db_url + "' && node _v.js 2>&1 && echo 'VERIFY_DONE'", 60)
if "VERIFY_DONE" in out:
    print("  " + out.replace('\n', '\n  ').strip())
else:
    # Fallback: try reading the full output differently
    lines = [l for l in out.split('\n') if l.strip() and 'VOK' not in l and 'WROTE' not in l]
    for l in lines:
        print("  " + l)
run("rm -f " + DIR + "/_v.js")

# Step 5: Restart app
print("[5/5] Restarting app...")
run(
    "cd " + DIR + " && "
    "export PATH=" + N22 + ":$PATH && "
    "nohup node node_modules/.bin/next start > /tmp/alaya-out.log 2>&1 & echo 'STARTED'"
)
time.sleep(10)

# Health
out, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
print("\nHEALTH: " + (out.strip()[:150] if out.strip() else "Offline"))

ssh.close()
