import { useLocation, Link } from "wouter";

export default function Navigation() {
  const [location] = useLocation();
  
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          <Link href="/verification">
            <a className={`px-5 py-3 font-medium text-sm focus:outline-none transition ${location === "/" || location === "/verification" ? 'bg-primary text-white' : 'bg-white text-neutral-600'}`}>
              Voter Verification
            </a>
          </Link>
          <Link href="/queue">
            <a className={`px-5 py-3 font-medium text-sm focus:outline-none transition ${location === "/queue" ? 'bg-primary text-white' : 'bg-white text-neutral-600'}`}>
              Queue Management
            </a>
          </Link>
          <Link href="/dashboard">
            <a className={`px-5 py-3 font-medium text-sm focus:outline-none transition ${location === "/dashboard" ? 'bg-primary text-white' : 'bg-white text-neutral-600'}`}>
              Status Dashboard
            </a>
          </Link>
          <Link href="/reports">
            <a className={`px-5 py-3 font-medium text-sm focus:outline-none transition ${location === "/reports" ? 'bg-primary text-white' : 'bg-white text-neutral-600'}`}>
              Reports
            </a>
          </Link>
          <Link href="/enhancements">
            <a className={`px-5 py-3 font-medium text-sm focus:outline-none transition ${location === "/enhancements" ? 'bg-primary text-white' : 'bg-white text-neutral-600'}`}>
              Enhancements
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
