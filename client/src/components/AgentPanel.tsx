import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AgentPanelProps {
  projectId: string;
  sessions: any[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
}

export default function AgentPanel({ sessions, isConnected, onSendMessage }: AgentPanelProps) {
  const [message, setMessage] = useState("");
  
  // Collect all messages from all sessions and sort by timestamp
  const messages = sessions?.reduce((allMessages: any[], session) => {
    const sessionMessages = session.messages || [];
    return [...allMessages, ...sessionMessages];
  }, []).sort((a: any, b: any) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ) || [];

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
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="text-xs text-github-text-secondary">
          Strict scope mode
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-github-text-secondary py-8">
              <i className="fas fa-robot text-2xl mb-3"></i>
              <p className="text-sm">No messages yet. Start a conversation with the AI agent.</p>
            </div>
          ) : (
            messages.map((msg: any, index: number) => (
              <div key={index} className="flex space-x-3">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  msg.role === 'user' ? "bg-github-primary" : "bg-github-success"
                )}>
                  <i className={cn(
                    "text-sm text-white",
                    msg.role === 'user' ? "fas fa-user" : "fas fa-robot"
                  )}></i>
                </div>
                <div className="flex-1">
                  <div className="bg-github-border/50 rounded-lg p-3 text-sm">
                    {msg.content}
                  </div>
                  <span className="text-xs text-github-text-secondary">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-github-border/50 p-4">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Reme to edit code..."
            className="flex-1 bg-github-surface border-github-border text-github-text placeholder:text-github-text-secondary"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            size="sm"
            className="bg-github-primary hover:bg-github-primary/90 text-white"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
        <div className="text-xs text-github-text-secondary mt-2">
          {isConnected ? "Agent ready" : "Waiting for connection..."}
        </div>
      </div>
    </div>
  );
}