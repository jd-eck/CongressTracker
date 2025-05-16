import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Vote, Users } from "lucide-react";
import { Representative, AlignmentScore } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RepresentativeProfileProps {
  representative: Representative;
  alignmentScore?: AlignmentScore;
  isLoading?: boolean;
}

export default function RepresentativeProfile({
  representative,
  alignmentScore,
  isLoading = false,
}: RepresentativeProfileProps) {
  const getPartyName = (party: string) => {
    switch (party) {
      case "D":
        return "Democrat";
      case "R":
        return "Republican";
      case "I":
        return "Independent";
      default:
        return party;
    }
  };

  const getPartyColor = (party: string) => {
    switch (party) {
      case "D":
        return "bg-blue-100 text-blue-800";
      case "R":
        return "bg-red-100 text-red-800";
      case "I":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 shadow-md">
            {representative.profileImageUrl ? (
              <img
                src={representative.profileImageUrl}
                alt={`${representative.firstName} ${representative.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with initials
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-medium">
                      ${representative.firstName.charAt(0)}${representative.lastName.charAt(0)}
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-medium">
                {representative.firstName.charAt(0)}{representative.lastName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-medium text-neutral-400">
              {representative.firstName} {representative.lastName}
            </h2>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${getPartyColor(representative.party)}`}>
                {getPartyName(representative.party)}
              </span>
              <span className="text-neutral-300 text-sm">
                {representative.state}{representative.district ? ` - ${representative.district} District` : ""}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1 text-sm text-neutral-300">
                <Vote className="h-4 w-4" />
                <span>Member of {representative.chamber}</span>
              </span>
              
              {representative.officeStart && (
                <span className="inline-flex items-center space-x-1 text-sm text-neutral-300">
                  <Calendar className="h-4 w-4" />
                  <span>
                    In office since {new Date(representative.officeStart).getFullYear()}
                  </span>
                </span>
              )}
              
              <span className="inline-flex items-center space-x-1 text-sm text-neutral-300">
                <Users className="h-4 w-4" />
                <span>
                  Serves {representative.chamber === "senate" ? "state-wide" : "district"} constituents
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-neutral-100 p-4 rounded-lg min-w-[100px]">
            {isLoading ? (
              <LoadingSpinner size="md" />
            ) : alignmentScore ? (
              <>
                <div className="text-3xl font-bold text-primary">
                  {alignmentScore.percentage}%
                </div>
                <div className="text-sm text-neutral-300">Alignment Score</div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">--</div>
                <div className="text-sm text-neutral-300">Alignment Score</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
