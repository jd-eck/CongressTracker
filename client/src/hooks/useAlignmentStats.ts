import { useQuery } from "@tanstack/react-query";
import { AlignmentStats } from "@shared/schema";

export function useAlignmentStats(userId: number, bioguideId: string) {
  return useQuery<AlignmentStats>({
    queryKey: ['api/alignment', userId, bioguideId],
    queryFn: async () => {
      const response = await fetch(`/api/alignment/${userId}/${bioguideId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alignment stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ensure all required properties exist
      return {
        overall: data.overall || 0,
        byIssue: data.byIssue || {},
        overTime: Array.isArray(data.overTime) ? data.overTime : [],
        distribution: {
          strongAgreement: data.distribution?.strongAgreement || 0,
          agreement: data.distribution?.agreement || 0,
          neutral: data.distribution?.neutral || 0,
          disagreement: data.distribution?.disagreement || 0,
          strongDisagreement: data.distribution?.strongDisagreement || 0
        }
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    
    // Only run this query if we have both userId and bioguideId
    enabled: !!userId && !!bioguideId
  });
}
