import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { useTagsStore } from '@/store/tags-store';
import { Tag } from './tag';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompts';

interface TagInputProps {
  prompt: Prompt;
  onTagsChange?: (tagIds: string[]) => void;
  className?: string;
}

export function TagInput({ prompt, onTagsChange, className = '' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    tags, 
    addTag, 
    getTagsForPrompt,
    addTagToPrompt,
    removeTagFromPrompt
  } = useTagsStore();
  
  const [assignedTags, setAssignedTags] = useState<string[]>(prompt.tags || []);
  
  // Update assigned tags when prompt tags change
  useEffect(() => {
    setAssignedTags(prompt.tags || []);
  }, [prompt.tags]);
  
  // Notify parent when tags change
  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(assignedTags);
    }
  }, [assignedTags, onTagsChange]);
  
  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    
    // Check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (existingTag) {
      // If tag exists but not assigned to this prompt, assign it
      if (!assignedTags.includes(existingTag.id)) {
        addTagToPrompt(existingTag.id, prompt);
        setAssignedTags(prev => [...prev, existingTag.id]);
      }
    } else {
      // Create new tag and assign to prompt
      const newTag = addTag(trimmedValue);
      if (newTag) {
        addTagToPrompt(newTag.id, prompt);
        setAssignedTags(prev => [...prev, newTag.id]);
      }
    }
    
    setInputValue('');
    setIsInputVisible(false);
  };
  
  const handleRemoveTag = (tagId: string) => {
    removeTagFromPrompt(tagId, prompt);
    setAssignedTags(prev => prev.filter(id => id !== tagId));
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsInputVisible(false);
    }
  };
  
  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAddTag();
    } else {
      setIsInputVisible(false);
    }
  };
  
  // Get full tag objects for the current prompt's tag IDs
  const promptTags = getTagsForPrompt(prompt);
  
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {promptTags.map(tag => (
        <Tag
          key={tag.id}
          name={tag.name}
          color={tag.color}
          onRemove={() => handleRemoveTag(tag.id)}
        />
      ))}
      
      {isInputVisible ? (
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Tag name..."
            className="h-8 w-32 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsInputVisible(true);
            // Focus input after it's rendered
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      )}
    </div>
  );
}
