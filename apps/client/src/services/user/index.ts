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
    retry: false, // No automatic retry on auth failures
  });

  // Set user when data is successfully fetched
  if (data && !user) {
    setUser(data);
  }

  return { 
    user: user ?? data, 
    loading: loading && !user, 
    error
  };
};

export * from "./delete-user";
export * from "./update-user";
export * from "./user";
export * from "./llm-settings";
