import type { BulkDeleteResult, DeleteResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const deleteResume = async (data: DeleteResumeDto) => {
  const response = await axios.delete<ResumeDto, AxiosResponse<ResumeDto>, DeleteResumeDto>(
    `/resume/${data.id}`,
  );

  return response.data;
};

export const bulkDeleteResumes = async (data: { resumeIds: string[] }) => {
  const response = await axios.delete<BulkDeleteResult, AxiosResponse<BulkDeleteResult>>(
    `/resume`,
    { data },
  );

  return response.data;
};

export const deleteAllResumes = async (data: { confirmation: string }) => {
  const response = await axios.delete<BulkDeleteResult, AxiosResponse<BulkDeleteResult>>(
    `/resume/all/confirm`,
    { data },
  );

  return response.data;
};

export const useDeleteResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteResumeFn,
  } = useMutation({
    mutationFn: deleteResume,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["resume", data.id] });

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [];
        return cache.filter((resume) => resume.id !== data.id);
      });
    },
  });

  return { deleteResume: deleteResumeFn, loading, error };
};

export const useBulkDeleteResumes = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: bulkDeleteResumesFn,
  } = useMutation({
    mutationFn: bulkDeleteResumes,
    onSuccess: (data) => {
      // Remove individual resume queries
      for (const resume of data.deletedResumes) {
        queryClient.removeQueries({ queryKey: ["resume", resume.id] });
      }

      // Update resumes list
      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [];
        const deletedIds = new Set(data.deletedResumes.map((r) => r.id));
        return cache.filter((resume) => !deletedIds.has(resume.id));
      });
    },
  });

  return { bulkDeleteResumes: bulkDeleteResumesFn, loading, error };
};

export const useDeleteAllResumes = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteAllResumesFn,
  } = useMutation({
    mutationFn: deleteAllResumes,
    onSuccess: (data) => {
      // Remove all resume queries
      for (const resume of data.deletedResumes) {
        queryClient.removeQueries({ queryKey: ["resume", resume.id] });
      }

      // Clear resumes list
      queryClient.setQueryData<ResumeDto[]>(["resumes"], []);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  return { deleteAllResumes: deleteAllResumesFn, loading, error };
};
