# 🚀 ReactiveResumeTracker Automation - Complete Quickstart Guide

## 🎯 **What This Gives You**

Transform your ReactiveResumeTracker into an **AI-powered job application machine** that can:
- ✅ **Automate LinkedIn job searches** and applications
- ✅ **Generate tailored resumes** for each position
- ✅ **Extract company information** automatically  
- ✅ **Create relevant contacts** from company pages
- ✅ **Scale your job search** with intelligent automation

## 📋 **Prerequisites**

- ✅ Your ReactiveResumeTracker is working (run `./setup.ps1` first if not)
- ✅ Docker Desktop installed and running
- ✅ Anthropic API key (you already have this)

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Start the Complete System**
```powershell
# This starts BOTH your resume tracker AND automation engine
.\start-complete-system.ps1
```

**What this does:**
- Starts your ReactiveResumeTracker (frontend, backend, PDF service)
- Starts Skyvern automation engine (API + UI)
- Connects them together with proper configuration

### **Step 2: Verify Everything is Running**

Open these URLs to confirm:
- **Your Resume Tracker**: http://localhost:5173
- **Automation Dashboard**: http://localhost:5173/dashboard/job-applications  
- **Skyvern UI** (optional): http://localhost:8081

### **Step 3: Configure API Key (If Needed)**

If automation shows "Unavailable", you need to set up the Skyvern API key:

1. **Get the API key**:
   - Open http://localhost:8081 (Skyvern UI)
   - Create account → Settings → Copy API Key

2. **Add to your .env file**:
   ```bash
   SKYVERN_API_KEY=your_api_key_here
   ```

3. **Restart the system**:
   ```powershell
   .\start-complete-system.ps1
   ```

## 🤖 **How to Use Automation**

### **Basic LinkedIn Job Search**

1. **Go to Job Applications**: http://localhost:5173/dashboard/job-applications

2. **Find the Automation Card** (at the top):
   - 🤖 Robot icon
   - Status: "Available" (green) or "Unavailable" (red)
   - Platform buttons: LinkedIn, Indeed, etc.

3. **Click "LinkedIn"** to open automation dialog

4. **Configure Your Search**:
   ```
   Job Keywords: "Senior Developer React"
   Location: "San Francisco, CA"
   Remote: "Yes" 
   Time Period: "Past Week"
   Max Jobs: 5
   ```

5. **Click "Start Automation"** and watch it work!

### **What Happens Next**

The system will:
1. **Search LinkedIn** for jobs matching your criteria
2. **Extract job details** (title, company, description, requirements)
3. **Save job applications** to your dashboard
4. **Research companies** and create company profiles
5. **Find relevant contacts** from company pages
6. **Generate tailored resumes** using your content library

## 📊 **Monitoring Progress**

### **Real-time Status**
- **Task ID** appears when automation starts
- **Status updates** show current progress
- **Results** appear in your job applications list

### **Detailed Monitoring**
- **Skyvern UI**: http://localhost:8081 - Watch browser automation live
- **Logs**: Check terminal output for detailed progress
- **Artifacts**: Screenshots and data saved in `automation-data/`

## 🛠️ **Troubleshooting**

### **"Automation Unavailable"**
```bash
# Check if services are running
docker ps

# Look for: skyvern-api, skyvern-ui, skyvern-postgres, skyvern-redis
# If missing, restart the system:
.\start-complete-system.ps1
```

### **"Invalid API Key" Errors**
1. Get API key from http://localhost:8081
2. Add `SKYVERN_API_KEY=your_key` to `.env`
3. Restart system

### **LinkedIn Login Required**
- Automation will pause and wait for you to login
- Open the Skyvern UI to see the browser and login manually
- Automation continues after successful login

### **Rate Limiting (Anthropic)**
- **Error**: "Rate limit exceeded"  
- **Solution**: Wait a few minutes, or upgrade your Anthropic plan
- **Alternative**: Switch to OpenAI in your .env file

## 🔧 **Advanced Configuration**

### **Customize Automation Behavior**
Edit your automation settings in the LinkedIn dialog:
- **Max Jobs**: Limit number of applications per run
- **Company Research**: Enable/disable company profile creation  
- **Contact Extraction**: Enable/disable contact creation
- **Custom Instructions**: Add specific requirements

### **Multiple Job Boards**
The system supports:
- ✅ **LinkedIn** (fully implemented)
- 🚧 **Indeed** (coming soon)
- 🚧 **Glassdoor** (coming soon)

## 📈 **Best Practices**

### **Optimize Your Content Library**
- Keep your content library updated with recent experiences
- Use specific, keyword-rich descriptions
- The automation uses this content to generate tailored resumes

### **Smart Job Targeting**
- Use specific job titles rather than broad terms
- Include location preferences to get relevant results
- Set reasonable limits (5-10 jobs per run) to avoid rate limiting

### **Monitor and Iterate**
- Review generated resumes for quality
- Adjust search criteria based on results
- Use the feedback to improve your content library

## 🆘 **Getting Help**

### **Common Issues**
- **Docker not running**: Start Docker Desktop
- **Port conflicts**: Make sure ports 5173, 3000, 8000, 8081 are free
- **API key issues**: Follow the setup guide above

### **Documentation**
- **LinkedIn Automation**: See `docs/automation/LINKEDIN_AUTOMATION.md`
- **Technical Setup**: See `docs/automation/SETUP_AND_TROUBLESHOOTING.md`

### **Support**
- Check the terminal output for detailed error messages
- Use the Skyvern UI to see exactly what the automation is doing
- Review the automation artifacts for debugging

## 🎉 **You're Ready!**

## 📚 **Related Documentation**

- **📋 LinkedIn Automation**: `docs/automation/LINKEDIN_AUTOMATION.md` - Comprehensive LinkedIn workflow guide
- **🔧 Technical Setup**: `docs/automation/SETUP_AND_TROUBLESHOOTING.md` - Docker, API keys, debugging
- **🏗️ System Architecture**: `docs/automation/SYSTEM_ARCHITECTURE_ANALYSIS.md` - Complete technical analysis
- **🌐 Skyvern Official Docs**: https://docs.skyvern.com - Official Skyvern documentation

Your ReactiveResumeTracker now has enterprise-grade automation capabilities. Start with a simple LinkedIn search and scale up as you get comfortable with the system.

**Happy job hunting!** 🚀
