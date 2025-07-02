import { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useTagsStore } from '@/store/tags-store';
import { Tag as TagComponent } from './tag';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tag as TagType } from '@/store/tags-store';
import type { TagColorScheme } from '@/constants/tags';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TAG_COLORS } from '@/constants/tags';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type TagWithHandlers = TagType & {
  onRemove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
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
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState<TagColorScheme | null>(null);
  
  const { 
    tags, 
    addTag,
    updateTag,
    removeTag,
    loadTags,
    getTagById
  } = useTagsStore();
  
  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);


  
  // Get the full tag objects for the selected tag IDs with handlers
  const selectedTags = (value || []).reduce<TagWithHandlers[]>((acc, tagId) => {
    const tag = getTagById(tagId);
    if (tag) {
      acc.push({
        ...tag,
        onRemove: (_e: React.MouseEvent) => handleRemoveTag(_e, tag.id),
        onClick: (_e: React.MouseEvent) => _e.stopPropagation(),
        onEdit: (_e: React.MouseEvent) => handleStartEdit(tag.id, tag.name, tag.color)
      });
    }
    return acc;
  }, []);

  // Combine all tags and mark which ones are selected
  const allTags = tags
    .filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Sort selected tags first, then by name
      const aSelected = value.includes(a.id);
      const bSelected = value.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(tag => ({
      ...tag,
      isSelected: value.includes(tag.id),
      onRemove: (_e: React.MouseEvent) => handleRemoveTag(_e, tag.id),
      onClick: (_e: React.MouseEvent) => _e.stopPropagation(),
      onEdit: (_e: React.MouseEvent) => handleStartEdit(tag.id, tag.name, tag.color)
    })) as (TagWithHandlers & { isSelected: boolean })[];
  
  const handleCreateTag = async () => {
    const tagName = newTagName.trim();
    if (!tagName) return;
    
    if (tagName.length > 25) {
      toast.error('Tag name must be 25 characters or less');
      return;
    }

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

  const handleStartEdit = (tagId: string, currentName: string, currentColor: TagColorScheme) => {
    setEditingTagId(tagId);
    setEditedTagName(currentName);
    setSelectedColor(currentColor);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditedTagName('');
    setSelectedColor(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTagId || !editedTagName.trim()) return;
    
    const trimmedName = editedTagName.trim();
    if (trimmedName.length > 25) {
      toast.error('Tag name must be 25 characters or less');
      return;
    }

    try {
      const success = await updateTag(editingTagId, { 
        name: trimmedName,
        color: selectedColor || getTagById(editingTagId)?.color 
      });
      
      if (success) {
        toast.success('Tag updated successfully');
      } else {
        throw new Error('Failed to update tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
    } finally {
      handleCancelEdit();
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    const newTags = (value || []).filter(id => id !== tagId);
    onChange(newTags);  };

  const handleDeleteTag = async () => {
    if (!deletingTagId) return;
    
    try {
      const success = await removeTag(deletingTagId);
      if (success) {
        // Remove the tag from the current selection if it's selected
        const newTags = (value || []).filter(id => id !== deletingTagId);
        if (newTags.length !== (value || []).length) {
          onChange(newTags);
        }
        // Close the edit form if the deleted tag was being edited
        if (editingTagId === deletingTagId) {
          setEditingTagId(null);
          setEditedTagName('');
          setSelectedColor(null);
        }
        toast.success('Tag deleted successfully');
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    } finally {
      setDeletingTagId(null);
    }
  };
  
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleCreateTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
    }
  };
  
  // Render the delete confirmation dialog
  const renderDeleteDialog = () => (
    <AlertDialog 
      open={!!deletingTagId} 
      onOpenChange={(open: boolean) => !open && setDeletingTagId(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this tag? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteTag}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Render the tag edit form when a tag is being edited
  const renderTagEditForm = () => (
    <div className="p-3 space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={editedTagName}
            onChange={(e) => setEditedTagName(e.target.value)}
            maxLength={25}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              else if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleSaveEdit}
              disabled={!editedTagName.trim()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-destructive hover:text-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                setDeletingTagId(editingTagId);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {editedTagName.length}/25 characters
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Color</label>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-5 gap-2 p-1">
            {TAG_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center ${color.bg} ${color.border} ${selectedColor?.name === color.name ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                onClick={() => setSelectedColor(color)}
                title={color.name}
              >
                {selectedColor?.name === color.name && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
      {renderDeleteDialog()}
    </div>
  );

  const renderTagList = () => {
    if (selectedTags.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    return selectedTags.map(tag => (
      <TagComponent 
        key={tag.id} 
        name={tag.name} 
        color={tag.color}
        onRemove={tag.onRemove}
        onClick={tag.onEdit}
        className="max-w-[200px] truncate group"
        showEditButton
      />
    ));
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
                {renderTagList()}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          {editingTagId ? (
            renderTagEditForm()
          ) : (
            <Command>
              <div className="px-2 py-1.5">
                <CommandInput
                  placeholder="Search or create tag..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    if (value.length <= 25) {
                      setSearchQuery(value);
                      setNewTagName(value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  maxLength={25}
                />
                
                <div className="mt-1 text-xs text-muted-foreground">
                  {searchQuery && !tags.some(tag => 
                    tag.name.toLowerCase() === searchQuery.toLowerCase()
                  ) && (
                    <div>
                      Press Enter to create "{searchQuery}"
                    </div>
                  )}
                  <div className="text-right">
                    {searchQuery.length}/25 characters
                  </div>
                </div>
              </div>
              
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>No tags found. Type to create a new tag</CommandEmpty>
                
                <CommandGroup>
                  {allTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        const newValue = tag.isSelected
                          ? value.filter(id => id !== tag.id)
                          : [...value, tag.id];
                        onChange(newValue);
                      }}
                      className="cursor-pointer group/item"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className={cn(
                              'w-3 h-3 rounded-full flex-shrink-0',
                              tag.color.bg,
                              tag.color.bgDark
                            )}
                          />
                          <span className={cn("truncate", tag.isSelected && "font-medium")}>
                            {tag.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(tag.id, tag.name, tag.color);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTagId(tag.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {tag.isSelected && (
                          <Check className="ml-2 h-4 w-4 flex-shrink-0 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
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
