import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { Company, COMPANIES_KEY } from "./list";
import { COMPANY_KEY } from "./get";

export interface ResearchResult {
  success: boolean;
  company: Company;
  researchData: {
    description?: string;
    industry?: string;
    size?: string;
    location?: string;
    values?: string[];
    mission?: string;
    culture?: string;
    website?: string;
    logo?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    githubUrl?: string;
  };
  metadata: {
    sources: string[];
    strategy: "basic" | "comprehensive" | "deep";
    confidence: "high" | "medium" | "low";
    timestamp: string;
    lastUpdated: string;
    researchId: string;
  };
}

export interface ResearchOptions {
  strategy?: "basic" | "comprehensive" | "deep";
}

const researchCompany = async (id: string, options: ResearchOptions = {}): Promise<ResearchResult> => {
  const response = await axios.post<ResearchResult>(
    `/company/${id}/research`, 
    { strategy: options.strategy || "comprehensive" }
  );
  return response.data;
};

export const useResearchCompany = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: researchCompanyFn,
  } = useMutation({
    mutationFn: ({ id, options }: { id: string; options?: ResearchOptions }) => 
      researchCompany(id, options),
    onSuccess: (result) => {
      // Invalidate and refetch company data to show updated information
      void queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      void queryClient.invalidateQueries({ 
        queryKey: [...COMPANY_KEY, result.company.id] 
      });
    },
  });

  return { 
    researchCompany: researchCompanyFn, 
    loading, 
    error 
  };
};
