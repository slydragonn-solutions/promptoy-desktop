import { PromptContent } from "@/types/prompts";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Plus } from "lucide-react"
import { MAX_VERSIONS } from "@/constants/prompt"
import NewVersionDialog from "./new-version-dialog"
import VersionItem from "./version-item"
import RenameVersionDialog from "./rename-version-dialog"
import { promptsStore } from "@/store/prompts-store"
import { useVersionManagement } from "@/hooks/use-version-management"
import { Input } from "../ui/input";
import { useState } from "react";

interface VersionListProps {
    onCompareVersion?: (version: PromptContent) => void;
    isComparing?: boolean;
}

export default function VersionList({ onCompareVersion, isComparing = false }: VersionListProps) {
    const { selectedPrompt } = promptsStore();
    const currentVersion = selectedPrompt?.versions?.[0]; // Most recent version is the current one
    const [search, setSearch] = useState("");    
    // Version management and rename functionality
    const {
        isVersionDialogOpen,
        isRenameDialogOpen,
        newVersionName,
        versionError,
        renameError,
        setNewVersionName,
        setVersionError,
        setIsVersionDialogOpen,
        handleOpenVersionDialog,
        handleCreateVersion: handleCreateNewVersion,
        handleDeleteVersion,
        handleSelectVersion,
        handleRenameVersion,
        handleConfirmRename,
        closeRenameDialog,
    } = useVersionManagement();
    
    if (!selectedPrompt) {
        return null;
    }
    
    return (
        <>
            <div className="space-y-2">
                <div className="relative">
                    <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search your versions..."
                        className="flex-1 rounded-xl bg-neutral-50 text-neutral-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button 
                        variant="secondary"
                        size="icon"
                        title="Create new version"
                        className="rounded-xl text-neutral-600 bg-neutral-200 hover:bg-neutral-50"
                        onClick={handleOpenVersionDialog}
                        disabled={selectedPrompt.versions.length >= MAX_VERSIONS}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    </div>
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
                    {selectedPrompt.versions.length}/{MAX_VERSIONS}
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
                    {selectedPrompt.versions.filter((version) => version.name?.toLowerCase().includes(search.toLowerCase())).map((version) => (
                        <VersionItem
                            key={version.date}
                            version={version}
                            isCurrentVersion={version.date === currentVersion?.date}
                            isActive={!isComparing && version.date === selectedPrompt.versions[0]?.date}
                            onSelect={(version) => selectedPrompt && handleSelectVersion(selectedPrompt, version)}
                            onDelete={(version) => selectedPrompt && handleDeleteVersion(selectedPrompt, version)}
                            onRename={handleRenameVersion}
                            onCompare={onCompareVersion}
                            isComparing={isComparing}
                        />
                    ))}
                    <RenameVersionDialog
                        isRenameDialogOpen={isRenameDialogOpen}
                        setIsRenameDialogOpen={closeRenameDialog}
                        newVersionName={newVersionName}
                        setNewVersionName={setNewVersionName}
                        versionError={renameError}
                        handleConfirmRename={() => handleConfirmRename(selectedPrompt)}
                    />
                </ul>
            </ScrollArea>
        </>
    )
}