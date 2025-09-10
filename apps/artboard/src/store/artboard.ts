import { defaultMetadata, type ResumeData } from "@reactive-resume/schema";
import { create } from "zustand";

export type CoverLetterData = {
  id: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderTitle?: string;
  senderWebsite?: string;
  senderLinkedIn?: string;
  senderPhoto?: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  applicationSubject?: string;  // "Application for Senior Solutions Engineer – Germany"
  content?: string;
  footer?: string;
  template?: string;
  tone?: string;
  createdAt?: string;
  updatedAt?: string;
  // Basics structure like resume (populated from contact content)
  basics?: {
    name: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
    url?: { href: string; label?: string };
    customFields?: {
      id: string;
      name: string;
      value: string;
      icon?: string;
    }[];
    // No picture needed for cover letters
  };
};

export type ArtboardStore = {
  resume: ResumeData;
  coverLetter: CoverLetterData | null;
  coverLetterMetadata: typeof defaultMetadata & {
    page?: {
      format: "a4" | "letter";
      margin: number;
    };
  };
  setResume: (resume: ResumeData) => void;
  setCoverLetter: (coverLetter: CoverLetterData) => void;
  setCoverLetterMetadata: (metadata: typeof defaultMetadata & { page?: { format: "a4" | "letter"; margin: number; } }) => void;
  setColumnSplit: (split: number) => void;
  setCoverLetterPageFormat: (format: "a4" | "letter") => void;
  setCoverLetterPageMargin: (margin: number) => void;
};

export const useArtboardStore = create<ArtboardStore>()((set) => ({
  resume: null as unknown as ResumeData,
  coverLetter: null,
  coverLetterMetadata: {
    ...defaultMetadata,
    page: {
      ...defaultMetadata.page,
      format: "a4" as const,
      margin: 18,
    },
    // Use exact resume builder defaults
    theme: {
      background: "#ffffff",
      text: "#000000", 
      primary: "#313c4e",   // Resume builder default
      secondary: "#449399", // Resume builder default
    },
    typography: {
      font: {
        family: "Ubuntu",
        subset: "latin",
        variants: ["regular"],
        size: 13,           // Resume builder default
      },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: true, // Resume builder default
    },
  },
  setResume: (resume) => {
    set({ resume });
  },
  setCoverLetter: (coverLetter) => {
    set({ coverLetter });
  },
  setCoverLetterMetadata: (metadata) => {
    set({ coverLetterMetadata: metadata });
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
  setCoverLetterPageFormat: (format) => {
    set((state) => ({
      ...state,
      coverLetterMetadata: {
        ...state.coverLetterMetadata,
        page: {
          ...state.coverLetterMetadata.page,
          format,
        },
      },
    }));
  },
  setCoverLetterPageMargin: (margin) => {
    set((state) => ({
      ...state,
      coverLetterMetadata: {
        ...state.coverLetterMetadata,
        page: {
          ...state.coverLetterMetadata.page,
          margin,
        },
      },
    }));
  },
}));
