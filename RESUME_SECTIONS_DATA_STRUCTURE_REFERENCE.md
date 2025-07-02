# Resume Sections & Content Library Data Structure Reference

## 📋 Overview
This document provides a comprehensive breakdown of all data structures used in:
- **Resume Editor** (sidebar editing)
- **Content Library** (database storage)
- **Database Schema** (Prisma models)

---

## 🎯 Resume Section Schemas (Resume Editor)

### **Location**: `libs/schema/src/sections/`

#### **1. Base Item Schema**
**File**: `libs/schema/src/shared/item.ts`
```typescript
export const itemSchema = z.object({
  id: idSchema,                      // string (cuid)
  visible: z.boolean(),              // boolean
  contentId: idSchema.nullable().optional(),        // Direct content reference
  sourceContentId: idSchema.nullable().optional(),  // Original content if modified
});
```

**Content Reference States**:
- `contentId: "content_123", sourceContentId: null` = ✅ **Unmodified** content library item
- `contentId: null, sourceContentId: "content_123"` = 🔄 **Modified** from original content
- `contentId: null, sourceContentId: null` = ✏️ **Manually created** item

#### **2. Experience Section**
**File**: `libs/schema/src/sections/experience.ts`
```typescript
export const experienceSchema = itemSchema.extend({
  company: z.string().min(1),        // Required: Company name
  position: z.string(),              // Job title/position
  location: z.string(),              // Work location
  date: z.string(),                  // Date range as string
  summary: z.string(),               // HTML description
  url: urlSchema,                    // {label: string, href: string}
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 177-185)

#### **3. Education Section**
**File**: `libs/schema/src/sections/education.ts`
```typescript
export const educationSchema = itemSchema.extend({
  institution: z.string().min(1),   // Required: School/University
  studyType: z.string(),             // Degree type
  area: z.string(),                  // Field of study
  score: z.string(),                 // GPA/Grade
  date: z.string(),                  // Date range
  summary: z.string(),               // HTML description
  url: urlSchema,                    // Institution website
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 187-194)

#### **4. Skills Section**
**File**: `libs/schema/src/sections/skill.ts`
```typescript
export const skillSchema = itemSchema.extend({
  name: z.string(),                  // Skill name
  description: z.string(),           // Skill description
  level: z.coerce.number().min(0).max(5).default(1), // Proficiency (0-5)
  keywords: z.array(z.string()).default([]),          // Related keywords
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 196-206)

#### **5. Projects Section**
**File**: `libs/schema/src/sections/project.ts`
```typescript
export const projectSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Project name
  description: z.string(),           // Brief description
  date: z.string(),                  // Project timeline
  summary: z.string(),               // HTML detailed description
  keywords: z.array(z.string()).default([]), // Tech stack/keywords
  url: urlSchema,                    // Project/demo URL
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 235-246)

#### **6. Languages Section**
**File**: `libs/schema/src/sections/language.ts`
```typescript
export const languageSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Language name
  description: z.string(),           // Proficiency description
  level: z.coerce.number().min(0).max(5).default(1), // Proficiency level
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 208-216)

#### **7. Certifications Section**
**File**: `libs/schema/src/sections/certification.ts`
```typescript
export const certificationSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Certification name
  issuer: z.string(),                // Issuing organization
  date: z.string(),                  // Issue/expiry date
  summary: z.string(),               // HTML description
  url: urlSchema,                    // Verification URL
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 226-233)

