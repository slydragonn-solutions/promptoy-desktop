import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RenameVersionDialogProps {
    isRenameDialogOpen: boolean;
    setIsRenameDialogOpen: (open: boolean) => void;
    newVersionName: string;
    setNewVersionName: (name: string) => void;
    versionError: string;
    handleConfirmRename: () => void;
}

export default function RenameVersionDialog({
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    newVersionName,
    setNewVersionName,
    versionError,
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
                        <div className="col-span-4 space-y-2">
                            <Input
                                id="renameVersion"
                                value={newVersionName}
                                maxLength={50}
                                onChange={(e) => {
                                    setNewVersionName(e.target.value);
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
                        onClick={() => {
                            setIsRenameDialogOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmRename}
                        className="bg-indigo-500 hover:bg-indigo-600"
                        disabled={!newVersionName.trim()}
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
     )   
}