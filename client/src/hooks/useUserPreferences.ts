import { useQuery } from "@tanstack/react-query";
import { UserPreference } from "@shared/schema";

export function useUserPreferences(userId: number) {
  return useQuery<UserPreference[]>({
    queryKey: ['api/user-preferences', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user-preferences/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user preferences: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000 // 1 minute
  });
}
