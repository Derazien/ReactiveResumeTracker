# 🚀 IMMEDIATE Ollama Setup (30 minutes)

## ⚡ **STOP THE COST BLEEDING RIGHT NOW!**

Your current testing: **1.5M tokens = $1.50**  
With Ollama: **Unlimited tokens = $0.00**

---

## 🔧 **Step 1: Install Ollama (5 minutes)**

### **Windows (Your Machine):**
```bash
# Option 1: Direct download
# Go to: https://ollama.ai/download
# Download and run the installer

# Option 2: PowerShell (if you have scoop/chocolatey)
# scoop install ollama
# OR
# choco install ollama
```

### **Verify Installation:**
```bash
# Open new PowerShell window
ollama --version
# Should show: ollama version 0.1.x
```

---

## 📥 **Step 2: Download Models (10 minutes)**

**Download the best models for your use case:**
```bash
# 🥇 RECOMMENDED: Qwen 2.5 7B (best reasoning for jobs/resumes)
ollama pull qwen2.5:7b
# Download size: ~4.4GB

# 🥈 BACKUP: Llama 3.2 8B (proven reliability)  
ollama pull llama3.2:8b
# Download size: ~4.7GB

# 🥉 LIGHTWEIGHT: Mistral 7B (fastest inference)
ollama pull mistral:7b
# Download size: ~4.1GB
```

**Monitor Download Progress:**
```bash
# Check downloaded models
ollama list
```

---

## 🧪 **Step 3: Test the Models (10 minutes)**

### **Test Job Analysis:**
```bash
# Test Qwen 2.5 with job analysis
ollama run qwen2.5:7b

# Paste this prompt:
"""
Analyze this job description and extract key requirements:

Senior React Developer at Google
We are looking for an experienced React developer with 5+ years of experience in modern web development. Must have strong skills in TypeScript, Node.js, and cloud platforms like AWS. Experience with GraphQL and microservices architecture preferred. Remote position with occasional travel to Mountain View office.

Extract:
1. Key skills required
2. Experience level  
3. Company and location
4. Job type (remote/hybrid/onsite)
5. Salary range (if mentioned)

Format as JSON.
"""

# Press Ctrl+D to exit when done
```

### **Test Resume Matching:**
```bash
# Test Llama 3.2 with content matching
ollama run llama3.2:8b

# Paste this prompt:
"""
Score how well this resume experience matches the job requirements (0-100):

RESUME EXPERIENCE:
- Senior Frontend Developer at Meta, 4 years
- Built React applications serving 100M+ users
- Expert in TypeScript, JavaScript, Node.js
- Experience with AWS, Docker, GraphQL
- Led team of 6 developers

JOB REQUIREMENTS:
- 5+ years React development
- TypeScript and Node.js expertise
- AWS cloud platform experience  
- GraphQL knowledge preferred
- Leadership experience

Provide a match score and explain the reasoning.
"""
```

---

## ⚙️ **Step 4: Configure ReactiveResume (5 minutes)**

**Add to your `.env` file:**
```bash
# Add these lines to apps/server/.env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

**Test the Integration:**
```bash
# Restart your server
npm run dev

# Your LLM service will now use Ollama instead of Haiku!
# Check the logs for: "Initialized LLM service with provider: ollama"
```

---

## 📊 **Step 5: Compare Results (5 minutes)**

**A/B Test the Quality:**

1. **Process a job with Haiku 3.5** (your current method)
2. **Process same job with Qwen 2.5** (new Ollama method)  
3. **Compare the results**

**Expected Results:**
```
Quality Comparison:
• Haiku 3.5: 100% baseline quality
• Qwen 2.5 7B: 85-95% quality (minimal loss)

Cost Comparison:  
• Haiku 3.5: $0.001 per request
• Qwen 2.5 7B: $0.000 per request (FREE!)

Speed Comparison:
• Haiku 3.5: 2-5 seconds (network + processing)
• Qwen 2.5 7B: 1-3 seconds (local processing)
```

---

## 🔍 **Troubleshooting**

### **Model Not Found Error:**
```bash
# If you get "model not found":
ollama list
# Verify the model name exactly matches

# Pull model if missing:
ollama pull qwen2.5:7b
```

### **Connection Refused Error:**
```bash
# If Ollama service isn't running:
ollama serve
# Keep this running in a separate terminal
```

### **Out of Memory Error:**
```bash
# If your machine has <8GB RAM, use smaller model:
ollama pull qwen2.5:3b
# Then update .env: OLLAMA_MODEL=qwen2.5:3b
```

---

## 💰 **Immediate Cost Impact**

**Before (Haiku 3.5):**
- Testing: 1.5M tokens = $1.50
- Production estimate: $15-75/month
- Annual estimate: $180-900/year

**After (Ollama):**
- Testing: Unlimited tokens = $0.00
- Production: Unlimited tokens = $0.00  
- Annual cost: $0.00 for LLM

**IMMEDIATE SAVINGS: $180-900/year minimum!**

---

## 🎯 **Next Steps**

Once Ollama is working:

1. **Measure quality difference** (should be minimal 3-7% loss)
2. **Run your existing test suite** with Ollama
3. **Gradually migrate** from Haiku to Ollama
4. **Keep Haiku as fallback** for complex edge cases

## 🚨 **DO THIS RIGHT NOW!**

This is the **single biggest cost optimization** you can make. **30 minutes of setup saves you $180-900/year!**

**Start the installation now while we continue with the hybrid architecture planning.**

Ready? **Open PowerShell and run the first command!** 🚀
