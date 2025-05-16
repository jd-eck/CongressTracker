import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatImportanceLevel } from "@/lib/utils";
import { UserPreference } from "@shared/schema";

export default function MyPreferences() {
  // For simplicity, we're using a hardcoded user ID
  const userId = 1;
  const { data: preferences, isLoading, error } = useUserPreferences(userId);

  // Ensure preferences is an array
  const preferencesArray = Array.isArray(preferences) ? preferences : [];

  return (
    <main className="flex-grow container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Voting Preferences</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4">Loading your preferences...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p className="text-lg mb-2">⚠️ Error</p>
                <p>Failed to load your preferences. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        ) : preferencesArray.length > 0 ? (
          <div className="space-y-4">
            {preferencesArray.map((pref: UserPreference) => (
              <Card key={pref.id}>
                <CardHeader>
                  <CardTitle>{`Vote #${pref.voteId}`}</CardTitle>
                  <CardDescription>
                    Bill ID: {pref.voteId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-700 mr-2">Your opinion:</span>
                      <span className={pref.agreement ? "text-green-600" : "text-red-600"}>
                        {pref.agreement ? "Agree" : "Disagree"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 mr-2">Importance:</span>
                      <span className="text-primary">
                        {formatImportanceLevel(pref.importance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-neutral-500">
                <p className="text-lg mb-2">ℹ️ No Preferences</p>
                <p>You haven't set any preferences yet. Visit the Dashboard to view voting records and set your preferences.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
