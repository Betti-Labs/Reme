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
  Star, 
  StarOff, 
  Folder, 
  Clock, 
  Code2, 
  GitBranch, 
  MoreVertical,
  ExternalLink,
  Edit3,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface StarredProject {
  id: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  status: 'active' | 'archived' | 'template';
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
  gitBranch?: string;
  collaborators?: number;
  starredAt: string;
}

export default function Starred() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch starred projects
  const { data: starredProjects = [], isLoading } = useQuery({
    queryKey: ['/api/projects/starred', searchQuery],
    queryFn: async () => {
      let url = '/api/projects/starred';
      if (searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      
      // Mock data for now - in production this would fetch from API
      return [
        {
          id: 'star1',
          name: 'AI Chat Assistant',
          description: 'Advanced chatbot with OpenAI integration, real-time responses, and conversation memory',
          language: 'typescript',
          framework: 'nextjs',
          status: 'active',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          gitBranch: 'feature/memory-system',
          collaborators: 3,
          starredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
        },
        {
          id: 'star2',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with payments, inventory management, and admin dashboard',
          language: 'typescript',
          framework: 'react',
          status: 'active',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          gitBranch: 'main',
          collaborators: 5,
          starredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
        },
        {
          id: 'star3',
          name: 'Data Analytics Dashboard',
          description: 'Interactive dashboard with charts, real-time data visualization, and export features',
          language: 'python',
          framework: 'streamlit',
          status: 'active',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), // 3 weeks ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          gitBranch: 'develop',
          collaborators: 2,
          starredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: 'star4',
          name: 'Mobile Banking App',
          description: 'Secure mobile banking application with biometric auth, transactions, and account management',
          language: 'javascript',
          framework: 'react-native',
          status: 'active',
          lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          gitBranch: 'release/v2.1',
          collaborators: 8,
          starredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() // 10 days ago
        }
      ].filter(project => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return project.name.toLowerCase().includes(query) ||
               project.description.toLowerCase().includes(query) ||
               project.language.toLowerCase().includes(query) ||
               (project.framework && project.framework.toLowerCase().includes(query));
      });
    }
  });

  // Remove star from project
  const unstarProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest('PATCH', `/api/projects/${projectId}`, {
        body: JSON.stringify({ isStarred: false })
      });
    },
    onSuccess: (_, projectId) => {
      toast({
        title: "Removed from starred",
        description: "Project has been removed from your starred list"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/starred'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unstar project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUnstarProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Remove "${projectName}" from your starred projects?`)) {
      unstarProjectMutation.mutate(projectId);
    }
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

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                Starred Projects
              </h1>
              <p className="text-gray-400 text-lg">
                Quick access to your favorite and most important projects
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{starredProjects.length}</p>
              <p className="text-sm text-gray-400">Starred Projects</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your starred projects by name, language, or description..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Starred Projects Grid */}
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
          ) : starredProjects.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-black/40 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-yellow-500/10 cursor-pointer relative overflow-hidden"
                  onClick={() => setLocation(`/ide/${project.id}`)}
                >
                  {/* Star indicator */}
                  <div className="absolute top-4 right-4 z-10">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 group-hover:text-yellow-300 transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white ml-2">
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
                              handleUnstarProject(project.id, project.name);
                            }}
                            className="text-yellow-400 focus:text-yellow-300"
                          >
                            <StarOff className="w-4 h-4 mr-2" />
                            Remove from starred
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
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </div>
                      <div>
                        ⭐ {formatDistanceToNow(new Date(project.starredAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">
                {searchQuery ? "No starred projects found" : "No starred projects yet"}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No starred projects match "${searchQuery}". Try adjusting your search terms.`
                  : "Star your favorite projects for quick access. Click the star icon on any project to add it here."}
              </p>
              <div className="flex gap-4 justify-center">
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  onClick={() => setLocation('/projects')}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Browse All Projects
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}