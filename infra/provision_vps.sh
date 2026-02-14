#!/bin/bash

# PantryPilot VPS Provisioning Script
# Target: Ubuntu 24.04
# Purpose: Setup production environment for PantryPilot monolith

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"; exit 1; }

# System requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu 24.04" /etc/os-release; then
        error "This script requires Ubuntu 24.04"
    fi
    
    # Check for root privileges
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
    
    log "System requirements met"
}

# Update system
update_system() {
    log "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    apt-get install -y curl wget gnupg lsb-release ca-certificates
}

# Install Docker
install_docker() {
    log "Installing Docker..."
    
    # Remove old installations
    apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group (if not root)
    if [ "$SUDO_USER" ]; then
        usermod -aG docker "$SUDO_USER"
    fi
    
    log "Docker installed successfully"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js..."
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    
    # Install Node.js
    apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log "Node.js $node_version and npm $npm_version installed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured"
}

# Create application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    # Create directory
    mkdir -p /opt/pantrypilot
    chown "$SUDO_USER":"$SUDO_USER" /opt/pantrypilot
    
    log "Application directory created at /opt/pantrypilot"
}

# Main execution
main() {
    log "Starting PantryPilot VPS provisioning..."
    
    check_requirements
    update_system
    install_docker
    install_nodejs
    setup_firewall
    setup_app_directory
    
    log "VPS provisioning completed successfully!"
    log "Next steps:"
    log "1. Deploy your application to /opt/pantrypilot"
    log "2. Configure your domain and SSL"
    log "3. Run 'docker-compose up -d' to start services"
}

# Run main function
main "$@"
