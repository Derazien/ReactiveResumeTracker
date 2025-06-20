import type { UserDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { USER_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";
import { useAuthStore } from "@/client/stores/auth";

export const fetchUser = async (): Promise<UserDto> => {
  const response = await axios.get<UserDto, AxiosResponse<UserDto>>("/user/me");

  return response.data;
};

export const useUser = () => {
  const { user, setUser } = useAuthStore();

  const {
    error,
    isLoading: loading,
    data,
  } = useQuery({
    queryKey: [USER_KEY],
    queryFn: fetchUser,
    enabled: !user, // Only fetch if user is not already set
    retry: (failureCount, error: unknown) => {
      // In development mode, try to auto-authenticate
      if (import.meta.env.DEV && failureCount === 0) {
        return true;
      }
      return false;
    },
  });

  // Auto-set user in development mode when data is fetched
  if (import.meta.env.DEV && data && !user) {
    setUser(data);
  }

  return { 
    user: user ?? data, 
    loading: loading && !user, 
    error: import.meta.env.DEV ? null : error // Suppress errors in dev mode
  };
};

export * from "./delete-user";
export * from "./update-user";
export * from "./user";
