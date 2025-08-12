import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Code2, 
  Folder, 
  Brain, 
  Settings, 
  User, 
  PlusCircle,
  Search,
  Clock,
  Star
} from 'lucide-react';

interface NavigationProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function Navigation({ user = { name: 'Developer' } }: NavigationProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      href: '/',
      active: location === '/'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: Folder, 
      href: '/projects',
      active: location.startsWith('/projects')
    },
    { 
      id: 'templates', 
      label: 'Templates', 
      icon: Code2, 
      href: '/templates',
      active: location === '/templates'
    },
    { 
      id: 'memory', 
      label: 'Memory', 
      icon: Brain, 
      href: '/memory',
      active: location === '/memory'
    },
    { 
      id: 'recent', 
      label: 'Recent', 
      icon: Clock, 
      href: '/recent',
      active: location === '/recent'
    },
    { 
      id: 'starred', 
      label: 'Starred', 
      icon: Star, 
      href: '/starred',
      active: location === '/starred'
    },
  ];

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-full bg-black/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-xl">Reme</h1>
              <p className="text-gray-400 text-xs">AI-Powered IDE</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-white font-medium text-sm">{user.name}</p>
              <p className="text-gray-400 text-xs">Pro Plan</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10">
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          size={isCollapsed ? "icon" : "default"}
        >
          <PlusCircle className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Project</span>}
        </Button>
        
        {!isCollapsed && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                  item.active 
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {item.active && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </a>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-white/10">
        <Link href="/settings">
          <a className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:text-white hover:bg-white/5",
            location === '/settings' && "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
          )}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </a>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition-colors"
      >
        <div className={cn("w-2 h-2 border-l border-b border-white transform transition-transform", isCollapsed ? "rotate-45" : "-rotate-135")} />
      </button>
    </nav>
  );
}