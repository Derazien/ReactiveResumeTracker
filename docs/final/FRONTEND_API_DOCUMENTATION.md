# Frontend API Documentation - Complete Endpoint Mapping

## 📋 **Overview**

This document provides a comprehensive mapping of ALL API endpoints used in the frontend application, organized by domain and mapped to their corresponding backend services. This serves as preparation for backend service refactoring and cleanup.

**Total API Endpoints Identified: 80+**  
**Frontend Service Directories: 10**  
**Backend Services Requiring Analysis: 15+**

---

## 🏗️ **API Endpoint Mapping by Domain**

### **1. AUTHENTICATION APIs**
**Frontend Service**: `apps/client/src/services/auth/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/auth/login` | POST | `useLogin()` | User authentication | AuthController |
| `/auth/logout` | POST | `useLogout()` | User logout | AuthController |
| `/auth/refresh` | POST | `useRefresh()` | Token refresh | AuthController |
| `/auth/register` | POST | `useRegister()` | User registration | AuthController |
| `/auth/update-password` | PUT | `useUpdatePassword()` | Password update | AuthController |
| `/auth/email-verification/resend` | POST | `useResendVerifyEmail()` | Resend verification | AuthController |
| `/auth/email-verification/verify` | POST | `useVerifyEmail()` | Email verification | AuthController |
| `/auth/password-recovery/forgot` | POST | `useForgotPassword()` | Password recovery | AuthController |
| `/auth/password-recovery/reset` | POST | `useResetPassword()` | Password reset | AuthController |
| `/auth/2fa/setup` | POST | `useSetup2FA()` | 2FA setup | AuthController |
| `/auth/2fa/enable` | POST | `useEnable2FA()` | Enable 2FA | AuthController |
| `/auth/2fa/disable` | POST | `useDisable2FA()` | Disable 2FA | AuthController |
| `/auth/2fa/verify-otp` | POST | `useVerifyOtp()` | Verify OTP | AuthController |
| `/auth/2fa/backup-otp` | POST | `useBackupOtp()` | Backup OTP | AuthController |

---

### **2. RESUME APIs**
**Frontend Service**: `apps/client/src/services/resume/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/resume` | POST | `useCreateResume()` | Create resume | ResumeController |
| `/resume` | GET | `useResumes()` | Get all resumes | ResumeController |
| `/resume/{id}` | GET | `useResume()` | Get single resume | ResumeController |
| `/resume/{id}` | PATCH | `useUpdateResume()` | Update resume | ResumeController |
| `/resume/{id}` | DELETE | `useDeleteResume()` | Delete resume | ResumeController |
| `/resume/{id}/lock` | PATCH | `useLockResume()` | Lock/unlock resume | ResumeController |
| `/resume/{id}/statistics` | GET | `useStatistics()` | Resume statistics | ResumeController |
| `/resume/{id}/preview` | GET | `usePreview()` | Resume preview | ResumeController |
| `/resume/print/{id}` | GET | `usePrintResume()` | Print resume | PrinterService |
| `/resume/{id}/contributors` | GET | `useContributors()` | Resume contributors | ResumeController |
| `/resume/import` | POST | `useImportResume()` | Import resume | ResumeController |
| `/resume/{id}/translation` | PUT | `useTranslation()` | Translation service | TranslationService |

---

### **3. COVER LETTER APIs**
**Frontend Service**: `apps/client/src/services/cover-letter/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/cover-letters` | GET | `useCoverLetters()` | Get all cover letters | CoverLetterController |
| `/cover-letters` | POST | `useCreateCoverLetter()` | Create cover letter | CoverLetterController |
| `/cover-letters/empty` | POST | `useCreateEmptyCoverLetter()` | Create empty cover letter | CoverLetterController |
| `/cover-letters/generate` | POST | `useGenerateCoverLetter()` | Generate tailored cover letter | CoverLetterController |
| `/cover-letters/{id}` | GET | `useCoverLetter()` | Get single cover letter | CoverLetterController |
| `/cover-letters/{id}` | PUT | `useUpdateCoverLetter()` | Update cover letter | CoverLetterController |
| `/cover-letters/{id}` | DELETE | `useDeleteCoverLetter()` | Delete cover letter | CoverLetterController |
| `/cover-letters/print/{id}` | GET | `usePrintCoverLetter()` | Print cover letter | PrinterService |

---

