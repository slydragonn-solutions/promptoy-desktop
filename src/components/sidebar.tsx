import { HistoryIcon, TrashIcon, Info, Plus, MessageSquare } from "lucide-react"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { Textarea } from "./ui/textarea"
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
                <TabsContent value="notes" className="relative h-full">
                    <div className="flex flex-col h-full">
                        <ScrollArea className="h-[calc(100vh-160px)]">
                            <div className="p-4 space-y-4">
                                {selectedPrompt.notes?.length ? (
                                    [...selectedPrompt.notes]
                                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                        .map((note) => (
                                            <div key={note.date} className="flex gap-3 group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="p-3 rounded-lg bg-muted/50 inline-block max-w-[85%]">
                                                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteNote(selectedPrompt, note.date)}
                                                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                                                            aria-label="Delete note"
                                                        >
                                                            <TrashIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-1">No notes yet</h3>
                                        <p className="text-sm text-muted-foreground max-w-md">
                                            Start a conversation. Add your first note below and keep track of your thoughts.
                                        </p>
                                    </div>
                                )}
                                <div ref={notesEndRef} />
                            </div>
                        </ScrollArea>
                        
                        <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleAddNote(selectedPrompt);
                            }} className="relative">
                                <Textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Type a note..."
                                    className="min-h-[44px] max-h-32 pr-12 resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddNote(selectedPrompt);
                                        }
                                    }}
                                    rows={1}
                                />
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                                    disabled={!newNote.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="sr-only">Send note</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    )
}