import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import NoteItem from "@/components/notes/note-item"
import NoteNotFound from "@/components/notes/note-not-found"
import { useNotesManagement } from "@/hooks/use-notes-management"
import { promptsStore } from "@/store/prompts-store"

export default function NoteList() {
    const { selectedPrompt } = promptsStore();
    const { newNote, setNewNote, notesEndRef, handleAddNote, handleDeleteNote } = useNotesManagement();


    if (!selectedPrompt) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="p-4 space-y-4">
                    {selectedPrompt.notes?.length ? (
                        [...selectedPrompt.notes]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((note) => (
                                <NoteItem
                                    key={note.date}
                                    date={note.date}
                                    content={note.content}
                                    handleDeleteNote={handleDeleteNote}
                                    selectedPrompt={selectedPrompt}
                                />
                            ))
                    ) : (
                        <NoteNotFound />
                    )}
                    <div ref={notesEndRef} />
                </div>
            </ScrollArea>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleAddNote(selectedPrompt);
            }} className="relative">
                <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type a note..."
                    className="min-h-[40px] max-h-32 pr-24 resize-none bg-neutral-100 rounded-full"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddNote(selectedPrompt);
                        }
                    }}
                    rows={1}
                />
                <div className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs ${newNote.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {newNote.length}/500
                </div>
                <Button 
                    type="submit" 
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-0 bottom-0 m-auto h-6 w-6 rounded-full bg-neutral-50 hover:bg-neutral-200"
                    disabled={!newNote.trim()}
                >
                    <Plus className="w-4 h-4" />
                    <span className="sr-only">Send note</span>
                </Button>
            </form>
        </div>
    )
}