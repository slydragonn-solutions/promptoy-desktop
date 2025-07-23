import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Prompt} from "@/types/prompts"
import { Button } from "@/components/ui/button";
import { MAX_VERSIONS } from "@/constants/prompt";
import { GitCompare } from "lucide-react";

interface NewVersionDialogProps {
    isVersionDialogOpen: boolean;
    setIsVersionDialogOpen: (open: boolean) => void;
    selectedPrompt: Prompt;
    newVersionName: string;
    setNewVersionName: (name: string) => void;
    versionError: string;
    setVersionError: (error: string) => void;
    handleCreateNewVersion: () => void;
}

export default function NewVersionDialog({
    isVersionDialogOpen,
    setIsVersionDialogOpen,
    selectedPrompt,
    newVersionName,
    setNewVersionName,
    versionError,
    setVersionError,
    handleCreateNewVersion
}: NewVersionDialogProps) {
    return (
        <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Versions</DialogTitle>
                    <DialogDescription>
                        Create a new version of your prompt
                        <div className="text-xs text-muted-foreground mt-1">
                            {selectedPrompt.versions.length}/{MAX_VERSIONS} versions used
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-span-4 space-y-2">
                            <Input
                                id="versionName"
                                value={newVersionName}
                                maxLength={50}
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
                            <div className="text-xs text-muted-foreground text-right">
                                {newVersionName.length}/50 characters
                            </div>
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
                        className="bg-indigo-500 hover:bg-indigo-600"
                        disabled={!newVersionName.trim()}
                    >
                        <GitCompare className="h-4 w-4" />
                        Create
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}