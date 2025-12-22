# AWS Deployment Guide for RoomBnB

This guide covers deploying your RoomBnB application to AWS using two different approaches.

## Prerequisites

Before starting, you'll need:
- AWS Account (free tier eligible)
- AWS CLI installed locally
- Domain name (optional but recommended for resume)
- Your Cloudinary and Stripe API keys

## Option 1: Simple EC2 Deployment (Recommended for Start)

**Cost**: ~$10-15/month | **Setup Time**: 30-45 minutes | **Difficulty**: Beginner

This approach runs everything (frontend, backend, database) on a single EC2 instance using Docker Compose.

### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → Navigate to EC2

2. **Click "Launch Instance"**

3. **Configure Instance:**
   - **Name**: `roombnb-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t2.small` (1GB RAM minimum, t2.micro is too small)
     - Note: t2.small costs ~$17/month but t2.micro will crash with this stack
   - **Key pair**: Create new key pair
     - Name: `roombnb-key`
     - Type: RSA
     - Format: .pem
     - **Download and save this file securely!**

4. **Network Settings:**
   - Click "Edit"
   - **Allow SSH** from "My IP"
   - **Add Security Group Rule**: HTTP (port 80) from Anywhere (0.0.0.0/0)
   - **Add Security Group Rule**: HTTPS (port 443) from Anywhere (0.0.0.0/0)
   - **Add Security Group Rule**: Custom TCP (port 5000) from Anywhere (0.0.0.0/0) - for API

5. **Storage**: 20 GB gp3 (free tier includes 30GB)

6. **Click "Launch Instance"**

7. **Wait 2-3 minutes** for instance to be running

8. **Note your Public IP**: Click on instance → Copy "Public IPv4 address"

### Step 2: Connect to EC2 Instance

```bash
# Set permissions on your key file (one-time)
chmod 400 ~/Downloads/roombnb-key.pem

# SSH into your server (replace YOUR_PUBLIC_IP)
ssh -i ~/Downloads/roombnb-key.pem ubuntu@YOUR_PUBLIC_IP
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Install Git
sudo apt install git -y

# Logout and login again for docker group to take effect
exit
```

SSH back in:
```bash
ssh -i ~/Downloads/roombnb-key.pem ubuntu@YOUR_PUBLIC_IP
```

### Step 4: Clone and Configure Your Project

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/RoomBnB.git
cd RoomBnB

# Create environment file
nano .env
```

Add these environment variables (paste and edit):
```env
# JWT
JWT_SECRET=your_secure_random_string_here_change_this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Update Frontend API URL

```bash
# Edit docker-compose.yml to use server IP for frontend
nano docker-compose.yml
```

Change line 62 from:
```yaml
- VITE_API_URL=http://localhost:5000
```

To (replace YOUR_PUBLIC_IP):
```yaml
- VITE_API_URL=http://YOUR_PUBLIC_IP:5000
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Deploy Application

```bash
# Build and start all services
docker-compose up -d --build

# This will take 5-10 minutes on first run
# Watch the logs
docker-compose logs -f
```

Press `Ctrl+C` to stop watching logs (containers keep running)

### Step 7: Run Database Migrations

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database with sample data (optional)
docker-compose exec backend npm run seed
```

### Step 8: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Should show:
# - roombnb-postgres (healthy)
# - roombnb-backend (running)
# - roombnb-frontend (running)
```

### Step 9: Access Your Application

Open in browser:
- **Frontend**: `http://YOUR_PUBLIC_IP`
- **Backend API**: `http://YOUR_PUBLIC_IP:5000`

### Step 10: Set Up Auto-Restart on Reboot

```bash
# Create systemd service
sudo nano /etc/systemd/system/roombnb.service
```

Paste this (replace YOUR_USERNAME with ubuntu):
```ini
[Unit]
Description=RoomBnB Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/RoomBnB
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable roombnb
sudo systemctl start roombnb
```

### Step 11: Add Custom Domain (Optional but Recommended)

If you have a domain (e.g., from Namecheap, GoDaddy):

1. **In your domain registrar**:
   - Add an A record pointing to your EC2 Public IP
   - Example: `roombnb.yourdomain.com` → `YOUR_PUBLIC_IP`

2. **Install Nginx as reverse proxy**:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/roombnb
```

Paste this (replace your-domain.com):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/roombnb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get free SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Maintenance Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Update application (after git push)
cd ~/RoomBnB
git pull
docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U roombnb roombnb > backup.sql

# Stop everything
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## Option 2: Production Architecture

**Cost**: ~$30-50/month | **Setup Time**: 2-3 hours | **Difficulty**: Intermediate

Better scalability and separation of concerns. Use this if you need:
- Auto-scaling
- High availability
- Separate database backups
- Production-grade setup

### Architecture Overview

```
Internet
   ↓
CloudFront (CDN)
   ↓
S3 (Frontend Static Files)

Internet
   ↓
Application Load Balancer
   ↓
ECS/Fargate (Backend Containers)
   ↓
RDS PostgreSQL (Database)
```

### Components

1. **Frontend**: S3 + CloudFront
2. **Backend**: ECS Fargate or Elastic Beanstalk
3. **Database**: RDS PostgreSQL
4. **File Storage**: Cloudinary (already configured)

### Step-by-Step Guide

#### Part 1: Database (RDS PostgreSQL)

1. **Go to RDS Console** → Create Database

2. **Choose**:
   - Engine: PostgreSQL 15
   - Template: Free tier (or Dev/Test)
   - DB Instance: db.t3.micro (free tier) or db.t4g.micro

3. **Settings**:
   - DB instance identifier: `roombnb-db`
   - Master username: `roombnb`
   - Master password: (create secure password, save it!)

4. **Storage**: 20 GB gp3

5. **Connectivity**:
   - VPC: Default
   - Public access: Yes (for now, secure later)
   - Security group: Create new `roombnb-db-sg`

6. **Additional**:
   - Initial database name: `roombnb`
   - Automated backups: Enable (7 days)

7. **Create Database** (takes 5-10 minutes)

8. **Configure Security Group**:
   - Go to Security Groups
   - Edit `roombnb-db-sg` inbound rules
   - Add PostgreSQL (port 5432) from your backend security group (we'll create this next)

#### Part 2: Backend (Choose A or B)

**Option A: Elastic Beanstalk (Easier)**

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **In your backend folder**:
```bash
cd backend

