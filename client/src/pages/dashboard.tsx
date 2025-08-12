import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; repoUrl?: string }) => {
      const response = await apiRequest('POST', '/api/projects', {
        name: data.name,
        repoUrl: data.repoUrl || null,
        defaultBranch: 'main',
        settingsJson: {
          strictMode: true,
          maxLines: 1000,
          maxFiles: 50,
          forbiddenGlobs: ['node_modules/**', '.git/**'],
          styleFreeze: false
        }
      });
      return response.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreateDialogOpen(false);
      setProjectName("");
      setRepoUrl("");
      toast({
        title: "Project created",
        description: `${project.name} has been created successfully`
      });
      // Navigate to the new project
      navigate(`/project/${project.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive"
      });
      return;
    }
    createProjectMutation.mutate({ name: projectName, repoUrl });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-github-bg text-github-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-github-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-github-bg text-github-text">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-github-text mb-2">
              Welcome to <span className="text-github-primary">Reme</span>
            </h1>
            <p className="text-github-text-secondary text-lg">
              A better web IDE with intelligent AI assistance
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-github-primary hover:bg-github-primary/90 text-white">
                <i className="fas fa-plus mr-2"></i>
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-github-surface border-github-border">
              <DialogHeader>
                <DialogTitle className="text-github-text">Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-github-text">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                    className="bg-github-bg border-github-border text-github-text"
                  />
                </div>
                <div>
                  <Label htmlFor="repo-url" className="text-github-text">Repository URL (Optional)</Label>
                  <Input
                    id="repo-url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo.git"
                    className="bg-github-bg border-github-border text-github-text"
                  />
                  <p className="text-sm text-github-text-secondary mt-1">
                    Leave empty to create a new repository
                  </p>
                </div>
                <Button 
                  onClick={handleCreateProject} 
                  disabled={createProjectMutation.isPending}
                  className="w-full bg-github-primary hover:bg-github-primary/90"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projects && Array.isArray(projects) && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card 
                key={project.id} 
                className="bg-github-surface border-github-border hover:border-github-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-github-text flex items-center justify-between">
                    {project.name}
                    <Badge variant="secondary" className="bg-github-bg">
                      {project.defaultBranch || 'main'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-github-text-secondary">
                    {project.repoUrl ? (
                      <span className="flex items-center">
                        <i className="fas fa-code-branch mr-2"></i>
                        {project.repoUrl}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="fas fa-folder mr-2"></i>
                        Local project
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-github-text-secondary">
                    <span>
                      Created {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <div className="flex items-center space-x-2">
                      {project.settingsJson?.strictMode && (
                        <Badge variant="outline" className="text-xs">
                          Strict Mode
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl text-github-text-secondary mb-4">
              <i className="fas fa-folder-open"></i>
            </div>
            <h2 className="text-2xl font-semibold text-github-text mb-2">No projects yet</h2>
            <p className="text-github-text-secondary mb-6">
              Create your first project to get started with Reme
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-github-primary hover:bg-github-primary/90 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Your First Project
            </Button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 border-t border-github-border pt-16">
          <h2 className="text-2xl font-semibold text-github-text mb-8 text-center">
            Why Choose Reme?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl text-github-primary mb-4">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-lg font-semibold text-github-text mb-2">Intelligent AI Agent</h3>
              <p className="text-github-text-secondary">
                Strict scope management ensures the AI only touches what you explicitly request
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl text-github-primary mb-4">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-lg font-semibold text-github-text mb-2">Project Memory</h3>
              <p className="text-github-text-secondary">
                Comprehensive memory system remembers your coding patterns and project history
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl text-github-primary mb-4">
                <i className="fas fa-code-branch"></i>
              </div>
              <h3 className="text-lg font-semibold text-github-text mb-2">Git Integration</h3>
              <p className="text-github-text-secondary">
                Seamless Git operations with real-time diff visualization and approval workflow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}