### **4. COVER LETTER CONTENT APIs**
**Frontend Service**: `apps/client/src/services/cover-letter-content/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/cover-letter-content` | GET | `useCoverLetterContent()` | Get all stories | CoverLetterContentController |
| `/cover-letter-content` | POST | `useCreateCoverLetterContent()` | Create story | CoverLetterContentController |
| `/cover-letter-content/{id}` | GET | `useCoverLetterContentById()` | Get single story | CoverLetterContentController |
| `/cover-letter-content/{id}` | PUT | `useUpdateCoverLetterContent()` | Update story | CoverLetterContentController |
| `/cover-letter-content/{id}` | DELETE | `useDeleteCoverLetterContent()` | Delete story | CoverLetterContentController |
| `/cover-letter-content/by-type/{type}` | GET | `useCoverLetterContentByType()` | Get stories by type | CoverLetterContentController |
| `/cover-letter-content/by-content/{id}` | GET | `useCoverLetterContentByContent()` | Get stories by content | CoverLetterContentController |
| `/cover-letter-content/search` | GET | `useSearchCoverLetterContent()` | Search stories | CoverLetterContentController |
| `/cover-letter-content/select-for-job` | GET | `useSelectContentForJob()` | Select content for job | CoverLetterContentController |
| `/cover-letter-content/extract-from-interview` | POST | `useExtractFromInterview()` | Extract stories from interview | CoverLetterContentController |

---

### **5. JOB APPLICATION APIs**
**Frontend Service**: `apps/client/src/services/job-application/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/job-applications` | GET | `useJobApplications()` | Get all job applications | JobApplicationController |
| `/job-applications` | POST | `useCreateJobApplication()` | Create job application | JobApplicationController |
| `/job-applications/{id}` | GET | `useJobApplication()` | Get single job application | JobApplicationController |
| `/job-applications/{id}` | PUT | `useUpdateJobApplication()` | Update job application | JobApplicationController |
| `/job-applications/{id}` | DELETE | `useDeleteJobApplication()` | Delete job application | JobApplicationController |
| `/job-applications/{id}/enhanced` | GET | `useEnhancedJobApplication()` | Get enhanced job application | JobApplicationController |
| `/job-applications/{id}/analyze-job` | POST | `useAnalyzeJob()` | Analyze job posting | JobApplicationController |
| `/job-applications/{id}/generate-resume` | POST | `useGenerateResume()` | Generate tailored resume | JobApplicationController |
| `/job-applications/{id}/generate-cover-letter` | POST | `useGenerateCoverLetter()` | Generate cover letter | JobApplicationController |
| `/job-applications/{id}/generate-interview-questions` | POST | `useGenerateInterviewQuestions()` | Generate interview questions | JobApplicationController |

---

### **6. ADDITIONAL JOB APPLICATION APIs** 
**Found in Direct Component Usage**:

| Endpoint | Method | Usage Location | Purpose | Backend Service |
|----------|--------|----------------|---------|-----------------|
| `/api/job-applications/{id}/generate-cover-letter` | POST | `content.tsx` | Generate cover letter | JobApplicationController |
| `/api/job-applications/{id}/generate-tailored-cover-letter` | POST | `toolbar.tsx` | Generate tailored cover letter | JobApplicationController |
| `/api/job-applications/{id}/conduct-interview` | POST | `toolbar.tsx`, `interview.tsx` | Conduct interview | JobApplicationController |
| `/api/job-applications/{id}/generate-enhanced-cover-letter` | POST | `job-application.ts` | Generate enhanced cover letter | JobApplicationController |
| `/api/job-applications/{id}/generate-contact-message` | POST | `job-application.ts` | Generate contact message | JobApplicationController |
| `/api/job-applications/{id}/analyze-company` | POST | `job-application.ts` | Analyze company | JobApplicationController |

---

### **7. COMPANY APIs**
**Frontend Service**: `apps/client/src/services/company/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/company` | GET | `useCompanies()` | Get all companies | CompanyController |
| `/company` | POST | `useCreateCompany()` | Create company | CompanyController |
| `/company/{id}` | GET | `useCompany()` | Get single company | CompanyController |
| `/company/{id}` | PUT | `useUpdateCompany()` | Update company | CompanyController |
| `/company/{id}` | DELETE | `useDeleteCompany()` | Delete company | CompanyController |
| `/company/search` | GET | `useSearchCompanies()` | Search companies | CompanyController |
| `/company/{id}/research` | POST | `useResearchCompany()` | Research company | CompanyController |

---

### **8. CONTENT LIBRARY APIs**
**Frontend Service**: `apps/client/src/services/content-library/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/content-library` | GET | `useContentLibrary()` | Get all content | ContentLibraryController |
| `/content-library` | POST | `useCreateContentLibraryItem()` | Create content | ContentLibraryController |
| `/content-library/{id}` | PATCH | `useUpdateContentLibraryItem()` | Update content | ContentLibraryController |
| `/content-library/{id}` | DELETE | `useDeleteContentLibraryItem()` | Delete content | ContentLibraryController |
| `/content-library/sections` | GET | `useAvailableSections()` | Get available sections | ContentLibraryController |
| `/content-library/section/{id}` | GET | `useContentBySection()` | Get content by section | ContentLibraryController |
| `/content-library/section-key/{key}` | GET | `useContentBySectionKey()` | Get content by section key | ContentLibraryController |
| `/tags` | GET | `useTags()` | Get all tags | TagController |

---

### **9. CV EXTRACTION APIs**
**Frontend Service**: `apps/client/src/services/content-library/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/cv-extraction/extract` | POST | `useExtractFromCV()` | Extract content from CV | CVExtractionController |
| `/cv-extraction/extract-text` | POST | `useExtractTextFromCV()` | Extract text from CV | CVExtractionController |

