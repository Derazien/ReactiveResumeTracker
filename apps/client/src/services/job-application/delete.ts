import { useMutation, useQueryClient } from "@tanstack/react-query";

import { JOB_APPLICATION_KEY, JOB_APPLICATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const deleteJobApplication = async (id: string) => {
  await axios.delete(`/job-applications/${id}`);
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: deleteJobApplicationFn,
  } = useMutation({
    mutationFn: deleteJobApplication,
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: JOB_APPLICATIONS_KEY });
      queryClient.removeQueries({ queryKey: [...JOB_APPLICATION_KEY, id] });
    },
  });

  return { deleteJobApplication: deleteJobApplicationFn, loading, error };
}; 