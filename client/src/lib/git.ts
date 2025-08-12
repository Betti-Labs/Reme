import { apiRequest } from './queryClient';

export interface GitStatus {
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

export interface CommitResult {
  commit: string;
  message: string;
  files: number;
}

export interface PullResult {
  success: boolean;
  conflicts: string[];
  summary: any;
  files: any[];
}

export interface PushResult {
  success: boolean;
  pushed: any[];
  remoteMessages: any;
}

export interface BranchResult {
  success: boolean;
  currentBranch: string;
  action: string;
  branchName: string;
}

export class GitService {
  constructor(private projectId: string) {}

  async getStatus(): Promise<GitStatus> {
    const response = await apiRequest('GET', `/api/git/${this.projectId}/status`);
    return response.json();
  }

  async commit(message: string, stage: 'approved_hunks' | 'all' = 'approved_hunks'): Promise<CommitResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/commit`, {
      message,
      stage
    });
    return response.json();
  }

  async pull(): Promise<PullResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/pull`);
    return response.json();
  }

  async push(): Promise<PushResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/push`);
    return response.json();
  }

  async createBranch(name: string): Promise<BranchResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/branch`, {
      action: 'create',
      name
    });
    return response.json();
  }

  async switchBranch(name: string): Promise<BranchResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/branch`, {
      action: 'switch',
      name
    });
    return response.json();
  }

  async deleteBranch(name: string): Promise<BranchResult> {
    const response = await apiRequest('POST', `/api/git/${this.projectId}/branch`, {
      action: 'delete',
      name
    });
    return response.json();
  }

  /**
   * Generate automatic commit message based on session goal and changed files
   */
  generateCommitMessage(goal: string, files: string[], sessionId?: string): string {
    const fileList = files.length > 5 
      ? `${files.slice(0, 5).join(', ')}... (+${files.length - 5} more)`
      : files.join(', ');
    
    const sessionPart = sessionId ? ` | session: ${sessionId}` : '';
    return `[Reme] ${goal} | files: ${fileList}${sessionPart}`;
  }

  /**
   * Check if repository has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return !status.clean;
  }

  /**
   * Check if repository is ahead of remote
   */
  async isAheadOfRemote(): Promise<boolean> {
    const status = await this.getStatus();
    return status.ahead > 0;
  }

  /**
   * Check if repository is behind remote
   */
  async isBehindRemote(): Promise<boolean> {
    const status = await this.getStatus();
    return status.behind > 0;
  }

  /**
   * Stage specific files for commit
   */
  async stageFiles(files: string[]): Promise<void> {
    // This would typically use git add for specific files
    // For now, we'll use the commit endpoint with specific file staging
    // Implementation would depend on backend git service enhancement
    console.log('Staging files:', files);
  }

  /**
   * Unstage files
   */
  async unstageFiles(files: string[]): Promise<void> {
    // This would use git reset for specific files
    console.log('Unstaging files:', files);
  }

  /**
   * Get commit history
   */
  async getCommitHistory(limit: number = 10): Promise<any[]> {
    // This would fetch commit history from git log
    // Implementation would require additional backend endpoint
    return [];
  }

  /**
   * Create a new feature branch with automatic naming
   */
  async createFeatureBranch(goal: string, sessionId: string): Promise<BranchResult> {
    const sanitizedGoal = goal
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);
    
    const branchName = `feat/${sanitizedGoal}-${sessionId.slice(0, 8)}`;
    return this.createBranch(branchName);
  }
}

export function createGitService(projectId: string): GitService {
  return new GitService(projectId);
}
