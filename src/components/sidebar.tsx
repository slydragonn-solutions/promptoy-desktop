import { HistoryIcon, TrashIcon, CheckIcon, Edit2, Info } from "lucide-react"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { useCallback, useState } from "react"
import { promptsStore } from "@/store/prompts-store"
import { PromptContent } from "@/types/prompts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface NoteItemProps {
    id: string;
    content: string;
    createdAt: string;
}

function NoteItem({ id, content, createdAt }: NoteItemProps) {
    return (
        <li className="flex flex-col gap-2 py-2 px-4 border border-neutral-200 rounded-md bg-neutral-50">
            <div className="flex justify-between gap-2">
                <p className="text-xs text-neutral-500">{createdAt}</p>
                <TrashIcon className="cursor-pointer w-4 h-4 text-neutral-400 hover:text-red-500"/>
            </div>
            <p className="text-sm">{content}</p>
        </li>
    )
}

interface VersionItemProps {
    version: PromptContent;
    isActive: boolean;
    onSelect: (version: PromptContent) => void;
    onRename: (version: PromptContent) => void;
    onDelete: (version: PromptContent) => void;
}

function VersionItem({ version, isActive, onSelect, onRename, onDelete }: VersionItemProps) {
    const displayText = version.name || new Date(version.date).toLocaleString();

    return (
        <li 
            className={`group flex justify-between items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors ${
                isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
            }`}
            onClick={() => onSelect(version)}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{displayText}</p>
                    <div className="flex items-center gap-1">
                        <button 
                            className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRename(version);
                            }}
                        >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button 
                            className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(version);
                            }}
                        >
                            <TrashIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {new Date(version.date).toLocaleString()}
                </p>
            </div>
            {isActive && <CheckIcon className="w-4 h-4 text-blue-500" />}
        </li>
    );
}

const MAX_VERSIONS = 50;

