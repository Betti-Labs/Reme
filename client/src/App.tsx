import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import IDE from "@/pages/ide";

// Placeholder pages for navigation
const ProjectsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Projects Page - Coming Soon</h1></div>;
const TemplatesPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Templates Page - Coming Soon</h1></div>;
const MemoryPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Memory Page - Coming Soon</h1></div>;
const RecentPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Recent Page - Coming Soon</h1></div>;
const StarredPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Starred Page - Coming Soon</h1></div>;
const SettingsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1 className="text-4xl">Settings Page - Coming Soon</h1></div>;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/memory" component={MemoryPage} />
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
