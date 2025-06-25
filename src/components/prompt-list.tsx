import { FilePenIcon, FilterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { BaseDirectory, exists, readDir, mkdir, writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { promptsStore, Prompt } from "@/store/prompts-store";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { loadPrompts } from "@/lib/fs";
import CreatePromptDialog from "./create-prompt";

// The component every time that I reload the component duplicate the prompt item, fix this
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

export default function PromptList() {
    const { prompts, addPrompts } = promptsStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Load prompts only once when the component mount
    useEffect(() => {
        if (prompts.length === 0) { // Only load if no prompts exist
            loadPrompts().then((prompts) => {
                addPrompts(prompts);
                setLoading(false);
            });
        }
    }, []);

    return (
        <section className="flex flex-col gap-2 min-w-72 w-72 h-screen border-r border-r-neutral-200">
            <p className="mt-2 font-bold text-center">All Prompts</p>
            <div className="flex gap-2 p-2">
                <Input type="text" placeholder="Search your prompts" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="secondary"><FilterIcon /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Filter</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <CreatePromptDialog />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>New Prompt</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)]">
                {
                    loading ? (
                        <p className="text-center text-muted-foreground">Loading prompts...</p>
                    ) : (
                        <ul className="flex flex-col border-t border-t-neutral-200">
                            {
                                prompts.length > 0 ? (  
                                    prompts.filter((prompt) => prompt.name.toLowerCase().includes(search.toLowerCase())).map((prompt) => (
                                        <PromptItem key={prompt.id} id={prompt.id} name={prompt.name} updatedAt={prompt.updatedAt} tags={prompt.tags} />
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground">No prompts found</p>
                             )
                            }
                        </ul>
                    )
                }
            </ScrollArea>
        </section>
    )
}