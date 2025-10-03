# 🤖 Job Automation Integration Setup Guide

This guide walks you through setting up the complete job automation system using Skyvern + your existing ReactiveResumeTracker.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Client   │    │  Your Server    │    │ Automation      │
│   (React)       │◄──►│   (NestJS)      │◄──►│ Engine          │
│   Port: 5173    │    │   Port: 3000    │    │ Port: 3001      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                       ▲
                                │                       │
                                ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database (PostgreSQL)                    │
│                          Port: 5432                             │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │ reactive_resume │              │    skyvern      │           │
│  │   (main app)    │              │  (automation)   │           │
│  └─────────────────┘              └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │        Skyvern              │
                 │  (Browser Automation)       │
                 │    Port: 8000 (API)        │
                 │    Port: 8080 (UI)         │
                 └─────────────────────────────┘
```

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.automation .env
```

Edit `.env` and add your LLM API key:
```bash
# Choose ONE provider:
OPENAI_API_KEY=your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 2. Install Dependencies

```bash
# Install automation engine dependencies
cd apps/automation-engine
pnpm install

# Go back to root
cd ../..

# Install any additional dependencies
pnpm install
```

### 3. Start the Complete System

```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.automation.yml up -d

# Wait for services to start (about 30-60 seconds)
# Check status
docker-compose -f docker-compose.automation.yml ps
```

### 4. Verify Installation

Run the test script to verify everything is working:

**On Linux/Mac:**
```bash
./scripts/test-automation.sh
```

**On Windows:**
```bash
bash scripts/test-automation.sh
```

**Manual Testing:**
Visit these URLs to verify services:
- 🌐 Your App: http://localhost:3000
- 🤖 Automation Engine: http://localhost:3001
- 🔧 Skyvern API: http://localhost:8000
- 🖥️ Skyvern UI: http://localhost:8080

## 📋 Available Automation Endpoints

Your main server now has these new automation endpoints:

### 1. Execute Automation
```
POST /api/job-applications/automation/execute
```

**Example:**
```json
{
  "instruction": "Find React developer jobs on LinkedIn and apply to 3 of them",
  "targetUrl": "https://linkedin.com/jobs",
  "jobCriteria": {
    "keywords": ["React", "Frontend"],
    "location": "Remote",
    "salaryMin": 100000,
    "remote": true,
    "experienceLevel": "mid"
  },
  "maxApplications": 3,
  "autoApply": true
}
```

### 2. Job Hunting Campaign
```
POST /api/job-applications/automation/job-hunt
```

**Example:**
```json
{
  "jobBoards": ["linkedin", "indeed", "glassdoor"],
  "searchTerms": ["React Developer", "Frontend Engineer"],
  "filters": {
    "keywords": ["React", "JavaScript", "TypeScript"],
    "location": "San Francisco",
    "salaryMin": 120000,
    "remote": true,
    "experienceLevel": "mid"
  },
  "maxApplicationsPerDay": 10,
  "autoApplyEnabled": true
}
```

### 3. Quick Job Search
```
POST /api/job-applications/automation/quick-search
```

**Example:**
```json
{
  "jobBoard": "linkedin",
  "searchTerm": "React Developer",
  "location": "Remote",
  "applyAutomatically": false
}
```

### 4. LinkedIn Automation
```
POST /api/job-applications/automation/linkedin
```

**Example:**
```json
{
  "action": "apply",
  "searchTerm": "Senior Frontend Developer",
  "location": "New York",
  "maxApplications": 5,
  "connectWithRecruiters": true
}
```

## 🔧 Development Workflow

### Start Individual Services (Development Mode)

**Terminal 1 - Skyvern:**
```bash
cd services/skyvern
python -m pip install -r requirements.txt
python -m skyvern
# Runs on http://localhost:8000
```

**Terminal 2 - Automation Engine:**
```bash
cd apps/automation-engine
pnpm start:dev
# Runs on http://localhost:3001
```

**Terminal 3 - Main Server:**
```bash
cd apps/server
pnpm start:dev
# Runs on http://localhost:3000
```

**Terminal 4 - Client:**
```bash
cd apps/client
pnpm start:dev
# Runs on http://localhost:5173
```

## 🎯 Testing Your Integration

### 1. Test Basic Automation

```bash
curl -X POST http://localhost:3001/api/automation/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "instruction": "Search for React jobs on Indeed",
    "targetUrl": "https://indeed.com",
    "autoApply": false,
    "maxApplications": 2
  }'
```

### 2. Test Integration with Main Server

```bash
curl -X POST http://localhost:3000/api/job-applications/automation/quick-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "jobBoard": "indeed",
    "searchTerm": "React Developer",
    "location": "Remote",
    "applyAutomatically": false
  }'
```

## 🐛 Troubleshooting

### Common Issues

**1. Skyvern fails to start:**
- Check if you have Python 3.11+ installed
- Verify your LLM API key is set correctly
- Check Docker logs: `docker-compose -f docker-compose.automation.yml logs skyvern`

**2. Browser automation fails:**
- Make sure Chrome/Chromium is installed
- Check if ports 8000 and 9222 are available
- Verify anti-virus software isn't blocking browser automation

**3. Automation engine can't connect to Skyvern:**
- Check if Skyvern is running on port 8000
- Verify network connectivity between containers
- Check logs: `docker-compose -f docker-compose.automation.yml logs automation-engine`

**4. Database connection issues:**
- Ensure PostgreSQL is running
- Check if both databases are created (reactive_resume and skyvern)
- Verify connection strings in .env file

### Debug Commands

```bash
# Check all service status
docker-compose -f docker-compose.automation.yml ps

# View logs for specific service
docker-compose -f docker-compose.automation.yml logs [service-name]

# Restart a specific service
docker-compose -f docker-compose.automation.yml restart [service-name]

# Check database status
docker-compose -f docker-compose.automation.yml exec postgres psql -U reactive_resume -l
```

## 🔒 Security Considerations

### Production Deployment

1. **Environment Variables:**
   - Use strong, unique API keys
   - Set secure database passwords
   - Enable authentication on all services

2. **Network Security:**
   - Use HTTPS in production
   - Implement proper CORS policies
   - Use firewalls to restrict access

3. **Job Board Compliance:**
   - Respect robots.txt files
   - Implement reasonable rate limiting
   - Add delays between requests
   - Use residential proxies if needed

## 📈 Scaling Considerations

### For Production Use

1. **Multiple Automation Engines:**
   - Run multiple automation-engine instances
   - Use load balancer for distribution
   - Implement job queuing system

2. **Database Optimization:**
   - Use connection pooling
   - Implement database replicas for reads
   - Regular database maintenance

3. **Monitoring:**
   - Set up application monitoring
   - Track automation success rates
   - Monitor resource usage

## 🎉 What's Next?

Your job automation system is now ready! You can:

1. **Build Frontend UI** for automation controls
2. **Add Scheduling** for recurring job hunts
3. **Implement Analytics** for automation success tracking
4. **Add More Job Boards** by extending the automation engine
5. **Create Custom Workflows** for specific industries

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify your environment configuration
4. Test individual components separately

The automation system integrates seamlessly with your existing job application workflow, automatically creating job applications in your database when jobs are found and processed.

