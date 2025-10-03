# User Journey Testing Guide for ReactiveResumeTracker

## 🎯 Overview
This guide provides a comprehensive testing path through all features of ReactiveResumeTracker, from initial setup to advanced features like cover letter generation and company management.

## 🚀 Setup & Prerequisites

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Setup database
npm run prisma:migrate:dev

# Start backend (Terminal 1)
npm run start:backend

# Start frontend (Terminal 2)
npm run start:client

# Access application
http://localhost:5173
```

### 2. Test User Credentials
Create a test user or use existing:
- Email: `test@example.com`
- Password: `Test123!@#`

---

## 📊 User Journey Test Scenarios

### **Journey 1: First-Time User Setup** ✅

#### Steps:
1. **Registration**
   - Navigate to `/auth/register`
   - Enter email, password, name
   - Verify email confirmation (if enabled)
   - ✅ **Expected**: Account created, redirected to dashboard

2. **Initial Resume Creation**
   - Click "Create Resume" button
   - Enter basic information (name, email, phone)
   - Add at least one experience entry
   - Add skills and education
   - ✅ **Expected**: Resume saved and visible in dashboard

3. **Profile Setup**
   - Navigate to Settings
   - Complete profile information
   - Set LinkedIn URL
   - Configure LLM settings (if API keys available)
   - ✅ **Expected**: Profile updated successfully

---

### **Journey 2: Content Library Building** 📚

#### Steps:
1. **Add Professional Content**
   - Navigate to `/dashboard/content-library`
   - Click "Add Content"
   - Add 3-5 experience entries with rich descriptions
   - Add 2-3 project entries
   - Add 10+ skills with categories
   - ✅ **Expected**: Content items saved with proper categorization

2. **Content Tagging**
   - Edit each content item
   - Add relevant tags (e.g., "leadership", "python", "analytics")
   - Set visibility preferences
   - ✅ **Expected**: Tags saved and searchable

3. **Content Variants** (if applicable)
   - Select an experience entry
   - Create 2-3 variants for different contexts
   - ✅ **Expected**: Variants linked to original content

---

### **Journey 3: Job Application Workflow** 💼

#### Steps:
1. **Create Job Application from URL**
   - Navigate to `/dashboard/job-applications`
   - Click "New Application"
   - Paste job posting URL or text
   - Example job posting:
   ```
   Senior Software Engineer at TechCorp
   
   We're looking for a Senior Software Engineer to join our team.
   
   Requirements:
   - 5+ years React/Node.js experience
   - Cloud technologies (AWS/Azure)
   - Microservices architecture
   - Strong communication skills
   
   Location: San Francisco, CA
   Salary: $150,000 - $200,000
   ```
   - Click "Analyze & Create"
   - ✅ **Expected**: 
     - Job details extracted (title, company, requirements)
     - Company created/matched in database
     - Job application saved with status "DRAFT"

2. **Generate Tailored Resume**
   - Open the created job application
   - Click "Generate Tailored Resume"
   - Review suggested content selections
   - Optionally modify selections
   - Choose "One-page" format
   - Click "Generate"
   - ✅ **Expected**:
     - Resume generated with relevant content
     - Content prioritized by match score
     - Professional summary tailored to role
     - Resume linked to job application

3. **Review and Edit Resume**
   - Click "Edit Resume" on generated resume
   - Verify content accuracy
   - Make manual adjustments if needed
   - Save changes
   - ✅ **Expected**: Edits saved, preview updated

---

### **Journey 4: Cover Letter Generation** 📝

#### Steps:
1. **Prepare Cover Letter Content Library**
   - Navigate to content library
   - Add cover letter paragraphs:
     - PARAGRAPH_ANALYTICS: Data analysis story
     - PARAGRAPH_LEADERSHIP: Team leadership story
     - PARAGRAPH_TECH: Technical achievement story
     - PARAGRAPH_DIVERSITY: Cultural diversity story
   - ✅ **Expected**: Paragraphs saved with proper types

2. **Generate Cover Letter**
   - Open job application
   - Click "Generate Cover Letter"
   - System should:
     - Extract company themes from job description
     - Select best 3 paragraphs from library
     - Generate using token template
   - ✅ **Expected**:
     - Cover letter follows blueprint format
     - Tokens replaced (name, company, role)
     - Paragraphs match job themes
     - Professional tone maintained

3. **Review Cover Letter**
   - View generated cover letter
   - Check for:
     - Proper formatting
     - No remaining tokens ([FIRST NAME])
     - Relevant content selection
     - Company-specific language
   - ✅ **Expected**: Cover letter ready for use

---

### **Journey 5: Company Management** 🏢

#### Steps:
1. **Company Research**
   - Navigate to `/dashboard/companies`
   - View automatically created companies from job applications
   - Click on a company to view details
   - ✅ **Expected**:
     - Company info displayed (if analyzed)
     - Values and culture extracted
     - Social media links present

2. **Manual Company Addition**
   - Click "Add Company"
   - Enter company details:
     - Name: "InnovateTech Inc"
     - Website: "https://innovatetech.com"
     - Industry: "Technology"
     - Size: "500-1000"
   - Save company
   - ✅ **Expected**: Company added to database

3. **Link Company to Applications**
   - Create new job application
   - Select existing company from dropdown
   - ✅ **Expected**: Application linked to company record

---

### **Journey 6: Application Status Tracking** 📈

#### Steps:
1. **Update Application Status**
   - Open job application
   - Change status through workflow:
     - DRAFT → APPLIED
     - APPLIED → INTERVIEW_SCHEDULED
     - INTERVIEW_SCHEDULED → INTERVIEWED
     - INTERVIEWED → OFFER_RECEIVED
   - Add notes for each status change
   - ✅ **Expected**: Status history maintained

