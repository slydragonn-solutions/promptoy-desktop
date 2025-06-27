import { HistoryIcon, TrashIcon, Info } from "lucide-react"
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
import VersionItem from "./versions/version-item"
import NewVersionDialog from "./versions/new-version-dialog"
import RenameVersionDialog from "./versions/rename-version-dialog"
import { MAX_VERSIONS } from "@/constants/prompt"

interface NoteItemProps {
    content: string;
    createdAt: string;
}

function NoteItem({ content, createdAt }: NoteItemProps) {
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
                        
                        <NewVersionDialog
                            isVersionDialogOpen={isVersionDialogOpen}
                            setIsVersionDialogOpen={setIsVersionDialogOpen}
                            selectedPrompt={selectedPrompt}
                            newVersionName={newVersionName}
                            setNewVersionName={setNewVersionName}
                            versionError={versionError}
                            setVersionError={setVersionError}
                            handleCreateNewVersion={handleCreateNewVersion}
                        />
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
                            <RenameVersionDialog
                                isRenameDialogOpen={isRenameDialogOpen}
                                setIsRenameDialogOpen={setIsRenameDialogOpen}
                                setVersionToRename={setVersionToRename}
                                newVersionName={newVersionName}
                                setNewVersionName={setNewVersionName}
                                versionError={versionError}
                                setVersionError={setVersionError}
                                handleConfirmRename={handleConfirmRename}
                            />
                        </ul>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="notes">
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            <NoteItem content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                        </ul>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </section>
    )
}