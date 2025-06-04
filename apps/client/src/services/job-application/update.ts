import type { JobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATION_KEY, JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const updateJobApplication = async ({ id, data }: { id: string; data: UpdateJobApplicationDto }) => {
  const response = await axios.patch<JobApplicationDto, AxiosResponse<JobApplicationDto>>(`/job-applications/${id}`, data);

  return response.data;
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: updateJobApplicationFn,
  } = useMutation({
    mutationFn: updateJobApplication,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: [...JOB_APPLICATION_KEY, data.id] });
    },
  });

  return { updateJobApplication: updateJobApplicationFn, loading, error };
}; 