2. **Filter and Search**
   - Use filters on job applications page:
     - By status
     - By company
     - By date range
   - ✅ **Expected**: Filtered results display correctly

---

### **Journey 7: Advanced Features** 🚀

#### Steps:
1. **Bulk Resume Generation**
   - Select multiple job applications
   - Click "Generate Resumes"
   - ✅ **Expected**: Batch processing with progress indicator

2. **Content Matching Analysis**
   - Open job application
   - View "Content Match Score"
   - See detailed breakdown:
     - Skills match: 85%
     - Experience match: 75%
     - Education match: 90%
   - ✅ **Expected**: Scores calculated accurately

3. **Export Functionality**
   - Export resume as PDF
   - Export cover letter as PDF
   - Download application data as JSON
   - ✅ **Expected**: Files download correctly

---

## 🧪 Edge Cases to Test

### 1. **Error Handling**
- [ ] Submit job URL that doesn't exist
- [ ] Analyze malformed job posting text
- [ ] Generate resume with no content library
- [ ] Generate cover letter with no paragraphs
- [ ] API rate limit handling

### 2. **Data Validation**
- [ ] Create application with missing required fields
- [ ] Add content with extremely long text
- [ ] Upload invalid file formats
- [ ] Enter invalid URLs

### 3. **Performance**
- [ ] Load dashboard with 100+ job applications
- [ ] Generate resume with 50+ content items
- [ ] Search through large content library
- [ ] Concurrent resume generation

---

## 🔍 Specific Feature Tests

### **RAG System Testing**
1. Create content with specific keywords
2. Create job with matching requirements
3. Verify content scoring:
   - Keyword matches weighted properly
   - Semantic similarity working
   - Tag matching functional
4. ✅ **Expected**: Most relevant content selected

### **Cover Letter Blueprint Testing**
1. Verify template structure:
   ```
   [FIRST NAME] [LAST NAME]
   [Email] | [Phone]
   
   Application for [Role] at [Company]
   
   Dear [Greeting],
   [Intake-Sentence]
   [Paragraph A]
   [Paragraph B]
   [Paragraph C]
   [Closing-Sentence]
   
   Sincerely,
   [Your Name]
   ```
2. Check token replacement
3. Verify paragraph selection logic
4. Test lexical tuning

### **Company Research Testing**
1. Create job with known company
2. Verify company data extraction:
   - Values identified
   - Mission statement found
   - Industry classified
3. Check background processing

---

## 📝 Testing Checklist

### **Core Functionality** ✅
- [ ] User registration and login
- [ ] Resume creation and editing
- [ ] Content library management
- [ ] Job application creation
- [ ] Resume tailoring
- [ ] Cover letter generation
- [ ] PDF export

### **Data Integrity** 📊
- [ ] Content IDs properly tracked
- [ ] Source content IDs maintained
- [ ] Company relationships preserved
- [ ] Application history accurate
- [ ] User data isolation

### **UI/UX** 🎨
- [ ] Mobile responsiveness
- [ ] Loading states displayed
- [ ] Error messages clear
- [ ] Success confirmations shown
- [ ] Navigation intuitive
- [ ] Forms validate properly

### **Integration** 🔗
- [ ] LLM API connections working
- [ ] Embedding service functional
- [ ] Database transactions complete
- [ ] File uploads successful
- [ ] Export formats correct

---

## 🐛 Common Issues & Solutions

### Issue 1: Resume Generation Fails
**Symptoms**: Click generate, nothing happens
**Solution**: 
- Check LLM API keys in settings
- Verify content library has items
- Check browser console for errors

### Issue 2: Cover Letter Missing Paragraphs
**Symptoms**: Cover letter has [Paragraph A] tokens
**Solution**:
- Add paragraph content to library
- Ensure paragraphs have correct types
- Verify theme extraction working

### Issue 3: Company Not Found
**Symptoms**: Company analysis returns empty
**Solution**:
- Check company name normalization
- Verify API keys for research
- Manual company creation as fallback

### Issue 4: Content Not Matching
**Symptoms**: Wrong content selected for resume
**Solution**:
- Add more specific tags
- Update content descriptions
- Check embedding service status

---

## 📈 Performance Benchmarks

### Expected Response Times:
- Login: < 1 second
- Dashboard load: < 2 seconds
- Job analysis: < 5 seconds
- Resume generation: < 10 seconds
- Cover letter generation: < 8 seconds
- PDF export: < 3 seconds

### Resource Usage:
- Memory: < 500MB client side
- API calls: < 10 per operation
- Database queries: Optimized with indexes

---

## 🎯 Success Criteria

A complete user journey test is successful when:

1. ✅ User can complete full workflow from registration to application
2. ✅ All generated content is relevant and properly formatted
3. ✅ No critical errors or data loss occurs
4. ✅ Performance meets benchmarks
5. ✅ UI is responsive and intuitive
6. ✅ Data relationships maintained correctly
7. ✅ Export functionality works as expected
8. ✅ Error handling provides clear feedback

---

## 📞 Support & Debugging

### Logs to Check:
- Browser console (`F12`)
- Network tab for API calls
- Server logs (`npm run start:backend`)
- Database state (`npx prisma studio`)

### Debug Commands:
```bash
# View database
npx prisma studio

# Reset database
npm run prisma:migrate:reset

# Check server health
curl http://localhost:3000/health

# View API docs
http://localhost:3000/api/docs
```

---

*Last Updated: [Current Date]*
*Version: 1.0 - Post Phase 1 Refactoring*