export default function Sidebar() {
    const { selectedPrompt, updatePrompt } = promptsStore();
    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [versionToRename, setVersionToRename] = useState<PromptContent | null>(null);
    const [newVersionName, setNewVersionName] = useState('');
    const [versionError, setVersionError] = useState('');
    
    const handleOpenVersionDialog = useCallback(() => {
        setNewVersionName('');
        setVersionError('');
        setIsVersionDialogOpen(true);
    }, []);
    
    const handleCreateNewVersion = useCallback(() => {
        if (!selectedPrompt) return;
        
        if (selectedPrompt.versions.length >= MAX_VERSIONS) {
            setVersionError(`Maximum of ${MAX_VERSIONS} versions allowed`);
            return;
        }
        
        if (!newVersionName.trim()) {
            setVersionError('Version name is required');
            return;
        }
        
        const newVersion: PromptContent = {
            name: newVersionName.trim(),
            content: selectedPrompt.versions[0]?.content || '',
            date: new Date().toISOString()
        };
        
        const updatedPrompt = {
            ...selectedPrompt,
            versions: [newVersion, ...selectedPrompt.versions],
            updatedAt: new Date().toISOString()
        };
        
        updatePrompt(selectedPrompt.id, updatedPrompt);
        setNewVersionName('');
        setIsVersionDialogOpen(false);
    }, [selectedPrompt, updatePrompt, newVersionName]);

    const handleRenameVersion = useCallback((version: PromptContent) => {
        setVersionToRename(version);
        setNewVersionName(version.name || '');
        setIsRenameDialogOpen(true);
    }, []);

    const handleConfirmRename = useCallback(() => {
        if (!selectedPrompt || !versionToRename || !newVersionName.trim()) {
            setVersionError('Version name is required');
            return;
        }

        const updatedVersions = selectedPrompt.versions.map(v => 
            v.date === versionToRename.date 
                ? { ...v, name: newVersionName.trim() } 
                : v
        );

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: updatedVersions,
            updatedAt: new Date().toISOString()
        });

        setIsRenameDialogOpen(false);
        setVersionToRename(null);
        setNewVersionName('');
    }, [selectedPrompt, versionToRename, newVersionName, updatePrompt]);

    const handleDeleteVersion = useCallback((version: PromptContent) => {
        if (!selectedPrompt) return;
        
        // Don't allow deleting the last version
        if (selectedPrompt.versions.length <= 1) {
            alert('Cannot delete the only version');
            return;
        }

        const updatedVersions = selectedPrompt.versions.filter(v => v.date !== version.date);
        
        // If we're deleting the active version, make the first remaining version active
        const wasActive = selectedPrompt.versions[0].date === version.date;
        const newVersions = wasActive 
            ? [updatedVersions[0], ...updatedVersions.slice(1)] 
            : updatedVersions;

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: newVersions,
            updatedAt: new Date().toISOString()
        });
    }, [selectedPrompt, updatePrompt]);
    
    const handleVersionSelect = useCallback((version: PromptContent) => {
        if (!selectedPrompt) return;
        
        // Move the selected version to the top of the versions array
        const otherVersions = selectedPrompt.versions.filter(v => v.date !== version.date);
        const updatedPrompt = {
            ...selectedPrompt,
            versions: [version, ...otherVersions],
            updatedAt: new Date().toISOString()
        };
        
        updatePrompt(selectedPrompt.id, updatedPrompt);
    }, [selectedPrompt, updatePrompt]);
    
    if (!selectedPrompt) {
        return (
            <section className="flex flex-col gap-2 min-w-80 w-80 h-screen p-2 border-l border-l-neutral-200 bg-neutral-100">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a prompt to view versions</p>
                </div>
            </section>
        );
    }
    
    return (
        <section className="flex flex-col gap-2 min-w-80 w-80 h-screen p-2 border-l border-l-neutral-200 bg-neutral-100">
            <Tabs defaultValue="versions" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="versions">
                    <div className="space-y-2">
                        <div className="relative">
                            <Button 
                                variant="outline" 
                                className="w-full gap-2"
                                onClick={handleOpenVersionDialog}
                                disabled={selectedPrompt.versions.length >= MAX_VERSIONS}
                            >
                                <HistoryIcon className="w-4 h-4" />
                                New Version
                            </Button>
                            {selectedPrompt.versions.length >= MAX_VERSIONS && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Maximum of {MAX_VERSIONS} versions allowed</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground text-right px-1">
                            {selectedPrompt.versions.length}/{MAX_VERSIONS} versions
                        </div>
                        
                        <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Version</DialogTitle>
                                    <DialogDescription>
                                        Create a new version of your prompt
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {selectedPrompt.versions.length}/{MAX_VERSIONS} versions used
                                        </div>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="versionName" className="text-right">
                                            Name
                                        </Label>
                                        <div className="col-span-3 space-y-2">
                                            <Input
                                                id="versionName"
                                                value={newVersionName}
                                                onChange={(e) => {
                                                    setNewVersionName(e.target.value);
                                                    if (versionError) setVersionError('');
                                                }}
                                                placeholder="e.g., v2.0, Production, etc."
                                                className={versionError ? 'border-red-500' : ''}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCreateNewVersion();
                                                    }
                                                }}
                                            />
                                            {versionError && (
                                                <p className="text-sm text-red-500">{versionError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsVersionDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleCreateNewVersion}
                                        disabled={!newVersionName.trim()}
                                    >
                                        Create Version
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <ScrollArea className="h-[calc(100vh-160px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            {selectedPrompt.versions.map((version) => (
                                <VersionItem
                                    key={version.date}
                                    version={version}
                                    isActive={version.date === selectedPrompt.versions[0]?.date}
                                    onSelect={handleVersionSelect}
                                    onRename={handleRenameVersion}
                                    onDelete={(v) => {
                                        if (confirm(`Are you sure you want to delete version "${v.name || 'Untitled'}"?`)) {
                                            handleDeleteVersion(v);
                                        }
                                    }}
                                />
                            ))}
                            
                            {/* Rename Version Dialog */}
                            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Rename Version</DialogTitle>
                                        <DialogDescription>
                                            Enter a new name for this version.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="renameVersion" className="text-right">
                                                Name
                                            </Label>
                                            <div className="col-span-3 space-y-2">
                                                <Input
                                                    id="renameVersion"
                                                    value={newVersionName}
                                                    onChange={(e) => {
                                                        setNewVersionName(e.target.value);
                                                        if (versionError) setVersionError('');
                                                    }}
                                                    placeholder="Enter version name"
                                                    className={versionError ? 'border-red-500' : ''}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleConfirmRename();
                                                        }
                                                    }}
                                                />
                                                {versionError && (
                                                    <p className="text-sm text-red-500">{versionError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                setIsRenameDialogOpen(false);
                                                setVersionToRename(null);
                                                setNewVersionName('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleConfirmRename}
                                            disabled={!newVersionName.trim()}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </ul>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="notes">
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            <NoteItem id="1" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                            <NoteItem id="2" content="Lorem ipsum dolor sit amet consectetur" createdAt="2025-06-23"/>
                            <NoteItem id="3" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                            <NoteItem id="4" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                        </ul>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </section>
    )
}