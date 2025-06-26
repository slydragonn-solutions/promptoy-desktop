import { Badge } from "@/components/ui/badge";

interface PromptItemProps {
    id: string;
    name: string;
    updatedAt: string;
    tags?: string[];
}

export default function PromptItem({ id, name, updatedAt, tags }: PromptItemProps) {
    // Generate a random color for each tag
    const getRandomColor = (tag: string) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = (hash % 360) / 360;
        return `hsl(${hue * 360}, 70%, 80%)`;
    };

    return (
        <li className="flex flex-col gap-2 p-2 border-b border-b-neutral-200 hover:bg-neutral-200 cursor-pointer">
            <div className="flex flex-col gap-2">
                <h2 className="font-bold text-sm">{name}</h2>
                <p className="text-xs text-muted-foreground">{updatedAt}</p>
                {
                    tags && (
                        <div className="flex flex-wrap gap-2 items-center ">
                            <p className="text-xs text-muted-foreground">Tags:</p>
                            {tags.map((tag) => (
                                <Badge 
                            key={tag} 
                            variant="default" 
                            className="rounded-full"
                            style={{ 
                                backgroundColor: getRandomColor(tag),
                                color: 'black'
                            }}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
            </div>
        </li>
    )
}