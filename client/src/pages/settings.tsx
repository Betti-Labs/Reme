import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpaceBackground from "@/components/SpaceBackground";
import Navigation from "@/components/Navigation";
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Code, 
  Shield, 
  Bell, 
  Globe, 
  Zap, 
  Database,
  Key,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun
} from "lucide-react";

interface UserSettings {
  // Profile
  name: string;
  email: string;
  bio: string;
  avatar?: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  
  // Editor
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  formatOnSave: boolean;
  
  // Privacy & Security
  profileVisibility: 'public' | 'private';
  allowCollaboration: boolean;
  twoFactorEnabled: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  projectUpdates: boolean;
  securityAlerts: boolean;
  
  // Advanced
  aiAssistance: boolean;
  autoComplete: boolean;
  gitAutoCommit: boolean;
  debugMode: boolean;
}

const FONT_FAMILIES = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Inconsolata', label: 'Inconsolata' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'Consolas', label: 'Consolas' }
];

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24];
const TAB_SIZES = [2, 4, 8];
const LINE_HEIGHTS = [1.2, 1.4, 1.5, 1.6, 1.8, 2.0];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      // Mock data for now - in production this would fetch from API
      return {
        name: 'John Developer',
        email: 'john@example.com',
        bio: 'Full-stack developer passionate about AI and modern web technologies',
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        lineHeight: 1.5,
        tabSize: 2,
        wordWrap: true,
        autoSave: true,
        showLineNumbers: true,
        showMinimap: true,
        formatOnSave: true,
        profileVisibility: 'public',
        allowCollaboration: true,
        twoFactorEnabled: false,
        emailNotifications: true,
        pushNotifications: true,
        projectUpdates: true,
        securityAlerts: true,
        aiAssistance: true,
        autoComplete: true,
        gitAutoCommit: false,
        debugMode: false
      } as UserSettings;
    }
  });

  // Update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      await apiRequest('PATCH', '/api/settings', {
        body: JSON.stringify(newSettings)
      });
      return newSettings;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleBulkUpdate = (updates: Partial<UserSettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen relative">
        <SpaceBackground />
        <Navigation />
        <div className="ml-64 relative z-10 flex items-center justify-center h-screen">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <Navigation />
      
      <div className="ml-64 relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-blue-400" />
              Settings
            </h1>
            <p className="text-gray-400 text-lg">
              Customize your development environment and preferences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-black/20 border border-white/10 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="editor" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <Code className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
                <Zap className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your public profile and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Display Name</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleSettingChange('name', e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settings.bio}
                      onChange={(e) => handleSettingChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-white/5 border-white/20 text-white resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Profile Visibility</Label>
                      <p className="text-sm text-gray-400">Control who can see your profile</p>
                    </div>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value: 'public' | 'private') => handleSettingChange('profileVisibility', value)}
                    >
                      <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border-white/10">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Theme & Display
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize the visual appearance of your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-white mb-3 block">Theme</Label>
                    <div className="flex gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Monitor }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <Button
                            key={theme.value}
                            variant={settings.theme === theme.value ? "default" : "outline"}
                            onClick={() => handleSettingChange('theme', theme.value)}
                            className={
                              settings.theme === theme.value
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "border-white/20 text-white hover:bg-white/10"
                            }
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {theme.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">Font Family</Label>
                      <Select
                        value={settings.fontFamily}
                        onValueChange={(value) => handleSettingChange('fontFamily', value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border-white/10">
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white">Font Size</Label>
                      <Select
                        value={settings.fontSize.toString()}
                        onValueChange={(value) => handleSettingChange('fontSize', parseInt(value))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border-white/10">
                          {FONT_SIZES.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white">Line Height</Label>
                      <Select
                        value={settings.lineHeight.toString()}
                        onValueChange={(value) => handleSettingChange('lineHeight', parseFloat(value))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 border-white/10">
                          {LINE_HEIGHTS.map((height) => (
                            <SelectItem key={height} value={height.toString()}>
                              {height}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Editor Settings */}
            <TabsContent value="editor" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    Code Editor Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your coding environment and editor behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">Tab Size</Label>
                      <div className="flex gap-2 mt-2">
                        {TAB_SIZES.map((size) => (
                          <Button
                            key={size}
                            variant={settings.tabSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSettingChange('tabSize', size)}
                            className={
                              settings.tabSize === size
                                ? "bg-green-600/20 text-green-300 border-green-500/30"
                                : "border-white/20 text-white hover:bg-white/10"
                            }
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'wordWrap', label: 'Word Wrap', description: 'Wrap long lines of code' },
                      { key: 'autoSave', label: 'Auto Save', description: 'Automatically save files as you type' },
                      { key: 'showLineNumbers', label: 'Line Numbers', description: 'Show line numbers in the editor' },
                      { key: 'showMinimap', label: 'Minimap', description: 'Show code minimap overview' },
                      { key: 'formatOnSave', label: 'Format on Save', description: 'Auto-format code when saving' },
                      { key: 'autoComplete', label: 'Auto Complete', description: 'Enable intelligent code completion' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <Label className="text-white">{setting.label}</Label>
                          <p className="text-sm text-gray-400">{setting.description}</p>
                        </div>
                        <Switch
                          checked={settings[setting.key as keyof UserSettings] as boolean}
                          onCheckedChange={(checked) => handleSettingChange(setting.key as keyof UserSettings, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorEnabled}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">Allow Collaboration</Label>
                        <p className="text-sm text-gray-400">Let others collaborate on your projects</p>
                      </div>
                      <Switch
                        checked={settings.allowCollaboration}
                        onCheckedChange={(checked) => handleSettingChange('allowCollaboration', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <Label className="text-white">API Key</Label>
                    <p className="text-sm text-gray-400 mb-3">Your personal API key for integrations</p>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk-1234567890abcdef..."
                        readOnly
                        className="bg-white/5 border-white/20 text-white flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                    { key: 'projectUpdates', label: 'Project Updates', description: 'Notifications for project changes' },
                    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">{setting.label}</Label>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof UserSettings] as boolean}
                        onCheckedChange={(checked) => handleSettingChange(setting.key as keyof UserSettings, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Advanced Features
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Experimental and advanced development features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'aiAssistance', label: 'AI Code Assistance', description: 'Enable AI-powered code suggestions and help' },
                    { key: 'gitAutoCommit', label: 'Git Auto Commit', description: 'Automatically commit changes periodically' },
                    { key: 'debugMode', label: 'Debug Mode', description: 'Enable verbose logging and debug features' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">{setting.label}</Label>
                        <p className="text-sm text-gray-400">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof UserSettings] as boolean}
                        onCheckedChange={(checked) => handleSettingChange(setting.key as keyof UserSettings, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Data Management */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Data Management
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Export, import, or reset your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset All Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}