import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { AlignmentScore } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AlignmentChartProps {
  alignmentScore?: AlignmentScore;
  isLoading?: boolean;
}

export default function AlignmentChart({ alignmentScore, isLoading = false }: AlignmentChartProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-neutral-400">Your Alignment</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Calculating alignment score...</span>
        </CardContent>
      </Card>
    );
  }

  if (!alignmentScore || alignmentScore.total === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-neutral-400">Your Alignment</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            You haven't rated any votes yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Rate some votes below to see your alignment score.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Data for pie chart
  const pieData = [
    { name: "Agree", value: alignmentScore.agree },
    { name: "Disagree", value: alignmentScore.disagree },
  ];
  
  const COLORS = ["#4caf50", "#f44336"];
  
  // Data for bar chart
  const barData = [
    {
      name: "High Importance",
      percentage: alignmentScore.byImportance.high.percentage || 0,
      agree: alignmentScore.byImportance.high.agree,
      total: alignmentScore.byImportance.high.total,
    },
    {
      name: "Medium Importance",
      percentage: alignmentScore.byImportance.medium.percentage || 0,
      agree: alignmentScore.byImportance.medium.agree,
      total: alignmentScore.byImportance.medium.total,
    },
    {
      name: "Low Importance",
      percentage: alignmentScore.byImportance.low.percentage || 0,
      agree: alignmentScore.byImportance.low.agree,
      total: alignmentScore.byImportance.low.total,
    },
  ];

  return (
    <Card className="mb-6 bg-neutral-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-400">Your Alignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donut chart */}
          <div className="flex items-center justify-center">
            <div className="relative h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{alignmentScore.percentage}%</span>
                <span className="text-sm text-neutral-300">Agree</span>
              </div>
            </div>
          </div>
          
          {/* Bar chart */}
          <div>
            <div className="space-y-4">
              {barData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm text-neutral-300 mb-1">
                    <span>{item.name}</span>
                    <span>
                      {item.percentage}% Agree 
                      {item.total > 0 && <span className="text-xs ml-1">({item.agree}/{item.total})</span>}
                    </span>
                  </div>
                  <div className="h-4 bg-neutral-200 rounded">
                    <div 
                      className="h-4 bg-agree rounded" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
