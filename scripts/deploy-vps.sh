#!/bin/bash

# Deployment script for VPS
# Deploy E-Learning Platform to VPS with Docker

set -e

echo "================================================"
echo "E-Learning Platform - VPS Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (update these values)
VPS_HOST="${VPS_HOST:-your-vps-ip}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
APP_DIR="${APP_DIR:-/opt/techblog}"
DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"

# Check if required variables are set
if [ "$VPS_HOST" = "your-vps-ip" ]; then
    echo -e "${RED}Error: Please set VPS_HOST environment variable${NC}"
    echo "Usage: VPS_HOST=1.2.3.4 VPS_USER=root ./scripts/deploy-vps.sh"
    exit 1
fi

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "VPS Host: $VPS_HOST"
echo "VPS User: $VPS_USER"
echo "VPS Port: $VPS_PORT"
echo "App Directory: $APP_DIR"
echo "Domain: $DOMAIN_NAME"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo -e "${YELLOW}Step 1: Preparing deployment package${NC}"

# Create deployment package
rm -rf ./deploy-package
mkdir -p ./deploy-package

# Copy necessary files
echo "Copying files..."
rsync -av \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='postgres_data' \
    --exclude='deploy-package' \
    --exclude='backup' \
    ./ ./deploy-package/

echo -e "${GREEN}✓ Deployment package prepared${NC}"

echo -e "${YELLOW}Step 2: Connecting to VPS${NC}"

# Test SSH connection
if ! ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'Connection successful'"; then
    echo -e "${RED}Error: Cannot connect to VPS${NC}"
    exit 1
fi

echo -e "${GREEN}✓ SSH connection successful${NC}"

echo -e "${YELLOW}Step 3: Installing dependencies on VPS${NC}"

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Update system
    echo "Updating system packages..."
    apt-get update

    # Install Docker if not installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi

    # Install Docker Compose if not installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        apt-get install -y docker-compose-plugin
    fi

    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        apt-get install -y nginx
    fi

    echo "Dependencies installed successfully"
ENDSSH

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 4: Uploading application files${NC}"

# Create app directory on VPS
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $APP_DIR"

# Upload files using rsync
rsync -avz -e "ssh -p $VPS_PORT" \
    --delete \
    ./deploy-package/ \
    $VPS_USER@$VPS_HOST:$APP_DIR/

echo -e "${GREEN}✓ Files uploaded${NC}"

echo -e "${YELLOW}Step 5: Configuring environment${NC}"

# Create .env file on VPS
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    cd $APP_DIR

    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cp .env.example .env

        # Generate secure passwords
        DB_PASSWORD=\$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

        # Update .env with generated values
        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=\$DB_PASSWORD|g" .env
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://techblog:\$DB_PASSWORD@postgres:5432/techblog?schema=public|g" .env
        sed -i "s|DOMAIN_NAME=.*|DOMAIN_NAME=https://$DOMAIN_NAME|g" .env

        echo "Environment file created with secure passwords"
    else
        echo ".env file already exists, skipping..."
    fi
ENDSSH

echo -e "${GREEN}✓ Environment configured${NC}"

echo -e "${YELLOW}Step 6: Building and starting Docker containers${NC}"

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    cd $APP_DIR

    # Stop existing containers
    echo "Stopping existing containers..."
    docker-compose down || true

    # Build and start containers
    echo "Building application..."
    docker-compose build --no-cache

    echo "Starting containers..."
    docker-compose up -d postgres

    # Wait for PostgreSQL
    echo "Waiting for PostgreSQL..."
    sleep 15

    # Run migrations
    echo "Running database migrations..."
    docker-compose run --rm app npx prisma migrate deploy

    # Start application
    echo "Starting application..."
    docker-compose up -d app

    echo "Containers started successfully"
ENDSSH

echo -e "${GREEN}✓ Application deployed${NC}"

echo -e "${YELLOW}Step 7: Configuring Nginx${NC}"

ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    # Backup existing Nginx config
    if [ -f /etc/nginx/sites-enabled/techblog ]; then
        cp /etc/nginx/sites-enabled/techblog /etc/nginx/sites-enabled/techblog.backup
    fi

    # Copy Nginx config
    cp $APP_DIR/nginx/nginx.conf /etc/nginx/sites-available/techblog

    # Update domain name
    sed -i "s|yourdomain.com|$DOMAIN_NAME|g" /etc/nginx/sites-available/techblog

    # Enable site
    ln -sf /etc/nginx/sites-available/techblog /etc/nginx/sites-enabled/techblog

    # Test Nginx config
    nginx -t

    # Reload Nginx
    systemctl reload nginx

    echo "Nginx configured successfully"
ENDSSH

echo -e "${GREEN}✓ Nginx configured${NC}"

echo -e "${YELLOW}Step 8: Setting up SSL with Let's Encrypt (optional)${NC}"

read -p "Do you want to set up SSL with Let's Encrypt? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
        # Install Certbot
        apt-get install -y certbot python3-certbot-nginx

        # Obtain SSL certificate
        certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME

        # Set up auto-renewal
        systemctl enable certbot.timer
        systemctl start certbot.timer

        echo "SSL certificate installed successfully"
ENDSSH
    echo -e "${GREEN}✓ SSL configured${NC}"
fi

echo -e "${YELLOW}Step 9: Verifying deployment${NC}"

# Check if application is running
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << ENDSSH
    cd $APP_DIR

    echo "Container status:"
    docker-compose ps

    echo ""
    echo "Application logs (last 20 lines):"
    docker-compose logs --tail=20 app
ENDSSH

# Test HTTP endpoint
echo "Testing application endpoint..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://$VPS_HOST:3000/api/count | grep -q "200"; then
    echo -e "${GREEN}✓ Application is responding${NC}"
else
    echo -e "${YELLOW}⚠ Application might still be starting up${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "================================================"
echo ""
echo "Your application is now running at:"
echo "- HTTP: http://$VPS_HOST"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "- HTTPS: https://$DOMAIN_NAME"
fi
echo ""
echo "Useful commands:"
echo "  View logs: ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker-compose logs -f app'"
echo "  Restart: ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker-compose restart'"
echo "  Stop: ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker-compose down'"
echo ""
echo "Remember to:"
echo "1. Set up firewall rules (allow ports 80, 443, 22)"
echo "2. Configure DNS to point to $VPS_HOST"
echo "3. Set up monitoring and backups"
echo "4. Review security settings"
echo ""
