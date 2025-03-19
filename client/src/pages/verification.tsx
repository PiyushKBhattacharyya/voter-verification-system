import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConnectionContext } from "@/App";

type Voter = {
  id: number;
  voterId: string;
  name: string;
  dateOfBirth: string;
  address: string;
  precinct: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: number | null;
};

export default function VerificationPage() {
  const [voterId, setVoterId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [specialCasesOpen, setSpecialCasesOpen] = useState(false);
  const [verifiedVoter, setVerifiedVoter] = useState<Voter | null>(null);
  const [checkInComplete, setCheckInComplete] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  
  const { isOffline } = useContext(ConnectionContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for stats (waiting count, processed count)
  const { data: queueStats } = useQuery({
    queryKey: ['/api/queue/stats'],
    queryFn: async () => {
      if (isOffline) {
        return { waiting: 12, inProgress: 2, completed: 47 };
      }
      const response = await fetch('/api/queue/stats');
      return response.json();
    }
  });

  // Verify voter mutation
  const verifyVoterMutation = useMutation({
    mutationFn: async (id: string) => {
      // For demo purposes, if in offline mode or ID starts with 1, return success
      if (isOffline || id.startsWith('1')) {
        // Simulate a mock response for offline mode or valid IDs
        const mockVoter: Voter = {
          id: 1,
          voterId: id,
          name: "Sarah Johnson",
          dateOfBirth: "05/12/1985",
          address: "123 Main St, Cityville",
          precinct: "East District 4",
          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null
        };
        return { voter: mockVoter };
      }

      const response = await fetch(`/api/voters/${id}`);
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }
      return { voter: await response.json() };
    },
    onSuccess: (data) => {
      setVerifiedVoter(data.voter);
      setIsVerifying(false);
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: (error as Error).message || "No voter record found with that ID",
        variant: "destructive"
      });
      setIsVerifying(false);
    }
  });

  // Check in voter mutation
  const checkInVoterMutation = useMutation({
    mutationFn: async (voterId: number) => {
      if (isOffline) {
        // Simulate check-in
        return { 
          success: true, 
          voter: verifiedVoter, 
          checkInTime: new Date().toLocaleTimeString()
        };
      }

      const response = await apiRequest('POST', `/api/voters/${voterId}/check-in`, {});
      if (!response.ok) {
        throw new Error(`Check-in failed: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCheckInComplete(true);
      setCheckInTime(data.checkInTime);
      
      // Update queue stats
      queryClient.invalidateQueries({ queryKey: ['/api/queue/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: (error as Error).message || "Failed to check in voter",
        variant: "destructive"
      });
    }
  });

  const handleVerifyVoter = () => {
    if (!voterId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voter ID",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    verifyVoterMutation.mutate(voterId);
  };

  const handleCheckInVoter = () => {
    if (verifiedVoter) {
      checkInVoterMutation.mutate(verifiedVoter.id);
    }
  };

  const handleVerifyAnotherVoter = () => {
    setVoterId("");
    setVerifiedVoter(null);
    setCheckInComplete(false);
    setCheckInTime("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Verification Form */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Voter Verification</h2>
        
        <div className="mb-5">
          <label htmlFor="voter-id" className="block text-sm font-medium text-neutral-700 mb-1">
            Enter Voter ID or Scan Barcode
          </label>
          <div className="mt-1 flex">
            <Input
              id="voter-id"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              className="flex-grow shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md p-2.5 border"
              placeholder="Enter ID number or scan barcode"
              disabled={isVerifying || checkInComplete}
            />
            <Button 
              variant="outline" 
              className="ml-3 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 focus:outline-none transition"
            >
              <span className="material-icons mr-1">qr_code_scanner</span>
              Scan
            </Button>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Enter the voter's ID number or use the scanner to read their barcode
          </p>
        </div>
        
        <div className="flex items-center">
          <Button 
            onClick={handleVerifyVoter}
            disabled={isVerifying || !voterId.trim() || checkInComplete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none transition"
          >
            Verify Voter
          </Button>
          <Button 
            variant="outline"
            onClick={() => setSpecialCasesOpen(!specialCasesOpen)}
            className="ml-4 inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none transition"
          >
            Special Cases
            <span className="material-icons ml-1" style={{ fontSize: '18px' }}>expand_more</span>
          </Button>
        </div>
        
        {/* Special Cases Panel */}
        {specialCasesOpen && (
          <div className="mt-5 border border-neutral-200 rounded-md bg-neutral-50 p-4">
            <h3 className="font-medium text-neutral-800 mb-3">Special Case Options</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 flex items-center transition">
                <span className="material-icons mr-2 text-neutral-600" style={{ fontSize: '20px' }}>verified_user</span>
                Provisional Ballot Processing
              </button>
              <button className="w-full text-left px-3 py-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 flex items-center transition">
                <span className="material-icons mr-2 text-neutral-600" style={{ fontSize: '20px' }}>help_outline</span>
                ID Verification Issues
              </button>
              <button className="w-full text-left px-3 py-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 flex items-center transition">
                <span className="material-icons mr-2 text-neutral-600" style={{ fontSize: '20px' }}>accessibility_new</span>
                Accessibility Assistance
              </button>
              <button className="w-full text-left px-3 py-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 flex items-center transition">
                <span className="material-icons mr-2 text-neutral-600" style={{ fontSize: '20px' }}>language</span>
                Language Support
              </button>
              <button className="w-full text-left px-3 py-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 flex items-center transition">
                <span className="material-icons mr-2 text-neutral-600" style={{ fontSize: '20px' }}>cancel</span>
                Address/Registration Challenge
              </button>
            </div>
          </div>
        )}
        
        {/* Loading Spinner */}
        {isVerifying && (
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-2 text-neutral-600">Verifying voter information...</p>
            </div>
          </div>
        )}
        
        {/* Verification Result */}
        {verifiedVoter && !checkInComplete && (
          <div className="mt-4 p-4 bg-success bg-opacity-10 border-l-4 border-success rounded">
            <h3 className="font-medium text-success text-lg">Voter Verified</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-neutral-500 text-sm">Name</p>
                <p className="font-medium">{verifiedVoter.name}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Date of Birth</p>
                <p className="font-medium">{verifiedVoter.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Address</p>
                <p className="font-medium">{verifiedVoter.address}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Precinct</p>
                <p className="font-medium">{verifiedVoter.precinct}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={handleCheckInVoter}
                disabled={checkInVoterMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
              >
                {checkInVoterMutation.isPending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">
                      <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
                    </span>
                    Processing...
                  </>
                ) : "Check In Voter"}
              </Button>
              <Button 
                variant="outline"
                onClick={handleVerifyAnotherVoter}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition"
              >
                Verify Another
              </Button>
            </div>
          </div>
        )}
        
        {/* Check-in Complete */}
        {checkInComplete && (
          <div className="mt-4 p-4 bg-success bg-opacity-10 border-l-4 border-success rounded">
            <div className="flex items-center">
              <span className="material-icons text-success mr-2">check_circle</span>
              <h3 className="font-medium text-success text-lg">Voter Successfully Checked In</h3>
            </div>
            <p className="mt-2">{verifiedVoter?.name} has been checked in at <span className="font-medium">{checkInTime}</span>.</p>
            <div className="mt-4">
              <Button 
                onClick={handleVerifyAnotherVoter}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
              >
                Verify Next Voter
              </Button>
            </div>
          </div>
        )}
        
        {/* Verification Failed */}
        {verifyVoterMutation.isError && !verifiedVoter && (
          <div className="mt-4 p-3 bg-error bg-opacity-10 border-l-4 border-error rounded">
            <h3 className="font-medium text-error text-lg">Verification Failed</h3>
            <p className="mt-1">No voter record found with ID: {voterId}</p>
            <div className="mt-3">
              <p className="text-neutral-700 font-medium">Suggested actions:</p>
              <ul className="list-disc ml-5 mt-1 text-neutral-700">
                <li>Verify the ID was entered correctly</li>
                <li>Check alternate identification</li>
                <li>Direct voter to help desk</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Help & Information Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Help & Information</h3>
        
        <div className="mb-5 border-b border-neutral-200 pb-4">
          <h4 className="font-medium text-neutral-700 mb-2">Quick Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-50 p-3 rounded-md">
              <p className="text-sm text-neutral-500">Voters Processed</p>
              <p className="text-2xl font-semibold text-primary">{queueStats?.completed || 0}</p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-md">
              <p className="text-sm text-neutral-500">Current Wait</p>
              <p className="text-2xl font-semibold text-primary">~12 min</p>
            </div>
          </div>
        </div>
        
        <div className="mb-5">
          <h4 className="font-medium text-neutral-700 mb-2">Common Issues</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="material-icons text-neutral-500 mr-2 mt-0.5" style={{ fontSize: '18px' }}>description</span>
              <a href="#" className="text-primary hover:underline">ID doesn't match registration</a>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-neutral-500 mr-2 mt-0.5" style={{ fontSize: '18px' }}>description</span>
              <a href="#" className="text-primary hover:underline">Voter not found in system</a>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-neutral-500 mr-2 mt-0.5" style={{ fontSize: '18px' }}>description</span>
              <a href="#" className="text-primary hover:underline">Name or address change</a>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-neutral-500 mr-2 mt-0.5" style={{ fontSize: '18px' }}>description</span>
              <a href="#" className="text-primary hover:underline">Scanning issues</a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-neutral-700 mb-2">Contact Support</h4>
          <div className="bg-neutral-50 p-3 rounded-md">
            <div className="flex items-center mb-2">
              <span className="material-icons text-neutral-600 mr-2">phone</span>
              <span className="font-medium">(555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-600 mr-2">sms</span>
              <span className="font-medium">Text "HELP" to 55512</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
