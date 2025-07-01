import type { JobApplicationDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATION_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

const parseJsonArray = (value: string | string[]): string[] => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
};

export const fetchJobApplication = async (id: string) => {
  const response = await axios.get<JobApplicationDto, AxiosResponse<JobApplicationDto>>(
    `/job-applications/${id}`,
  );

  // Parse string fields that should be arrays
  const data = response.data;
  data.requirements = parseJsonArray(data.requirements);
  data.extractedTags = parseJsonArray(data.extractedTags);

  return data;
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
