import { NotebookPen } from "lucide-react";

export default function NoteNotFound() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <NotebookPen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
                Add your first note below and keep track of your thoughts.
            </p>
        </div>
    )
}