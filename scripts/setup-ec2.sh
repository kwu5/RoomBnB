#!/bin/bash

# EC2 Initial Setup Script
# Run this script on your EC2 instance after first login

set -e

echo "🚀 Setting up RoomBnB on EC2"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Docker
print_info "Installing Docker..."
if command -v docker &> /dev/null; then
    print_success "Docker already installed"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    print_success "Docker installed"
fi

# Install Docker Compose
print_info "Installing Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose already installed"
else
    sudo apt install docker-compose -y
    print_success "Docker Compose installed"
fi

# Install Git
print_info "Installing Git..."
if command -v git &> /dev/null; then
    print_success "Git already installed"
else
    sudo apt install git -y
    print_success "Git installed"
fi

# Install Nginx (for reverse proxy and SSL)
print_info "Installing Nginx..."
if command -v nginx &> /dev/null; then
    print_success "Nginx already installed"
else
    sudo apt install nginx -y
    print_success "Nginx installed"
fi

# Install Certbot (for SSL certificates)
print_info "Installing Certbot..."
if command -v certbot &> /dev/null; then
    print_success "Certbot already installed"
else
    sudo apt install certbot python3-certbot-nginx -y
    print_success "Certbot installed"
fi

# Configure firewall
print_info "Configuring UFW firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000/tcp  # Backend API
print_success "Firewall configured"

# Create directory structure
print_info "Creating directories..."
mkdir -p ~/backups
mkdir -p ~/logs
print_success "Directories created"

echo ""
echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Logout and login again for Docker permissions to take effect"
echo "2. Clone your repository: git clone https://github.com/YOUR_USERNAME/RoomBnB.git"
echo "3. Configure environment variables: cd RoomBnB && nano .env"
echo "4. Start the application: docker-compose up -d --build"
echo ""
print_info "Run: exit"
print_info "Then SSH back in to continue"
echo ""
