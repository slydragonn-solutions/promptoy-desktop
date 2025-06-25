import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BookIcon, EllipsisVerticalIcon, HeartIcon, TagIcon, X } from "lucide-react";

export default function Editor() {
    const exampleTags = ["work", "personal", "fun", "health", "family"]
    const getRandomColor = (tag: string) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = (hash % 360) / 360;
        return `hsl(${hue * 360}, 70%, 80%)`;
    };

    return (
        <section className="relative flex flex-col gap-2 w-[calc(100vw-320px-288px-48px)] h-screen p-2">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-xl">Prompt Editor</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost"><BookIcon /></Button>
                    <Button variant="ghost"><TagIcon /></Button>
                    <Button variant="ghost"><HeartIcon /></Button>
                    <Button variant="ghost"><EllipsisVerticalIcon /></Button>
                </div>
            </div>
            <div className="flex gap-2 w-xl">
                {exampleTags.map((tag) => (
                    <Badge key={tag} variant="default" className="rounded-full" style={{ backgroundColor: getRandomColor(tag), color: 'black' }}>{tag}</Badge>
                ))}
            </div>
            <MonacoEditor className="mt-8" height="80vh" width="100%" defaultLanguage="markdown" defaultValue="# Hello promptoy.app"/>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-2 p-2 border-t border-t-neutral-200 text-xs text-muted-foreground bg-neutral-50">
                <p>Created at: 2025-06-23</p>
                <p>Updated at: 2025-06-23</p>
                <p>Characters: 0</p>
                <p>Tokens: 0</p>
            </div>
        </section>
    )
}