import { HistoryIcon, TrashIcon, Info } from "lucide-react"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { promptsStore } from "@/store/prompts-store"
import { useVersionRename } from "@/hooks/use-version-rename"
import { useVersionManagement } from "@/hooks/use-version-management"
import { useNotesManagement } from "@/hooks/use-notes-management"
import { useTabs } from "@/hooks/use-tabs"
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
    const { selectedPrompt } = promptsStore();
    
    // Tabs management
    const { activeTab, handleTabChange } = useTabs('versions');
    
    // Version management
    const {
        isVersionDialogOpen,
        newVersionName,
        versionError,
        setNewVersionName,
        setVersionError,
        setIsVersionDialogOpen,
        handleOpenVersionDialog,
        handleCreateVersion: handleCreateNewVersion,
        handleDeleteVersion,
        handleSelectVersion,
    } = useVersionManagement();
    
    // Version rename functionality
    const {
        isRenameDialogOpen,
        newVersionName: renameVersionName,
        setNewVersionName: setRenameVersionName,
        handleRenameVersion,
        handleConfirmRename: handleRenameConfirm,
        closeRenameDialog,
    } = useVersionRename();
    
    // Notes management
    const {
        newNote,
        setNewNote,
        notesEndRef,
        handleAddNote,
        handleDeleteNote,
    } = useNotesManagement();
    
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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                            handleCreateNewVersion={() => handleCreateNewVersion(selectedPrompt)}
                        />
                    </div>
                    <ScrollArea className="h-[calc(100vh-160px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            {selectedPrompt.versions.map((version) => (
                                <VersionItem
                                    key={version.date}
                                    version={version}
                                    isActive={version.date === selectedPrompt.versions[0]?.date}
                                    onSelect={(version) => selectedPrompt && handleSelectVersion(selectedPrompt, version)}
                                    onDelete={(version) => selectedPrompt && handleDeleteVersion(selectedPrompt, version)}
                                    onRename={handleRenameVersion}
                                />
                            ))}
                            <RenameVersionDialog
                                isRenameDialogOpen={isRenameDialogOpen}
                                setIsRenameDialogOpen={closeRenameDialog}
                                newVersionName={renameVersionName}
                                setNewVersionName={setRenameVersionName}
                                versionError={versionError}
                                handleConfirmRename={() => handleRenameConfirm(selectedPrompt)}
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