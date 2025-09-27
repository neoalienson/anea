# Production Setup Guide

## Prerequisites

### Infrastructure Requirements
- **Kubernetes Cluster**: v1.24+ (EKS, GKE, or AKS recommended)
- **PostgreSQL**: v15+ (managed service recommended)
- **Redis**: v7+ (for caching and sessions)
- **Load Balancer**: NGINX Ingress Controller
- **SSL Certificates**: Let's Encrypt or managed certificates
- **Monitoring**: Prometheus + Grafana stack

### External Services
- **Stripe Account**: For payment processing
- **YouTube API**: Google Cloud Console project with YouTube Data API v3
- **Domain**: Registered domain with DNS management
- **Email Service**: SMTP server for notifications

## Deployment Steps

### 1. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd anea

# Create production environment files
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production

# Update with production values
nano backend/.env.production
nano frontend/.env.production
```

### 2. Database Setup

```bash
# Create production database
createdb kol_platform_prod

# Run migrations
cd database
npm install
DATABASE_URL="postgresql://user:pass@host:5432/kol_platform_prod" npm run setup
```

### 3. Build and Push Images

```bash
# Build backend image
docker build -t your-registry/kol-backend:v1.0.0 ./backend
docker push your-registry/kol-backend:v1.0.0

# Build frontend image
docker build -t your-registry/kol-frontend:v1.0.0 ./frontend
docker push your-registry/kol-frontend:v1.0.0
```

### 4. Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace kol-platform

# Create secrets
kubectl create secret generic backend-secret \
  --from-literal=jwt-secret="your-production-jwt-secret" \
  --from-literal=jwt-refresh-secret="your-production-refresh-secret" \
  --from-literal=youtube-api-key="your-youtube-api-key" \
  --from-literal=stripe-secret-key="your-stripe-secret-key" \
  --from-literal=stripe-webhook-secret="your-webhook-secret" \
  -n kol-platform

# Deploy components
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/monitoring.yaml

# Wait for deployment
kubectl wait --for=condition=available deployment --all -n kol-platform --timeout=600s
```

### 5. Configure Ingress and SSL

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create cluster issuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@your-domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Update ingress with your domain
kubectl apply -f k8s/frontend.yaml
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