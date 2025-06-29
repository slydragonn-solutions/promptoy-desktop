import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTagsStore } from '@/store/tags-store';
import { Tag as TagComponent } from './tag';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tag as TagType } from '@/store/tags-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type TagWithHandlers = TagType & {
  onRemove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
};

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  trigger?: React.ReactNode;
}

export function TagSelector({
  value = [],
  onChange,
  className = '',
  placeholder = 'Select tags...',
  trigger,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  const { 
    tags, 
    addTag,
    loadTags,
    getTagById
  } = useTagsStore();
  
  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleChange = (value: string) => {
    setSearchQuery(value)
    setNewTagName(value)
  }
  
  // Get the full tag objects for the selected tag IDs with handlers
  const selectedTags = (value || []).reduce<TagWithHandlers[]>((acc, tagId) => {
    const tag = getTagById(tagId);
    if (tag) {
      acc.push({
        ...tag,
        onRemove: (e: React.MouseEvent) => handleRemoveTag(e, tag.id),
        onClick: (e: React.MouseEvent) => e.stopPropagation()
      });
    }
    return acc;
  }, []);

  const availableTags = tags
    .filter(tag => !value.includes(tag.id) && 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(tag => ({
      ...tag,
      onRemove: (e: React.MouseEvent) => handleRemoveTag(e, tag.id),
      onClick: (e: React.MouseEvent) => e.stopPropagation()
    })) as TagWithHandlers[];
  
  const handleCreateTag = async () => {
    const tagName = newTagName.trim();
    if (!tagName) return;

    try {
      // First check if tag with same name already exists in the current tags
      const existingTag = tags.find(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (existingTag) {
        // If tag exists, add it if not already in the value array
        if (!value.includes(existingTag.id)) {
          onChange([...value, existingTag.id]);
        }
      } else {
        try {
          // Add the tag to the store
          const newTag = addTag(tagName);
          
          if (newTag) {
            onChange([...value, newTag.id]);
            toast.success(`Tag "${tagName}" created`);
          } else {
            throw new Error('Failed to create tag');
          }
        } catch (error: unknown) {
          console.error('Error creating tag:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
          toast.error(`Failed to create tag: ${errorMessage}`);
          return; // Exit early on error
        }
      }
      
      // Clear input fields only if everything was successful
      setNewTagName('');
      setSearchQuery('');
    } catch (error: unknown) {
      console.error('Error in handleCreateTag:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    const newTags = (value || []).filter(id => id !== tagId);
    onChange(newTags);
  };
  
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleCreateTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
    }
  };
  
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          {trigger || (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2 flex-wrap max-w-full overflow-hidden">
                {selectedTags.length > 0 ? (
                  selectedTags.map(tag => (
                    <TagComponent 
                      key={tag.id} 
                      name={tag.name} 
                      color={tag.color}
                      onRemove={tag.onRemove}
                      onClick={tag.onClick}
                      className="max-w-[200px] truncate"
                    />
                  ))
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <div className="px-2 py-1.5">
              <CommandInput
                placeholder="Search or create tag..."
                value={searchQuery}
                onValueChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              
              {searchQuery && !tags.some(tag => 
                tag.name.toLowerCase() === searchQuery.toLowerCase()
              ) && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Press Enter to create "{searchQuery}"
                </div>
              )}
            </div>
            
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No tags found.</CommandEmpty>
              
              {availableTags.length > 0 && (
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        onChange([...value, tag.id]);
                        setSearchQuery('');
                      }}
                      className="cursor-pointer text-neutral-600"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div 
                          className={cn(
                            'w-3 h-3 rounded-full',
                            tag.color.bg,
                            tag.color.bgDark
                          )}
                        />
                        <span className="flex-1 truncate">{tag.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <TagComponent
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={(e) => handleRemoveTag(e, tag.id)}
              className="text-xs py-0.5 px-1.5"
            />
          ))}
        </div>
      )}
    </div>
  );
}
