import { useState } from "react";
import CongressMemberList from "@/components/congress/CongressMemberList";
import CongressMemberDetails from "@/components/congress/CongressMemberDetails";
import { CongressMemberResponse } from "@shared/schema";

export default function Dashboard() {
  const [selectedMember, setSelectedMember] = useState<CongressMemberResponse | null>(null);

  return (
    <main className="flex-grow container mx-auto p-4">
      <div className="md:flex md:space-x-6">
        <CongressMemberList 
          selectedMember={selectedMember} 
          onSelectMember={setSelectedMember} 
        />
        
        {selectedMember ? (
          <CongressMemberDetails member={selectedMember} />
        ) : (
          <div className="md:w-2/3 lg:w-3/4 bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-primary text-6xl mb-4">
                <span className="material-icons text-6xl">how_to_vote</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-600 mb-2">
                Select a Congress Member
              </h2>
              <p className="text-neutral-500">
                Choose a representative from the list to view their voting record and calculate your alignment.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
