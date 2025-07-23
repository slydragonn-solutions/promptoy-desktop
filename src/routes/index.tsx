import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Clock, FileText, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useSettingsStore } from '@/store/settings-store';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Route = createFileRoute("/")({
  component: Index,
});


function Index() {
  const navigate = useNavigate({from: "/"})
  const { list: { numberOfRecentPrompts } } = useSettingsStore()
  const { prompts, getPrompts, setSelectedPrompt } = promptsStore();
  const { getTagById, loadTags } = useTagsStore();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<Record<string, Tag>>({});

  // Load initial data
  useEffect(() => {
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
  }, [ getPrompts, loadTags]);
  

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
      navigate({ to: '/vault' });
    } else {
      // Navigate to existing prompt
      setSelectedPrompt(promptId);
      navigate({ to: '/vault' });
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  return (
    <div className="flex w-full h-[calc(100vh-37px)] bg-neutral-100 dark:bg-neutral-900 p-2 justify-center items-center">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-2xl mx-auto">
        {/* Top Bar */}
        <header className="flex flex-col items-center justify-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 text-center">👋 {getGreeting()}, Welcome back!</h1>
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

          {/* Recent Activity */}
          <div className="w-full">
            <Card className="border-transparent shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-700 text-sm dark:text-neutral-400"><Clock className="w-4 h-4" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[210px]">
                <div className="space-y-4">
                  {prompts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 dark:text-neutral-400">
                      No recent activity
                    </p>
                  ) : (
                    [...prompts]
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, numberOfRecentPrompts)
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
                            className="flex items-center w-full p-2 rounded-lg dark:bg-neutral-800 bg-neutral-200 dark:hover:bg-indigo-600 hover:bg-indigo-200 cursor-pointer"
                            onClick={() => {
                              redirectToPrompt(prompt.id);
                            }}
                          >
                            <div className="h-10 w-10 flex items-center justify-center mr-3 flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary dark:text-primary/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate dark:text-neutral-300">{prompt.name || 'Untitled Prompt'}</p>
                              <p className="text-xs text-muted-foreground dark:text-neutral-400">Updated {timeAgo}</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
                </ScrollArea>
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
                className="cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-600 "
              >
                <FileText className="mr-2 h-4 w-4 text-primary dark:text-primary/50" />
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