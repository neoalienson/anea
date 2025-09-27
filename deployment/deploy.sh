#!/bin/bash

# KOL Platform - Deployment Script
set -e

ENV=${1:-production}

echo "🚀 Deploying KOL Platform to $ENV environment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --production

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend-nextjs
npm ci --production

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Return to root
cd ..

# Restart PM2 processes
echo "🔄 Restarting services..."
pm2 restart ecosystem.config.js --env $ENV

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# Save PM2 configuration
pm2 save

echo "✅ Deployment to $ENV complete!"
echo "🔍 Check status with: pm2 status"
echo "📊 Monitor with: pm2 monit"