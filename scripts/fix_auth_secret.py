#!/usr/bin/env python3
"""Fix missing NEXTAUTH_SECRET on VPS, restart app, verify auth."""

import paramiko, os, secrets, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"
N22 = "$HOME/.nvm/versions/node/v22.22.3/bin"
EXP = "export PATH=" + N22 + ":/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

def run(cmd, timeout=60):
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
print("OK: Connected")

# Generate a secure secret
secret = secrets.token_hex(32)
print("Secret: " + secret[:20] + "...")

# Add NEXTAUTH_SECRET to .env
print("\n[1/4] Adding NEXTAUTH_SECRET to .env...")
out, _ = run("grep NEXTAUTH_SECRET " + DIR + "/.env 2>/dev/null || echo 'MISSING'")
if "MISSING" in out:
    run("echo 'NEXTAUTH_SECRET=" + secret + "' >> " + DIR + "/.env")
    print("  Added to .env")
else:
    run("sed -i 's|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=" + secret + "|' " + DIR + "/.env")
    print("  Updated in .env")

# Verify
out, _ = run("grep NEXTAUTH_SECRET " + DIR + "/.env 2>/dev/null | head -1")
print("  Verified: " + out.strip()[:30] + "...")

# Also add NEXTAUTH_URL if missing
out, _ = run("grep NEXTAUTH_URL " + DIR + "/.env 2>/dev/null || echo 'MISSING'")
if "MISSING" in out:
    run("echo 'NEXTAUTH_URL=https://alayainsider.com' >> " + DIR + "/.env")
    print("  Added NEXTAUTH_URL")

# AUTH_SECRET for NextAuth v5 compat
out, _ = run("grep AUTH_SECRET " + DIR + "/.env 2>/dev/null || echo 'MISSING'")
if "MISSING" in out:
    run("echo 'AUTH_SECRET=" + secret + "' >> " + DIR + "/.env")
    print("  Added AUTH_SECRET")

# Restart app
print("\n[2/4] Restarting app...")
run("pkill -9 -f next-server 2>/dev/null; sleep 2")
out, _ = run("cd " + DIR + " && " + EXP + " && nohup " + N22 + "/node node_modules/.bin/next start > /tmp/alaya-n22.log 2>&1 & disown && echo 'STARTED'")
print("  Start: " + out.strip()[:100])

# Wait for health
print("\n[3/4] Waiting for app to start...")
for i in range(12):
    time.sleep(5)
    health, _ = run("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 200")
    if health.strip():
        print("  Health OK (attempt " + str(i+1) + ")")
        break
else:
    print("  Health timeout")

# Verify auth endpoint
print("\n[4/4] Verifying auth endpoints...")
code, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth/session 2>&1")
print("  /api/auth/session: HTTP " + code.strip())

body, _ = run("curl -s http://localhost:3000/api/auth/session 2>&1 | cat -v | head -c 300")
print("  Response: " + body.strip()[:100])

# Public
pub_code, _ = run("curl -s -o /dev/null -w '%{http_code}' https://alayainsider.com/api/auth/session 2>&1")
print("  Public /api/auth/session: HTTP " + pub_code.strip())

# Signin page
sigin, _ = run("curl -s http://localhost:3000/api/auth/signin 2>&1 | head -c 100 | cat -v")
print("  Signin provider list: " + sigin.strip()[:80])

print("\nDone.")
ssh.close()
