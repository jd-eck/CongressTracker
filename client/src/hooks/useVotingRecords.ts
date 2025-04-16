import { useInfiniteQuery } from "@tanstack/react-query";
import { VoteResponse } from "@shared/schema";

export function useVotingRecords(bioguideId: string, initialOffset = 0, limit = 10) {
  const result = useInfiniteQuery<VoteResponse[]>({
    queryKey: ['api/congress-members', bioguideId, 'votes'],
    queryFn: async ({ pageParam = initialOffset }) => {
      const res = await fetch(`/api/congress-members/${bioguideId}/votes?offset=${pageParam}&limit=${limit}`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch voting records: ${res.statusText}`);
      }
      
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer results than the limit, we're at the end
      if (lastPage.length < limit) {
        return undefined;
      }
      
      // Otherwise, return the next offset
      return initialOffset + (allPages.length * limit);
    },
    initialPageParam: initialOffset,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Flatten the pages array into a single array of votes
  const flattenedData = result.data ? result.data.pages.flat() : [];
  
  return {
    ...result,
    data: flattenedData
  };
}
