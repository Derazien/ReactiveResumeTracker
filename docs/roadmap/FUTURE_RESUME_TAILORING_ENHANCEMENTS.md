# Future Resume Tailoring Enhancements

## Overview

This document outlines a comprehensive enhancement plan to transform the resume tailoring process from a black-box operation into an interactive, user-controlled experience with real-time feedback and granular customization options.

## Core Vision

Transform resume tailoring into a **collaborative process** where users can:
- See matched content with scores before generation
- Select additional content items
- Provide custom instructions
- Watch real-time tailoring progress
- Control tailoring intensity
- Choose between single-page and multi-page formats

## 1. Interactive Content Selection Interface

### 1.1 Job Application Content Preview

**Location**: Job Application Detail Page
**Component**: `ContentSelectionPanel`

```typescript
interface ContentSelectionPanelProps {
  jobApplicationId: string;
  userId: string;
  onContentSelectionChange: (selectedContent: SelectedContent[]) => void;
}

interface SelectedContent {
  contentId: string;
  sectionKey: string;
  title: string;
  matchScore: number;
  isSelected: boolean;
  isCurrentJob?: boolean;
  matchReasons: string[];
  matchSuggestions: string[];
}
```

**Features**:
- Display all matched content organized by section (Experience, Skills, Education, etc.)
- Show match scores (0-100) with color coding
- Highlight current jobs with special indicator
- Allow users to select/deselect content items
- Show match reasons and suggestions for each item
- Real-time preview of selected content count per section

### 1.2 Content Matching Visualization

```typescript
interface ContentMatchCard {
  content: ContentLibraryItem;
  matchScore: number;
  matchBreakdown: {
    relevanceScore: number;
    recencyScore: number;
    currentJobBonus: number;
    skillOverlap: number;
  };
  matchReasons: string[];
  matchSuggestions: string[];
  isCurrentJob: boolean;
  isSelected: boolean;
}
```

**UI Components**:
- **Match Score Bar**: Visual progress bar showing 0-100 score
- **Score Breakdown**: Tooltip showing individual scoring factors
- **Current Job Badge**: Special indicator for current positions
- **Selection Toggle**: Checkbox to include/exclude content
- **Match Insights**: Expandable section showing why content matches

## 2. Custom Instructions System

### 2.1 User-Level Default Instructions

**Location**: User Settings/Profile
**Component**: `DefaultInstructionsEditor`

```typescript
interface UserDefaultInstructions {
  id: string;
  userId: string;
  instructions: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultInstructionsForm {
  instructions: string;
  examples: string[];
  categories: {
    tone: 'professional' | 'casual' | 'technical' | 'creative';
    focus: 'achievements' | 'skills' | 'experience' | 'balanced';
    style: 'concise' | 'detailed' | 'storytelling';
  };
}
```

**Features**:
- Rich text editor for custom instructions
- Template examples (professional, technical, creative)
- Instruction categories and tags
- Preview of how instructions affect resume generation
- Version history of instruction changes

### 2.2 Job-Specific Custom Instructions

**Location**: Job Application Detail Page
**Component**: `JobSpecificInstructions`

```typescript
interface JobSpecificInstructions {
  jobApplicationId: string;
  instructions: string; // Max 1000 characters
  tailoringIntensity: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  resumeFormat: 'single-page' | 'multi-page';
  customPrompts: {
    summary: string;
    experience: string;
    skills: string;
    projects: string;
  };
}
```

**Features**:
- Inherit from user defaults with override capability
- Job-specific instruction editor
- Tailoring intensity slider (0-10)
- Resume format selection
- Section-specific custom prompts

## 3. Real-Time Streaming Tailoring

### 3.1 Asynchronous Tailoring Architecture

**Backend Changes**:
```typescript
interface TailoringJob {
  id: string;
  jobApplicationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    overall: number;
    currentSection: string;
    sectionProgress: Record<string, number>;
    estimatedTimeRemaining: number;
  };
  result?: {
    resumeId: string;
    changes: TailoringChange[];
    completionTime: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TailoringChange {
  type: 'added' | 'modified' | 'removed' | 'reordered';
  section: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface LLMStreamResponse {
  type: 'progress' | 'section-complete' | 'error' | 'complete';
  section?: string;
  progress?: number;
  data?: any;
  error?: string;
}
```

