import { useMutation } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";

export type ExtractedContent = {
  id?: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  type: string;
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  skills: string[];
  achievements: string[];
  tags: string[];
  confidence: number;
  isDuplicate?: boolean;
  similarity?: number;
  similarTo?: string;
  reason?: string;
  selected?: boolean;
};

export type CVExtractionResponse = {
  success: boolean;
  data: ExtractedContent[];
  error?: string;
};

export type SaveContentResponse = {
  success: boolean;
  data: {
    saved: number;
    skipped: number;
    total: number;
    items: any[];
  };
  error?: string;
};

export const extractCVContent = async (file: File): Promise<CVExtractionResponse> => {
  const formData = new FormData();
  formData.append("cv", file);

  const response = await axios.post<CVExtractionResponse>("/content-library/extract-cv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const saveExtractedContent = async (
  content: ExtractedContent[],
): Promise<SaveContentResponse> => {
  const response = await axios.post<SaveContentResponse>("/content-library/save-extracted", {
    content,
    createTags: true,
  });

  return response.data;
};

export const useExtractCVContent = () => {
  return useMutation({
    mutationFn: extractCVContent,
  });
};

export const useSaveExtractedContent = () => {
  return useMutation({
    mutationFn: saveExtractedContent,
  });
};
