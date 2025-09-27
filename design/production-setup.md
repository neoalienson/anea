# Production Setup Guide

## Prerequisites

### Infrastructure Requirements
- **VPS/Server**: 4GB RAM, 2 CPU cores, 50GB SSD (Ubuntu 22.04 LTS)
- **Node.js**: v18+ LTS
- **PM2**: Process management
- **Nginx**: Reverse proxy and SSL termination
- **Domain**: Registered domain with DNS management

### SaaS Services
- **Supabase**: Database, Authentication, Storage ($25/month)
- **Stripe**: Payment processing (2.9% + 30¢ per transaction)
- **YouTube API**: Google Cloud Console project with YouTube Data API v3
- **Resend**: Email service ($20/month for 100k emails)
- **Sentry**: Error monitoring ($26/month)
- **Total SaaS Cost**: ~$71/month + transaction fees

## Deployment Steps

### 1. Server Setup

```bash
# Run initial server setup
./deployment/setup.sh
```

### 2. Application Setup

```bash
# Clone repository to server
git clone <repository-url> /var/www/kol-platform
cd /var/www/kol-platform

# Install dependencies
npm run setup

# Create environment files
cp .env.example .env.production
cp frontend-nextjs/.env.example frontend-nextjs/.env.local
cp backend/.env.example backend/.env.production

# Update with production values
nano .env.production
nano frontend-nextjs/.env.local
nano backend/.env.production
```

### 3. Supabase Setup

```bash
# Create Supabase project at https://app.supabase.com
# Run database migrations
cd database
npm install
npm run setup
```

### 4. Build and Deploy

```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### 5. Configure Nginx and SSL

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/kol-platform
sudo ln -s /etc/nginx/sites-available/kol-platform /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Configuration

### Environment Variables

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:pass@prod-db:5432/kol_platform_prod
JWT_SECRET=your-super-secure-jwt-secret-256-bits
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-256-bits
YOUTUBE_API_KEY=your-youtube-api-key
STRIPE_SECRET_KEY=sk_live_your-live-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=warn
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Database Configuration

#### Connection Pool Settings
```javascript
// backend/src/config/database.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

#### Performance Tuning
```sql
-- PostgreSQL configuration for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

## Security Checklist

### Application Security
- [ ] JWT secrets are cryptographically secure (256+ bits)
- [ ] All API endpoints have proper authentication
- [ ] Input validation on all user inputs
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced everywhere

### Infrastructure Security
- [ ] Kubernetes RBAC configured
- [ ] Network policies implemented
- [ ] Secrets stored in Kubernetes secrets (not ConfigMaps)
- [ ] Container images scanned for vulnerabilities
- [ ] Database access restricted to application pods
- [ ] Backup encryption enabled
- [ ] Monitoring and alerting configured

### Compliance
- [ ] GDPR data handling procedures implemented
- [ ] Privacy policy and terms of service updated
- [ ] Data retention policies configured
- [ ] Audit logging enabled
- [ ] User consent management working

## Monitoring and Alerting

### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/health

# Frontend health
curl https://your-domain.com

# Database health
kubectl exec -it postgres-pod -n kol-platform -- pg_isready
```

### Key Metrics to Monitor
- **Application**: Response time, error rate, throughput
- **Database**: Connection count, query performance, disk usage
- **Infrastructure**: CPU, memory, disk, network
- **Business**: User registrations, campaign creations, payments

### Alerting Rules
- API error rate > 5%
- Response time > 500ms (95th percentile)
- Database connections > 80% of max
- Disk usage > 85%
- Memory usage > 90%

## Backup and Recovery

### Database Backups
```bash
# Daily automated backup
kubectl create cronjob postgres-backup \
  --image=postgres:15-alpine \
  --schedule="0 2 * * *" \
  --restart=OnFailure \
  -- /bin/sh -c "pg_dump \$DATABASE_URL | gzip > /backup/backup-\$(date +%Y%m%d).sql.gz"
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 24 hours
3. **Backup retention**: 30 days
4. **Cross-region replication**: Enabled for critical data

## Performance Optimization

### Backend Optimizations
- Connection pooling configured
- Database indexes on frequently queried columns
- Redis caching for session data
- Gzip compression enabled
- CDN for static assets

### Frontend Optimizations
- Code splitting and lazy loading
- Image optimization and compression
- Browser caching headers
- Service worker for offline functionality

### Database Optimizations
- Query optimization and indexing
- Connection pooling
- Read replicas for analytics queries
- Automated vacuum and analyze

## Scaling Strategy

### Horizontal Scaling
```bash
# Scale backend pods
kubectl scale deployment backend --replicas=10 -n kol-platform

# Auto-scaling is configured via HPA
# Scales based on CPU (70%) and memory (80%) usage
```

### Vertical Scaling
```yaml
# Update resource limits in deployment
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Maintenance

### Regular Tasks
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly performance reviews
- [ ] Annual security audits

### Update Procedure
1. Test updates in staging environment
2. Schedule maintenance window
3. Deploy with rolling updates
4. Monitor for issues
5. Rollback if necessary

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
kubectl top pods -n kol-platform

# Check for memory leaks
kubectl logs deployment/backend -n kol-platform | grep "memory"
```

#### Database Connection Issues
```bash
# Check connection count
kubectl exec -it postgres-pod -n kol-platform -- psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
kubectl exec -it postgres-pod -n kol-platform -- psql -c "SELECT query, state, query_start FROM pg_stat_activity WHERE state = 'active';"
```

#### SSL Certificate Issues
```bash
# Check certificate status
kubectl describe certificate kol-platform-tls -n kol-platform

# Renew certificate manually
kubectl delete certificate kol-platform-tls -n kol-platform
kubectl apply -f k8s/frontend.yaml
```

## Support and Documentation

### Runbooks
- [Incident Response Playbook](./docs/incident-response.md)
- [Database Maintenance Guide](./docs/database-maintenance.md)
- [Security Incident Response](./docs/security-incident.md)

### Contacts
- **On-call Engineer**: [Phone/Email]
- **Database Admin**: [Contact]
- **Security Team**: [Contact]
- **DevOps Team**: [Contact]

---

**Last Updated**: [Date]
**Version**: 1.0
**Next Review**: [Date + 3 months]