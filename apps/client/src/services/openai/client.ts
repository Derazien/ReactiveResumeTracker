import { t } from "@lingui/macro";
import { OpenAI } from "openai";

import { useLLMStore } from "@/client/stores/llm";

export const openai = () => {
  const settings = useLLMStore.getState().getCurrentProviderSettings();

  if (!settings || settings.apiKey === null) {
    throw new Error(
      t`Your AI API Key has not been set yet. Please go to your account settings to configure AI Integration.`,
    );
  }

  if (settings.baseUrl) {
    return new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  return new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true,
  });
};
