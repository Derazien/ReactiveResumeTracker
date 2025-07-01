import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchLLMSettings } from "@/client/services/user";

type LLMProvider = "OPENAI" | "ANTHROPIC" | "OLLAMA";

type LLMSettings = {
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
};

type LLMStore = LLMSettings & {
  // Actions
  setProvider: (provider: LLMProvider) => void;
  setOpenAISettings: (
    settings: Partial<Pick<LLMSettings, "openaiApiKey" | "openaiModel" | "openaiBaseUrl">>,
  ) => void;
  setAnthropicSettings: (
    settings: Partial<Pick<LLMSettings, "anthropicApiKey" | "anthropicModel">>,
  ) => void;
  setOllamaSettings: (
    settings: Partial<Pick<LLMSettings, "ollamaApiKey" | "ollamaBaseUrl" | "ollamaModel">>,
  ) => void;
  setCommonSettings: (settings: Partial<Pick<LLMSettings, "maxTokens" | "temperature">>) => void;
  updateFromBackend: (settings: Partial<LLMSettings>) => void;
  reset: () => void;
  syncWithBackend: () => Promise<void>;

  // Computed
  isConfigured: () => boolean;
  getCurrentProviderSettings: () => {
    apiKey: string | null;
    model: string;
    baseUrl?: string | null;
    maxTokens: number;
    temperature: number;
  } | null;
};

const defaultSettings: LLMSettings = {
  provider: "OPENAI",

  // OpenAI Defaults
  openaiApiKey: null,
  openaiModel: "gpt-4-turbo-preview",
  openaiBaseUrl: null,

  // Anthropic Defaults
  anthropicApiKey: null,
  anthropicModel: "claude-3-5-sonnet-20241022",

  // Ollama Defaults
  ollamaApiKey: "sk-1234567890abcdef",
  ollamaBaseUrl: "http://localhost:11434/v1",
  ollamaModel: "llama3:8b",

  // Common Defaults
  maxTokens: 4000,
  temperature: 0.1,
};

export const useLLMStore = create<LLMStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setProvider: (provider: LLMProvider) => {
        set({ provider });
      },

      setOpenAISettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      setAnthropicSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      setOllamaSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      setCommonSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      updateFromBackend: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      reset: () => {
        set(defaultSettings);
      },

      syncWithBackend: async () => {
        try {
          const backendSettings = await fetchLLMSettings();
          set((state) => ({
            ...state,
            provider: backendSettings.provider,
            openaiApiKey: backendSettings.openaiApiKey,
            openaiModel: backendSettings.openaiModel,
            openaiBaseUrl: backendSettings.openaiBaseUrl,
            anthropicApiKey: backendSettings.anthropicApiKey,
            anthropicModel: backendSettings.anthropicModel,
            ollamaApiKey: backendSettings.ollamaApiKey,
            ollamaBaseUrl: backendSettings.ollamaBaseUrl,
            ollamaModel: backendSettings.ollamaModel,
            maxTokens: backendSettings.maxTokens,
            temperature: backendSettings.temperature,
          }));
        } catch {
          // Silently fail if backend settings are not available
        }
      },

      isConfigured: () => {
        const state = get();
        switch (state.provider) {
          case "OPENAI": {
            return !!state.openaiApiKey;
          }
          case "ANTHROPIC": {
            return !!state.anthropicApiKey;
          }
          case "OLLAMA": {
            return !!state.ollamaBaseUrl; // Ollama may not need API key
          }
          default: {
            return false;
          }
        }
      },

      getCurrentProviderSettings: () => {
        const state = get();
        switch (state.provider) {
          case "OPENAI": {
            return {
              apiKey: state.openaiApiKey,
              model: state.openaiModel,
              baseUrl: state.openaiBaseUrl,
              maxTokens: state.maxTokens,
              temperature: state.temperature,
            };
          }
          case "ANTHROPIC": {
            return {
              apiKey: state.anthropicApiKey,
              model: state.anthropicModel,
              maxTokens: state.maxTokens,
              temperature: state.temperature,
            };
          }
          case "OLLAMA": {
            return {
              apiKey: state.ollamaApiKey,
              baseUrl: state.ollamaBaseUrl,
              model: state.ollamaModel,
              maxTokens: state.maxTokens,
              temperature: state.temperature,
            };
          }
          default: {
            return null;
          }
        }
      },
    }),
    { name: "llm-settings" },
  ),
);
