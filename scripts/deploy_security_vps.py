#!/usr/bin/env python3
"""Upload deploy_security.sh to VPS and execute it."""

import paramiko, os, sys, base64

HOST, USER, PORT = "157.173.216.156", "u131951911", 65002
DIR = "/home/u131951911/alaya-insider"

password = os.environ.get("VPS_PASSWORD")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname=HOST, port=PORT, username=USER, password=password, look_for_keys=False, allow_agent=False, timeout=30)

# Read the shell script
local_script = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts", "deploy_security.sh")
with open(local_script) as f:
    script_content = f.read()

# Upload via base64
script_b64 = base64.b64encode(script_content.encode()).decode()
c = ssh.get_transport().open_session()
c.exec_command("echo '" + script_b64 + "' | base64 -d > " + DIR + "/deploy_security.sh && chmod +x " + DIR + "/deploy_security.sh && echo 'UPLOADED'")
out = c.recv(4096).decode()
print(out.strip())

# Execute the script
print("\nExecuting deploy_security.sh on VPS...")
print("(This may take a minute)\n")
c = ssh.get_transport().open_session()
c.settimeout(300)
c.exec_command("cd " + DIR + " && bash deploy_security.sh 2>&1 && echo 'SCRIPT_DONE'")

import time
all_out = b""
while True:
    if c.recv_ready():
        all_out += c.recv(65536)
    elif c.exit_status_ready():
        break
    else:
        time.sleep(0.5)

result = all_out.decode("utf-8","replace")
print(result[-2000:])

# Cleanup
ssh.exec_command("rm -f " + DIR + "/deploy_security.sh")

# Final health
c = ssh.get_transport().open_session()
c.exec_command("curl -s http://localhost:3000/api/ops/health 2>&1 | head -c 300")
h = c.recv(4096).decode()
print("HEALTH: " + h.strip()[:150])

ssh.close()
