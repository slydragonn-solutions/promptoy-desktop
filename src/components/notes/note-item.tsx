import { Prompt } from "@/types/prompts";
import { TrashIcon } from "lucide-react";

interface NoteItemProps {
    date: string;
    content: string;
    handleDeleteNote: (prompt: Prompt, date: string) => void;
    selectedPrompt: Prompt;
}

export default function NoteItem({
    date,
    content,
    handleDeleteNote,
    selectedPrompt,
}: NoteItemProps) {
    return (
        <div key={date} className="flex gap-3 group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                        {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="relative group">
                    <div className="p-3 rounded-lg bg-neutral-50 max-w-[85%]">
                        <p className="text-sm break-all">{content}</p>
                    </div>
                    <button 
                        onClick={() => handleDeleteNote(selectedPrompt, date)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        aria-label="Delete note"
                    >
                        <TrashIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}