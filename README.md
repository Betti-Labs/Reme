# Reme - AI-Powered Web IDE

A sophisticated web-based Integrated Development Environment (IDE) with AI agent capabilities, built with a terminal-inspired aesthetic and modern web technologies.

## 🚀 Features

### Core IDE Functionality
- **Monaco Editor Integration** - Full-featured code editor with syntax highlighting
- **File Explorer** - Navigate and manage project files with ease
- **Terminal Interface** - Built-in terminal with command execution
- **Git Integration** - Version control with visual diff viewer
- **Project Management** - Create, organize, and manage multiple projects

### AI Agent System
- **Intelligent Code Assistant** - AI-powered code generation and suggestions
- **Memory System** - Persistent context and project understanding
- **Strict Scope Validation** - Ensures AI stays within project boundaries
- **Vector Search** - Semantic code search and understanding

### Modern UI/UX
- **Terminal Aesthetic** - Dark theme with cyan accents for a professional look
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Real-time Updates** - WebSocket-powered live collaboration features
- **Component Library** - Built with Radix UI and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Monaco Editor** for code editing
- **Framer Motion** for animations
- **React Query** for state management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **WebSocket** for real-time communication
- **PostgreSQL** with Drizzle ORM
- **Chroma DB** for vector storage
- **OpenAI/Anthropic** API integration

### Development Tools
- **Playwright** for end-to-end testing
- **ESBuild** for fast bundling
- **Drizzle Kit** for database migrations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI or Anthropic API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Betti-Labs/Reme.git
   cd Reme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   SESSION_SECRET=your_session_secret_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
reme/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base UI components (Radix UI)
│   │   │   ├── AgentPanel.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── Monaco.tsx
│   │   │   └── Terminal.tsx
│   │   ├── pages/          # Application pages
│   │   │   ├── dashboard.tsx
│   │   │   ├── ide.tsx
│   │   │   └── projects.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API clients
│   │   └── index.css       # Global styles
├── server/                 # Node.js backend
│   ├── services/           # Business logic services
│   │   ├── agent.ts        # AI agent service
│   │   ├── git.ts          # Git operations
│   │   ├── memory.ts       # Memory management
│   │   └── vector.ts       # Vector search
│   ├── index.ts            # Server entry point
│   └── routes.ts           # API route definitions
├── shared/                 # Shared TypeScript definitions
│   └── schema.ts           # Database schema (Drizzle)
├── projects/               # User project storage
├── tests/                  # Test files
└── scripts/                # Utility scripts
```

## 🚀 Usage

### Creating a New Project
1. Navigate to the dashboard
2. Click "New Project" or select a template
3. Configure project settings
4. Start coding in the IDE

### Using the AI Agent
1. Open the Agent Panel in the IDE
2. Describe what you want to build or modify
3. The AI will generate code within your project scope
4. Review and apply the suggested changes

### Git Integration
1. Initialize a repository in your project
2. Use the Git Panel to stage, commit, and push changes
3. View diffs and manage branches visually

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run Playwright end-to-end tests:
```bash
npx playwright test
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by VS Code and terminal-based development environments
- Powered by OpenAI and Anthropic AI models

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Reme** - Where AI meets development productivity 🚀