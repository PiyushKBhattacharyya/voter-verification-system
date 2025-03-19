import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConnectionContext } from "@/App";

export default function Header() {
  const { isOffline, setIsOffline } = useContext(ConnectionContext);

  const { data: user } = useQuery({
    queryKey: ['/api/users/current'],
    queryFn: async () => {
      if (isOffline) {
        return { fullName: "Alex Thomas", role: "poll_worker" };
      }
      return fetch('/api/users/current').then(res => res.json());
    }
  });

  const handleToggleOfflineMode = () => {
    setIsOffline(!isOffline);

    // In a real app, we would also send a request to the server
    // to update the connection status
    if (!isOffline) {
      fetch('/api/connection-status/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected: false })
      });
    } else {
      fetch('/api/connection-status/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected: true })
      });
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="material-icons text-primary text-3xl">how_to_vote</span>
            <div className="ml-2">
              <h1 className="text-xl font-semibold text-neutral-800">PollVerify</h1>
              <p className="text-sm text-neutral-500">Voter Verification System</p>
            </div>
          </div>
          
          <span id="connection-status" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOffline ? 'bg-warning text-white' : 'bg-success text-white'}`}>
            {isOffline ? 'Offline Mode' : 'Connected'}
          </span>
          
          {isOffline && (
            <div id="offline-indicator" className="bg-warning bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-xs font-medium flex items-center text-neutral-700">
                <span className="material-icons text-warning mr-1" style={{ fontSize: '16px' }}>cloud_off</span>
                Working Offline - Data will sync when connection is restored
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <span className="text-sm text-neutral-700 mr-2">Offline Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isOffline}
                onChange={handleToggleOfflineMode}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
            </label>
          </div>
          
          <div className="flex items-center">
            <span className="material-icons text-neutral-500 mr-1">schedule</span>
            <span className="text-sm text-neutral-600">
              Election Day: 7:00 AM - 8:00 PM
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="material-icons text-neutral-500 mr-1">person</span>
            <span className="text-sm text-neutral-600">
              Poll Worker: {user?.fullName || 'Loading...'}
            </span>
          </div>
          
          <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded text-sm font-medium transition flex items-center">
            <span className="material-icons mr-1" style={{ fontSize: '18px' }}>help_outline</span>
            Help
          </button>
        </div>
      </div>
    </header>
  );
}
