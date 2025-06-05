import { useQuery } from "@tanstack/react-query";
import type { ContentLibraryDto } from "@reactive-resume/dto";

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