import type { JobApplicationDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchJobApplications = async () => {
  const response = await axios.get<JobApplicationDto[], AxiosResponse<JobApplicationDto[]>>("/job-applications");

  return response.data;
};

export const useJobApplications = () => {
  const {
    error,
    isPending: loading,
    data: jobApplications,
  } = useQuery({
    queryKey: JOB_APPLICATIONS_KEY,
    queryFn: fetchJobApplications,
  });

  return { jobApplications, loading, error };
}; 