import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'local';
  maxTokens: number;
  costPerToken: number;
  capabilities: string[];
  local: boolean;
}

export class ModelRouter {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private ollama: any;
  private models: Map<string, ModelConfig> = new Map();
  private ollamaAvailable: boolean = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('OPENAI_API_KEY not provided, OpenAI models will be unavailable');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      console.warn('ANTHROPIC_API_KEY not provided, Anthropic models will be unavailable');
    }
    
    this.initializeOllama();
    this.initializeModels();
  }

  private async initializeOllama() {
    try {
      const Ollama = await import('ollama');
      this.ollama = new Ollama.Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      });
      this.ollamaAvailable = true;
    } catch (error) {
      console.warn('Ollama not available, using cloud models only:', (error as Error).message);
      this.ollamaAvailable = false;
    }
  }

  private initializeModels() {
    // Anthropic Models (Primary)
    this.models.set('claude-sonnet-4', {
      name: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      maxTokens: 200000,
      costPerToken: 0.00003,
      capabilities: ['code', 'analysis', 'reasoning', 'vision'],
      local: false
    });

    this.models.set('claude-3-7-sonnet', {
      name: 'claude-3-7-sonnet-20250219',
      provider: 'anthropic',
      maxTokens: 200000,
      costPerToken: 0.00003,
      capabilities: ['code', 'analysis', 'reasoning', 'vision'],
      local: false
    });

    // OpenAI Models (Fallback)
    this.models.set('gpt-4o', {
      name: 'gpt-4o',
      provider: 'openai',
      maxTokens: 128000,
      costPerToken: 0.00003,
      capabilities: ['code', 'analysis', 'reasoning', 'vision'],
      local: false
    });

    this.models.set('gpt-4o-mini', {
      name: 'gpt-4o-mini',
      provider: 'openai', 
      maxTokens: 128000,
      costPerToken: 0.000015,
      capabilities: ['code', 'analysis', 'reasoning'],
      local: false
    });

    // Local Models via Ollama
    this.models.set('codegemma', {
      name: 'codegemma:7b',
      provider: 'ollama',
      maxTokens: 8192,
      costPerToken: 0,
      capabilities: ['code', 'completion'],
      local: true
    });

    this.models.set('qwen2.5-coder', {
      name: 'qwen2.5-coder:7b',
      provider: 'ollama',
      maxTokens: 32768,
      costPerToken: 0,
      capabilities: ['code', 'analysis', 'reasoning'],
      local: true
    });

    this.models.set('llama3.2', {
      name: 'llama3.2:3b',
      provider: 'ollama',
      maxTokens: 128000,
      costPerToken: 0,
      capabilities: ['reasoning', 'analysis'],
      local: true
    });
  }

  async routeRequest(task: {
    type: 'code' | 'analysis' | 'reasoning' | 'completion' | 'vision';
    complexity: 'low' | 'medium' | 'high';
    urgency: 'low' | 'medium' | 'high';
    tokens: number;
    preferLocal?: boolean;
  }): Promise<ModelConfig> {
    const candidates = Array.from(this.models.values()).filter(model => 
      model.capabilities.includes(task.type) && 
      model.maxTokens >= task.tokens
    );

    // Prefer local models for simple tasks
    if (task.complexity === 'low' && task.preferLocal !== false) {
      const localCandidates = candidates.filter(m => m.local);
      if (localCandidates.length > 0) {
        return localCandidates[0];
      }
    }

    // For complex tasks or when local models aren't available
    if (task.complexity === 'high' || task.urgency === 'high') {
      return this.models.get('claude-sonnet-4')!;
    }

    // Default to cost-effective Claude option
    return this.models.get('claude-3-7-sonnet')!;
  }

  async generateCompletion(modelConfig: ModelConfig, messages: any[], options: any = {}): Promise<{ content: string; tokens: number; cost: number }> {
    if (modelConfig.provider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: modelConfig.name,
        messages,
        max_tokens: Math.min(options.maxTokens || 4000, modelConfig.maxTokens),
        temperature: options.temperature || 0.7,
      });
      
      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
        cost: ((response.usage?.input_tokens + response.usage?.output_tokens) || 0) * modelConfig.costPerToken
      };
    } else if (modelConfig.provider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: modelConfig.name,
        messages,
        max_tokens: Math.min(options.maxTokens || 4000, modelConfig.maxTokens),
        temperature: options.temperature || 0.7,
        ...options
      });
      
      return {
        content: response.choices[0].message.content || '',
        tokens: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * modelConfig.costPerToken
      };
    } else if (modelConfig.provider === 'ollama' && this.ollamaAvailable) {
      try {
        const response = await this.ollama.chat({
          model: modelConfig.name,
          messages,
          options: {
            num_predict: Math.min(options.maxTokens || 4000, modelConfig.maxTokens),
            temperature: options.temperature || 0.7,
          }
        });

        return {
          content: response.message.content,
          tokens: 0, // Ollama doesn't provide token counts
          cost: 0
        };
      } catch (error) {
        console.warn(`Ollama request failed, falling back to OpenAI:`, error);
        // Fallback to GPT-4o-mini for local model failures
        return this.generateCompletion(this.models.get('gpt-4o-mini')!, messages, options);
      }
    }

    throw new Error(`Unsupported provider: ${modelConfig.provider}`);
  }

  async pullLocalModel(modelName: string): Promise<void> {
    if (!this.ollamaAvailable) {
      throw new Error('Ollama not available');
    }
    await this.ollama.pull({ model: modelName });
  }

  async listLocalModels(): Promise<string[]> {
    if (!this.ollamaAvailable) {
      return [];
    }
    
    try {
      const response = await this.ollama.list();
      return response.models.map((model: any) => model.name);
    } catch (error) {
      console.warn('Failed to list Ollama models:', error);
      return [];
    }
  }

  getAvailableModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }
}

export const modelRouter = new ModelRouter();