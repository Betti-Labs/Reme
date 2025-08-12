import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface Tab {
  path: string;
  name: string;
  icon: string;
  modified: boolean;
}

interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  created: string[];
  deleted: string[];
  conflicted: string[];
  clean: boolean;
}

interface Session {
  id: string;
  projectId: string;
  prompt: string;
  status: string;
  createdAt: Date;
  scopeJson?: any;
  diffSummary?: string;
}

export function useIDE(projectId: string) {
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isConnected, lastMessage, sendMessage: sendWSMessage } = useWebSocket(projectId);

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  });

  // Fetch git status
  const { data: gitStatus, refetch: refetchGitStatus } = useQuery({
    queryKey: ['/api/git', projectId, 'status'],
    enabled: !!projectId,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Fetch project sessions
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ['/api/projects', projectId, 'sessions'],
    enabled: !!projectId,
    refetchInterval: 2000 // Refetch every 2 seconds to get new messages
  });

  // Fetch file content when current file changes
  const { data: currentFileContent } = useQuery({
    queryKey: ['/api/files', projectId, currentFile],
    enabled: !!projectId && !!currentFile,
    select: (data: any) => data.content || ''
  });

  // Update file content when query data changes
  useEffect(() => {
    if (currentFileContent !== undefined) {
      setFileContent(currentFileContent);
    }
  }, [currentFileContent]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'session.updated':
        queryClient.invalidateQueries({ queryKey: ['/api/sessions', projectId] });
        toast({
          title: "Session Updated",
          description: "Agent has processed your request"
        });
        break;
      case 'git.updated':
        refetchGitStatus();
        toast({
          title: "Git Updated",
          description: "Repository status has changed"
        });
        break;
      case 'patch.proposed':
        queryClient.invalidateQueries({ queryKey: ['/api/sessions', projectId] });
        toast({
          title: "Changes Proposed",
          description: "Review the proposed changes in the diff panel"
        });
        break;
      case 'ask.permission':
        toast({
          title: "Permission Required",
          description: lastMessage.reason,
          variant: "default"
        });
        break;
      case 'session.finished':
        queryClient.invalidateQueries({ queryKey: ['/api/sessions', projectId] });
        toast({
          title: "Session Complete",
          description: "All changes have been applied"
        });
        break;
    }
  }, [lastMessage, projectId, queryClient, refetchGitStatus, toast]);

  // Open file mutation
  const openFileMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const response = await apiRequest('GET', `/api/files/${projectId}/${filePath}`);
      return response.json();
    },
    onSuccess: (data, filePath) => {
      setCurrentFile(filePath);
      setFileContent(data.content || '');
      
      // Add to tabs if not already open
      const fileName = filePath.split('/').pop() || filePath;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      let icon = 'fas fa-file';
      switch (fileExtension) {
        case 'tsx':
        case 'ts':
          icon = 'fas fa-file-code text-blue-400';
          break;
        case 'js':
        case 'jsx':
          icon = 'fas fa-file-code text-yellow-400';
          break;
        case 'css':
        case 'scss':
          icon = 'fas fa-file-code text-purple-400';
          break;
        case 'json':
          icon = 'fas fa-file-code text-green-400';
          break;
        case 'md':
          icon = 'fas fa-file-alt text-yellow-400';
          break;
      }

      setTabs(prevTabs => {
        const existingTab = prevTabs.find(tab => tab.path === filePath);
        if (existingTab) return prevTabs;
        
        return [...prevTabs, {
          path: filePath,
          name: fileName,
          icon,
          modified: false
        }];
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to open file",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Send message to agent
  const sendMessageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/sessions', {
        projectId,
        prompt,
        status: 'active'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Agent is processing your request"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Git operations
  const commitMutation = useMutation({
    mutationFn: async () => {
      const message = `[Reme] Auto-commit | files: ${(gitStatus as GitStatus)?.staged?.join(',') || 'unknown'} | session: ${Date.now()}`;
      const response = await apiRequest('POST', `/api/git/${projectId}/commit`, {
        message,
        stage: 'approved_hunks'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Changes committed",
        description: "Your changes have been committed to the repository"
      });
    },
    onError: (error) => {
      toast({
        title: "Commit failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const pullMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/git/${projectId}/pull`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.conflicts?.length > 0) {
        toast({
          title: "Pull completed with conflicts",
          description: `${data.conflicts.length} files have conflicts`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Pull completed",
          description: "Repository updated successfully"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Pull failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/git/${projectId}/push`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Push completed",
        description: "Changes pushed to remote repository"
      });
    },
    onError: (error) => {
      toast({
        title: "Push failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Callback functions
  const openFile = useCallback((filePath: string) => {
    openFileMutation.mutate(filePath);
  }, [openFileMutation]);

  const closeTab = useCallback((filePath: string) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.path !== filePath));
    if (currentFile === filePath) {
      const remainingTabs = tabs.filter(tab => tab.path !== filePath);
      if (remainingTabs.length > 0) {
        setCurrentFile(remainingTabs[0].path);
      } else {
        setCurrentFile('');
        setFileContent('');
      }
    }
  }, [currentFile, tabs]);

  const sendMessage = useCallback((message: string) => {
    sendMessageMutation.mutate(message, {
      onSuccess: () => {
        // Immediately refetch sessions to show the new message
        refetchSessions();
      }
    });
  }, [sendMessageMutation, refetchSessions]);

  const commitChanges = useCallback(() => {
    commitMutation.mutate();
  }, [commitMutation]);

  const pullChanges = useCallback(() => {
    pullMutation.mutate();
  }, [pullMutation]);

  const pushChanges = useCallback(() => {
    pushMutation.mutate();
  }, [pushMutation]);

  return {
    // State
    currentFile,
    fileContent,
    tabs,
    gitStatus: gitStatus as GitStatus,
    sessions: sessions as Session[],
    isConnected,
    project,
    
    // Actions
    openFile,
    closeTab,
    sendMessage,
    commitChanges,
    pullChanges,
    pushChanges,
    
    // Loading states
    isLoadingFile: openFileMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isCommitting: commitMutation.isPending,
    isPulling: pullMutation.isPending,
    isPushing: pushMutation.isPending,
  };
}
