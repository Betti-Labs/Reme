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
import Projects from "@/pages/projects";
import Recent from "@/pages/recent";
import Starred from "@/pages/starred";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/templates" component={Templates} />
      <Route path="/memory" component={Memory} />
      <Route path="/recent" component={Recent} />
      <Route path="/starred" component={Starred} />
      <Route path="/settings" component={Settings} />
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
