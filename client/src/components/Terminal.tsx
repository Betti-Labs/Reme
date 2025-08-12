import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface TerminalProps {
  projectId: string;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export default function Terminal({ projectId }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Reme IDE Terminal - Ready',
      timestamp: new Date()
    },
    {
      id: '2', 
      type: 'input',
      content: 'npm run dev',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'output', 
      content: '> concurrently "cd apps/backend && node server.js" "cd apps/frontend && npm run dev"',
      timestamp: new Date()
    },
    {
      id: '4',
      type: 'output',
      content: '[0] Backend server running on port 3001',
      timestamp: new Date()
    },
    {
      id: '5',
      type: 'output',
      content: '[1] Frontend dev server running on port 5173',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [currentPath] = useState("~/reme-full");
  const [currentBranch] = useState("main");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (command: string) => {
    const newInputLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      content: command,
      timestamp: new Date()
    };

    // Mock command processing
    let outputContent = '';
    switch (command.toLowerCase().trim()) {
      case 'ls':
      case 'dir':
        outputContent = 'apps/  services/  package.json  README.md  tsconfig.json';
        break;
      case 'pwd':
        outputContent = currentPath;
        break;
      case 'git status':
        outputContent = `On branch ${currentBranch}\nChanges to be committed:\n  modified:   components/ShareModal.tsx\n  new file:   utils/clipboard.ts`;
        break;
      case 'clear':
        setLines([]);
        setInput("");
        return;
      case 'help':
        outputContent = 'Available commands: ls, pwd, git status, npm run dev, clear, help';
        break;
      default:
        if (command.startsWith('npm')) {
          outputContent = 'Running npm command...';
        } else if (command.startsWith('git')) {
          outputContent = 'Git command executed';
        } else {
          outputContent = `Command not found: ${command}`;
        }
    }

    const outputLine: TerminalLine = {
      id: (Date.now() + 1).toString(),
      type: outputContent.includes('not found') ? 'error' : 'output',
      content: outputContent,
      timestamp: new Date()
    };

    setLines(prev => [...prev, newInputLine, outputLine]);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-github-text';
      case 'error':
        return 'text-red-400';
      case 'output':
        return 'text-github-text-secondary';
      default:
        return 'text-github-text-secondary';
    }
  };

  const getPrompt = () => (
    <div className="flex items-center space-x-2 font-mono text-sm">
      <span className="text-github-success">➜</span>
      <span className="text-github-primary">{projectId}</span>
      <span className="text-github-text-secondary">git:({currentBranch})</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-github-bg font-mono">
      {/* Terminal Output */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-1">
          {lines.map((line) => (
            <div key={line.id} className="flex">
              {line.type === 'input' && getPrompt()}
              <div className={`ml-2 ${getLineClass(line.type)} whitespace-pre-wrap`}>
                {line.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Terminal Input */}
      <div className="p-4 border-t border-github-border">
        <div className="flex items-center space-x-2">
          {getPrompt()}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none p-0 text-github-text font-mono focus:ring-0 focus:outline-none"
            placeholder="Type a command..."
          />
        </div>
      </div>
    </div>
  );
}
