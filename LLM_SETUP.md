# LLM Integration Setup Guide

This application includes intelligent LLM integration for job application analysis, content matching, and resume generation. You can choose from multiple providers with easy switching capabilities.

## 🚀 Quick Start (Recommended)

### Option 1: Claude 3.5 Sonnet (Best Performance)

1. **Get Anthropic API Key:**
   - Sign up at [Anthropic Console](https://console.anthropic.com)
   - Create an API key (starts with `sk-ant-`)

2. **Add to Environment:**
   ```bash
   # In your .env file
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

### Option 2: OpenAI GPT-4 (Widely Compatible)

1. **Get OpenAI API Key:**
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Create an API key (starts with `sk-`)

2. **Add to Environment:**
   ```bash
   # In your .env file
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## 🔧 Advanced Configuration

### Model Selection

**Claude Models:**
- `claude-3-5-sonnet-20241022` - Best reasoning and analysis (recommended)
- `claude-3-opus-20240229` - Most capable but expensive
- `claude-3-haiku-20240307` - Fast and cost-effective

**OpenAI Models:**
- `gpt-4-turbo-preview` - Latest GPT-4 with large context
- `gpt-4-0613` - Stable GPT-4 version
- `gpt-3.5-turbo` - Cost-effective option

### Environment Variables

```bash
# Core LLM Configuration
LLM_PROVIDER=anthropic          # anthropic | openai | local
ANTHROPIC_API_KEY=sk-ant-...    # Required for Anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

OPENAI_API_KEY=sk-...           # Required for OpenAI
OPENAI_MODEL=gpt-4-turbo-preview

# Local LLM Configuration (for future use)
LOCAL_LLM_BASE_URL=http://localhost:11434   # Ollama default
LOCAL_LLM_API_KEY=                           # Optional for local
LOCAL_LLM_MODEL=llama3:8b                    # Model name
```

## 🏠 Local LLM Setup (Future-Proof)

### Option 1: Ollama (Easiest)

1. **Install Ollama:**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows: Download from ollama.ai
   ```

2. **Run with OpenAI Compatibility:**
   ```bash
   # Start Ollama
   ollama serve
   
   # In another terminal, pull a model
   ollama pull llama3:8b
   
   # Enable OpenAI compatibility
   export OLLAMA_ORIGINS="*"
   ```

3. **Configure:**
   ```bash
   LLM_PROVIDER=local
   LOCAL_LLM_BASE_URL=http://localhost:11434
   LOCAL_LLM_MODEL=llama3:8b
   ```

### Option 2: LM Studio

1. **Install LM Studio** from [lmstudio.ai](https://lmstudio.ai)
2. **Download a model** (e.g., Mistral 7B, Llama 3)
3. **Start Local Server** with OpenAI compatibility
4. **Configure:**
   ```bash
   LLM_PROVIDER=local
   LOCAL_LLM_BASE_URL=http://localhost:1234
   LOCAL_LLM_MODEL=your-model-name
   ```

## 🎯 Features Enabled

### 1. Job Posting Analysis
- **URL Analysis**: Paste LinkedIn/Indeed URLs → Extract job details
- **Text Analysis**: Copy/paste job descriptions → Structured data
- **Auto-tagging**: Intelligent skill and requirement extraction

### 2. Content Matching
- **Smart Scoring**: 0-100 relevance scores for your content
- **Gap Analysis**: Identifies missing skills/experience
- **Suggestions**: Improvement recommendations

### 3. Resume Generation
- **Tailored Summaries**: Job-specific professional summaries
- **ATS Optimization**: Keyword matching and formatting
- **Content Selection**: Auto-select best experiences

### 4. Cover Letter Generation
- **Personalized**: Company and role-specific content
- **Professional Format**: Business letter structure
- **Achievement Focus**: Quantified accomplishments

### 5. Interview Preparation
- **Custom Questions**: Role-specific interview questions
- **Behavioral Prep**: Questions about your experiences
- **Technical Focus**: Skill-based question generation

## 📊 API Usage

### Job Analysis
```bash
POST /api/job-applications/analyze-from-text
{
  "jobText": "Full job posting text...",
  "url": "https://linkedin.com/jobs/view/123"
}
```

### Generate Resume
```bash
POST /api/job-applications/{id}/generate-resume
{
  "selectedContentIds": ["content1", "content2"]
}
```

### Generate Cover Letter
```bash
POST /api/job-applications/{id}/generate-cover-letter
{
  "selectedContentIds": ["content1", "content2"]
}
```

## 🔄 Provider Switching

You can switch LLM providers anytime by changing the `LLM_PROVIDER` environment variable:

```bash
# Switch to OpenAI
LLM_PROVIDER=openai

# Switch to Anthropic
LLM_PROVIDER=anthropic

# Switch to local
LLM_PROVIDER=local
```

No code changes required - the service automatically adapts!

## 🛠️ Development

### Testing Providers
```bash
# Test current provider
curl -X GET http://localhost:5173/api/llm/provider

# Test job analysis
curl -X POST http://localhost:5173/api/llm/analyze-job \
  -H "Content-Type: application/json" \
  -d '{"jobText": "Software Engineer at TechCorp..."}'
```

### Adding New Providers

1. Create a new provider implementing `LLMProvider` interface
2. Add to `LLMService` constructor and switch statement
3. Add environment configuration
4. Update this guide

## 💡 Best Practices

### API Keys
- Use environment variables, never commit keys
- Rotate keys regularly
- Monitor usage and costs

### Performance
- Claude 3.5 Sonnet: Best for complex analysis
- GPT-4: Good all-around performance
- Local models: Best for privacy/cost (lower performance)

### Cost Optimization
- Use GPT-3.5 for simple tasks
- Cache results when possible
- Implement rate limiting for production

## 🔒 Security Notes

- API keys are never logged or stored in database
- All LLM requests are authenticated
- User data is not shared with LLM providers beyond request context
- Consider local LLMs for sensitive data

## 📈 Monitoring

The application logs LLM usage:
- Provider and model used
- Token consumption
- Success/failure rates
- Response times

Check server logs for monitoring LLM performance and costs.

---

**Need Help?** Check the API documentation at `/api/docs` when the server is running. 