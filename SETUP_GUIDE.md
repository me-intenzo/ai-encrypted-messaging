# 🛠️ AI SecureChat - Complete Setup Guide

This comprehensive guide will walk you through setting up AI SecureChat from scratch, whether you're running it locally for development or deploying to production.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Docker Deployment](#-docker-deployment)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)

---

## 📦 Prerequisites

### Required Software

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| **Python** | 3.8+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | Included with Node.js |
| **Git** | 2.0+ | [git-scm.com](https://git-scm.com/) |
| **Docker** (optional) | 20.0+ | [docker.com](https://www.docker.com/) |

### Required Accounts

1. **Supabase Account** (Free tier available)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Gmail Account** (For OTP emails)
   - Enable 2-Factor Authentication
   - Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
   - Save the 16-character app password

### Verify Installation

```bash
# Check Python version
python --version  # Should be 3.8 or higher

# Check Node.js version
node --version    # Should be 18.0 or higher

# Check npm version
npm --version     # Should be 9.0 or higher

# Check Git version
git --version     # Should be 2.0 or higher
```

---

## 🚀 Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/me-intenzo/ai-encrypted-messaging.git

# Navigate to project directory
cd ai-encrypted-messaging

# Verify project structure
ls -la
# You should see: backend/, frontend/, database/, README.md, etc.
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
# Should show: fastapi, uvicorn, cryptography, scikit-learn, etc.
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
# Should show: next, react, tailwindcss, etc.
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Security - Generate a strong random key
SECRET_KEY=your_super_secret_jwt_key_min_32_characters_long

# RSA Encryption Keys (auto-generated if not provided)
RSA_PRIVATE_KEY_PATH=./keys/private_key.pem
RSA_PUBLIC_KEY_PATH=./keys/public_key.pem

# Gmail SMTP Configuration for OTP
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

#### How to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

#### How to Generate SECRET_KEY

```bash
# Python method
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use any random string generator (min 32 characters)
```

#### How to Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "AI SecureChat" and click **Generate**
6. Copy the 16-character password (no spaces)

### Frontend Environment Variables

Create `.env.local` file in the `frontend/` directory:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
# Supabase Configuration (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🗄️ Database Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Database Schema

Copy the contents of `database/schema.sql` and paste into the SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with OTP authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(32) NOT NULL,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    encrypted_content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('allowed', 'flagged', 'blocked')),
    ai_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    fuzzy_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    fuzzy_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_otp ON users(otp_code, otp_expires_at);
CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

Click **Run** to execute the schema.

### Step 3: Verify Database Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: `users` and `messages`

---

## ▶️ Running the Application

### Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already active)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start FastAPI server
python main.py

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

**Backend is now running at:** `http://localhost:8000`

Test backend health:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Start Frontend Server

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Start Next.js development server
npm run dev

# You should see:
# ▲ Next.js 15.5.2
# - Local:        http://localhost:3000
# - Ready in 2.5s
```

**Frontend is now running at:** `http://localhost:3000`

### Access the Application

1. Open browser and go to `http://localhost:3000`
2. You should see the AI SecureChat login page
3. Click "Sign up" to create an account

---

## 🐳 Docker Deployment

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)

### Step 1: Configure Environment

Create `.env` file in the **project root** directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Application Security
SECRET_KEY=your_super_secret_key_here

# Gmail SMTP Configuration
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Production Settings
NODE_ENV=production
PORT=8000
```

### Step 2: Build and Run Containers

```bash
# Build Docker images
docker-compose build

# Start containers in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check running containers
docker ps
```

### Step 3: Access Application

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

### Docker Management Commands

```bash
# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build

# Remove all containers and volumes
docker-compose down -v
```

---

## 🌐 Production Deployment

### Option 1: Railway + Vercel (Recommended)

**Cost**: ~$5-10/month | **Difficulty**: Easy | **Time**: 15 minutes

#### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select `backend` directory

3. **Configure Environment Variables**
   - Go to project settings → Variables
   - Add all variables from `backend/.env`:
     ```
     SUPABASE_URL=your_url
     SUPABASE_KEY=your_key
     SECRET_KEY=your_secret
     GMAIL_USER=your_email
     GMAIL_APP_PASSWORD=your_password
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Note your backend URL: `https://your-app.railway.app`

#### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select `frontend` directory as root

3. **Configure Environment Variables**
   - Add variables from `frontend/.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     NEXT_PUBLIC_API_URL=https://your-app.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `https://your-app.vercel.app`

### Option 2: Render (Full-Stack)

**Cost**: ~$7/month | **Difficulty**: Easy | **Time**: 20 minutes

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New" → "Web Service"
   - Connect repository
   - Configure:
     - **Name**: ai-securechat-backend
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: `backend`
   - Add environment variables
   - Click "Create Web Service"

