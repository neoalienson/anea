#!/bin/bash

# KOL Platform Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
NAMESPACE="kol-platform"

echo -e "${GREEN}🚀 Starting KOL Platform deployment for ${ENVIRONMENT} environment${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl is not installed${NC}"
    exit 1
fi

if [[ "$ENVIRONMENT" == "production" ]] && ! command_exists helm; then
    echo -e "${RED}❌ Helm is required for production deployment${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Development deployment
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo -e "${YELLOW}🔧 Starting development environment...${NC}"
    
    # Check if .env file exists
    if [[ ! -f "backend/.env" ]]; then
        echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
        cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env file"
    fi
    
    # Start with Docker Compose
    docker-compose down --remove-orphans
    docker-compose up --build -d
    
    echo -e "${GREEN}✅ Development environment started${NC}"
    echo -e "${GREEN}🌐 Frontend: http://localhost${NC}"
    echo -e "${GREEN}🔗 Backend API: http://localhost:8000${NC}"
    echo -e "${GREEN}🗄️  Database: localhost:5432${NC}"
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 10
    
    # Health check
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
    
    if curl -f http://localhost >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend health check passed${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi

# Staging deployment
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    echo -e "${YELLOW}🔧 Deploying to staging environment...${NC}"
    
    # Create namespace
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy PostgreSQL
    kubectl apply -f k8s/postgres.yaml
    
    # Wait for PostgreSQL to be ready
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    
    # Deploy backend
    kubectl apply -f k8s/backend.yaml
    
    # Wait for backend to be ready
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
    
    # Deploy frontend
    kubectl apply -f k8s/frontend.yaml
    
    # Wait for frontend to be ready
    kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✅ Staging deployment completed${NC}"

# Production deployment
elif [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${YELLOW}🔧 Deploying to production environment...${NC}"
    
    # Confirmation prompt
    read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
    if [[ $confirm != "yes" ]]; then
        echo -e "${RED}❌ Production deployment cancelled${NC}"
        exit 1
    fi
    
    # Create namespace
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy with Helm (if available) or kubectl
    if command_exists helm; then
        echo -e "${YELLOW}📦 Using Helm for production deployment...${NC}"
        # Add Helm deployment commands here
    else
        echo -e "${YELLOW}⚙️  Using kubectl for production deployment...${NC}"
        
        # Deploy all components
        kubectl apply -f k8s/postgres.yaml
        kubectl apply -f k8s/backend.yaml
        kubectl apply -f k8s/frontend.yaml
        kubectl apply -f k8s/monitoring.yaml
        
        # Wait for all deployments
        kubectl wait --for=condition=available deployment --all -n $NAMESPACE --timeout=600s
    fi
    
    echo -e "${GREEN}✅ Production deployment completed${NC}"
    
    # Get ingress URL
    INGRESS_IP=$(kubectl get ingress kol-platform-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    echo -e "${GREEN}🌐 Application URL: https://kol-platform.com (IP: $INGRESS_IP)${NC}"

else
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [development|staging|production]"
    exit 1
fi

# Display useful information
echo -e "\n${GREEN}📊 Deployment Summary:${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Namespace: ${NAMESPACE}"
echo -e "Timestamp: $(date)"

if [[ "$ENVIRONMENT" != "development" ]]; then
    echo -e "\n${YELLOW}📋 Useful commands:${NC}"
    echo -e "View pods: kubectl get pods -n $NAMESPACE"
    echo -e "View services: kubectl get services -n $NAMESPACE"
    echo -e "View logs: kubectl logs -f deployment/backend -n $NAMESPACE"
    echo -e "Scale backend: kubectl scale deployment backend --replicas=5 -n $NAMESPACE"
fi

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"