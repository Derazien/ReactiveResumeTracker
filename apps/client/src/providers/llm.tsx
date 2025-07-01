import { type ReactNode, useEffect } from "react";

import { useUser } from "@/client/services/user";
import { useLLMStore } from "@/client/stores/llm";

type LLMProviderProps = {
  children: ReactNode;
};

export const LLMProvider = ({ children }: LLMProviderProps) => {
  const { user } = useUser();
  const syncWithBackend = useLLMStore((state) => state.syncWithBackend);

  useEffect(() => {
    // Sync LLM settings from backend when user is authenticated
    if (user) {
      syncWithBackend().catch(() => {
        // Silently fail if sync is not available
      });
    }
  }, [user, syncWithBackend]);

  return <>{children}</>;
};
