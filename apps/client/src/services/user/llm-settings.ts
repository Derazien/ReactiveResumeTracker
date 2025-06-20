import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";

type LLMProvider = "OPENAI" | "ANTHROPIC" | "OLLAMA";

export type UserLLMSettings = {
  id?: string;
  provider: LLMProvider;
  
  // OpenAI Settings
  openaiApiKey: string | null;
  openaiModel: string;
  openaiBaseUrl: string | null;
  
  // Anthropic Settings
  anthropicApiKey: string | null;
  anthropicModel: string;
  
  // Ollama Settings
  ollamaApiKey: string | null;
  ollamaBaseUrl: string | null;
  ollamaModel: string;
  
  // Common Settings
  maxTokens: number;
  temperature: number;
  
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateLLMSettingsData = Partial<Omit<UserLLMSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

const KEYS = {
  llmSettings: ["user", "llm-settings"] as const,
};

export const fetchLLMSettings = async (): Promise<UserLLMSettings> => {
  const response = await axios.get<UserLLMSettings>("/user/llm-settings");
  return response.data;
};

export const updateLLMSettings = async (data: UpdateLLMSettingsData): Promise<UserLLMSettings> => {
  const response = await axios.patch<UserLLMSettings>("/user/llm-settings", data);
  return response.data;
};

export const deleteLLMSettings = async (): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>("/user/llm-settings");
  return response.data;
};

export const useLLMSettings = () => {
  return useQuery({
    queryKey: KEYS.llmSettings,
    queryFn: fetchLLMSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateLLMSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLLMSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(KEYS.llmSettings, data);
    },
  });
};

export const useDeleteLLMSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLLMSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.llmSettings });
    },
  });
}; 