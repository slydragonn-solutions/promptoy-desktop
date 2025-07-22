import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { FileText, LayoutTemplate, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { NewPromptDialog } from "./new-prompt-dialog";

interface CommandPromptProps {
  onPromptCreated: () => void;
}

export function CommandPrompt({ onPromptCreated }: CommandPromptProps) {
  const [open, setOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'blank' | 'template';
  }>({ open: false, type: 'blank' });

  const handleSelect = (type: 'blank' | 'template') => {
    setDialogState({ open: true, type });
    setOpen(false);
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleDown);

    return () => {
      document.removeEventListener('keydown', handleDown);
    };
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-xl bg-neutral-200 hover:bg-neutral-50 text-neutral-600"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Prompt (⌘N)</p>
        </TooltipContent>
      </Tooltip>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search prompt types..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Create New">
            <CommandItem onSelect={() => handleSelect('blank')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Blank Prompt</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('template')}>
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <span>From Template</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {dialogState.open && (
        <NewPromptDialog
          onPromptCreated={() => {
            onPromptCreated();
            setDialogState(prev => ({ ...prev, open: false }));
          }}
          promptType={dialogState.type}
          open={dialogState.open}
          onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        >
          <Button variant="ghost" className="hidden" />
        </NewPromptDialog>
      )}
    </>
  );
}
