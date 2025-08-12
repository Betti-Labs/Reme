import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { PlusCircle, Code, GitBranch, Calendar, FolderOpen, Star, Clock, Zap, Brain, Sparkles, Terminal, ChevronRight, Plus } from "lucide-react";
import { useLocation } from "wouter";
import ProjectSetup from "@/components/ProjectSetup";
import SpaceBackground from "@/components/SpaceBackground";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; repoUrl?: string; defaultBranch?: string }) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: (project: Project) => {
      toast({
        title: "Project created",
        description: `${project.name} has been created successfully`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setSelectedProject(project.id);
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateProject = (data: { name: string; repoUrl?: string; defaultBranch?: string }) => {
    createProjectMutation.mutate(data);
  };

  const openProject = (projectId: string) => {
    setLocation(`/ide/${projectId}`);
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Setting up project...</h1>
          <Button onClick={() => openProject(selectedProject)}>Continue to IDE</Button>
          <Button variant="outline" onClick={() => setSelectedProject(null)} className="ml-4">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-github-primary/10 to-github-accent/10 border border-github-primary/30 rounded-md px-6 py-2 mb-6 font-mono">
              <Terminal className="w-4 h-4 text-github-primary animate-pulse" />
              <span className="text-github-primary text-sm font-bold tracking-wide">TERMINAL-BASED DEVELOPMENT</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-github-text via-github-primary to-github-accent bg-clip-text text-transparent font-mono">
              {'> REME_'}
            </h1>
            
            <p className="text-lg text-github-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed font-mono">
              $ ./reme --init<br/>
              {'>> Initializing advanced IDE with AI agent'}<br/>
              {'>> Memory persistence: ENABLED'}<br/>
              {'>> Strict scope validation: ACTIVE'}<br/>
              {'>> Ready for development protocols...'}<br/>
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-github-primary to-github-accent text-black px-8 py-6 text-lg font-bold rounded-md shadow-2xl hover:shadow-github-primary/25 transition-all duration-300 transform hover:scale-105 font-mono tracking-wide"
              >
                <Terminal className="w-5 h-5 mr-2" />
                ./new_project --init
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-github-border text-github-text hover:bg-github-primary/10 hover:border-github-primary px-8 py-6 text-lg font-bold rounded-md backdrop-blur-sm bg-github-surface/20 font-mono tracking-wide"
              >
                <Code className="w-5 h-5 mr-2" />
                ./browse --templates
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-github-surface/40 backdrop-blur-xl border-github-border hover:border-github-primary/50 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-github-primary to-github-accent rounded-md group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-github-text text-lg font-mono">./memory_core</CardTitle>
                    <CardDescription className="text-github-text-secondary font-mono text-sm">
                      AI agent remembers coding patterns
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-github-surface/40 backdrop-blur-xl border-github-border hover:border-github-accent/50 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-github-accent to-github-success rounded-md group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-github-text text-lg font-mono">./strict_scope</CardTitle>
                    <CardDescription className="text-github-text-secondary font-mono text-sm">
                      Controlled AI modifications only
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-green-500/50 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Git Integration</CardTitle>
                    <CardDescription className="text-gray-400">
                      Advanced version control
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Projects Section */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Projects</h2>
                <p className="text-gray-400">Continue working on your development projects</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:border-white/50 bg-black/20">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:border-white/50 bg-black/20">
                  <Star className="w-4 h-4 mr-2" />
                  Starred
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                    <CardHeader>
                      <div className="w-full h-4 bg-white/10 rounded"></div>
                      <div className="w-2/3 h-3 bg-white/10 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-20 bg-white/10 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects && (projects as any[]).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(projects as Project[]).map((project: Project) => (
                  <Card 
                    key={project.id} 
                    className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105"
                    onClick={() => openProject(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform border border-blue-500/20">
                            <FolderOpen className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                              {project.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                <GitBranch className="w-3 h-3 mr-1" />
                                {project.defaultBranch || 'main'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.repoUrl && (
                          <div className="text-sm text-gray-400 truncate bg-white/5 rounded-lg px-3 py-2">
                            📁 {project.repoUrl}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            Created recently
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-400">Active</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <FolderOpen className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No projects yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Create your first project to start building with Reme's intelligent development environment and AI-powered assistance
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </div>

          {/* Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Project</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up a new development project with Reme's intelligent features
                </DialogDescription>
              </DialogHeader>
              <CreateProjectForm onSubmit={handleCreateProject} isLoading={createProjectMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

// Create Project Form Component
function CreateProjectForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    repoUrl: '',
    defaultBranch: 'main'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name.trim(),
        repoUrl: formData.repoUrl.trim() || undefined,
        defaultBranch: formData.defaultBranch.trim() || 'main'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3 text-white">
          Project Name *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="my-awesome-project"
          required
          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-3 text-white">
          Git Repository URL (Optional)
        </label>
        <Input
          value={formData.repoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
          placeholder="https://github.com/user/repo.git"
          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-white">
          Default Branch
        </label>
        <Input
          value={formData.defaultBranch}
          onChange={(e) => setFormData(prev => ({ ...prev, defaultBranch: e.target.value }))}
          placeholder="main"
          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      <DialogFooter>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.name.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  );
}