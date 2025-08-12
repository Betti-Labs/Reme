interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface AgentScope {
  goal: string;
  files: string[];
  symbols: string[];
  forbidden: string[];
  budget: {
    maxTokens: number;
    maxCost: number;
  };
}

interface PatchProposal {
  summary: string;
  files: Array<{
    path: string;
    changeType: 'modify' | 'create' | 'delete';
    hunks: Array<{
      id: string;
      oldStart: number;
      oldLines: number;
      newStart: number;
      newLines: number;
      content: string;
      rationale: string;
      approved: boolean;
    }>;
  }>;
}

interface MemoryContext {
  hot: string[];
  warm: string[];
  projectStyle: any;
}

export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      maxTokens: 2000,
      temperature: 0.1,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'default_key',
      ...config
    };
  }

  /**
   * Parse user intent and determine minimal scope
   */
  async createIntent(
    prompt: string, 
    projectContext: any, 
    codeIndex: any, 
    memoryContext: MemoryContext
  ): Promise<AgentScope> {
    const systemPrompt = `You are Reme, a strict scope AI coding agent. 
Parse the user's intent and determine the minimal scope needed.

STRICT RULES:
- Only touch files explicitly requested
- No refactoring unless asked
- No style changes unless permitted
- Ask permission for scope expansion with ONE concise question

Project context: ${projectContext?.name || 'Unknown'}
Recent memory: ${JSON.stringify(memoryContext.hot.slice(0, 3))}
Available symbols: ${JSON.stringify(Object.keys(codeIndex.symbols || {}).slice(0, 20))}

Return JSON with:
{
  "goal": "concise goal statement",
  "files": ["list of files to modify"],
  "symbols": ["list of symbols to change"],
  "forbidden": ["paths/patterns to avoid"],
  "budget": { "maxTokens": 1000, "maxCost": 0.50 }
}`;

    try {
      const response = await fetch('/api/openai/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      throw new Error(`Intent creation failed: ${error.message}`);
    }
  }

  /**
   * Generate code patch based on scope and context
   */
  async proposePatch(
    scope: AgentScope,
    contextFiles: Array<{ path: string; content: string }>,
    memoryContext: MemoryContext
  ): Promise<PatchProposal> {
    const systemPrompt = `You are Reme. Generate the minimal patch to achieve the goal.

RULES:
- Only modify specified files: ${scope.files.join(', ')}
- Provide rationale for each hunk
- Generate working code, no placeholders
- Follow project style patterns

Context files:
${contextFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 2000)}`).join('\n\n')}

Relevant memory:
${memoryContext.warm.join('\n')}

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

    try {
      const response = await fetch('/api/openai/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate patch for: ${scope.goal}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: this.config.maxTokens * 2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const patch = JSON.parse(data.choices[0].message.content);
      
      // Generate unique IDs for hunks
      patch.files.forEach((file: any) => {
        file.hunks.forEach((hunk: any, index: number) => {
          hunk.id = `${file.path}-${index}-${Date.now()}`;
          hunk.approved = false;
        });
      });

      return patch;
    } catch (error) {
      throw new Error(`Patch generation failed: ${error.message}`);
    }
  }

  /**
   * Validate if scope expansion is needed
   */
  async validateScope(
    scope: AgentScope,
    projectSettings: any
  ): Promise<{ needsPermission: boolean; reason?: string; request?: string }> {
    // Check against project rules
    if (projectSettings.maxFiles && scope.files.length > projectSettings.maxFiles) {
      return {
        needsPermission: true,
        reason: `Scope exceeds max files limit (${scope.files.length} > ${projectSettings.maxFiles})`,
        request: `Allow editing ${scope.files.length} files?`
      };
    }

    if (projectSettings.forbiddenGlobs) {
      const forbiddenFiles = scope.files.filter((file: string) => 
        projectSettings.forbiddenGlobs.some((glob: string) => file.includes(glob))
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

  /**
   * Generate memory summary for session
   */
  async summarizeSession(
    goal: string,
    changes: any[],
    outcome: string
  ): Promise<string> {
    const systemPrompt = `Summarize this coding session in 2-3 concise sentences.
Focus on what was accomplished and any important decisions made.`;

    const userPrompt = `Goal: ${goal}
Changes: ${changes.map(c => `${c.filePath}: ${c.changeType}`).join(', ')}
Outcome: ${outcome}`;

    try {
      const response = await fetch('/api/openai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Session summarization failed: ${error.message}`);
    }
  }

  /**
   * Calculate estimated cost for operation
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    // GPT-4o pricing (approximate)
    const inputCostPerToken = 0.000005; // $5 per 1M tokens
    const outputCostPerToken = 0.000015; // $15 per 1M tokens
    
    return (inputTokens * inputCostPerToken) + (outputTokens * outputCostPerToken);
  }
}

export const openaiService = new OpenAIService();