3. **Deploy Frontend**
   - Click "New" → "Static Site"
   - Connect repository
   - Configure:
     - **Name**: ai-securechat-frontend
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `.next`
     - **Root Directory**: `frontend`
   - Add environment variables
   - Click "Create Static Site"

### Option 3: AWS (Enterprise)

**Cost**: Variable | **Difficulty**: Advanced | **Time**: 2-4 hours

#### Backend on AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init -p python-3.8 ai-securechat-backend

# Create environment
eb create production

# Set environment variables
eb setenv SUPABASE_URL=your_url SUPABASE_KEY=your_key SECRET_KEY=your_secret

# Deploy
eb deploy
```

#### Frontend on AWS Amplify

1. Go to AWS Amplify Console
2. Connect GitHub repository
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
   ```
4. Add environment variables
5. Deploy

### Option 4: DigitalOcean (Self-Hosted)

**Cost**: $12-24/month | **Difficulty**: Intermediate | **Time**: 1-2 hours

1. **Create Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select $12/month plan (2GB RAM)
   - Add SSH key

2. **SSH into Server**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Python
   apt install python3 python3-pip python3-venv -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install nodejs -y
   
   # Install Nginx
   apt install nginx -y
   
   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Clone and Setup**
   ```bash
   # Clone repository
   git clone https://github.com/me-intenzo/ai-encrypted-messaging.git
   cd ai-encrypted-messaging
   
   # Setup backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Setup frontend
   cd ../frontend
   npm install
   npm run build
   ```

5. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/ai-securechat
   server {
       listen 80;
       server_name your_domain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d your_domain.com
   ```

7. **Setup Process Manager**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start backend
   cd backend
   pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name backend
   
   # Start frontend
   cd ../frontend
   pm2 start "npm start" --name frontend
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Failed to fetch" or Connection Refused

**Symptoms**: Frontend can't connect to backend

**Solutions**:
```bash
# 1. Check if backend is running
curl http://localhost:8000/health

# 2. Verify NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be: http://localhost:8000 (for local dev)

# 3. Check CORS settings in backend/main.py
# Should allow your frontend origin

# 4. Restart both servers
# Terminal 1: cd backend && python main.py
# Terminal 2: cd frontend && npm run dev
```

#### Issue: "User not found" or "Invalid credentials"

**Symptoms**: Can't login or register

**Solutions**:
```bash
# 1. Verify database tables exist
# Run in Supabase SQL Editor:
SELECT * FROM users LIMIT 1;

# 2. Check Supabase credentials in .env files
# Both backend/.env and frontend/.env.local should have same values

# 3. Verify OTP email is being sent
# Check backend logs for email sending errors

# 4. Test with a fresh registration
# Use a new email address
```

#### Issue: OTP Email Not Received

**Symptoms**: No verification email after registration

**Solutions**:
```bash
# 1. Check Gmail App Password is correct (16 characters, no spaces)

# 2. Verify Gmail account has 2FA enabled

# 3. Check backend logs for SMTP errors
# Look for: "Failed to send email" or "Authentication failed"

# 4. Test Gmail credentials manually
python -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your_email@gmail.com', 'your_app_password')
print('Success!')
server.quit()
"

# 5. Check spam folder in recipient email
```

#### Issue: "Module not found" Errors

**Symptoms**: Import errors when starting backend

**Solutions**:
```bash
# 1. Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# 2. Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# 3. Check Python version
python --version  # Should be 3.8+

# 4. Clear pip cache
pip cache purge
pip install -r requirements.txt
```

#### Issue: Database Connection Errors

**Symptoms**: "Could not connect to database" or timeout errors

**Solutions**:
```bash
# 1. Verify Supabase project is active
# Go to supabase.com and check project status

# 2. Check SUPABASE_URL format
# Should be: https://xxxxx.supabase.co (no trailing slash)

# 3. Verify SUPABASE_KEY is the anon public key
# Not the service_role key

# 4. Test connection manually
python -c "
from supabase import create_client
client = create_client('your_url', 'your_key')
print('Connection successful!')
"
```

#### Issue: WebSocket Connection Failed

**Symptoms**: Real-time messages not working

**Solutions**:
```bash
# 1. Check WebSocket endpoint
# Should be: ws://localhost:8000/api/messages/ws/{user_id}

# 2. Verify user_id is correct UUID format

# 3. Check browser console for WebSocket errors

# 4. Test WebSocket connection
# Use browser console:
const ws = new WebSocket('ws://localhost:8000/api/messages/ws/test-user-id');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

#### Issue: Docker Container Crashes

**Symptoms**: Containers exit immediately after starting

**Solutions**:
```bash
# 1. Check container logs
docker-compose logs backend
docker-compose logs frontend

# 2. Verify .env file exists in project root

# 3. Check port conflicts
# Ensure ports 3000 and 8000 are not in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# 4. Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Issue: AI Model Training Errors

**Symptoms**: "Model training failed" or low accuracy

**Solutions**:
```bash
# 1. Verify training data files exist
ls backend/data/
# Should see: enhanced_spam.txt, enhanced_ham.txt, enhanced_toxic.txt

# 2. Check file encoding (should be UTF-8)

# 3. Ensure sufficient training samples (100+ per category)

# 4. Retrain model manually
cd backend
python -c "
from app.services.ai_classifier import AIClassifier
classifier = AIClassifier()
print('Model trained successfully!')
"
```

### Performance Issues

#### Slow Message Processing

```bash
# 1. Check AI model performance
# Look for: "AI Classification: ~50ms" in logs

# 2. Optimize database queries
# Add indexes if missing (see database/schema.sql)

# 3. Enable caching (future feature)

# 4. Monitor resource usage
# CPU and RAM should be < 80%
```

#### High Memory Usage

```bash
# 1. Restart services periodically
pm2 restart all

# 2. Limit concurrent connections
# Adjust in backend/main.py

# 3. Optimize AI model
# Reduce max_features in TfidfVectorizer

# 4. Use production build for frontend
npm run build && npm start
```

### Getting Help

If you're still experiencing issues:

1. **Check Logs**: Always check backend and frontend logs first
2. **Search Issues**: Look for similar issues on GitHub
3. **Create Issue**: Open a new issue with:
   - Detailed description
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Python version, Node version)
4. **Community**: Join discussions on GitHub Discussions

---

## 🧪 Testing

### Manual Testing

#### Test Registration Flow

```bash
# 1. Start both servers
# 2. Go to http://localhost:3000
# 3. Click "Sign up"
# 4. Enter:
#    - Email: test@example.com
#    - Username: testuser
#    - Password: Test123!
# 5. Check backend logs for OTP code
# 6. Enter OTP to verify account
# 7. Login with credentials
```

#### Test Messaging Flow

```bash
# 1. Register two users (user1 and user2)
# 2. Login as user1
# 3. Click "New Chat"
# 4. Enter user2's username
# 5. Send message: "Hello, this is a test"
# 6. Check message status (should be "allowed")
# 7. Login as user2 in another browser
# 8. Verify message received
```

#### Test AI Classification

```bash
# Test legitimate message
curl -X POST http://localhost:8000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "uuid1",
    "recipient_id": "uuid2",
    "content": "Hello, how are you today?"
  }'
