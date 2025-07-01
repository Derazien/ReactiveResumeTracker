import type { ContentLibraryDto } from "@reactive-resume/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export type GenerateResumeRequest = {
  selectedContentIds?: string[];
};

export type GenerateResumeResponse = {
  resume: {
    id: string;
    title: string;
    slug: string;
    data: string;
    visibility: string;
    locked: boolean;
    userId: string;
    jobApplicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  selectedContent: ContentLibraryDto[];
  suggestions: string[];
};

export const generateTailoredResume = async (
  jobApplicationId: string,
  data: GenerateResumeRequest,
): Promise<GenerateResumeResponse> => {
  const response = await axios.post<GenerateResumeResponse, AxiosResponse<GenerateResumeResponse>>(
    `/job-applications/${jobApplicationId}/generate-resume`,
    data,
  );

  return response.data;
};

export const useGenerateTailoredResume = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: generateResumeFn,
  } = useMutation({
    mutationFn: ({
      jobApplicationId,
      data,
    }: {
      jobApplicationId: string;
      data: GenerateResumeRequest;
    }) => generateTailoredResume(jobApplicationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
    },
  });

  return { generateTailoredResume: generateResumeFn, loading, error };
};
