#!/usr/bin/env python3
"""Simple check of security tables using pg module, capture ALL output."""

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

# Simple check using pg Pool - capture ALL output
check_js = (
    "const { Pool } = require('pg');const p = new Pool({ connectionString: process.env.U });"
    "(async () => {"
    "try {"
    "const r = await p.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name\");"
    "console.log('TABLES: ' + r.rows.length + '/5');"
    "r.rows.forEach(x => console.log('- ' + x.table_name));"
    "const c = await p.query(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");"
    "console.log('PWHASH: ' + (c.rows.length > 0 ? 'YES' : 'NO'));"
    "} catch(e) { console.log('ERR: ' + e.message.slice(0,200)); }"
    "await p.end();"
    "})()"
)
check_b64 = base64.b64encode(check_js.encode()).decode()
c = ssh.get_transport().open_session()
c.exec_command("echo '" + check_b64 + "' | base64 -d > " + DIR + "/_c.js && echo 'WROTE'")
c.recv(4096)

c = ssh.get_transport().open_session()
c.settimeout(60)
c.exec_command("cd " + DIR + " && export PATH=" + N22 + ":$PATH && export U='" + db_url + "' && node _c.js 2>&1 && echo 'DONEOK'")
import time
time.sleep(5)
out = b""
while c.recv_ready():
    out += c.recv(65536)
    time.sleep(0.5)
code = c.recv_exit_status()
result = out.decode("utf-8","replace")
print(result)

ssh.exec_command("rm -f " + DIR + "/_c.js")

# Also check health
c = ssh.get_transport().open_session()
c.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
h = c.recv(4096).decode()
print("HEALTH: " + h.strip()[:150])

ssh.close()
