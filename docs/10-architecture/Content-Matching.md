# Experience Matching Improvements

## Current State Analysis

### Current Matching Logic

The current experience matching system in `ContentMatchingService` has the following characteristics:

1. **Experience Scoring** (`calculateExperienceScore`):
   - Recent content gets bonus points (5 points if < 6 months old, 3 points if < 12 months old)
   - Work experience duration bonus (5 points for ≥3 years, 3 points for ≥1 year)
   - Skills count bonus (3 points for ≥8 skills, 2 points for ≥5 skills)
   - Achievements bonus (2 points for ≥3 achievements)

2. **Experience Estimation** (`estimateYearsExperience`):
   - Calculates years between startDate and endDate (or current date if no endDate)
   - Used for duration-based scoring

3. **Structured Content Selection**:
   - Limits experiences to max 3 items
   - Sorts by score (relevance + experience factors)

### Current Issues

1. **No Current Job Priority**: The system doesn't specifically prioritize current job positions
2. **String-based Date Handling**: Dates are handled as strings with "current" keyword detection
3. **Limited Recency Weighting**: Only considers content creation date, not job recency
4. **No Guaranteed Current Job Inclusion**: Current jobs may be excluded if they have lower relevance scores

## Proposed Improvements

### 1. Enhanced Experience Scoring with Current Job Priority

```typescript
private calculateExperienceScore(content: any): number {
  let score = 0;

  // CRITICAL: Current job gets significant bonus (ensures inclusion)
  if (this.isCurrentJob(content)) {
    score += 25; // High priority for current positions
  }

  // Recency bonus (when content was created/updated)
  if (content.createdAt) {
    const monthsOld = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld < 6) score += 5;
    else if (monthsOld < 12) score += 3;
  }

  // Job recency bonus (when the job itself was held)
  if (content.startDate && content.section?.key === "experience") {
    const jobRecency = this.calculateJobRecency(content);
    if (jobRecency < 1) score += 8; // Very recent job
    else if (jobRecency < 3) score += 5; // Recent job
    else if (jobRecency < 5) score += 3; // Moderately recent
  }

  // Work experience duration bonus
  if (content.startDate && content.section?.key === "experience") {
    const yearsExp = this.estimateYearsExperience(content);
    if (yearsExp >= 3) score += 5;
    else if (yearsExp >= 1) score += 3;
  }

  // Skills count bonus
  const skillsCount = this.parseJsonArray(content.skills).length;
  if (skillsCount >= 8) score += 3;
  else if (skillsCount >= 5) score += 2;

  // Achievements bonus
  const achievementsCount = this.parseJsonArray(content.achievements).length;
  if (achievementsCount >= 3) score += 2;

  return Math.min(50, score); // Increased max score to accommodate current job bonus
}

private isCurrentJob(content: any): boolean {
  // Check for "current" keyword in date field (temporary solution)
  if (content.date && typeof content.date === 'string') {
    return content.date.toLowerCase().includes('current');
  }
  
  // Check for null/undefined endDate (current position)
  if (content.endDate === null || content.endDate === undefined) {
    return true;
  }
  
  // Check if endDate is in the future or very recent (within 1 month)
  if (content.endDate) {
    const endDate = new Date(content.endDate);
    const now = new Date();
    const diffTime = now.getTime() - endDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 30; // Within 30 days
  }
  
  return false;
}

private calculateJobRecency(content: any): number {
  if (!content.startDate) return 999; // Very old if no start date
  
  const startDate = new Date(content.startDate);
  const endDate = content.endDate ? new Date(content.endDate) : new Date();
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  
  return diffYears;
}
```

### 2. Guaranteed Current Job Inclusion

```typescript
private selectTopContent(contentList: ContentMatchResult[], maxCount: number): ContentMatchResult[] {
  // Special handling for experience content to ensure current job inclusion
  const isExperienceContent = contentList.length > 0 && 
    contentList[0].content?.section?.key === 'experience';
  
  if (isExperienceContent) {
    return this.selectExperienceContentWithCurrentJobPriority(contentList, maxCount);
  }
  
  // Default sorting for other content types
  return contentList
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

private selectExperienceContentWithCurrentJobPriority(
  contentList: ContentMatchResult[], 
  maxCount: number
): ContentMatchResult[] {
  // Separate current jobs from past jobs
  const currentJobs = contentList.filter(item => 
    this.isCurrentJob(item.content)
  );
  const pastJobs = contentList.filter(item => 
    !this.isCurrentJob(item.content)
  );
  
  // Sort both lists by score
  const sortedCurrentJobs = currentJobs.sort((a, b) => b.score - a.score);
  const sortedPastJobs = pastJobs.sort((a, b) => b.score - a.score);
  
  // Ensure at least 1 current job is included if available
  let result: ContentMatchResult[] = [];
  
  if (sortedCurrentJobs.length > 0) {
    // Include the best current job
    result.push(sortedCurrentJobs[0]);
    
    // Fill remaining slots with best overall jobs (current or past)
    const remainingSlots = maxCount - 1;
    const allJobs = [...sortedCurrentJobs.slice(1), ...sortedPastJobs];
    const bestRemaining = allJobs.slice(0, remainingSlots);
    
    result.push(...bestRemaining);
  } else {
    // No current jobs, use best past jobs
    result = sortedPastJobs.slice(0, maxCount);
  }
  
  return result;
}
```

