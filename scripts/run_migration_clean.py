#!/usr/bin/env python3
"""Write JS migration file to VPS project dir, execute with Node."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=/opt/alt/alt-nodejs18/root/usr/bin:$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

# Read and base64-encode SQL
with open(os.path.join(PROJ, "prisma", "migrations", "migration_add_security.sql")) as f:
    sql_b64 = base64.b64encode(f.read().encode()).decode()
print("SQL base64: " + str(len(sql_b64)) + " chars")

# Create JS migration file content
js_content = '''const{PrismaClient}=require("@prisma/client");const p=new PrismaClient();
const sql=Buffer.from("SQL_B64","base64").toString();
(async()=>{
try{await p.$executeRawUnsafe(sql);console.log("MIGRATION_OK")}
catch(e){console.log("SQL_ERR:"+e.message.slice(0,200))}
try{const t=await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name");console.log("TABLES:"+t.length+"/5 "+t.map(x=>x.table_name).join(","))}
catch(e){console.log("VERIFY_ERR:"+e.message.slice(0,200))}
try{const c=await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'");console.log("PWHASH:"+(c.length>0?"EXISTS":"MISSING"))}
catch(e){console.log("PW_ERR:"+e.message.slice(0,200))}
await p.$disconnect()
})();
'''.replace("SQL_B64", sql_b64)

print("JS: " + str(len(js_content)) + " chars")

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Write JS file to project directory via SSH stdin
print("Writing migration.js to project dir...")
ch = ssh.get_transport().open_session()
ch.exec_command("cat > " + DIR + "/migration.js")
ch.send(js_content)
ch.shutdown_write()
code = ch.recv_exit_status()
print("Write: exit " + str(code))

if code != 0:
    print("Failed to write file, trying alternate method...")
    ch = ssh.get_transport().open_session()
    ch.exec_command("echo '" + sql_b64 + "' | base64 -d > " + DIR + "/migration.sql && echo 'SQL_OK'")
    out = ch.recv(4096).decode()
    print(out)

# Execute the JS file from project directory
print("\nExecuting migration script from project dir...")
ch = ssh.get_transport().open_session()
ch.exec_command("cd " + DIR + " && " + EXP + " && source .env 2>/dev/null && " + N22 + "/node migration.js 2>&1 && echo 'EXEC_DONE'")
out = ch.recv(8192).decode("utf-8","replace")
code = ch.recv_exit_status()
print(out)

# Cleanup
ssh.exec_command("rm -f " + DIR + "/migration.js " + DIR + "/migration.sql")

# Final health
h, _, _ = ssh.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
print("Health: " + h[:150] if h.strip() else "App offline")

ssh.close()
print("\nDone.")
