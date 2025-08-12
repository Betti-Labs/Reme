import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface AgentPanelProps {
  projectId: string;
  sessions: any[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
}

export default function AgentPanel({ sessions, isConnected, onSendMessage }: AgentPanelProps) {
  const [message, setMessage] = useState("");
  const [proposedChanges] = useState([
    {
      id: "1",
      file: "ShareModal.tsx",
      changes: "+12 -0",
      type: "success"
    },
    {
      id: "2", 
      file: "clipboard.ts",
      changes: "+8 -0",
      type: "success"
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Session Status */}
      <div className="p-4 border-b border-github-border/50">
        <div className="flex items-center space-x-2 mb-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-github-success animate-pulse" : "bg-github-text-secondary"
          )} />
          <span className="text-sm font-medium">
            {isConnected ? "Session Active" : "Disconnected"}
          </span>
        </div>
        <div className="text-xs text-github-text-secondary">
          Scope: <span className="text-github-text">App.tsx, workspace components</span>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* User Message */}
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-github-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-sm text-white"></i>
            </div>
            <div className="flex-1">
              <div className="bg-github-border/50 rounded-lg p-3 text-sm">
                Add copy button to ShareModal component
              </div>
              <div className="text-xs text-github-text-secondary mt-1">2 minutes ago</div>
            </div>
          </div>

          {/* Agent Response */}
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-sm text-white"></i>
            </div>
            <div className="flex-1">
              <div className="bg-github-surface border border-github-border rounded-lg p-3 text-sm">
                <div className="mb-2">
                  I'll add a copy button to the ShareModal component. I've identified the target files:
                </div>
                <div className="bg-github-bg rounded p-2 font-mono text-xs space-y-1">
                  <div className="text-github-success">+ components/ShareModal.tsx</div>
                  <div className="text-github-success">+ utils/clipboard.ts</div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-github-success rounded-full"></div>
                    <span>Scope approved - proceeding with changes</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-github-text-secondary mt-1">1 minute ago</div>
            </div>
          </div>

          {/* Proposed Changes */}
          <div className="bg-github-border/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Proposed Changes</span>
              <span className="text-xs text-github-text-secondary">2 files, 4 hunks</span>
            </div>
            <div className="space-y-2 text-xs">
              {proposedChanges.map((change) => (
                <div 
                  key={change.id}
                  className="flex items-center justify-between p-2 bg-github-success/10 rounded"
                >
                  <span>{change.file}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-github-success">{change.changes}</span>
                    <Checkbox defaultChecked />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-3">
              <Button 
                size="sm"
                className="flex-1 bg-github-success hover:bg-github-success/90 text-white"
              >
                Apply All
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="border-github-border hover:bg-github-border/50"
              >
                Review
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-github-border p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Reme to edit code..."
              className="bg-github-bg border-github-border text-github-text placeholder:text-github-text-secondary pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-github-text-secondary hover:text-github-primary p-1"
              onClick={handleSendMessage}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-github-text-secondary">
          <span>Strict scope mode</span>
          <span>$0.12 this session</span>
        </div>
      </div>
    </div>
  );
}
