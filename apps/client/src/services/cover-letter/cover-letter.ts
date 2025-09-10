import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";

export const COVER_LETTERS_KEY = ["cover-letters"];

// Enhanced frontend type definition (like resume data structure)
export interface CoverLetterDto {
  id: string;
  content: string;
  templateName?: string;
  tone: string;
  generatedFrom: string; // JSON array of content IDs
  jobApplicationId: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  
  // Relations (database)
  jobApplication?: {
    id: string;
    title: string;
    companyName?: string;
    company?: {
      id: string;
      name: string;
    };
  };

  // User information (preloaded for UI)
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderTitle?: string;
  
  // Company information (preloaded for UI)
  companyName?: string;
  companyAddress?: string;
  recipientName?: string;
  recipientTitle?: string;
  
  // Story tracking (for interactive selection)
  selectedStoryIds?: string[];
  availableStoryIds?: string[];
  
  // Company data (for sidebar display)
  companyData?: {
    id: string;
    name: string;
    industry?: string;
    size?: string;
    location?: string;
    values: string[];
    mission?: string;
    culture?: string;
    website?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    githubUrl?: string;
  } | null;
  
  // Job application data (for context)  
  jobApplicationData?: {
    id: string;
    title: string;
    companyName?: string;
    description?: string;
    requirements: string[];
    extractedTags: string[];
  };
  
  // Note: content field now contains clean body content (editable)
  
  // Basics structure (like resume) populated from contact content
  basics?: {
    name: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
    url?: { href: string; label?: string };
    customFields?: Array<{
      id: string;
      name: string;
      value: string;
      icon?: string;
    }>;
    // No picture needed for cover letters
  };
  
  headerData?: {              // Header information (editable separately)
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    senderAddress?: string;
    senderLinkedIn?: string;
    senderTitle?: string;
  };
  footerData?: {              // Footer information
    closing: string;          // "Sincerely," etc.
    senderName: string;
  };
  
  // Legacy field
  usedContent?: any[];
}

export type GenerateCoverLetterRequest = {
  jobApplicationId: string;
  templateName?: string;
  tone?: string;
  maxParagraphs?: number;
  selectedStoryIds?: string[];
};

export type GenerateCoverLetterResponse = {
  coverLetter: CoverLetterDto;
  usedContent: any[];
  companyThemes: string[];
  selectedParagraphs: any[];
  template: string;
  tone: string;
  metadata: {
    companyValueAlignment: number;
    contentDiversity: number;
    overallFitScore: number;
  };
};

export type CreateCoverLetterRequest = {
  content: string;
  templateName?: string;
  tone?: string;
  jobApplicationId: string;
  generatedFrom?: string;
};

export type UpdateCoverLetterRequest = {
  content?: string;
  templateName?: string;
  tone?: string;
};

// API Functions
export const findCoverLetterById = async ({ id }: { id: string }): Promise<CoverLetterDto> => {
  const response = await axios.get<CoverLetterDto>(`/cover-letters/${id}`);
  return response.data;
};

export const findCoverLetters = async (): Promise<CoverLetterDto[]> => {
  const response = await axios.get<CoverLetterDto[]>(`/cover-letters`);
  return response.data;
};

export const createCoverLetter = async (data: CreateCoverLetterRequest): Promise<CoverLetterDto> => {
  const response = await axios.post<CoverLetterDto>(`/cover-letters`, data);
  return response.data;
};

export const createEmptyCoverLetter = async (data: { jobApplicationId: string }): Promise<CoverLetterDto> => {
  const response = await axios.post<CoverLetterDto>(`/cover-letters/empty`, data);
  return response.data;
};

export const generateCoverLetter = async (data: GenerateCoverLetterRequest): Promise<GenerateCoverLetterResponse> => {
  const response = await axios.post<GenerateCoverLetterResponse>(`/cover-letters/generate`, data);
  return response.data;
};

export const updateCoverLetter = async ({ 
  id, 
  data 
}: { 
  id: string; 
  data: UpdateCoverLetterRequest; 
}): Promise<CoverLetterDto> => {
  const response = await axios.put<CoverLetterDto>(`/cover-letters/${id}`, data);
  return response.data;
};

export const deleteCoverLetter = async ({ id }: { id: string }): Promise<void> => {
  await axios.delete(`/cover-letters/${id}`);
};

// Hooks
export const useCoverLetter = (id: string) => {
  return useQuery({
    queryKey: [...COVER_LETTERS_KEY, { id }],
    queryFn: () => findCoverLetterById({ id }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCoverLetters = () => {
  return useQuery({
    queryKey: COVER_LETTERS_KEY,
    queryFn: findCoverLetters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createCoverLetterFn,
  } = useMutation({
    mutationFn: createCoverLetter,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      // Set the individual cover letter in cache
      queryClient.setQueryData([...COVER_LETTERS_KEY, { id: data.id }], data);
    },
  });

  return { createCoverLetter: createCoverLetterFn, loading, error };
};

export const useCreateEmptyCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createEmptyCoverLetterFn,
  } = useMutation({
    mutationFn: createEmptyCoverLetter,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      // Set the individual cover letter in cache
      queryClient.setQueryData([...COVER_LETTERS_KEY, { id: data.id }], data);
    },
  });

  return { createEmptyCoverLetter: createEmptyCoverLetterFn, loading, error };
};

export const useGenerateCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: generateCoverLetterFn,
  } = useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      // Set the individual cover letter in cache
      queryClient.setQueryData([...COVER_LETTERS_KEY, { id: data.coverLetter.id }], data.coverLetter);
    },
  });

  return { generateCoverLetter: generateCoverLetterFn, loading, error };
};

export const useUpdateCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: updateCoverLetterFn,
  } = useMutation({
    mutationFn: updateCoverLetter,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      // Update the individual cover letter in cache
      queryClient.setQueryData([...COVER_LETTERS_KEY, { id: data.id }], data);
    },
  });

  return { updateCoverLetter: updateCoverLetterFn, loading, error };
};

export const useDeleteCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: deleteCoverLetterFn,
  } = useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      // Remove the individual cover letter from cache
      queryClient.removeQueries({ queryKey: [...COVER_LETTERS_KEY, { id: variables.id }] });
    },
  });

  return { deleteCoverLetter: deleteCoverLetterFn, loading, error };
};
