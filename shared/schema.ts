import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  repoUrl: text("repo_url"),
  defaultBranch: text("default_branch").default("main"),
  settingsJson: json("settings_json").$type<{
    strictMode?: boolean;
    maxLines?: number;
    maxFiles?: number;
    forbiddenGlobs?: string[];
    styleFreeze?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  prompt: text("prompt").notNull(),
  messages: json("messages").$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>().default([]),
  scopeJson: json("scope_json").$type<{
    goal: string;
    files: string[];
    symbols: string[];
    forbidden: string[];
    budget: { maxTokens: number; maxCost: number };
  }>(),
  diffSummary: text("diff_summary"),
  status: text("status").notNull().default("active"), // active, completed, failed, pending_approval
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryNotes = pgTable("memory_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  links: json("links").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const styleProfiles = pgTable("style_profiles", {
  projectId: varchar("project_id").references(() => projects.id).primaryKey(),
  prefsJson: json("prefs_json").$type<{
    codeStyle: string;
    naming: string;
    patterns: string[];
    lintRules: Record<string, any>;
  }>().default({}),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gitStates = pgTable("git_states", {
  projectId: varchar("project_id").references(() => projects.id).primaryKey(),
  branch: text("branch").notNull(),
  ahead: integer("ahead").default(0),
  behind: integer("behind").default(0),
  lastCommit: text("last_commit"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testRuns = pgTable("test_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  resultsJson: json("results_json").$type<{
    passed: number;
    failed: number;
    skipped: number;
    details: Array<{ test: string; status: string; error?: string }>;
  }>(),
  artifactsPath: text("artifacts_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileChanges = pgTable("file_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  filePath: text("file_path").notNull(),
  changeType: text("change_type").notNull(), // create, modify, delete
  hunks: json("hunks").$type<Array<{
    id: string;
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    content: string;
    approved: boolean;
    rationale: string;
  }>>().default([]),
  applied: boolean("applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  author: text("author").notNull(),
  downloads: integer("downloads").default(0),
  stars: integer("stars").default(0),
  previewUrl: text("preview_url"),
  repositoryUrl: text("repository_url"),
  filesJson: json("files_json").$type<Array<{ path: string; content: string }>>().notNull(),
  dependencies: json("dependencies").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborators = pgTable("collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  userId: text("user_id").notNull(),
  role: text("role").default("developer").notNull(), // owner, admin, developer, viewer
  permissions: json("permissions").$type<string[]>().default([]),
  invitedBy: text("invited_by"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const visualTests = pgTable("visual_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  testName: text("test_name").notNull(),
  status: text("status").notNull(), // passed, failed, running
  screenshotPath: text("screenshot_path"),
  baselinePath: text("baseline_path"),
  diffPath: text("diff_path"),
  threshold: integer("threshold").default(100), // pixel difference threshold
  duration: integer("duration"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertMemoryNoteSchema = createInsertSchema(memoryNotes).omit({ id: true, createdAt: true });
export const insertFileChangeSchema = createInsertSchema(fileChanges).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, downloads: true, stars: true, createdAt: true, updatedAt: true });
export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({ id: true, joinedAt: true });

// Types
export type Project = typeof projects.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type MemoryNote = typeof memoryNotes.$inferSelect;
export type StyleProfile = typeof styleProfiles.$inferSelect;
export type GitState = typeof gitStates.$inferSelect;
export type TestRun = typeof testRuns.$inferSelect;
export type FileChange = typeof fileChanges.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Collaborator = typeof collaborators.$inferSelect;
export type VisualTest = typeof visualTests.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertMemoryNote = z.infer<typeof insertMemoryNoteSchema>;
export type InsertFileChange = z.infer<typeof insertFileChangeSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