**Frontend Components**:
```typescript
interface TailoringProgressPanel {
  jobId: string;
  overallProgress: number;
  currentSection: string;
  sectionProgress: Record<string, number>;
  changes: TailoringChange[];
  estimatedTimeRemaining: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface LiveResumeEditor {
  resumeData: ResumeData;
  isTailoring: boolean;
  tailoringJobId?: string;
  tailoringProgress: TailoringProgressPanel;
  onSectionUpdate: (sectionKey: string, content: any) => void;
  onTailoringComplete: (resumeId: string) => void;
}
```

### 3.2 Asynchronous Tailoring Process

**Tailoring Order**:
1. **Summary** (1-2 sentences, job-focused)
2. **Experience** (prioritize current + relevant past)
3. **Skills** (match job requirements)
4. **Projects** (highlight relevant achievements)
5. **Education** (emphasize relevant degrees/courses)
6. **Additional Sections** (certifications, languages, etc.)

**Asynchronous Process**:
- Backend processes tailoring in background
- Database updates resume data as sections complete
- Frontend polls for progress updates
- Resume editor is disabled during tailoring
- Real-time LLM streaming within each section
- No pause/resume capability - process runs to completion

## 4. Tailoring Intensity Meter (None/Low/Medium/High/Maximum)

### 4.1 Intensity Levels

```typescript
interface TailoringIntensity {
  level: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  description: string;
  characteristics: string[];
  estimatedTime: number;
  llmInstructions: string;
}

const TAILORING_INTENSITY_LEVELS: TailoringIntensity[] = [
  {
    level: 'none',
    description: "No Tailoring - Matched Content Only",
    characteristics: [
      "Use selected content as-is",
      "No LLM modifications",
      "Fastest generation time",
      "Preserve original descriptions",
      "Direct content insertion"
    ],
    estimatedTime: 5,
    llmInstructions: "Use the provided content exactly as-is without any modifications."
  },
  {
    level: 'low',
    description: "Light Tailoring - Minor Adjustments",
    characteristics: [
      "Basic keyword optimization",
      "Minor description tweaks",
      "Preserve most original content",
      "Quick processing",
      "Minimal restructuring"
    ],
    estimatedTime: 15,
    llmInstructions: "Make minimal adjustments to optimize keywords and improve clarity while preserving the original content structure."
  },
  {
    level: 'medium',
    description: "Moderate Tailoring - Balanced Optimization",
    characteristics: [
      "Enhanced job relevance",
      "Improved descriptions",
      "Skill alignment",
      "Balanced changes",
      "Moderate restructuring"
    ],
    estimatedTime: 30,
    llmInstructions: "Enhance job relevance and improve descriptions while maintaining the core content structure and achievements."
  },
  {
    level: 'high',
    description: "Heavy Tailoring - Significant Optimization",
    characteristics: [
      "Major content restructuring",
      "Deep job alignment",
      "Enhanced achievements",
      "Comprehensive optimization",
      "Substantial rewriting"
    ],
    estimatedTime: 45,
    llmInstructions: "Significantly restructure and rewrite content to deeply align with job requirements while preserving key achievements."
  },
  {
    level: 'maximum',
    description: "Maximum Tailoring - Perfect Job Match",
    characteristics: [
      "Complete content transformation",
      "Perfect job requirement alignment",
      "Maximum keyword optimization",
      "Comprehensive restructuring",
      "Full content rewriting"
    ],
    estimatedTime: 60,
    llmInstructions: "Completely transform and rewrite all content to perfectly match the job requirements and optimize for ATS systems."
  }
];
```

### 4.2 Implementation Strategy

**Backend Logic**:
```typescript
class TailoringIntensityController {
  async tailorSection(
    sectionKey: string,
    content: any,
    jobRequirements: string[],
    intensity: TailoringIntensityLevel
  ): Promise<TailoringResult> {
    const intensityConfig = TAILORING_INTENSITY_LEVELS.find(
      level => level.level === intensity
    );
    
    const prompts = this.generatePromptsByIntensity(intensityConfig);
    const llmResponse = await this.llmService.tailorSection(
      sectionKey,
      content,
      jobRequirements,
      prompts
    );
    
    return this.applyIntensityFiltering(llmResponse, intensityConfig);
  }

  private generatePromptsByIntensity(intensity: TailoringIntensity): TailoringPrompts {
    switch (intensity.level) {
      case 'none':
        return { minimal: true, preserveOriginal: true, noModifications: true };
      case 'low':
        return { minimal: true, preserveOriginal: true, keywordOptimization: true };
      case 'medium':
        return { moderate: true, enhanceKeywords: true, improveDescriptions: true };
      case 'high':
        return { significant: true, restructure: true, deepAlignment: true };
      case 'maximum':
        return { maximum: true, transform: true, completeRewrite: true };
    }
  }
}
```

