import simpleGit, { SimpleGit } from 'simple-git';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';

class GitService {
  private getGitInstance(projectId: string): SimpleGit {
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    return simpleGit(projectPath);
  }

  async commit(projectId: string, message: string, stage: 'approved_hunks' | 'all' = 'approved_hunks'): Promise<any> {
    try {
      const git = this.getGitInstance(projectId);
      
      if (stage === 'all') {
        await git.add('.');
      } else {
        // Stage only approved hunks - this would need more complex logic
        // For now, stage all modified files
        await git.add('.');
      }

      const commitResult = await git.commit(message);
      
      // Update git state
      const status = await git.status();
      await storage.updateGitState(projectId, {
        ahead: status.ahead,
        behind: status.behind,
        lastCommit: commitResult.commit
      });

      return {
        commit: commitResult.commit,
        message,
        files: status.modified.length + status.created.length + status.deleted.length
      };
    } catch (error) {
      throw new Error(`Commit failed: ${error.message}`);
    }
  }

  async pull(projectId: string): Promise<any> {
    try {
      const git = this.getGitInstance(projectId);
      const pullResult = await git.pull();
      
      // Check for conflicts
      const status = await git.status();
      const hasConflicts = status.conflicted.length > 0;
      
      // Update git state
      await storage.updateGitState(projectId, {
        ahead: status.ahead,
        behind: status.behind,
      });

      return {
        success: !hasConflicts,
        conflicts: status.conflicted,
        summary: pullResult.summary,
        files: pullResult.files
      };
    } catch (error) {
      throw new Error(`Pull failed: ${error.message}`);
    }
  }

  async push(projectId: string): Promise<any> {
    try {
      const git = this.getGitInstance(projectId);
      const pushResult = await git.push();
      
      // Update git state
      const status = await git.status();
      await storage.updateGitState(projectId, {
        ahead: status.ahead,
        behind: status.behind,
      });

      return {
        success: true,
        pushed: pushResult.pushed || [],
        remoteMessages: pushResult.remoteMessages
      };
    } catch (error) {
      throw new Error(`Push failed: ${error.message}`);
    }
  }

  async manageBranch(projectId: string, action: 'create' | 'switch' | 'delete', name: string): Promise<any> {
    try {
      const git = this.getGitInstance(projectId);
      
      switch (action) {
        case 'create':
          await git.checkoutLocalBranch(name);
          break;
        case 'switch':
          await git.checkout(name);
          break;
        case 'delete':
          await git.deleteLocalBranch(name);
          break;
      }

      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
      const status = await git.status();
      
      await storage.updateGitState(projectId, {
        branch: currentBranch,
        ahead: status.ahead,
        behind: status.behind,
      });

      return {
        success: true,
        currentBranch,
        action,
        branchName: name
      };
    } catch (error) {
      throw new Error(`Branch ${action} failed: ${error.message}`);
    }
  }

  async getStatus(projectId: string): Promise<any> {
    try {
      const git = this.getGitInstance(projectId);
      const status = await git.status();
      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
      
      return {
        branch: currentBranch,
        ahead: status.ahead,
        behind: status.behind,
        staged: status.staged,
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        conflicted: status.conflicted,
        clean: status.isClean()
      };
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  async initializeProject(projectId: string, repoUrl?: string): Promise<void> {
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const git = simpleGit(projectPath);

    if (repoUrl) {
      await git.clone(repoUrl, projectPath);
    } else {
      await git.init();
    }
  }
}

export const gitService = new GitService();
