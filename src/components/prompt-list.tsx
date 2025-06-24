import { FilePenIcon, FilterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";


interface PromptItemProps {
    id: string;
    name: string;
    updatedAt: string;
    tags: string[];
}

function PromptItem({ id, name, updatedAt, tags }: PromptItemProps) {
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
            </div>
        </li>
    )
}

export default function PromptList() {

    return (
        <section className="flex flex-col gap-2 min-w-72 w-72 h-screen border-r border-r-neutral-200">
            <p className="mt-2 font-bold text-center">All Prompts</p>
            <div className="flex gap-2 p-2">
                <Input type="text" placeholder="Search your prompts" />
                <Button variant="outline"><FilterIcon /></Button>
                <Button variant="outline"><FilePenIcon /></Button>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)]">
                <ul className="flex flex-col border-t border-t-neutral-200">
                    <PromptItem id="1" name="Resume cover letter" updatedAt="2025-06-23" tags={["work", "personal"]} />
                    <PromptItem id="2" name="Job application letter" updatedAt="2025-06-23" tags={["work", "study"]} />
                    <PromptItem id="3" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="4" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="5" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="6" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="7" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="8" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="9" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                    <PromptItem id="10" name="Product description" updatedAt="2025-06-23" tags={["school", "personal", "fun", "health", "family"]} />
                </ul>
            </ScrollArea>
        </section>
    )
}