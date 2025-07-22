import { useState, useMemo, useEffect } from "react";
import { FilterIcon, ChevronDown, Check, FolderPlus, ChevronRight, ChevronDown as ChevronDownIcon, Pencil, Trash2, Star } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
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
import { CommandPrompt } from "./command-prompt";
import { Label } from "@/components/ui/label";

type SortOption = "a-z" | "z-a" | "newest" | "oldest";
type ListByOption = "all" | "backup";

interface PromptListProps {
  listBy?: ListByOption;
  title?: string;
}

export default function PromptList({ listBy = "all", title = "All Prompts" }: PromptListProps) {
  const { prompts, isLoading, updatePrompt, getPrompts, selectedPrompt, setSelectedPrompt } = promptsStore();
  const { loadGroups } = useGroupsStore();
  const [search, setSearch] = useState("");
  const { list: { listOpenOnStart }, filter: { sortBy: settingsSortBy } } = useSettingsStore();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [localSortBy, setLocalSortBy] = useState<SortOption>(settingsSortBy);

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
    
    // Apply open on start behavior
    if (isInitialLoad && listOpenOnStart === 'all') {
      // This will expand all groups if needed
      // You might need to implement group expansion logic here
      // based on your group implementation
      setIsInitialLoad(false);
    }
  }, [getPrompts, loadGroups, listOpenOnStart, isInitialLoad]);
  
  // Handle creating a new group from the dialog
  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim());
      setNewGroupName("");
    }
  };

  // Filter prompts based on listBy prop and search
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = [...prompts];

    // Apply listBy filter
    if(listBy === 'backup'){
        filtered = filtered.filter(prompt => prompt.isSynced === true);
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

    // Apply sorting
    switch (localSortBy) {
      case "a-z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
    }

    return filtered;
  }, [prompts, search, localSortBy, listBy, showFavoritesOnly]);

  // Update local sort when settings change
  useEffect(() => {
    setLocalSortBy(settingsSortBy);
  }, [settingsSortBy]);

  // Determine which accordion items should be open by default based on settings
  const getDefaultExpandedItems = () => {
    switch (listOpenOnStart) {
      case 'all':
        return ['ungrouped', 'groups'];
      case 'none':
        return [];
      case 'groups':
        return ['groups'];
      case 'ungrouped':
        return ['ungrouped'];
      default:
        return ['ungrouped'];
    }
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getDefaultExpandedItems());

  return (
    <section className="flex flex-col gap-2 min-w-72 w-72 h-[calc(100vh-37px)] bg-neutral-100">
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-xs">{title}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Tooltip>
                <TooltipTrigger>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-xl bg-neutral-200 hover:bg-neutral-50 text-neutral-600"
              >
                <FilterIcon className="h-4 w-4" />
                <ChevronDown className="h-4 w-4" />
              </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter</p>
              </TooltipContent>
            </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-neutral-600">
              <div className="px-2 py-1.5 text-xs font-medium text-neutral-500">Sort By</div>
              <DropdownMenuItem onClick={() => setLocalSortBy("a-z")}>
                A-Z
                {localSortBy === "a-z" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocalSortBy("z-a")}>
                Z-A
                {localSortBy === "z-a" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocalSortBy("newest")}>
                Newest
                {localSortBy === "newest" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocalSortBy("oldest")}>
                Oldest
                {localSortBy === "oldest" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <div className="h-px bg-neutral-200 my-1" />
              <DropdownMenuItem
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2"><Star className={showFavoritesOnly ? "fill-current" : "text-neutral-600"} />Favorites Only</span>
                {showFavoritesOnly && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
                <Tooltip>
                    <TooltipTrigger>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-xl bg-neutral-200 hover:bg-neutral-50 text-neutral-600"
                    >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Group</p>
                  </TooltipContent>
                </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name" className="sr-only">
                        Group Name
                      </Label>
                      <div className="space-y-1 relative">
                        <Input
                          id="group-name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value.slice(0, 50))}
                          placeholder="Enter group name"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                          className="w-full rounded-xl pr-16"
                          maxLength={50}
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                          {newGroupName.length}/50
                        </span>
                      </div>
                    </div>
                    <DropdownMenuItem>
                      <Button 
                        onClick={handleCreateGroup}
                        className="w-full rounded-xl bg-indigo-400 hover:bg-indigo-500"
                        disabled={newGroupName.trim() === ""}
                      >
                        Create Group
                      </Button>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
          <CommandPrompt onPromptCreated={getPrompts} />
        </div>
      </div>
      <div className="flex gap-2 p-2">
        <Input
          type="text"
          placeholder="Search your prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl bg-neutral-50 text-neutral-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto w-full p-2">
        {isLoading && prompts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading prompts...</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <Accordion 
              type="multiple" 
              className="w-full"
              value={expandedItems}
              onValueChange={setExpandedItems}
            >
              {/* Ungrouped Prompts */}
              <AccordionItem value="ungrouped">
                <AccordionTrigger className="p-2 hover:no-underline">
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
                    <ul className="flex flex-col gap-2">
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
                  <AccordionTrigger className="p-2 hover:no-underline">
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
                                  className="flex items-center w-full px-2 py-1.5 text-sm font-medium text-left rounded-md bg-neutral-50 hover:bg-neutral-200 truncate"
                                >
                                  {expandedGroups[group.id] ? (
                                    <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                                  )}
                                  
                                  {editingGroupId === group.id ? (
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <Input
                                          value={editingGroupName}
                                          onChange={(e) => setEditingGroupName(e.target.value.slice(0, 50))}
                                          onKeyDown={(e) => handleKeyDown(e, group.id)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-6 text-sm px-2 py-1 flex-1"
                                          data-group-input={group.id}
                                          maxLength={50}
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
                                      <p className="text-xs text-muted-foreground text-right mt-1">
                                        {editingGroupName.length}/50 characters
                                      </p>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="truncate max-w-[200px]">{group.name}</span>
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

