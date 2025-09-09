import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { Company, COMPANIES_KEY } from "./list";
import { COMPANY_KEY } from "./get";

export interface UpdateCompanyData {
  name?: string;
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

const updateCompany = async (id: string, data: UpdateCompanyData): Promise<Company> => {
  const response = await axios.put<Company>(`/company/${id}`, data);
  return response.data;
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: updateCompanyFn,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) => 
      updateCompany(id, data),
    onSuccess: (updatedCompany) => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      void queryClient.invalidateQueries({ 
        queryKey: [...COMPANY_KEY, updatedCompany.id] 
      });
    },
  });

  return { updateCompany: updateCompanyFn, loading, error };
};
