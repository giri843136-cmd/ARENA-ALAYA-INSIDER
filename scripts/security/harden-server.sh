#!/bin/bash
# =============================================
# ALAYA INSIDER — SERVER HARDENING SCRIPT
# Run ONCE on a fresh Ubuntu 22.04+ VPS
# =============================================
set -euo pipefail

echo "=== ALAYA INSIDER — SERVER HARDENING ==="
echo "Target: $(hostname -f)"
echo "Date:   $(date)"
echo ""

# === ROOT CHECK ===
if [ "$EUID" -ne 0 ]; then echo "Run as root"; exit 1; fi

# === 1. SSH HARDENING ===
echo "[1/7] Hardening SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%s)

cat > /etc/ssh/sshd_config.d/99-alaya-hardening.conf << 'SSH'
# ALAYA INSIDER SSH Hardening
Port 65002                    # Custom port (change from 22)
Protocol 2
PermitRootLogin no            # Disable root login
PubkeyAuthentication yes
PasswordAuthentication no     # Key-only authentication
ChallengeResponseAuthentication no
UsePAM yes
AuthenticationMethods publickey
MaxAuthTries 3
MaxSessions 4
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers u131951911         # Only allow deploy user
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server -f AUTH -l INFO
SSH

# Apply new SSH port in UFW (run separately)
echo "  -> Applied: Port 65002, key-only, root disabled"
echo "  -> Restart SSH: systemctl restart sshd"

# === 2. UFW FIREWALL ===
echo "[2/7] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 65002/tcp comment 'SSH custom port'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
echo "  -> Deny all except 443, 80, 65002"

# === 3. FAIL2BAN ===
echo "[3/7] Installing and configuring fail2ban..."
apt-get install -y fail2ban

cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 65002
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nextcloud-http]  # Will work for any HTTP
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 3600

[alaya-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/alaya-error.log
maxretry = 5
bantime = 7200
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban
echo "  -> fail2ban active: SSH(3 tries), HTTP(10 tries), Auth(5 tries)"

# === 4. AUTO UPDATES ===
echo "[4/7] Configuring automatic security updates..."
apt-get install -y unattended-upgrades apt-listchanges

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'UNATTENDED'
Unattended-Upgrade::Allowed-Origins {
  "${distro_id}:${distro_codename}-security";
  "${distro_id}ESMApps:${distro_codename}-apps-security";
  "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
UNATTENDED

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'AUTO'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
AUTO

systemctl restart unattended-upgrades
echo "  -> Unattended security updates enabled"

# === 5. FILE INTEGRITY MONITORING (AIDE) ===
echo "[5/7] Setting up AIDE file integrity monitoring..."
apt-get install -y aide aide-common

# Initialize AIDE database (first run)
aideinit --yes 2>/dev/null || true
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db 2>/dev/null || true

# Set up daily integrity check
cat > /etc/cron.daily/aide-check << 'AIDECRON'
#!/bin/bash
aide --check > /var/log/aide/daily-check.log 2>&1
if [ $? -ne 0 ]; then
  echo "ALERT: AIDE integrity check FAILED on $(hostname) at $(date)" >> /var/log/aide/alerts.log
  # Optionally send alert
fi
AIDECRON
chmod +x /etc/cron.daily/aide-check
mkdir -p /var/log/aide
echo "  -> AIDE file integrity monitoring active (daily checks)"

# === 6. DISABLE UNNECESSARY SERVICES ===
echo "[6/7] Disabling unnecessary services..."
systemctl disable --now cups 2>/dev/null || true
systemctl disable --now avahi-daemon 2>/dev/null || true
systemctl disable --now bluetooth 2>/dev/null || true
systemctl disable --now whoopsie 2>/dev/null || true
systemctl disable --now ModemManager 2>/dev/null || true
echo "  -> Unnecessary services disabled"

# === 7. KERNEL HARDENING ===
echo "[7/7] Applying kernel hardening..."
cat > /etc/sysctl.d/99-alaya-security.conf << 'SYSCTL'
# ALAYA INSIDER — Kernel Hardening
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Block SYN attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_syn_retries = 2
net.ipv4.tcp_synack_retries = 2

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Increase backlog
net.core.netdev_max_backlog = 5000
net.core.somaxconn = 65535

# Reduce TIME_WAIT
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_tw_reuse = 1
SYSCTL

sysctl -p /etc/sysctl.d/99-alaya-security.conf
echo "  -> Kernel hardening applied"

# === SUMMARY ===
echo ""
echo "=========================================="
echo "  ALAYA INSIDER — SERVER HARDENED"
echo "=========================================="
echo "  SSH:    Port 65002, key-only, root disabled"
echo "  UFW:    Only 443/80/65002 open"
echo "  fail2ban: SSH(3), HTTP(10), Auth(5) → 1h-24h ban"
echo "  Updates: Automatic security updates enabled"
echo "  AIDE:   File integrity monitoring (daily)"
echo "  Kernel: SYN cookies, no redirects, no source routing"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "  1. systemctl restart sshd"
echo "  2. Verify SSH in new terminal BEFORE closing this one"
echo "  3. ssh -p 65002 u131951911@your-vps-ip"
echo "  4. Install and configure Wazuh agent for SIEM (optional)"
echo ""
