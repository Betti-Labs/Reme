import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import IDE from "@/pages/ide";
import Templates from "@/pages/templates";
import Memory from "@/pages/memory";

// Placeholder pages for remaining navigation
const ProjectsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">All Projects - Coming Soon</h1></div>;
const RecentPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Recent Projects - Coming Soon</h1></div>;
const StarredPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Starred Projects - Coming Soon</h1></div>;
const SettingsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Settings - Coming Soon</h1></div>;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/templates" component={Templates} />
      <Route path="/memory" component={Memory} />
      <Route path="/recent" component={RecentPage} />
      <Route path="/starred" component={StarredPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/project/:id" component={IDE} />
      <Route path="/ide/:id" component={IDE} />
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
