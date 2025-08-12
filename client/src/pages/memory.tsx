import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpaceBackground from "@/components/SpaceBackground";
import Navigation from "@/components/Navigation";
import { Search, Brain, Plus, Tag, Link as LinkIcon, Calendar, Zap } from "lucide-react";
import { format } from "date-fns";

interface MemoryNote {
  id: string;
  content: string;
  tags: string[];
  links: string[];
  session_id: string;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
}

interface MemoryStats {
  total_notes: number;
  hot_memory_count: number;
  warm_memory_count: number;
  cold_memory_count: number;
  most_used_tags: string[];
}

export default function Memory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ content: "", tags: "", links: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch memory notes
  const { data: memoryData, isLoading } = useQuery({
    queryKey: ['/api/memory', searchQuery, selectedTags],
    queryFn: async () => {
      let url = '/api/memory/search';
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim());
      }
      if (selectedTags.length > 0) {
        params.set('tags', selectedTags.join(','));
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest('GET', url);
      return response.json();
    }
  });

  // Fetch memory stats
  const { data: stats } = useQuery({
    queryKey: ['/api/memory/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/memory/stats');
      return response.json();
    }
  });

  // Create memory note
  const createNoteMutation = useMutation({
    mutationFn: async (data: { content: string; tags: string[]; links: string[] }) => {
      const response = await apiRequest('POST', '/api/memory/notes', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Memory note created",
        description: "Your note has been added to the knowledge base"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/memory'] });
      setIsCreateDialogOpen(false);
      setNewNote({ content: "", tags: "", links: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create note",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateNote = () => {
    if (!newNote.content.trim()) return;
    
    const tags = newNote.tags.split(',').map(t => t.trim()).filter(Boolean);
    const links = newNote.links.split(',').map(l => l.trim()).filter(Boolean);
    
    createNoteMutation.mutate({
      content: newNote.content,
      tags,
      links
    });
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory'] });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, queryClient]);

  const getMemoryTier = (score?: number): { tier: string; color: string } => {
    if (!score) return { tier: 'Cold', color: 'text-blue-400' };
    if (score > 0.8) return { tier: 'Hot', color: 'text-red-400' };
    if (score > 0.6) return { tier: 'Warm', color: 'text-yellow-400' };
    return { tier: 'Cold', color: 'text-blue-400' };
  };

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI Memory System</h1>
            <p className="text-gray-400 text-lg">
              Your intelligent knowledge base that learns and remembers across sessions
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <div>
                      <CardTitle className="text-white text-lg">{stats.total_notes}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Total Notes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-red-400" />
                    <div>
                      <CardTitle className="text-white text-lg">{stats.hot_memory_count}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Hot Memory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                    <div>
                      <CardTitle className="text-white text-lg">{stats.warm_memory_count}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Warm Memory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                    <div>
                      <CardTitle className="text-white text-lg">{stats.cold_memory_count}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">Cold Memory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Search and Controls */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your memory by content, tags, or concepts..."
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Memory Note
              </Button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-gray-400">Filtered by:</span>
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-gray-400 hover:text-white"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Popular Tags */}
          {stats?.most_used_tags?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.most_used_tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "border-white/20 text-gray-400 hover:border-white/40"
                    }`}
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Memory Notes */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardHeader>
                    <div className="w-full h-20 bg-white/10 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-white/10 rounded"></div>
                      <div className="w-20 h-6 bg-white/10 rounded"></div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : memoryData?.notes?.length ? (
            <div className="space-y-4">
              {memoryData.notes.map((note: MemoryNote) => {
                const memoryTier = getMemoryTier(note.relevance_score);
                return (
                  <Card
                    key={note.id}
                    className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${memoryTier.color} bg-transparent border-current`}>
                              {memoryTier.tier} Memory
                            </Badge>
                            {note.relevance_score && (
                              <span className="text-xs text-gray-500">
                                {Math.round(note.relevance_score * 100)}% relevance
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-white text-base leading-relaxed">
                            {note.content}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {/* Tags and Links */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-white/20 text-gray-400 cursor-pointer hover:border-blue-500/50"
                            onClick={() => handleTagClick(tag)}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        
                        {note.links.map((link) => (
                          <Badge
                            key={link}
                            variant="outline"
                            className="text-xs border-green-500/20 text-green-400"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {link}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(note.created_at), 'MMM d, yyyy')}
                          </div>
                          <div>Session: {note.session_id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Brain className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">No memory notes found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No memories match "${searchQuery}". Try different search terms.`
                  : "Start adding memory notes to build your AI knowledge base."}
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Memory Note
              </Button>
            </div>
          )}

          {/* Create Memory Note Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add Memory Note</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new memory note that the AI can learn from and reference
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Content *
                  </label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe what you learned, decisions made, code patterns, or important insights..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 min-h-32"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={newNote.tags}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="react, database, bug-fix, architecture..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Related Links (comma-separated)
                  </label>
                  <Input
                    value={newNote.links}
                    onChange={(e) => setNewNote(prev => ({ ...prev, links: e.target.value }))}
                    placeholder="project-name, file.js, function-name..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNote}
                  disabled={createNoteMutation.isPending || !newNote.content.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}