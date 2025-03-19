import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, Scan, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Voter } from '@shared/schema';

interface BiometricData {
  id: number;
  voterId: number;
  type: string;
  dataReference: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  verifiedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BiometricVerificationProps {
  voter: Voter;
  onVerified: () => void;
}

export default function BiometricVerification({ voter, onVerified }: BiometricVerificationProps) {
  const [activeTab, setActiveTab] = useState<string>('fingerprint');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [biometricData, setBiometricData] = useState<BiometricData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const fetchBiometricData = async () => {
    try {
      const response = await apiRequest("GET", `/api/biometrics/voter/${voter.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setBiometricData(data);
        setIsVerified(data.verified);
        // Switch to the appropriate tab based on the data type
        if (data.type === 'facial_recognition') {
          setActiveTab('facial');
        } else {
          setActiveTab('fingerprint');
        }
      } else {
        // If no biometric data exists yet, create it
        if (response.status === 404) {
          const newBiometricData = await createBiometricData();
          if (newBiometricData) {
            setBiometricData(newBiometricData);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error fetching biometric data');
        }
      }
    } catch (err) {
      setError('Network error: Unable to fetch biometric data');
      console.error(err);
    }
  };
  
  const createBiometricData = async () => {
    try {
      const type = activeTab === 'facial' ? 'facial_recognition' : 'fingerprint';
      const response = await apiRequest('POST', '/api/biometrics', {
        voterId: voter.id,
        type,
        dataReference: `${type}_data_ref_${voter.id}`
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Biometric Data Created',
          description: `${type.replace('_', ' ')} data created successfully.`,
        });
        return data;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error creating biometric data');
        return null;
      }
    } catch (err) {
      setError('Network error: Unable to create biometric data');
      console.error(err);
      return null;
    }
  };
  
  const startBiometricScan = async () => {
    setError(null);
    setIsScanning(true);
    
    // If we don't have biometric data yet, fetch it
    if (!biometricData) {
      await fetchBiometricData();
    }
    
    // Simulate biometric scanning process
    setTimeout(() => {
      setIsScanning(false);
      // In a real app, this would involve actual biometric scanning
      // For the demo, we'll just simulate successful verification
      if (biometricData && !biometricData.verified) {
        verifyBiometric();
      } else if (biometricData && biometricData.verified) {
        toast({
          title: 'Already Verified',
          description: 'This voter has already been verified.',
        });
        setIsVerified(true);
      } else {
        setError('No biometric data available. Please try again.');
      }
    }, 2000);
  };
  
  const verifyBiometric = async () => {
    if (!biometricData) return;
    
    try {
      const response = await apiRequest('PUT', `/api/biometrics/${biometricData.id}/verify`);
      
      if (response.ok) {
        const data = await response.json();
        setBiometricData(data);
        setIsVerified(true);
        toast({
          title: 'Verification Successful',
          description: 'Biometric verification completed successfully.',
        });
        onVerified();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error verifying biometric data');
      }
    } catch (err) {
      setError('Network error: Unable to verify biometric data');
      console.error(err);
    }
  };
  
  React.useEffect(() => {
    // Fetch biometric data when component mounts
    fetchBiometricData();
  }, [voter.id]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Biometric Verification
          {isVerified ? (
            <Badge variant="success" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Pending Verification
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verify voter identity using biometric authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fingerprint" className="flex items-center">
              <Fingerprint className="mr-2 h-4 w-4" />
              Fingerprint
            </TabsTrigger>
            <TabsTrigger value="facial" className="flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              Facial Recognition
            </TabsTrigger>
          </TabsList>
          <TabsContent value="fingerprint" className="space-y-4">
            <div className="flex flex-col items-center p-4 border rounded-md">
              <Fingerprint className={`h-24 w-24 ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
              <p className="mt-4 text-center">
                {isScanning ? 'Scanning fingerprint...' : 'Place finger on scanner to verify identity'}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="facial" className="space-y-4">
            <div className="flex flex-col items-center p-4 border rounded-md">
              <Camera className={`h-24 w-24 ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
              <p className="mt-4 text-center">
                {isScanning ? 'Scanning face...' : 'Position face in front of camera to verify identity'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab(activeTab === 'fingerprint' ? 'facial' : 'fingerprint')}>
          Switch Method
        </Button>
        <Button 
          onClick={startBiometricScan} 
          disabled={isScanning || isVerified}
          className={isVerified ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {isScanning ? (
            <>
              <Scan className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : isVerified ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verified
            </>
          ) : (
            'Start Scan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}