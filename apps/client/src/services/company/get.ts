import { useQuery } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { Company } from "./list";

export const COMPANY_KEY = ["company"] as const;

const fetchCompany = async (id: string): Promise<Company> => {
  const response = await axios.get<Company>(`/company/${id}`);
  return response.data;
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: [...COMPANY_KEY, id],
    queryFn: () => fetchCompany(id),
    enabled: !!id,
  });
};
