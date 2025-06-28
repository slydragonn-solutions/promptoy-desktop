import { Editor as MonacoEditor, OnChange, OnMount } from "@monaco-editor/react";
import { Button } from "./ui/button";
import { EllipsisVerticalIcon, FileTextIcon, Trash2, Tags, Heart } from "lucide-react";
import { TagSelector } from "./tags/tag-selector";
import { AIChat } from "./ai-chat";
import { useEffect, useRef, useState, useCallback } from "react";
import { promptsStore } from "@/store/prompts-store";
import { toast } from "sonner";
import { Prompt } from "@/types/prompts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export default function Editor() {
  const { selectedPrompt, updatePrompt, removePrompt } = promptsStore();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const MAX_CONTENT_LENGTH = 10000;
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update content when selected prompt changes
  useEffect(() => {
    if (selectedPrompt) {
      if (selectedPrompt.versions.length > 0) {
        setContent(selectedPrompt.versions[0].content);
      } else {
        setContent("");
      }
      setNewName(selectedPrompt.name);
    }
  }, [selectedPrompt]);

  const handleUpdatePrompt = useCallback(async (updates: Partial<Prompt>) => {
    if (!selectedPrompt) return false;
    
    setIsSaving(true);
    try {
      // Create a new object with the updated values
      const updatedPrompt = {
        ...selectedPrompt,
        ...updates,
        // Ensure tags is always an array
        tags: updates.tags || selectedPrompt.tags || [],
        updatedAt: new Date().toISOString(),
      };
      
      await updatePrompt(selectedPrompt.id, updatedPrompt);
      return true;
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error("Failed to update prompt");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedPrompt, updatePrompt]);

  const saveContent = useCallback(async (value: string) => {
    if (!selectedPrompt) return;
    
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const currentVersion = selectedPrompt.versions[0];
      
      await updatePrompt(selectedPrompt.id, {
        ...selectedPrompt,
        versions: [
          {
            ...(currentVersion || { name: 'Untitled' }),
            content: value,
            date: now
          },
          ...selectedPrompt.versions.slice(1)
        ],
        updatedAt: now
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  }, [selectedPrompt, updatePrompt]);

  const handleRename = useCallback(async () => {
    if (!selectedPrompt || !newName.trim()) return;
    
    // Enforce 50 character limit
    const trimmedName = newName.trim();
    if (trimmedName.length > 50) {
      toast.error("Prompt name cannot exceed 50 characters");
      return;
    }
    
    const success = await handleUpdatePrompt({ name: trimmedName });
    if (success) {
      setIsRenameDialogOpen(false);
      setNewName('');
    }
  }, [selectedPrompt, newName, handleUpdatePrompt]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      console.log("hello from handle copy")
      toast.success("Prompt content copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy to clipboard");
    }
  }, [content]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenameDialogOpen(false);
      setNewName('');
    }
  }, [handleRename]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    // Add listener for paste events
    const disposable = editor.onDidPaste(() => {
      // We can't directly access the pasted text, so we'll check the content length after paste
      // and trim if needed
      setTimeout(() => {
        const newContent = editor.getValue();
        if (newContent.length > MAX_CONTENT_LENGTH) {
          // Trim the content to the max length
          editor.setValue(newContent.substring(0, MAX_CONTENT_LENGTH));
          toast.error(`Content cannot exceed ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
        }
      }, 0);
    });

    // Clean up the event listener when the component unmounts
    return () => {
      disposable.dispose();
    };
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      if (value.length <= MAX_CONTENT_LENGTH) {
        setContent(value);
        // Clear any pending saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        // Set a new timeout to save after 1 second of inactivity
        saveTimeoutRef.current = setTimeout(() => {
          saveContent(value || '');
        }, 1000);
      } else {
        toast.error(`Content cannot exceed ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
      }
    }
  };

  const handleDeletePrompt = async () => {
    if (!selectedPrompt) return;
    
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await removePrompt(selectedPrompt.id);
        toast.success("Prompt deleted successfully");
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error("Failed to delete prompt");
      }
    }
  };

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

    if (!selectedPrompt) {
        return (
            <section className="relative flex flex-col items-center justify-center gap-4 w-[calc(100vw-320px-288px-48px)] h-screen p-2 text-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <FileTextIcon className="h-12 w-12 opacity-50" />
                    <h2 className="text-xl font-medium">No Prompt Selected</h2>
                    <p className="text-sm mb-4">Select a prompt from the list or create a new one</p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative flex flex-col gap-2 w-[calc(100vw-320px-288px-48px)] h-screen p-2">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 
                            className="font-bold text-xl cursor-text hover:bg-accent/50 px-2 py-1 rounded-md"
                            onClick={() => {
                                setNewName(selectedPrompt.name);
                                setIsRenameDialogOpen(true);
                            }}
                        >
                            {selectedPrompt.name}
                        </h1>
                        {isSaving && (
                            <Badge>
                                Saving...
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedPrompt && (
                        <>
                            
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className={selectedPrompt.isFavorite ? "text-red-400" : ""}
                                onClick={() => {
                                    handleUpdatePrompt({ isFavorite: !selectedPrompt.isFavorite });
                                }}
                            >
                                <Heart 
                                    className={`h-4 w-4 ${selectedPrompt.isFavorite ? "fill-current" : ""}`} 
                                />
                            </Button>
                            <AIChat />
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="ghost" size="icon">
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => {
                                        setNewName(selectedPrompt.name);
                                        setIsRenameDialogOpen(true);
                                    }}>
                                        <FileTextIcon className="mr-2 h-4 w-4" />
                                        <span>Rename</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCopyToClipboard}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                        <span>Copy Content</span>
                                    </DropdownMenuItem>
                                    <Separator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                        onClick={handleDeletePrompt}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete Prompt</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
              <TagSelector
                  value={selectedPrompt.tags || []}
                  onChange={(tags) => {
                      // Create a new object to trigger the update
                      const updatedPrompt = { ...selectedPrompt, tags };
                      handleUpdatePrompt(updatedPrompt);
                  }}
                  className="flex flex-wrap gap-1"
                  trigger={
                      <Button type="button" variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                          <Tags className="h-4 w-4 mr-1" />
                          {selectedPrompt.tags?.length ? `${selectedPrompt.tags.length} tags` : 'Add tags'}
                      </Button>
                  }
              />
          </div>
            <div className="relative h-full">
                <MonacoEditor
                    height="100%"
                    defaultLanguage="markdown"
                    value={content}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        wordWrap: 'on',
                    }}
                />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center gap-2 p-2 border-t border-t-neutral-200 text-xs text-muted-foreground bg-neutral-50">
                <div className="flex items-center gap-4">
                    <span>Created: {selectedPrompt ? getFormattedDate(selectedPrompt.createdAt) : 'N/A'}</span>
                    <span>Updated: {selectedPrompt ? getFormattedDate(selectedPrompt.updatedAt) : 'N/A'}</span>
                </div>
                <span>Characters: {content?.length.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}</span>
            </div>

            {/* Rename Prompt Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rename Prompt</DialogTitle>
                        <DialogDescription>
                            Enter a new name for your prompt.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="relative">
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            setNewName(e.target.value);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pr-16"
                                    autoFocus
                                    placeholder="Enter prompt name"
                                    maxLength={50}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {newName.length}/50
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsRenameDialogOpen(false);
                                setNewName('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleRename}
                            disabled={!newName.trim() || newName.trim().length > 50}
                        >
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}