import { useEffect, useState } from 'react';
import { Tag as TagComponent } from '../tags/tag';
import { Prompt } from "@/types/prompts";
import { cn } from '@/lib/utils';
import { useTagsStore, type Tag } from '@/store/tags-store';

interface PromptItemProps {
    prompt: Prompt;
    isSelected: boolean;
    onSelect: (prompt: Prompt) => void;
}

export default function PromptItem({ prompt, isSelected, onSelect }: PromptItemProps) {
    const { name, updatedAt, tags: tagIds = [] } = prompt;
    const { getTagById, loadTags } = useTagsStore();
    
    const [tags, setTags] = useState<Tag[]>([]);

    // Load tags when component mounts
    useEffect(() => {
        loadTags();
    }, [loadTags]);

    // Update tags when tagIds, getTagById, or tags store changes
    useEffect(() => {
        if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
            setTags([]);
            return;
        }

        const loadedTags = tagIds
            .map(tagId => getTagById(tagId))
            .filter((tag): tag is Tag => tag !== null);
            
        setTags(loadedTags);
    }, [tagIds, getTagById, useTagsStore.getState().tags]);

    // Format date to a more readable format
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <li 
            className={cn(
                'flex flex-col p-3 border-b border-border cursor-pointer transition-colors',
                'hover:bg-neutral-100',
                isSelected && 'bg-neutral-100 hover:bg-neutral-100 border-l-4 border-l-neutral-600',
            )}
            onClick={() => onSelect(prompt)}
        >
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-start gap-2">
                    <h2 className="font-medium text-sm truncate max-w-[180px]">
                        {name || 'Untitled Prompt'}
                    </h2>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDate(updatedAt)}
                    </span>
                </div>
                
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {tags.slice(0, 3).map(tag => tag && (
                            <TagComponent
                                key={tag.id}
                                name={tag.name}
                                color={tag.color}
                                className="text-xs py-0.5 px-2 h-auto leading-none"
                            />
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs text-muted-foreground self-center">
                                +{tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}