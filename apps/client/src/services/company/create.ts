import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { Company, COMPANIES_KEY } from "./list";

export interface CreateCompanyData {
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
}

const createCompany = async (data: CreateCompanyData): Promise<Company> => {
  const response = await axios.post<Company>("/company", data);
  return response.data;
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createCompanyFn,
  } = useMutation({
    mutationFn: createCompany,
    onSuccess: (newCompany) => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
    },
  });

  return { createCompany: createCompanyFn, loading, error };
};
