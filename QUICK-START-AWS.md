# Quick Start: Deploy to AWS in 30 Minutes

This is the fastest path to get your RoomBnB app live on AWS.

## What You'll Need

- [X] AWS account (sign up at aws.amazon.com)
- [X] Credit card (for AWS, but we'll stay in free tier)
- [X] Cloudinary account (free: cloudinary.com/users/register_free)
- [ ] 30 minutes of time

## Step-by-Step Checklist

### Part 1: Prepare Locally (5 minutes)

1. **Get your Cloudinary credentials**:
   ```
   → Go to: https://cloudinary.com/console
   → Copy: Cloud Name, API Key, API Secret
   ```

2. **Generate a JWT secret**:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32

   # On Windows (PowerShell):
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```
   Save this string!

### Part 2: Launch AWS EC2 (10 minutes)

1. **Login to AWS Console** → Search "EC2" → Click "Launch Instance"

2. **Fill in these settings**:
   ```
   Name: roombnb-server
   OS: Ubuntu Server 22.04 LTS
   Instance type: t2.small (required, t2.micro will crash)
   Key pair: Create new → name: roombnb-key → Download .pem file
   ```

3. **Network settings** → Edit:
   ```
   ✓ Allow SSH traffic from: My IP
   ✓ Allow HTTP traffic from the internet
   ✓ Allow HTTPS traffic from the internet
   Add rule → Custom TCP → Port 5000 → Source: Anywhere
   ```

4. **Storage**: Change to 20 GB

5. **Launch instance** → Wait 2 minutes → Copy "Public IPv4 address"
   ```
   Your server IP: _13.56.82.217_ (write this down!)
   ```

### Part 3: Connect to Server (5 minutes)

**On Mac/Linux**:
```bash
# Move key to safe place
mv ~/Downloads/roombnb-key.pem ~/.ssh/
chmod 400 ~/.ssh/roombnb-key.pem

# Connect (replace YOUR_IP)
ssh -i ~/.ssh/roombnb-key.pem ubuntu@YOUR_IP
```

**On Windows** (use Git Bash or PowerShell):
```bash
# Set key permissions (PowerShell as Admin)
icacls roombnb-key.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"

# Connect (Git Bash or PowerShell)
ssh -i roombnb-key.pem ubuntu@YOUR_IP
```

### Part 4: Setup Server (5 minutes)

**Copy and paste this entire block into your SSH terminal**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose git -y

# Logout and login for docker group to take effect
exit
```

**SSH back in**:
```bash
ssh -i .ssh/roombnb-key.pem ubuntu@13.56.82.217  # or on Windows: ssh -i roombnb-key.pem ubuntu@13.56.82.217
```

### Part 5: Deploy Application (5 minutes)

```bash
# Clone repository (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/RoomBnB.git
cd RoomBnB

# Create environment file
nano .env
```

**Paste this and fill in your values**:
```env
JWT_SECRET=your_generated_secret_from_step_1_2
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Save: `Ctrl+X` → `Y` → `Enter`

**Update frontend API URL**:
```bash
nano docker-compose.yml
```

Find line 62 and change to your IP:
```yaml
- VITE_API_URL=http://YOUR_SERVER_IP:5000
```

Save: `Ctrl+X` → `Y` → `Enter`

**Deploy**:
```bash
# Start everything
docker-compose up -d --build

# This takes 5-10 minutes
# Watch the progress
docker-compose logs -f
```

Press `Ctrl+C` when you see "Server is running" (containers keep running)

**Run database setup**:
```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Add sample data (optional)
docker-compose exec backend npm run seed
```

**Check status**:
```bash
docker-compose ps

# Should show all 3 containers as "Up"
```

### Part 6: Test Your App

Open in your browser:
```
Frontend: http://YOUR_SERVER_IP
Backend API: http://YOUR_SERVER_IP:5000
```

## 🎉 Congratulations!

Your app is live! Here's what you have:

- ✅ Live RoomBnB application
- ✅ Running on AWS EC2
- ✅ PostgreSQL database
- ✅ Docker containerized
- ✅ Ready to show on your resume!

## What to Put on Your Resume

```
RoomBnB - Full-Stack Vacation Rental Platform
• Deployed full-stack MERN application to AWS EC2 using Docker containerization
• Configured PostgreSQL database with Prisma ORM and automated migrations
• Implemented nginx reverse proxy with SSL/TLS for production security
• Tech: React, Node.js, PostgreSQL, Docker, AWS EC2
• Live Demo: http://YOUR_SERVER_IP
```

## Next Steps (Optional)

### Add a Custom Domain

If you have a domain (like from Namecheap):

1. **Point domain to EC2**:
   - In your domain registrar, add an A record
   - Host: `@` or `roombnb`
   - Value: Your EC2 IP address
   - TTL: 300

2. **Install SSL certificate**:
   ```bash
   # On your EC2 server
   sudo apt install nginx certbot python3-certbot-nginx -y

   # Create Nginx config
   sudo nano /etc/nginx/sites-available/roombnb
   ```

   Paste (replace yourdomain.com):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

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
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

Now your site has HTTPS! 🔒

### Setup Auto-Deploy from GitHub

See `.github/workflows/deploy-to-aws.yml` for automatic deployment on git push.

### Setup Monitoring

```bash
# Run this to check server health
./scripts/monitor.sh
```

### Setup Automated Backups

```bash
# Backup database
./scripts/backup-db.sh

# Schedule daily backups
crontab -e
# Add this line:
0 2 * * * /home/ubuntu/RoomBnB/scripts/backup-db.sh
```

## Common Issues

**Can't connect to EC2**:
- Check security group allows SSH from your IP
- Verify key permissions: `chmod 400 roombnb-key.pem`

**Containers won't start**:
- Check if you used t2.small (t2.micro has insufficient memory)
- View logs: `docker-compose logs`

**Database connection failed**:
- Wait 30 seconds for database to initialize
- Check logs: `docker-compose logs postgres`

**Frontend can't reach backend**:
- Make sure you updated VITE_API_URL in docker-compose.yml
- Rebuild: `docker-compose up -d --build`

**Out of disk space**:
- Clean up Docker: `docker system prune -a`

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Update app after git push
git pull
docker-compose up -d --build

# Stop everything
docker-compose down

# Check server resources
./scripts/monitor.sh

# Backup database
./scripts/backup-db.sh
```

## Cost

- **t2.small EC2**: ~$17/month
- **20GB Storage**: ~$2/month
- **Data Transfer**: ~$1/month

**Total: ~$20/month**

To stop paying when not needed:
- Stop instance (not terminate): Pays only for storage (~$2/month)
- Create AMI snapshot before terminating: Can restore later

## Getting Help

- Full deployment guide: `AWS-DEPLOYMENT.md`
- AWS Documentation: https://docs.aws.amazon.com/ec2/
- Docker Documentation: https://docs.docker.com/

## Support

If you run into issues:
1. Check logs: `docker-compose logs`
2. Verify env variables: `cat .env`
3. Check container status: `docker-compose ps`
4. Review security groups in AWS console

Happy deploying! 🚀
