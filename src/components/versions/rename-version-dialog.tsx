import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { PromptContent } from "@/types/prompts";

interface RenameVersionDialogProps {
    isRenameDialogOpen: boolean;
    setIsRenameDialogOpen: (open: boolean) => void;
    setVersionToRename: (version: PromptContent | null) => void;
    newVersionName: string;
    setNewVersionName: (name: string) => void;
    versionError: string;
    setVersionError: (error: string) => void;
    handleConfirmRename: () => void;
}

export default function RenameVersionDialog({
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    setVersionToRename,
    newVersionName,
    setNewVersionName,
    versionError,   
    setVersionError,
    handleConfirmRename
}: RenameVersionDialogProps) {
    return (
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
     )   
}