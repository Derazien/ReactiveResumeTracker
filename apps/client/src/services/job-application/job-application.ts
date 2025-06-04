import type { JobApplicationDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATION_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchJobApplication = async (id: string) => {
  const response = await axios.get<JobApplicationDto, AxiosResponse<JobApplicationDto>>(`/job-applications/${id}`);

  return response.data;
};

export const useJobApplication = (id: string) => {
  const {
    error,
    isPending: loading,
    data: jobApplication,
  } = useQuery({
    queryKey: [...JOB_APPLICATION_KEY, id],
    queryFn: () => fetchJobApplication(id),
    enabled: !!id,
  });

  return { jobApplication, loading, error };
}; 