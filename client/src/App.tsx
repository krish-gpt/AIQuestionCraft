import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreateSurvey from "@/pages/create-survey";
import Survey from "@/pages/survey";
import Analytics from "@/pages/analytics";
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "./lib/protected-route";
import PricingPage from "./pages/pricing-page";

function Router() {
  return (
    <div className="min-h-screen flex justify-center bg-background">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/pricing" component={PricingPage} />
        <ProtectedRoute path="/dashboard" component={HomePage} />
        <ProtectedRoute path="/create" component={CreateSurvey} />
        <ProtectedRoute
          path="/analytics/:id"
          component={({ params }) => <Analytics params={params} />}
        />
        <Route path="/survey/:id" component={Survey} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
