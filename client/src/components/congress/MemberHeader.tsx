import { CongressMemberResponse } from "@shared/schema";

interface MemberHeaderProps {
  member: CongressMemberResponse;
  alignmentScore: number;
}

export default function MemberHeader({ member, alignmentScore }: MemberHeaderProps) {
  const getPartyColor = (party: string) => {
    switch (party) {
      case 'D':
        return 'bg-blue-100 text-blue-800';
      case 'R':
        return 'bg-red-100 text-red-800';
      case 'I':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartyName = (party: string) => {
    switch (party) {
      case 'D':
        return 'Democrat';
      case 'R':
        return 'Republican';
      case 'I':
        return 'Independent';
      default:
        return party;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
          <span className="material-icons text-primary text-3xl">person</span>
        </div>
        
        <div className="mt-2 md:mt-0">
          <h2 className="text-2xl font-bold">
            {member.chamber === 'senate' ? 'Sen. ' : 'Rep. '}
            {member.name}
          </h2>
          <div className="flex flex-wrap items-center mt-1">
            <span className={`${getPartyColor(member.party)} px-2 py-0.5 rounded-full text-sm mr-2`}>
              {getPartyName(member.party)}
            </span>
            <span className="text-neutral-500">
              {member.state}
              {member.district ? `, ${member.district}${getOrdinalSuffix(member.district)} District` : ''}
            </span>
            {member.termStart && (
              <>
                <span className="mx-2 text-neutral-300">|</span>
                <span className="text-neutral-500">
                  In office since {member.termStart}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="md:ml-auto mt-4 md:mt-0 text-center">
          <div className="text-3xl font-bold text-primary">{alignmentScore}%</div>
          <div className="text-sm text-neutral-500">Voting Alignment</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get ordinal suffix for numbers
function getOrdinalSuffix(district: string): string {
  const num = parseInt(district, 10);
  if (isNaN(num)) return '';
  
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}
