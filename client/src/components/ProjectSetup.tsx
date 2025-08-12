import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  repoUrl?: string;
  defaultBranch: string;
  settingsJson: {
    strictMode?: boolean;
    maxLines?: number;
    maxFiles?: number;
    forbiddenGlobs?: string[];
    styleFreeze?: boolean;
  };
  createdAt: string;
}

interface ProjectSetupProps {
  projectId: string;
  onSetupComplete?: () => void;
}

export default function ProjectSetup({ projectId, onSetupComplete }: ProjectSetupProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  }) as { data: Project | undefined, isLoading: boolean };

  // Initialize project structure mutation
  const initializeProjectMutation = useMutation({
    mutationFn: async () => {
      setIsInitializing(true);
      
      // Create basic project structure
      const response = await apiRequest('POST', `/api/projects/${projectId}/initialize`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project initialized",
        description: "Your project is ready to use"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      onSetupComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Initialization failed",
        description: error.message || "Failed to initialize project",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsInitializing(false);
    }
  });

  // Update project settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<Project['settingsJson']>) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/settings`, {
        settingsJson: { ...project?.settingsJson, ...settings }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: "Settings updated",
        description: "Project settings have been saved"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  const handleInitialize = () => {
    initializeProjectMutation.mutate();
  };

  const handleToggleSetting = (key: keyof Project['settingsJson'], value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-github-primary mx-auto mb-4"></div>
          <p className="text-github-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl text-github-text-secondary mb-4">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2 className="text-2xl font-semibold text-github-text mb-2">Project not found</h2>
        <p className="text-github-text-secondary">
          The project you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-github-surface border-github-border">
        <CardHeader>
          <CardTitle className="text-github-text flex items-center">
            <i className="fas fa-cog mr-3"></i>
            Project Setup: {project.name}
          </CardTitle>
          <CardDescription className="text-github-text-secondary">
            Configure your project settings and initialize the development environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-github-text">Project Name</Label>
              <Input 
                value={project.name} 
                readOnly 
                className="bg-github-bg border-github-border text-github-text" 
              />
            </div>
            <div>
              <Label className="text-github-text">Default Branch</Label>
              <Input 
                value={project.defaultBranch} 
                readOnly 
                className="bg-github-bg border-github-border text-github-text" 
              />
            </div>
          </div>

          {project.repoUrl && (
            <div>
              <Label className="text-github-text">Repository URL</Label>
              <Input 
                value={project.repoUrl} 
                readOnly 
                className="bg-github-bg border-github-border text-github-text" 
              />
            </div>
          )}

          <Separator className="bg-github-border" />

          {/* AI Agent Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-github-text">AI Agent Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-github-text">Strict Mode</Label>
                <p className="text-sm text-github-text-secondary">
                  Agent requires explicit approval for scope changes
                </p>
              </div>
              <Switch
                checked={project.settingsJson?.strictMode ?? true}
                onCheckedChange={(checked) => handleToggleSetting('strictMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-github-text">Style Freeze</Label>
                <p className="text-sm text-github-text-secondary">
                  Lock coding style patterns once established
                </p>
              </div>
              <Switch
                checked={project.settingsJson?.styleFreeze ?? false}
                onCheckedChange={(checked) => handleToggleSetting('styleFreeze', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-github-text">Max Lines per Session</Label>
                <Input 
                  type="number"
                  value={project.settingsJson?.maxLines ?? 1000}
                  onChange={(e) => updateSettingsMutation.mutate({ maxLines: parseInt(e.target.value) })}
                  className="bg-github-bg border-github-border text-github-text"
                />
              </div>
              <div>
                <Label className="text-github-text">Max Files per Session</Label>
                <Input 
                  type="number"
                  value={project.settingsJson?.maxFiles ?? 50}
                  onChange={(e) => updateSettingsMutation.mutate({ maxFiles: parseInt(e.target.value) })}
                  className="bg-github-bg border-github-border text-github-text"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-github-border" />

          {/* Status and Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-github-text">Project Status</h3>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-github-bg">
                <i className="fas fa-circle text-green-500 mr-2"></i>
                Ready
              </Badge>
              {project.repoUrl ? (
                <Badge variant="outline" className="bg-github-bg">
                  <i className="fas fa-code-branch mr-2"></i>
                  Git Repository
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-github-bg">
                  <i className="fas fa-folder mr-2"></i>
                  Local Project
                </Badge>
              )}
            </div>

            <Button 
              onClick={handleInitialize}
              disabled={isInitializing || initializeProjectMutation.isPending}
              className="bg-github-primary hover:bg-github-primary/90 text-white"
            >
              {isInitializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initializing...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Initialize Development Environment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}