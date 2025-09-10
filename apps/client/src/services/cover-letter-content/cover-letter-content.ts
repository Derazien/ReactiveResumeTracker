import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";

export type CoverLetterContentType =
  | "PARAGRAPH_ANALYTICS"
  | "PARAGRAPH_DIVERSITY"
  | "PARAGRAPH_LEADERSHIP"
  | "PARAGRAPH_TECH"
  | "PARAGRAPH_CHALLENGE"
  | "PARAGRAPH_COLLABORATION"
  | "PARAGRAPH_INNOVATION"
  | "PARAGRAPH_IMPACT"
  | "PARAGRAPH_GROWTH"
  | "PARAGRAPH_VALUES";

export interface CoverLetterContent {
  id: string;
  contentType: CoverLetterContentType;
  contentId: string;
  storyText: string;
  skillTheme: string;
  tone: string;
  tags: string; // JSON array as string
  userId: string;
  createdAt: string;
  updatedAt: string;
  content?: any; // Related content from Content table
}

export interface CreateCoverLetterContentDto {
  contentType: CoverLetterContentType;
  contentId: string;
  storyText: string;
  skillTheme: string;
  tone?: string;
  tags?: string;
}

export interface UpdateCoverLetterContentDto {
  contentType?: CoverLetterContentType;
  contentId?: string;
  storyText?: string;
  skillTheme?: string;
  tone?: string;
  tags?: string;
}

const COVER_LETTER_CONTENT_KEY = "cover-letter-content";

export const useCoverLetterContent = () => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY],
    queryFn: async (): Promise<CoverLetterContent[]> => {
      const response = await axios.get("/cover-letter-content");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCoverLetterContentById = (id: string) => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY, id],
    queryFn: async (): Promise<CoverLetterContent> => {
      const response = await axios.get(`/cover-letter-content/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCoverLetterContentByType = (contentType: CoverLetterContentType) => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY, "type", contentType],
    queryFn: async (): Promise<CoverLetterContent[]> => {
      const response = await axios.get(`/cover-letter-content/by-type/${contentType}`);
      return response.data;
    },
    enabled: !!contentType,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCoverLetterContentByContentId = (contentId: string) => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY, "content", contentId],
    queryFn: async (): Promise<CoverLetterContent[]> => {
      const response = await axios.get(`/cover-letter-content/by-content/${contentId}`);
      return response.data;
    },
    enabled: !!contentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchCoverLetterContent = (query: string, limit = 10) => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY, "search", query, limit],
    queryFn: async (): Promise<CoverLetterContent[]> => {
      const response = await axios.get("/cover-letter-content/search", {
        params: { q: query, limit },
      });
      return response.data;
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
};

export const useSelectCoverLetterContentForJob = (jobDescription: string, maxStories = 3) => {
  return useQuery({
    queryKey: [COVER_LETTER_CONTENT_KEY, "select-for-job", jobDescription, maxStories],
    queryFn: async (): Promise<CoverLetterContent[]> => {
      const response = await axios.get("/cover-letter-content/select-for-job", {
        params: { description: jobDescription, maxStories },
      });
      return response.data;
    },
    enabled: !!jobDescription,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCoverLetterContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCoverLetterContentDto): Promise<CoverLetterContent> => {
      const response = await axios.post("/cover-letter-content", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cover letter content queries
      void queryClient.invalidateQueries({ queryKey: [COVER_LETTER_CONTENT_KEY] });
    },
  });
};

export const useUpdateCoverLetterContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCoverLetterContentDto;
    }): Promise<CoverLetterContent> => {
      const response = await axios.put(`/cover-letter-content/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cover letter content queries
      void queryClient.invalidateQueries({ queryKey: [COVER_LETTER_CONTENT_KEY] });
    },
  });
};

export const useDeleteCoverLetterContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`/cover-letter-content/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch cover letter content queries
      void queryClient.invalidateQueries({ queryKey: [COVER_LETTER_CONTENT_KEY] });
    },
  });
};

export const useExtractStoryFromInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      response: string;
      contentType: CoverLetterContentType;
      contentId: string;
      skillTheme?: string;
    }): Promise<CoverLetterContent> => {
      const response = await axios.post("/cover-letter-content/extract-from-interview", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cover letter content queries
      void queryClient.invalidateQueries({ queryKey: [COVER_LETTER_CONTENT_KEY] });
    },
  });
};