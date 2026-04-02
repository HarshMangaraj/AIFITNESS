import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/use-auth";
import Login from "@/pages/Login";
import Index from "@/pages/Index"; // The new Landing page
import Dashboard from "@/pages/Dashboard";
import GeneratePlan from "@/pages/GeneratePlan";
import PlanDetail from "@/pages/PlanDetail";
import ProgressTracker from "@/pages/ProgressTracker";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Index} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/generate" component={GeneratePlan} />
      <Route path="/plans/:id/progress" component={ProgressTracker} />
      <Route path="/plans/:id" component={PlanDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
