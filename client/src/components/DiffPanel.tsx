import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DiffPanelProps {
  projectId: string;
}

interface HunkData {
  id: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  rationale: string;
  approved: boolean;
}

interface FileChange {
  id: string;
  filePath: string;
  changeType: string;
  hunks: HunkData[];
  applied: boolean;
}

export default function DiffPanel({ projectId }: DiffPanelProps) {
  const { data: sessions } = useQuery({
    queryKey: ['/api/sessions', projectId],
  });

  // Mock data for demonstration
  const fileChanges: FileChange[] = [
    {
      id: "1",
      filePath: "components/ShareModal.tsx",
      changeType: "modify",
      applied: false,
      hunks: [
        {
          id: "hunk-1",
          oldStart: 42,
          oldLines: 3,
          newStart: 42,
          newLines: 8,
          approved: false,
          rationale: "Add copy button functionality to modal header",
          content: `@@ -42,3 +42,8 @@ export function ShareModal({ isOpen, onClose }) {
   return (
     <Modal isOpen={isOpen} onClose={onClose}>
       <div className="modal-header">
+        <button 
+          onClick={handleCopy}
+          className="copy-btn"
+        >
+          <CopyIcon />
+        </button>
       </div>`
        }
      ]
    },
    {
      id: "2", 
      filePath: "utils/clipboard.ts",
      changeType: "create",
      applied: false,
      hunks: [
        {
          id: "hunk-2",
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: 12,
          approved: false,
          rationale: "Create clipboard utility function for copy operations",
          content: `@@ -0,0 +1,12 @@
+export async function copyToClipboard(text: string): Promise<boolean> {
+  try {
+    await navigator.clipboard.writeText(text);
+    return true;
+  } catch (error) {
+    console.error('Failed to copy to clipboard:', error);
+    return false;
+  }
+}
+
+export const showCopyFeedback = (success: boolean) => {
+  // Show toast notification
+};`
        }
      ]
    }
  ];

  const renderDiffContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="font-mono text-xs bg-github-bg rounded p-3 space-y-1">
        {lines.map((line, index) => {
          let className = "whitespace-pre";
          if (line.startsWith('+')) {
            className += " text-green-400 bg-green-400/10";
          } else if (line.startsWith('-')) {
            className += " text-red-400 bg-red-400/10";
          } else if (line.startsWith('@@')) {
            className += " text-github-primary";
          } else {
            className += " text-github-text-secondary";
          }
          
          return (
            <div key={index} className={className}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-github-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">File Changes</h3>
          <div className="text-xs text-github-text-secondary">
            {fileChanges.length} files, {fileChanges.reduce((acc, f) => acc + f.hunks.length, 0)} hunks
          </div>
        </div>
      </div>

      {/* File Changes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {fileChanges.map((fileChange) => (
            <div key={fileChange.id} className="border border-github-border rounded-lg overflow-hidden">
              {/* File Header */}
              <div className="p-3 bg-github-surface border-b border-github-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className={cn(
                    "fas text-sm",
                    fileChange.changeType === 'create' ? 'fa-plus text-green-400' :
                    fileChange.changeType === 'modify' ? 'fa-edit text-yellow-400' :
                    'fa-trash text-red-400'
                  )} />
                  <span className="font-mono text-sm">{fileChange.filePath}</span>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded",
                    fileChange.changeType === 'create' ? 'bg-green-400/20 text-green-400' :
                    fileChange.changeType === 'modify' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  )}>
                    {fileChange.changeType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-github-text-secondary">
                    {fileChange.hunks.length} hunks
                  </span>
                  <Checkbox />
                </div>
              </div>

              {/* Hunks */}
              <div className="space-y-3 p-3">
                {fileChange.hunks.map((hunk) => (
                  <div key={hunk.id} className="space-y-2">
                    {/* Hunk Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs text-github-text-secondary">
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                          </span>
                          <Checkbox checked={hunk.approved} />
                        </div>
                        <p className="text-xs text-github-text-secondary mb-2">
                          {hunk.rationale}
                        </p>
                      </div>
                    </div>

                    {/* Diff Content */}
                    {renderDiffContent(hunk.content)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-github-border flex space-x-2">
        <Button 
          className="flex-1 bg-github-success hover:bg-github-success/90 text-white"
          size="sm"
        >
          <i className="fas fa-check mr-2" />
          Apply Selected
        </Button>
        <Button 
          variant="outline"
          className="border-github-border hover:bg-github-border/50"
          size="sm"
        >
          <i className="fas fa-undo mr-2" />
          Revert All
        </Button>
      </div>
    </div>
  );
}
