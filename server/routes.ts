import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { vectorService } from "./services/vector";
import { modelRouter } from "./services/models";
import { nanoid } from 'nanoid';

// Mock sample templates for demo
const sampleTemplates = [
  {
    id: nanoid(),
    name: "React TypeScript Starter",
    description: "A modern React application with TypeScript, Tailwind CSS, and essential tooling setup",
    category: "web",
    tags: ["react", "typescript", "tailwindcss", "vite"],
    author: "Reme Team",
    downloads: 1247,
    stars: 89,
    filesJson: [
      { path: "src/App.tsx", content: "import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100\">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;" },
      { path: "src/main.tsx", content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);" },
      { path: "package.json", content: "{\n  \"name\": \"react-typescript-starter\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc && vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.2.43\",\n    \"@types/react-dom\": \"^18.2.17\",\n    \"@vitejs/plugin-react\": \"^4.2.1\",\n    \"autoprefixer\": \"^10.4.16\",\n    \"postcss\": \"^8.4.32\",\n    \"tailwindcss\": \"^3.4.0\",\n    \"typescript\": \"^5.2.2\",\n    \"vite\": \"^5.0.8\"\n  }\n}" }
    ],
    dependencies: ["react", "typescript", "tailwindcss", "vite"],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: nanoid(),
    name: "Express API with TypeScript",
    description: "RESTful API server with Express, TypeScript, and PostgreSQL integration",
    category: "api",
    tags: ["express", "typescript", "postgresql", "api"],
    author: "Reme Team", 
    downloads: 934,
    stars: 67,
    filesJson: [
      { path: "src/index.ts", content: "import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.use(cors());\napp.use(express.json());\n\napp.get('/health', (req, res) => {\n  res.json({ status: 'ok', timestamp: new Date().toISOString() });\n});\n\napp.listen(port, () => {\n  console.log(`Server running on port ${port}`);\n});" },
      { path: "package.json", content: "{\n  \"name\": \"express-typescript-api\",\n  \"version\": \"1.0.0\",\n  \"main\": \"dist/index.js\",\n  \"scripts\": {\n    \"dev\": \"tsx watch src/index.ts\",\n    \"build\": \"tsc\",\n    \"start\": \"node dist/index.js\"\n  },\n  \"dependencies\": {\n    \"express\": \"^4.18.2\",\n    \"cors\": \"^2.8.5\",\n    \"pg\": \"^8.11.3\"\n  },\n  \"devDependencies\": {\n    \"@types/express\": \"^4.17.21\",\n    \"@types/cors\": \"^2.8.17\",\n    \"@types/pg\": \"^8.10.9\",\n    \"typescript\": \"^5.2.2\",\n    \"tsx\": \"^4.6.0\"\n  }\n}" }
    ],
    dependencies: ["express", "typescript", "postgresql", "cors"],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: nanoid(),
    name: "Next.js AI Chat App",
    description: "AI-powered chat application with Next.js, OpenAI integration, and real-time messaging",
    category: "ai",
    tags: ["nextjs", "openai", "websockets", "ai", "chat"],
    author: "Reme Community",
    downloads: 2156,
    stars: 134,
    filesJson: [
      { path: "app/page.tsx", content: "import ChatInterface from './components/ChatInterface';\n\nexport default function Home() {\n  return (\n    <main className=\"flex min-h-screen flex-col items-center justify-between p-24\">\n      <div className=\"z-10 max-w-5xl w-full items-center justify-between font-mono text-sm\">\n        <h1 className=\"text-4xl font-bold text-center mb-8\">AI Chat Assistant</h1>\n        <ChatInterface />\n      </div>\n    </main>\n  );\n}" },
      { path: "package.json", content: "{\n  \"name\": \"nextjs-ai-chat\",\n  \"version\": \"0.1.0\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"build\": \"next build\",\n    \"start\": \"next start\",\n    \"lint\": \"next lint\"\n  },\n  \"dependencies\": {\n    \"next\": \"14.0.4\",\n    \"react\": \"^18\",\n    \"react-dom\": \"^18\",\n    \"openai\": \"^4.20.1\",\n    \"ws\": \"^8.14.2\"\n  },\n  \"devDependencies\": {\n    \"typescript\": \"^5\",\n    \"@types/node\": \"^20\",\n    \"@types/react\": \"^18\",\n    \"@types/react-dom\": \"^18\",\n    \"@types/ws\": \"^8.5.10\"\n  }\n}" }
    ],
    dependencies: ["nextjs", "openai", "websockets", "typescript"],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: nanoid(),
    name: "Vue 3 Dashboard",
    description: "Modern dashboard template with Vue 3, Composition API, and Chart.js visualizations",
    category: "web",
    tags: ["vue", "dashboard", "chartjs", "typescript"],
    author: "Reme Community",
    downloads: 756,
    stars: 45,
    filesJson: [
      { path: "src/App.vue", content: "<template>\n  <div id=\"app\">\n    <DashboardLayout>\n      <router-view />\n    </DashboardLayout>\n  </div>\n</template>\n\n<script setup lang=\"ts\">\nimport DashboardLayout from './components/DashboardLayout.vue';\n</script>" },
      { path: "package.json", content: "{\n  \"name\": \"vue3-dashboard\",\n  \"version\": \"0.0.0\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vue-tsc && vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"vue\": \"^3.3.8\",\n    \"vue-router\": \"^4.2.5\",\n    \"chart.js\": \"^4.4.0\",\n    \"vue-chartjs\": \"^5.2.0\"\n  },\n  \"devDependencies\": {\n    \"@vitejs/plugin-vue\": \"^4.5.0\",\n    \"typescript\": \"^5.2.2\",\n    \"vue-tsc\": \"^1.8.22\",\n    \"vite\": \"^5.0.0\"\n  }\n}" }
    ],
    dependencies: ["vue", "typescript", "chartjs", "vite"],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-30')
  }
];

