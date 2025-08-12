import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import SpaceBackground from "@/components/SpaceBackground";
import Navigation from "@/components/Navigation";
import { 
  Search, 
  Plus, 
  Folder, 
  Calendar, 
  Code2, 
  GitBranch, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit3,
  ExternalLink,
  Star,
  StarOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  status: 'active' | 'archived' | 'template';
  isStarred: boolean;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
  gitBranch?: string;
  collaborators?: number;
}

const PROJECT_STATUSES = [
  { id: 'all', name: 'All Projects', count: 0 },
  { id: 'active', name: 'Active', count: 0 },
  { id: 'archived', name: 'Archived', count: 0 },
  { id: 'template', name: 'Templates', count: 0 },
];

export default function Projects() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects', selectedStatus, searchQuery],
    queryFn: async () => {
      let url = '/api/projects';
      const params = new URLSearchParams();
      
      if (selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest('GET', url);
      return response.json();
    }
  });

  // Create new project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string; language: string; framework?: string }) => {
      const response = await apiRequest('POST', '/api/projects', {
        body: JSON.stringify(projectData)
      });
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project created successfully",
        description: `${project.name} is ready to use`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setLocation(`/ide/${project.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest('DELETE', `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Project has been permanently deleted"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle star project
  const toggleStarMutation = useMutation({
    mutationFn: async ({ projectId, isStarred }: { projectId: string; isStarred: boolean }) => {
      await apiRequest('PATCH', `/api/projects/${projectId}`, {
        body: JSON.stringify({ isStarred: !isStarred })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  const handleCreateProject = () => {
    // For now, create a simple React TypeScript project
    createProjectMutation.mutate({
      name: `Project ${projects.length + 1}`,
      description: "A new project created from scratch",
      language: "typescript",
      framework: "react"
    });
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const handleToggleStar = (project: Project) => {
    toggleStarMutation.mutate({ projectId: project.id, isStarred: project.isStarred });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      typescript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      javascript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      python: "bg-green-500/20 text-green-300 border-green-500/30",
      java: "bg-red-500/20 text-red-300 border-red-500/30",
      go: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      rust: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };
    return colors[language.toLowerCase()] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const filteredProjects = projects.filter((project: Project) => {
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesSearch = !searchQuery.trim() || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
              <p className="text-gray-400 text-lg">
                Manage and organize your development projects
              </p>
            </div>
            <Button
              onClick={handleCreateProject}
              disabled={createProjectMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createProjectMutation.isPending ? "Creating..." : "New Project"}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by name, language, or description..."
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {PROJECT_STATUSES.map((status) => (
                  <Button
                    key={status.id}
                    variant={selectedStatus === status.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(status.id)}
                    className={
                      selectedStatus === status.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                        : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                    }
                  >
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardHeader>
                    <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                    <div className="w-2/3 h-3 bg-white/10 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-12 bg-white/10 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-white/10 rounded"></div>
                      <div className="w-20 h-6 bg-white/10 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: Project) => (
                <Card
                  key={project.id}
                  className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                  onClick={() => setLocation(`/ide/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                            {project.name}
                          </CardTitle>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(project);
                            }}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            {project.isStarred ? (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/80 backdrop-blur-xl border-white/10">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/ide/${project.id}`);
                          }}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in IDE
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="text-red-400 focus:text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Project Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(project.lastAccessed), { addSuffix: true })}
                      </div>
                      {project.gitBranch && (
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {project.gitBranch}
                        </div>
                      )}
                      {project.collaborators && project.collaborators > 1 && (
                        <div className="flex items-center gap-1">
                          <span>{project.collaborators} collaborators</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`text-xs ${getLanguageColor(project.language)}`}>
                        {project.language}
                      </Badge>
                      {project.framework && (
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          {project.framework}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Folder className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try adjusting your search terms.`
                  : "Create your first project to get started with development."}
              </p>
              <div className="flex gap-4 justify-center">
                {searchQuery && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("all");
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createProjectMutation.isPending ? "Creating..." : "Create New Project"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}