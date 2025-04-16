import { useState } from "react";
import { useVotingRecords } from "@/hooks/useVotingRecords";
import { CongressMemberResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import VoteItem from "./VoteItem";
import { Card, CardContent } from "@/components/ui/card";

interface VotingRecordsProps {
  member: CongressMemberResponse;
}

export default function VotingRecords({ member }: VotingRecordsProps) {
  const [offset, setOffset] = useState(0);
  const limit = 5;
  
  const { 
    data: votes, 
    isLoading, 
    error, 
    isFetchingNextPage, 
    fetchNextPage, 
    hasNextPage 
  } = useVotingRecords(member.bioguideId, offset, limit);
  
  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
    fetchNextPage();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Votes</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center">
            <span className="material-icons text-sm mr-1">filter_list</span>Filter
          </Button>
          <Button variant="outline" size="sm" className="px-3 py-1 bg-neutral-100 text-neutral-400 text-sm rounded-full flex items-center">
            <span className="material-icons text-sm mr-1">sort</span>Sort
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : error ? (
        <div className="text-center p-6 text-red-500">
          <span className="material-icons text-5xl mb-2">error_outline</span>
          <p>Failed to load voting records.</p>
        </div>
      ) : votes && votes.length > 0 ? (
        <>
          {votes.map((vote, index) => (
            <VoteItem key={vote.id || index} vote={vote} />
          ))}
          
          <div className="text-center mt-6">
            <Button 
              onClick={handleLoadMore} 
              disabled={!hasNextPage || isFetchingNextPage}
              className="px-6 py-2 bg-primary text-white rounded-lg flex items-center mx-auto"
            >
              {isFetchingNextPage ? (
                <>
                  <span className="material-icons animate-spin mr-1">refresh</span>
                  Loading...
                </>
              ) : hasNextPage ? (
                <>
                  <span className="material-icons mr-1">refresh</span>
                  Load More Votes
                </>
              ) : (
                'No more votes to load'
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center p-6 text-neutral-500">
          <span className="material-icons text-5xl mb-2">ballot</span>
          <p>No voting records available for this member.</p>
        </div>
      )}
    </div>
  );
}