#### **8. Awards Section**
**File**: `libs/schema/src/sections/award.ts`
```typescript
export const awardSchema = itemSchema.extend({
  title: z.string().min(1),          // Required: Award title
  awarder: z.string(),               // Awarding organization
  date: z.string(),                  // Award date
  summary: z.string(),               // HTML description
  url: urlSchema,                    // Award details URL
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 218-225)

#### **9. Volunteer Section**
**File**: `libs/schema/src/sections/volunteer.ts`
```typescript
export const volunteerSchema = itemSchema.extend({
  organization: z.string().min(1),   // Required: Organization
  position: z.string(),              // Volunteer role
  location: z.string(),              // Location
  date: z.string(),                  // Date range
  summary: z.string(),               // HTML description
  url: urlSchema,                    // Organization URL
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 248-258)

#### **10. Interests Section**
**File**: `libs/schema/src/sections/interest.ts`
```typescript
export const interestSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Interest name
  keywords: z.array(z.string()).default([]), // Related terms
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 260-268)

#### **11. Publications Section**
**File**: `libs/schema/src/sections/publication.ts`
```typescript
export const publicationSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Publication title
  publisher: z.string(),             // Publisher/Journal
  date: z.string(),                  // Publication date
  summary: z.string(),               // HTML description
  url: urlSchema,                    // Publication URL
});
```

#### **12. References Section**
**File**: `libs/schema/src/sections/reference.ts`
```typescript
export const referenceSchema = itemSchema.extend({
  name: z.string().min(1),           // Required: Reference name
  description: z.string(),           // Title/relationship
  summary: z.string(),               // HTML contact details
  url: urlSchema,                    // LinkedIn/profile URL
});
```

#### **13. Profiles Section**
**File**: `libs/schema/src/sections/profile.ts`
```typescript
export const profileSchema = itemSchema.extend({
  network: z.string().min(1),        // Required: Platform name
  username: z.string().min(1),       // Required: Username
  icon: z.string(),                  // Icon identifier
  url: urlSchema,                    // Profile URL
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/index.tsx` (lines 169-176)

#### **14. Custom Sections**
**File**: `libs/schema/src/sections/custom-section.ts`
```typescript
export const customSectionSchema = itemSchema.extend({
  name: z.string(),                  // Custom item name
  description: z.string(),           // Brief description
  date: z.string(),                  // Date/timeline
  location: z.string(),              // Location
  summary: z.string(),               // HTML detailed description
  keywords: z.array(z.string()).default([]), // Keywords/tags
  url: urlSchema,                    // Related URL
});
```
**Resume Editor**: Dynamic sections created by users

#### **15. Summary Section (Special)**
**File**: `libs/schema/src/sections/index.ts` (lines 34-37)
```typescript
summary: sectionSchema.extend({
  id: z.literal("summary"),
  content: z.string().default(""),  // HTML content (not item-based)
}),
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/sections/summary.tsx`

#### **16. Basics Section (Contact Info)**
**File**: `libs/schema/src/basics/index.ts`
```typescript
export const basicsSchema = z.object({
  name: z.string(),                  // Full name
  headline: z.string(),              // Professional title
  email: z.literal("").or(z.string().email()), // Email address
  phone: z.string(),                 // Phone number
  location: z.string(),              // Location
  url: urlSchema,                    // Website URL
  customFields: z.array(customFieldSchema), // Custom fields
  picture: z.object({               // Profile picture settings
    url: z.string(),
    size: z.number().default(64),
    aspectRatio: z.number().default(1),
    borderRadius: z.number().default(0),
    effects: z.object({
      hidden: z.boolean().default(false),
      border: z.boolean().default(false),
      grayscale: z.boolean().default(false),
    }),
  }),
});
```
**Resume Editor**: `apps/client/src/pages/builder/sidebars/left/sections/basics.tsx`

---

## 🗄️ Database Schema (Prisma)

### **Location**: `apps/server/prisma/schema.prisma`

#### **Content Table** (New Simplified Structure)
```sql
model Content {
  id                      String       @id @default(cuid())
  title                   String       // Content title
  description             String?      // Optional description
  content                 String       @default("{}")  // 👈 ALL section-specific data stored here
  sectionId               String       // Foreign key to Section
  userId                  String       // Foreign key to User
  sourceContentId  String?      // 👈 For variants: points to master content
  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt
  
  // ✅ Relationships:
  user                    User         @relation(...)
  section                 Section      @relation(...)
  tags                    ContentTag[] // 🔥 NEVER DELETE - Critical for job matching
  
  // Self-referencing for variants
  masterContent           Content?     @relation("ContentVariants", fields: [sourceContentId], references: [id])
  variants                Content[]    @relation("ContentVariants")
}
```

#### **Section Table**
```sql
model Section {
  id                String    @id @default(cuid())
  key               String    @unique  // 'experience', 'education', etc.
  name              String    // Display name
  description       String?   // Section description
  icon              String?   // Icon identifier
  fieldRequirements String    @default("{}")  // JSON
  validation        String    @default("{}")  // JSON
  order             Int       @default(0)
  isActive          Boolean   @default(true)
  isDefault         Boolean   @default(false)
  isCustomizable    Boolean   @default(true)
  content           Content[] // Related content items
}
```

#### **Tag System**
```sql
model Tag {
  id        String       @id @default(cuid())
  name      String       // Tag name
  color     String?      // Hex color
  userId    String       // Owner
  content   ContentTag[] // Many-to-many with Content
}

model ContentTag {
  id        String  @id @default(cuid())
  contentId String  // Foreign key to Content
  tagId     String  // Foreign key to Tag
  content   Content @relation(...)
  tag       Tag     @relation(...)
}
```

---

## 📚 Content Library Structure

### **Location**: `apps/client/src/pages/dashboard/content-library/`

#### **Main Content Library Page**
**File**: `apps/client/src/pages/dashboard/content-library/page.tsx`
- Displays content items by section
- Filtering and search functionality
- Tag-based filtering

#### **Content Edit Dialog (Current Complex Version)**
**File**: `apps/client/src/pages/dashboard/content-library/_components/content-edit-dialog.tsx`

**Field Mapping Structure** (lines 44-107):
```typescript
const SECTION_FIELD_MAPPING = {
  experience: {
    required: ['title', 'company', 'position', 'startDate'],
    optional: ['description', 'location', 'endDate', 'isPresent', 'achievements', 'skills', 'url', 'contactPerson', 'contactInfo'],
    exclude: ['issuer', 'score', 'proficiencyLevel', 'category', 'courses', 'keywords']
  },
  education: {
    required: ['title', 'company', 'position'], // company=institution, position=studyType
    optional: ['description', 'location', 'startDate', 'endDate', 'score', 'achievements', 'courses', 'url'],
    exclude: ['issuer', 'proficiencyLevel', 'category', 'skills', 'keywords', 'isPresent', 'contactPerson', 'contactInfo']
  },
  // ... more sections
};
```

#### **Content Library API Services**
**File**: `apps/client/src/services/content-library/content-library.ts`
- `useContentLibrary()` - Fetch content items
- `useCreateContentLibraryItem()` - Create new content
- `useUpdateContentLibraryItem()` - Update existing content
- `useDeleteContentLibraryItem()` - Delete content
- `useAvailableTags()` - Fetch available tags
- `useAvailableSections()` - Fetch sections

---

## 🔄 Content Variant System (Master/Variant Relationships)

### **Master Content** (Base Experience)
```json
// Content Table Record
{
  "id": "content_master_123",
  "title": "Senior Developer at Google",
  "description": "Leadership and technical role",
  "sectionId": "experience_section_id",
  "sourceContentId": null,  // 👈 NULL = Master record
  "content": {
    "company": "Google",
    "position": "Senior Developer",
    "location": "Mountain View, CA",
    "date": "Jan 2020 - Present",
    "summary": "<p>Full-stack development with team leadership responsibilities...</p>",
    "url": {"label": "Google", "href": "https://google.com"}
  },
  "tags": [
    {"name": "google", "color": "#4285f4"},
    {"name": "senior-developer", "color": "#34a853"},
    {"name": "javascript", "color": "#f9ab00"},
    {"name": "react", "color": "#61ddfb"},
    {"name": "team-leadership", "color": "#ea4335"}
  ]
}
```

### **Variant Content** (Leadership-Focused)
```json
// Content Table Record
{
  "id": "content_variant_124",
  "title": "Team Lead & Senior Developer at Google", 
  "description": "Emphasizes leadership and mentoring aspects",
  "sectionId": "experience_section_id",
  "sourceContentId": "content_master_123", // 👈 Points to master
  "content": {
    "company": "Google",
    "position": "Team Lead & Senior Developer",
    "location": "Mountain View, CA", 
    "date": "Jan 2020 - Present",
    "summary": "<p>Led cross-functional team of 8 developers, mentored junior engineers...</p>",
    "url": {"label": "Google", "href": "https://google.com"}
  },
  "tags": [
    {"name": "google", "color": "#4285f4"},
    {"name": "team-lead", "color": "#ea4335"},
    {"name": "mentoring", "color": "#fbbc04"},
    {"name": "leadership", "color": "#34a853"},
    {"name": "management", "color": "#9aa0a6"}
  ]
}
```

### **Variant Content** (Technical-Focused)
```json
// Content Table Record  
{
  "id": "content_variant_125",
  "title": "Senior Developer at Google",
  "description": "Highlights technical architecture and performance",
  "sectionId": "experience_section_id", 
  "sourceContentId": "content_master_123", // 👈 Points to master
  "content": {
    "company": "Google",
    "position": "Senior Developer",
    "location": "Mountain View, CA",
    "date": "Jan 2020 - Present", 
    "summary": "<p>Architected microservices handling 100M+ requests/day, reduced API response time by 40%...</p>",
    "url": {"label": "Google", "href": "https://google.com"}
  },
  "tags": [
    {"name": "google", "color": "#4285f4"},
    {"name": "architecture", "color": "#9aa0a6"},
    {"name": "microservices", "color": "#34a853"},
    {"name": "performance", "color": "#ea4335"},
    {"name": "scalability", "color": "#fbbc04"}
  ]
}
```

### **Smart Content Selection Logic**
```javascript
// 1. Get all master content (no variants in initial query)
const masterContent = await prisma.content.findMany({
  where: { 
    sectionKey: 'experience',
    sourceContentId: null // Only masters
  },
  include: {
    variants: true, // Include all variants for each master
    tags: { include: { tag: true } }
  }
});

// 2. For each master, select best variant based on job matching
const selectBestVariant = (masterWithVariants, jobKeywords) => {
  const allOptions = [masterWithVariants, ...masterWithVariants.variants];
  
  return allOptions.reduce((best, current) => {
    const currentScore = calculateTagMatchScore(current.tags, jobKeywords);
    const bestScore = calculateTagMatchScore(best.tags, jobKeywords);
    return currentScore > bestScore ? current : best;
  });
};
```

---

## 🔄 Current Migration Status

### **Current Status**
🔄 **DATABASE RESET REQUIRED** - Schema changes have cleared existing data

### **Migration Required - NovoResume Data Import**
All content needs to be imported fresh from NovoResume data using the new structure:

1. **❌ Experience** - Import with proper content JSON format + variant detection
2. **❌ Education** - Import with institution/studyType/area structure
3. **❌ Skills** - Import with name/description/level (0-5) format
4. **❌ Projects** - Import with name/description/date/keywords structure
5. **❌ Languages** - Import with name/description/level format
6. **❌ Certifications** - Import with name/issuer/date structure
7. **❌ Volunteer** - Import with organization/position/location structure
8. **❌ Awards** - Import with title/awarder/date structure
9. **❌ Publications** - Import with name/publisher/date structure
10. **❌ References** - Import with name/description/summary structure
11. **❌ Interests** - Import with name/keywords structure
12. **❌ Profiles** - Import with network/username/icon structure
13. **❌ Custom Sections** - Import with flexible name/description/date structure
14. **❌ Summary** - Import as direct string content
15. **❌ Contact/Basics** - Import with full basics schema structure

---

## 🤖 LLM-Powered Import Script Requirements

### **Core Import Process**
1. **📂 Source Data**: `novoresume-data/` directory with JSON files
2. **🧠 LLM Processing**: Use Claude/GPT to intelligently structure each content item  
3. **🏷️ Smart Tagging**: LLM generates semantic tags based on content analysis
4. **🔍 Variant Detection**: LLM identifies similar experiences and creates master/variant relationships
5. **✅ Schema Validation**: Ensure all content matches target JSON structures

### **LLM Processing Steps per Content Item**

#### **Step 1: Content Analysis**
```javascript
// LLM Prompt Template
const analyzeContent = `
Analyze this ${sectionType} content and structure it according to the schema:

Raw Data: ${rawNovoResumeData}
Target Schema: ${targetSchemaExample}

Tasks:
1. Extract and structure the content in proper JSON format
2. Generate 3-8 semantic tags for job matching (technical skills, soft skills, industries, etc.)
3. Suggest if this content is similar to existing content (provide similarity score)
4. Clean and enhance the summary/description for professional presentation

Response Format:
{
  "structuredContent": { /* properly formatted content */ },
  "suggestedTags": ["tag1", "tag2", ...],
  "similarityCheck": { "isVariant": boolean, "masterContentId": string|null, "confidence": number },
  "qualityScore": number // 1-10 rating of content completeness
}
`;
```

#### **Step 2: Smart Variant Detection**
```javascript
// For each new content item, check against existing items
const detectVariants = async (newContent, existingContent) => {
  const prompt = `
  Compare this new ${sectionType} content with existing content to detect variants:
  
  New Content: ${newContent}
  Existing Content: ${existingContent.map(c => c.title + ': ' + c.summary).join('\n')}
  
  Determine:
  1. Is this a variant of existing content? (same company/role but different focus)
  2. Which existing content is most similar?
  3. What's the confidence level (0-100)?
  4. What type of variant is this? (leadership_focused, technical_focused, etc.)
  
  Response: { "isVariant": boolean, "masterContentId": string|null, "variantType": string, "confidence": number }
  `;
  
  return await llm.analyze(prompt);
};
```

#### **Step 3: Tag Generation & Optimization**
```javascript
// Generate semantic tags optimized for job matching
const generateTags = async (content, sectionType) => {
  const prompt = `
  Generate 3-8 semantic tags for this ${sectionType} content that would be useful for job matching:
  
  Content: ${JSON.stringify(content)}
  
  Tag Categories:
  - Technical Skills (programming languages, frameworks, tools)
  - Soft Skills (leadership, communication, problem-solving)
  - Industries (fintech, healthcare, e-commerce)
  - Company Types (startup, enterprise, remote)
  - Experience Level (junior, senior, principal, manager)
  - Domains (frontend, backend, fullstack, devops, mobile)
  
  Return array of strings: ["tag1", "tag2", "tag3", ...]
  Keep tags lowercase, use hyphens for multi-word tags
  `;
  
  return await llm.generateTags(prompt);
};
```

### **Import Script Structure**
```javascript
// tools/import-novoresume-with-llm.js
class NovoResumeLLMImporter {
  async processSection(sectionType, rawData) {
    for (const item of rawData) {
      // 1. LLM Analysis
      const analysis = await this.analyzeWithLLM(item, sectionType);
      
      // 2. Variant Detection  
      const variantInfo = await this.detectVariants(analysis.structuredContent, existingContent);
      
      // 3. Create/Update Content
      const contentRecord = await this.createContentRecord({
        ...analysis.structuredContent,
        sourceContentId: variantInfo.isVariant ? variantInfo.masterContentId : null,
        tags: analysis.suggestedTags
      });
      
      // 4. Create Tags
      await this.createTags(analysis.suggestedTags, contentRecord.id);
      
      console.log(`✅ Imported ${sectionType}: ${contentRecord.title}`);
    }
  }
}
```

### **Expected Output Quality**
- **📊 Structured Data**: All content properly formatted according to schemas
- **🏷️ Rich Tagging**: 5-8 semantic tags per content item for optimal job matching
- **🔗 Smart Variants**: Related experiences grouped with master/variant relationships  
- **✨ Enhanced Content**: LLM-improved summaries and descriptions
- **✅ Validation**: All content passes schema validation before import

---

## 🎯 Target Architecture (Post-Migration)

### **Final Content Table Structure**
```sql
model Content {
  id                      String       @id @default(cuid())
  title                   String       // Content title
  description             String?      // Optional description  
  content                 String       @default("{}")  // 👈 ALL section-specific data here
  sectionId               String       // Foreign key to Section
  userId                  String       // Foreign key to User
  sourceContentId  String?      // 👈 For variants: points to master content
  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt
  
  // ✅ Relationships:
  user                    User         @relation(...)
  section                 Section      @relation(...)
  tags                    ContentTag[] // 🔥 NEVER DELETE - Critical for job matching
  
  // Self-referencing for variants
  masterContent           Content?     @relation("ContentVariants", fields: [sourceContentId], references: [id])
  variants                Content[]    @relation("ContentVariants")
}
```

### **Resume Item Schema** (Updated Field Names)
```typescript
export const itemSchema = z.object({
  id: idSchema,                        // string (cuid)
  visible: z.boolean(),                // boolean
  contentId: idSchema.nullable().optional(),        // Direct content reference  
  sourceContentId: idSchema.nullable().optional(),  // Original content if modified
});
```
```

### **Content JSON Structure Examples (All Section Types)**

#### **1. Experience Content**
```json
{
  "company": "TechCorp",
  "position": "Senior Developer", 
  "location": "San Francisco, CA",
  "date": "Jan 2020 - Present",
  "summary": "<p>Led development of microservices architecture...</p>",
  "url": {"label": "Company", "href": "https://techcorp.com"}
}
```

#### **2. Education Content**
```json
{
  "institution": "Stanford University",
  "studyType": "Master of Science",
  "area": "Computer Science",
  "score": "3.8 GPA",
  "date": "2018 - 2020",
  "summary": "<p>Specialized in distributed systems and machine learning...</p>",
  "url": {"label": "University", "href": "https://stanford.edu"}
}
```

#### **3. Skills Content**
```json
{
  "name": "JavaScript",
  "description": "Frontend and Backend Development",
  "level": 4,
  "keywords": ["React", "Node.js", "TypeScript", "Vue.js"]
}
```

#### **4. Projects Content**
```json
{
  "name": "E-commerce Platform",
  "description": "Full-stack web application",
  "date": "Mar 2023 - Jun 2023",
  "summary": "<p>Built scalable e-commerce platform with React and Node.js...</p>",
  "keywords": ["React", "Node.js", "MongoDB", "Stripe API"],
  "url": {"label": "Demo", "href": "https://demo.example.com"}
}
```

#### **5. Languages Content**
```json
{
  "name": "Spanish",
  "description": "Professional working proficiency",
  "level": 3
}
```

#### **6. Certifications Content**
```json
{
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "date": "2023 - 2026",
  "summary": "<p>Professional-level certification demonstrating...</p>",
  "url": {"label": "Verify", "href": "https://aws.amazon.com/verification/cert123"}
}
```

#### **7. Awards Content**
```json
{
  "title": "Employee of the Year",
  "awarder": "TechCorp Inc.",
  "date": "December 2023",
  "summary": "<p>Recognized for outstanding performance...</p>",
  "url": {"label": "Article", "href": "https://blog.techcorp.com/awards2023"}
}
```

#### **8. Volunteer Content**
```json
{
  "organization": "Code for America",
  "position": "Senior Developer Volunteer",
  "location": "Remote",
  "date": "2022 - Present",
  "summary": "<p>Developed civic technology solutions...</p>",
  "url": {"label": "Organization", "href": "https://codeforamerica.org"}
}
```

#### **9. Interests Content**
```json
{
  "name": "Machine Learning",
  "keywords": ["AI", "Deep Learning", "Neural Networks", "Python"]
}
```

#### **10. Publications Content**
```json
{
  "name": "Scalable Microservices Architecture Patterns",
  "publisher": "ACM Digital Library",
  "date": "March 2023",
  "summary": "<p>Research paper on distributed systems design...</p>",
  "url": {"label": "Paper", "href": "https://dl.acm.org/doi/10.1145/example"}
}
```

#### **11. References Content**
```json
{
  "name": "Jane Smith",
  "description": "Senior Engineering Manager at TechCorp",
  "summary": "<p>Email: jane.smith@techcorp.com<br>Phone: +1-555-0123</p>",
  "url": {"label": "LinkedIn", "href": "https://linkedin.com/in/janesmith"}
}
```

#### **12. Profiles Content**
```json
{
  "network": "LinkedIn",
  "username": "johndoe",
  "icon": "linkedin",
  "url": {"label": "LinkedIn Profile", "href": "https://linkedin.com/in/johndoe"}
}
```

#### **13. Custom Sections Content**
```json
{
  "name": "Speaking Engagement",
  "description": "Conference Speaker",
  "date": "September 2023",
  "location": "San Francisco, CA",
  "summary": "<p>Presented on microservices architecture at DevCon 2023...</p>",
  "keywords": ["public speaking", "conferences", "microservices"],
  "url": {"label": "Video", "href": "https://youtube.com/watch?v=example"}
}
```

#### **14. Summary Content (Special - Not Item-based)**
```json
// Summary is stored directly as string content, not JSON
"<p>Experienced software engineer with 8+ years developing scalable web applications...</p>"
```

#### **15. Basics/Contact Content**
```json
{
  "name": "John Doe",
  "headline": "Senior Software Engineer", 
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "url": {"label": "Portfolio", "href": "https://johndoe.com"},
  "customFields": [
    {"name": "GitHub", "value": "github.com/johndoe"}
  ],
  "picture": {
    "url": "https://example.com/photo.jpg",
    "size": 64,
    "aspectRatio": 1,
    "borderRadius": 8,
    "effects": {
      "hidden": false,
      "border": true,
      "grayscale": false
    }
  }
}
```

---

## 📍 Key Reference Points

### **Resume Editor Components**
- **Main**: `apps/client/src/pages/builder/sidebars/left/index.tsx`
- **Basics**: `apps/client/src/pages/builder/sidebars/left/sections/basics.tsx`
- **Summary**: `apps/client/src/pages/builder/sidebars/left/sections/summary.tsx`

### **Content Library Components** 
- **Main**: `apps/client/src/pages/dashboard/content-library/page.tsx`
- **Edit Dialog**: `apps/client/src/pages/dashboard/content-library/_components/content-edit-dialog.tsx`
- **Services**: `apps/client/src/services/content-library/content-library.ts`

### **Schema Definitions**
- **All Sections**: `libs/schema/src/sections/index.ts`
- **Individual Sections**: `libs/schema/src/sections/*.ts`
- **Basics**: `libs/schema/src/basics/index.ts`
- **Sample Data**: `libs/schema/src/sample.ts`

### **Database**
- **Schema**: `apps/server/prisma/schema.prisma`
- **Migrations**: `apps/server/prisma/migrations/`
- **Dev Database**: `apps/server/prisma/dev.db`

### **Migration Scripts**
- **Old Contact Migration**: `tools/migrate-contact-section.js` ✅ (template reference only)
- **NEW Import Script**: `tools/import-novoresume-with-llm.js` ❌ (to be created)

### **New Import Script Requirements**
```javascript
// tools/import-novoresume-with-llm.js
// Must include:
1. LLM integration (Anthropic Claude or OpenAI GPT)
2. Schema validation for all 15+ section types  
3. Smart variant detection and master/variant relationships
4. Semantic tag generation (5-8 tags per content item)
5. Progress tracking and error handling
6. Duplicate prevention 
7. Database transaction safety
8. Comprehensive logging and reporting
```

**Source Data**: `novoresume-data/` directory (JSON files)  
**Target**: New simplified Content table structure  
**Output**: Fully structured content library with rich tagging and variant relationships

---

## 🏷️ Tag System (Critical - Never Delete)

**Location**: Database tables `Tag` and `ContentTag`
- **Purpose**: Job matching and content organization
- **Colors**: Each tag has associated hex color
- **Relationships**: Many-to-many with Content items
- **⚠️ CRITICAL**: Tags are NEVER deleted during migration - they're essential for job matching algorithms 