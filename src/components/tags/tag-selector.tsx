import { useState } from 'react';
import { Pencil, Check, Trash2 } from 'lucide-react';
import { useTagsStore } from '@/store/tags-store';
import { Tag as TagComponent } from './tag';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tag as TagType } from '@/types/tags';
import { cn } from '@/lib/utils';
import { Prompt } from '@/types/prompts';
import useTagsManagement from '@/hooks/use-tags-management';
import Alert from '../common/alert';
import TagEditForm from './tag-edit-form';

type TagWithHandlers = TagType & {
  onRemove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
};

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  trigger?: React.ReactNode;
  selectedPrompt: Prompt
}

export function TagSelector({
  value = [],
  onChange,
  className = '',
  trigger,
  selectedPrompt
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    editingTagId,
    selectedColor,
    deletingTagId,
    editedTagName,
    createTag,
    startEdit,
    cancelEdit,
    saveEdit,
    removeTagFromPrompt,
    deleteTag,
    setNewTagName,
    setEditedTagName,
    setSelectedColor,
    setDeletingTagId
  } = useTagsManagement(value, onChange);
  
  const { 
    tags, 
    updateTag,
    getTagById
  } = useTagsStore();


  
  // Get the full tag objects for the selected tag IDs with handlers
  const selectedTags = (value || []).reduce<TagWithHandlers[]>((acc, tagId) => {
    const tag = getTagById(tagId);
    if (tag) {
      acc.push({
        ...tag,
        onRemove: (_e: React.MouseEvent) => removeTagFromPrompt(_e, tag.id, selectedPrompt.id),
        onClick: (_e: React.MouseEvent) => _e.stopPropagation(),
        onEdit: (_e: React.MouseEvent) => startEdit(tag.id, tag.name, tag.color)
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
      onRemove: (_e: React.MouseEvent) => removeTagFromPrompt(_e, tag.id, selectedPrompt.id),
      onClick: (_e: React.MouseEvent) => _e.stopPropagation(),
      onEdit: (_e: React.MouseEvent) => startEdit(tag.id, tag.name, tag.color)
    })) as (TagWithHandlers & { isSelected: boolean })[];
  
  const handleCreateTag = async () => {
    createTag();
    setSearchQuery('');
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
          {trigger}
        </PopoverTrigger>
        
        <PopoverContent className="w-[300px] p-0" align="start">
          {editingTagId ? (
            <TagEditForm
              editedTagName={editedTagName}
              setEditedTagName={setEditedTagName}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              setDeletingTagId={setDeletingTagId}
              editingTagId={editingTagId}
            />
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
                        if(tag.isSelected) {
                          updateTag(tag.id, { prompts: tag.prompts?.filter(prompt => prompt.id !== selectedPrompt.id) || [] });
                        } else {
                          updateTag(tag.id, { prompts: [...(tag.prompts || []), { id: selectedPrompt.id, name: selectedPrompt.name, createdAt: selectedPrompt.createdAt, updatedAt: selectedPrompt.updatedAt }] });
                        }

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
                              startEdit(tag.id, tag.name, tag.color);
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
        <div className="flex justify-start items-center flex-wrap gap-2">
          {selectedTags.map(tag => (
            <TagComponent
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={(e) => removeTagFromPrompt(e, tag.id, selectedPrompt.id)}
              className="text-xs py-0.5 px-2"
            />
          ))}
        </div>
      )}

      <Alert
        open={!!deletingTagId}
        onOpenChange={(open: boolean) => !open && setDeletingTagId(null)}
        onAction={deleteTag}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
        actionText="Delete"
      />
    </div>
  );
}
