#!/bin/bash

# NUCLEUS AI Server Deployment Script
# Run this on your VPS server

echo "🚀 Setting up NUCLEUS AI Server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx

# Create app directory
sudo mkdir -p /var/www/nucleusai
sudo chown -R $USER:$USER /var/www/nucleusai
cd /var/www/nucleusai

# Clone your repository (replace with your actual repo)
git clone https://github.com/peterthehammer1/FongoAI.git .

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
# NUCLEUS AI Configuration
NUCLEUS_API_KEY=key_dfc6862d300570f9dc8950062ea8
NUCLEUS_AGENT_ID=agent_c0b3d0217ea4dbcd6feb9c690c

# Server Configuration
PORT=3000
WEBHOOK_SECRET=fongo-webhook-secret-2025

# Fongo API Configuration
FONGO_API_URL=https://secure.freephoneline.ca/mobile/updatecc.pl

# Environment
NODE_ENV=production
DOMAIN=nucleusai.com
EOF

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nucleusai',
    script: 'index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/nucleusai-error.log',
    out_file: '/var/log/pm2/nucleusai-out.log',
    log_file: '/var/log/pm2/nucleusai.log'
  }]
};
EOF

# Create nginx configuration
sudo cat > /etc/nginx/sites-available/nucleusai.com << EOF
server {
    listen 80;
    server_name nucleusai.com www.nucleusai.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support
    location /llm-websocket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/nucleusai.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ NUCLEUS AI Server setup complete!"
echo "📞 Webhook URL: http://nucleusai.com/webhook"
echo "🤖 WebSocket URL: ws://nucleusai.com/llm-websocket"
echo "🌐 Health Check: http://nucleusai.com/health"

# Show server IP
echo "🖥️  Server IP: $(curl -s ifconfig.me)"
echo "📋 Give this IP to Fabio for whitelisting!"
