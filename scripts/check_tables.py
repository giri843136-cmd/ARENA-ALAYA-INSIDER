#!/usr/bin/env python3
"""Check if security tables exist in the database."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Write a simple check script to project dir
check_js = "const{P}=require('@prisma/client');const p=new P();(async()=>{try{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name\");console.log('Tables: '+t.length+'/5');t.forEach(x=>console.log(' - '+x.table_name));const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('passwordHash: '+(c.length>0?'EXISTS':'MISSING'));await p.$disconnect()}catch(e){console.log('Err: '+e.message);await p.$disconnect()}})()"

transport = ssh.get_transport()
ch = transport.open_session()
ch.exec_command("cd " + DIR + " && " + EXP + " && node -e '" + check_js + "' 2>&1 && echo 'DONE'")
out = ch.recv(4096).decode("utf-8","replace")
code = ch.recv_exit_status()
print(out)

# Also try running the migration SQL directly via Prisma client
print("\nTrying to execute SQL migration via Prisma client...")
sql_path = os.path.join(r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed", "prisma", "migrations", "migration_add_security.sql")
with open(sql_path) as f:
    sql = f.read()

import base64
sql_b64 = base64.b64encode(sql.encode()).decode()

migrate_js = "const{P}=require('@prisma/client');const sql=Buffer.from('" + sql_b64 + "','base64').toString();const p=new P();(async()=>{try{await p.$executeRawUnsafe(sql);console.log('SQL_OK');const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name\");console.log('Tables: '+t.length+'/5');t.forEach(x=>console.log(' - '+x.table_name));const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('passwordHash: '+(c.length>0?'EXISTS':'MISSING'));await p.$disconnect()}catch(e){console.log('Err: '+e.message.slice(0,200));await p.$disconnect()}})()"

ch2 = transport.open_session()
ch2.exec_command("cd " + DIR + " && " + EXP + " && node -e '" + migrate_js.replace("'", "'\\''") + "' 2>&1 && echo 'DONE'")
out2 = ch2.recv(4096).decode("utf-8","replace")
code2 = ch2.recv_exit_status()
print(out2)

ssh.close()
