#!/bin/bash

# Banking App Deployment Script
# This script builds, pushes, and deploys the banking application to Kubernetes

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="registry.edgaryasociados.synology.me"
IMAGE_NAME="banking-app"
IMAGE_TAG="latest"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
DEPLOYMENT_NAME="banking-app"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists kubectl; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if kubectl can connect to cluster
print_info "Checking Kubernetes cluster connection..."
if ! kubectl cluster-info &>/dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubectl configuration."
    exit 1
fi

CLUSTER_INFO=$(kubectl cluster-info | head -n 1)
print_success "Connected to cluster: ${CLUSTER_INFO}"

# Login to Docker registry
print_info "Logging in to Docker registry: ${REGISTRY}"
echo "siq7hVFNE7DHP2EGHCku" | docker login ${REGISTRY} -u admin --password-stdin

if [ $? -eq 0 ]; then
    print_success "Successfully logged in to Docker registry"
else
    print_error "Failed to login to Docker registry"
    exit 1
fi

# Build Docker image
print_info "Building Docker image: ${FULL_IMAGE}"
print_info "Platform: linux/amd64 (required for Kubernetes nodes)"

docker buildx build \
    --platform linux/amd64 \
    -t ${FULL_IMAGE} \
    --push \
    .

if [ $? -eq 0 ]; then
    print_success "Docker image built and pushed successfully"
else
    print_error "Failed to build and push Docker image"
    exit 1
fi

# Update Kubernetes deployment
print_info "Updating Kubernetes deployment: ${DEPLOYMENT_NAME}"

# Check if deployment exists
if ! kubectl get deployment ${DEPLOYMENT_NAME} &>/dev/null; then
    print_warning "Deployment '${DEPLOYMENT_NAME}' not found. Applying all Kubernetes resources..."
    kubectl apply -f k8s/

    if [ $? -eq 0 ]; then
        print_success "Kubernetes resources created successfully"
    else
        print_error "Failed to create Kubernetes resources"
        exit 1
    fi
else
    # Deployment exists, just restart it
    print_info "Restarting deployment to pull new image..."
    kubectl rollout restart deployment/${DEPLOYMENT_NAME}

    if [ $? -eq 0 ]; then
        print_success "Deployment restarted successfully"
    else
        print_error "Failed to restart deployment"
        exit 1
    fi
fi

# Wait for rollout to complete
print_info "Waiting for rollout to complete..."
kubectl rollout status deployment/${DEPLOYMENT_NAME} --timeout=5m

if [ $? -eq 0 ]; then
    print_success "Rollout completed successfully"
else
    print_error "Rollout failed or timed out"
    exit 1
fi

# Get deployment status
print_info "Checking deployment status..."
echo ""
kubectl get pods -l app=${DEPLOYMENT_NAME}
echo ""

# Get running pods count
READY_PODS=$(kubectl get pods -l app=${DEPLOYMENT_NAME} -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l | xargs)
TOTAL_PODS=$(kubectl get pods -l app=${DEPLOYMENT_NAME} --no-headers | wc -l | xargs)

echo ""
print_success "Deployment complete! ${READY_PODS}/${TOTAL_PODS} pods are ready"

# Show service information
print_info "Service information:"
kubectl get svc banking-app-service

echo ""
print_success "=== Deployment Summary ==="
echo -e "  ${GREEN}✓${NC} Image: ${FULL_IMAGE}"
echo -e "  ${GREEN}✓${NC} Deployment: ${DEPLOYMENT_NAME}"
echo -e "  ${GREEN}✓${NC} Pods Ready: ${READY_PODS}/${TOTAL_PODS}"
echo -e "  ${GREEN}✓${NC} Service: banking-app-service"
echo ""

print_info "To view logs, run:"
echo "  kubectl logs -l app=${DEPLOYMENT_NAME} --tail=100 -f"
echo ""

print_info "To test the API (port-forward):"
echo "  kubectl port-forward svc/banking-app-service 8080:80"
echo "  curl http://localhost:8080/api/users"
echo ""

print_success "Deployment script completed successfully! 🚀"
