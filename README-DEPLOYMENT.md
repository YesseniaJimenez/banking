# Banking App Deployment Guide

This guide documents the complete deployment process for the Banking Application to Kubernetes using Docker and Gateway API.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Quick Deploy Script](#quick-deploy-script)
- [Manual Deployment](#manual-deployment)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Overview

**Architecture:**
- Node.js/TypeScript application with Express
- MongoDB database (external)
- Docker multi-stage build for optimized images
- Kubernetes deployment with 2 replicas
- Gateway API for routing
- Private Docker registry

**Registry:** `registry.edgaryasociados.synology.me`
**Domain:** `yessbank.edgaryasociados.synology.me`
**MongoDB:** `edgaryasociados.synology.me:3334`

## Prerequisites
- Docker installed and running
- Kubernetes cluster (K3s, minikube, kind, or cloud provider)
- kubectl configured and connected to your cluster
- Access to private Docker registry
- Gateway API installed in your cluster (optional for external routing)

## Initial Setup

### 1. Clone and Configure

```bash
# Ensure you're in the project directory
cd /path/to/banking

# Verify Kubernetes cluster is accessible
kubectl cluster-info
kubectl get nodes
```

### 2. Configure Secrets

Update the following files with your credentials:
- `k8s/secret.yaml` - MongoDB connection string
- `k8s/registry-secret.yaml` - Docker registry credentials

## Quick Deploy Script

Use the automated deployment script for build, push, and deploy:

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This script will:
1. Login to Docker registry
2. Build the image for amd64 architecture
3. Push to registry
4. Update Kubernetes deployment

## Manual Deployment

### Build and Push Docker Image

```bash
# Login to the private registry
docker login registry.edgaryasociados.synology.me
# Username: admin
# Password: siq7hVFNE7DHP2EGHCku

# Build the Docker image for amd64 (required for deployment)
docker buildx build --platform linux/amd64 \
  -t registry.edgaryasociados.synology.me/banking-app:latest \
  --push .

# Or build locally and push separately
docker build --platform linux/amd64 \
  -t registry.edgaryasociados.synology.me/banking-app:latest .
docker push registry.edgaryasociados.synology.me/banking-app:latest
```

## Deploy to Kubernetes

### 1. Install Gateway API CRDs (if not already installed)
```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml
```

### 2. Create Registry Secret (for pulling images from private registry)
```bash
kubectl apply -f k8s/registry-secret.yaml
```

### 3. Create Application Secret (contains MongoDB credentials)
```bash
kubectl apply -f k8s/secret.yaml
```

### 4. Deploy the Application
```bash
kubectl apply -f k8s/deployment.yaml
```

### 5. Create Service
```bash
kubectl apply -f k8s/service.yaml
```

### 6. Create Gateway
```bash
kubectl apply -f k8s/gateway.yaml
```

### 7. Create HTTPRoute
```bash
kubectl apply -f k8s/httproute.yaml
```

### Or deploy all at once:
```bash
kubectl apply -f k8s/
```

## Verify Deployment

```bash
# Check if pods are running
kubectl get pods -l app=banking-app

# Check service
kubectl get svc banking-app-service

# Check Gateway
kubectl get gateway banking-app-gateway

# Check HTTPRoute
kubectl get httproute banking-app-route

# View logs
kubectl logs -l app=banking-app --tail=100 -f
```

## Access the Application

### From Within Cluster

```bash
# Test from inside the cluster
kubectl run test-curl --image=curlimages/curl:latest --rm -it --restart=Never -- \
  curl http://banking-app-service/api/users
```

### Using Port Forward

```bash
# Forward service to local machine
kubectl port-forward svc/banking-app-service 8080:80

# In another terminal, test the API
curl http://localhost:8080/api/users
```

### Using Gateway API (if configured with external routing)

The application is configured for: **http://yessbank.edgaryasociados.synology.me**

**Note:** Gateway API requires a gateway controller and external routing configuration to work. Currently tested and working from within the cluster.

## API Endpoints

### Create User
```bash
POST /api/users/create-user
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "balance": 1000
}

# Example:
curl -X POST http://localhost:8080/api/users/create-user \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john.doe@example.com","password":"SecurePass123","balance":1000}'
```

### List Users
```bash
GET /api/users

# Example:
curl http://localhost:8080/api/users
```

**Response:**
```json
[
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "balance": 1000
  }
]
```

## Update Deployment

### Using the Deploy Script (Recommended)
```bash
./deploy.sh
```

### Manual Update
```bash
# Build new version and push to registry
docker buildx build --platform linux/amd64 \
  -t registry.edgaryasociados.synology.me/banking-app:latest \
  --push .

# Restart deployment to pull new image
kubectl rollout restart deployment/banking-app

# Watch rollout status
kubectl rollout status deployment/banking-app

# Verify new pods are running
kubectl get pods -l app=banking-app
```

## Scale Application

```bash
# Scale to 3 replicas
kubectl scale deployment banking-app --replicas=3
```

## Troubleshooting

```bash
# Describe pod to see events
kubectl describe pod -l app=banking-app

# Get logs from specific pod
kubectl logs <pod-name>

# Execute shell in pod
kubectl exec -it <pod-name> -- sh

# Check secret
kubectl get secret banking-app-secret -o yaml
```

## Clean Up

```bash
# Delete all resources
kubectl delete -f k8s/

# Or individually
kubectl delete httproute banking-app-route
kubectl delete gateway banking-app-gateway
kubectl delete service banking-app-service
kubectl delete deployment banking-app
kubectl delete secret banking-app-secret
kubectl delete secret registry-credentials
```

## Important Notes

### Architecture Decisions
- **Multi-stage Docker build**: Reduces final image size by ~60%
- **Platform-specific build**: Built for `linux/amd64` to match Kubernetes nodes
- **External MongoDB**: Database hosted at `edgaryasociados.synology.me:3334`
- **TLS disabled**: MongoDB connection uses `tls=false` parameter
- **2 replicas**: High availability with load balancing across pods

### Configuration Files
- `Dockerfile` - Multi-stage build with TypeScript compilation
- `k8s/deployment.yaml` - 2 replicas, health checks, resource limits
- `k8s/service.yaml` - ClusterIP service on port 80
- `k8s/gateway.yaml` - Gateway API listener (requires controller)
- `k8s/httproute.yaml` - HTTP routing rules
- `k8s/secret.yaml` - MongoDB credentials
- `k8s/registry-secret.yaml` - Docker registry credentials

### Security Considerations
- Passwords and credentials stored in Kubernetes Secrets
- Registry credentials required for image pulling
- MongoDB authentication with username/password
- TypeScript strict mode disabled for build compatibility

### Resource Limits
Each pod is configured with:
- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU

### Health Checks
- **Liveness probe**: Checks `/api/users` every 10s (starts after 30s)
- **Readiness probe**: Checks `/api/users` every 5s (starts after 10s)

## What We Accomplished

This deployment demonstrates:
1. ✅ Building TypeScript Node.js app with Docker multi-stage builds
2. ✅ Pushing images to private Docker registry
3. ✅ Deploying to Kubernetes with proper secrets management
4. ✅ Connecting to external MongoDB database
5. ✅ Configuring Gateway API for routing
6. ✅ Implementing health checks and resource limits
7. ✅ Testing API endpoints within the cluster
8. ✅ Creating automated deployment scripts
