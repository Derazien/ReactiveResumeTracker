import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { axios } from '@/client/libs/axios';

export interface ContentSelectionItem {
  contentId: string;
  sectionKey: string;
  title: string;
  matchScore: number;
  isSelected: boolean;
  isCurrentJob?: boolean;
  matchReasons: string[];
  matchSuggestions: string[];
  relationshipStatus: 'direct' | 'modified' | 'manual' | 'none';
}

export interface GetMatchedContentResponse {
  success: boolean;
  data?: ContentSelectionItem[];
  error?: string;
}

export interface UpdateContentSelectionRequest {
  selectedContent: ContentSelectionItem[];
}

export interface UpdateContentSelectionResponse {
  success: boolean;
  error?: string;
}

export const getMatchedContent = async (jobApplicationId: string): Promise<GetMatchedContentResponse> => {
  const response = await axios.get<GetMatchedContentResponse>(
    `/job-applications/${jobApplicationId}/content-selection`,
  );
  return response.data;
};

export const updateContentSelection = async (
  jobApplicationId: string,
  selectedContent: ContentSelectionItem[],
): Promise<UpdateContentSelectionResponse> => {
  const response = await axios.post<UpdateContentSelectionResponse>(
    `/job-applications/${jobApplicationId}/content-selection`,
    { selectedContent },
  );
  return response.data;
};

export const useGetMatchedContent = (jobApplicationId: string) => {
  return useQuery({
    queryKey: ['content-selection', jobApplicationId],
    queryFn: () => getMatchedContent(jobApplicationId),
    enabled: !!jobApplicationId,
  });
};

export const useUpdateContentSelection = () => {
  return useMutation({
    mutationFn: ({ jobApplicationId, selectedContent }: { jobApplicationId: string; selectedContent: ContentSelectionItem[] }) =>
      updateContentSelection(jobApplicationId, selectedContent),
  });
}; 