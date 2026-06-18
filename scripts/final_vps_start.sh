#!/bin/bash
# Start ALAYA INSIDER with Node v22
# This script is designed to be run on the VPS

export PATH=$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH
DIR="/home/u131951911/alaya-insider"

# Kill old processes
pkill -9 -f 'next-server' 2>/dev/null
pkill -9 -f 'node.*3000' 2>/dev/null
sleep 1

cd "$DIR"

# Start completely detached - all output to log file
nohup $HOME/.nvm/versions/node/v22.22.3/bin/node node_modules/.bin/next start > /tmp/alaya-n22.log 2>&1 < /dev/null &
PID=$!
disown $!

echo "Started next-server with PID: $PID"
echo "Log: /tmp/alaya-n22.log"