## 5. Resume Format Options

### 5.1 Single-Page Compact Resume

**Characteristics**:
- Maximum 1 page when printed
- Concise descriptions
- Prioritized content selection
- Optimized spacing and layout
- Focus on most relevant information

**Default Settings**:
```typescript
const SINGLE_PAGE_DEFAULTS = {
  maxExperiences: 3,
  maxProjects: 2,
  maxSkills: 15,
  summaryLength: 120,
  bulletPointLimit: 2600,
  showKeywords: false,
  showDescriptions: false
};
```

### 5.2 Multi-Page Expansive Resume

**Characteristics**:
- 2-3 pages when printed
- Detailed descriptions
- Comprehensive content inclusion
- Extended achievements and responsibilities
- Full skill and project details

**Default Settings**:
```typescript
const MULTI_PAGE_DEFAULTS = {
  maxExperiences: 5,
  maxProjects: 4,
  maxSkills: 30,
  summaryLength: 300,
  bulletPointLimit: 8000,
  showKeywords: true,
  showDescriptions: true
};
```

## 6. User Interface Components

### 6.1 Job Application Detail Page Redesign

**Location**: `apps/client/src/pages/dashboard/job-applications/[id]/page.tsx`

```typescript
interface JobApplicationDetailPage {
  // Existing job info
  jobApplication: JobApplication;
  
  // New content selection (card-based popup)
  contentSelectionPanel: ContentSelectionPanel;
  selectedContent: SelectedContent[];
  
  // Custom instructions
  customInstructions: JobSpecificInstructions;
  
  // Resume generation
  resumeFormat: 'single-page' | 'multi-page';
  tailoringIntensity: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  
  // Generation controls
  generateButton: GenerateTailoredResumeButton;
  progressPanel: TailoringProgressPanel;
}
```

### 6.2 Resume Editor Integration

**Location**: `apps/client/src/pages/builder/page.tsx` & `apps/artboard/src/pages/builder.tsx`

```typescript
interface LiveResumeEditor {
  // Real-time updates
  resumeData: ResumeData;
  isTailoring: boolean;
  tailoringJobId?: string;
  tailoringProgress: TailoringProgressPanel;
  
  // User controls (disabled during tailoring)
  intensitySlider: TailoringIntensitySlider;
  formatToggle: ResumeFormatToggle;
  
  // Live preview with streaming updates
  livePreview: ResumePreview;
  changeHighlighter: ChangeHighlighter;
  
  // Section editing (disabled during tailoring)
  sectionEditors: Record<string, SectionEditor>;
}
```

## 7. Technical Implementation Plan

### 7.1 Backend Changes

**New Services**:
```typescript
@Injectable()
export class InteractiveTailoringService {
  async startTailoringJob(
    jobApplicationId: string,
    selectedContent: SelectedContent[],
    instructions: JobSpecificInstructions
  ): Promise<TailoringJob>;
  
  async getTailoringProgress(jobId: string): Promise<TailoringJob>;
  
  async tailorSection(
    sectionKey: string,
    content: any,
    intensity: TailoringIntensityLevel
  ): Promise<SectionTailoringResult>;
  
  async streamLLMResponse(
    sectionKey: string,
    content: any,
    jobRequirements: string[],
    intensity: TailoringIntensityLevel
  ): AsyncGenerator<LLMStreamResponse>;
}

@Injectable()
export class ContentSelectionService {
  async getMatchedContent(
    jobApplicationId: string,
    userId: string
  ): Promise<ContentMatchCard[]>;
  
  async updateContentSelection(
    jobApplicationId: string,
    selectedContent: SelectedContent[]
  ): Promise<void>;
}
```

