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
      <div className="p-4 border-b border-github-border/50 bg-gradient-to-r from-github-surface to-github-bg">
        <div className="flex items-center space-x-3 mb-2">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            isConnected ? "bg-github-success animate-pulse shadow-lg shadow-github-success/50" : "bg-github-error"
          )} />
          <span className="text-sm font-bold text-github-primary tracking-wide">
            AGENT {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        <div className="text-xs text-github-accent font-mono">
          {'>> strict_scope_mode: true'}
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-github-text-secondary py-8">
              <div className="text-github-primary text-3xl mb-4 animate-pulse">
                <i className="fas fa-terminal"></i>
              </div>
              <p className="text-sm font-mono">$ reme --help</p>
              <p className="text-xs mt-2 text-github-accent">Ready to build. Enter commands to begin...</p>
            </div>
          ) : (
            messages.map((msg: any, index: number) => (
              <div key={index} className="flex space-x-3 animate-fade-in">
                <div className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs border",
                  msg.role === 'user' 
                    ? "bg-github-primary/20 text-github-primary border-github-primary/30" 
                    : "bg-github-success/20 text-github-success border-github-success/30"
                )}>
                  {msg.role === 'user' ? '$' : 'AI'}
                </div>
                <div className="flex-1">
                  <div className="bg-github-surface/50 border border-github-border rounded-md p-3 text-sm font-mono leading-relaxed">
                    {msg.content}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-github-text-secondary font-mono">
                      [{new Date(msg.timestamp || Date.now()).toLocaleTimeString()}]
                    </span>
                    {msg.role === 'assistant' && (
                      <span className="text-xs text-github-success font-mono">✓ completed</span>
                    )}
                  </div>
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
            placeholder="> ask_reme --build <application>"
            className="flex-1 bg-github-surface border-github-border text-github-text placeholder:text-github-text-secondary font-mono"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            size="sm"
            className="bg-github-primary hover:bg-github-primary/90 text-black font-bold px-4 shadow-lg shadow-github-primary/25"
          >
            <i className="fas fa-terminal mr-1"></i>
            EXEC
          </Button>
        </div>
        <div className="text-xs text-github-accent mt-2 font-mono">
          {isConnected ? ">> agent_status: ready_for_commands" : ">> connection: establishing..."}
        </div>
      </div>
    </div>
  );
}