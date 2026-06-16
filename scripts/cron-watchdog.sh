#!/bin/bash
# ====================================================
# ALAYA INSIDER — App Watchdog (CRON)
# ====================================================
# Installs a cron job that checks every 5 minutes if the
# app is running and restarts it if not.
#
# Usage (run once on server):
#   bash scripts/cron-watchdog.sh install
#
# To remove:
#   bash scripts/cron-watchdog.sh remove
# ====================================================

APP_DIR="/home/u131951911/alaya-insider"
NODE_BIN="/opt/alt/alt-nodejs22/root/usr/bin/node"
NEXT_BIN="$APP_DIR/node_modules/.bin/next"
LOG_FILE="/home/u131951911/app.log"
# Unique marker for easy removal: #alaya-watchdog
CRON_JOB="*/5 * * * * cd $APP_DIR && curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:3000/ | grep -E '^200$' || (pkill -f 'next' 2>/dev/null; sleep 2; NODE_ENV=production PORT=3000 nohup $NODE_BIN $NEXT_BIN start -p 3000 > $LOG_FILE 2>&1 &) #alaya-watchdog"

install() {
    echo "Installing ALAYA INSIDER watchdog cron job..."
    (crontab -l 2>/dev/null | grep -v "#alaya-watchdog"; echo "$CRON_JOB") | crontab -
    echo "Done. Watchdog will check every 5 minutes."
    crontab -l | grep alaya
}

remove() {
    echo "Removing watchdog cron job..."
    crontab -l 2>/dev/null | grep -v "#alaya-watchdog" | crontab -
    echo "Done. Watchdog removed."
}

status() {
    echo "=== Current app status ==="
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000/ 2>&1)
    echo "HTTP status: $HTTP_CODE"
    ps aux | grep -E "next|node" | grep -v grep | head -3
    echo ""
    echo "=== Cron jobs ==="
    crontab -l 2>/dev/null | head -10
}

case "${1:-status}" in
    install) install ;;
    remove) remove ;;
    status) status ;;
    *) echo "Usage: $0 {install|remove|status}" ;;
esac
