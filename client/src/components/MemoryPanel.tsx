import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface MemoryPanelProps {
  projectId: string;
}

export default function MemoryPanel({ projectId }: MemoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: memoryNotes } = useQuery({
    queryKey: ['/api/memory', projectId, 'search'],
    queryFn: async () => {
      const response = await fetch(`/api/memory/${projectId}/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: !!projectId
  });

  // Mock data for demonstration
  const mockMemoryNotes = [
    {
      id: "1",
      content: "Added ShareModal component with copy functionality. Used clipboard API for better UX.",
      tags: ["component", "modal", "clipboard"],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2", 
      content: "Implemented strict scope validation in agent service. Agent now asks permission before expanding scope beyond initial request.",
      tags: ["agent", "validation", "scope"],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "3",
      content: "Set up Monaco editor with GitHub dark theme. Configured TypeScript syntax highlighting and bracket pair colorization.",
      tags: ["editor", "monaco", "theme", "typescript"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: "4",
      content: "Created WebSocket connection for real-time agent communication. Messages broadcast to all connected clients.",
      tags: ["websocket", "realtime", "communication"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const filteredNotes = searchQuery 
    ? mockMemoryNotes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mockMemoryNotes;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-github-border/50">
        <h3 className="text-sm font-medium mb-3">Project Memory</h3>
        <div className="flex space-x-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="flex-1 bg-github-bg border-github-border text-github-text placeholder:text-github-text-secondary"
          />
          <Button 
            size="sm"
            variant="outline"
            className="border-github-border hover:bg-github-border/50"
          >
            <i className="fas fa-search" />
          </Button>
        </div>
      </div>

      {/* Memory Categories */}
      <div className="p-4 border-b border-github-border/50">
        <div className="flex flex-wrap gap-2 text-xs">
          <Button 
            size="sm" 
            variant="outline"
            className="h-6 px-2 border-github-border text-github-text-secondary hover:text-github-text"
          >
            Recent
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-6 px-2 border-github-border text-github-text-secondary hover:text-github-text"
          >
            Sessions
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-6 px-2 border-github-border text-github-text-secondary hover:text-github-text"
          >
            Decisions
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-6 px-2 border-github-border text-github-text-secondary hover:text-github-text"
          >
            Style Guide
          </Button>
        </div>
      </div>

      {/* Memory Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              className="p-3 border border-github-border rounded-lg hover:bg-github-border/20 transition-colors cursor-pointer"
            >
              <p className="text-sm text-github-text mb-2">
                {note.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge 
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-github-primary/20 text-github-primary hover:bg-github-primary/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-github-text-secondary">
                  {formatTimeAgo(note.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center text-github-text-secondary py-8">
              <i className="fas fa-brain text-2xl mb-2 opacity-50" />
              <p className="text-sm">No memories found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try different search terms</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-github-border">
        <Button 
          size="sm"
          className="w-full bg-github-primary hover:bg-github-primary/90 text-white"
        >
          <i className="fas fa-plus mr-2" />
          Add Note
        </Button>
      </div>
    </div>
  );
}
