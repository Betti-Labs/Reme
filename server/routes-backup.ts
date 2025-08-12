import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProjectSchema, insertSessionSchema, insertMemoryNoteSchema } from "@shared/schema";
import { gitService } from "./services/git";
import { agentService } from "./services/agent";
import { memoryService } from "./services/memory";
import { indexerService } from "./services/indexer";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, ws);
    
    ws.on('close', () => {
      clients.delete(clientId);
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Handle different WebSocket message types
        switch (message.type) {
          case 'join_project':
            // Join project-specific room for updates
            break;
          case 'agent_message':
            // Handle agent communication
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.listProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Initialize git state
      await storage.updateGitState(project.id, {
        branch: project.defaultBranch || 'main',
        ahead: 0,
        behind: 0,
      });

      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects/:id/settings', async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Session routes
  app.post('/api/sessions', async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      
      // Process with agent
      agentService.processSession(session).then((result) => {
        broadcast({
          type: 'session.updated',
          sessionId: session.id,
          data: result
        });
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  app.post('/api/sessions/:id/approve', async (req, res) => {
    try {
      const { allow, addFiles, addSymbols } = req.body;
      const session = await storage.getSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (allow) {
        // Update session scope and continue processing
        const updatedScope = {
          ...session.scopeJson,
          files: [...(session.scopeJson?.files || []), ...(addFiles || [])],
          symbols: [...(session.scopeJson?.symbols || []), ...(addSymbols || [])]
        };
        
        await storage.updateSession(req.params.id, { scopeJson: updatedScope });
        
        // Continue with agent processing
        agentService.continueSession(session.id, updatedScope);
      } else {
        // Reject and mark session as failed
        await storage.updateSession(req.params.id, { status: 'failed' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/sessions/:id/apply', async (req, res) => {
    try {
      const { hunks } = req.body;
      const session = await storage.getSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Apply selected hunks
      const changes = await storage.getSessionFileChanges(req.params.id);
      
      for (const change of changes) {
        if (hunks && hunks.length > 0) {
          // Apply only selected hunks
          const updatedHunks = change.hunks.map(hunk => ({
            ...hunk,
            approved: hunks.includes(hunk.id)
          }));
          await storage.updateFileChange(change.id, { hunks: updatedHunks });
        } else {
          // Apply all hunks
          const updatedHunks = change.hunks.map(hunk => ({
            ...hunk,
            approved: true
          }));
          await storage.updateFileChange(change.id, { hunks: updatedHunks, applied: true });
        }
      }

      await storage.updateSession(req.params.id, { status: 'completed' });
      
      broadcast({
        type: 'session.finished',
        sessionId: req.params.id
      });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/sessions/:id/revert', async (req, res) => {
    try {
      const changes = await storage.getSessionFileChanges(req.params.id);
      
      for (const change of changes) {
        await storage.updateFileChange(change.id, { applied: false });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Memory routes
  app.get('/api/memory/:projectId/search', async (req, res) => {
    try {
      const { q } = req.query;
      const notes = await storage.searchMemoryNotes(req.params.projectId, q as string || '');
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search memory' });
    }
  });

  app.post('/api/memory/:projectId', async (req, res) => {
    try {
      const noteData = insertMemoryNoteSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const note = await storage.createMemoryNote(noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Git routes
  app.post('/api/git/:projectId/commit', async (req, res) => {
    try {
      const { message, stage } = req.body;
      const result = await gitService.commit(req.params.projectId, message, stage);
      
      broadcast({
        type: 'git.updated',
        projectId: req.params.projectId,
        data: result
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/git/:projectId/pull', async (req, res) => {
    try {
      const result = await gitService.pull(req.params.projectId);
      
      broadcast({
        type: 'git.updated',
        projectId: req.params.projectId,
        data: result
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/git/:projectId/push', async (req, res) => {
    try {
      const result = await gitService.push(req.params.projectId);
      
      broadcast({
        type: 'git.updated',
        projectId: req.params.projectId,
        data: result
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/git/:projectId/branch', async (req, res) => {
    try {
      const { action, name } = req.body;
      const result = await gitService.manageBranch(req.params.projectId, action, name);
      
      broadcast({
        type: 'git.updated',
        projectId: req.params.projectId,
        data: result
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/git/:projectId/status', async (req, res) => {
    try {
      const status = await gitService.getStatus(req.params.projectId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get git status' });
    }
  });

  // Project initialization
  app.post('/api/projects/:id/initialize', async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Initialize project directory structure
      await indexerService.initializeProject(projectId, project);
      
      res.json({ success: true, message: 'Project initialized successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize project' });
    }
  });

  // File system routes
  app.get('/api/files/:projectId', async (req, res) => {
    try {
      const files = await indexerService.getFileTree(req.params.projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get file tree' });
    }
  });

  app.get('/api/files/:projectId/*', async (req, res) => {
    try {
      const filePath = req.params[0];
      const content = await indexerService.getFileContent(req.params.projectId, filePath);
      res.json({ content });
    } catch (error) {
      res.status(404).json({ error: 'File not found' });
    }
  });

  return httpServer;
}
