import { ModelRouter } from './models';
import { IStorage } from '../storage';

interface AgentTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any, context: AgentContext) => Promise<any>;
}

interface AgentContext {
  projectId: string;
  storage: IStorage;
  modelRouter: ModelRouter;
}

export class CodeAgent {
  private tools: Map<string, AgentTool> = new Map();
  
  constructor(
    private storage: IStorage,
    private modelRouter: ModelRouter
  ) {
    this.initializeTools();
  }

  private initializeTools() {
    // File creation tool
    this.tools.set('create_file', {
      name: 'create_file',
      description: 'Create a new file with the specified content',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path' },
          content: { type: 'string', description: 'The file content' }
        },
        required: ['path', 'content']
      },
      execute: async (params, context) => {
        await context.storage.saveFile(context.projectId, params.path, params.content);
        return { success: true, message: `Created file: ${params.path}` };
      }
    });

    // File reading tool
    this.tools.set('read_file', {
      name: 'read_file',
      description: 'Read the content of an existing file',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path to read' }
        },
        required: ['path']
      },
      execute: async (params, context) => {
        const content = await context.storage.getFile(context.projectId, params.path);
        return { content };
      }
    });

    // List files tool
    this.tools.set('list_files', {
      name: 'list_files',
      description: 'List all files in the project',
      parameters: {
        type: 'object',
        properties: {}
      },
      execute: async (params, context) => {
        const files = await context.storage.listFiles(context.projectId);
        return { files };
      }
    });

    // Update file tool
    this.tools.set('update_file', {
      name: 'update_file',
      description: 'Update an existing file with new content',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path' },
          content: { type: 'string', description: 'The new file content' }
        },
        required: ['path', 'content']
      },
      execute: async (params, context) => {
        await context.storage.saveFile(context.projectId, params.path, params.content);
        return { success: true, message: `Updated file: ${params.path}` };
      }
    });
  }

  async processRequest(projectId: string, prompt: string): Promise<string> {
    const context: AgentContext = {
      projectId,
      storage: this.storage,
      modelRouter: this.modelRouter
    };

    // Get project context
    const files = await this.storage.listFiles(projectId);
    const fileContext = files.length > 0 
      ? `Current project files: ${files.map(f => f.path).join(', ')}`
      : 'No files in project yet.';

    // Build system prompt with available tools
    const toolsDescription = Array.from(this.tools.values())
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');

    const systemPrompt = `You are a code agent that can create, read, and modify files. You have access to these tools:

${toolsDescription}

When the user asks you to build something, you should:
1. Create the necessary files using the create_file tool
2. Make sure the code is complete and functional
3. Explain what you've built

${fileContext}

Always use the tools to actually create files - never just show code in your response without creating it.

For tool calls, respond in this exact format:
<tool_call>
{
  "tool": "tool_name",
  "parameters": {
    "key": "value"
  }
}
</tool_call>

You can make multiple tool calls in sequence.`;

    // Generate initial response
    const modelConfig = {
      name: "claude-sonnet-4-20250514",
      provider: "anthropic" as const,
      maxTokens: 4000,
      costPerToken: 0.00003,
      capabilities: ['code', 'analysis', 'reasoning'],
      local: false
    };

    let response = await this.modelRouter.generateCompletion(
      modelConfig,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      {}
    );

    // Process tool calls in the response
    let finalResponse = response.content;
    const toolCallMatches = response.content.match(/<tool_call>([\s\S]*?)<\/tool_call>/g);
    
    if (toolCallMatches) {
      const toolResults = [];
      
      for (const match of toolCallMatches) {
        const jsonStr = match.replace(/<tool_call>|<\/tool_call>/g, '').trim();
        try {
          const toolCall = JSON.parse(jsonStr);
          const tool = this.tools.get(toolCall.tool);
          
          if (tool) {
            const result = await tool.execute(toolCall.parameters, context);
            toolResults.push(`${tool.name}: ${JSON.stringify(result)}`);
            console.log(`✅ Agent used tool: ${tool.name}`, toolCall.parameters);
          }
        } catch (error: any) {
          console.error('Tool call error:', error);
          toolResults.push(`Error: ${error?.message || error}`);
        }
      }
      
      // Remove tool calls from final response and add results
      finalResponse = response.content.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();
      
      if (toolResults.length > 0) {
        finalResponse += `\n\nTool execution results:\n${toolResults.join('\n')}`;
      }
    }

    return finalResponse;
  }
}