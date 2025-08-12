import OpenAI from "openai";
import { storage } from '../storage';
import { memoryService } from './memory';
import { indexerService } from './indexer';
import * as jsdiff from 'diff';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

class AgentService {
  async processSession(session: any): Promise<any> {
    try {
      // 1. Parse intent and determine scope
      const scope = await this.createIntent(session.prompt, session.projectId);
      
      // 2. Check if scope is acceptable or needs permission
      const scopeCheck = await this.validateScope(scope, session.projectId);
      
      if (scopeCheck.needsPermission) {
        await storage.updateSession(session.id, { 
          status: 'pending_approval',
          scopeJson: scope 
        });
        
        return {
          type: 'ask.permission',
          sessionId: session.id,
          reason: scopeCheck.reason,
          request: scopeCheck.request
        };
      }

      // 3. Generate patch proposal
      const patch = await this.proposePatch(scope, session.projectId);
      
      // 4. Store file changes
      for (const filePatch of patch.files) {
        await storage.createFileChange({
          sessionId: session.id,
          filePath: filePatch.path,
          changeType: filePatch.changeType,
          hunks: filePatch.hunks
        });
      }

      await storage.updateSession(session.id, { 
        status: 'completed',
        scopeJson: scope,
        diffSummary: patch.summary
      });

      return {
        type: 'patch.proposed',
        sessionId: session.id,
        patch
      };

    } catch (error) {
      await storage.updateSession(session.id, { status: 'failed' });
      throw error;
    }
  }

  async createIntent(prompt: string, projectId: string): Promise<any> {
    try {
      // Get project context
      const project = await storage.getProject(projectId);
      const recentMemory = await memoryService.getHotMemory(projectId);
      const codeIndex = await indexerService.getProjectIndex(projectId);

      const systemPrompt = `You are Reme, a strict scope AI coding agent. 
Parse the user's intent and determine the minimal scope needed.

STRICT RULES:
- Only touch files explicitly requested
- No refactoring unless asked
- No style changes unless permitted
- Ask permission for scope expansion with ONE concise question

Project context: ${project?.name}
Recent memory: ${JSON.stringify(recentMemory.slice(0, 3))}
Available symbols: ${JSON.stringify(Object.keys(codeIndex.symbols || {}).slice(0, 20))}

Return JSON with:
{
  "goal": "concise goal statement",
  "files": ["list of files to modify"],
  "symbols": ["list of symbols to change"],
  "forbidden": ["paths/patterns to avoid"],
  "budget": { "maxTokens": 1000, "maxCost": 0.50 }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error(`Intent creation failed: ${error.message}`);
    }
  }

  async validateScope(scope: any, projectId: string): Promise<any> {
    const project = await storage.getProject(projectId);
    const settings = project?.settingsJson || {};

    // Check against project rules
    if (settings.maxFiles && scope.files.length > settings.maxFiles) {
      return {
        needsPermission: true,
        reason: `Scope exceeds max files limit (${scope.files.length} > ${settings.maxFiles})`,
        request: `Allow editing ${scope.files.length} files?`
      };
    }

    if (settings.forbiddenGlobs) {
      const forbiddenFiles = scope.files.filter(file => 
        settings.forbiddenGlobs.some(glob => file.includes(glob))
      );
      
      if (forbiddenFiles.length > 0) {
        return {
          needsPermission: true,
          reason: `Attempting to modify forbidden files: ${forbiddenFiles.join(', ')}`,
          request: `Allow modifying these restricted files?`
        };
      }
    }

    return { needsPermission: false };
  }

  async proposePatch(scope: any, projectId: string): Promise<any> {
    try {
      const contextFiles = await this.gatherContext(scope.files, projectId);
      const warmMemory = await memoryService.getWarmMemory(projectId, scope.goal);

      const systemPrompt = `You are Reme. Generate the minimal patch to achieve the goal.

RULES:
- Only modify specified files: ${scope.files.join(', ')}
- Provide rationale for each hunk
- Generate working code, no placeholders
- Follow project style patterns

Context files:
${contextFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 2000)}`).join('\n\n')}

Relevant memory:
${warmMemory.map(m => m.content).join('\n')}

Goal: ${scope.goal}

Return JSON with:
{
  "summary": "Brief change description",
  "files": [
    {
      "path": "file/path.ts",
      "changeType": "modify|create|delete",
      "hunks": [
        {
          "id": "unique-id",
          "oldStart": 10,
          "oldLines": 3,
          "newStart": 10,
          "newLines": 5,
          "content": "unified diff content",
          "rationale": "why this change is needed"
        }
      ]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate patch for: ${scope.goal}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const patch = JSON.parse(response.choices[0].message.content);
      
      // Generate unique IDs for hunks
      patch.files.forEach(file => {
        file.hunks.forEach((hunk, index) => {
          hunk.id = `${file.path}-${index}-${Date.now()}`;
          hunk.approved = false;
        });
      });

      return patch;
    } catch (error) {
      throw new Error(`Patch generation failed: ${error.message}`);
    }
  }

  async continueSession(sessionId: string, updatedScope: any): Promise<void> {
    const session = await storage.getSession(sessionId);
    if (!session) return;

    // Update session with new scope
    await storage.updateSession(sessionId, { 
      scopeJson: updatedScope,
      status: 'active'
    });

    // Continue with patch generation
    const patch = await this.proposePatch(updatedScope, session.projectId);
    
    for (const filePatch of patch.files) {
      await storage.createFileChange({
        sessionId: session.id,
        filePath: filePatch.path,
        changeType: filePatch.changeType,
        hunks: filePatch.hunks
      });
    }

    await storage.updateSession(sessionId, { 
      status: 'completed',
      diffSummary: patch.summary
    });
  }

  private async gatherContext(files: string[], projectId: string): Promise<Array<{path: string, content: string}>> {
    const context = [];
    
    for (const filePath of files) {
      try {
        const content = await indexerService.getFileContent(projectId, filePath);
        context.push({ path: filePath, content });
      } catch (error) {
        // File might not exist yet (create operation)
        context.push({ path: filePath, content: '' });
      }
    }

    return context;
  }
}

export const agentService = new AgentService();
