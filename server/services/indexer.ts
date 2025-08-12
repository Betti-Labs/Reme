import fs from 'fs';
import path from 'path';
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
  modified?: boolean;
}

interface ProjectIndex {
  symbols: Record<string, any>;
  imports: Record<string, string[]>;
  exports: Record<string, string[]>;
  lastUpdated: Date;
}

class IndexerService {
  private parser: Parser;
  private indexes: Map<string, ProjectIndex> = new Map();

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript.typescript);
  }

  async getFileTree(projectId: string): Promise<FileNode[]> {
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    
    if (!fs.existsSync(projectPath)) {
      throw new Error('Project directory not found');
    }

    return this.buildFileTree(projectPath, projectPath);
  }

  async getFileContent(projectId: string, filePath: string): Promise<string> {
    const fullPath = path.join(process.cwd(), 'projects', projectId, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }

    return fs.readFileSync(fullPath, 'utf-8');
  }

  async updateFileContent(projectId: string, filePath: string, content: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'projects', projectId, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
    
    // Update index for this file
    await this.indexFile(projectId, filePath, content);
  }

  async initializeProject(projectId: string, project: any): Promise<void> {
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    
    // Create project directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      
      // Create basic files for new project
      const welcomeContent = `# Welcome to ${project.name}

This is your Reme project. The AI agent is ready to help you build amazing things!

## Getting Started
- Use the file explorer to browse your project
- Chat with the AI agent to request code changes
- Review proposed changes in the diff panel
- All changes require your approval in strict mode

Happy coding! 🚀
`;

      const packageJson = {
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: `Project ${project.name} created with Reme`,
        main: 'index.js',
        scripts: {
          start: 'node index.js',
          dev: 'nodemon index.js'
        }
      };

      fs.writeFileSync(path.join(projectPath, 'README.md'), welcomeContent);
      fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(projectPath, 'index.js'), '// Welcome to your new project!\nconsole.log("Hello from Reme!");\n');
    }
    
    // Build initial index
    await this.buildProjectIndex(projectId);
  }

  async getProjectIndex(projectId: string): Promise<ProjectIndex> {
    let index = this.indexes.get(projectId);
    
    if (!index) {
      index = await this.buildProjectIndex(projectId);
      this.indexes.set(projectId, index);
    }

    return index;
  }

  private async buildFileTree(currentPath: string, basePath: string): Promise<FileNode[]> {
    const items = fs.readdirSync(currentPath);
    const nodes: FileNode[] = [];

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);
      const relativePath = path.relative(basePath, fullPath);

      // Skip common ignore patterns
      if (this.shouldIgnore(item)) continue;

      if (stats.isDirectory()) {
        const children = await this.buildFileTree(fullPath, basePath);
        nodes.push({
          name: item,
          path: relativePath,
          type: 'directory',
          children: children.length > 0 ? children : undefined
        });
      } else {
        nodes.push({
          name: item,
          path: relativePath,
          type: 'file',
          extension: path.extname(item),
          size: stats.size,
          modified: false // This would be determined by git status
        });
      }
    }

    return nodes.sort((a, b) => {
      // Directories first, then files, both alphabetically
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private shouldIgnore(name: string): boolean {
    const ignorePatterns = [
      'node_modules',
      '.git',
      '.DS_Store',
      'dist',
      'build',
      '*.log',
      '.env',
      '.vscode',
      '.idea'
    ];

    return ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  private async buildProjectIndex(projectId: string): Promise<ProjectIndex> {
    const projectPath = path.join(process.cwd(), 'projects', projectId);
    const index: ProjectIndex = {
      symbols: {},
      imports: {},
      exports: {},
      lastUpdated: new Date()
    };

    await this.indexDirectory(projectPath, projectPath, index);
    return index;
  }

  private async indexDirectory(currentPath: string, basePath: string, index: ProjectIndex): Promise<void> {
    if (!fs.existsSync(currentPath)) return;

    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && !this.shouldIgnore(item)) {
        await this.indexDirectory(fullPath, basePath, index);
      } else if (stats.isFile() && this.isCodeFile(item)) {
        const relativePath = path.relative(basePath, fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        await this.indexFile('', relativePath, content, index);
      }
    }
  }

  private async indexFile(projectId: string, filePath: string, content: string, index?: ProjectIndex): Promise<void> {
    if (!index && projectId) {
      index = await this.getProjectIndex(projectId);
    }

    if (!index) return;

    try {
      const tree = this.parser.parse(content);
      const symbols = this.extractSymbols(tree.rootNode, content);
      const imports = this.extractImports(tree.rootNode, content);
      const exports = this.extractExports(tree.rootNode, content);

      index.symbols[filePath] = symbols;
      index.imports[filePath] = imports;
      index.exports[filePath] = exports;
      index.lastUpdated = new Date();
    } catch (error) {
      console.error(`Failed to index file ${filePath}:`, error);
    }
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h'];
    const ext = path.extname(filename).toLowerCase();
    return codeExtensions.includes(ext);
  }

  private extractSymbols(node: any, source: string): any[] {
    const symbols = [];

    const extractFromNode = (n: any) => {
      if (n.type === 'function_declaration' || n.type === 'function_expression') {
        const nameNode = n.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'function',
            name: source.slice(nameNode.startIndex, nameNode.endIndex),
            line: nameNode.startPosition.row + 1,
            column: nameNode.startPosition.column + 1
          });
        }
      } else if (n.type === 'class_declaration') {
        const nameNode = n.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'class',
            name: source.slice(nameNode.startIndex, nameNode.endIndex),
            line: nameNode.startPosition.row + 1,
            column: nameNode.startPosition.column + 1
          });
        }
      } else if (n.type === 'variable_declarator') {
        const nameNode = n.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'variable',
            name: source.slice(nameNode.startIndex, nameNode.endIndex),
            line: nameNode.startPosition.row + 1,
            column: nameNode.startPosition.column + 1
          });
        }
      }

      for (let i = 0; i < n.childCount; i++) {
        extractFromNode(n.child(i));
      }
    };

    extractFromNode(node);
    return symbols;
  }

  private extractImports(node: any, source: string): string[] {
    const imports = [];

    const extractFromNode = (n: any) => {
      if (n.type === 'import_statement') {
        const sourceNode = n.childForFieldName('source');
        if (sourceNode) {
          const importPath = source.slice(sourceNode.startIndex + 1, sourceNode.endIndex - 1); // Remove quotes
          imports.push(importPath);
        }
      }

      for (let i = 0; i < n.childCount; i++) {
        extractFromNode(n.child(i));
      }
    };

    extractFromNode(node);
    return imports;
  }

  private extractExports(node: any, source: string): string[] {
    const exports = [];

    const extractFromNode = (n: any) => {
      if (n.type === 'export_statement' || n.type === 'export_declaration') {
        // Extract export information
        const declarationNode = n.childForFieldName('declaration');
        if (declarationNode) {
          const nameNode = declarationNode.childForFieldName('name');
          if (nameNode) {
            exports.push(source.slice(nameNode.startIndex, nameNode.endIndex));
          }
        }
      }

      for (let i = 0; i < n.childCount; i++) {
        extractFromNode(n.child(i));
      }
    };

    extractFromNode(node);
    return exports;
  }
}

export const indexerService = new IndexerService();