export function registerRoutes(app: Express): Server {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.listProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const { category, search } = req.query;
      let templates = sampleTemplates;

      if (category && category !== 'all') {
        templates = templates.filter(t => t.category === category);
      }

      if (search) {
        const query = search.toString().toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = sampleTemplates.find(t => t.id === req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:id/create-project", async (req, res) => {
    try {
      const template = sampleTemplates.find(t => t.id === req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Create project from template
      const project = await storage.createProject({
        name: `${template.name} Project`,
        repoUrl: null,
        defaultBranch: "main",
        settingsJson: {
          strictMode: false,
          maxLines: 1000,
          maxFiles: 50,
          forbiddenGlobs: ["node_modules/**", ".git/**"],
          styleFreeze: false
        }
      });

      // Index the template files in vector DB
      try {
        await vectorService.addProjectCode(project.id, 
          template.filesJson.map(file => ({
            path: file.path,
            content: file.content,
            type: file.path.split('.').pop() || 'txt'
          }))
        );
      } catch (vectorError) {
        console.warn("Vector indexing failed:", vectorError);
      }

      // Increment downloads
      const templateIndex = sampleTemplates.findIndex(t => t.id === req.params.id);
      if (templateIndex !== -1) {
        sampleTemplates[templateIndex].downloads++;
      }

      res.json(project);
    } catch (error) {
      console.error("Error creating project from template:", error);
      res.status(500).json({ error: "Failed to create project from template" });
    }
  });

  // Memory Notes
  app.get("/api/memory/search", async (req, res) => {
    try {
      const { query, tags } = req.query;
      const tagArray = tags ? tags.toString().split(',') : [];
      
      let notes = [];
      
      if (query || tagArray.length > 0) {
        // Use vector search if available
        try {
          const results = await vectorService.searchMemory(
            query?.toString() || '',
            tagArray,
            20
          );
          
          notes = results.documents?.[0]?.map((doc: string, index: number) => ({
            id: results.ids?.[0]?.[index] || nanoid(),
            content: doc,
            tags: results.metadatas?.[0]?.[index]?.tags?.split(',') || [],
            links: results.metadatas?.[0]?.[index]?.links?.split(',') || [],
            session_id: results.metadatas?.[0]?.[index]?.session_id || 'unknown',
            created_at: results.metadatas?.[0]?.[index]?.created_at || new Date().toISOString(),
            updated_at: results.metadatas?.[0]?.[index]?.created_at || new Date().toISOString(),
            relevance_score: 1 - (results.distances?.[0]?.[index] || 0)
          })) || [];
        } catch (vectorError) {
          console.warn("Vector search failed, falling back:", vectorError);
          // Fallback to empty array for now
          notes = [];
        }
      }

      res.json({ notes, total: notes.length });
    } catch (error) {
      console.error("Error searching memory notes:", error);
      res.status(500).json({ error: "Failed to search memory notes" });
    }
  });

  app.get("/api/memory/stats", async (req, res) => {
    try {
      // Mock stats for now - in production would come from vector DB
      const stats = {
        total_notes: 0,
        hot_memory_count: 0,
        warm_memory_count: 0,  
        cold_memory_count: 0,
        most_used_tags: ["react", "typescript", "api", "database", "ui"]
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching memory stats:", error);
      res.status(500).json({ error: "Failed to fetch memory stats" });
    }
  });

  app.post("/api/memory/notes", async (req, res) => {
    try {
      const { content, tags, links } = req.body;
      const sessionId = nanoid();
      
      // Store in vector DB
      try {
        await vectorService.addMemoryNote(sessionId, content, tags, links);
      } catch (vectorError) {
        console.warn("Vector storage failed:", vectorError);
      }

      const note = {
        id: nanoid(),
        content,
        tags: tags || [],
        links: links || [],
        session_id: sessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      res.json(note);
    } catch (error) {
      console.error("Error creating memory note:", error);
      res.status(500).json({ error: "Failed to create memory note" });
    }
  });

  // File operations
  app.get("/api/files/:projectId", async (req, res) => {
    try {
      const files = await storage.listFiles(req.params.projectId);
      res.json(files);
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  app.get("/api/files/:projectId/:path(*)", async (req, res) => {
    try {
      const content = await storage.getFile(req.params.projectId, req.params.path);
      res.json({ content });
    } catch (error) {
      console.error("Error getting file:", error);
      res.status(500).json({ error: "Failed to get file" });
    }
  });

  app.put("/api/files/:projectId/:path(*)", async (req, res) => {
    try {
      const { content } = req.body;
      await storage.saveFile(req.params.projectId, req.params.path, content);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  // Sessions
  app.get("/api/projects/:id/sessions", async (req, res) => {
    try {
      const sessions = await storage.getProjectSessions(req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const { projectId, prompt } = req.body;
      
      // Create session with the user message
      const session = await storage.createSession({
        projectId,
        prompt,
        messages: [{
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString()
        }],
        status: 'active'
      });

      // Send response immediately with user message
      res.json(session);

      // Generate AI response asynchronously
      setTimeout(async () => {
        try {
          // Use a local model for faster responses and file generation
          const modelConfig = {
            name: "qwen2.5-coder",
            provider: "ollama" as const,
            maxTokens: 4000,
            costPerToken: 0,
            capabilities: ['code', 'analysis'],
            local: true
          };
          
          // Get project files for context
          const projectFiles = await storage.listFiles(projectId);
          
          const systemPrompt = `You are Reme, an AI coding assistant that BUILDS complete working applications.

When a user requests code to be built or created:
1. Generate the complete, functional code
2. Wrap each file's code in a code block with a comment indicating the filename
3. I will automatically create the files for you
4. Provide a brief summary of what was built

Current project files: ${projectFiles.map(f => f.path).join(', ') || 'No files yet'}

IMPORTANT: 
- Always provide complete, working code implementations
- Use code blocks with clear filename comments like: // filename: hello-world.html
- Make code production-ready and fully functional
- If building web apps, include proper HTML structure with all necessary dependencies`;

          // For demo purposes, let's create a simple mock response for now
          let aiResponse = {
            content: `I'll create a simple HTML Hello World page for you.

\`\`\`html
// filename: hello-world.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 3rem;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>This page was created by the Reme AI agent!</p>
    </div>
</body>
</html>
\`\`\`

Created a beautiful Hello World HTML page with gradient background and modern styling!`
          };

          // For Three.js requests, provide a different mock response
          if (prompt.toLowerCase().includes('three.js') || prompt.toLowerCase().includes('3d')) {
            aiResponse = {
              content: `I'll create a Three.js rotating Hello World for you.

\`\`\`html
// filename: threejs-hello-world.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Rotating Hello World</title>
    <style>
        body {
            margin: 0;
            background: #000;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create text geometry
        const loader = new THREE.FontLoader();
        let textMesh;

        // Simple cube as placeholder for text
        const geometry = new THREE.BoxGeometry(2, 1, 0.2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff88,
            wireframe: false
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Position camera
        camera.position.z = 5;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate the cube
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>
\`\`\`

Created a rotating 3D cube with Three.js that represents Hello World! The cube rotates continuously with proper lighting and responds to window resizing.`
            };
          }

          // Try the real AI generation but fall back to mock if it fails
          let finalAiResponse = aiResponse;
          try {
            const realAiResponse = await modelRouter.generateCompletion(
              modelConfig,
              [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              {}
            );
            if (realAiResponse && realAiResponse.content) {
              console.log("✅ Real AI response generated successfully");
              finalAiResponse = realAiResponse;
            }
          } catch (error: any) {
            console.warn("AI generation failed, using mock response:", error?.message || error);
            // Keep the mock response as finalAiResponse
          }

          // Use the final AI response for file creation and messages
          aiResponse = finalAiResponse;

          // Always parse AI response for file operations when user requests building/creating
          if (aiResponse.content.includes('```')) {
            // Extract code blocks and create files
            const codeBlocks = aiResponse.content.match(/```[\s\S]*?```/g);
            if (codeBlocks) {
              for (const block of codeBlocks) {
                const lines = block.split('\n');
                let content = lines.slice(1, -1).join('\n');
                
                // Look for filename comment in the content or first line
                let fileName = 'untitled.txt';
                const firstLine = lines[0].toLowerCase();
                const contentLines = content.split('\n');
                
                // Check for filename comment in content
                const filenameComment = contentLines.find(line => 
                  line.includes('filename:') || line.includes('file:') || line.includes('path:')
                );
                
                if (filenameComment) {
                  const match = filenameComment.match(/(?:filename:|file:|path:)\s*([^\s,]+)/i);
                  if (match) {
                    fileName = match[1];
                  }
                } else if (firstLine.includes('html')) {
                  fileName = 'index.html';
                } else if (firstLine.includes('javascript') || firstLine.includes('js')) {
                  fileName = 'script.js';
                } else if (firstLine.includes('css')) {
                  fileName = 'styles.css';
                } else if (firstLine.includes('python') || firstLine.includes('py')) {
                  fileName = 'main.py';
                }
                
                // Remove filename comments from content
                content = content.replace(/^\s*\/\/\s*(?:filename:|file:|path:).*$/gm, '').trim();
                
                // Create the file using storage
                try {
                  await storage.saveFile(projectId, fileName, content);
                  console.log(`✅ Created file: ${fileName} (${content.length} chars)`);
                } catch (error) {
                  console.warn('Failed to create file:', fileName, error);
                }
              }
            }
          }

          // Add AI response to session
          const aiMessage = {
            role: 'assistant' as const,
            content: aiResponse.content,
            timestamp: new Date().toISOString()
          };
          
          const existingMessages = session.messages || [];
          const updatedMessages = [...existingMessages, aiMessage];
          
          await storage.updateSession(session.id, {
            messages: updatedMessages,
            status: 'completed'
          });
        } catch (aiError) {
          console.error("AI response error:", aiError);
          
          // Use the mock response even when AI fails - for demo purposes until API is working
          const fallbackMessage = {
            role: 'assistant' as const,
            content: aiResponse.content,
            timestamp: new Date().toISOString()
          };
          
          // Also try to create files from the mock response
          if (aiResponse.content.includes('```')) {
            const codeBlocks = aiResponse.content.match(/```[\s\S]*?```/g);
            if (codeBlocks) {
              for (const block of codeBlocks) {
                const lines = block.split('\n');
                let content = lines.slice(1, -1).join('\n');
                
                let fileName = 'untitled.txt';
                const contentLines = content.split('\n');
                
                const filenameComment = contentLines.find(line => 
                  line.includes('filename:') || line.includes('file:') || line.includes('path:')
                );
                
                if (filenameComment) {
                  const match = filenameComment.match(/(?:filename:|file:|path:)\s*([^\s,]+)/i);
                  if (match) {
                    fileName = match[1];
                  }
                } else if (lines[0].toLowerCase().includes('html')) {
                  fileName = 'index.html';
                }
                
                content = content.replace(/^\s*\/\/\s*(?:filename:|file:|path:).*$/gm, '').trim();
                
                try {
                  await storage.saveFile(projectId, fileName, content);
                  console.log(`✅ Created file: ${fileName} (${content.length} chars)`);
                } catch (error) {
                  console.warn('Failed to create file:', fileName, error);
                }
              }
            }
          }
          
          const existingMessages = session.messages || [];
          const updatedMessages = [...existingMessages, fallbackMessage];
          
          await storage.updateSession(session.id, {
            messages: updatedMessages,
            status: 'completed'
          });
        }
      }, 100); // Small delay to ensure response is sent first
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Model routing
  app.post("/api/ai/route", async (req, res) => {
    try {
      const { task, messages, options } = req.body;
      
      const modelConfig = await modelRouter.routeRequest(task);
      const response = await modelRouter.generateCompletion(modelConfig, messages, options);
      
      res.json({
        ...response,
        model: modelConfig.name,
        provider: modelConfig.provider
      });
    } catch (error) {
      console.error("Error routing AI request:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  app.get("/api/ai/models", async (req, res) => {
    try {
      const models = modelRouter.getAvailableModels();
      const localModels = await modelRouter.listLocalModels();
      
      res.json({
        available: models,
        local: localModels
      });
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // Visual Testing
  app.get("/api/projects/:id/visual-tests", async (req, res) => {
    try {
      // Mock visual test results for now
      const tests = [
        {
          id: nanoid(),
          projectId: req.params.id,
          testName: "landing-page",
          status: "passed",
          screenshotPath: "/screenshots/landing-page-latest.png",
          baselinePath: "/screenshots/landing-page-baseline.png",
          threshold: 100,
          duration: 1234,
          createdAt: new Date()
        }
      ];
      
      res.json(tests);
    } catch (error) {
      console.error("Error fetching visual tests:", error);
      res.status(500).json({ error: "Failed to fetch visual tests" });
    }
  });

  app.post("/api/projects/:id/visual-tests/run", async (req, res) => {
    try {
      // In production, this would trigger Playwright tests
      const testRun = {
        id: nanoid(),
        projectId: req.params.id,
        status: "running",
        started_at: new Date().toISOString(),
        tests: ["landing-page", "navigation", "project-creation"]
      };
      
      res.json(testRun);
    } catch (error) {
      console.error("Error running visual tests:", error);
      res.status(500).json({ error: "Failed to run visual tests" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);
        
        // Handle different message types
        if (message.type === 'join_project') {
          // Join project room logic
          ws.send(JSON.stringify({
            type: 'connection_confirmed',
            projectId: message.projectId
          }));
        } else if (message.type === 'agent_message') {
          // Handle agent messages
          ws.send(JSON.stringify({
            type: 'agent_response',
            message: 'Agent received your message',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  return httpServer;
}