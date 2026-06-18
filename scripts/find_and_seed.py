#!/usr/bin/env python3
"""Find the correct project directory and run the seed."""

import paramiko, os, sys, time

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
NEW_PW = "7!d6kf5lsW*7zG56Akqf*RIDG2LSt4*P"
NODE = "/opt/alt/alt-nodejs18/root/usr/bin"
EXPORT = f"export PATH={NODE}:$PATH"

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    code = stdout.channel.recv_exit_status()
    return stdout.read().decode("utf-8","replace"), stderr.read().decode("utf-8","replace"), code

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)
print("OK: Connected")

# Find all alaya-related package.json files
out, _, _ = run(ssh, "find /home /opt /usr -name 'package.json' -maxdepth 6 2>/dev/null | grep -i 'alaya\\|insider' | head -10")
print(f"Project candidates:\n{out}")

# Also check where the currently running app is
out, _, _ = run(ssh, "ps aux | grep -E 'next|node' | grep -v grep | head -10")
print(f"\nRunning processes:\n{out[:500]}")

# Find .next directory
out, _, _ = run(ssh, "find /home -name '.next' -type d -maxdepth 5 2>/dev/null | head -5")
print(f"\n.next directories:\n{out}")

# Check common Hostinger paths
for d in ["/home/u131951911/repositories/alayainsider.com",
          "/home/u131951911/repositories/ARENA-ALAYA-INSIDER",
          "/home/u131951911/domains/alayainsider.com/public_nodejs",
          "/home/u131951911/domains/alayainsider.com"]:
    out, _, _ = run(ssh, f"ls {d}/package.json 2>/dev/null && echo 'FOUND'")
    if "FOUND" in out:
        print(f"\n=== FOUND PROJECT AT: {d} ===")
        
        # Update .env with new password
        print("Updating .env...")
        run(ssh, f"cd {d} && sed -i '/^PRIMARY_ADMIN_PASSWORD=/d' .env 2>/dev/null || true")
        run(ssh, f"cd {d} && echo 'PRIMARY_ADMIN_PASSWORD={NEW_PW}' >> .env")
        
        # Run seed
        print("Running seed...")
        out2, err2, code = run(ssh, f"cd {d} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npx prisma generate 2>&1 && echo 'GEN_OK'")
        print(f"Prisma generate: {'OK' if 'GEN_OK' in out2 else 'FAIL'}")
        
        out2, err2, code = run(ssh, f"cd {d} && {EXPORT} && PRIMARY_ADMIN_PASSWORD='{NEW_PW}' npm run db:seed 2>&1 && echo 'SEED_OK'", 300)
        print(f"Seed: {'OK' if 'SEED_OK' in out2 else 'FAIL'}")
        print(f"Output: {out2[-400:]}")
        
        # Restart PM2 or next.js
        print("Restarting app...")
        run(ssh, f"cd {d} && {EXPORT} && pm2 restart alaya-insider 2>&1 || npm run build 2>&1 && echo 'BUILD_OK'", 300)
        
        time.sleep(5)
        out3, _, _ = run(ssh, "curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 400", 15)
        print(f"\nHealth: {out3[:300] if out3.strip() else '(none)'}")
        
        break
else:
    print("Project directory not found in expected paths")
    out, _, _ = run(ssh, "find /home -maxdepth 6 -name '.env' -type f 2>/dev/null | head -10")
    print(f"\nAll .env files found:\n{out}")

print("\nDONE")
print(f"Primary admin: alayainsider@gmail.com / {NEW_PW}")
ssh.close()
