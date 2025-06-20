import type { CreateJobApplicationDto, JobApplicationDto } from "@reactive-resume/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const createJobApplication = async (data: CreateJobApplicationDto) => {
  const response = await axios.post<JobApplicationDto, AxiosResponse<JobApplicationDto>>("/job-applications", data);

  return response.data;
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createJobApplicationFn,
  } = useMutation({
    mutationFn: createJobApplication,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
    },
  });

  return { createJobApplication: createJobApplicationFn, loading, error };
}; 