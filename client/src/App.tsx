import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import EventsPage from "@/pages/events";
import EventDetailPage from "@/pages/event-detail";
import GroupsPage from "@/pages/groups";
import GroupDetailPage from "@/pages/group-detail";
import ContactPage from "@/pages/contact";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={EventsPage} />
      <Route path="/events/:id" component={EventDetailPage} />
      <Route path="/groups" component={GroupsPage} />
      <Route path="/groups/:id" component={GroupDetailPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
