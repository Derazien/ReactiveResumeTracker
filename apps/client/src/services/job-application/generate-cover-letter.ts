import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export type GenerateCoverLetterRequest = {
  selectedContentIds?: string[];
};

export type GenerateCoverLetterResponse = {
  coverLetter: string;
};

export const generateCoverLetter = async (
  jobApplicationId: string,
  data: GenerateCoverLetterRequest
): Promise<GenerateCoverLetterResponse> => {
  const response = await axios.post<GenerateCoverLetterResponse, AxiosResponse<GenerateCoverLetterResponse>>(
    `/job-applications/${jobApplicationId}/generate-cover-letter`,
    data
  );

  return response.data;
};

export const useGenerateCoverLetter = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: generateCoverLetterFn,
  } = useMutation({
    mutationFn: ({ jobApplicationId, data }: { jobApplicationId: string; data: GenerateCoverLetterRequest }) =>
      generateCoverLetter(jobApplicationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
    },
  });

  return { generateCoverLetter: generateCoverLetterFn, loading, error };
}; 