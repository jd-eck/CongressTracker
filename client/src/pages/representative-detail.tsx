import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import RepresentativeProfile from "@/components/representative-profile";
import AlignmentChart from "@/components/alignment-chart";
import VotingHistory from "@/components/voting-history";
import { Representative, AlignmentScore } from "@shared/schema";

export default function RepresentativeDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ memberId: string }>("/representative/:memberId");
  const memberId = match ? params.memberId : "";
  
  const [category, setCategory] = useState("All Categories");
  const [timeframe, setTimeframe] = useState("All Time");

  // Fetch representative data
  const { data: representative, isLoading: isLoadingRep } = useQuery<Representative>({
    queryKey: [`/api/representatives/${memberId}`],
    enabled: !!memberId,
  });

  // Fetch alignment score
  const { data: alignmentScore, isLoading: isLoadingScore } = useQuery<AlignmentScore>({
    queryKey: [`/api/alignment/${memberId}`],
    enabled: !!memberId,
  });

  if (!match) {
    return (
      <div className="flex justify-center items-center h-full">
        <Button onClick={() => setLocation("/")} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  if (isLoadingRep || !representative) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading representative details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RepresentativeProfile 
        representative={representative} 
        alignmentScore={alignmentScore}
        isLoading={isLoadingScore} 
      />
      
      <Tabs defaultValue="voting-record">
        <div className="bg-white rounded-lg shadow">
          <TabsList className="border-b w-full rounded-none px-0">
            <TabsTrigger value="voting-record" className="px-6 py-3 rounded-none">
              Voting Record
            </TabsTrigger>
            <TabsTrigger value="bills-sponsored" className="px-6 py-3 rounded-none">
              Bills Sponsored
            </TabsTrigger>
            <TabsTrigger value="committees" className="px-6 py-3 rounded-none">
              Committees
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voting-record" className="pt-4">
            <div className="px-4 pb-4">
              <AlignmentChart 
                alignmentScore={alignmentScore} 
                isLoading={isLoadingScore} 
              />
              
              <VotingHistory 
                memberId={memberId} 
                category={category}
                timeframe={timeframe}
                onCategoryChange={setCategory}
                onTimeframeChange={setTimeframe}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="bills-sponsored">
            <Card className="m-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Bills sponsored information will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="committees">
            <Card className="m-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Committee membership information will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
