import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Shield,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Anomaly {
  id: number;
  type: string;
  description: string;
  severity: string;
  status: string;
  detectedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: number | null;
  metadata: any;
  actions: string[] | null;
}

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [resolution, setResolution] = useState<string>('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/api/anomalies');
      
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error fetching anomalies');
      }
    } catch (err) {
      setError('Network error: Unable to fetch anomalies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const resolveAnomaly = async (id: number) => {
    if (!resolution.trim()) {
      toast({
        title: 'Resolution Required',
        description: 'Please enter a resolution description',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setResolvingId(id);
      
      const payload = {
        userId: 1, // Default to admin user for demo
        resolution,
      };
      
      const response = await apiRequest('PUT', `/api/anomalies/${id}/resolve`, payload);
      
      if (response.ok) {
        const resolvedAnomaly = await response.json();
        setAnomalies(prevAnomalies => 
          prevAnomalies.map(anomaly => 
            anomaly.id === id ? resolvedAnomaly : anomaly
          )
        );
        
        toast({
          title: 'Anomaly Resolved',
          description: 'The anomaly has been marked as resolved',
        });
        
        setResolution('');
        setSelectedAnomaly(null);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to resolve anomaly',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Unable to resolve anomaly',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };
  
  const createTestAnomaly = async () => {
    try {
      const anomalyTypes = [
        'unusual_pattern', 
        'security_threat',
        'performance_issue'
      ];
      
      const severities = ['low', 'medium', 'high'];
      
      const descriptions = [
        'Unusual spike in voter check-in rate at station 2',
        'Multiple failed biometric verification attempts for same voter ID',
        'Station 3 processing time significantly higher than average',
        'Unexpected network latency detected',
        'Potential duplicate voter entry detected'
      ];
      
      // Select random values for our test anomaly
      const randomType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      const payload = {
        type: randomType,
        description: randomDescription,
        severity: randomSeverity,
        metadata: { 
          detectedAt: new Date().toISOString(),
          location: 'polling_station_1',
          confidence: Math.floor(Math.random() * 30) + 70 // 70-99%
        }
      };
      
      const response = await apiRequest('POST', '/api/anomalies', payload);
      
      if (response.ok) {
        const newAnomaly = await response.json();
        setAnomalies(prevAnomalies => [...prevAnomalies, newAnomaly]);
        
        toast({
          title: 'Test Anomaly Created',
          description: `A test anomaly "${randomDescription}" has been created`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to create test anomaly',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Unable to create test anomaly',
        variant: 'destructive',
      });
      console.error(err);
    }
  };
  
  // Function to get severity badge variant
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-600">{severity}</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{severity}</Badge>;
      case 'low':
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">{severity}</Badge>;
    }
  };
  
  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">{status}</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'false_positive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">{status}</Badge>;
      case 'detected':
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
    }
  };
  
  // Function to get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security_threat':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'performance_issue':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'unusual_pattern':
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };
  
  // Filter anomalies based on search query
  const filteredAnomalies = anomalies.filter(anomaly => 
    anomaly.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anomaly.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anomaly.severity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anomaly.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    fetchAnomalies();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            AI Anomaly Detection
          </CardTitle>
          <Button variant="outline" onClick={createTestAnomaly}>
            Create Test Anomaly
          </Button>
        </div>
        <CardDescription>
          AI-powered detection of unusual patterns and security threats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anomalies..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          ) : filteredAnomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-muted-foreground text-center">No anomalies found</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                The system is functioning normally with no detected issues
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell className="flex items-center">
                        {getTypeIcon(anomaly.type)}
                        <span className="ml-2 capitalize">
                          {anomaly.type.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={anomaly.description}>
                        {anomaly.description}
                      </TableCell>
                      <TableCell>{getSeverityBadge(anomaly.severity)}</TableCell>
                      <TableCell>{getStatusBadge(anomaly.status)}</TableCell>
                      <TableCell>
                        {new Date(anomaly.detectedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedAnomaly(anomaly)}
                            >
                              {anomaly.status === 'resolved' ? 'View' : 'Resolve'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <div className="flex items-center">
                                {getTypeIcon(selectedAnomaly?.type || '')}
                                <DialogTitle className="ml-2">
                                  {selectedAnomaly?.status === 'resolved' ? 'Anomaly Details' : 'Resolve Anomaly'}
                                </DialogTitle>
                              </div>
                              <DialogDescription>
                                View anomaly details and resolve if necessary
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedAnomaly && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm">{selectedAnomaly.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Severity</h4>
                                    <div className="mt-1">
                                      {getSeverityBadge(selectedAnomaly.severity)}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Status</h4>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedAnomaly.status)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Detected At</h4>
                                    <p className="text-sm">
                                      {new Date(selectedAnomaly.detectedAt).toLocaleString()}
                                    </p>
                                  </div>
                                  {selectedAnomaly.resolvedAt && (
                                    <div>
                                      <h4 className="font-medium">Resolved At</h4>
                                      <p className="text-sm">
                                        {new Date(selectedAnomaly.resolvedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {selectedAnomaly.metadata && (
                                  <div>
                                    <h4 className="font-medium">Additional Information</h4>
                                    <div className="mt-1 text-sm space-y-1">
                                      {Object.entries(selectedAnomaly.metadata).map(([key, value]) => (
                                        <div key={key} className="flex">
                                          <span className="font-medium w-1/3 capitalize">{key.replace('_', ' ')}:</span>
                                          <span className="w-2/3">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedAnomaly.actions && selectedAnomaly.actions.length > 0 && (
                                  <div>
                                    <h4 className="font-medium">Actions Taken</h4>
                                    <ul className="mt-1 text-sm list-disc pl-5 space-y-1">
                                      {selectedAnomaly.actions.map((action, index) => (
                                        <li key={index}>{action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {selectedAnomaly.status !== 'resolved' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="resolution">Resolution</Label>
                                    <Textarea
                                      id="resolution"
                                      placeholder="Describe how this anomaly was resolved..."
                                      value={resolution}
                                      onChange={(e) => setResolution(e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <DialogFooter className="mt-4">
                              {selectedAnomaly && selectedAnomaly.status !== 'resolved' && (
                                <Button
                                  type="button" 
                                  onClick={() => resolveAnomaly(selectedAnomaly.id)}
                                  disabled={resolvingId === selectedAnomaly.id}
                                >
                                  {resolvingId === selectedAnomaly.id ? 'Resolving...' : 'Mark as Resolved'}
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <BarChart3 className="mr-1 h-4 w-4" />
          <span>
            {loading 
              ? 'Loading anomalies...' 
              : `Showing ${filteredAnomalies.length} of ${anomalies.length} anomalies`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnomalies}>
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}