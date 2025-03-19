import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Fingerprint, 
  Accessibility, 
  Bell, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Lock,
  Globe,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BiometricVerification from '@/components/BiometricVerification';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import MobileNotifications from '@/components/MobileNotifications';
import AnomalyDetection from '@/components/AnomalyDetection';

interface Voter {
  id: number;
  voterId: string;
  name: string;
  dateOfBirth: string;
  address: string;
  precinct: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: number | null;
}

const DEFAULT_VOTER: Voter = {
  id: 1,
  voterId: '100123',
  name: 'Sarah Johnson',
  dateOfBirth: '05/12/1985',
  address: '123 Main St, Cityville',
  precinct: 'East District 4',
  checkedIn: false,
  checkedInAt: null,
  checkedInBy: null
};

export default function EnhancementsPage() {
  const [activeTab, setActiveTab] = useState<string>('biometric');
  const [voterId, setVoterId] = useState<string>('');
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchVoter = async () => {
    if (!voterId.trim()) {
      setError('Please enter a Voter ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/voters/${voterId}`);
      
      if (response.ok) {
        const data = await response.json();
        setVoter(data);
        // Reset any previous error
        setError(null);
      } else {
        // For demo purposes, use the default voter if not found
        if (response.status === 404) {
          setVoter(DEFAULT_VOTER);
          toast({
            title: 'Using Demo Voter',
            description: 'Voter ID not found. Using sample voter data for demo.',
          });
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error fetching voter information');
          setVoter(null);
        }
      }
    } catch (err) {
      setError('Network error: Unable to fetch voter information');
      console.error(err);
      setVoter(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initialize with the default voter for demo purposes
    setVoter(DEFAULT_VOTER);
  }, []);
  
  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enhanced Verification System</h1>
        <p className="text-gray-500 mt-1">
          Advanced features for secure and accessible voting
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Voter Lookup</CardTitle>
          <CardDescription>
            Enter a voter ID to access enhanced verification features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="voterId">Voter ID</Label>
              <Input
                id="voterId"
                placeholder="Enter voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
              />
            </div>
            <div className="mt-auto">
              <Button onClick={fetchVoter} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
        {voter && (
          <CardFooter className="border-t px-6 py-3">
            <div className="flex justify-between w-full">
              <div>
                <span className="text-sm text-gray-500">Voter:</span>{' '}
                <span className="font-medium">{voter.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>{' '}
                <Badge variant={voter.checkedIn ? 'default' : 'outline'} className={voter.checkedIn ? 'bg-green-600' : ''}>
                  {voter.checkedIn ? 'Checked In' : 'Not Checked In'}
                </Badge>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {voter && (
        <>
          <div className="grid grid-cols-4 gap-6 mb-4">
            <Card 
              className={`cursor-pointer transition-colors ${activeTab === 'biometric' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setActiveTab('biometric')}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center">
                  <Fingerprint className="mr-2 h-5 w-5" />
                  Biometric Verification
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${activeTab === 'accessibility' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setActiveTab('accessibility')}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center">
                  <Accessibility className="mr-2 h-5 w-5" />
                  Accessibility Tools
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${activeTab === 'mobile' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Mobile Notifications
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${activeTab === 'ai' ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  AI Security Features
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          <div className="mb-8">
            {activeTab === 'biometric' && (
              <BiometricVerification 
                voter={voter} 
                onVerified={() => {
                  toast({ 
                    title: 'Biometric Verification Complete',
                    description: 'Voter identity has been verified successfully.'
                  });
                }} 
              />
            )}
            
            {activeTab === 'accessibility' && (
              <AccessibilitySettings 
                voter={voter}
                onSettingsSaved={() => {
                  toast({ 
                    title: 'Accessibility Settings Saved',
                    description: 'Your accessibility preferences have been updated.'
                  });
                }}
              />
            )}
            
            {activeTab === 'mobile' && (
              <MobileNotifications 
                voter={voter}
                onSetupComplete={() => {
                  toast({ 
                    title: 'Mobile Notifications Enabled',
                    description: 'You will now receive updates about your position in the queue.'
                  });
                }}
              />
            )}
            
            {activeTab === 'ai' && (
              <AnomalyDetection />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Blockchain Record
                </CardTitle>
                <CardDescription>
                  Immutable record of voter verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Transaction Type:</span> Voter Verification
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Transaction Hash:</span>
                    <div className="text-xs mt-1 font-mono bg-gray-100 p-1 rounded-md overflow-x-auto">
                      0x8f32d45a9e720a4d0e193ea21de9ee97e1971d2c3b7480cf
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  Wait time and volume predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <div className="text-xs text-gray-500">Current Wait</div>
                      <div className="text-lg font-bold">12 min</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-md">
                      <div className="text-xs text-gray-500">Predicted</div>
                      <div className="text-lg font-bold">9 min</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Best Time to Vote:</span>{' '}
                    3:00 PM - 4:00 PM (5 min wait)
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current operational status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Biometric Scanner</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Voter Database</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Connectivity</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}