# Expected: status = "allowed"

# Test spam message
curl -X POST http://localhost:8000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "uuid1",
    "recipient_id": "uuid2",
    "content": "CLICK HERE TO WIN $1000000 FREE MONEY!!!"
  }'
# Expected: status = "blocked" or "flagged"

# Test toxic message
curl -X POST http://localhost:8000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "uuid1",
    "recipient_id": "uuid2",
    "content": "You are stupid and I hate you"
  }'
# Expected: status = "blocked" or "flagged"
```

### Automated Testing (Future)

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

---

## 📚 Additional Resources

- **API Documentation**: `http://localhost:8000/docs` (when backend is running)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## ✅ Setup Checklist

Use this checklist to ensure everything is configured correctly:

### Prerequisites
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Gmail App Password generated

### Backend Setup
- [ ] Repository cloned
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created with all variables
- [ ] RSA keys generated (automatic on first run)
- [ ] Backend starts without errors (`python main.py`)
- [ ] Health check passes (`curl http://localhost:8000/health`)

### Frontend Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with all variables
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Can access `http://localhost:3000`

### Database Setup
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Tables created (`users`, `messages`)
- [ ] Indexes created
- [ ] RLS policies enabled

### Testing
- [ ] Can register new user
- [ ] OTP email received
- [ ] Can verify account
- [ ] Can login
- [ ] Can send message
- [ ] Can receive message
- [ ] AI classification working
- [ ] WebSocket connection working

### Production (if deploying)
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring setup

---

## 🎉 Success!

If you've completed all steps, your AI SecureChat application should be fully functional!

**Next Steps**:
1. Customize the UI to match your brand
2. Add more training data to improve AI accuracy
3. Implement additional features from the roadmap
4. Set up monitoring and analytics
5. Deploy to production

**Need Help?** Open an issue on GitHub or check the troubleshooting section above.

---

<div align="center">
  <p>Made with ❤️ by the AI SecureChat Team</p>
  <p>⭐ Star us on GitHub if this guide helped you!</p>
</div>
