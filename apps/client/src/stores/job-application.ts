import type { JobApplicationDto } from "@reactive-resume/dto";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type JobApplicationState = {
  jobApplication: JobApplicationDto | null;
  setJobApplication: (jobApplication: JobApplicationDto | null) => void;
  updateJobApplication: (updates: Partial<JobApplicationDto>) => void;
};

export const useJobApplicationStore = create<JobApplicationState>()(
  devtools(
    (set, get) => ({
      jobApplication: null,
      setJobApplication: (jobApplication) => {
        set({ jobApplication });
      },
      updateJobApplication: (updates) => {
        set((state) => ({
          jobApplication: state.jobApplication ? { ...state.jobApplication, ...updates } : null,
        }));
      },
    }),
    {
      name: "job-application",
    },
  ),
);