**Database Schema Updates**:
```sql
-- User default instructions
CREATE TABLE user_default_instructions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES User(id),
  instructions TEXT NOT NULL CHECK (length(instructions) <= 1000),
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job-specific instructions
CREATE TABLE job_specific_instructions (
  id TEXT PRIMARY KEY,
  job_application_id TEXT REFERENCES JobApplication(id),
  instructions TEXT CHECK (length(instructions) <= 1000),
  tailoring_intensity TEXT DEFAULT 'medium' CHECK (tailoring_intensity IN ('none', 'low', 'medium', 'high', 'maximum')),
  resume_format TEXT DEFAULT 'single-page' CHECK (resume_format IN ('single-page', 'multi-page')),
  custom_prompts TEXT DEFAULT '{}', -- JSONB equivalent for SQLite
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content selection for job applications
CREATE TABLE job_content_selection (
  id TEXT PRIMARY KEY,
  job_application_id TEXT REFERENCES JobApplication(id),
  content_id TEXT REFERENCES Content(id),
  is_selected BOOLEAN DEFAULT true,
  user_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tailoring jobs for async processing
CREATE TABLE tailoring_jobs (
  id TEXT PRIMARY KEY,
  job_application_id TEXT REFERENCES JobApplication(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress TEXT DEFAULT '{}', -- JSONB equivalent for SQLite
  result TEXT DEFAULT '{}', -- JSONB equivalent for SQLite
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Frontend Changes

**New Components**:
```typescript
// Content Selection (Card-based popup)
<ContentSelectionPanel /> // Similar to AI prompt box in toolbar.tsx
<ContentMatchCard />
<MatchScoreBar />
<CurrentJobBadge />

// Custom Instructions
<DefaultInstructionsEditor />
<JobSpecificInstructions />
<InstructionTemplates />

// Tailoring Controls
<TailoringIntensitySlider /> // Dropdown with None/Low/Medium/High/Maximum
<ResumeFormatToggle /> // Single/Multi-page toggle
<GenerateTailoredResumeButton />

// Progress Tracking
<TailoringProgressPanel />
<SectionProgressBar />
<LiveResumeEditor />
<ChangeHighlighter />

// Mobile Responsive Components
<MobileContentSelectionSheet />
<MobileTailoringControls />
```

**State Management**:
```typescript
interface TailoringState {
  // Content selection
  selectedContent: SelectedContent[];
  matchedContent: ContentMatchCard[];
  
  // Instructions
  customInstructions: JobSpecificInstructions;
  userDefaults: UserDefaultInstructions;
  
  // Generation
  isTailoring: boolean;
  tailoringJobId?: string;
  tailoringProgress: TailoringProgressPanel;
  resumeData: ResumeData;
  
