#!/bin/bash
# QAPRIL VPS Security Audit Script v1.0
# Run as: sudo bash audit.sh

LOG_FILE="/tmp/vps_security_audit_$(date +%F).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "===================================================="
echo "   QAPRIL VPS SECURITY AUDIT - $(date)"
echo "===================================================="

echo -e "\n[1] OS Information"
lsb_release -a || cat /etc/os-release
uptime

echo -e "\n[2] Listening Ports & Services"
ss -tulpn | grep LISTEN

echo -e "\n[3] Firewall Status (UFW)"
if command -v ufw >/dev/null; then
    ufw status verbose
else
    echo "UFW not installed. Checking iptables..."
    iptables -L -n -v | head -n 20
fi

echo -e "\n[4] SSH Configuration Audit"
grep -E "^Port|^PermitRootLogin|^PasswordAuthentication|^PubkeyAuthentication" /etc/ssh/sshd_config
echo "SSH Service Status:"
systemctl is-active ssh

echo -e "\n[5] Fail2Ban Status"
if command -v fail2ban-client >/dev/null; then
    fail2ban-client status
    fail2ban-client status sshd
else
    echo "Fail2Ban not installed."
fi

echo -e "\n[6] User & Access Audit"
echo "Active users:"
who
echo "Last logins (top 10):"
last -n 10
echo "Users with sudo privileges:"
grep -Po '^sudo.+:\K.*' /etc/group

echo -e "\n[7] Process Audit (Top CPU/Memory)"
ps aux --sort=-%cpu | head -n 10

echo -e "\n[8] Malware & Suspicious Activity (Basic)"
echo "Checking for known miner patterns (xmrig, etc.):"
pgrep -l "xmrig|miner|nanopool" || echo "No common miner processes found."
ls -la /tmp | grep -E "xmr|php|sh|pl" | head -n 10

echo -e "\n[9] Unattended Upgrades"
if [ -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
    cat /etc/apt/apt.conf.d/20auto-upgrades
else
    echo "Unattended-upgrades not configured."
fi

echo -e "\n[10] Application Directory Status"
ls -ld /home/github/capril_app || echo "App directory not found in standard path."

echo "===================================================="
echo "Audit complete. Result saved to: $LOG_FILE"
echo "Please provide the output to Antigravity for analysis."
echo "===================================================="
