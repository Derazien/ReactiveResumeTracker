import type { JobApplicationDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
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

export const fetchJobApplications = async () => {
  const response = await axios.get<JobApplicationDto[], AxiosResponse<JobApplicationDto[]>>(
    "/job-applications",
  );

  // Parse string fields that should be arrays for each job application
  const data = response.data.map((jobApplication) => {
    const parsedApplication = jobApplication;
    parsedApplication.requirements = parseJsonArray(jobApplication.requirements);
    parsedApplication.extractedTags = parseJsonArray(jobApplication.extractedTags);
    return parsedApplication;
  });

  return data;
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
