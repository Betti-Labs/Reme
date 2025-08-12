import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  gitStatus?: any;
  isConnected: boolean;
  onCommit: () => void;
  onPull: () => void;
  onPush: () => void;
}

export default function StatusBar({ gitStatus, isConnected, onCommit, onPull, onPush }: StatusBarProps) {
  const mockGitStatus = {
    branch: "main",
    ahead: 2,
    behind: 0,
    staged: 2,
    indexing: false
  };

  const status = gitStatus || mockGitStatus;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-github-primary h-6 flex items-center justify-between px-4 text-xs text-white z-50">
      {/* Left Side - Project Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <i className="fas fa-code-branch" />
          <span>{status.branch}</span>
        </div>
        
        {status.indexing && (
          <div className="flex items-center space-x-2">
            <i className="fas fa-sync animate-spin text-xs" />
            <span>Indexing...</span>
          </div>
        )}
        
        {status.staged > 0 && (
          <div className="flex items-center space-x-2">
            <i className="fas fa-check text-github-success" />
            <span>{status.staged} files staged</span>
          </div>
        )}

        <div className={cn(
          "flex items-center space-x-2",
          isConnected ? "text-github-success" : "text-red-400"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-github-success" : "bg-red-400"
          )} />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Right Side - Actions and Stats */}
      <div className="flex items-center space-x-4">
        {/* Git Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            className={cn(
              "px-2 py-0.5 h-5 bg-github-success hover:bg-github-success/90 rounded text-xs transition-colors",
              status.staged === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={onCommit}
            disabled={status.staged === 0}
            title="Commit staged changes"
          >
            <i className="fas fa-plus mr-1" />
            Commit
          </Button>
          
          <Button
            size="sm"
            className="px-2 py-0.5 h-5 bg-github-border hover:bg-github-border/80 rounded text-xs transition-colors"
            onClick={onPull}
            title="Pull from remote"
          >
            <i className="fas fa-arrow-down mr-1" />
            Pull
          </Button>
          
          <Button
            size="sm"
            className={cn(
              "px-2 py-0.5 h-5 bg-github-border hover:bg-github-border/80 rounded text-xs transition-colors",
              status.ahead === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={onPush}
            disabled={status.ahead === 0}
            title="Push to remote"
          >
            <i className="fas fa-arrow-up mr-1" />
            Push
          </Button>
        </div>

        {/* Usage Stats */}
        <span className="text-xs opacity-75">
          GPT-4 • $2.43 today
        </span>
      </div>
    </div>
  );
}
