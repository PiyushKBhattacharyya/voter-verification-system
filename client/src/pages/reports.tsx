import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionContext } from "@/App";

// Define report types
type ReportType = "daily" | "hourly" | "issues" | "custom";

// Define interfaces for the different data types
interface ProcessingSummary {
  type: string;
  count: number;
  percentage: number;
  avgTime: number;
}

interface IssueType {
  type: string;
  occurrences: number;
  resolution: string;
  avgResolutionTime: number;
}

interface StationPerformance {
  station: string;
  votersProcessed: number;
  avgProcessingTime: number;
  issuesReported: number;
  uptime: string;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("daily");
  const { isOffline } = useContext(ConnectionContext);

  // Query for stats summary
  const { data: statsSummary, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/summary'],
    queryFn: async () => {
      if (isOffline) {
        return {
          totalVotersProcessed: 47,
          avgProcessingTime: 3.2,
          currentWaitTime: 12,
          currentThroughput: 6,
          peakHour: "11:00",
          specialCases: 5
        };
      }
      const response = await fetch('/api/stats/summary');
      return response.json();
    }
  });

  // Mock data for demo purposes
  const processingSummary: ProcessingSummary[] = [
    { type: "Standard", count: 42, percentage: 89.4, avgTime: 3.0 },
    { type: "Provisional", count: 3, percentage: 6.4, avgTime: 6.5 },
    { type: "Special Assistance", count: 2, percentage: 4.2, avgTime: 4.2 }
  ];

  const issueTypes: IssueType[] = [
    { type: "ID Verification Failure", occurrences: 4, resolution: "100% Resolved", avgResolutionTime: 5.2 },
    { type: "Address Discrepancy", occurrences: 3, resolution: "100% Resolved", avgResolutionTime: 4.8 },
    { type: "Scanner Malfunction", occurrences: 1, resolution: "Recurring", avgResolutionTime: 3.0 }
  ];

  const stationPerformance: StationPerformance[] = [
    { station: "Station 1", votersProcessed: 14, avgProcessingTime: 3.2, issuesReported: 1, uptime: "100%" },
    { station: "Station 2", votersProcessed: 13, avgProcessingTime: 2.9, issuesReported: 0, uptime: "100%" },
    { station: "Station 3", votersProcessed: 11, avgProcessingTime: 3.5, issuesReported: 2, uptime: "98%" },
    { station: "Station 4", votersProcessed: 9, avgProcessingTime: 3.1, issuesReported: 1, uptime: "100%" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Reports</h2>
          <p className="text-neutral-500">Basic polling station analytics and data</p>
        </div>
        <div>
          <Button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition flex items-center">
            <span className="material-icons mr-1" style={{ fontSize: '18px' }}>download</span>
            Export Data
          </Button>
        </div>
      </div>
      
      <div className="flex mb-6 border-b border-neutral-200">
        <Button 
          variant={activeReport === "daily" ? "default" : "ghost"}
          className={`px-4 py-2 ${activeReport === "daily" ? "text-primary border-b-2 border-primary font-medium" : "text-neutral-600 hover:text-neutral-800 transition"}`}
          onClick={() => setActiveReport("daily")}
        >
          Daily Summary
        </Button>
        <Button 
          variant={activeReport === "hourly" ? "default" : "ghost"}
          className={`px-4 py-2 ${activeReport === "hourly" ? "text-primary border-b-2 border-primary font-medium" : "text-neutral-600 hover:text-neutral-800 transition"}`}
          onClick={() => setActiveReport("hourly")}
        >
          Hourly Breakdown
        </Button>
        <Button 
          variant={activeReport === "issues" ? "default" : "ghost"}
          className={`px-4 py-2 ${activeReport === "issues" ? "text-primary border-b-2 border-primary font-medium" : "text-neutral-600 hover:text-neutral-800 transition"}`}
          onClick={() => setActiveReport("issues")}
        >
          Issue Reports
        </Button>
        <Button 
          variant={activeReport === "custom" ? "default" : "ghost"}
          className={`px-4 py-2 ${activeReport === "custom" ? "text-primary border-b-2 border-primary font-medium" : "text-neutral-600 hover:text-neutral-800 transition"}`}
          onClick={() => setActiveReport("custom")}
        >
          Custom Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Total Voters Processed</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : statsSummary?.totalVotersProcessed || 0}
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Average Processing Time</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : `${statsSummary?.avgProcessingTime || 0} min`}
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Peak Hour</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : statsSummary?.peakHour || 'N/A'}
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Special Cases</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : statsSummary?.specialCases || 0}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Processing Summary</h3>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Check-in Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Count</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {processingSummary.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.avgTime} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Common Issues Encountered</h3>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Issue Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Occurrences</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Resolution Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg. Resolution Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {issueTypes.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.occurrences}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={item.resolution === 'Recurring' ? 'warning' : 'success'}>
                      {item.resolution}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.avgResolutionTime} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Station Performance</h3>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Station</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Voters Processed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg. Processing Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Issues Reported</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Uptime</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {stationPerformance.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.station}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.votersProcessed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.avgProcessingTime} min</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.issuesReported}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
