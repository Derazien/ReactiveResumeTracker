import type { EditResumeDto } from "@reactive-resume/dto";
import type { ResumeData } from "@reactive-resume/schema";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";

export type EditResumeRequest = {
  prompt: string;
  resumeData: ResumeData;
  includeJobContext?: boolean;
  selectedSections?: string[];
};

export type EditResumeResponse = {
  success: boolean;
  data?: ResumeData;
  error?: string;
  usage?: Record<string, unknown>;
};

export const editResume = async (data: EditResumeRequest) => {
  const response = await axios.post<EditResumeResponse, AxiosResponse<EditResumeResponse>, EditResumeDto>(
    "/llm/edit-resume",
    data,
  );

  return response.data;
};

export const useEditResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: editResumeFn,
  } = useMutation({
    mutationFn: editResume,
    onError: (error) => {
      // Log error for debugging purposes
      // eslint-disable-next-line no-console
      console.error("Failed to edit resume:", error);
    },
  });

  return { editResume: editResumeFn, loading, error };
}; 