  // Controls
  tailoringIntensity: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  resumeFormat: 'single-page' | 'multi-page';
}
```

## 8. User Experience Flow

### 8.1 Complete User Journey

1. **Job Application Creation**
   - User creates job application
   - System automatically matches content
   - Shows content selection panel

2. **Content Review & Selection**
   - User reviews matched content with scores
   - Selects/deselects content items
   - Views match reasons and suggestions

3. **Custom Instructions**
   - User sets tailoring intensity (None/Low/Medium/High/Maximum)
   - Chooses resume format (single/multi-page)
   - Adds custom instructions (inherits from defaults, max 1000 chars)

4. **Resume Generation**
   - User clicks "Generate Tailored Resume"
   - System starts async tailoring job
   - Opens resume editor with disabled sections

5. **Asynchronous Tailoring**
   - Backend processes tailoring in background
   - Frontend polls for progress updates
   - Resume editor shows real-time progress
   - Sections update as tailoring completes

6. **Final Review**
   - User reviews completed resume
   - Can make manual adjustments
   - Saves final version

## 9. Success Metrics

### 9.1 User Engagement
- **Content Selection Rate**: % of users who modify default content selection
- **Custom Instructions Usage**: % of users who add custom instructions
- **Tailoring Intensity Distribution**: Distribution of intensity levels chosen (None/Low/Medium/High/Maximum)
- **Format Preference**: % single-page vs multi-page selections
- **Mobile Usage**: % of users accessing on mobile devices

### 9.2 Quality Metrics
- **Tailoring Completion Rate**: % of tailoring processes completed successfully
- **User Satisfaction**: Feedback scores for tailored resumes
- **Job Application Success**: Interview/offer rates for tailored resumes
- **Content Relevance**: User ratings of content relevance

### 9.3 Performance Metrics
- **Generation Time**: Average time to complete tailoring by intensity level
- **Async Processing**: Background job completion rates and reliability
- **User Interaction**: Time spent in content selection and customization
- **Mobile Performance**: Load times and responsiveness on mobile devices

## 10. Implementation Priority & Next Steps

### Phase 1: Content Selection Interface (High Priority)
**Target**: Job Application Detail Page Enhancement
**Components**:
- `ContentSelectionPanel` (card-based popup similar to AI prompt box)
- `ContentMatchCard` with score visualization
- `CurrentJobBadge` for highlighting current positions
- Mobile-responsive design

**Files to Modify**:
- `apps/client/src/pages/dashboard/job-applications/[id]/page.tsx`
- `apps/client/src/services/job-application/`
- `apps/server/src/job-application/job-application.service.ts`

### Phase 2: Custom Instructions System (Medium Priority)
**Target**: User Settings & Job-Specific Instructions
**Components**:
- `DefaultInstructionsEditor` in user settings
- `JobSpecificInstructions` in job application detail
- Character limit enforcement (1000 chars)
- Instruction inheritance system

**Files to Modify**:
- `apps/client/src/pages/dashboard/settings/page.tsx`
- `apps/client/src/pages/dashboard/job-applications/[id]/page.tsx`
- Database schema updates

### Phase 3: Asynchronous Tailoring System (High Priority)
**Target**: Background Processing with Real-Time Updates
**Components**:
- `InteractiveTailoringService` for async processing
- `TailoringProgressPanel` for real-time updates
- Resume editor integration with disabled sections
- LLM streaming within sections

**Files to Modify**:
- `apps/server/src/llm/llm.service.ts`
- `apps/client/src/pages/builder/page.tsx`
- `apps/artboard/src/pages/builder.tsx`
- Database schema for tailoring jobs

### Phase 4: Resume Editor Integration (Medium Priority)
**Target**: Live Resume Updates During Tailoring
**Components**:
- `LiveResumeEditor` with real-time updates
- `ChangeHighlighter` for showing modifications
- Section editing disable during tailoring
- Progress visualization

**Files to Modify**:
- `apps/client/src/pages/builder/_components/toolbar.tsx`
- `apps/client/src/pages/builder/sidebars/left/index.tsx`
- `apps/artboard/src/pages/builder.tsx`

### Phase 5: Mobile Experience (Medium Priority)
**Target**: Mobile-Responsive Design
**Components**:
- `MobileContentSelectionSheet`
- `MobileTailoringControls`
- Touch-friendly interactions
- Optimized layouts for small screens

**Files to Modify**:
- All new components with mobile-first design
- Responsive CSS updates
- Touch event handling

### Technical Considerations

1. **Database Schema**: All new tables use SQLite-compatible syntax
2. **Existing Templates**: Integration with current resume templates
3. **Performance**: Async processing prevents UI blocking
4. **Mobile**: Card-based popups work well on mobile devices
5. **Character Limits**: 1000 character limit for custom instructions
6. **No Pause/Resume**: Tailoring runs to completion once started
7. **Real-Time Updates**: Section-by-section updates as processing completes
8. **Integration**: Leverages existing job application and resume systems 

## 11. Content ID Tracking System

### 11.1 Content Relationship Tracking

**Core Concept**: Every resume item tracks its relationship to content library items using two fields:
- `contentId`: Direct reference to content library item (when unmodified)
- `sourceContentId`: Original content reference (when modified from library)

**Content States**:
```typescript
interface ContentRelationship {
  // State 1: Direct Content Selection
  contentId: "content_123" | null;        // Points to content library item
  sourceContentId: null;                  // No modification
  
  // State 2: Modified Content
  contentId: null;                        // No direct reference
  sourceContentId: "content_123";         // Original content before modification
  
