import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <main className="flex-grow container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">About CongressTrack</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              CongressTrack aims to make congressional voting data more accessible and personally relevant 
              to citizens. By tracking your agreement with representatives on specific issues, we help 
              you understand how well your values align with your elected officials.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
              <li>
                <strong>Select a representative</strong> from the list of congress members.
              </li>
              <li>
                <strong>View their voting record</strong> on recent bills and resolutions.
              </li>
              <li>
                <strong>Indicate your agreement</strong> with how they voted on each issue.
              </li>
              <li>
                <strong>Rate the importance</strong> of each issue to you personally.
              </li>
              <li>
                <strong>See your alignment score</strong> and detailed statistics about how your views
                compare to your representative's voting record.
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              CongressTrack uses data from the ProPublica Congress API, which provides comprehensive 
              information about members of Congress and their voting records.
            </p>
            <p className="text-neutral-600">
              All data is sourced from official congressional records and is updated regularly to ensure accuracy.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              We respect your privacy. Your preferences and voting agreements are stored securely 
              and never shared with third parties. We believe that citizens should be able to explore 
              their political alignment without concerns about privacy.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
