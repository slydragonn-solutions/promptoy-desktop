import { Badge } from "@/components/ui/badge";
import { Prompt } from "@/types/prompts";

interface PromptItemProps {
    prompt: Prompt;
    isSelected: boolean;
    onSelect: (prompt: Prompt) => void;
}

export default function PromptItem({ prompt, isSelected, onSelect }: PromptItemProps) {
    const { name, updatedAt, tags } = prompt;


    return (
        <li 
            className={`flex flex-col gap-2 p-2 border-b border-b-neutral-200 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-neutral-100'}`}
            onClick={() => onSelect(prompt)}
        >
            <div className="flex flex-col gap-2">
                <h2 className="font-bold text-sm">{name}</h2>
                <p className="text-xs text-muted-foreground">{updatedAt}</p>
                {
                    tags && (
                        <div className="flex flex-wrap gap-2 items-center ">
                            <p className="text-xs text-muted-foreground">Tags:</p>
                            {tags.map((tag) => (
                                <Badge 
                                    key={tag.id} 
                                    variant="default" 
                                    className={`rounded-full`}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
            </div>
        </li>
    )
}