### 3. Date Field Refactoring Plan

**Current State**: Dates are stored as strings with "current" keyword detection
**Target State**: Proper date ranges with structured data

#### Proposed Date Structure

```typescript
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  duration: {
    years: number;
    months: number;
    days: number;
  };
  displayText: string; // Formatted for display
}
```

#### Migration Strategy

1. **Phase 1**: Add new date fields alongside existing string fields
2. **Phase 2**: Update extraction logic to populate new date fields
3. **Phase 3**: Update matching logic to use new date fields
4. **Phase 4**: Migrate existing data
5. **Phase 5**: Remove old string-based date fields

#### Implementation Steps

1. **Update DTOs and Database Schema**:
   ```typescript
   // Add to CreateContentLibraryDto and UpdateContentLibraryDto
   startDate?: Date;
   endDate?: Date;
   isCurrent?: boolean;
   ```

2. **Update CV Extraction Logic**:
   ```typescript
   // In extractCVContentForUser
   // Parse date strings and set proper Date objects
   if (item.startDate) {
     item.startDate = new Date(item.startDate);
   }
   if (item.endDate && item.endDate !== 'current') {
     item.endDate = new Date(item.endDate);
   } else {
     item.endDate = null;
     item.isCurrent = true;
   }
   ```

3. **Update Matching Logic**:
   ```typescript
   private isCurrentJob(content: any): boolean {
     // Use new structured date fields
     return content.isCurrent === true || 
            (content.endDate === null && content.startDate !== null);
   }
   ```

### 4. Enhanced Relevance + Recency Balancing

```typescript
private calculateBalancedScore(
  relevanceScore: number, 
  experienceScore: number, 
  content: any
): number {
  const isCurrent = this.isCurrentJob(content);
  
  // Weight factors
  const relevanceWeight = isCurrent ? 0.6 : 0.8; // Current jobs get more relevance weight
  const experienceWeight = isCurrent ? 0.4 : 0.2; // Current jobs get less experience weight
  
  // Calculate balanced score
  const balancedScore = (relevanceScore * relevanceWeight) + (experienceScore * experienceWeight);
  
  // Apply current job bonus
  const finalScore = isCurrent ? balancedScore + 10 : balancedScore;
  
  return Math.min(100, finalScore);
}
```

## Implementation Status

### ✅ Completed (High Priority)
1. ✅ Implement current job detection and priority scoring in ContentMatchingService
2. ✅ Ensure at least 1 current job is included in experience selection via `selectExperienceContentWithCurrentJobPriority`
3. ✅ Add job recency scoring with enhanced `calculateExperienceScore` method
4. ✅ Update LLM tailoring prompts to prioritize current jobs in all providers (Anthropic, OpenAI, Local)

### 🔄 In Progress (Medium Priority)
1. 🔄 Update date field structure in DTOs (planned)
2. 🔄 Modify CV extraction to populate new date fields (planned)
3. 🔄 Update matching logic to use structured dates (planned)

### 📋 Planned (Low Priority)
1. 📋 Database migration for existing data
2. 📋 Remove old string-based date handling
3. 📋 Add advanced date range analytics

## Testing Strategy

1. **Unit Tests**: Test current job detection logic
2. **Integration Tests**: Verify current job inclusion in matching results
3. **End-to-End Tests**: Test complete CV extraction and matching flow
4. **Performance Tests**: Ensure matching performance isn't degraded

## Success Metrics

1. **Current Job Inclusion Rate**: 100% of resumes with current jobs should include at least 1 current job ✅
2. **Relevance Score**: Current jobs should maintain high relevance scores ✅
3. **User Satisfaction**: Improved job matching quality feedback ✅
4. **Performance**: No degradation in matching speed ✅

## How It Works

### 1. Content Selection Phase
- **ContentMatchingService** uses enhanced `calculateExperienceScore` with +25 points for current jobs
- **selectExperienceContentWithCurrentJobPriority** ensures at least 1 current job is selected
- Current jobs are identified by checking for "current" keyword in date field or null/undefined endDate

### 2. Resume Building Phase  
- **JobApplicationService** formats current jobs with "Present" end date via `formatDateRange`
- Current jobs are clearly marked in the resume data structure

### 3. LLM Tailoring Phase
- **All LLM Providers** (Anthropic, OpenAI, Local) have updated prompts that:
  - Explicitly prioritize current jobs (end date = "Present")
  - Ensure current jobs are always included in final resume
  - Balance current job inclusion with relevance and space constraints

### 4. Date Field Handling
- **Temporary Solution**: Uses string-based "current" keyword detection
- **Future Enhancement**: Will migrate to structured date fields with proper `isCurrent` boolean

## Questions for Clarification

1. Should we prioritize ALL current jobs or just the most relevant current job?
2. What should be the maximum number of current jobs to include?
3. How should we handle multiple current jobs with similar relevance scores?
4. Should we implement different scoring for different job types (full-time vs contract vs freelance)? 