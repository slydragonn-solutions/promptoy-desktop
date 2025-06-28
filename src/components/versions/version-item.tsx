import { PromptContent } from "@/types/prompts";
import { CheckIcon, Edit2, TrashIcon } from "lucide-react";

interface VersionItemProps {
    version: PromptContent;
    isActive: boolean;
    onSelect: (version: PromptContent) => void;
    onRename: (version: PromptContent) => void;
    onDelete: (version: PromptContent) => void;
}

export default function VersionItem({ version, isActive, onSelect, onRename, onDelete }: VersionItemProps) {
    const displayText = version.name || new Date(version.date).toLocaleString();

    return (
        <li 
            className={`group flex justify-between items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors ${
                isActive 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
            }`}
            onClick={() => onSelect(version)}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate max-w-[200px]">{displayText}</p>
                    <div className="flex items-center gap-1">
                        <button 
                            className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRename(version);
                            }}
                        >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button 
                            className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(version);
                            }}
                        >
                            <TrashIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {new Date(version.date).toLocaleString()}
                </p>
            </div>
            {isActive && <CheckIcon className="w-4 h-4 text-blue-400" />}
        </li>
    );
}