---

### **10. USER APIS**
**Frontend Service**: `apps/client/src/services/user/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/user` | GET | `useUser()` | Get user profile | UserController |
| `/user` | PATCH | `useUpdateUser()` | Update user profile | UserController |
| `/user` | DELETE | `useDeleteUser()` | Delete user account | UserController |
| `/user/llm-settings` | GET | `useLLMSettings()` | Get LLM settings | UserController |
| `/user/llm-settings` | PUT | `useUpdateLLMSettings()` | Update LLM settings | UserController |

---

### **11. STORAGE APIs**
**Frontend Service**: `apps/client/src/services/storage/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/storage/upload-image` | POST | `useUploadImage()` | Upload image | StorageController |

---

### **12. FEATURE FLAG APIs**
**Frontend Service**: `apps/client/src/services/feature/`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/feature/flags` | GET | `useFeatureFlags()` | Get feature flags | FeatureController |

---

### **13. CONTENT SELECTION APIs**
**Frontend Service**: `apps/client/src/services/content-selection.ts`

| Endpoint | Method | Frontend Hook | Purpose | Backend Service |
|----------|--------|---------------|---------|-----------------|
| `/content-selection/{jobId}/select` | POST | `useSelectContent()` | Select content for job | ContentSelectionController |

---

## 🎯 **DIRECT API CALLS IN COMPONENTS**

### **Additional Endpoints Found in Components**:

| Endpoint | Method | Component Location | Purpose | Backend Service |
|----------|--------|--------------------|---------|-----------------|
| `/api/cover-letter-content/extract-from-interview` | POST | `story-interview-dialog.tsx` | Extract stories from interview | CoverLetterContentController |

---

## 📊 **BACKEND SERVICE MAPPING ANALYSIS**

### **Services Requiring Analysis & Refactoring**:

1. **JobApplicationController** - **CRITICAL: NEEDS IMMEDIATE REFACTORING** 
   - **16 endpoints** (not 12+ as initially estimated)
   - **2387+ lines** of service code
   - **7 different domains**: CRUD, job analysis, document generation, interviews, communication, company analysis, data enrichment
   - **10+ service dependencies**
   - **📋 Detailed Analysis**: See [job-application-controller.md](./api/job-application-controller.md)

2. **CoverLetterController**
   - 8 endpoints  
   - Well-defined scope
   - **Good architecture**

3. **CoverLetterContentController**
   - 10+ endpoints
   - Story management and content matching
   - **Moderate refactoring needed**

4. **AuthController**
   - 14+ endpoints
   - Well-organized by feature (2FA, email verification, etc.)
   - **Good architecture**

5. **ResumeController**
   - 12+ endpoints
   - Complex but well-defined scope
   - **Minor refactoring needed**

6. **CompanyController** 
   - 7 endpoints
   - Research functionality might be separate service
   - **Minor refactoring needed**

7. **ContentLibraryController**
   - 8+ endpoints
   - Well-defined content management
   - **Good architecture**

8. **UserController**
   - 5 endpoints
   - Simple user management
   - **Good architecture**

---

## 🚨 **REFACTORING RECOMMENDATIONS**

### **Priority 1: JobApplicationController (CRITICAL - DETAILED ANALYSIS COMPLETE)**
**Current Issues** (CONFIRMED):
- **7 different domains** of responsibility
- **16 endpoints** with complex business logic
- **2387+ lines** of service code
- **10+ service dependencies**

**Recommended Split** (DETAILED PLAN AVAILABLE):
```
JobApplicationController (CRUD only - ~300 lines)
├── JobAnalysisService (job posting analysis) ✅ EXISTS
├── DocumentGenerationService (resume/cover letter generation)
├── InterviewService (interview generation and management)
├── ContactMessageService (communication generation)
├── CompanyAnalysisService (company analysis for jobs)
└── JobDataEnrichmentService (enhanced data aggregation)
```

**📋 See Complete Refactoring Plan**: [job-application-controller.md](./api/job-application-controller.md)

### **Priority 2: CoverLetterContentController (MEDIUM)**
**Recommended Split**:
```
CoverLetterContentController (Core CRUD)
├── StoryMatchingService (content selection for jobs)
├── InterviewExtractionService (extract stories from interviews)
└── ContentSearchService (search and categorization)
```

### **Priority 3: ResumeController (LOW)**
**Minor optimizations**:
- Extract PrinterService integration
- Separate statistics service

---

## 🔍 **NEXT STEPS FOR REFACTORING**

1. **Analyze JobApplicationController** - Map each endpoint to service methods
2. **Document current service file sizes** - Identify bloated services
3. **Create service extraction plan** - Plan new single-responsibility services
4. **Map dependencies** - Understand service interconnections
5. **Plan migration strategy** - Gradual refactoring approach

---

**📋 This document serves as the foundation for backend service refactoring and cleanup efforts.**
