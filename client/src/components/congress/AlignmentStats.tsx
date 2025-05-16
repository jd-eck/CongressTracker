import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlignmentStats as AlignmentStatsType } from "@shared/schema";
import { Chart, registerables } from "chart.js";

// Make sure Chart.js is registered with all components
Chart.register(...registerables);

interface AlignmentStatsProps {
  stats?: AlignmentStatsType;
}

export default function AlignmentStats({ stats }: AlignmentStatsProps) {
  const alignmentChartRef = useRef<HTMLCanvasElement | null>(null);
  const issuesChartRef = useRef<HTMLCanvasElement | null>(null);
  const distributionChartRef = useRef<HTMLCanvasElement | null>(null);
  
  // Track if charts are rendered
  const [chartsRendered, setChartsRendered] = useState(false);
  
  const chartInstancesRef = useRef<{
    alignment?: Chart;
    issues?: Chart;
    distribution?: Chart;
  }>({});
  
  useEffect(() => {
    if (!stats) return;
    
    // Clean up any existing charts
    if (chartInstancesRef.current.alignment) {
      chartInstancesRef.current.alignment.destroy();
    }
    if (chartInstancesRef.current.issues) {
      chartInstancesRef.current.issues.destroy();
    }
    if (chartInstancesRef.current.distribution) {
      chartInstancesRef.current.distribution.destroy();
    }
    
    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      // Create alignment over time chart
      if (alignmentChartRef.current) {
        const timeData = stats.overTime || [];
        const ctx = alignmentChartRef.current.getContext('2d');
        
        if (ctx) {
          chartInstancesRef.current.alignment = new Chart(ctx, {
            type: 'line',
            data: {
              labels: timeData.map(item => item.date),
              datasets: [{
                label: 'Your Alignment %',
                data: timeData.map(item => item.alignment),
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 2,
                tension: 0.2,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          });
        }
      }
      
      // Create issues chart
      if (issuesChartRef.current) {
        const issueData = stats.byIssue || {};
        const ctx = issuesChartRef.current.getContext('2d');
        
        if (ctx) {
          // Ensure we have at least one issue
          const labels = Object.keys(issueData).length > 0 ? 
            Object.keys(issueData) : 
            ['No Issues Yet'];
          
          const data = Object.keys(issueData).length > 0 ? 
            Object.values(issueData) : 
            [0];
          
          chartInstancesRef.current.issues = new Chart(ctx, {
            type: 'radar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Agreement Level',
                data: data,
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(25, 118, 210, 1)',
                pointRadius: 3
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  angleLines: {
                    display: true
                  },
                  suggestedMin: 0,
                  suggestedMax: 100
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          });
        }
      }
      
      // Create distribution chart
      if (distributionChartRef.current) {
        const distribution = stats.distribution || {
          strongAgreement: 0,
          agreement: 0,
          neutral: 0,
          disagreement: 0,
          strongDisagreement: 0
        };
        const ctx = distributionChartRef.current.getContext('2d');
        
        if (ctx) {
          chartInstancesRef.current.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Strong Agreement', 'Agreement', 'Neutral', 'Disagreement', 'Strong Disagreement'],
              datasets: [{
                data: [
                  distribution.strongAgreement,
                  distribution.agreement,
                  distribution.neutral,
                  distribution.disagreement,
                  distribution.strongDisagreement
                ],
                backgroundColor: [
                  'rgba(76, 175, 80, 1)',       // Strong Agreement - Green
                  'rgba(76, 175, 80, 0.6)',     // Agreement - Light Green
                  'rgba(158, 158, 158, 0.6)',   // Neutral - Gray
                  'rgba(244, 67, 54, 0.6)',     // Disagreement - Light Red
                  'rgba(244, 67, 54, 1)',       // Strong Disagreement - Red
                ],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }
          });
        }
      }
      
      setChartsRendered(true);
    }, 300); // Slight delay to ensure DOM is ready
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      clearTimeout(timeoutId);
      if (chartInstancesRef.current.alignment) {
        chartInstancesRef.current.alignment.destroy();
      }
      if (chartInstancesRef.current.issues) {
        chartInstancesRef.current.issues.destroy();
      }
      if (chartInstancesRef.current.distribution) {
        chartInstancesRef.current.distribution.destroy();
      }
      setChartsRendered(false);
    };
  }, [stats]);
  
  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-64">
            <CardContent className="p-4 h-full flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-40 w-full bg-gray-100 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-500 mb-2">Alignment Over Time</h3>
          <div className="h-48">
            <canvas ref={alignmentChartRef} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-500 mb-2">Agreement by Issue</h3>
          <div className="h-48">
            <canvas ref={issuesChartRef} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-500 mb-2">Vote Distribution</h3>
          <div className="h-48">
            <canvas ref={distributionChartRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
