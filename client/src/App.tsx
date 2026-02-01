import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Savings from "@/pages/Savings";
import Contacts from "@/pages/Contacts";
import Settings from "@/pages/Settings";
import { setupNotificationCheck } from "@/lib/notifications";
import { getDB } from "@/lib/db";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/savings" component={Savings} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    getDB().then(() => {
      console.log('IndexedDB initialized');
    });
    
    setupNotificationCheck();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Navigation />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
