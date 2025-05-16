import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Representative } from "@shared/schema";

interface CongressMembersListProps {
  representatives: Representative[];
  onSelectRepresentative: (representative: Representative) => void;
  selectedMemberId?: string;
}

export default function CongressMembersList({
  representatives,
  onSelectRepresentative,
  selectedMemberId,
}: CongressMembersListProps) {
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case "d":
      case "democrat":
      case "democratic":
        return "bg-blue-100 text-blue-800";
      case "r":
      case "republican":
        return "bg-red-100 text-red-800";
      case "i":
      case "independent":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="py-4 px-4 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-400">
          Representatives
        </CardTitle>
      </CardHeader>
      
      {representatives.length === 0 ? (
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No representatives found.</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
        </CardContent>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="divide-y divide-neutral-200">
            {representatives.map((rep) => (
              <div
                key={rep.memberId}
                onClick={() => onSelectRepresentative(rep)}
                className={`p-4 hover:bg-neutral-100 cursor-pointer transition flex items-center space-x-3 ${
                  selectedMemberId === rep.memberId 
                    ? "bg-primary bg-opacity-10 border-l-4 border-primary" 
                    : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {rep.profileImageUrl ? (
                    <img
                      src={rep.profileImageUrl}
                      alt={`${rep.firstName} ${rep.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, replace with initials
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-primary text-white font-medium">
                            ${rep.firstName.charAt(0)}${rep.lastName.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-medium">
                      {rep.firstName.charAt(0)}{rep.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-400">
                    {rep.firstName} {rep.lastName}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getPartyColor(rep.party)}`}>
                      {rep.party === "D" ? "Democrat" : rep.party === "R" ? "Republican" : rep.party}
                    </span>
                    <span className="text-sm text-neutral-300">
                      {rep.state}{rep.district ? ` - ${rep.district}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
