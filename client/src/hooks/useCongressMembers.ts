import { useQuery } from "@tanstack/react-query";
import { CongressMemberResponse } from "@shared/schema";
import { CongressMemberFilters } from "@/lib/types";

export function useCongressMembers(filters?: CongressMemberFilters) {
  return useQuery<CongressMemberResponse[]>({
    queryKey: ['api/congress-members', filters],
    
    // No need to define a custom query function as we're using the default fetcher setup
    
    // Additional options
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
