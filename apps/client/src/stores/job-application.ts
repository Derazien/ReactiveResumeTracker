import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Job Application Store
 * 
 * Stores the currently selected job application ID for cover letter builder
 */
interface JobApplicationStore {
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useJobApplicationStore = create<JobApplicationStore>()(
  persist(
    (set) => ({
      selectedJobId: null,
      setSelectedJobId: (id) => set({ selectedJobId: id }),
      clearSelection: () => set({ selectedJobId: null }),
    }),
    {
      name: "job-application-store",
    }
  )
);







