import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function useUserPreferences(userId: number) {
  return useQuery({
    queryKey: ['api/user-preferences', userId],
    // The default fetcher will use GET /api/user-preferences/{userId}
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    
    // When we get new data, also invalidate the alignment stats
    onSuccess: () => {
      // Invalidate any alignment stats queries that depend on this user's preferences
      queryClient.invalidateQueries({ queryKey: ['api/alignment', userId] });
    }
  });
}
