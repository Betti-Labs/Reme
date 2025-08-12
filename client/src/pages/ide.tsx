import { useState } from "react";
import { useParams } from "wouter";
import FileExplorer from "@/components/FileExplorer";
import Monaco from "@/components/Monaco";
import AgentPanel from "@/components/AgentPanel";
import DiffPanel from "@/components/DiffPanel";
import MemoryPanel from "@/components/MemoryPanel";
import GitPanel from "@/components/GitPanel";
import Terminal from "@/components/Terminal";
import StatusBar from "@/components/StatusBar";
import { useIDE } from "@/hooks/useIDE";
import { cn } from "@/lib/utils";

export default function IDE() {
  const { id: projectId } = useParams();
  const [activePanel, setActivePanel] = useState("agent");
  const [activeBottomPanel, setActiveBottomPanel] = useState("terminal");
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");

  // Redirect to dashboard if no project ID
  if (!projectId) {
    window.location.href = '/';
    return null;
  }
  
  const {
    currentFile,
    fileContent,
    tabs,
    gitStatus,
    sessions,
    isConnected,
    project,
    openFile,
    closeTab,
    sendMessage,
    commitChanges,
    pullChanges,
    pushChanges
  } = useIDE(projectId || "");

  const sidebarTabs = [
    { id: "explorer", icon: "fas fa-folder", title: "Explorer" },
    { id: "agent", icon: "fas fa-robot", title: "Agent" },
    { id: "git", icon: "fas fa-code-branch", title: "Git" },
    { id: "memory", icon: "fas fa-brain", title: "Memory" },
    { id: "settings", icon: "fas fa-cog", title: "Settings" }
  ];

  const rightPanelTabs = [
    { id: "agent", label: "Agent" },
    { id: "diff", label: "Diff" },
    { id: "memory", label: "Memory" }
  ];

  const bottomPanelTabs = [
    { id: "terminal", label: "Terminal" },
    { id: "git", label: "Git" },
    { id: "tests", label: "Tests" },
    { id: "problems", label: "Problems" }
  ];

  return (
    <div className="flex h-screen bg-github-bg text-github-text font-code">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-github-surface border-b border-github-border flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-github-text-secondary hover:text-github-primary transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-home text-sm"></i>
            <span className="text-sm font-medium">REME</span>
          </button>
          <div className="text-github-accent text-sm font-mono">
            {(project as any)?.name || 'Loading...'}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-github-text-secondary font-mono">
            v1.0.0
          </div>
          <div className={cn(
            "px-2 py-1 rounded-md text-xs font-mono border",
            isConnected 
              ? "bg-github-success/10 text-github-success border-github-success/20" 
              : "bg-github-error/10 text-github-error border-github-error/20"
          )}>
            {isConnected ? "● ONLINE" : "● OFFLINE"}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-full w-full pt-10">
      {/* Sidebar */}
      <div className="flex h-full">
        {/* Activity Bar */}
        <div className="w-12 bg-gradient-to-b from-github-surface to-github-bg border-r border-github-border flex flex-col items-center py-4 space-y-3 shrink-0 shadow-lg">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 relative group",
                activeSidebarTab === tab.id
                  ? "text-github-primary bg-github-primary/20 shadow-lg shadow-github-primary/25 border border-github-primary/30"
                  : "text-github-text-secondary hover:text-github-primary hover:bg-github-primary/10 hover:scale-105"
              )}
              title={tab.title}
              onClick={() => setActiveSidebarTab(tab.id)}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {activeSidebarTab === tab.id && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-github-primary rounded-l"></div>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Panel */}
        <div className="w-80 bg-github-surface border-r border-github-border flex flex-col shrink-0 h-full overflow-hidden shadow-lg">
          {activeSidebarTab === "explorer" && (
            <>
              <div className="px-4 py-3 border-b border-github-border flex items-center justify-between shrink-0 bg-gradient-to-r from-github-surface to-github-bg">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-folder text-github-primary text-sm"></i>
                  <h3 className="text-sm font-bold text-github-primary tracking-wide">EXPLORER</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-github-text-secondary hover:text-github-primary transition-colors p-1 rounded hover:bg-github-primary/10">
                    <i className="fas fa-plus text-xs"></i>
                  </button>
                  <button className="text-github-text-secondary hover:text-github-primary transition-colors p-1 rounded hover:bg-github-primary/10">
                    <i className="fas fa-folder-plus text-xs"></i>
                  </button>
                  <button className="text-github-text-secondary hover:text-github-primary transition-colors p-1 rounded hover:bg-github-primary/10">
                    <i className="fas fa-refresh text-xs"></i>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-github">
                <FileExplorer projectId={projectId} onFileSelect={openFile} />
              </div>
            </>
          )}
          
          {activeSidebarTab === "git" && (
            <>
              <div className="px-4 py-3 border-b border-github-border shrink-0">
                <h3 className="text-sm font-medium text-github-text">SOURCE CONTROL</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <GitPanel 
                  projectId={projectId}
                  gitStatus={gitStatus}
                  onCommit={commitChanges}
                  onPull={pullChanges}
                  onPush={pushChanges}
                />
              </div>
            </>
          )}

          {activeSidebarTab === "agent" && (
            <>
              <div className="px-4 py-3 border-b border-github-border shrink-0">
                <h3 className="text-sm font-medium text-github-text">AGENT</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AgentPanel 
                  projectId={projectId}
                  sessions={sessions}
                  isConnected={isConnected}
                  onSendMessage={(message: string) => {
                    sendMessage(message);
                  }}
                />
              </div>
            </>
          )}

          {activeSidebarTab === "memory" && (
            <>
              <div className="px-4 py-3 border-b border-github-border shrink-0">
                <h3 className="text-sm font-medium text-github-text">MEMORY</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <MemoryPanel projectId={projectId} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="bg-github-surface border-b border-github-border flex items-center">
          <div className="flex">
            {tabs.map((tab) => (
              <div
                key={tab.path}
                className={cn(
                  "flex items-center px-4 py-2 border-r border-github-border text-sm cursor-pointer",
                  currentFile === tab.path
                    ? "bg-github-bg text-github-text"
                    : "text-github-text-secondary hover:text-github-text hover:bg-github-border/30"
                )}
                onClick={() => openFile(tab.path)}
              >
                <i className={`${tab.icon} mr-2`}></i>
                <span>{tab.name}</span>
                {tab.modified && (
                  <span className="ml-2 w-2 h-2 bg-orange-400 rounded-full" title="Modified"></span>
                )}
                <button 
                  className="ml-2 text-github-text-secondary hover:text-github-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.path);
                  }}
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            ))}
          </div>
          <div className="flex-1"></div>
          <div className="px-4 py-2 text-xs text-github-text-secondary">
            <span className="mr-4">Ln 42, Col 16</span>
            <span className="mr-4">UTF-8</span>
            <span>TypeScript React</span>
          </div>
        </div>

        {/* Editor and Right Panel */}
        <div className="flex-1 flex">
          {/* Monaco Editor */}
          <div className="flex-1">
            <Monaco
              value={fileContent}
              language="typescript"
              path={currentFile}
              onChange={(value) => {
                // Handle file content changes
                console.log('File changed:', currentFile, value);
              }}
            />
          </div>

          {/* Right Panel */}
          <div className="w-96 bg-github-surface border-l border-github-border flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-github-border">
              {rightPanelTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                    activePanel === tab.id
                      ? "text-github-primary bg-github-primary/10 border-b-2 border-github-primary"
                      : "text-github-text-secondary hover:text-github-text"
                  )}
                  onClick={() => setActivePanel(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {activePanel === "agent" && (
                <AgentPanel
                  projectId={projectId}
                  sessions={sessions}
                  isConnected={isConnected}
                  onSendMessage={sendMessage}
                />
              )}
              {activePanel === "diff" && (
                <DiffPanel projectId={projectId} />
              )}
              {activePanel === "memory" && (
                <MemoryPanel projectId={projectId} />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="h-64 bg-github-surface border-t border-github-border flex flex-col shrink-0">
          {/* Bottom Panel Tabs */}
          <div className="flex items-center justify-between border-b border-github-border px-4 shrink-0">
            <div className="flex">
              {bottomPanelTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeBottomPanel === tab.id
                      ? "text-github-primary bg-github-primary/10 border-b-2 border-github-primary"
                      : "text-github-text-secondary hover:text-github-text"
                  )}
                  onClick={() => setActiveBottomPanel(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-github-text-secondary hover:text-github-text transition-colors">
                <i className="fas fa-plus text-xs"></i>
              </button>
              <button className="text-github-text-secondary hover:text-github-text transition-colors">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>

          {/* Bottom Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {activeBottomPanel === "terminal" && (
              <Terminal projectId={projectId} />
            )}
            {activeBottomPanel === "git" && (
              <GitPanel
                projectId={projectId}
                gitStatus={gitStatus}
                onCommit={commitChanges}
                onPull={pullChanges}
                onPush={pushChanges}
              />
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        projectId={projectId}
        gitStatus={gitStatus}
        isConnected={isConnected}
      />
    </div>
  );
}
