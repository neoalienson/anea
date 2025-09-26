# Database Setup

## Prerequisites
- PostgreSQL 15+ installed and running
- Node.js 18+ installed

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd database
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file or set environment variables
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=kol_platform
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE kol_platform;
   ```

4. **Run setup script:**
   ```bash
   npm run setup
   ```

## Mock Data

The setup script creates the following test accounts:

### Business Users
- **Email:** techcorp@example.com
- **Password:** password123
- **Company:** TechCorp Solutions

- **Email:** fashionbrand@example.com  
- **Password:** password123
- **Company:** Fashion Forward

- **Email:** gamingco@example.com
- **Password:** password123
- **Company:** Gaming Universe

### KOL Users
- **Email:** techreviewer@example.com
- **Password:** password123
- **Name:** TechReviewer Pro
- **Followers:** 150,000

- **Email:** beautyguru@example.com
- **Password:** password123
- **Name:** Beauty Guru Maya
- **Followers:** 85,000

- **Email:** gamingpro@example.com
- **Password:** password123
- **Name:** Gaming Pro Alex
- **Followers:** 220,000

- **Email:** lifestyleblogger@example.com
- **Password:** password123
- **Name:** Lifestyle Luna
- **Followers:** 65,000

- **Email:** fitnesscoach@example.com
- **Password:** password123
- **Name:** Fitness Coach Sam
- **Followers:** 95,000

## Database Schema

The database includes the following tables:
- `users` - User authentication and basic info
- `business_profiles` - Business user profiles
- `kol_profiles` - KOL user profiles
- `campaigns` - Marketing campaigns
- `campaign_kols` - Campaign-KOL relationships
- `kol_analytics` - KOL performance metrics
- `campaign_performance` - Campaign performance data

## Files

- `schema.sql` - Database schema definition
- `seed-data.sql` - Mock data for testing
- `setup.js` - Node.js setup script
- `package.json` - Dependencies