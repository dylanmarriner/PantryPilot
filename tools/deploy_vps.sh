#!/bin/bash

# Configuration
VPS_IP="100.93.214.100"
SSH_KEY="/home/linnyux/Downloads/.ssh/id_ed25519"
REMOTE_PATH="/opt/pantrypilot/backend"
LOCAL_BACKEND_DIR="$(pwd)/backend"

echo "🚀 Starting PantryPilot VPS Deployment..."

# 1. Pack the backend (excluding node_modules, database, and .env)
echo "📦 Packing backend source (excluding stateful files)..."
tar --exclude=node_modules --exclude=database.sqlite --exclude=.env -czf /tmp/backend_update.tar.gz -C "$LOCAL_BACKEND_DIR" .

# 2. Transfer to VPS
echo "📤 Transferring to VPS ($VPS_IP)..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no /tmp/backend_update.tar.gz root@$VPS_IP:/tmp/backend_update.tar.gz

# 3. Extract and restart on VPS
echo "🛠️ Extracting and restarting service..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP <<EOF
    mkdir -p $REMOTE_PATH
    tar -xzf /tmp/backend_update.tar.gz -C $REMOTE_PATH
    cd $REMOTE_PATH
    npm install --production
    
    # Restart the service (using nohup as a simple manager)
    # killing existing process on port 3000 if it exists
    fuser -k 3000/tcp || true
    export PORT=3000
    nohup node src/index.js > /var/log/pantrypilot.log 2>&1 &
    
    echo "✅ Backend updated and restarted."
    curl -s http://localhost:3000/health
EOF

rm /tmp/backend_update.tar.gz
echo "🎉 Deployment complete!"
