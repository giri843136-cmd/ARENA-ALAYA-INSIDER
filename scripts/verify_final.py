#!/usr/bin/env python3
"""Final verification of security tables after db push."""

import paramiko, os, sys

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
EXP = "export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
PROJ = r"C:\Users\rocki\Downloads\workspace-019ebb86-c6f6-7e2b-bff6-e03ad83125ed"

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Get DB URL
ch = ssh.get_transport().open_session()
ch.exec_command("source " + DIR + "/.env 2>/dev/null && echo $DATABASE_URL")
db_url = ch.recv(4096).decode("utf-8","replace").strip()
print("DB: " + db_url[:60] + "...")

# Run verification via Node with explicit env
js = "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient({datasources:{db:{url:process.env.DB_URL}}});(async()=>{try{const t=await p.$queryRawUnsafe(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN('TwoFactorAuth','BackupCode','LoginAttempt','DelegatedAccess','SecurityAuditLog') ORDER BY table_name\");console.log('FOUND '+t.length+' security tables:');t.forEach(x=>console.log('  - '+x.table_name));if(t.length==5)console.log('ALL 5 TABLES PRESENT');else console.log('MISSING '+(5-t.length)+' tables')}catch(e){console.log('ERR: '+e.message.slice(0,200))};try{const c=await p.$queryRawUnsafe(\"SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'\");console.log('passwordHash column: '+(c.length>0?'EXISTS':'MISSING'))}catch(e){console.log('PW_ERR: '+e.message.slice(0,200))};await p.$disconnect()})()"

ch = ssh.get_transport().open_session()
ch.settimeout(60)
ch.exec_command("cd " + DIR + " && " + EXP + " && DB_URL='" + db_url + "' node -e '" + js + "' 2>&1 && echo 'DONE'")
out = ch.recv(8192).decode("utf-8","replace")
print(out)

ssh.close()
