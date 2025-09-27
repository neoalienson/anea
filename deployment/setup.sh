#!/bin/bash

# KOL Platform - Server Setup Script
set -e

echo "🚀 Setting up KOL Platform server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/kol-platform
sudo chown $USER:$USER /var/www/kol-platform

# Setup PM2 startup
echo "⚙️ Configuring PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Clone your repository to /var/www/kol-platform"
echo "2. Configure environment variables"
echo "3. Run ./deploy.sh production"