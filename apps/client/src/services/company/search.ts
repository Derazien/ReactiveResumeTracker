import { useQuery } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { Company } from "./list";

const searchCompanies = async (query: string): Promise<Company[]> => {
  if (query.length < 3) {
    return [];
  }
  
  const response = await axios.get<Company[]>("/company/search", {
    params: { name: query }
  });
  
  return response.data;
};

export const useSearchCompanies = (query: string) => {
  return useQuery({
    queryKey: ["companies", "search", query],
    queryFn: () => searchCompanies(query),
    enabled: query.length >= 3, // Only search if 3+ characters as requested
    staleTime: 30000, // Cache results for 30 seconds
    initialData: [], // Ensure we always have an array
  });
};
