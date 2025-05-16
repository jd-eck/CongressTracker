import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import FilterSection from "@/components/filter-section";
import CongressMembersList from "@/components/congress-members-list";
import { Representative } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    state: "",
    chamber: "senate",
    name: ""
  });

  const { data: representatives, isLoading } = useQuery<Representative[]>({
    queryKey: ["/api/representatives", filters.state, filters.chamber, filters.name],
    refetchOnWindowFocus: false,
  });

  const handleSelectRepresentative = (representative: Representative) => {
    setLocation(`/representative/${representative.memberId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <FilterSection 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
        
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-2">Loading representatives...</span>
            </CardContent>
          </Card>
        ) : (
          <CongressMembersList 
            representatives={representatives || []} 
            onSelectRepresentative={handleSelectRepresentative}
          />
        )}
      </div>
      
      <div className="lg:col-span-8">
        <Card className="p-6 h-full flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Welcome to CongressTrack
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Select a representative from the list to see their voting record and 
            calculate how well they align with your views on important issues.
          </p>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 7.7c0 2.4-1.7 5.5-5 8.5-1.5 1.3-3.2 2.8-5 2.8s-3.5-1.5-5-2.8c-3.3-3-5-6.1-5-8.5s1.5-4.1 3.9-4.6c2.4-.4 4.6.9 6.1 3.1 1.5-2.2 3.7-3.6 6.1-3.1 2.4.5 3.9 2.2 3.9 4.6z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Track how your representatives vote on issues that matter to you.
          </p>
        </Card>
      </div>
    </div>
  );
}
