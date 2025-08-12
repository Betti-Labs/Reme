import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GitPanelProps {
  projectId: string;
  gitStatus?: any;
  onCommit: () => void;
  onPull: () => void;
  onPush: () => void;
}

export default function GitPanel({ gitStatus, onCommit, onPull, onPush }: GitPanelProps) {
  // Mock git status data
  const mockGitStatus = {
    branch: "main",
    ahead: 2,
    behind: 0,
    staged: ["components/ShareModal.tsx", "utils/clipboard.ts"],
    modified: ["client/src/App.tsx"],
    created: ["utils/clipboard.ts"],
    deleted: [],
    conflicted: [],
    clean: false
  };

  const status = gitStatus || mockGitStatus;

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'fas fa-file-code text-blue-400';
      case 'js':
      case 'jsx':
        return 'fas fa-file-code text-yellow-400';
      case 'css':
      case 'scss':
        return 'fas fa-file-code text-purple-400';
      default:
        return 'fas fa-file text-github-text-secondary';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'staged':
        return 'fas fa-plus text-green-400';
      case 'modified':
        return 'fas fa-edit text-yellow-400';
      case 'created':
        return 'fas fa-plus text-green-400';
      case 'deleted':
        return 'fas fa-minus text-red-400';
      case 'conflicted':
        return 'fas fa-exclamation-triangle text-orange-400';
      default:
        return 'fas fa-circle text-github-text-secondary';
    }
  };

  const FileList = ({ files, type, title }: { files: string[]; type: string; title: string }) => {
    if (files.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-xs font-medium text-github-text-secondary uppercase mb-2">
          {title} ({files.length})
        </h4>
        <div className="space-y-1">
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center space-x-2 p-2 hover:bg-github-border/30 rounded text-sm"
            >
              <i className={getStatusIcon(type)} />
              <i className={getFileIcon(file)} />
              <span className="flex-1 font-mono">{file}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-github-text-secondary hover:text-github-text"
              >
                <i className="fas fa-plus text-xs" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Branch Info */}
      <div className="p-4 border-b border-github-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <i className="fas fa-code-branch text-github-primary" />
            <span className="font-medium">{status.branch}</span>
          </div>
          <div className="flex space-x-1">
            {status.ahead > 0 && (
              <Badge variant="outline" className="text-xs border-github-border">
                ↑{status.ahead}
              </Badge>
            )}
            {status.behind > 0 && (
              <Badge variant="outline" className="text-xs border-github-border">
                ↓{status.behind}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            onClick={onCommit}
            disabled={status.staged.length === 0}
            className={cn(
              "bg-github-success hover:bg-github-success/90 text-white",
              status.staged.length === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <i className="fas fa-plus mr-1" />
            Commit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPull}
            className="border-github-border hover:bg-github-border/50"
          >
            <i className="fas fa-arrow-down mr-1" />
            Pull
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPush}
            disabled={status.ahead === 0}
            className={cn(
              "border-github-border hover:bg-github-border/50",
              status.ahead === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <i className="fas fa-arrow-up mr-1" />
            Push
          </Button>
        </div>
      </div>

      {/* File Changes */}
      <ScrollArea className="flex-1 p-4">
        {status.clean ? (
          <div className="text-center text-github-text-secondary py-8">
            <i className="fas fa-check-circle text-2xl mb-2 opacity-50" />
            <p className="text-sm">Working tree clean</p>
            <p className="text-xs mt-1">No changes to commit</p>
          </div>
        ) : (
          <div>
            <FileList files={status.staged} type="staged" title="Staged Changes" />
            <FileList files={status.modified} type="modified" title="Modified Files" />
            <FileList files={status.created} type="created" title="New Files" />
            <FileList files={status.deleted} type="deleted" title="Deleted Files" />
            <FileList files={status.conflicted} type="conflicted" title="Conflicts" />
          </div>
        )}
      </ScrollArea>

      {/* Commit Message */}
      {status.staged.length > 0 && (
        <div className="p-4 border-t border-github-border">
          <textarea
            placeholder="Commit message..."
            className="w-full p-2 text-sm bg-github-bg border border-github-border rounded resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-github-text-secondary">
            <span>{status.staged.length} files staged</span>
            <span>⌘+Enter to commit</span>
          </div>
        </div>
      )}
    </div>
  );
}