  // State 3: Manual Creation
  contentId: null;                        // No content library reference
  sourceContentId: null;                  // Manually created item
}
```

### 11.2 Content Selection Logic

**When User Selects Content from Library**:
```typescript
// Direct selection - contentId set, sourceContentId null
const selectedItem = {
  id: createId(), // New resume item ID
  visible: true,
  contentId: contentLibraryItem.id, // Direct reference
  sourceContentId: null, // No modification
  ...contentLibraryItem.data // Copy content data
};
```

**When User Edits Selected Content**:
```typescript
// Modified content - move contentId to sourceContentId
const modifiedItem = {
  ...originalItem,
  contentId: null, // Remove direct reference
  sourceContentId: originalItem.contentId, // Track original source
  // ... modified content data
};
```

**When User Adds Content Manually**:
```typescript
// Manual creation - no content library reference
const manualItem = {
  id: createId(),
  visible: true,
  contentId: null, // No content library reference
  sourceContentId: null, // Not from content library
  // ... manually entered data
};
```

### 11.3 Content Selection Interface Implementation

**Content Selection Panel**:
```typescript
interface ContentSelectionPanelProps {
  jobApplicationId: string;
  userId: string;
  onContentSelectionChange: (selectedContent: SelectedContent[]) => void;
}

interface ContentMatchCard {
  content: ContentLibraryItem;
  matchScore: number;
  matchBreakdown: {
    relevanceScore: number;
    recencyScore: number;
    currentJobBonus: number;
    skillOverlap: number;
  };
  matchReasons: string[];
  matchSuggestions: string[];
  isCurrentJob: boolean;
  isSelected: boolean;
  relationshipStatus: 'direct' | 'modified' | 'manual' | 'none';
}
```

**Content Relationship Indicators**:
```typescript
interface ContentRelationshipIndicator {
  // Visual indicators in resume editor
  contentId: string | null;
  sourceContentId: string | null;
  relationshipType: 'direct' | 'modified' | 'manual';
  
  // UI Elements
  contentLibraryBadge?: boolean; // Shows if item is from content library
  modifiedIndicator?: boolean;   // Shows if item was modified
  addToLibraryButton?: boolean;  // Option to add modified content back to library
}
```

### 11.4 Resume Editor Integration

**Content Selection in Resume Editor**:
```typescript
interface ResumeEditorContentSelection {
  // When user clicks on resume item
  onItemClick: (itemId: string) => {
    const item = getResumeItem(itemId);
    
    if (item.contentId) {
      // Direct content library item - show "Edit" option
      showEditOptions(item);
    } else if (item.sourceContentId) {
      // Modified content - show "Revert" and "Add to Library" options
      showModifiedOptions(item);
    } else {
      // Manual content - show "Add to Library" option
      showManualOptions(item);
    }
  };
  
  // Content library integration
  onAddToLibrary: (itemId: string) => {
    const item = getResumeItem(itemId);
    const newContent = createContentFromItem(item);
    addToContentLibrary(newContent);
    // Update item to reference new content
    updateItemContentId(itemId, newContent.id);
  };
}
```

### 11.5 Implementation Files

**Backend Services**:
- `apps/server/src/content-library/content-library.service.ts` - Content CRUD operations
- `apps/server/src/job-application/job-application.service.ts` - Content selection logic
- `apps/server/src/resume/resume.service.ts` - Resume item content tracking

**Frontend Components**:
- `apps/client/src/pages/dashboard/job-applications/[id]/content-selection.tsx` - Content selection panel
- `apps/client/src/pages/builder/_components/content-indicators.tsx` - Content relationship indicators
- `apps/client/src/pages/builder/sidebars/left/_components/content-options.tsx` - Content management options

**Database Schema**:
- Content tracking fields already exist in `itemSchema`
- Content library structure already implemented
- Job content selection table for tracking selections

### 11.6 User Experience Flow

1. **Content Selection**:
   - User views job application
   - System shows matched content with scores
   - User selects content items
   - Selected items get `contentId` set to content library ID

2. **Resume Generation**:
   - Selected content is added to resume with proper `contentId` tracking
   - Resume items maintain reference to original content

3. **Content Editing**:
   - User edits resume item
   - System moves `contentId` to `sourceContentId`
   - Sets `contentId` to `null` to indicate modification

4. **Content Management**:
   - Modified items show "Add to Library" option
   - Users can revert to original content
   - Users can add modified content as new library item

### 11.7 Benefits

- **Data Lineage**: Track where every resume item came from
- **Content Reuse**: Easy to reuse content across multiple resumes
- **Modification Tracking**: Know which items were modified from original
- **Library Management**: Add modified content back to library
- **Revert Capability**: Return to original content if needed
- **Analytics**: Track content usage and effectiveness 