import { useQuery } from "@tanstack/react-query";
import { axios } from "../../libs/axios";

export type Company = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  values?: string; // JSON array as string
  mission?: string;
  culture?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
    jobApplications: number;
  };
};

export const COMPANIES_KEY = ["companies"] as const;

const fetchCompanies = async (): Promise<Company[]> => {
  const response = await axios.get<Company[]>("/company");
  return response.data;
};

export const useCompanies = () => {
  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: fetchCompanies,
  });
};
