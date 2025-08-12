import { storage } from '../storage';
import type { MemoryNote } from '@shared/schema';

class MemoryService {
  async getHotMemory(projectId: string): Promise<MemoryNote[]> {
    // Hot memory: Current brief, last 3 sessions, active files
    // Always in prompt bundle
    const recentNotes = await storage.getProjectMemoryNotes(projectId, 10);
    const recentSessions = await storage.getProjectSessions(projectId);
    
    // Combine and sort by recency
    return recentNotes.slice(0, 5);
  }

  async getWarmMemory(projectId: string, query: string): Promise<MemoryNote[]> {
    // Warm memory: Retrieved by keyword or vector search
    // Last 30-60 days distilled into short notes
    const searchResults = await storage.searchMemoryNotes(projectId, query);
    
    // In a real implementation, this would use embeddings/vector search
    // For now, use simple text matching
    return searchResults.slice(0, 3);
  }

  async getColdMemory(projectId: string, sessionId?: string): Promise<any> {
    // Cold memory: Full history, loaded on demand only
    if (sessionId) {
      const session = await storage.getSession(sessionId);
      const changes = await storage.getSessionFileChanges(sessionId);
      const testRuns = await storage.getSessionTestRuns(sessionId);
      
      return {
        session,
        changes,
        testRuns
      };
    }

    return null;
  }

  async addSessionMemory(sessionId: string, summary: string, tags: string[] = []): Promise<MemoryNote> {
    const session = await storage.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const note = await storage.createMemoryNote({
      projectId: session.projectId,
      content: `Session ${sessionId}: ${summary}`,
      tags: ['session', ...tags],
      links: [sessionId]
    });

    return note;
  }

  async addProjectNote(projectId: string, content: string, tags: string[] = []): Promise<MemoryNote> {
    return storage.createMemoryNote({
      projectId,
      content,
      tags,
      links: []
    });
  }

  async searchMemory(projectId: string, query: string, options?: {
    includeHot?: boolean;
    includeWarm?: boolean;
    maxResults?: number;
  }): Promise<MemoryNote[]> {
    const { includeHot = true, includeWarm = true, maxResults = 10 } = options || {};
    
    let results: MemoryNote[] = [];

    if (includeHot) {
      const hotMemory = await this.getHotMemory(projectId);
      results.push(...hotMemory);
    }

    if (includeWarm) {
      const warmMemory = await this.getWarmMemory(projectId, query);
      results.push(...warmMemory);
    }

    // Remove duplicates and limit results
    const unique = results.filter((note, index, arr) => 
      arr.findIndex(n => n.id === note.id) === index
    );

    return unique.slice(0, maxResults);
  }

  async distillDailySessions(projectId: string, date: Date): Promise<void> {
    // Nightly distillation job
    // Summarize daily sessions per project into 10-20 lines
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await storage.getProjectSessions(projectId);
    const dailySessions = sessions.filter(session => 
      session.createdAt >= startOfDay && session.createdAt <= endOfDay
    );

    if (dailySessions.length === 0) return;

    // Create distilled summary
    const summary = `Daily summary for ${date.toISOString().split('T')[0]}:
${dailySessions.length} sessions completed.
Goals: ${dailySessions.map(s => s.prompt.slice(0, 50)).join('; ')}
Files modified: ${dailySessions.flatMap(s => s.scopeJson?.files || []).join(', ')}`;

    await storage.createMemoryNote({
      projectId,
      content: summary,
      tags: ['daily-summary', date.toISOString().split('T')[0]],
      links: dailySessions.map(s => s.id)
    });
  }
}

export const memoryService = new MemoryService();
