import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileText, Folder, Heart, Search as SearchIcon, Tags } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupsStore } from '@/store/groups-store';
import { promptsStore } from '@/store/prompts-store';
import { useTagsStore } from '@/store/tags-store';
import { Prompt } from '@/types/prompts';
import { Tag } from '@/types/tags';
import { Tag as TagComponent } from '@/components/tags/tag';
import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export const Route = createFileRoute("/")({
  component: Index,
});

function StatCard({ title, value, icon, lastUpdate }: { title: string; value?: string; icon: React.ReactNode; lastUpdate: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex flex-col items-start">
          {icon}
          <span className="mt-2 text-md font-bold text-neutral-600">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {
          value === undefined ? (
            <div className="text-neutral-600">Loading...</div>
          ) : (
            <div className="text-3xl font-bold text-neutral-800">{value}<span className="text-sm text-neutral-600 font-light ml-2">{lastUpdate}</span></div>
          )
        }
      </CardContent>
    </Card>
  );
}

function Index() {
  const navigate = useNavigate({from: "/"})
  const { groups, loadGroups } = useGroupsStore();
  const { prompts, getPrompts, setSelectedPrompt } = promptsStore();
  const { getTagById, loadTags, tags: tagsObject } = useTagsStore();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [stats, setStats] = useState<{
    totalPrompts: string | undefined,
    favoritePrompts: string | undefined,
    uniqueTags: string | undefined,
    totalGroups: string | undefined,
  }>({
    totalPrompts: undefined,
    favoritePrompts: undefined,
    uniqueTags: undefined,
    totalGroups: undefined,
  });
  const [lastUpdates, setLastUpdates] = useState({
    totalPrompts: '',
    favoritePrompts: '',
    uniqueTags: '',
    totalGroups: '',
  });

  // Load initial data
  useEffect(() => {
    loadGroups();
    getPrompts();
    loadTags();
    
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [loadGroups, getPrompts, loadTags]);
  

  // Update tags when prompts change
  useEffect(() => {
    const allTagIds = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tagId => allTagIds.add(tagId));
      }
    });

    const loadedTags: Record<string, Tag> = {};
    allTagIds.forEach(tagId => {
      const tag = getTagById(tagId);
      if (tag) {
        loadedTags[tagId] = tag;
      }
    });
    setTags(loadedTags);
  }, [prompts, getTagById]);

  // Calculate stats
  useEffect(() => {
    if (prompts.length === 0 || groups.length === 0 || Object.values(tagsObject).length === 0) return;
    const stats = {
      totalPrompts: prompts.length.toString(),
      favoritePrompts: prompts.filter(p => p.isFavorite).length.toString(),
      uniqueTags: new Set(prompts.flatMap(p => p.tags || [])).size.toString(),
      totalGroups: groups.length.toString(),
    };
    const lastUpdates = {
      totalPrompts: prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt,
      favoritePrompts: prompts.filter(p => p.isFavorite).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt,
      uniqueTags: Object.values(tagsObject).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt,
      totalGroups: groups.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt,
    };
    setStats(stats);
    setLastUpdates(lastUpdates);
  }, [prompts, groups, tagsObject]);

  const filteredPrompts = prompts.filter((prompt: Prompt) => {
    const latestVersion = prompt.versions?.[prompt.versions.length - 1];
    const searchLower = searchQuery.toLowerCase();
    return (
      prompt.name.toLowerCase().includes(searchLower) ||
      (latestVersion?.content?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const redirectToPrompt = (promptId: string) => {
    if (promptId === 'new') {
      // Clear any selected prompt when creating a new one
      setSelectedPrompt(null);
      navigate({ to: '/all' });
    } else {
      // Navigate to existing prompt
      setSelectedPrompt(promptId);
      navigate({ to: '/all' });
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  return (
    <div className="flex w-full h-[calc(100vh-37px)] bg-neutral-100">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold tracking-tight text-neutral-800">👋 {getGreeting()}, Welcome back!</h1>
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts..."
              className="w-full pl-9 cursor-text"
              onFocus={() => setIsCommandOpen(true)}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-8 py-4">

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <StatCard 
              title="Total Prompts" 
              value={stats.totalPrompts?.toLocaleString()}
              icon={<FileText className="w-8 h-8 text-neutral-600" />}
              lastUpdate={new Date(lastUpdates.totalPrompts).toLocaleString()}
            />
            <StatCard 
              title="Active Tags" 
              value={stats.uniqueTags?.toLocaleString()}
              icon={<Tags className="w-8 h-8 text-neutral-600" />}
              lastUpdate={new Date(lastUpdates.uniqueTags).toLocaleString()}
            />
            <StatCard 
              title="Groups" 
              value={stats.totalGroups?.toLocaleString()} 
              icon={<Folder className="w-8 h-8 text-neutral-600" />}
              lastUpdate={new Date(lastUpdates.totalGroups).toLocaleString()}
            />  
            <StatCard 
              title="Favorites" 
              value={stats.favoritePrompts?.toLocaleString()} 
              icon={<Heart className="w-8 h-8 text-neutral-600" />}
              lastUpdate={new Date(lastUpdates.favoritePrompts).toLocaleString()}
            />
          </div>

          {/* Recent Activity */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-700 text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prompts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  ) : (
                    [...prompts]
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 3)
                      .map((prompt) => {
                        const updatedAt = new Date(prompt.updatedAt);
                        const now = new Date();
                        const diffInHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
                        let timeAgo = '';
                        
                        if (diffInHours < 1) {
                          const diffInMinutes = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60));
                          timeAgo = `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
                        } else if (diffInHours < 24) {
                          timeAgo = `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
                        } else {
                          const diffInDays = Math.floor(diffInHours / 24);
                          timeAgo = `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
                        }
                        
                        return (
                          <div 
                            key={prompt.id} 
                            className="flex items-center w-full p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                            onClick={() => {
                              redirectToPrompt(prompt.id);
                            }}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{prompt.name || 'Untitled Prompt'}</p>
                              <p className="text-xs text-muted-foreground">Updated {timeAgo}</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput 
          placeholder="Search prompts..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No prompts found.</CommandEmpty>
          <CommandGroup heading="Prompts">
            {filteredPrompts.slice(0, 10).map((prompt) => (
              <CommandItem
                key={prompt.id}
                onSelect={() => {
                  // Handle prompt selection
                  console.log('Selected prompt:', prompt.id);
                  setIsCommandOpen(false);
                  redirectToPrompt(prompt.id);
                }}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <p className="font-medium">{prompt.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {prompt.versions[prompt.versions.length - 1]?.content}
                  </p>
                </div>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex gap-1 items-center">
                    {prompt.tags.slice(0, 3).map(tagId => {
                      const tag = tags[tagId];
                      return tag ? (
                        <TagComponent
                          key={tag.id}
                          name={tag.name}
                          color={tag.color}
                          className="h-5 text-xs px-1.5 py-0"
                        />
                      ) : null;
                    })}
                    {prompt.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}