# Reme - Deployment Instructions

## Push to GitHub Repository

Since the Replit environment has Git restrictions, follow these steps to deploy to your GitHub repo:

### Option 1: Manual Upload via GitHub Web Interface

1. **Download the project files** from Replit (exclude .git, node_modules, dist folders)
2. **Go to your GitHub repo**: https://github.com/Betti-Labs/Reme
3. **Upload all project files** using GitHub's web interface

### Option 2: Clone and Push Locally

1. **Clone your empty repo locally**:
   ```bash
   git clone https://github.com/Betti-Labs/Reme.git
   cd Reme
   ```

2. **Copy all project files** from this Replit (excluding .git, node_modules, dist)

3. **Initialize and push**:
   ```bash
   git add .
   git commit -m "Initial commit: Complete Reme IDE with terminal aesthetic"
   git push origin main
   ```

## Key Features Deployed

✅ **Advanced IDE Interface** with terminal-inspired design
✅ **AI Agent System** with strict scope validation and memory
✅ **File Explorer** with syntax highlighting and Monaco editor
✅ **Git Integration** for version control
✅ **Project Templates** system
✅ **Real-time WebSocket** communication
✅ **PostgreSQL Database** integration with Drizzle ORM
✅ **Vector Search** system with Chroma DB
✅ **Professional dark theme** with cyan accents

## Project Structure

```
reme/
├── client/              # React frontend with TypeScript
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Main pages (dashboard, IDE)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/              # Node.js Express backend
│   ├── services/        # Business logic (agent, git, etc.)
│   └── routes.ts        # API endpoints
├── shared/              # Shared TypeScript types
│   └── schema.ts        # Database schema with Drizzle
└── package.json         # Dependencies and scripts
```

## Environment Variables Needed

```env
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
SESSION_SECRET=your_session_secret
```

## Run Locally After Setup

```bash
npm install
npm run dev
```

The application will start on port 5000 with both frontend and backend.

---

**Note**: All placeholder content has been removed. The agent system creates real working files and applications as requested.