import { PromptContent } from "@/types/prompts";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { MAX_VERSIONS } from "@/constants/prompt"
import { HistoryIcon } from "lucide-react"
import NewVersionDialog from "./new-version-dialog"
import VersionItem from "./version-item"
import RenameVersionDialog from "./rename-version-dialog"
import { promptsStore } from "@/store/prompts-store"
import { useVersionManagement } from "@/hooks/use-version-management"
import { useVersionRename } from "@/hooks/use-version-rename"


interface VersionListProps {
    onCompareVersion?: (version: PromptContent) => void;
    isComparing?: boolean;
}

export default function VersionList({ onCompareVersion, isComparing = false }: VersionListProps) {
    const { selectedPrompt } = promptsStore();
    const currentVersion = selectedPrompt?.versions?.[0]; // Most recent version is the current one
    
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
    
    if (!selectedPrompt) {
        return null;
    }
    
    return (
        <>
            <div className="space-y-2">
                <div className="relative">
                    <Button 
                        variant="outline" 
                        className="w-full gap-2 rounded-full text-neutral-600"
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
                        newVersionName={renameVersionName}
                        setNewVersionName={setRenameVersionName}
                        versionError={versionError}
                        handleConfirmRename={() => handleRenameConfirm(selectedPrompt)}
                    />
                </ul>
            </ScrollArea>
        </>
    )
}