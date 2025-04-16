import { useState } from "react";
import { CongressMemberResponse } from "@shared/schema";
import MemberHeader from "./MemberHeader";
import AlignmentStats from "./AlignmentStats";
import VotingRecords from "./VotingRecords";
import { useAlignmentStats } from "@/hooks/useAlignmentStats";

interface CongressMemberDetailsProps {
  member: CongressMemberResponse;
}

export default function CongressMemberDetails({ member }: CongressMemberDetailsProps) {
  // For demo purposes, using static userId
  const userId = 1;
  
  const { data: alignmentStats } = useAlignmentStats(userId, member.bioguideId);
  
  return (
    <div className="md:w-2/3 lg:w-3/4">
      <MemberHeader member={member} alignmentScore={alignmentStats?.overall || 0} />
      <AlignmentStats stats={alignmentStats} />
      <VotingRecords member={member} />
    </div>
  );
}
