import { Prompt } from "@/types/prompts";
import { Trash2 } from "lucide-react";

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
                <div className="relative group p-3 rounded-lg bg-neutral-50 max-w-[100%]">
                    <p className="text-sm break-all text-neutral-700">{content}</p>
                    <button 
                        onClick={() => handleDeleteNote(selectedPrompt, date)}
                        className="absolute top-2 right-2 p-1.5 rounded-sm text-neutral-600 bg-neutral-100 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete note"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}