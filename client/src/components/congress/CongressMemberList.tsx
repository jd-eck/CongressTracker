import { useState, useEffect } from "react";
import { useCongressMembers } from "@/hooks/useCongressMembers";
import { CongressMemberResponse } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CongressMemberListProps {
  selectedMember: CongressMemberResponse | null;
  onSelectMember: (member: CongressMemberResponse) => void;
}

export default function CongressMemberList({ selectedMember, onSelectMember }: CongressMemberListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    chamber: "",
    party: "",
    state: ""
  });

  const { data: congressMembers, isLoading, error } = useCongressMembers(filters);
  
  const handleFilter = (filterType: "chamber" | "party" | "state", value: string) => {
    setFilters(prev => {
      if (prev[filterType] === value) {
        // If clicking on active filter, remove it
        return { ...prev, [filterType]: "" };
      }
      return { ...prev, [filterType]: value };
    });
  };

  const clearFilters = () => {
    setFilters({ chamber: "", party: "", state: "" });
    setSearchTerm("");
  };

  // Filter congress members by search term
  const filteredMembers = congressMembers?.filter(member => {
    if (!searchTerm) return true;
    return (
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="md:w-1/3 lg:w-1/4 bg-white rounded-lg shadow-md p-4 mb-6 md:mb-0">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-500 mb-2">Select Congress Member</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search representatives..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-icons absolute left-2 top-2 text-neutral-300">search</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-neutral-400">Filter by:</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-primary h-auto p-1"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant={filters.party === "D" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.party === "D" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("party", "D")}
          >
            Democrat
          </Button>
          <Button
            variant={filters.party === "R" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.party === "R" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("party", "R")}
          >
            Republican
          </Button>
          <Button
            variant={filters.party === "I" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.party === "I" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("party", "I")}
          >
            Independent
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant={filters.chamber === "senate" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.chamber === "senate" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("chamber", "senate")}
          >
            Senate
          </Button>
          <Button
            variant={filters.chamber === "house" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.chamber === "house" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("chamber", "house")}
          >
            House
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant={filters.state === "user_state" ? "default" : "outline"}
            size="sm"
            className={`px-2 py-1 text-sm rounded-full ${filters.state === "user_state" ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400"}`}
            onClick={() => handleFilter("state", "user_state")}
          >
            Your State
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-3 border-b border-neutral-100 flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-4 text-red-500 text-center">
            <span className="material-icons mb-2">error_outline</span>
            <p>Failed to load congress members.</p>
          </div>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div 
              key={member.bioguideId}
              className={`p-3 border-b border-neutral-100 hover:bg-blue-50 cursor-pointer flex items-center ${selectedMember?.bioguideId === member.bioguideId ? 'bg-blue-50' : ''}`}
              onClick={() => onSelectMember(member)}
            >
              <div className={`w-10 h-10 rounded-full ${selectedMember?.bioguideId === member.bioguideId ? 'bg-primary/10' : 'bg-neutral-100'} mr-3 flex items-center justify-center`}>
                <span className={`material-icons ${selectedMember?.bioguideId === member.bioguideId ? 'text-primary' : 'text-neutral-400'}`}>person</span>
              </div>
              <div>
                <div className="font-medium">
                  {member.chamber === "senate" ? "Sen. " : "Rep. "}
                  {member.name}
                </div>
                <div className="text-sm text-neutral-400">
                  {member.party} - {member.state}
                  {member.district ? `, ${member.district}` : ""}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-neutral-500 text-center">
            <span className="material-icons mb-2">search_off</span>
            <p>No congress members found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
