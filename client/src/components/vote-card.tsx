import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { ImportanceSlider } from "@/components/ui/importance-slider";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface VoteCardProps {
  id: number;
  billId: string;
  billTitle: string;
  billDescription: string;
  category?: string;
  voteDate: string;
  position: string;
  memberId: string;
  userPreference?: {
    id: number;
    userId: number;
    billId: string;
    agreement: boolean;
    importance: number;
  } | null;
}

export default function VoteCard({
  id,
  billId,
  billTitle,
  billDescription,
  category = "Uncategorized",
  voteDate,
  position,
  memberId,
  userPreference,
}: VoteCardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [agreement, setAgreement] = useState<boolean | null>(
    userPreference ? userPreference.agreement : null
  );
  const [importance, setImportance] = useState<number>(
    userPreference ? userPreference.importance : 2 // Medium importance by default
  );

  // Format vote date
  const formattedDate = (() => {
    try {
      return `Voted on ${format(new Date(voteDate), "MMM d, yyyy")}`;
    } catch (e) {
      return "Vote date unavailable";
    }
  })();

  // Get vote badge color
  const getVoteBadgeColor = (position: string) => {
    switch (position.toLowerCase()) {
      case "yes":
        return "bg-green-100 text-green-800";
      case "no":
        return "bg-red-100 text-red-800";
      case "present":
        return "bg-yellow-100 text-yellow-800";
      case "not voting":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    const categories: Record<string, string> = {
      "Infrastructure": "bg-blue-100 text-blue-800",
      "Healthcare": "bg-green-100 text-green-800",
      "Voting Rights": "bg-purple-100 text-purple-800",
      "Economy": "bg-yellow-100 text-yellow-800",
      "Education": "bg-indigo-100 text-indigo-800",
      "Immigration": "bg-orange-100 text-orange-800",
      "Environment": "bg-emerald-100 text-emerald-800",
      "Defense": "bg-red-100 text-red-800",
      "Foreign Policy": "bg-blue-100 text-blue-800",
      "Technology": "bg-violet-100 text-violet-800",
      "Civil Rights": "bg-pink-100 text-pink-800",
    };
    
    return categories[category] || "bg-gray-100 text-gray-800";
  };

  // Mutation for saving user preference
  const mutation = useMutation({
    mutationFn: async (data: { agreement: boolean; importance: number }) => {
      return apiRequest("POST", "/api/preferences", {
        userId: 1, // Using user ID 1 for simplicity - in a real app this would come from auth
        billId,
        agreement: data.agreement,
        importance: data.importance,
      });
    },
    onSuccess: () => {
      toast({
        title: "Preference saved",
        description: "Your vote preference has been saved.",
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/votes/${memberId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/alignment/${memberId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error saving preference",
        description: `An error occurred: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSetAgreement = (value: boolean) => {
    setAgreement(value);
    if (importance) {
      mutation.mutate({ agreement: value, importance });
    }
  };

  const handleSetImportance = (value: number) => {
    setImportance(value);
    
    // If importance is set to 0 ("Don't track"), we don't need agreement
    if (value === 0) {
      // For "Don't track", we'll still save the preference but mark agreement as true
      // just to have a consistent value in the database
      mutation.mutate({ agreement: true, importance: 0 });
    } else if (agreement !== null) {
      // If agreement is set and importance is not 0, save as normal
      mutation.mutate({ agreement, importance: value });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <Card className="border border-neutral-200 overflow-hidden">
        <CardHeader className="p-4 flex flex-row items-center justify-between bg-neutral-100 space-y-0">
          <div>
            <h4 className="font-medium text-neutral-400">{billTitle}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryBadgeColor(category)}`}>
                {category}
              </span>
              <span className="text-sm text-neutral-300">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getVoteBadgeColor(position)}`}>
              {position === "Yes" ? <ThumbsUp className="h-3 w-3 mr-1" /> : position === "No" ? <ThumbsDown className="h-3 w-3 mr-1" /> : null}
              Voted {position}
            </span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-300 mb-4">{billDescription}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-neutral-400">Do you agree with this vote?</p>
                <div className="flex space-x-2">
                  <Button
                    variant={agreement === true ? "default" : "outline"}
                    className={agreement === true ? "bg-agree text-white" : ""}
                    onClick={() => handleSetAgreement(true)}
                    disabled={mutation.isPending}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Agree
                  </Button>
                  <Button
                    variant={agreement === false ? "default" : "outline"}
                    className={agreement === false ? "bg-disagree text-white" : ""}
                    onClick={() => handleSetAgreement(false)}
                    disabled={mutation.isPending}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Disagree
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-neutral-400">How important is this issue to you?</p>
                <ImportanceSlider 
                  value={importance} 
                  onChange={handleSetImportance}
                />
              </div>
            </div>
            
            {mutation.isPending && (
              <div className="flex items-center justify-center mt-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Saving your preference...</span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
