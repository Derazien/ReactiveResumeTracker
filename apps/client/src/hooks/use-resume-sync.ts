import { useEffect, useRef } from 'react';
import { useResumeStore } from '@/client/stores/resume';

/**
 * Hook to ensure form components are properly synchronized with resume store changes
 * This is particularly important after LLM edits when the entire resume data changes
 */
export const useResumeSync = () => {
  const resume = useResumeStore((state) => state.resume);
  const lastResumeRef = useRef(resume);
  
  useEffect(() => {
    // Check if the resume has changed significantly (like after an LLM edit)
    const hasSignificantChange = JSON.stringify(lastResumeRef.current) !== JSON.stringify(resume);
    
    if (hasSignificantChange) {
      console.log('Resume sync: Detected significant change, forcing re-render');
      
      // Force a re-render by updating the store reference
      // This ensures all components subscribed to the store re-render
      setTimeout(() => {
        useResumeStore.setState((state) => ({
          resume: { ...state.resume }
        }));
      }, 100);
      
      lastResumeRef.current = resume;
    }
  }, [resume]);
  
  return resume;
}; 