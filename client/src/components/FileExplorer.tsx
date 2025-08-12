import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  modified?: boolean;
}

interface FileExplorerProps {
  projectId: string;
  onFileSelect: (path: string) => void;
}

export default function FileExplorer({ projectId, onFileSelect }: FileExplorerProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const { data: fileTree, isLoading } = useQuery({
    queryKey: ['/api/files', projectId],
    enabled: !!projectId
  });

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return expandedDirs.has(node.path) ? 'fas fa-folder-open' : 'fas fa-folder';
    }
    
    const ext = node.extension?.toLowerCase();
    switch (ext) {
      case '.tsx':
      case '.ts':
        return 'fas fa-file-code text-blue-400';
      case '.js':
      case '.jsx':
        return 'fas fa-file-code text-yellow-400';
      case '.json':
        return 'fas fa-file-code text-green-400';
      case '.md':
        return 'fas fa-file-alt text-yellow-400';
      case '.css':
      case '.scss':
        return 'fas fa-file-code text-purple-400';
      default:
        return 'fas fa-file text-github-text-secondary';
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    
    return (
      <div key={node.path} className="text-sm">
        <div
          className={cn(
            "flex items-center space-x-2 py-1 px-2 hover:bg-github-border/30 rounded cursor-pointer",
            "transition-colors"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDir(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'directory' && (
            <i
              className={cn(
                "text-xs text-github-text-secondary transition-transform",
                isExpanded ? "fas fa-chevron-down" : "fas fa-chevron-right"
              )}
            />
          )}
          {node.type === 'file' && <div className="w-3" />}
          
          <i className={getFileIcon(node)} />
          <span className={cn(
            node.type === 'directory' ? 'text-github-warning' : 'text-github-text'
          )}>
            {node.name}
          </span>
          
          {node.modified && (
            <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full" title="Modified" />
          )}
        </div>
        
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-6 bg-github-border/30 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Project Info */}
      <div className="px-4 py-2 border-b border-github-border/50">
        <div className="flex items-center space-x-2">
          <i className="fas fa-folder text-github-primary text-sm"></i>
          <span className="text-sm font-medium">reme-full</span>
          <span className="text-xs text-github-text-secondary">(main)</span>
        </div>
      </div>

      {/* File Tree */}
      <div className="p-2">
        {fileTree?.map((node: FileNode) => renderNode(node))}
      </div>
    </div>
  );
}
