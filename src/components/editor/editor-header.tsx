import { Prompt } from "@/types/prompts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    EllipsisVerticalIcon,
    FileTextIcon,
    Trash2,
    Heart,
    Folder,
    ChevronDown,
    Check,
    X,
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useGroupsStore } from "@/store/groups-store";
import { useState } from "react";
import { toast } from "sonner";

interface EditorHeaderProps {
    promptName: string;
    isFavorite: boolean;
    isSaving: boolean;
    currentGroupId?: string | null;
    setIsRenameDialogOpen: (open: boolean) => void;
    setNewName: (name: string) => void;
    handleUpdatePrompt: (prompt: Partial<Prompt>) => Promise<boolean>;
    handleCopyToClipboard: () => void;
    handleDeletePrompt: () => void;
}

export default function EditorHeader({
    promptName,
    isFavorite,
    isSaving,
    currentGroupId,
    setIsRenameDialogOpen,
    setNewName,
    handleUpdatePrompt,
    handleCopyToClipboard,
    handleDeletePrompt,
}: EditorHeaderProps) {
    const { groups } = useGroupsStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleMoveToGroup = async (groupId: string | null) => {
        if (groupId === currentGroupId) return;
        
        setIsLoading(true);
        try {
            const success = await handleUpdatePrompt({ 
                group: groupId || undefined // Convert null to undefined for TypeScript
            });
            if (success) {
                const groupName = groupId ? groups.find(g => g.id === groupId)?.name : 'Ungrouped';
                toast.success(`Moved to ${groupName}`);
            } else {
                toast.error('Failed to move prompt');
            }
        } catch (error) {
            console.error('Error moving prompt:', error);
            toast.error('Failed to move prompt');
        } finally {
            setIsLoading(false);
        }
    };
    return (
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h1
              className="font-semibold text-xl cursor-text text-neutral-800 hover:text-neutral-600 px-2 py-1 rounded-md"
              onClick={() => {
                setNewName(promptName);
                setIsRenameDialogOpen(true);
              }}
            >
              {promptName}
            </h1>
            {isSaving && <Badge>Saving...</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg flex items-center gap-1"
                        disabled={isLoading}
                    >
                        <Folder className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Move to group
                    </div>
                    {groups.map((group) => (
                        <DropdownMenuItem 
                            key={group.id}
                            onSelect={(e) => {
                                e.preventDefault();
                                if (currentGroupId === group.id) {
                                    handleMoveToGroup(null);
                                } else {
                                    handleMoveToGroup(group.id);
                                }
                            }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Folder className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{group.name}</span>
                            </div>
                            {currentGroupId === group.id && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                    {currentGroupId && (
                        <>
                            <div className="h-px bg-border my-1" />
                            <DropdownMenuItem 
                                onSelect={(e) => {
                                    e.preventDefault();
                                    handleMoveToGroup(null);
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <X className="mr-2 h-4 w-4" />
                                <span>Remove from group</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
                variant="ghost"
                size="icon"
                className={`rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg ${isFavorite ? "text-red-300" : ""}`}
                onClick={() => {
                    handleUpdatePrompt({
                        isFavorite: !isFavorite,
                        group: currentGroupId || undefined // Convert null to undefined for TypeScript
                    });
                }}
                disabled={isLoading}
            >
                <Heart
                    className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
            </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-neutral-600">
                  <DropdownMenuItem
                    onClick={() => {
                      setNewName(promptName);
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyToClipboard}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy Content</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:bg-destructive/10 focus:text-destructive"
                    onClick={handleDeletePrompt}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Prompt</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
        </div>
      </div>
    );
}