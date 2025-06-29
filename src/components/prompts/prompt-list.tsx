import { Plus, FilterIcon, ChevronDown, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useMemo, useState, useEffect } from "react";
import { promptsStore } from "@/store/prompts-store";
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
import PromptItem from "./prompt-item";
import { NewPromptDialog } from "./new-prompt-dialog";

type SortOption = "a-z" | "z-a" | "newest" | "oldest";

export default function PromptList() {
  const { prompts, isLoading, getPrompts, selectedPrompt, setSelectedPrompt } =
    promptsStore();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Load prompts when component mounts
  useEffect(() => {
    getPrompts();
  }, [getPrompts]);

  // Filter and sort prompts based on search and sort options
  const filteredAndSortedPrompts = useMemo(() => {
    const filtered = prompts.filter(
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
  }, [prompts, search, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "a-z", label: "A to Z" },
    { value: "z-a", label: "Z to A" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];
  return (
    <section className="flex flex-col gap-2 min-w-72 w-72 h-screen border-r border-r-neutral-200">
      <div className="flex justify-between items-center p-2">
        <p className="mt-2 font-bold text-center">All Prompts</p>
        <Tooltip>
          <TooltipTrigger>
            <NewPromptDialog onPromptCreated={getPrompts}>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600"
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
      <div className="flex gap-2 p-2">
        <Input
          type="text"
          placeholder="Search your prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-full"
        />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="secondary"
              className="flex items-center gap-2 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600"
            >
              <FilterIcon className="h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-neutral-600">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && prompts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading prompts...</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
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
          </ScrollArea>
        )}
      </div>
    </section>
  );
}

