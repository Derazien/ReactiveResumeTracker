import type { JobApplicationDto } from "@reactive-resume/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export type AnalyzeJobRequest = {
  jobText: string;
  url?: string;
};

export type JobAnalysisResult = {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  skills: string[];
  extractedTags: string[];
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
};

export type AnalyzeJobResponse = {
  analysisResult: JobAnalysisResult;
};

export type CreateFromAnalysisRequest = {
  analysisData: JobAnalysisResult;
  url?: string;
};

export const analyzeJobPosting = async (data: AnalyzeJobRequest): Promise<AnalyzeJobResponse> => {
  const response = await axios.post<AnalyzeJobResponse, AxiosResponse<AnalyzeJobResponse>>("/job-applications/analyze", data);
  return response.data;
};

export const createJobApplicationFromAnalysis = async (data: CreateFromAnalysisRequest): Promise<JobApplicationDto> => {
  const response = await axios.post<JobApplicationDto, AxiosResponse<JobApplicationDto>>("/job-applications/create-from-analysis", data);
  return response.data;
};

export const useAnalyzeJobPosting = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: analyzeJobPostingFn,
  } = useMutation({
    mutationFn: analyzeJobPosting,
  });

  return { analyzeJobPosting: analyzeJobPostingFn, loading, error };
};

export const useCreateFromAnalysis = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createFromAnalysisFn,
  } = useMutation({
    mutationFn: createJobApplicationFromAnalysis,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
    },
  });

  return { createFromAnalysis: createFromAnalysisFn, loading, error };
}; 