import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TAG_COLORS } from "@/constants/tags";
import { Check, X, Trash2 } from "lucide-react";
import { TagColorScheme } from "@/types/tags";

interface TagEditFormProps {
    editedTagName: string;
    setEditedTagName: (value: string) => void;
    saveEdit: () => void;
    cancelEdit: () => void;
    selectedColor: TagColorScheme | null;
    setSelectedColor: (color: TagColorScheme) => void;
    setDeletingTagId: (id: string) => void;
    editingTagId: string;
}

export default function TagEditForm({
    editedTagName,
    setEditedTagName,
    saveEdit,
    cancelEdit,
    selectedColor,
    setSelectedColor,
    setDeletingTagId,
    editingTagId
}: TagEditFormProps) {
    return (
        <div className="p-3 space-y-4">
            <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                value={editedTagName}
                onChange={(e) => setEditedTagName(e.target.value)}
                maxLength={25}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    else if (e.key === 'Escape') cancelEdit();
                }}
                />
                <div className="flex gap-1">
                <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={saveEdit}
                    disabled={!editedTagName.trim()}
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={cancelEdit}
                >
                    <X className="h-4 w-4" />
                </Button>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive/90"
                    onClick={(e) => {
                    e.stopPropagation();
                    setDeletingTagId(editingTagId);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-right">
                {editedTagName.length}/25 characters
            </p>
            </div>
            <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Color</label>
            <ScrollArea className="h-48">
                <div className="grid grid-cols-5 gap-2 p-1">
                {TAG_COLORS.map((color) => (
                    <button
                    key={color.name}
                    type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${color.bg} ${color.border} ${selectedColor?.name === color.name ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    >
                    {selectedColor?.name === color.name && (
                        <Check className="h-4 w-4 text-white" />
                    )}
                    </button>
                ))}
                </div>
            </ScrollArea>
            </div>
        </div>
    )
}