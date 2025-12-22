# Pre-Deployment Checklist

Before deploying to AWS, make sure you have everything ready. This will save you time and prevent issues during deployment.

## ✅ Required Accounts

- [ ] **AWS Account**
  - Sign up at: https://aws.amazon.com/free/
  - Requires: Email, phone number, credit card
  - Cost: Free tier includes 750 hours/month of t2.micro (we'll use t2.small for $17/month)
  - Time to setup: 10 minutes

- [ ] **GitHub Account** (for code hosting)
  - Sign up at: https://github.com/signup
  - Push your RoomBnB code to a repository
  - Time to setup: 5 minutes if you haven't already

- [ ] **Cloudinary Account** (for image uploads)
  - Sign up at: https://cloudinary.com/users/register_free
  - Free tier: 25 GB storage, 25 GB bandwidth/month
  - After signup, go to Dashboard to get:
    - Cloud Name
    - API Key
    - API Secret
  - Time to setup: 5 minutes

## ⚙️ Required Software (Local Machine)

- [ ] **Git** (to clone your repository on EC2)
  - Check if installed: Open terminal and run `git --version`
  - If not installed:
    - Mac: Install Xcode Command Line Tools or Homebrew
    - Windows: https://git-scm.com/download/win
    - Linux: `sudo apt install git`

- [ ] **SSH Client**
  - Mac/Linux: Already installed
  - Windows: Use Git Bash (comes with Git) or PowerShell

## 📋 Information to Gather

Before starting deployment, collect these:

- [ ] **Cloudinary Credentials**
  ```
  Cloud Name: _________________
  API Key: _________________
  API Secret: _________________
  ```

- [ ] **JWT Secret**
  ```bash
  # Generate a secure random string:

  # On Mac/Linux:
  openssl rand -base64 32

  # On Windows PowerShell:
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

  # Save the output:
  JWT Secret: _________________
  ```

- [ ] **GitHub Repository URL**
  ```
  Your repo URL: https://github.com/_______________/RoomBnB
  ```

- [ ] **Stripe Keys** (Optional - only if you want payment features)
  ```
  Get from: https://dashboard.stripe.com/apikeys
  Secret Key: _________________
  Public Key: _________________
  ```

## 💰 Cost Breakdown

Here's what you'll pay for AWS:

**Monthly Costs**:
- EC2 t2.small (24/7): ~$17/month
- 20GB EBS Storage: ~$2/month
- Data Transfer (outbound): ~$0-5/month depending on traffic

**Total: ~$20-24/month**

**Free Tier Alternative**:
- Use t2.micro instead (FREE for 12 months)
- Warning: May run out of memory with your stack
- Not recommended for production/resume demo

**Cost-Saving Tips**:
- Stop EC2 when not actively demoing (pay only storage ~$2/month)
- Use AWS Budget alerts to monitor spending
- Set up billing alarm for >$25/month

## 🔒 Security Preparation

- [ ] **Never commit secrets to Git**
  - Check `.gitignore` includes `.env`
  - Verify: `cat .gitignore | grep .env`

- [ ] **Save your SSH key securely**
  - You'll download `roombnb-key.pem` from AWS
  - Don't lose this file (can't re-download)
  - Keep it in `~/.ssh/` directory

- [ ] **Note your security group IDs**
  - You'll configure these in AWS Console
  - Write down for reference

## 📝 Pre-Deploy Testing

Before deploying, test locally:

- [ ] **Test Docker build**
  ```bash
  docker-compose -f docker-compose.dev.yml up --build
  ```

- [ ] **Verify all features work**
  - [ ] User registration/login
  - [ ] Property listing
  - [ ] Property details
  - [ ] Booking system
  - [ ] Image uploads (requires Cloudinary)

- [ ] **Check for errors**
  ```bash
  docker-compose logs | grep -i error
  ```

- [ ] **Test production build**
  ```bash
  docker-compose -f docker-compose.yml up --build
  ```

## 🌐 Domain Setup (Optional)

If you want a custom domain (recommended for resume):

- [ ] **Purchase domain**
  - Recommended registrars:
    - Namecheap: ~$10/year
    - Google Domains: ~$12/year
    - AWS Route 53: ~$12/year

- [ ] **Have domain credentials ready**
  - Registrar login
  - DNS management access

## 📚 Documents to Read

- [ ] **Read QUICK-START-AWS.md** (overview of deployment process)
- [ ] **Read AWS-DEPLOYMENT.md** (detailed guide)
- [ ] **Bookmark AWS EC2 Console**: https://console.aws.amazon.com/ec2/

## 🎯 Deployment Path Decision

Choose your deployment approach before starting:

**Option 1: Simple EC2 (Recommended for beginners)**
- ✅ Everything on one server
- ✅ Easier to manage
- ✅ Lower cost (~$20/month)
- ✅ Good for portfolio/resume
- ❌ Less scalable
- **Follow**: QUICK-START-AWS.md

**Option 2: Production Architecture**
- ✅ Separate services (ECS, RDS, S3)
- ✅ Highly scalable
- ✅ Industry best practices
- ❌ More complex setup
- ❌ Higher cost (~$50/month)
- **Follow**: AWS-DEPLOYMENT.md (Option 2)

**My recommendation**: Start with Option 1, then migrate to Option 2 if needed.

## ⏱️ Time Estimate

**Total time for Option 1 (Simple EC2)**:
- AWS account setup: 10 minutes (one-time)
- EC2 instance launch: 10 minutes
- Server setup: 10 minutes
- Application deployment: 10 minutes
- Testing & verification: 5 minutes
- **Total: ~45 minutes**

**Total time for Option 2 (Production)**:
- Account setup: 10 minutes (one-time)
- RDS database: 15 minutes
- Backend deployment: 30 minutes
- Frontend deployment: 20 minutes
- Configuration & testing: 30 minutes
- **Total: ~2 hours**

## 🚦 Ready to Deploy?

If you can check all boxes above, you're ready! Follow these guides:

1. **Quick deployment** (30-45 min): `QUICK-START-AWS.md`
2. **Detailed guide**: `AWS-DEPLOYMENT.md`
3. **Helper scripts**: Available in `scripts/` directory

## ❓ FAQ

**Q: Do I need a credit card for AWS?**
A: Yes, AWS requires a credit card even for free tier. They'll charge $1 temporarily for verification.

**Q: Will I be charged immediately?**
A: You'll only be charged for what you use. t2.small costs ~$0.023/hour (~$17/month if running 24/7).

**Q: Can I stop the server when not in use?**
A: Yes! Stop (not terminate) the EC2 instance. You'll only pay for storage (~$2/month).

**Q: What if I exceed free tier?**
A: Set up billing alerts in AWS Console. You'll get email notifications before being charged.

**Q: Can I deploy for free?**
A: AWS free tier includes t2.micro (free for 12 months), but it may crash with this stack. Better to use Vercel + Render (see main README) for free deployment.

**Q: How do I delete everything after?**
A: Terminate EC2 instance, delete security groups, delete any snapshots. Check billing dashboard after 24 hours to confirm.

**Q: Do I need a domain?**
A: No, you can use the EC2 public IP. But a custom domain looks more professional on resumes.

---

## 🆘 Need Help?

- **During deployment**: Check `AWS-DEPLOYMENT.md` troubleshooting section
- **AWS issues**: https://docs.aws.amazon.com/
- **Docker issues**: `docker-compose logs -f`
- **Community**: AWS subreddit, Stack Overflow

---

Ready? Let's deploy! 🚀

**Start here**: [QUICK-START-AWS.md](QUICK-START-AWS.md)
