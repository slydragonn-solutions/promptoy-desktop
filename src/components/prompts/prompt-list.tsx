import { FilterIcon, ChevronDown, Check, FolderPlus, ChevronRight, ChevronDown as ChevronDownIcon, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { useMemo, useEffect, useState } from "react";
import { promptsStore } from "@/store/prompts-store";
import { useGroupsStore } from "@/store/groups-store";
import usePromptsGroup from "@/hooks/use-prompts-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PromptItem from "./prompt-item";
import { NewPromptDialog } from "./new-prompt-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type SortOption = "a-z" | "z-a" | "newest" | "oldest";
type ListByOption = "all" | "local" | "backup";

interface PromptListProps {
  listBy?: ListByOption;
  title?: string;
}

export default function PromptList({ listBy = "all", title = "All Prompts" }: PromptListProps) {
  const { prompts, isLoading, updatePrompt, getPrompts, selectedPrompt, setSelectedPrompt } = promptsStore();
  const { loadGroups } = useGroupsStore();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  
  // Use the new usePromptsGroup hook
  const {
    groups,
    expandedGroups,
    editingGroupId,
    editingGroupName,
    contextMenu,
    setEditingGroupName,
    toggleGroup,
    handleCreateGroup: createGroup,
    handleContextMenu,
    handleRenameGroup,
    handleDeleteGroup,
    handleSaveRename,
    handleKeyDown
  } = usePromptsGroup(prompts);
  
  // Load prompts and groups when component mounts
  useEffect(() => {
    getPrompts();
    loadGroups();
  }, [getPrompts, loadGroups]);
  
  // Handle creating a new group from the dialog
  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim());
      setNewGroupName("");
      setIsGroupDialogOpen(false);
    }
  };

  // Filter prompts based on listBy prop and search
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Apply listBy filter
    switch (listBy) {
      case 'local':
        filtered = filtered.filter(prompt => prompt.isSynced === false);
        break;
      case 'backup':
        filtered = filtered.filter(prompt => prompt.isSynced === true);
        break;
      // 'all' case - no additional filtering needed
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(prompt => prompt.isFavorite === true);
    }

    // Apply search filter
    filtered = filtered.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(search.toLowerCase()) ||
        (prompt.versions &&
          prompt.versions.some((version) =>
            version.content.toLowerCase().includes(search.toLowerCase()),
          )),
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        case "newest":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [prompts, search, sortBy, listBy, showFavoritesOnly]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "a-z", label: "A to Z" },
    { value: "z-a", label: "Z to A" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  return (
    <section className="flex flex-col gap-2 min-w-72 w-72 h-screen border-r border-r-neutral-200">
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{title}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg"
              >
                <FilterIcon className="h-4 w-4" />
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-neutral-600">
              <div className="px-2 py-1.5 text-xs font-medium text-neutral-500">Sort By</div>
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-neutral-200 my-1" />
              <DropdownMenuItem
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>Favorites Only</span>
                {showFavoritesOnly && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Group</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Organize your prompts into groups for better management.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="group-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter group name"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger>
              <NewPromptDialog onPromptCreated={getPrompts}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-neutral-50 hover:bg-neutral-200 text-neutral-600 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </NewPromptDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Prompt</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex gap-2 p-2">
        <Input
          type="text"
          placeholder="Search your prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-full bg-neutral-50 text-neutral-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto w-full">
        {isLoading && prompts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading prompts...</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <Accordion type="multiple" className="w-full">
              {/* Ungrouped Prompts */}
              <AccordionItem value="ungrouped" defaultChecked>
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>All</span>
                    <span className="text-xs text-muted-foreground">
                      ({filteredAndSortedPrompts.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {filteredAndSortedPrompts.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      {search ? "No matching prompts found" : "No prompts available"}
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {filteredAndSortedPrompts.map((prompt) => {
                        const isSelected = selectedPrompt?.id === prompt.id;
                        return (
                          <PromptItem
                            key={prompt.id}
                            prompt={prompt}
                            isSelected={isSelected}
                            onSelect={setSelectedPrompt}
                          />
                        );
                      })}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Groups */}
              {groups.length > 0 && (
                <AccordionItem value="groups">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>Groups</span>
                      <span className="text-xs text-muted-foreground">
                        ({groups.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {groups.map((group) => {
                        const groupPrompts = filteredAndSortedPrompts.filter(p => 
                          p.group === group.id
                        );
                        
                        return (
                          <div key={group.id} className="mb-2 group" onContextMenu={(e) => handleContextMenu(e, group.id)}>
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <button
                                  onClick={() => toggleGroup(group.id)}
                                  className="flex items-center w-full px-3 py-1.5 text-sm font-medium text-left rounded-md hover:bg-accent"
                                >
                                  {expandedGroups[group.id] ? (
                                    <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                                  )}
                                  
                                  {editingGroupId === group.id ? (
                                    <div className="flex-1 flex items-center">
                                      <Input
                                        value={editingGroupName}
                                        onChange={(e) => setEditingGroupName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, group.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-6 text-sm px-2 py-1"
                                        data-group-input={group.id}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 ml-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveRename(group.id);
                                        }}
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="truncate">{group.name}</span>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {groupPrompts.length}
                                      </span>
                                    </>
                                  )}
                                </button>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem onClick={handleRenameGroup}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Rename
                                </ContextMenuItem>
                                <ContextMenuItem 
                                  onClick={async () => {
                                    if (contextMenu.groupId) {
                                      await handleDeleteGroup(updatePrompt);
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                            
                            {expandedGroups[group.id] && (
                              <ul className="mt-1 ml-6 space-y-1">
                                {groupPrompts.map((prompt) => {
                                  const isSelected = selectedPrompt?.id === prompt.id;
                                  return (
                                    <li key={prompt.id}>
                                      <PromptItem
                                        prompt={prompt}
                                        isSelected={isSelected}
                                        onSelect={setSelectedPrompt}
                                      />
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </section>
  );
}

