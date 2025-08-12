import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import SpaceBackground from "@/components/SpaceBackground";
import Navigation from "@/components/Navigation";
import { 
  Search, 
  Clock, 
  Code2, 
  GitBranch, 
  Calendar,
  ExternalLink,
  Star,
  Eye
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface RecentActivity {
  id: string;
  projectId: string;
  projectName: string;
  type: 'opened' | 'edited' | 'created' | 'committed' | 'deployed';
  description: string;
  timestamp: string;
  language: string;
  framework?: string;
  filePath?: string;
  gitBranch?: string;
}

const ACTIVITY_TYPES = [
  { id: 'all', name: 'All Activity' },
  { id: 'opened', name: 'Opened' },
  { id: 'edited', name: 'Edited' },
  { id: 'created', name: 'Created' },
  { id: 'committed', name: 'Committed' },
  { id: 'deployed', name: 'Deployed' },
];

const TIME_FILTERS = [
  { id: 'all', name: 'All Time' },
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
];

export default function Recent() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");

  // Fetch recent activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activities/recent', selectedType, selectedTimeFilter, searchQuery],
    queryFn: async () => {
      let url = '/api/activities/recent';
      const params = new URLSearchParams();
      
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }
      if (selectedTimeFilter !== 'all') {
        params.set('timeFilter', selectedTimeFilter);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Mock data for now - in production this would fetch from API
      return [
        {
          id: '1',
          projectId: 'proj1',
          projectName: 'React Dashboard',
          type: 'edited',
          description: 'Modified components/Dashboard.tsx',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
          language: 'typescript',
          framework: 'react',
          filePath: 'src/components/Dashboard.tsx',
          gitBranch: 'feature/new-charts'
        },
        {
          id: '2',
          projectId: 'proj2',
          projectName: 'API Server',
          type: 'committed',
          description: 'Added user authentication endpoints',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          language: 'typescript',
          framework: 'express',
          gitBranch: 'main'
        },
        {
          id: '3',
          projectId: 'proj3',
          projectName: 'Mobile App',
          type: 'opened',
          description: 'Opened project in IDE',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          language: 'javascript',
          framework: 'react-native'
        },
        {
          id: '4',
          projectId: 'proj1',
          projectName: 'React Dashboard',
          type: 'deployed',
          description: 'Deployed to production',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          language: 'typescript',
          framework: 'react'
        },
        {
          id: '5',
          projectId: 'proj4',
          projectName: 'AI Chat Bot',
          type: 'created',
          description: 'Created new project from template',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          language: 'python',
          framework: 'fastapi'
        }
      ].filter(activity => {
        const matchesType = selectedType === 'all' || activity.type === selectedType;
        const matchesSearch = !searchQuery.trim() || 
          activity.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (activity.filePath && activity.filePath.toLowerCase().includes(searchQuery.toLowerCase()));
        
        let matchesTime = true;
        if (selectedTimeFilter !== 'all') {
          const activityTime = new Date(activity.timestamp);
          const now = new Date();
          
          switch (selectedTimeFilter) {
            case 'today':
              matchesTime = activityTime.toDateString() === now.toDateString();
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              matchesTime = activityTime >= weekAgo;
              break;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              matchesTime = activityTime >= monthAgo;
              break;
          }
        }
        
        return matchesType && matchesSearch && matchesTime;
      });
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'opened':
        return <ExternalLink className="w-4 h-4 text-blue-400" />;
      case 'edited':
        return <Code2 className="w-4 h-4 text-green-400" />;
      case 'created':
        return <Star className="w-4 h-4 text-purple-400" />;
      case 'committed':
        return <GitBranch className="w-4 h-4 text-orange-400" />;
      case 'deployed':
        return <Eye className="w-4 h-4 text-pink-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'opened':
        return 'text-blue-400';
      case 'edited':
        return 'text-green-400';
      case 'created':
        return 'text-purple-400';
      case 'committed':
        return 'text-orange-400';
      case 'deployed':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      typescript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      javascript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      python: "bg-green-500/20 text-green-300 border-green-500/30",
      java: "bg-red-500/20 text-red-300 border-red-500/30",
      go: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      rust: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };
    return colors[language.toLowerCase()] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Recent Activity</h1>
            <p className="text-gray-400 text-lg">
              Track your recent development activities and project updates
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities by project, file, or description..."
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Activity Type Filter */}
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className={
                      selectedType === type.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                        : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                    }
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
              
              {/* Time Filter */}
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedTimeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeFilter(filter.id)}
                    className={
                      selectedTimeFilter === filter.id
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                        : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                    }
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-1/3 h-4 bg-white/10 rounded mb-2"></div>
                        <div className="w-2/3 h-3 bg-white/10 rounded mb-2"></div>
                        <div className="flex gap-2">
                          <div className="w-16 h-5 bg-white/10 rounded"></div>
                          <div className="w-20 h-5 bg-white/10 rounded"></div>
                        </div>
                      </div>
                      <div className="w-20 h-4 bg-white/10 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activities.length ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card
                  key={activity.id}
                  className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                  onClick={() => setLocation(`/ide/${activity.projectId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Activity Icon */}
                      <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      {/* Activity Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium text-lg group-hover:text-blue-300 transition-colors">
                            {activity.projectName}
                          </h3>
                          <span className={`text-sm font-medium capitalize ${getActivityColor(activity.type)}`}>
                            {activity.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                          {activity.description}
                        </p>
                        
                        {activity.filePath && (
                          <p className="text-gray-500 text-xs mb-3 font-mono bg-white/5 px-2 py-1 rounded inline-block">
                            {activity.filePath}
                          </p>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`text-xs ${getLanguageColor(activity.language)}`}>
                            {activity.language}
                          </Badge>
                          {activity.framework && (
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                              {activity.framework}
                            </Badge>
                          )}
                          {activity.gitBranch && (
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                              <GitBranch className="w-3 h-3 mr-1" />
                              {activity.gitBranch}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-right text-xs text-gray-500 flex-shrink-0">
                        <div className="mb-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                        <div>
                          {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">No recent activity</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No activities match "${searchQuery}". Try adjusting your search terms or filters.`
                  : "Start working on projects to see your recent development activities here."}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedTimeFilter("all");
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}