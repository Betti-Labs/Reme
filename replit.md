# Overview

Reme is a comprehensive web-based IDE platform designed as a better alternative to Replit. It features an intelligent AI coding agent with strict scope management, comprehensive project memory, and seamless Git integration. The platform enables developers to work collaboratively with an AI agent that remembers project context, follows team coding styles, and only makes changes explicitly requested by users. Reme combines the power of modern web development tools with intelligent automation to create a superior coding experience.

## Recent Updates (February 2025)
- ✅ Implemented comprehensive Chroma DB vector search and embeddings system
- ✅ Added Playwright visual smoke testing for UI regression detection  
- ✅ Built intelligent model routing system with local models for cost optimization
- ✅ Created production-ready project templates gallery with 4 sample templates
- ✅ Implemented AI memory system with hot/warm/cold memory tiers
- ✅ Added team collaboration features and role management
- ✅ Set up PostgreSQL database with full schema migrations
- ✅ Fixed all navigation routing issues - all pages now functional

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom GitHub-inspired dark theme and CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Monaco Editor with custom GitHub dark theme and TypeScript syntax highlighting
- **Real-time Communication**: WebSocket client for live agent communication and project updates

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Real-time**: WebSocket server for bidirectional communication between client and agent
- **Git Integration**: simple-git library for repository operations (commit, pull, push, branch management)
- **Code Analysis**: Tree-sitter for AST parsing, symbol extraction, and import graph generation
- **Storage Layer**: Abstracted storage interface supporting both in-memory and persistent storage

## Agent System
- **AI Provider**: OpenAI GPT-4o for code generation and analysis with intelligent model routing
- **Local Models**: Ollama integration with qwen2.5-coder, llama3.2, and codegemma for cost optimization
- **Model Router**: Automatic task complexity analysis and model selection based on cost/performance
- **Scope Validation**: MEQ (Minimal Explicit Query) policy enforcement to prevent unauthorized changes
- **Permission System**: Agent requests explicit approval when changes exceed initial scope
- **Patch Generation**: Hunk-level diff generation with rationale for each change
- **Memory Integration**: Context-aware prompting using hot, warm, and cold memory tiers

## Memory Architecture
- **Hot Memory**: Current session context, recent changes, active files (always in prompt)
- **Warm Memory**: Keyword/vector searchable notes from recent sessions (30-60 days)
- **Cold Memory**: Full historical data loaded on-demand for specific session recall
- **Vector Storage**: Chroma DB for semantic search across all project code and memory notes
- **Embedding Model**: OpenAI text-embedding-3-small for high-quality vector representations
- **Storage**: JSON-based memory notes with tags, links, and searchable content

## Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for structured data
- **Vector Database**: Chroma DB for semantic search and embeddings
- **Schema Design**: 
  - Projects with settings and style profiles
  - Sessions with scoped changes and approval status
  - Memory notes with tags and cross-references
  - Project templates with files and metadata
  - Team collaboration and role management
  - Visual test runs and screenshots
  - File changes with hunk-level tracking
  - Git state management
- **Memory Search**: Vector-based semantic search with relevance scoring

## Development Workflow
- **Monorepo Structure**: Client and server code in same repository with shared schema
- **Build System**: Vite for frontend, esbuild for backend production builds
- **Development**: Hot reload with Vite middleware integration
- **Type Safety**: Shared TypeScript types between client and server via `@shared` namespace

## Security & Permissions
- **Strict Scope**: Agent modifications limited to explicitly requested files and symbols
- **Approval Gates**: Permission requests for scope expansion with detailed explanations
- **Change Tracking**: All modifications tracked at hunk level with approval status
- **Revert Capability**: Full session revert functionality for quick rollbacks

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Node.js Backend**: Express.js, WebSocket server implementation

## Database & ORM
- **Drizzle ORM**: Type-safe database operations and migrations
- **PostgreSQL**: Primary database via @neondatabase/serverless
- **Database Migrations**: Drizzle Kit for schema management

## AI & Language Models
- **OpenAI API**: GPT-4o and GPT-4o-mini for code generation and analysis
- **Ollama Integration**: Local models (qwen2.5-coder, llama3.2, codegemma) for cost optimization
- **Chroma DB**: Vector database for semantic search and embeddings
- **Model Routing**: Intelligent task-to-model mapping based on complexity and cost
- **Tree-sitter**: Code parsing and AST generation for TypeScript/JavaScript

## Git Integration
- **simple-git**: Git operations (commit, pull, push, branch management)
- **Diff Processing**: jsdiff for patch generation and hunk processing

## UI & Styling
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code editor for in-browser code editing
- **Lucide React**: Icon library for consistent iconography

## Development & Tooling
- **Replit Integration**: Development environment optimizations and error overlays
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **React Hook Form**: Form state management with Zod validation
- **Playwright**: Visual regression testing and UI automation
- **Sharp**: Image processing for template previews and screenshots

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **clsx & tailwind-merge**: Conditional CSS class management
- **wouter**: Lightweight routing solution