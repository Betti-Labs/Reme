import { ChromaApi, OpenAIEmbeddingFunction, Collection } from 'chromadb';
import { OpenAI } from 'openai';

export class VectorService {
  private client: any;
  private openai: OpenAI;
  private embeddingFunction: any;
  private collections: Map<string, any> = new Map();
  private isAvailable: boolean = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('OPENAI_API_KEY not provided, AI features will be limited');
    }

    this.initializeChroma();
  }

  private async initializeChroma() {
    try {
      // Dynamic import to handle potential module issues
      const chromadb = await import('chromadb');
      this.client = new chromadb.ChromaApi({
        host: process.env.CHROMA_HOST || 'localhost',
        port: process.env.CHROMA_PORT ? parseInt(process.env.CHROMA_PORT) : 8000,
      });
      
      this.embeddingFunction = new chromadb.OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY,
        openai_model: 'text-embedding-3-small'
      });
      
      this.isAvailable = true;
    } catch (error) {
      console.warn('ChromaDB not available, vector features disabled:', error.message);
      this.isAvailable = false;
    }
  }

  async getCollection(name: string): Promise<any> {
    if (!this.isAvailable) {
      throw new Error('ChromaDB not available');
    }

    if (this.collections.has(name)) {
      return this.collections.get(name)!;
    }

    try {
      const collection = await this.client.getCollection({
        name,
        embeddingFunction: this.embeddingFunction
      });
      this.collections.set(name, collection);
      return collection;
    } catch (error) {
      // Collection doesn't exist, create it
      const collection = await this.client.createCollection({
        name,
        embeddingFunction: this.embeddingFunction
      });
      this.collections.set(name, collection);
      return collection;
    }
  }

  async addProjectCode(projectId: string, files: { path: string; content: string; type: string }[]) {
    if (!this.isAvailable) {
      console.warn('ChromaDB not available, skipping project code indexing');
      return;
    }

    try {
      const collection = await this.getCollection(`project_${projectId}`);
      
      const documents = files.map(file => file.content);
      const metadatas = files.map(file => ({
        path: file.path,
        type: file.type,
        project_id: projectId,
        indexed_at: new Date().toISOString()
      }));
      const ids = files.map(file => `${projectId}_${file.path}`);

      await collection.add({
        documents,
        metadatas,
        ids
      });
    } catch (error) {
      console.warn('Failed to index project code:', error);
    }
  }

  async searchProjectCode(projectId: string, query: string, limit: number = 10) {
    if (!this.isAvailable) {
      return { documents: [[]], metadatas: [[]], ids: [[]], distances: [[]] };
    }

    try {
      const collection = await this.getCollection(`project_${projectId}`);
      
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        include: ['documents', 'metadatas', 'distances']
      });

      return results;
    } catch (error) {
      console.warn('Project code search failed:', error);
      return { documents: [[]], metadatas: [[]], ids: [[]], distances: [[]] };
    }
  }

  async addMemoryNote(sessionId: string, content: string, tags: string[] = [], links: string[] = []) {
    if (!this.isAvailable) {
      console.warn('ChromaDB not available, skipping memory note storage');
      return;
    }

    try {
      const collection = await this.getCollection('memory_notes');
      
      await collection.add({
        documents: [content],
        metadatas: [{
          session_id: sessionId,
          tags: tags.join(','),
          links: links.join(','),
          created_at: new Date().toISOString()
        }],
        ids: [`memory_${sessionId}_${Date.now()}`]
      });
    } catch (error) {
      console.warn('Failed to store memory note:', error);
    }
  }

  async searchMemory(query: string, tags: string[] = [], limit: number = 20) {
    if (!this.isAvailable) {
      return { documents: [[]], metadatas: [[]], ids: [[]], distances: [[]] };
    }

    try {
      const collection = await this.getCollection('memory_notes');
      
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        include: ['documents', 'metadatas', 'distances']
      });

      return results;
    } catch (error) {
      console.warn('Memory search failed:', error);
      return { documents: [[]], metadatas: [[]], ids: [[]], distances: [[]] };
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  }

  async addProjectTemplate(templateId: string, template: {
    name: string;
    description: string;
    category: string;
    files: { path: string; content: string }[];
    dependencies: string[];
  }) {
    const collection = await this.getCollection('project_templates');
    
    const searchableContent = [
      template.name,
      template.description,
      template.category,
      ...template.files.map(f => f.content).slice(0, 5), // Limit to first 5 files for indexing
    ].join('\n');

    await collection.add({
      documents: [searchableContent],
      metadatas: [{
        template_id: templateId,
        name: template.name,
        description: template.description,
        category: template.category,
        dependencies: template.dependencies.join(','),
        file_count: template.files.length,
        created_at: new Date().toISOString()
      }],
      ids: [`template_${templateId}`]
    });
  }

  async searchTemplates(query: string, category?: string, limit: number = 20) {
    const collection = await this.getCollection('project_templates');
    
    let whereClause = {};
    if (category) {
      whereClause = { category };
    }

    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: ['documents', 'metadatas', 'distances']
    });

    return results;
  }

  async deleteCollection(name: string) {
    await this.client.deleteCollection({ name });
    this.collections.delete(name);
  }
}

export const vectorService = new VectorService();