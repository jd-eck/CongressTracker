import { useState } from "react";
import { VoteResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoteItemProps {
  vote: VoteResponse;
}

export default function VoteItem({ vote }: VoteItemProps) {
  const { toast } = useToast();
  // For simplicity, we're using a hardcoded user ID in this demo
  const userId = 1;
  
  const { data: preferences, refetch: refetchPreferences } = useUserPreferences(userId);
  
  const userPreference = preferences?.find(pref => pref.voteId === vote.id);
  
  const [importance, setImportance] = useState<number>(userPreference?.importance || 3);
  const [agreement, setAgreement] = useState<boolean | null>(
    userPreference !== undefined ? userPreference.agreement : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAgree = async (agrees: boolean) => {
    try {
      setIsSubmitting(true);
      setAgreement(agrees);
      
      await apiRequest('POST', '/api/user-preferences', {
        userId,
        voteId: vote.id,
        agreement: agrees,
        importance
      });
      
      // Refetch preferences to update UI
      await refetchPreferences();
      toast({
        title: "Preference saved",
        description: "Your opinion on this vote has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error saving preference",
        description: "There was a problem saving your preference. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImportanceChange = async (value: number[]) => {
    const importanceValue = value[0];
    setImportance(importanceValue);
    
    // Only save if the user has already set an agreement
    if (agreement !== null) {
      try {
        setIsSubmitting(true);
        await apiRequest('POST', '/api/user-preferences', {
          userId,
          voteId: vote.id,
          agreement,
          importance: importanceValue
        });
        
        // Refetch preferences to update UI
        await refetchPreferences();
      } catch (error) {
        toast({
          title: "Error saving importance",
          description: "There was a problem saving your preference. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getImportanceText = (importance: number) => {
    switch (importance) {
      case 1: return "Not important";
      case 2: return "Low importance";
      case 3: return "Somewhat important";
      case 4: return "High importance";
      case 5: return "Very important";
      default: return "Somewhat important";
    }
  };
  
  return (
    <div className="border border-neutral-200 rounded-lg mb-4 overflow-hidden">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium text-lg">{vote.billTitle}</h4>
            <p className="text-sm text-neutral-500 mt-1">
              Voted on {formatDate(vote.date)}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-sm text-white ${vote.position.toLowerCase() === 'yes' ? 'bg-accent' : 'bg-secondary'}`}>
              Voted {vote.position}
            </div>
          </div>
        </div>
        <p className="mt-3 text-neutral-600">
          {vote.billDescription || "No description available."}
        </p>
      </div>
      
      <div className="p-4 bg-gray-50">
        <div className="md:flex md:items-center">
          <div className="mb-3 md:mb-0 md:mr-6">
            <div className="text-sm font-medium text-neutral-500 mb-1">
              {userPreference ? "Your opinion" : "Do you agree with this vote?"}
            </div>
            <div className="flex space-x-3">
              <Button
                variant={agreement === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleAgree(true)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 ${
                  agreement === true 
                    ? "bg-accent text-white" 
                    : "border border-accent text-accent hover:bg-accent hover:text-white"
                }`}
              >
                <span className="material-icons text-sm mr-1">thumb_up</span>
                Agree
              </Button>
              <Button
                variant={agreement === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleAgree(false)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 ${
                  agreement === false 
                    ? "bg-secondary text-white" 
                    : "border border-secondary text-secondary hover:bg-secondary hover:text-white"
                }`}
              >
                <span className="material-icons text-sm mr-1">thumb_down</span>
                Disagree
              </Button>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="text-sm font-medium text-neutral-500 mb-1">
              {userPreference 
                ? `Issue importance: ${getImportanceText(importance)}`
                : "How important is this issue to you?"}
            </div>
            <div className="relative pt-1">
              <Slider
                value={[importance]}
                min={1}
                max={5}
                step={1}
                onValueChange={handleImportanceChange}
                disabled={isSubmitting || agreement === null}
                className="importance-slider"
              />
              <div className="flex justify-between text-xs text-neutral-400 px-1 mt-1">
                <span>Not important</span>
                <span>Somewhat</span>
                <span>Very important</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
