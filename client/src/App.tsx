import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import EventsPage from "@/pages/events";
import EventDetailPage from "@/pages/event-detail";
import GroupsPage from "@/pages/groups";
import GroupDetailPage from "@/pages/group-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/events/:id" component={EventDetailPage} />
      <Route path="/groups" component={GroupsPage} />
      <Route path="/groups/:id" component={GroupDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
