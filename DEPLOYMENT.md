# KOL Platform - Deployment Guide

## Quick Start

### Development Environment
```bash
# 1. Clone and setup
git clone <repository-url>
cd anea

# 2. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start with Docker Compose
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Database: localhost:5432
```

### Production Deployment
```bash
# 1. Run deployment script
./deploy.sh production

# 2. Or use Kubernetes directly
kubectl apply -f k8s/
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Frontend      │────│   Backend API   │
│   (NGINX)       │    │   (React)       │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis Cache   │    │   PostgreSQL    │
                       │   (Sessions)    │    │   (Primary DB)  │
                       └─────────────────┘    └─────────────────┘
```

## Environment Configuration

### Backend Environment Variables
```env
# Core Configuration
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:pass@host:5432/kol_platform

# Authentication
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
YOUTUBE_API_KEY=your-youtube-api-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# GDPR
DATA_RETENTION_DAYS=2555
COOKIE_CONSENT_REQUIRED=true
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_NOTIFICATIONS=true

# Environment
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

## Deployment Options

### 1. Docker Compose (Development/Small Production)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kol_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/kol_platform
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Kubernetes (Production)
```bash
# Deploy to Kubernetes
kubectl create namespace kol-platform
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/monitoring.yaml
```

### 3. Cloud Platforms

#### AWS EKS
```bash
# Create EKS cluster
eksctl create cluster --name kol-platform --region us-west-2

# Deploy application
kubectl apply -f k8s/
```

#### Google GKE
```bash
# Create GKE cluster
gcloud container clusters create kol-platform --zone us-central1-a

# Deploy application
kubectl apply -f k8s/
```

#### Azure AKS
```bash
# Create AKS cluster
az aks create --resource-group myResourceGroup --name kol-platform

# Deploy application
kubectl apply -f k8s/
```

## Database Setup

### Schema Migration
```bash
# Setup database schema
cd database
npm install
npm run setup
```

### Production Database Configuration
```sql
-- Recommended PostgreSQL settings for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

## Security Configuration

### SSL/TLS Setup
```yaml
# Kubernetes Ingress with SSL
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kol-platform-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - kol-platform.com
    secretName: kol-platform-tls
  rules:
  - host: kol-platform.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### Security Headers
```javascript
// Backend security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Monitoring and Observability

### Health Checks
```javascript
// Backend health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### Prometheus Metrics
```javascript
// Custom metrics
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});
```

### Grafana Dashboards
- **Application Metrics**: Response time, error rate, throughput
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Business Metrics**: User registrations, campaigns, payments
- **Database Metrics**: Connection count, query performance

## Backup and Recovery

### Automated Backups
```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/kol_platform_$DATE.sql.gz"

pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# Retain only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Disaster Recovery
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup frequency**: Every 6 hours
4. **Cross-region replication**: Enabled

## Performance Optimization

### Backend Optimizations
```javascript
// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Caching middleware
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

app.use('/api/kols', cache('5 minutes'), kolRoutes);
```

### Frontend Optimizations
```javascript
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Service worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## Scaling Strategy

### Horizontal Scaling
```bash
# Scale backend pods
kubectl scale deployment backend --replicas=10 -n kol-platform

# Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling
```yaml
# Read replicas for analytics
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-cluster
spec:
  instances: 3
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
kubectl top pods -n kol-platform

# Analyze memory leaks
kubectl logs deployment/backend -n kol-platform | grep "memory"
```

#### Database Connection Issues
```bash
# Check active connections
kubectl exec -it postgres-pod -- psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check for blocking queries
kubectl exec -it postgres-pod -- psql -c "SELECT * FROM pg_locks WHERE NOT granted;"
```

#### SSL Certificate Issues
```bash
# Check certificate status
kubectl describe certificate kol-platform-tls -n kol-platform

# Force certificate renewal
kubectl delete certificate kol-platform-tls -n kol-platform
kubectl apply -f k8s/frontend.yaml
```

## Maintenance

### Regular Tasks
- **Daily**: Monitor application health and performance
- **Weekly**: Review security logs and update dependencies
- **Monthly**: Performance optimization and capacity planning
- **Quarterly**: Security audit and penetration testing

### Update Procedure
1. Test updates in staging environment
2. Create backup of production data
3. Deploy with rolling updates
4. Monitor application health
5. Rollback if issues detected

## Support

### Runbooks
- [Incident Response](./docs/incident-response.md)
- [Database Maintenance](./docs/database-maintenance.md)
- [Security Procedures](./docs/security-procedures.md)

### Monitoring Dashboards
- **Application**: https://grafana.your-domain.com/d/app
- **Infrastructure**: https://grafana.your-domain.com/d/infra
- **Business**: https://grafana.your-domain.com/d/business

### Emergency Contacts
- **On-call Engineer**: [Contact Information]
- **Database Administrator**: [Contact Information]
- **Security Team**: [Contact Information]

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Next Review**: March 2025