import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BarChart from "@/components/charts/BarChart";
import { ConnectionContext } from "@/App";

// Types
interface SystemStatus {
  id: number;
  component: string;
  status: string;
  lastChecked: string;
  notes: string;
}

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

interface Message {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

interface Stat {
  id: number;
  date: string;
  hour: number;
  votersProcessed: number;
  averageProcessingTime: number | null;
  waitTime: number | null;
  throughput: number | null;
}

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
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
          peakHour: "11:00"
        };
      }
      const response = await fetch('/api/stats/summary');
      return response.json();
    }
  });

  // Query for hourly stats for the chart
  const { data: hourlyStats, isLoading: hourlyLoading } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      if (isOffline) {
        // Create mock hourly data for 8am-3pm
        return Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          hour: i + 8,
          votersProcessed: Math.floor(Math.random() * 10) + 5
        }));
      }
      const response = await fetch('/api/stats');
      return response.json();
    }
  });

  // Query for system status
  const { data: systemStatuses, isLoading: statusesLoading } = useQuery({
    queryKey: ['/api/system-status'],
    queryFn: async () => {
      if (isOffline) {
        return [
          { 
            id: 1, component: 'Voter Database', status: 'operational', 
            lastChecked: '2 mins ago', notes: 'Normal performance' 
          },
          { 
            id: 2, component: 'ID Scanner', status: 'operational', 
            lastChecked: '5 mins ago', notes: 'All devices connected' 
          },
          { 
            id: 3, component: 'Internet Connection', status: 'degraded', 
            lastChecked: '1 min ago', notes: 'Slow connection speeds' 
          },
          { 
            id: 4, component: 'Central Election System', status: 'operational', 
            lastChecked: '10 mins ago', notes: 'Normal operations' 
          }
        ] as SystemStatus[];
      }
      const response = await fetch('/api/system-status');
      return response.json();
    }
  });

  // Query for alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      if (isOffline) {
        return [
          {
            id: 1, type: 'warning', title: 'Internet Connection Slow',
            message: 'Backup connection active. Some operations may be delayed.',
            timestamp: new Date('2023-04-15T14:10:00').toISOString()
          },
          {
            id: 2, type: 'info', title: 'System Update Available',
            message: 'Update will be automatically applied after closing hours.',
            timestamp: new Date('2023-04-15T13:25:00').toISOString()
          }
        ] as Alert[];
      }
      const response = await fetch('/api/alerts');
      return response.json();
    }
  });

  // Query for messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      if (isOffline) {
        return [
          {
            id: 1, sender: 'County Election Office',
            message: 'Please remind voters to check ballot completion before submission.',
            timestamp: new Date('2023-04-15T12:15:00').toISOString()
          },
          {
            id: 2, sender: 'District Coordinator',
            message: 'Expected increase in turnout between 4-6 PM. Additional support on standby.',
            timestamp: new Date('2023-04-15T11:30:00').toISOString()
          }
        ] as Message[];
      }
      const response = await fetch('/api/messages');
      return response.json();
    }
  });

  // Format hourly data for chart
  const chartData = hourlyStats ? hourlyStats.map(stat => ({
    hour: `${stat.hour}${stat.hour < 12 ? 'am' : 'pm'}`,
    value: stat.votersProcessed
  })) : [];

  // Set up automatic refresh of last updated time
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'info';
    }
  };

  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Dashboard */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">Status Dashboard</h2>
            <p className="text-neutral-500">Real-time polling location metrics</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Last updated: <span>{lastUpdated}</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
            <p className="text-sm text-neutral-500">Voters Processed Today</p>
            <p className="text-2xl font-semibold text-primary">
              {statsLoading ? '...' : statsSummary?.totalVotersProcessed || 0}
            </p>
            <p className="text-xs text-neutral-500 mt-1">+12% from average</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
            <p className="text-sm text-neutral-500">Current Wait Time</p>
            <p className="text-2xl font-semibold text-primary">
              {statsLoading ? '...' : `${statsSummary?.currentWaitTime || 0} min`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">-3 min from 1 hour ago</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
            <p className="text-sm text-neutral-500">Current Throughput</p>
            <p className="text-2xl font-semibold text-primary">
              {statsLoading ? '...' : statsSummary?.currentThroughput || 0}
            </p>
            <p className="text-xs text-neutral-500 mt-1">voters/hour</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Hourly Processing Rate</h3>
          {hourlyLoading ? (
            <div className="h-64 border border-neutral-100 rounded-md p-4 bg-neutral-50 flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <BarChart data={chartData} height="h-64" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-neutral-800 mb-4">System Status</h3>
          <div className="overflow-x-auto border border-neutral-200 rounded-md">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">System Component</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Check</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {statusesLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Loading system status...</td>
                  </tr>
                ) : (
                  systemStatuses?.map((status) => (
                    <tr key={status.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{status.component}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(status.status)}>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{status.lastChecked}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{status.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Alerts & Messages Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Alerts & Messages</h3>
        
        {alertsLoading ? (
          <p className="text-center py-2">Loading alerts...</p>
        ) : (
          alerts?.map((alert) => (
            <div key={alert.id} className={`mb-5 p-3 bg-${alert.type} bg-opacity-10 border-l-4 border-${alert.type} rounded`}>
              <div className="flex">
                <span className={`material-icons text-${alert.type} mr-2`} style={{ fontSize: '20px' }}>
                  {alert.type === 'warning' ? 'warning' : 'info'}
                </span>
                <div>
                  <h4 className="font-medium text-neutral-800">{alert.title}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-neutral-500 mt-1">{getFormattedTime(alert.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="mb-6">
          <h4 className="font-medium text-neutral-700 mb-2">Messages from HQ</h4>
          {messagesLoading ? (
            <p className="text-center py-2">Loading messages...</p>
          ) : (
            <div className="space-y-3">
              {messages?.map((message) => (
                <div key={message.id} className="p-3 border border-neutral-200 rounded-md">
                  <p className="text-sm text-neutral-800">{message.message}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {message.sender} • {getFormattedTime(message.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-neutral-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="p-3 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition text-sm flex flex-col items-center">
              <span className="material-icons mb-1" style={{ fontSize: '24px' }}>support_agent</span>
              Request Support
            </Button>
            <Button variant="outline" className="p-3 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition text-sm flex flex-col items-center">
              <span className="material-icons mb-1" style={{ fontSize: '24px' }}>announcement</span>
              Report Issue
            </Button>
            <Button variant="outline" className="p-3 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition text-sm flex flex-col items-center">
              <span className="material-icons mb-1" style={{ fontSize: '24px' }}>sync</span>
              Force Sync
            </Button>
            <Button variant="outline" className="p-3 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition text-sm flex flex-col items-center">
              <span className="material-icons mb-1" style={{ fontSize: '24px' }}>print</span>
              Print Summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
