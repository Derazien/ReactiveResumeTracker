import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import type { CoverLetterDto } from "@/client/services/cover-letter";

type CoverLetterState = {
  coverLetter: CoverLetterDto | null;
};

type CoverLetterActions = {
  setCoverLetter: (coverLetter: CoverLetterDto | null) => void;
  updateCoverLetter: (data: Partial<CoverLetterDto>) => void;
};

export const useCoverLetterStore = createWithEqualityFn<CoverLetterState & CoverLetterActions>()(
  immer((set) => ({
    coverLetter: null,

    setCoverLetter: (coverLetter) => {
      set((state) => {
        state.coverLetter = coverLetter;
      });
    },

    updateCoverLetter: (data) => {
      set((state) => {
        if (state.coverLetter) {
          Object.assign(state.coverLetter, data);
        }
      });
    },
  })),
  shallow,
);

