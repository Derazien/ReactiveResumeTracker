import type { ResumeData } from "@reactive-resume/schema";
import { create } from "zustand";

export type ArtboardStore = {
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
  setColumnSplit: (split: number) => void;
};

export const useArtboardStore = create<ArtboardStore>()((set) => ({
  resume: null as unknown as ResumeData,
  setResume: (resume) => {
    set({ resume });
  },
  setColumnSplit: (split) => {
    set((state) => ({
      ...state,
      resume: {
        ...state.resume,
        metadata: {
          ...state.resume.metadata,
          columnSplit: split,
        },
      },
    }));
  },
}));