# Initialize EB
eb init -p docker roombnb-backend --region us-east-1

# Create environment
eb create roombnb-backend-prod

# Set environment variables
eb setenv \
  DATABASE_URL="postgresql://roombnb:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/roombnb" \
  JWT_SECRET="your_jwt_secret" \
  CLOUDINARY_CLOUD_NAME="your_name" \
  CLOUDINARY_API_KEY="your_key" \
  CLOUDINARY_API_SECRET="your_secret"

# Deploy
eb deploy
```

**Option B: ECS Fargate (More Control)**

1. **Create ECR Repository**:
```bash
aws ecr create-repository --repository-name roombnb-backend
```

2. **Build and Push Docker Image**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
cd backend
docker build -t roombnb-backend .

# Tag and push
docker tag roombnb-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/roombnb-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/roombnb-backend:latest
```

3. **Create ECS Cluster** (in AWS Console):
   - Go to ECS → Create Cluster
   - Name: `roombnb-cluster`
   - Infrastructure: AWS Fargate

4. **Create Task Definition**:
   - Go to Task Definitions → Create new
   - Launch type: Fargate
   - Task memory: 1GB
   - Task CPU: 0.5 vCPU
   - Container definitions:
     - Name: roombnb-backend
     - Image: YOUR_ECR_IMAGE_URL
     - Port mappings: 5000
     - Environment variables: (add all from .env)

5. **Create Service**:
   - Launch type: Fargate
   - Service name: roombnb-backend-service
   - Number of tasks: 1
   - Load balancer: Create Application Load Balancer

#### Part 3: Frontend (S3 + CloudFront)

1. **Build Frontend Locally**:
```bash
cd frontend

# Update .env.production
echo "VITE_API_URL=https://your-backend-url.com" > .env.production

# Build
npm run build
```

2. **Create S3 Bucket**:
   - Go to S3 → Create bucket
   - Name: `roombnb-frontend-YOUR_UNIQUE_ID`
   - Region: us-east-1
   - Uncheck "Block all public access"
   - Enable static website hosting

3. **Upload Build**:
```bash
aws s3 sync dist/ s3://roombnb-frontend-YOUR_UNIQUE_ID/
```

4. **Create CloudFront Distribution**:
   - Go to CloudFront → Create Distribution
   - Origin domain: Your S3 bucket website endpoint
   - Viewer protocol: Redirect HTTP to HTTPS
   - Default root object: index.html

5. **Configure Error Pages**:
   - Error pages → Create custom error response
   - HTTP error code: 404
   - Customize error response: Yes
   - Response page path: /index.html
   - HTTP response code: 200

### Cost Breakdown (Monthly)

**Option 1 (Simple EC2)**:
- t2.small EC2: ~$17
- 20GB Storage: ~$2
- Data transfer: ~$1
- **Total: ~$20/month**

**Option 2 (Production)**:
- RDS db.t3.micro: ~$15
- ECS Fargate: ~$15
- ALB: ~$16
- S3 + CloudFront: ~$1-5
- **Total: ~$47-52/month**

### Monitoring

**CloudWatch Logs**:
- EC2: `sudo journalctl -u roombnb -f`
- ECS: Automatically sent to CloudWatch
- RDS: Performance Insights (enable in console)

**Set up Alarms**:
- CPU > 80%
- Memory > 80%
- Disk space < 20%

---

## Next Steps After Deployment

1. **Set up CI/CD** with GitHub Actions
2. **Configure custom domain** with Route 53
3. **Enable HTTPS** with Certificate Manager
4. **Set up monitoring** with CloudWatch
5. **Configure backups** (RDS automated + manual snapshots)
6. **Add Redis** for caching (ElastiCache)

## Troubleshooting

**Can't connect to EC2**:
- Check security group allows SSH from your IP
- Verify key file permissions: `chmod 400 roombnb-key.pem`

**Docker containers won't start**:
- Check logs: `docker-compose logs`
- Verify environment variables: `docker-compose config`

**Database connection failed**:
- Check DATABASE_URL is correct
- RDS security group allows connections
- Database is publicly accessible (for testing)

**Frontend can't reach backend**:
- Check CORS settings in backend
- Verify API URL in frontend .env
- Security group allows traffic on port 5000

## Security Checklist

- [ ] Changed default passwords
- [ ] Using environment variables (not hardcoded secrets)
- [ ] Security groups restrict access (not 0.0.0.0/0 for database)
- [ ] HTTPS enabled
- [ ] Regular backups enabled
- [ ] CloudWatch monitoring active
- [ ] IAM roles follow least privilege

---

## Resume Tips

**What to put on your resume**:
```
RoomBnB - Full-Stack Airbnb Clone
• Deployed React + Node.js application on AWS using EC2, Docker, and PostgreSQL
• Implemented CI/CD pipeline with automated deployments
• Configured Nginx reverse proxy with SSL/TLS certificates
• Live Demo: https://your-domain.com
```

**For AWS-specific roles, mention**:
- EC2, RDS, S3, CloudFront, ECS (whichever you used)
- Docker containerization
- Security groups and VPC configuration
- CloudWatch monitoring

Good luck with your deployment!
