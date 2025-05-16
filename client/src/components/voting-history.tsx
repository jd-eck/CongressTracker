import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import VoteCard from "@/components/vote-card";

interface VotingHistoryProps {
  memberId: string;
  category: string;
  timeframe: string;
  onCategoryChange: (category: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

export default function VotingHistory({
  memberId,
  category,
  timeframe,
  onCategoryChange,
  onTimeframeChange,
}: VotingHistoryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  
  // Get all vote categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch member votes with filters
  const { data: votes, isLoading } = useQuery<any[]>({
    queryKey: [`/api/votes/${memberId}`, category, timeframe],
    enabled: !!memberId,
  });

  // Get displayed votes for current page
  const displayedVotes = votes ? votes.slice(0, page * pageSize) : [];
  const hasMore = votes ? votes.length > page * pageSize : false;

  const loadMore = () => {
    setPage(page + 1);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-400">Recent Votes</h3>
          <div className="flex space-x-2">
            {/* Disabled selects during loading */}
            <Select disabled value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
            </Select>
            <Select disabled value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-center">
            <div className="flex flex-col items-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-muted-foreground">Loading voting history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!votes || votes.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-400">Recent Votes</h3>
          <div className="flex space-x-2">
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No votes found for the selected filters.</p>
            <p className="text-sm text-muted-foreground mt-1">Try changing your filter options.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-neutral-400">Recent Votes</h3>
        <div className="flex space-x-2">
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_categories">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {displayedVotes.map((vote) => (
        <VoteCard
          key={vote.id}
          id={vote.id}
          billId={vote.billId}
          billTitle={vote.billTitle}
          billDescription={vote.billDescription}
          category={vote.category}
          voteDate={vote.voteDate}
          position={vote.position}
          memberId={memberId}
          userPreference={vote.userPreference}
        />
      ))}
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={loadMore}>
            Load More Votes
          </Button>
        </div>
      )}
    </div>
  );
}
