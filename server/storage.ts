import { type Project, type Session, type MemoryNote, type FileChange, type GitState, type StyleProfile, type TestRun } from "@shared/schema";
import { type InsertProject, type InsertSession, type InsertMemoryNote, type InsertFileChange } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  listProjects(): Promise<Project[]>;

  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session>;
  getProjectSessions(projectId: string): Promise<Session[]>;

  // Memory
  getMemoryNote(id: string): Promise<MemoryNote | undefined>;
  createMemoryNote(note: InsertMemoryNote): Promise<MemoryNote>;
  searchMemoryNotes(projectId: string, query: string): Promise<MemoryNote[]>;
  getProjectMemoryNotes(projectId: string, limit?: number): Promise<MemoryNote[]>;

  // File Changes
  getFileChange(id: string): Promise<FileChange | undefined>;
  createFileChange(change: InsertFileChange): Promise<FileChange>;
  updateFileChange(id: string, updates: Partial<FileChange>): Promise<FileChange>;
  getSessionFileChanges(sessionId: string): Promise<FileChange[]>;

  // Git State
  getGitState(projectId: string): Promise<GitState | undefined>;
  updateGitState(projectId: string, state: Partial<GitState>): Promise<GitState>;

  // Style Profile
  getStyleProfile(projectId: string): Promise<StyleProfile | undefined>;
  updateStyleProfile(projectId: string, profile: Partial<StyleProfile>): Promise<StyleProfile>;

  // Test Runs
  getTestRun(id: string): Promise<TestRun | undefined>;
  createTestRun(testRun: Omit<TestRun, 'id' | 'createdAt'>): Promise<TestRun>;
  getSessionTestRuns(sessionId: string): Promise<TestRun[]>;
  
  // File operations
  saveFile(projectId: string, path: string, content: string): Promise<void>;
  getFile(projectId: string, path: string): Promise<string>;
  listFiles(projectId: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private sessions: Map<string, Session>;
  private memoryNotes: Map<string, MemoryNote>;
  private fileChanges: Map<string, FileChange>;
  private gitStates: Map<string, GitState>;
  private styleProfiles: Map<string, StyleProfile>;
  private testRuns: Map<string, TestRun>;
  private files: Map<string, Map<string, string>>; // projectId -> (filePath -> content)

  constructor() {
    this.projects = new Map();
    this.sessions = new Map();
    this.memoryNotes = new Map();
    this.fileChanges = new Map();
    this.gitStates = new Map();
    this.styleProfiles = new Map();
    this.testRuns = new Map();
    this.files = new Map();
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error('Project not found');
    const updated = { ...existing, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const existing = this.sessions.get(id);
    if (!existing) throw new Error('Session not found');
    const updated = { ...existing, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async getProjectSessions(projectId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.projectId === projectId);
  }

  async getMemoryNote(id: string): Promise<MemoryNote | undefined> {
    return this.memoryNotes.get(id);
  }

  async createMemoryNote(insertNote: InsertMemoryNote): Promise<MemoryNote> {
    const id = randomUUID();
    const note: MemoryNote = {
      ...insertNote,
      id,
      createdAt: new Date(),
    };
    this.memoryNotes.set(id, note);
    return note;
  }

  async searchMemoryNotes(projectId: string, query: string): Promise<MemoryNote[]> {
    const notes = Array.from(this.memoryNotes.values())
      .filter(note => note.projectId === projectId);
    
    if (!query) return notes;
    
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getProjectMemoryNotes(projectId: string, limit?: number): Promise<MemoryNote[]> {
    const notes = Array.from(this.memoryNotes.values())
      .filter(note => note.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? notes.slice(0, limit) : notes;
  }

  async getFileChange(id: string): Promise<FileChange | undefined> {
    return this.fileChanges.get(id);
  }

  async createFileChange(insertChange: InsertFileChange): Promise<FileChange> {
    const id = randomUUID();
    const change: FileChange = {
      ...insertChange,
      id,
      createdAt: new Date(),
    };
    this.fileChanges.set(id, change);
    return change;
  }

  async updateFileChange(id: string, updates: Partial<FileChange>): Promise<FileChange> {
    const existing = this.fileChanges.get(id);
    if (!existing) throw new Error('File change not found');
    const updated = { ...existing, ...updates };
    this.fileChanges.set(id, updated);
    return updated;
  }

  async getSessionFileChanges(sessionId: string): Promise<FileChange[]> {
    return Array.from(this.fileChanges.values()).filter(fc => fc.sessionId === sessionId);
  }

  async getGitState(projectId: string): Promise<GitState | undefined> {
    return this.gitStates.get(projectId);
  }

  async updateGitState(projectId: string, updates: Partial<GitState>): Promise<GitState> {
    const existing = this.gitStates.get(projectId) || {
      projectId,
      branch: 'main',
      ahead: 0,
      behind: 0,
      lastCommit: null,
      updatedAt: new Date(),
    };
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.gitStates.set(projectId, updated);
    return updated;
  }

  async getStyleProfile(projectId: string): Promise<StyleProfile | undefined> {
    return this.styleProfiles.get(projectId);
  }

  async updateStyleProfile(projectId: string, updates: Partial<StyleProfile>): Promise<StyleProfile> {
    const existing = this.styleProfiles.get(projectId) || {
      projectId,
      prefsJson: {},
      updatedAt: new Date(),
    };
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.styleProfiles.set(projectId, updated);
    return updated;
  }

  async getTestRun(id: string): Promise<TestRun | undefined> {
    return this.testRuns.get(id);
  }

  async createTestRun(insertTestRun: Omit<TestRun, 'id' | 'createdAt'>): Promise<TestRun> {
    const id = randomUUID();
    const testRun: TestRun = {
      ...insertTestRun,
      id,
      createdAt: new Date(),
    };
    this.testRuns.set(id, testRun);
    return testRun;
  }

  async getSessionTestRuns(sessionId: string): Promise<TestRun[]> {
    return Array.from(this.testRuns.values()).filter(tr => tr.sessionId === sessionId);
  }

  // File operations
  async saveFile(projectId: string, path: string, content: string): Promise<void> {
    if (!this.files.has(projectId)) {
      this.files.set(projectId, new Map());
    }
    const projectFiles = this.files.get(projectId)!;
    projectFiles.set(path, content);
  }

  async getFile(projectId: string, path: string): Promise<string> {
    const projectFiles = this.files.get(projectId);
    if (!projectFiles) return '';
    return projectFiles.get(path) || '';
  }

  async listFiles(projectId: string): Promise<any[]> {
    const projectFiles = this.files.get(projectId);
    if (!projectFiles) return [];
    
    return Array.from(projectFiles.entries()).map(([path, content]) => ({
      path,
      size: content.length,
      lastModified: new Date().toISOString()
    }));
  }
}

export const storage = new MemStorage();
