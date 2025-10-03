# User LLM Configuration Guide

**For**: End users of Reactive Resume Tracker  
**Purpose**: Configure your AI provider for intelligent resume features

---

## Overview

Reactive Resume Tracker supports multiple AI providers for features like:
- Job description analysis
- Resume tailoring
- Cover letter generation
- Content matching

Each user can choose their own AI provider and use their own API keys.

---

## How to Configure

### 1. Access Settings

```
Login → Dashboard → Settings (gear icon) → AI/LLM Integration
```

### 2. Choose Your Provider

| Provider | Cost | Performance | Privacy |
|----------|------|-------------|---------|
| **Anthropic Claude** | ~$0.01-0.10/request | ⭐⭐⭐⭐⭐ Best | Data sent to Anthropic |
| **OpenAI GPT-4** | ~$0.02-0.20/request | ⭐⭐⭐⭐⭐ Excellent | Data sent to OpenAI |
| **Ollama (Local)** | Free (uses server) | ⭐⭐⭐ Good | 100% Private (stays on server) |

---

## Configuration Options

### Option 1: Anthropic Claude (Recommended)

**Best for**: High-quality results, reasonable cost

1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Configure in settings:
   ```
   Provider: Anthropic (Claude)
   API Key: sk-ant-api03-xxxxxxxxxxxx
   Model: claude-3-5-sonnet-20241022
   Max Tokens: 4000
   Temperature: 0.1
   ```
3. Save settings

**Cost Estimate**: $0.01-0.10 per resume generation

### Option 2: OpenAI GPT-4

**Best for**: Proven reliability, wider availability

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Configure in settings:
   ```
   Provider: OpenAI
   API Key: sk-proj-xxxxxxxxxxxx
   Model: gpt-4-turbo-preview
   Base URL: (leave empty)
   Max Tokens: 4000
   Temperature: 0.1
   ```
3. Save settings

**Cost Estimate**: $0.02-0.20 per resume generation

### Option 3: Ollama (Local/Free)

**Best for**: Privacy-conscious users, zero API costs

**Requirements**:
- Server admin must have Ollama running
- Check with admin for available models

1. Configure in settings:
   ```
   Provider: Ollama (Local)
   Base URL: http://localhost:11434/v1
   Model: llama3:8b  (or ask admin which model is installed)
   API Key: sk-1234567890abcdef  (dummy key, required by UI)
   Max Tokens: 4000
   Temperature: 0.1
   ```
2. Save settings

**Pros**:
- ✅ Completely free
- ✅ 100% privacy - data never leaves server
- ✅ Unlimited usage

**Cons**:
- ⚠️ Slightly lower quality than Claude/GPT-4
- ⚠️ Depends on server availability
- ⚠️ May be slower on busy servers

---

## System Fallback (Optional)

If you enable **"Use system default as backup"**, the platform will automatically use the server's default provider if your API key fails or runs out of credits.

**When to enable**:
- ✅ If you want uninterrupted service
- ✅ If you're testing and might have invalid keys
- ✅ If you want to use Ollama when your cloud provider is down

**When to disable**:
- ❌ If you want strict control over which provider is used
- ❌ If you don't trust the system provider

---

## Testing Your Configuration

After saving:

1. **Go to Job Applications** → Create new application
2. **Paste a job description** URL or text
3. **Click "Analyze Job"**
4. If it works → Configuration is correct ✅
5. If error → Check API key and provider settings

---

## Switching Providers

You can switch providers anytime:

1. Go to Settings → AI/LLM Integration
2. Select different provider
3. Enter new API key (if applicable)
4. Save settings

**Note**: Previous API calls will still be billed to the old provider. Only new requests use the new provider.

---

## Troubleshooting

### Error: "API key is invalid"

**Solution**: 
- Verify API key is correctly copied (no spaces)
- Check key has not expired or been revoked
- Verify you have credits/billing enabled

### Error: "Model not found"

**Solution** (Ollama):
- Ask server admin which models are installed
- Use `docker exec -it ollama-llm ollama list` (if you have access)
- Try common models: `llama3:8b`, `mistral:7b`, `qwen2.5:7b`

### Error: "Connection refused" (Ollama)

**Solution**:
- Verify Ollama is running on server: `docker ps | grep ollama`
- Check Base URL is correct: `http://localhost:11434/v1`
- Contact server admin

### Features not working

**Solution**:
- Verify you saved settings (check Settings page)
- Refresh the page
- Check browser console for errors (F12)
- Contact support

---

## Privacy & Security

### Your API Keys
- Stored encrypted in database
- Never logged or exposed in responses
- Only used when you trigger AI features
- Can be deleted anytime (Settings → delete your account)

### Your Data
- **Cloud providers (Anthropic/OpenAI)**: Your resume data is sent to their APIs for processing
- **Ollama (Local)**: Your data stays on the server, never sent to third parties
- See [Privacy Policy](#) for details

### Best Practices
- ✅ Use separate API keys for this application
- ✅ Set spending limits on your provider accounts
- ✅ Monitor usage on provider dashboards
- ✅ Use Ollama if privacy is critical

---

## FAQ

**Q: Can I use multiple providers?**  
A: Not simultaneously, but you can switch providers anytime in settings.

**Q: Who pays for Ollama?**  
A: The server admin. It's free for you to use (if enabled).

**Q: What happens if my API key runs out of credits?**  
A: Requests will fail unless you enable "system fallback" or add credits to your provider account.

**Q: Can I see my API usage?**  
A: Yes, check your provider's dashboard:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/usage

**Q: Is my API key shared with other users?**  
A: No. Each user has their own API key. System fallback uses the server's API key (if enabled).

**Q: Can the server admin see my API key?**  
A: Technically yes (database access), but keys are encrypted. Use providers' security features like IP restrictions if concerned.

---

## Cost Comparison

| Provider | Setup Cost | Per Resume | Per Month (10 resumes) |
|----------|-----------|-----------|------------------------|
| **Anthropic Claude** | $5 min deposit | $0.01-0.10 | $0.10-1.00 |
| **OpenAI GPT-4** | No minimum | $0.02-0.20 | $0.20-2.00 |
| **Ollama (Local)** | Free | Free | Free |

**Note**: Costs are estimates. Actual costs depend on job description length, resume size, and model used.

---

## Getting Help

- **Technical issues**: Contact server admin
- **API key issues**: Contact your provider (Anthropic/OpenAI)
- **Feature requests**: [GitHub Issues](https://github.com/your-repo)

---

**Need more help?** Ask in [Community Chat](#) or email support@your-domain.com

