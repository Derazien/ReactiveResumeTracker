import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "../../libs/axios";
import { COMPANIES_KEY } from "./list";
import { COMPANY_KEY } from "./get";

export const deleteCompany = async (id: string) => {
  await axios.delete(`/company/${id}`);
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: deleteCompanyFn,
  } = useMutation({
    mutationFn: deleteCompany,
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.removeQueries({ queryKey: [...COMPANY_KEY, id] });
    },
  });

  return { deleteCompany: deleteCompanyFn, loading, error };
}; 