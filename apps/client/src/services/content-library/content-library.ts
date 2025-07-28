import type { ContentLibraryDto } from "@reactive-resume/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CONTENT_LIBRARY_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const useContentLibrary = () => {
  return useQuery({
    queryKey: [CONTENT_LIBRARY_KEY],
    queryFn: async (): Promise<ContentLibraryDto[]> => {
      const response = await axios.get("/content-library");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAvailableSections = () => {
  return useQuery({
    queryKey: [CONTENT_LIBRARY_KEY, "sections"],
    queryFn: async () => {
      const response = await axios.get("/content-library/sections");
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - sections don't change often
  });
};

export const useContentBySection = (sectionId?: string) => {
  return useQuery({
    queryKey: [CONTENT_LIBRARY_KEY, "section", sectionId],
    queryFn: async (): Promise<ContentLibraryDto[]> => {
      if (!sectionId) return [];
      const response = await axios.get(`/content-library/section/${sectionId}`);
      return response.data;
    },
    enabled: !!sectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAvailableTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await axios.get("/tags");
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - tags don't change often
  });
};

export const useCreateContentLibraryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      data: string;
      sectionId: string;
      tagIds: string[];
    }) => {
      const response = await axios.post("/content-library", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch content library queries
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY, "section"] });
    },
  });
};

export const useUpdateContentLibraryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        title: string;
        description?: string;
        data: string;
        tagIds: string[];
      };
    }) => {
      const response = await axios.patch(`/content-library/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch content library queries
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY, "section"] });
    },
  });
};

export const useDeleteContentLibraryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/content-library/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch content library queries
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CONTENT_LIBRARY_KEY, "section"] });
    },
  });
};
