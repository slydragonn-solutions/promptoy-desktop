import { useEffect, useState } from 'react';
import { Tag as TagComponent } from '../tags/tag';
import { Prompt } from "@/types/prompts";
import { cn } from '@/lib/utils';
import { useTagsStore } from '@/store/tags-store';
import { useGroupsStore } from '@/store/groups-store';
import { promptsStore } from '@/store/prompts-store';
import { Tag } from '@/types/tags';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Edit, Star, Trash2, MoveRight, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Alert from '../common/alert';

interface PromptItemProps {
    prompt: Prompt;
    isSelected: boolean;
    onSelect: (promptId: string) => void;
}

export default function PromptItem({ prompt, isSelected, onSelect }: PromptItemProps) {
    const { name, updatedAt, tags: tagIds = [], id, isFavorite } = prompt;
    const { getTagById, loadTags } = useTagsStore();
    const { updatePrompt, removePrompt } = promptsStore();
    const { groups, updateGroup } = useGroupsStore();
    
    const [tags, setTags] = useState<Tag[]>([]);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [isMoving, setIsMoving] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(prompt.group || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

    const handleRename = async () => {
        const trimmedName = newName.trim();
        if (!trimmedName) return;
        
        if (trimmedName.length > 50) {
            toast.error("Prompt name must be 50 characters or less");
            return;
        }
        
        try {
            await updatePrompt(id, { name: trimmedName });
            toast.success("Prompt renamed successfully");
            setIsRenaming(false);
        } catch (error) {
            toast.error("Failed to rename prompt");
        }
    };
    
    const CHAR_LIMIT = 50;
    const isNearLimit = newName.length >= CHAR_LIMIT * 0.9; // 90% of limit
    const isAtLimit = newName.length >= CHAR_LIMIT;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= CHAR_LIMIT) {
            setNewName(e.target.value);
        }
    };

    const handleToggleFavorite = async () => {
        try {
            await updatePrompt(id, { isFavorite: !isFavorite });
            toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
        } catch (error) {
            toast.error("Failed to update favorite status");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await removePrompt(id);
            toast.success("Prompt deleted successfully");
            setShowDeleteDialog(false);
        } catch (error) {
            toast.error("Failed to delete prompt");
        }
    };

    const handleMoveToGroup = async (groupId: string) => {

        if (prompt.group === groupId) {
            toast.error("Prompt is already in this group");
            setIsMoving(false);
            return;
        }

        try {
            await updatePrompt(id, { group: groupId });
            const removeGroupPrompt = groups.find(g => g.id === prompt.group)
            if (removeGroupPrompt) {
                removeGroupPrompt.prompts = removeGroupPrompt.prompts?.filter(promptId => promptId !== id);
                updateGroup(removeGroupPrompt.id, { prompts: removeGroupPrompt.prompts });
            }
            updateGroup(groupId, { prompts: [...(groups.find(g => g.id === groupId)?.prompts || []), id] });
            toast.success("Prompt moved successfully");
            setIsMoving(false);
        } catch (error) {
            toast.error("Failed to move prompt");
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <li 
                        className={cn(
                            'flex flex-col p-3 cursor-pointer transition-colors rounded-lg border border-transparent',
                            'hover:bg-neutral-200/60 bg-neutral-100 border-neutral-100',
                            isSelected && 'bg-neutral-200 hover:bg-neutral-200 border-neutral-200',
                        )}
                        onClick={() => onSelect(prompt.id)}
                    >
                        <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex justify-between items-start gap-2">
                                <h2 className={cn(
                                    'font-medium text-sm truncate max-w-[160px] text-neutral-600',
                                    isSelected && 'text-neutral-800 font-semibold'
                                )}>
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
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => setIsRenaming(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleToggleFavorite}>
                        <Star className="mr-2 h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setIsMoving(true)}>
                        <MoveRight className="mr-2 h-4 w-4" />
                        Move to Group
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                        className="text-red-600 focus:text-red-600" 
                        onClick={handleDeleteClick}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

        {/* Rename Dialog */}
        <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Prompt</DialogTitle>
                    <DialogDescription>
                        Enter a new name for this prompt.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Input
                        value={newName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        placeholder="Enter new name (max 50 characters)"
                        autoFocus
                    />
                    <div className={cn(
                        "text-xs text-right",
                        isNearLimit && !isAtLimit ? "text-amber-500" : "text-muted-foreground",
                        isAtLimit && "text-red-500 font-medium"
                    )}>
                        {newName.length}/{CHAR_LIMIT} characters
                        {isAtLimit && " - Maximum length reached"}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRenaming(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleRename}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Move to Group Dialog */}
        <Dialog open={isMoving} onOpenChange={setIsMoving}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Move to Group</DialogTitle>
                    <DialogDescription>
                        Select a group to move this prompt to.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    {groups.map((group) => (
                        <div 
                            key={group.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-neutral-200 ${selectedGroup === group.id ? 'bg-neutral-200' : ''}`}
                            onClick={() => {
                                setSelectedGroup(group.id);
                                handleMoveToGroup(group.id);
                            }}
                        >
                            <Folder className="h-4 w-4" />
                            <span>{group.name}</span>
                        </div>
                    ))}
                    {groups.length === 0 && (
                        <p className="text-sm text-muted-foreground">No groups available</p>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setSelectedGroup('');
                            handleMoveToGroup('');
                        }}
                        disabled={!selectedGroup}
                        className='rounded-xl'
                    >
                        Remove from Group
                    </Button>
                    <Button onClick={() => setIsMoving(false)} className='rounded-xl bg-indigo-400 hover:bg-indigo-500'>Done</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Alert
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onAction={handleDeleteConfirm}
                title="Are you sure?"
                description={`This will permanently delete the prompt "${name}" and cannot be undone.`}
                actionText="Delete"
            />
        </>
    );
}