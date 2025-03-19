import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConnectionContext } from "@/App";

// Types
interface Voter {
  id: number;
  voterId: string;
  name: string;
  dateOfBirth: string;
  address: string;
  precinct: string;
}

interface QueueItem {
  id: number;
  voterId: number;
  number: number;
  status: string;
  type: string;
  waitTimeMinutes: number;
  enteredAt: string;
  processedAt: string | null;
  processedBy: number | null;
  voter?: Voter;
}

interface Station {
  id: number;
  number: number;
  status: string;
  operatorId: number | null;
  votersProcessed: number;
  operator?: {
    id: number;
    fullName: string;
  };
}

export default function QueuePage() {
  const [queueFilter, setQueueFilter] = useState("all");
  const { isOffline } = useContext(ConnectionContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for queue stats
  const { data: queueStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/queue/stats'],
    queryFn: async () => {
      if (isOffline) {
        return { waiting: 12, inProgress: 2, completed: 47 };
      }
      const response = await fetch('/api/queue/stats');
      return response.json();
    }
  });

  // Query for queue items
  const { data: queueItems, isLoading: queueLoading } = useQuery({
    queryKey: ['/api/queue'],
    queryFn: async () => {
      if (isOffline) {
        // Return mock data in offline mode
        return [
          {
            id: 1, number: 1, status: 'in_progress', type: 'standard', waitTimeMinutes: 2, 
            voter: { name: 'Michael Johnson' }
          },
          {
            id: 2, number: 2, status: 'waiting', type: 'standard', waitTimeMinutes: 4, 
            voter: { name: 'Jennifer Smith' }
          },
          {
            id: 3, number: 3, status: 'special_assistance', type: 'assistance', waitTimeMinutes: 5, 
            voter: { name: 'Robert Williams' }
          },
          {
            id: 4, number: 4, status: 'waiting', type: 'standard', waitTimeMinutes: 8, 
            voter: { name: 'Patricia Brown' }
          }
        ] as QueueItem[];
      }
      const response = await fetch('/api/queue');
      return response.json();
    }
  });

  // Query for stations
  const { data: stations, isLoading: stationsLoading } = useQuery({
    queryKey: ['/api/stations'],
    queryFn: async () => {
      if (isOffline) {
        // Return mock data in offline mode
        return [
          { id: 1, number: 1, status: 'active', votersProcessed: 4, operator: { fullName: 'David Clark' } },
          { id: 2, number: 2, status: 'active', votersProcessed: 7, operator: { fullName: 'Susan Miller' } },
          { id: 3, number: 3, status: 'active', votersProcessed: 5, operator: { fullName: 'James Wilson' } },
          { id: 4, number: 4, status: 'active', votersProcessed: 6, operator: { fullName: 'Mary Taylor' } },
          { id: 5, number: 5, status: 'inactive', votersProcessed: 0 }
        ] as Station[];
      }
      const response = await fetch('/api/stations');
      return response.json();
    }
  });

  // Mutation for updating queue item status
  const updateQueueStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PUT', `/api/queue/${id}/status`, { status, userId: 2 }); // Using default user ID
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Queue status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Failed to update queue status",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating station status
  const updateStationStatusMutation = useMutation({
    mutationFn: async ({ id, status, operatorId }: { id: number; status: string; operatorId?: number }) => {
      return apiRequest('PUT', `/api/stations/${id}/status`, { status, operatorId });
    },
    onSuccess: () => {
      toast({
        title: "Station Updated",
        description: "Station status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stations'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Failed to update station status",
        variant: "destructive"
      });
    }
  });

  const handleQueueAction = (id: number, action: string) => {
    if (action === 'process') {
      updateQueueStatusMutation.mutate({ id, status: 'in_progress' });
    } else if (action === 'complete') {
      updateQueueStatusMutation.mutate({ id, status: 'completed' });
    } else if (action === 'issue') {
      updateQueueStatusMutation.mutate({ id, status: 'issue' });
    }
  };

  const handleActivateStation = (id: number) => {
    updateStationStatusMutation.mutate({ id, status: 'active', operatorId: 2 }); // Default user
  };

  const filteredQueueItems = queueItems ? queueItems.filter(item => {
    if (queueFilter === 'all') return true;
    if (queueFilter === 'standard') return item.type === 'standard';
    if (queueFilter === 'special_assistance') return item.type === 'assistance';
    if (queueFilter === 'provisional') return item.type === 'provisional';
    return true;
  }) : [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress': return 'success';
      case 'waiting': return 'waiting';
      case 'special_assistance': return 'specialAssistance';
      case 'issue': return 'error';
      default: return 'waiting';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'waiting': return 'Waiting';
      case 'special_assistance': return 'Special Assistance';
      case 'issue': return 'Issue';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Queue Management</h2>
          <p className="text-neutral-500">Manage voter check-in queue and status</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/queue'] });
              queryClient.invalidateQueries({ queryKey: ['/api/queue/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stations'] });
            }}
            className="px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition flex items-center"
          >
            <span className="material-icons mr-1" style={{ fontSize: '18px' }}>refresh</span>
            Refresh
          </Button>
          <Button 
            variant="outline"
            className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition flex items-center"
          >
            <span className="material-icons mr-1" style={{ fontSize: '18px' }}>settings</span>
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Currently Waiting</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : queueStats?.waiting || 0}
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Est. Wait Time</p>
          <p className="text-2xl font-semibold text-primary">8-12 min</p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Processed Today</p>
          <p className="text-2xl font-semibold text-primary">
            {statsLoading ? '...' : queueStats?.completed || 0}
          </p>
        </div>
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
          <p className="text-sm text-neutral-500">Active Stations</p>
          <p className="text-2xl font-semibold text-primary">
            {stationsLoading ? '...' : 
              `${stations?.filter(s => s.status === 'active').length || 0}/${stations?.length || 0}`
            }
          </p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-800">Current Queue</h3>
          <div className="flex items-center">
            <label htmlFor="queue-filter" className="block text-sm font-medium text-neutral-700 mr-2">Filter:</label>
            <Select value={queueFilter} onValueChange={setQueueFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Voters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voters</SelectItem>
                <SelectItem value="standard">Standard Check-in</SelectItem>
                <SelectItem value="special_assistance">Special Assistance</SelectItem>
                <SelectItem value="provisional">Provisional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Queue #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Wait Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Check-in Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {queueLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">Loading queue data...</td>
                </tr>
              ) : filteredQueueItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">No queue items found</td>
                </tr>
              ) : (
                filteredQueueItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{item.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.voter?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{item.waitTimeMinutes} min</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex space-x-2">
                        {item.status === 'waiting' ? (
                          <button 
                            className="text-primary hover:text-primary-dark transition"
                            onClick={() => handleQueueAction(item.id, 'process')}
                          >Process</button>
                        ) : item.status === 'in_progress' ? (
                          <button 
                            className="text-primary hover:text-primary-dark transition"
                            onClick={() => handleQueueAction(item.id, 'complete')}
                          >Complete</button>
                        ) : null}
                        
                        {item.status !== 'issue' && (
                          <button 
                            className="text-error hover:text-error/80 transition"
                            onClick={() => handleQueueAction(item.id, 'issue')}
                          >Issue</button>
                        )}
                        
                        {item.status === 'special_assistance' && (
                          <button className="text-neutral-500 hover:text-neutral-700 transition">Details</button>
                        )}
                        
                        {item.status === 'waiting' && item.type === 'standard' && (
                          <button className="text-neutral-500 hover:text-neutral-700 transition">Flag</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Station Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stationsLoading ? (
            <div className="col-span-5 text-center py-4">Loading stations...</div>
          ) : (
            stations?.map((station) => (
              <div key={station.id} className="border border-neutral-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Station {station.number}</h4>
                  <Badge variant={station.status === 'active' ? 'success' : 'waiting'}>
                    {station.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  Operator: {station.status === 'active' ? (
                    <span>{station.operator?.fullName}</span>
                  ) : (
                    <span className="italic">Unassigned</span>
                  )}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-neutral-500">{station.votersProcessed} voters processed</span>
                  {station.status === 'active' ? (
                    <button className="text-sm text-primary">Details</button>
                  ) : (
                    <button 
                      className="text-sm text-primary"
                      onClick={() => handleActivateStation(station.id)}
                    >Activate</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
