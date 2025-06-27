import { Editor as MonacoEditor, OnChange, OnMount } from "@monaco-editor/react";
import { Button } from "./ui/button";
import { EllipsisVerticalIcon, FileTextIcon, TagIcon, Trash2, Star } from "lucide-react";
import { AIChat } from "./ai-chat";
import { useEffect, useRef, useState } from "react";
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


export default function Editor() {
    const { selectedPrompt, updatePrompt, removePrompt } = promptsStore();
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Update content when selected prompt changes
    useEffect(() => {
        if (selectedPrompt && selectedPrompt.versions.length > 0) {
            setContent(selectedPrompt.versions[0].content);
        } else {
            setContent("");
        }
    }, [selectedPrompt]);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    const handleEditorChange: OnChange = (value) => {
        if (!selectedPrompt) return;
        
        setContent(value || '');
        
        // Clear any pending saves
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Set a new timeout to save after 1 second of inactivity
        saveTimeoutRef.current = setTimeout(() => {
            saveContent(value || '');
        }, 1000);
    };

    const handleUpdatePrompt = async (updates: Partial<Prompt>) => {
        if (!selectedPrompt) return;
        
        setIsSaving(true);
        try {
            const updatedPrompt = {
                ...selectedPrompt,
                ...updates,
                updatedAt: new Date().toISOString()
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
    };

    const saveContent = async (value: string) => {
        if (!selectedPrompt) return;
        
        setIsSaving(true);
        try {
            // Create a new version with the updated content
            const now = new Date().toISOString();
            const currentVersion = selectedPrompt.versions[0];
            
            await handleUpdatePrompt({
                versions: [
                    {
                        ...(currentVersion || { name: 'Untitled' }),
                        content: value,
                        date: now
                    },
                    // Keep other versions
                    ...selectedPrompt.versions.slice(1)
                ]
            });
        } catch (error) {
            console.error('Error saving prompt:', error);
            toast.error("Failed to save prompt");
        } finally {
            setIsSaving(false);
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
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-xl">
                        {selectedPrompt.name}
                    </h1>
                    
                </div>
                <div className="flex items-center gap-2">
                    {selectedPrompt && (
                        <>
                            
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className={selectedPrompt.isFavorite ? "text-yellow-500" : ""}
                                onClick={() => {
                                    handleUpdatePrompt({ isFavorite: !selectedPrompt.isFavorite });
                                }}
                            >
                                <Star 
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
                                    <DropdownMenuItem>
                                        <FileTextIcon className="mr-2 h-4 w-4" />
                                        <span>Rename</span>
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
            <div className="flex items-center gap-1 mr-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <MonacoEditor 
                className="mt-2" 
                height="80vh" 
                width="100%" 
                language="markdown" 
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
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center gap-2 p-2 border-t border-t-neutral-200 text-xs text-muted-foreground bg-neutral-50">
                <div className="flex items-center gap-4">
                    <span>Created: {selectedPrompt ? getFormattedDate(selectedPrompt.createdAt) : 'N/A'}</span>
                    <span>Updated: {selectedPrompt ? getFormattedDate(selectedPrompt.updatedAt) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Characters: {content.length}</span>
                    <span>Tokens: {Math.ceil(content.length / 4)}</span>
                    {isSaving && <span className="text-blue-500">Saving...</span>}
                </div>
            </div>
        </section>
    )
}