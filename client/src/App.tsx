import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, createContext } from "react";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import VerificationPage from "@/pages/verification";
import QueuePage from "@/pages/queue";
import DashboardPage from "@/pages/dashboard";
import ReportsPage from "@/pages/reports";
import EnhancementsPage from "@/pages/enhancements";
import NotFound from "@/pages/not-found";

// Context for connection status across the app
export const ConnectionContext = createContext<{
  isOffline: boolean;
  setIsOffline: (value: boolean) => void;
}>({
  isOffline: false,
  setIsOffline: () => {},
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-6 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={VerificationPage} />
        <Route path="/verification" component={VerificationPage} />
        <Route path="/queue" component={QueuePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/enhancements" component={EnhancementsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [isOffline, setIsOffline] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionContext.Provider value={{ isOffline, setIsOffline }}>
        <Router />
        <Toaster />
      </ConnectionContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
