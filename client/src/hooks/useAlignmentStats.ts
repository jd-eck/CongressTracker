import { useQuery } from "@tanstack/react-query";
import { AlignmentStats } from "@shared/schema";

export function useAlignmentStats(userId: number, bioguideId: string) {
  return useQuery<AlignmentStats>({
    queryKey: ['api/alignment', userId, bioguideId],
    // The default fetcher will use GET /api/alignment/{userId}/{bioguideId}
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    
    // Only run this query if we have both userId and bioguideId
    enabled: !!userId && !!bioguideId
  });
}
