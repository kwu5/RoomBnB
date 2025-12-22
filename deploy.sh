#!/bin/bash

# RoomBnB Deployment Script for EC2
# This script helps with deploying updates to your EC2 server

set -e  # Exit on error

echo "🚀 RoomBnB Deployment Script"
echo "=============================="
echo ""

# Configuration
SERVER_USER="ubuntu"
SERVER_HOST=""  # Will be set below
KEY_FILE=""     # Will be set below
PROJECT_DIR="RoomBnB"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if configuration exists
if [ ! -f "deploy.config" ]; then
    print_info "First time setup - creating deploy.config"
    echo "# Deployment Configuration" > deploy.config
    echo "# Edit this file with your EC2 details" >> deploy.config
    echo "" >> deploy.config
    echo "SERVER_HOST=your.ec2.public.ip" >> deploy.config
    echo "KEY_FILE=path/to/your/roombnb-key.pem" >> deploy.config
    echo "" >> deploy.config
    print_info "Please edit deploy.config with your server details, then run this script again"
    exit 0
fi

# Load configuration
source deploy.config

# Validate configuration
if [ -z "$SERVER_HOST" ] || [ "$SERVER_HOST" = "your.ec2.public.ip" ]; then
    print_error "Please set SERVER_HOST in deploy.config"
    exit 1
fi

if [ -z "$KEY_FILE" ] || [ "$KEY_FILE" = "path/to/your/roombnb-key.pem" ]; then
    print_error "Please set KEY_FILE in deploy.config"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    print_error "Key file not found: $KEY_FILE"
    exit 1
fi

echo "Deploying to: $SERVER_USER@$SERVER_HOST"
echo ""

# Step 1: Test SSH connection
print_info "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo 'Connection successful'" > /dev/null 2>&1; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to server. Check your SERVER_HOST and KEY_FILE"
    exit 1
fi

# Step 2: Check if project exists on server
print_info "Checking if project exists on server..."
if ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_HOST" "[ -d $PROJECT_DIR ]"; then
    print_success "Project directory found"
    FIRST_DEPLOY=false
else
    print_error "Project directory not found. Run initial setup first (see AWS-DEPLOYMENT.md)"
    exit 1
fi

# Step 3: Pull latest changes
print_info "Pulling latest changes from Git..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd RoomBnB
git fetch origin
git pull origin main
EOF
print_success "Code updated"

# Step 4: Rebuild and restart containers
print_info "Rebuilding and restarting Docker containers..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd RoomBnB
docker-compose down
docker-compose up -d --build
EOF
print_success "Containers restarted"

# Step 5: Run database migrations
print_info "Running database migrations..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd RoomBnB
docker-compose exec -T backend npx prisma migrate deploy
EOF
print_success "Migrations complete"

# Step 6: Check container health
print_info "Checking container health..."
sleep 5  # Wait for containers to stabilize
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd RoomBnB
docker-compose ps
EOF

echo ""
print_success "Deployment complete!"
echo ""
echo "🌐 Your app should be live at: http://$SERVER_HOST"
echo ""
echo "To view logs, run:"
echo "  ssh -i $KEY_FILE $SERVER_USER@$SERVER_HOST 'cd RoomBnB && docker-compose logs -f'"
echo ""
