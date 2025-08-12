import { useState, useEffect } from "react";
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
import { Search, Code2, Download, Star, Eye, GitFork, Zap } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  downloads: number;
  stars: number;
  previewUrl?: string;
  repositoryUrl?: string;
  filesJson: { path: string; content: string }[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Code2 },
  { id: 'web', name: 'Web Apps', icon: Code2 },
  { id: 'api', name: 'APIs & Backend', icon: Zap },
  { id: 'mobile', name: 'Mobile', icon: Code2 },
  { id: 'ai', name: 'AI & ML', icon: Zap },
  { id: 'game', name: 'Games', icon: Code2 },
  { id: 'utility', name: 'Utilities', icon: Code2 },
];

export default function Templates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates', selectedCategory, searchQuery],
    queryFn: async () => {
      let url = '/api/templates';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
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

  // Create project from template
  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/create-project`);
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project created from template",
        description: `${project.name} has been created successfully`
      });
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

  const handleCreateFromTemplate = (templateId: string) => {
    createFromTemplateMutation.mutate(templateId);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, queryClient]);

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Project Templates</h1>
            <p className="text-gray-400 text-lg">
              Start your project with professionally crafted templates
            </p>
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
                  placeholder="Search templates by name, technology, or use case..."
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                          : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardHeader>
                    <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                    <div className="w-2/3 h-3 bg-white/10 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-20 bg-white/10 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-white/10 rounded"></div>
                      <div className="w-20 h-6 bg-white/10 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: Template) => (
                <Card
                  key={template.id}
                  data-testid="template-card"
                  className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 group-hover:text-blue-300 transition-colors">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {template.stars}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {template.author}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {template.category}
                      </Badge>
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/20 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCreateFromTemplate(template.id)}
                        disabled={createFromTemplateMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm"
                      >
                        <Code2 className="w-4 h-4 mr-2" />
                        {createFromTemplateMutation.isPending ? "Creating..." : "Use Template"}
                      </Button>
                      
                      {template.previewUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(template.previewUrl, '_blank')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {template.repositoryUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(template.repositoryUrl, '_blank')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <GitFork className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Search className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">No templates found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No templates match "${searchQuery}". Try adjusting your search terms.`
                  : "No templates available in this category."}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}